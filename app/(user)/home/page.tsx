'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Types
interface PetImage {
  url: string
  mainImage?: boolean
}

interface LostPet {
  id: number
  title: string
  description: string
  location: string
  lat?: number
  lng?: number
  lostDate: string
  reward?: number
  userId: string
  createdAt: string
  images: PetImage[]
  pet: {
    id: number
    name: string
    species: { name: string }
    breed: string
    gender: string
    age: number
    color: string[]
    description: string
    markings: string
    images: PetImage[]
  }
  user: {
    id: string
    firstName: string
    province: string
  }
}

interface FoundPet {
  id: number
  description: string
  location: string
  lat?: number
  lng?: number
  foundDate: string
  breed?: string
  gender?: string
  color?: string[]
  age?: number
  distinctive?: string
  status: string
  userId: string
  createdAt: string
  updatedAt: string
  images: PetImage[]
  species: { id: number; name: string }
  user: {
    id: string
    firstName: string
    province: string
  }
}

interface ApiResponse {
  data: (LostPet | FoundPet)[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface Species {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

// Custom hook for API calls
const useApi = () => {
  const fetchData = useCallback(async <T,>(url: string): Promise<T> => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  }, [])

  return { fetchData }
}

// Loading and Error components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="text-center py-8">
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
      <p className="text-red-600">{message}</p>
    </div>
  </div>
)

// PetCard Component
const PetCard = React.memo(({ pet, isLostPet }: { pet: LostPet | FoundPet; isLostPet: boolean }) => {
  const title = isLostPet ? (pet as LostPet).title : (pet as FoundPet).species.name
  const images = isLostPet ? (pet as LostPet).pet.images : (pet as FoundPet).images
  const dateLabel = isLostPet ? 'วันที่หาย' : 'วันที่พบ'
  const dateValue = isLostPet ? (pet as LostPet).lostDate : (pet as FoundPet).foundDate
  const species = isLostPet ? (pet as LostPet).pet.species.name : (pet as FoundPet).species.name
  const reward = isLostPet ? (pet as LostPet).reward : undefined
  const colors = isLostPet ? (pet as LostPet).pet.color : (pet as FoundPet).color

  const mainImage = images.find((img) => img.mainImage)?.url || images[0]?.url

  return (
    <Link href={`/${isLostPet ? 'lostpet' : 'foundpet'}/${pet.id}`} className="block">
      <article className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 cursor-pointer">
        <div className="relative overflow-hidden rounded-t-2xl">
          <Image
            src={mainImage || '/images/default_pet.png'}
            alt={title}
            width={300}
            height={200}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
          />
          <div className={`absolute top-3 right-3 ${isLostPet ? 'bg-red-500' : 'bg-blue-500'} text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg`}>
            {isLostPet ? 'หาย' : 'หาเจ้าของ'}
          </div>
        </div>
        <div className="p-6">
          <h3 className={`text-xl font-bold text-gray-800 mb-2 group-hover:text-${isLostPet ? 'red' : 'blue'}-600 transition-colors line-clamp-2`}>
            {title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{pet.description}</p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-700">
              <svg className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="truncate">{pet.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <svg className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>{dateLabel}: {new Date(dateValue).toLocaleDateString('th-TH')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <svg className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span>ประเภท: {species}</span>
            </div>
            {colors && colors.length > 0 && (
              <div className="flex items-center text-sm text-gray-700">
                <svg className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm4 6a2 2 0 100-4 2 2 0 000 4zm4 0a2 2 0 100-4 2 2 0 000 4zm4 0a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>สี: {colors.join(', ')}</span>
              </div>
            )}
          </div>
          {reward && (
            <div className="bg-[#7CBBEB] text-white px-4 py-2 rounded-lg text-center font-semibold shadow-md">
              รางวัล: {reward.toLocaleString()} บาท
            </div>
          )}
        </div>
      </article>
    </Link>
  )
})

PetCard.displayName = 'PetCard'

// Main Component
export default function PetSearchHome() {
  // State management
  const [displayMode, setDisplayMode] = useState<'info' | 'map'>('info')
  const [filterDate, setFilterDate] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [minReward, setMinReward] = useState<string>('')
  const [maxReward, setMaxReward] = useState<string>('')
  const [shouldFetch, setShouldFetch] = useState(true)
  const [isDropdownVisible, setIsDropdownVisible] = useState<false | 'species' | 'color'>(false)
  const [showLostPets, setShowLostPets] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [lostPets, setLostPets] = useState<LostPet[]>([])
  const [foundPets, setFoundPets] = useState<FoundPet[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalPets, setTotalPets] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [speciesList, setSpeciesList] = useState<Species[]>([])

  // Static list of available colors
  const availableColors = ['แดง', 'น้ำตาล', 'เทา', 'เหลือง', 'เขียว', 'ส้ม', 'ฟ้า', 'ชมพู', 'ดำ', 'ขาว',"ม่วง","ไม่มีขน"]
  const colorMap: Record<string, string> = {
  'แดง': 'bg-red-500',
  'น้ำตาล': 'bg-yellow-900',
  'เทา': 'bg-gray-500',
  'เหลือง': 'bg-yellow-400',
  'เขียว': 'bg-green-500',
  'ส้ม': 'bg-orange-500',
  'ฟ้า': 'bg-sky-400',
  'ชมพู': 'bg-pink-400',
  'ดำ': 'bg-black',
  'ขาว': 'bg-white border border-gray-300',
  'ม่วง': 'bg-purple-500',
  'ไม่มีขน': 'bg-transparent border border-gray-400'
}
  // Refs
  const friendSectionRef = useRef<HTMLDivElement>(null)

  // Custom hooks
  const { fetchData } = useApi()

  // Constants
  const petsPerPage = 10

  // Fetch species data
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const data = await fetchData<Species[]>('/api/pets/species')
        setSpeciesList(data)
      } catch (err) {
        setError('ไม่สามารถดึงข้อมูลประเภทสัตว์ได้')
        console.error('Failed to fetch species:', err)
      }
    }

    fetchSpecies()
  }, [fetchData])

