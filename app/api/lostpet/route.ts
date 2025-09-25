
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { options } from '../auth/[...nextauth]/option'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options)
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 })
    }

    // หา userId จาก email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })
    if (!user) {
      return NextResponse.json({ message: "ไม่พบผู้ใช้งานในระบบ" }, { status: 404 })
    }

    const body = await req.json()
    const {
      description,
      lat,
      lng,
      lostDate,
      reward,
      status,
      petId,
      ownerName,
      missingLocation,
      phone,
      facebook,
    } = body

    // Validate input data
    if (!description || !lostDate || !petId) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 })
    }

    if (lat && (lat < -90 || lat > 90)) {
      return NextResponse.json({ message: "ค่าละติจูดไม่ถูกต้อง" }, { status: 400 })
    }
    if (lng && (lng < -180 || lng > 180)) {
      return NextResponse.json({ message: "ค่าลองจิจูดไม่ถูกต้อง" }, { status: 400 })
    }

    if (phone && !/^[0-9]{9,10}$/.test(phone.replace(/[-\s]/g, ""))) {
      return NextResponse.json({ message: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง" }, { status: 400 })
    }

    // เช็คว่า petId นี้เป็นของ user นี้หรือไม่
    const pet = await prisma.pet.findUnique({ where: { id: petId } })
    if (!pet) {
      return NextResponse.json({ message: "ไม่พบสัตว์เลี้ยงนี้" }, { status: 404 })
    }
    if (pet.userId !== user.id) {
      return NextResponse.json({ message: "สัตว์เลี้ยงนี้ไม่ใช่ของคุณ" }, { status: 403 })
    }

    // เช็คว่ามีประกาศที่ยังใช้งานอยู่หรือไม่
    const existsActive = await prisma.lostPet.findFirst({
      where: { 
        petId: petId, 
        OR: [
          { status: "lost" },
          { status: "pending" },
        ]
      },
    })
    if (existsActive) {
      return NextResponse.json({ 
        message: `สัตว์เลี้ยงตัวนี้มีประกาศที่ยังใช้งานอยู่` 
      }, { status: 400 })
    }

    // เรียก Longdo API แปลง lat/lng -> location
    let location = missingLocation || "ไม่ระบุ"
    if (lat && lng) {
      try {
        const res = await fetch(
          `https://api.longdo.com/map/services/address?lon=${lng}&lat=${lat}&key=50965cbe89a74a5d1e45c7add11d5b39`
        )
        const data = await res.json()
        if (data && data.subdistrict) {
          location = `${data.subdistrict} ${data.district} ${data.province}`.trim()
        } else if (!missingLocation) {
          location = "ไม่พบที่อยู่"
        }
      } catch (err) {
        console.error("Longdo API Error:", err)
        if (!missingLocation) {
          location = "ไม่พบที่อยู่"
        }
      }
    }

    // สร้าง LostPet
    const lostPet = await prisma.lostPet.create({
      data: {
        description,
        location,
        missingLocation,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        lostDate: new Date(lostDate),
        reward: reward ? parseFloat(reward) : null,
        status: status || "lost",
        userId: user.id,
        petId: petId,
        ownerName,
        phone,
        facebook,
      },
    })

    const safeResponse = {
      id: lostPet.id,
      description: lostPet.description,
      location: lostPet.location,
      lostDate: lostPet.lostDate,
      reward: lostPet.reward,
      status: lostPet.status,
      petId: lostPet.petId,
      createdAt: lostPet.createdAt,
    }

    return NextResponse.json(safeResponse, { status: 201 })
  } catch (error) {
    console.error("Error creating lost pet:", error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการประกาศสัตว์หาย" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1', 10) || 1
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10
    const species = searchParams.get('species') || undefined
    const location = searchParams.get('location') || undefined
    const lostDate = searchParams.get('lostDate') || undefined
    const minReward = parseFloat(searchParams.get('minReward') || '0') || 0
    const maxReward = parseFloat(searchParams.get('maxReward') || '100000') || 100000
    const status = searchParams.get('status') || 'lost'
    const color = searchParams.get('color') || undefined
    const colors = color ? color.split(',').map(c => c.trim()) : undefined

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json({ message: "ค่า pagination ไม่ถูกต้อง" }, { status: 400 })
    }

    // Validate reward
    if (minReward < 0 || maxReward < minReward) {
      return NextResponse.json({ message: "ช่วงรางวัลไม่ถูกต้อง" }, { status: 400 })
    }

    const skip = (page - 1) * limit

    // Build where clause
    const whereClause: any = {
      status,
    }

    // Add conditions for filters
    if (species || location || lostDate || minReward > 0 || maxReward < 100000 || colors) {
      whereClause.AND = []

      if (species && species !== 'ทั้งหมด') {
        whereClause.AND.push({
          pet: {
            species: {
              name: species,
            },
          },
        })
      }

      if (location) {
        whereClause.AND.push({
          OR: [
            { location: { contains: location, mode: 'insensitive' } },
            { missingLocation: { contains: location, mode: 'insensitive' } },
          ],
        })
      }

      if (lostDate) {
        const date = new Date(lostDate)
        if (!isNaN(date.getTime())) {
          whereClause.AND.push({
            lostDate: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lte: new Date(date.setHours(23, 59, 59, 999)),
            },
          })
        }
      }

      if (minReward > 0 || maxReward < 100000) {
        whereClause.AND.push({
          reward: {
            gte: minReward,
            lte: maxReward,
          },
        })
      }

      // Add multiple color filter for JSON array
      if (colors && colors.length > 0) {
        whereClause.AND.push({
          pet: {
            OR: colors.map(c => ({
              color: {
                path: [],
                array_contains: c,
                mode: 'insensitive', // Case-insensitive matching
              },
            })),
          },
        })
      }
    }

    console.log('Query parameters:', { species, location, lostDate, minReward, maxReward, status, colors }) // Debug query
    console.log('Where clause:', JSON.stringify(whereClause, null, 2)) // Debug whereClause

    const [lostPets, total] = await Promise.all([
      prisma.lostPet.findMany({
        where: whereClause,
        include: {
          pet: {
            select: {
              id: true,
              name: true,
              species: { select: { name: true } },
              breed: true,
              gender: true,
              age: true,
              color: true,
              description: true,
              markings: true,
              images: { 
                select: { 
                  url: true,
                  mainImage: true
                } 
              },
            },
          },
          user: {
            select: {
              id: true,
              firstName: true,
              province: true,
            },
          },
          images: {
            select: { url: true },
          },
          clues: {
            select: {
              id: true,
              content: true,
              location: true,
              createdAt: true,
              user: {
                select: {
                  firstName: true,
                },
              },
              images: {
                select: { url: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lostPet.count({ where: whereClause }),
    ])

    // Transform data to match frontend
    const safeLostPets = lostPets.map(lostPet => ({
      id: lostPet.id,
      title: lostPet.pet.name,
      description: lostPet.description,
      location: lostPet.location,
      missingLocation: lostPet.missingLocation,
      lat: lostPet.lat,
      lng: lostPet.lng,
      lostDate: lostPet.lostDate.toISOString(),
      reward: lostPet.reward,
      status: lostPet.status,
      userId: lostPet.userId,
      createdAt: lostPet.createdAt.toISOString(),
      images: lostPet.pet.images,
      pet: {
        id: lostPet.pet.id,
        name: lostPet.pet.name,
        species: lostPet.pet.species,
        breed: lostPet.pet.breed,
        gender: lostPet.pet.gender,
        age: lostPet.pet.age,
        color: lostPet.pet.color,
        description: lostPet.pet.description,
        markings: lostPet.pet.markings,
        images: lostPet.pet.images,
      },
      user: {
        id: lostPet.user.id,
        firstName: lostPet.user.firstName,
        province: lostPet.user.province,
      },
      clues: lostPet.clues,
    }))

    // Handle empty results
    if (safeLostPets.length === 0) {
      return NextResponse.json({
        message: 'ไม่พบสัตว์เลี้ยงที่ตรงกับเงื่อนไข',
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      })
    }

    console.log('Returning lost pets:', safeLostPets.length) // Debug response

    return NextResponse.json({
      data: safeLostPets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching lost pets:", error)
    return NextResponse.json({ 
      message: 'ไม่สามารถดึงข้อมูลได้',
      error: process.env.NODE_ENV === 'development' ? error : undefined 
    }, { status: 500 })
  }
}
