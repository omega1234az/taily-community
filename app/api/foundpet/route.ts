import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { options } from '../auth/[...nextauth]/option';
import { PrismaClient } from '@prisma/client'
import { put } from '@vercel/blob';
import sharp from 'sharp';

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(options);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
    }

    // ดึงข้อมูลจาก multipart/form-data
    const formData = await req.formData();
    const description = formData.get('description')?.toString();
    const location = formData.get('location')?.toString();
    const lat = formData.get('lat') ? parseFloat(formData.get('lat') as string) : undefined;
    const lng = formData.get('lng') ? parseFloat(formData.get('lng') as string) : undefined;
    const speciesId = formData.get('speciesId') ? parseInt(formData.get('speciesId') as string) : undefined;
    const breed = formData.get('breed')?.toString();
    const gender = formData.get('gender')?.toString();
    const colorRaw = formData.get('color');
    const age = formData.get('age') ? parseInt(formData.get('age') as string) : undefined;
    const distinctive = formData.get('distinctive')?.toString();
    const status = formData.get('status')?.toString();
    const phone = formData.get('phone')?.toString(); // Add phone field
    const facebook = formData.get('facebook')?.toString(); // Add facebook field
    const images = formData.getAll('images') as File[];

    // Validate input data
    if (!description || !speciesId) {
      return NextResponse.json({ message: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    if (lat && (lat < -90 || lat > 90)) {
      return NextResponse.json({ message: "ค่าละติจูดไม่ถูกต้อง" }, { status: 400 });
    }
    if (lng && (lng < -180 || lng > 180)) {
      return NextResponse.json({ message: "ค่าลองจิจูดไม่ถูกต้อง" }, { status: 400 });
    }

    if (age && (age < 0 || age > 30)) {
      return NextResponse.json({ message: "อายุต้องอยู่ระหว่าง 0-30 ปี" }, { status: 400 });
    }

    // Validate phone (optional, if provided)
    if (phone && !/^\+?\d{8,15}$/.test(phone)) {
      return NextResponse.json({ message: "หมายเลขโทรศัพท์ไม่ถูกต้อง" }, { status: 400 });
    }

    // Validate facebook (optional, if provided)
    

    // ตรวจสอบ color (ต้องเป็น array หรือ undefined)
    let color;
    if (colorRaw) {
      try {
        color = JSON.parse(colorRaw.toString());
        if (!Array.isArray(color) || !color.every(item => typeof item === 'string')) {
          throw new Error('Invalid array format');
        }
      } catch (error) {
        return NextResponse.json(
          { message: 'สีต้องอยู่ในรูปแบบ JSON array ของสตริง เช่น ["brown", "white"]' },
          { status: 400 }
        );
      }
    }

    // เช็คว่า speciesId มีอยู่จริงหรือไม่
    const species = await prisma.petSpecies.findUnique({ 
      where: { id: speciesId } 
    });
    if (!species) {
      return NextResponse.json({ message: "ไม่พบชนิดสัตว์ที่ระบุ" }, { status: 404 });
    }

    // ตรวจสอบและอัปโหลดรูปภาพ
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const imageUrls: string[] = [];
    if (images.length > 4) {
      return NextResponse.json(
        { message: 'สามารถอัปโหลดรูปได้ไม่เกิน 4 รูป' },
        { status: 400 }
      );
    }

    for (const image of images) {
      if (image && image.size > 0) {
        if (!allowedImageTypes.includes(image.type)) {
          return NextResponse.json(
            { message: 'รองรับเฉพาะไฟล์ JPEG, PNG และ WebP เท่านั้น' },
            { status: 400 }
          );
        }

        if (image.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { message: 'ขนาดรูปภาพต้องไม่เกิน 5MB' },
            { status: 400 }
          );
        }

        try {
          const imgBuffer = Buffer.from(await image.arrayBuffer());
          const compressedImgBuffer = await sharp(imgBuffer)
            .resize(1000, 1000, {
              fit: 'inside',
              withoutEnlargement: true,
            })
            .jpeg({
              quality: 90,
              progressive: true,
            })
            .toBuffer();

          const compressedBlob = new Blob([new Uint8Array(compressedImgBuffer)], { type: 'image/jpeg' });
          const fileName = `foundpet-${session.user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
          const { url } = await put(`found-pets/${session.user.id}/${fileName}`, compressedBlob, {
            access: 'public',
          });

          imageUrls.push(url);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ' },
            { status: 500 }
          );
        }
      }
    }

    // เรียก Longdo API แปลง lat/lng -> location (ถ้าไม่มี location มาด้วย)
    let finalLocation = location || "ไม่ระบุ";

    if (lat && lng && !location) {
      try {
        const res = await fetch(
          `https://api.longdo.com/map/services/address?lon=${lng}&lat=${lat}&key=50965cbe89a74a5d1e45c7add11d5b39`
        );
        const data = await res.json();
        if (data && data.subdistrict) {
          finalLocation = `${data.subdistrict} ${data.district} ${data.province}`.trim();
        } else {
          finalLocation = "ไม่พบที่อยู่";
        }
      } catch (err) {
        console.error("Longdo API Error:", err);
        finalLocation = "ไม่พบที่อยู่";
      }
    }

    // สร้าง FoundPet
    const foundPet = await prisma.foundPet.create({
      data: {
        description,
        location: finalLocation,
        lat: lat ? lat : null,
        lng: lng ? lng : null,
        foundDate: new Date(),
        speciesId: speciesId,
        breed: breed || null,
        gender: gender || null,
        color: color || undefined,
        age: age || null,
        distinctive: distinctive || null,
        status: status || "finding",
        phone: phone || null, // Add phone field
        facebook: facebook || null, // Add facebook field
        userId: session.user.id,
        images: {
          create: imageUrls.map((url) => ({
            url,
          })),
        },
      },
      include: {
        species: {
          select: { 
            id: true, 
            name: true 
          },
        },
        images: {
          select: { url: true },
        },
      },
    });

    const safeResponse = {
      id: foundPet.id,
      description: foundPet.description,
      location: foundPet.location,
      lat: foundPet.lat,
      lng: foundPet.lng,
      foundDate: foundPet.foundDate,
      breed: foundPet.breed,
      gender: foundPet.gender,
      color: foundPet.color,
      age: foundPet.age,
      distinctive: foundPet.distinctive,
      status: foundPet.status,
      phone: foundPet.phone, // Add phone field
      facebook: foundPet.facebook, // Add facebook field
      species: foundPet.species,
      images: foundPet.images,
      createdAt: foundPet.createdAt,
    };

    return NextResponse.json(safeResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating found pet:", error);
    return NextResponse.json({ message: "เกิดข้อผิดพลาดในการประกาศสัตว์เจอ" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10) || 1;
    const limit = parseInt(searchParams.get('limit') || '10', 10) || 10;
    const species = searchParams.get('species') || undefined;
    const province = searchParams.get('province') || undefined;
    const status = searchParams.get('status') || 'finding';

    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json({ message: "ค่า pagination ไม่ถูกต้อง" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: status,
    };

    if (species && province) {
      whereClause.AND = [
        {
          species: {
            name: species,
          },
        },
        {
          user: {
            province,
          },
        },
      ];
    } else if (species) {
      whereClause.species = {
        name: species,
      };
    } else if (province) {
      whereClause.user = {
        province,
      };
    }

    const [foundPets, total] = await Promise.all([
      prisma.foundPet.findMany({
        where: whereClause,
        include: {
          species: {
            select: { 
              id: true, 
              name: true 
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
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.foundPet.count({ where: whereClause }),
    ]);

    const safeFoundPets = foundPets.map(foundPet => ({
      id: foundPet.id,
      description: foundPet.description,
      location: foundPet.location,
      lat: foundPet.lat,
      lng: foundPet.lng,
      foundDate: foundPet.foundDate,
      breed: foundPet.breed,
      gender: foundPet.gender,
      color: foundPet.color,
      age: foundPet.age,
      distinctive: foundPet.distinctive,
      status: foundPet.status,
      phone: foundPet.phone, // Add phone field
      facebook: foundPet.facebook, // Add facebook field
      species: foundPet.species,
      user: foundPet.user,
      images: foundPet.images,
      createdAt: foundPet.createdAt,
      updatedAt: foundPet.updatedAt,
    }));

    return NextResponse.json({
      data: safeFoundPets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching found pets:", error);
    return NextResponse.json({ 
      message: 'ไม่สามารถดึงข้อมูลได้',
      error: process.env.NODE_ENV === 'development' ? error : undefined 
    }, { status: 500 });
  }
}