  // Fetch pets
  useEffect(() => {
    if (!shouldFetch) return

    const fetchPets = async (endpoint: string, setPets: (pets: any[]) => void, status: string) => {
      setLoading(true)
      setError(null)
      setPets([])
      setTotalPages(1)
      setTotalPets(0)

      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          limit: petsPerPage.toString(),
          status,
          ...(selectedType && selectedType !== 'ทั้งหมด' ? { species: selectedType } : {}),
          ...(filterLocation ? { location: filterLocation } : {}),
          ...(filterDate ? { [status === 'lost' ? 'lostDate' : 'foundDate']: filterDate } : {}),
          ...(minReward ? { minReward: minReward } : {}),
          ...(maxReward ? { maxReward: maxReward } : {}),
          ...(selectedColors.length > 0 ? { color: selectedColors.join(',') } : {}), // Changed from 'colors' to 'color'
        })

        console.log('Fetching URL:', `/api/${endpoint}?${queryParams}`) // Debug URL

        const data = await fetchData<ApiResponse>(`/api/${endpoint}?${queryParams}`)
        
        if (status === 'lost') {
          setPets(data.data.map((pet: any) => ({ 
            ...pet, 
            title: pet.pet.name, 
            userId: pet.user.id, 
            images: pet.pet.images 
          })))
        } else {
          setPets(data.data)
        }
        
        setTotalPages(data.pagination.totalPages)
        setTotalPets(data.pagination.total)
      } catch (err) {
        setError(`ไม่สามารถดึงข้อมูล${status === 'lost' ? 'สัตว์เลี้ยงหาย' : 'สัตว์เลี้ยงที่พบ'}ได้ กรุณาลองเปลี่ยนตัวกรองสีหรือเงื่อนไขอื่น`)
        console.error(`Failed to fetch ${status} pets:`, err)
      } finally {
        setLoading(false)
        setShouldFetch(false)
      }
    }

    if (showLostPets) {
      fetchPets('lostpet', setLostPets, 'lost')
    } else {
      fetchPets('foundpet', setFoundPets, 'finding')
    }
  }, [shouldFetch, currentPage, selectedType, filterLocation, filterDate, minReward, maxReward, selectedColors, showLostPets, fetchData])

  // Event handlers
  const handleSelectType = useCallback((type: string) => {
    setSelectedType(type)
    setIsDropdownVisible(false)
  }, [])

  const handleScrollToFriends = useCallback(() => {
    friendSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      setShouldFetch(true)
    }
  }, [totalPages])

  const handleMinRewardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)))) {
      setMinReward(value)
    }
  }

  const handleMaxRewardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || (Number(value) >= 0 && !isNaN(Number(value)))) {
      setMaxReward(value)
    }
  }

  const handleSearch = () => {
    if (minReward && maxReward && Number(minReward) > Number(maxReward)) {
      setError('รางวัลขั้นต่ำต้องไม่มากกว่าสูงสุด')
      return
    }
    setCurrentPage(1)
    setShouldFetch(true)
  }

  const handleShowLostPetsChange = () => {
    setShowLostPets((prev) => !prev)
    setCurrentPage(1)
    setSelectedColors([])
    setShouldFetch(true)
  }

  const currentPets = showLostPets ? lostPets : foundPets

  return (
    <div className="w-full font-sans">
      {/* Header Section */}
      <header className="bg-[#E5EEFF] pt-10 px-6 sm:px-14 md:px-20 xl:px-40 2xl:px-32">
        <div className="flex justify-between max-w-screen-2xl mx-auto">
          <div className="max-w-2xl 2xl:pt-40 lg:pt-28 md:pt-20 sm:pt-16 pt-2">
            <h1 className="2xl:text-6xl xl:text-4xl lg:text-3xl md:text-2xl sm:text-xl text-lg font-bold sm:pb-4 xl:pb-6 pb-2">
              ประกาศตามหาสัตว์เลี้ยง
            </h1>
            <p className="2xl:text-2xl xl:text-xl lg:text-lg md:text-md sm:text-sm text-xs pb-2">
              เมื่อสัตว์เลี้ยงหายไป ทุกวินาทีล้วนมีค่า
            </p>
            <p className="2xl:text-2xl xl:text-xl lg:text-lg md:text-md sm:text-sm text-xs pb-2">
              แพลตฟอร์มของเราช่วยให้สัตว์เลี้ยงที่หายได้กลับคืนสู่อ้อมกอดของครอบครัวที่รัก
            </p>
            <div className="flex gap-4 sm:mt-4 lg:mt-6 mt-2">
              <button 
                onClick={handleScrollToFriends}
                className="rounded-full shadow-md bg-[#010200] text-white 2xl:text-2xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-[10px] sm:py-2 sm:px-6 lg:px-8 xl:px-10 py-1 px-4 hover:bg-gray-500 transition duration-300"
              >
                ดูประกาศ
              </button>
              <Link href="/announcement">
                <button className="rounded-full shadow-md bg-[#EAD64D] text-black 2xl:text-2xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-[10px] sm:py-2 sm:px-8 lg:px-10 xl:px-12 py-1 px-6 hover:bg-yellow-200 transition duration-300">
                  ประกาศ
                </button>
              </Link>
            </div>
          </div>
          <div className="2xl:w-96 lg:w-72 md:w-60 sm:w-56 w-40">
            <Image
              src="/all/h.png"
              alt="dog"
              width={400}
              height={400}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </header>

      {/* Pet Type Selection */}
      <section className="flex justify-center">
        <div className="grid grid-cols-2 lg:gap-60 sm:gap-36 gap-20 place-items-center lg:py-10 py-5">
          <button 
            className="flex flex-col items-center cursor-pointer group "
            onClick={handleShowLostPetsChange}
            aria-label="แสดงสัตว์เลี้ยงหาย"
          >
            <div className="bg-[#E5EEFF] border-black border-1 hover:bg-[#b7ccf5] p-3 rounded-2xl 2xl:w-28 xl:w-24 lg:w-20 md:w-16 sm:w-14 w-12 transition-colors">
              <Image
                src="/all/lostpets.png"
                alt="lost pets"
                width={112}
                height={112}
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="mt-2 text-[10px] 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-center font-medium group-hover:text-blue-600 transition-colors">
              สัตว์เลี้ยงหาย
            </p>
          </button>
          
          <button 
            className="flex flex-col items-center cursor-pointer group"
            onClick={handleShowLostPetsChange}
            aria-label="แสดงหาเจ้าของ"
          >
            <div className="bg-[#E5EEFF] border-black border-1 hover:bg-[#b7ccf5] p-3 rounded-2xl 2xl:w-28 xl:w-24 lg:w-20 md:w-16 sm:w-14 w-12 transition-colors">
              <Image
                src="/all/owner.png"
                alt="find owner"
                width={112}
                height={112}
                className="w-full h-auto object-cover"
              />
            </div>
            <p className="mt-2 text-[10px] 2xl:text-xl xl:text-lg lg:text-md md:text-sm sm:text-xs text-center font-medium group-hover:text-blue-600 transition-colors">
              หาเจ้าของ
            </p>
          </button>
        </div>
      </section>




<section className="flex justify-center w-full mb-8">
  <div className="bg-white shadow-md rounded-lg p-6 max-w-6xl w-full mx-4 sm:mx-8">
    <div className="flex flex-col gap-6">
      {/* Filter Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {/* Date Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            {showLostPets ? 'วันที่หาย' : 'วันที่พบ'}
          </label>
          <input 
            type="date" 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full text-sm p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
            aria-label={showLostPets ? 'วันที่หาย' : 'วันที่พบ'}
          />
        </div>

        {/* Location Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            สถานที่{showLostPets ? 'หาย' : 'พบ'}
          </label>
          <input 
            type="text" 
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="w-full text-sm p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
            placeholder="ค้นหาตามสถานที่..."
            aria-label={`สถานที่${showLostPets ? 'หาย' : 'พบ'}`}
          />
        </div>

        {/* Species Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            ประเภท
          </label>
          <div className="relative w-full">
            <input 
              value={selectedType}
              onClick={() => setIsDropdownVisible(isDropdownVisible === 'species' ? false : 'species')}
              readOnly
              className="w-full text-sm p-2.5 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500 cursor-pointer transition-colors bg-white"
              placeholder="เลือกประเภทสัตว์"
              aria-label="ประเภทสัตว์"
            />
            <button
              onClick={() => setIsDropdownVisible(isDropdownVisible === 'species' ? false : 'species')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500"
              aria-label="เปิด/ปิดรายการประเภทสัตว์"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            {isDropdownVisible === 'species' && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white shadow-lg rounded-md border border-gray-200 z-20 max-h-48 overflow-y-auto">
                <ul role="listbox">
                  <li 
                    className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-200"
                    onClick={() => handleSelectType('ทั้งหมด')}
                    role="option"
                    aria-selected={selectedType === 'ทั้งหมด'}
                  >
                    ทั้งหมด
                  </li>
                  {speciesList.map((species) => (
                    <li 
                      key={species.id}
                      className="px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-200 last:border-b-0"
                      onClick={() => handleSelectType(species.name)}
                      role="option"
                      aria-selected={selectedType === species.name}
                    >
                      {species.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Color Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2">
            สี
          </label>
          <div className="relative w-full">
            <input 
              value={selectedColors.length > 0 ? selectedColors.join(', ') : ''}
              readOnly
              onClick={() => setIsDropdownVisible(isDropdownVisible === 'color' ? false : 'color')}
              className="w-full text-sm p-2.5 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500 cursor-pointer transition-colors bg-white"
              placeholder="เลือกสี"
              aria-label="สีสัตว์"
            />
            <button
              onClick={() => setIsDropdownVisible(isDropdownVisible === 'color' ? false : 'color')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500"
              aria-label="เปิด/ปิดรายการสี"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" />
              </svg>
            </button>
            {isDropdownVisible === 'color' && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white shadow-lg rounded-md border border-gray-200 z-20 max-h-48 overflow-y-auto">
                <ul role="listbox">
                  {availableColors.map((color) => (
                    <li
                      key={color}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 transition-colors border-b border-gray-200 last:border-b-0 flex items-center gap-2 ${selectedColors.includes(color) ? 'bg-blue-50' : ''}`}
                      onClick={() => {
                        setSelectedColors((prev) =>
                          prev.includes(color)
                            ? prev.filter((c) => c !== color)
                            : [...prev, color]
                        )
                      }}
                      role="option"
                      aria-selected={selectedColors.includes(color)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedColors.includes(color)}
                        readOnly
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span
                        className={`w-4 h-4 rounded-full inline-block ${colorMap[color] || 'bg-gray-300'}`}
                      />
                      <span>{color}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Reward Filter (Min and Max) or Placeholder */}
        {showLostPets ? (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              รางวัล (บาท)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={minReward}
                onChange={handleMinRewardChange}
                placeholder="ขั้นต่ำ"
                min="0"
                className="w-full text-sm p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                aria-label="รางวัลขั้นต่ำ"
              />
              <input
                type="number"
                value={maxReward}
                onChange={handleMaxRewardChange}
                placeholder="สูงสุด"
                min="0"
                className="w-full text-sm p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-colors"
                aria-label="รางวัลสูงสุด"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col invisible">
            {/* Placeholder to maintain grid structure */}
            <label className="text-sm font-medium text-gray-700 mb-2">
              Placeholder
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                className="w-full text-sm p-2.5 border border-gray-300 rounded-md"
                disabled
              />
              <input
                type="text"
                className="w-full text-sm p-2.5 border border-gray-300 rounded-md"
                disabled
              />
            </div>
          </div>
        )}
      </div>

      {/* Search and Clear Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <button
          onClick={handleSearch}
          className="w-full sm:w-32 bg-[#EAD64D] text-black text-sm py-2.5 px-4 rounded-md hover:bg-yellow-200 transition duration-300 shadow-md"
          aria-label="ค้นหา"
        >
          ค้นหา
        </button>
        <button
          onClick={() => {
            setFilterDate('')
            setFilterLocation('')
            setSelectedType('')
            setSelectedColors([])
            setMinReward('')
            setMaxReward('')
            setCurrentPage(1)
            setShouldFetch(true)
          }}
          className="w-full sm:w-32 bg-gray-200 text-black text-sm py-2.5 px-4 rounded-md hover:bg-gray-300 transition duration-300 shadow-md"
          aria-label="ล้างตัวกรอง"
        >
          ล้างตัวกรอง
        </button>
      </div>

      {/* Display Mode Toggle */}
      <div className="mt-6 flex justify-center">
        <div className="flex gap-4">
          <button
            onClick={() => setDisplayMode('info')}
            className={`flex flex-col justify-center items-center border-2 border-gray-400 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-100 transition-all ${
              displayMode === 'info' ? 'bg-gray-200' : 'bg-white'
            }`}
            aria-label="แสดงข้อมูลแบบรายการ"
          >
            <Image
              src="/home/livestock.png"
              alt="info view"
              width={24}
              height={24}
              className="w-6 h-6 object-contain mb-1"
            />
            <span className="text-sm font-medium">ข้อมูล</span>
          </button>
          <a
            href="/map"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col justify-center items-center border-2 border-gray-400 rounded-lg px-4 py-2 cursor-pointer hover:bg-gray-100 transition-all ${
              displayMode === 'map' ? 'bg-gray-200' : 'bg-white'
            }`}
            aria-label="เปิดแผนที่ในแท็บใหม่"
          >
            <Image
              src="/home/map1.png"
              alt="map view"
              width={24}
              height={24}
              className="w-6 h-6 object-contain mb-1"
            />
            <span className="text-sm font-medium">แผนที่</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>



      {/* Current Section Title */}
      <div className="flex justify-center mb-3 lg:mb-5" ref={friendSectionRef}>
        <h2 className="rounded-full shadow-md bg-[#EAD64D] text-black 2xl:text-2xl xl:text-xl lg:text-lg md:text-md sm:text-sm text-xs sm:py-2.5 sm:px-8 lg:px-10 xl:px-12 py-1.5 px-6 font-semibold">
          {showLostPets ? 'สัตว์เลี้ยงหาย' : 'หาเจ้าของ'}
        </h2>
      </div>

      {/* Loading and Error States */}
      {loading && <LoadingSpinner />}
      {error && !loading && <ErrorMessage message={error} />}

      {/* Pet Count */}
      {!loading && !error && currentPets.length > 0 && (
        <div className="ml-16 2xl:text-xl lg:text-lg sm:text-md text-sm mb-4">
          <p>ทั้งหมด: {totalPets} ตัว</p>
        </div>
      )}

      {/* Content Display */}
      {displayMode === 'info' && !loading && (
        <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 lg:gap-8 2xl:gap-10 p-6 lg:p-10">
          {currentPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} isLostPet={showLostPets} />
          ))}
          {currentPets.length === 0 && !error && (
            <div className="col-span-full text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.563M15 6.5a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูล</h3>
                <p className="text-gray-600">ไม่พบ{showLostPets ? 'สัตว์เลี้ยงหาย' : 'สัตว์เลี้ยงที่พบ'}ตามเงื่อนไขที่ค้นหา กรุณาลองเปลี่ยนตัวกรองสีหรือเงื่อนไขอื่น</p>
              </div>
            </div>
          )}
        </main>
      )}

      {displayMode === 'map' && !loading && (
        <main className="w-full flex justify-center mt-8">
          <div className="flex flex-col items-center mb-10 mt-5 max-w-7xl px-4">
            <h2 className="sm:text-xl xl:text-lg mb-4 font-semibold text-gray-800">
              ดูสถานที่{showLostPets ? 'หาย' : 'พบ'}ในแผนที่
            </h2>
            <a
              href="/map"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#EAD64D] text-black text-sm sm:text-base py-3 px-6 rounded-lg hover:bg-yellow-200 transition duration-300 shadow-md flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              เปิดแผนที่ในแท็บใหม่
            </a>
          </div>
        </main>
      )}

      {/* Enhanced Pagination */}
      {displayMode === 'info' && !loading && totalPages > 1 && currentPets.length > 0 && (
        <nav className="flex justify-center items-center space-x-2 sm:space-x-5 sm:p-7 lg:p-10 py-5" aria-label="Pagination Navigation">
          <button 
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center bg-[#D9D9D9] hover:bg-[#C0C0C0] rounded-lg px-2 py-1 sm:px-3 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
            aria-label="หน้าแรก"
          >
            หน้าแรก
          </button>
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center justify-center bg-[#D9D9D9] hover:bg-[#C0C0C0] rounded-full sm:p-2.5 p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="หน้าก่อนหน้า"
          >
            <Image
              src="/home/arrow.svg"
              alt="arrow-left"
              width={24}
              height={24}
              className="w-2 sm:w-3 md:w-4 lg:w-5 xl:w-6 object-contain"
            />
          </button>
          <div className="flex items-center space-x-1">
            {currentPage > 2 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  className="bg-white hover:bg-gray-100 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm border transition-colors"
                >
                  1
                </button>
                {currentPage > 3 && <span className="text-gray-500">...</span>}
              </>
            )}
            {currentPage > 1 && (
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                className="bg-white hover:bg-gray-100 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm border transition-colors"
              >
                {currentPage - 1}
              </button>
            )}
            <span className="bg-[#EAD64D] rounded-lg px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold border-2 border-yellow-400">
              {currentPage}
            </span>
            {currentPage < totalPages && (
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="bg-white hover:bg-gray-100 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm border transition-colors"
              >
                {currentPage + 1}
              </button>
            )}
            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && <span className="text-gray-500">...</span>}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  className="bg-white hover:bg-gray-100 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm border transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="flex items-center justify-center bg-[#D9D9D9] hover:bg-[#C0C0C0] rounded-full sm:p-2.5 p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="หน้าถัดไป"
          >
            <Image
              src="/home/arrowl.svg"
              alt="arrow-right"
              width={24}
              height={24}
              className="w-2 sm:w-3 md:w-4 lg:w-5 xl:w-6 object-contain"
            />
          </button>
          <button 
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center bg-[#D9D9D9] hover:bg-[#C0C0C0] rounded-lg px-2 py-1 sm:px-3 sm:py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
            aria-label="หน้าสุดท้าย"
          >
            หน้าสุดท้าย
          </button>
        </nav>
      )}

      {/* Page Info */}
      {displayMode === 'info' && !loading && totalPages > 1 && currentPets.length > 0 && (
        <div className="flex justify-center mb-8">
          <div className="text-sm text-gray-600 bg-gray-100 rounded-lg px-4 py-2">
            หน้า {currentPage} จาก {totalPages} | แสดง {currentPets.length} จาก {totalPets} รายการ
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        button:focus-visible,
        input:focus-visible,
        [role="option"]:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}