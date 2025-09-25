'use client'

import React, { useState, useEffect, useRef, useCallback, Suspense, MutableRefObject } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from 'react-error-boundary'
import "leaflet/dist/leaflet.css"
import type { Map as LeafletMap, DivIcon } from 'leaflet'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/th'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.locale('th')

// Dynamic imports
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false })
const ZoomControl = dynamic(() => import('react-leaflet').then(m => m.ZoomControl), { ssr: false })

// Types
interface PetImage { url: string; mainImage?: boolean }
interface Species { id: number; name: string; createdAt: string; updatedAt: string }
interface LostPet {
  id: number
  title: string
  description: string
  location: string
  lat?: number
  lng?: number
  missingLocation: string
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
  user: { id: string; firstName: string; province: string }
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
  user: { id: string; firstName: string; province: string }
}
interface ApiResponse<T> { data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } }

// จังหวัดสำคัญพร้อมพิกัด
const keyProvinces: { name: string; lat: number; lng: number }[] = [
  { name: 'กรุงเทพ', lat: 13.7563, lng: 100.5018 },
  { name: 'เชียงใหม่', lat: 18.7883, lng: 98.9853 },
  { name: 'พะเยา', lat: 19.1522, lng: 99.9266 },
  { name: 'ขอนแก่น', lat: 16.4419, lng: 102.8350 },
]

// Hooks
const useGeolocation = () => {
  const [loc, setLoc] = useState<[number, number] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation ไม่รองรับในเบราว์เซอร์นี้')
      setLoc([13.7563, 100.5018])
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLoc([coords.latitude, coords.longitude])
        setLoading(false)
      },
      (err) => {
        console.error('Geolocation error:', err)
        setError('ไม่สามารถดึงตำแหน่งได้')
        setLoc([13.7563, 100.5018])
        setLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [])

  return { loc, loading, error }
}

const useApi = () => {
  const fetchData = useCallback(async <T,>(url: string): Promise<T> => {
    console.log('Fetching URL:', url)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error ${res.status}: ${res.statusText}`)
    return res.json()
  }, [])
  return { fetchData }
}

// Custom Icon
const createCustomIcon = (imageUrl?: string, isLostPet = true): DivIcon => {
  const L = require('leaflet')
  const html = `
    <div style="
      position: relative; 
      width: 48px; 
      height: 48px; 
      border-radius: 50%; 
      border: 3px solid ${isLostPet ? 'rgb(239, 68, 68)' : '#7CBBEB'};
      background: white; 
      box-shadow: 0 8px 20px rgba(0,0,0,0.25); 
      transform: translate(-50%, -50%);
      transition: transform 0.3s ease;
      overflow: hidden;
    ">
      <img src="${imageUrl || '/images/default_pet.png'}" style="
        width: 100%; 
        height: 100%; 
        object-fit: cover; 
        border-radius: 50%; 
        display: block;
      " onerror="this.src='/images/default_pet.png'" />
      <div style="
        position: absolute; 
        bottom: -8px; 
        left: 50%; 
        transform: translateX(-50%); 
        width: 0; 
        height: 0; 
        border-left: 8px solid transparent; 
        border-right: 8px solid transparent; 
        border-top: 11px solid ${isLostPet ? 'rgb(239, 68, 68)' : '#7CBBEB'}; 
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); 
        z-index: 1;
      "></div>
    </div>`
  return L.divIcon({ html, iconSize: [50, 50], iconAnchor: [24, 48], popupAnchor: [0, -50], className: 'custom-pet-marker' })
}

// UI Components
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7CBBEB]"></div>
  </div>
)

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center h-screen">
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xl">
      <p className="text-red-500">{message}</p>
    </div>
  </div>
)

const MapErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex justify-center items-center h-screen">
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xl">
      <p className="text-red-500">เกิดข้อผิดพลาดในการโหลดแผนที่: {error.message}</p>
    </div>
  </div>
)

// FilterModal Props Interface
interface FilterModalProps {
  showLostPets: boolean
  setShowLostPets: (value: boolean) => void
  filterLocation: string
  setFilterLocation: (value: string) => void
  filterSpecies: string
  setFilterSpecies: (value: string) => void
  filterDate: string
  setFilterDate: (value: string) => void
  filterReward: [number, number]
  setFilterReward: (value: [number, number]) => void
  speciesList: Species[]
  isSpeciesLoading: boolean
  isSpeciesDropdownVisible: boolean
  setIsSpeciesDropdownVisible: (value: boolean) => void
  filterColors: string[]
  setFilterColors: React.Dispatch<React.SetStateAction<string[]>>
  isColorDropdownVisible: boolean
  setIsColorDropdownVisible: (value: boolean) => void
  loadPets: () => Promise<void>
}

const FilterModal = ({
  showLostPets,
  setShowLostPets,
  filterLocation,
  setFilterLocation,
  filterSpecies,
  setFilterSpecies,
  filterDate,
  setFilterDate,
  filterReward,
  setFilterReward,
  speciesList,
  isSpeciesLoading,
  isSpeciesDropdownVisible,
  setIsSpeciesDropdownVisible,
  filterColors,
  setFilterColors,
  isColorDropdownVisible,
  setIsColorDropdownVisible,
  loadPets,
}: FilterModalProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const colorDropdownRef = useRef<HTMLDivElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [minReward, setMinReward] = useState(filterReward[0].toString())
  const [maxReward, setMaxReward] = useState(filterReward[1].toString())
  const [rewardError, setRewardError] = useState<string | null>(null)

  const availableColors = ['แดง', 'น้ำตาล', 'เทา', 'เหลือง', 'เขียว', 'ส้ม', 'ฟ้า', 'ชมพู', 'ดำ', 'ขาว', 'ม่วง', 'ไม่มีขน']
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
    'ไม่มีขน': 'bg-transparent border border-gray-400',
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSpeciesDropdownVisible(false)
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setIsColorDropdownVisible(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsSpeciesDropdownVisible, setIsColorDropdownVisible])

  useEffect(() => {
    const min = Math.max(0, parseInt(minReward) || 0)
    const max = Math.max(min, parseInt(maxReward) || 100000)
    if (min > max) {
      setRewardError('รางวัลขั้นต่ำต้องไม่มากกว่าสูงสุด')
    } else {
      setRewardError(null)
      setFilterReward([min, max])
    }
  }, [minReward, maxReward, setFilterReward])

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed top-4 left-4 z-[1000] bg-yellow-400 border-[#edd017] hover:bg-[#e2c504] hover:border-yellow-600 text-white px-4 py-2 rounded-xl shadow-md transition-all duration-300 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="cursor-pointer font-semibold text-sm">ตัวกรอง</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto relative">
            <span className="absolute top-35 left-50 w-7 h-7 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
            <span className="absolute top-40 right-0 w-28 h-56 bg-[#7CBBEB] rounded-l-full z-0"></span>
            <span className="absolute top-[460px] right-0 w-10 h-10 bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
            <span className="absolute top-[660px] right-4 w-7 h-7 bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
            <span className="absolute top-[580px] left-0 w-10 h-10 bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
            <span className="absolute top-[300px] left-30 w-7 h-7 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
            <div className="px-6 py-4 bg-[#7CBBEB] text-white flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h2 className="text-lg font-bold">ค้นหาสัตว์เลี้ยง</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-sky-600 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 relative z-10">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowLostPets(true)
                    setFilterColors([])
                  }}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${showLostPets ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-400 hover:bg-gray-600 text-white'}`}
                >
                  สัตว์หาย
                </button>
                <button
                  onClick={() => {
                    setShowLostPets(false)
                    setFilterColors([])
                  }}
                  className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${!showLostPets ? 'bg-[#7CBBEB] text-white hover:bg-sky-600' : 'bg-gray-400 hover:bg-gray-600 text-white'}`}
                >
                  หาเจ้าของ
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    สถานที่
                  </label>
                  <input
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    placeholder="เช่น หอพัก มหาวิทยาลัย, ร้านอาหาร, สวนสาธารณะ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#7CBBEB] focus:border-[#7CBBEB] transition-colors"
                  />
                </div>

                <div className="space-y-2" ref={dropdownRef}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    ประเภทสัตว์
                  </label>
                  <div className="relative">
                    <input
                      value={filterSpecies || 'เลือกประเภท'}
                      readOnly
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsSpeciesDropdownVisible(!isSpeciesDropdownVisible)
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm cursor-pointer focus:ring-2 focus:ring-[#7CBBEB] focus:border-[#7CBBEB] transition-colors"
                    />
                    {isSpeciesDropdownVisible && (
                      <ul className="absolute mt-2 bg-white border border-gray-300 rounded-md shadow-md max-h-40 overflow-y-auto w-full z-50">
                        {isSpeciesLoading ? (
                          <li className="px-3 py-2 text-gray-500 text-sm">กำลังโหลดประเภท...</li>
                        ) : (
                          <>
                            <li
                              onClick={() => {
                                setFilterSpecies('ทั้งหมด')
                                setIsSpeciesDropdownVisible(false)
                              }}
                              className="px-3 py-2 text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                            >
                              ทั้งหมด
                            </li>
                            {speciesList.length > 0 ? (
                              speciesList.map((s: Species) => (
                                <li
                                  key={s.id}
                                  onClick={() => {
                                    setFilterSpecies(s.name)
                                    setIsSpeciesDropdownVisible(false)
                                  }}
                                  className="px-3 py-2 text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                                >
                                  {s.name}
                                </li>
                              ))
                            ) : (
                              <li className="px-3 py-2 text-gray-500 text-sm">ไม่มีประเภทสัตว์</li>
                            )}
                          </>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="space-y-2" ref={colorDropdownRef}>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    สี
                  </label>
                  <div className="relative">
                    <input
                      value={filterColors.length > 0 ? filterColors.join(', ') : 'เลือกสี'}
                      readOnly
                      onClick={() => setIsColorDropdownVisible(!isColorDropdownVisible)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm cursor-pointer focus:ring-2 focus:ring-[#7CBBEB] focus:border-[#7CBBEB] transition-colors"
                    />
                    <button
                      onClick={() => setIsColorDropdownVisible(!isColorDropdownVisible)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-500"
                      aria-label="เปิด/ปิดรายการสี"
                    >
                      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>
                    {isColorDropdownVisible && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white shadow-lg rounded-md border border-gray-200 z-50 max-h-48 overflow-y-auto">
                        <ul role="listbox">
                          {availableColors.map((color) => (
                            <li
                              key={color}
                              className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-2 ${filterColors.includes(color) ? 'bg-gray-100' : ''}`}
                              onClick={() => {
                                setFilterColors((prev: string[]) =>
                                  prev.includes(color)
                                    ? prev.filter((c: string) => c !== color)
                                    : [...prev, color]
                                )
                              }}
                              role="option"
                              aria-selected={filterColors.includes(color)}
                            >
                              <input
                                type="checkbox"
                                checked={filterColors.includes(color)}
                                readOnly
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className={`w-4 h-4 rounded-full inline-block ${colorMap[color] || 'bg-gray-300'}`} />
                              <span>{color}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    วันที่ {showLostPets ? 'หาย' : 'พบ'}
                  </label>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#7CBBEB] focus:border-[#7CBBEB] transition-colors"
                  />
                </div>

                {showLostPets && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      รางวัล (บาท)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600">ขั้นต่ำ</label>
                        <input
                          type="number"
                          value={minReward}
                          onChange={(e) => {
                            const value = e.target.value
                            if (/^\d*$/.test(value) || value === '') setMinReward(value)
                          }}
                          placeholder="0"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#7CBBEB] focus:border-[#7CBBEB] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">สูงสุด</label>
                        <input
                          type="number"
                          value={maxReward}
                          onChange={(e) => {
                            const value = e.target.value
                            if (/^\d*$/.test(value) || value === '') setMaxReward(value)
                          }}
                          placeholder="100000"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#7CBBEB] focus:border-[#7CBBEB] transition-colors"
                        />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      ช่วงรางวัล: {filterReward[0].toLocaleString()} - {filterReward[1].toLocaleString()} บาท
                    </p>
                    {rewardError && <p className="text-sm text-red-500">{rewardError}</p>}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (!rewardError) {
                      loadPets()
                      setIsModalOpen(false)
                    }
                  }}
                  className="flex-1 bg-[#EAD64D] border-[#edd017] hover:bg-[#ffef8a] hover:border-[#e0d37a] px-4 py-2 rounded-xl shadow-md text-white font-semibold transition-all duration-300 disabled:opacity-50"
                  disabled={!!rewardError}
                >
                  ค้นหา
                </button>
                <button
                  onClick={() => {
                    setFilterLocation('')
                    setFilterSpecies('')
                    setFilterDate('')
                    setFilterReward([0, 100000])
                    setMinReward('0')
                    setMaxReward('100000')
                    setFilterColors([])
                    setRewardError(null)
                    loadPets()
                    setIsModalOpen(false)
                  }}
                  className="flex-1 px-4 py-2 bg-gray-400 rounded-xl shadow-md hover:bg-gray-600 text-white font-semibold transition-all duration-300"
                >
                  ล้างตัวกรอง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Main Component
export default function PetSearchMap() {
  const [showLostPets, setShowLostPets] = useState(true)
  const [lostPets, setLostPets] = useState<LostPet[]>([])
  const [foundPets, setFoundPets] = useState<FoundPet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [speciesList, setSpeciesList] = useState<Species[]>([])
  const [isSpeciesLoading, setIsSpeciesLoading] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [filterLocation, setFilterLocation] = useState('')
  const [filterSpecies, setFilterSpecies] = useState('')
  const [filterReward, setFilterReward] = useState<[number, number]>([0, 100000])
  const [isSpeciesDropdownVisible, setIsSpeciesDropdownVisible] = useState(false)
  const [filterColors, setFilterColors] = useState<string[]>([])
  const [isColorDropdownVisible, setIsColorDropdownVisible] = useState(false)
  const { loc: userLocation, loading: geoLoading, error: geoError } = useGeolocation()
  const [center, setCenter] = useState<[number, number]>([13.7563, 100.5018])
  const mapRef = useRef<LeafletMap | null>(null)
  const { fetchData } = useApi()

  const availableColors = ['แดง', 'น้ำตาล', 'เทา', 'เหลือง', 'เขียว', 'ส้ม', 'ฟ้า', 'ชมพู', 'ดำ', 'ขาว', 'ม่วง', 'ไม่มีขน']
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
    'ไม่มีขน': 'bg-transparent border border-gray-400',
  }

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation)
      if (mapRef.current) {
        console.log('Setting map view to user location:', userLocation)
        mapRef.current.setView(userLocation, 12)
      }
    }
  }, [userLocation])

  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current
    map.whenReady(() => {
      if (userLocation) {
        console.log('Map ready, setting view to user location:', userLocation)
        map.setView(userLocation, 12)
      }
    })
  }, [mapRef, userLocation])

  useEffect(() => {
    const fetchSpecies = async () => {
      setIsSpeciesLoading(true)
      try {
        const data = await fetchData<Species[]>('/api/pets/species')
        console.log('Fetched species:', data)
        setSpeciesList(data.sort((a, b) => a.name.localeCompare(b.name)))
      } catch (err) {
        console.error('Error fetching species:', err)
      } finally {
        setIsSpeciesLoading(false)
      }
    }
    fetchSpecies()
  }, [fetchData])

  useEffect(() => {
    loadPets()
  }, [showLostPets, filterSpecies, filterLocation, filterDate, filterReward, filterColors])

  const loadPets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const status = showLostPets ? 'lost' : 'finding'
      const endpoint = showLostPets ? 'lostpet' : 'foundpet'
      const q = new URLSearchParams({ status })
      if (filterSpecies && filterSpecies !== 'ทั้งหมด') q.append('species', filterSpecies)
      if (filterLocation) q.append('location', filterLocation)
      if (filterDate) q.append(showLostPets ? 'lostDate' : 'foundDate', filterDate)
      if (showLostPets) {
        if (filterReward[0] > 0) q.append('minReward', filterReward[0].toString())
        if (filterReward[1] < 100000) q.append('maxReward', filterReward[1].toString())
      }
      if (filterColors.length > 0) q.append('color', filterColors.join(','))
      const url = `/api/${endpoint}?${q}`
      console.log('Load pets URL:', url)
      const data = await fetchData<ApiResponse<LostPet | FoundPet>>(url)
      console.log('Fetched pets:', data.data)
      if (showLostPets) {
        setLostPets((data.data as LostPet[]).map(p => ({ ...p, title: p.pet.name, images: p.pet.images })))
      } else {
        setFoundPets(data.data as FoundPet[])
      }
    } catch (e: any) {
      console.error('Error loading pets:', e)
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูลสัตว์เลี้ยง')
      if (showLostPets) {
        setLostPets([])
      } else {
        setFoundPets([])
      }
    } finally {
      setLoading(false)
    }
  }, [showLostPets, filterSpecies, filterLocation, filterDate, filterReward, filterColors, fetchData])

  const filteredPets = showLostPets ? lostPets : foundPets

  const handleGoToMyLocation = useCallback(() => {
    if (mapRef.current && userLocation) {
      console.log('Going to user location:', userLocation)
      mapRef.current.setView(userLocation, 14)
    }
  }, [userLocation])

  const handleGoToProvince = (province: { name: string; lat: number; lng: number }) => {
    if (mapRef.current) {
      console.log('Going to province:', province)
      mapRef.current.setView([province.lat, province.lng], 12)
    }
  }

  if (geoLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="relative w-screen h-screen font-sans">
      <span className="absolute top-[-36px] left-[-14px] w-56 h-40 bg-[#7CBBEB] rounded-b-full z-0"></span>
      <span className="absolute top-40 left-8 w-7 h-7 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
      <span className="absolute top-20 right-0 w-28 h-56 bg-[#7CBBEB] rounded-l-full z-0"></span>
      <span className="absolute top-[460px] right-0 w-10 h-10 bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
      <span className="absolute top-[660px] right-4 w-7 h-7 bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
      <span className="absolute top-[580px] left-0 w-10 h-10 bg-[#7CBBEB] rounded-full z-0 -translate-x-1/2"></span>
      <span className="absolute top-[328px] left-12 w-7 h-7 bg-[#EAD64D] rounded-full z-0 -translate-x-1/2"></span>
      <img
        src="/all/logo1.png"
        alt="Logo"
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] max-w-[150px] w-24 h-auto"
      />

      {geoError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-white rounded-lg p-4 shadow-xl">
          <p className="text-red-500">{geoError}</p>
          <p className="text-sm text-gray-600 mt-2">เลือกจังหวัด:</p>
          <div className="flex gap-2 mt-2">
            {keyProvinces.map(province => (
              <button
                key={province.name}
                onClick={() => handleGoToProvince(province)}
                className="bg-[#7CBBEB] text-white px-3 py-1 rounded-md text-sm hover:bg-sky-600 transition-all duration-300"
              >
                {province.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="fixed top-16 left-4 z-[1000] flex flex-col gap-2">
        {keyProvinces.map(province => (
          <button
            key={province.name}
            onClick={() => handleGoToProvince(province)}
            className="cursor-pointer bg-sky-600 border-[#5b9bd5] hover:bg-sky-900 hover:border-[#4682b4] text-white px-4 py-2 rounded-xl shadow-md transition-all duration-300 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-semibold text-sm">{province.name}</span>
          </button>
        ))}
      </div>

      <FilterModal
        showLostPets={showLostPets}
        setShowLostPets={setShowLostPets}
        filterLocation={filterLocation}
        setFilterLocation={setFilterLocation}
        filterSpecies={filterSpecies}
        setFilterSpecies={setFilterSpecies}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        filterReward={filterReward}
        setFilterReward={setFilterReward}
        speciesList={speciesList}
        isSpeciesLoading={isSpeciesLoading}
        isSpeciesDropdownVisible={isSpeciesDropdownVisible}
        setIsSpeciesDropdownVisible={setIsSpeciesDropdownVisible}
        filterColors={filterColors}
        setFilterColors={setFilterColors}
        isColorDropdownVisible={isColorDropdownVisible}
        setIsColorDropdownVisible={setIsColorDropdownVisible}
        loadPets={loadPets}
      />

      <button
        onClick={handleGoToMyLocation}
        disabled={!userLocation}
        className="fixed top-4 right-4 z-[1000] bg-yellow-400 border-[#edd017] hover:bg-yellow-600 hover:border-[#e0d37a] text-white px-4 py-2 rounded-xl shadow-md transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-semibold text-sm cursor-pointer">ตำแหน่งฉัน</span>
      </button>

      <Link
        href="/announcement"
        className="fixed top-16 right-4 z-[1000] bg-sky-600 border-[#5b9bd5] hover:bg-sky-900 hover:border-[#4682b4] text-white px-4 py-2 rounded-xl shadow-md transition-all duration-300 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="font-semibold text-sm">ลงประกาศ</span>
      </Link>
      <Link
        href="/home"
        className="fixed bottom-6 right-4 z-[1000] bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-md transition-all duration-300 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7m-1 2v9a2 2 0 01-2 2H7a2 2 0 01-2-2v-9m5 4h4" />
        </svg>
        <span className="font-semibold text-sm">กลับหน้าแรก</span>
      </Link>

      {loading && (
        <div className="fixed inset-0 z-[999] bg-black/20 flex justify-center items-center">
          <div className="bg-white rounded-lg p-4 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7CBBEB] mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">กำลังค้นหา...</p>
          </div>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      <Suspense fallback={<div className="flex items-center justify-center h-full">กำลังโหลดแผนที่...</div>}>
        <ErrorBoundary FallbackComponent={MapErrorFallback}>
          <MapContainer
            center={center}
            zoom={16}
            className="h-screen w-screen rounded-xl border-2 border-gray-300 bg-white/80"
            ref={mapRef as MutableRefObject<LeafletMap>}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap & CARTO" />
            <ZoomControl position="bottomleft" />
            {filteredPets.map(p => p.lat && p.lng && (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={createCustomIcon(showLostPets ? (p as LostPet).pet.images[0]?.url : (p as FoundPet).images[0]?.url, showLostPets)}>
                <Popup>
                  <div className="relative bg-white rounded-xl shadow-xl w-[300px] max-h-[400px] overflow-y-auto border border-gray-200">
                    <span className="absolute top-2 left-2 w-4 h-4 bg-[#EAD64D] rounded-full z-0"></span>
                    <span className="absolute bottom-20 right-2 w-4 h-4 bg-[#7CBBEB] rounded-full z-0"></span>
                    <div className="px-4 py-2 bg-[#7CBBEB] text-white rounded-t-xl relative z-10">
                      <h3 className="text-sm font-bold">{showLostPets ? (p as LostPet).title : (p as FoundPet).species.name}</h3>
                    </div>
                    <div className="p-4 space-y-2 relative z-10">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <img
                            src={showLostPets ? (p as LostPet).pet.images[0]?.url : (p as FoundPet).images[0]?.url || '/images/default_pet.png'}
                            alt={showLostPets ? (p as LostPet).title : (p as FoundPet).species.name}
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#7CBBEB]"
                            onError={(e) => (e.currentTarget.src = '/images/default_pet.png')}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                            <svg className="w-4 h-4 text-[#eb7cc1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            สถานที่: <span className="font-normal">{(p as any).missingLocation || p.location}</span>
                          </p>
                          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                            <svg className="w-4 h-4 text-[#7CBBEB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {showLostPets ? 'หาย' : 'พบ'}: <span className="font-normal">
                              {showLostPets
                                ? new Date((p as LostPet).lostDate).toLocaleDateString('th-TH', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })
                                : new Date((p as FoundPet).foundDate).toLocaleDateString('th-TH', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                            </span>
                          </p>
                          {showLostPets && (p as LostPet).reward !== undefined && (
                            <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                              <svg className="w-4 h-4 text-[#deec18]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                              รางวัล: <span className="font-normal">{(p as LostPet).reward?.toLocaleString()} บาท</span>
                            </p>
                          )}
                          {!showLostPets && (p as FoundPet).distinctive && (
                            <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                              <svg className="w-4 h-4 text-[#7CBBEB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              ลักษณะเด่น: <span className="font-normal line-clamp-2">{(p as FoundPet).distinctive}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <Link
                        href={showLostPets ? `/lostpet/${p.id}` : `/foundpet/${p.id}`}
                        target="_blank"
                        className="block text-center bg-[#EAD64D] border-[#edd017] hover:bg-[#ffef8a] hover:border-[#e0d37a] !text-white font-semibold text-sm px-3 py-1.5 rounded-md transition-all duration-300"
                      >
                        รายละเอียด
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </ErrorBoundary>
      </Suspense>

      <style jsx global>{`
        .custom-pet-marker {
          background: transparent !important;
          border: none !important;
        }
        
        .custom-pet-marker:hover div {
          transform: translate(-50%, -55%) scale(1.1);
        }
        
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        
        .leaflet-popup-close-button {
          top: 20px !important;
          right: 30px !important;
          background: #EAD64D !important;
          color: white !important;
          border-radius: 50% !important;
          width: 24px !important;
          height: 24px !important;
          line-height: 24px !important;
          text-align: center !important;
          font-size: 16px !important;
          font-weight: bold !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
          transition: background 0.2s ease !important;
        }
        
        .leaflet-popup-close-button:hover {
          background: #ffef8a !important;
        }
        
        .leaflet-popup-close-button {
          z-index: 1000 !important;
        }
        
        .leaflet-popup-tip {
          background: red !important;
        }
        
        .leaflet-container {
          background: white !important;
          border-radius: 12px;
        }
        
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          border-radius: 8px !important;
          background: white !important;
        }
        
        .leaflet-control-zoom a {
          color: #1f2937 !important;
          font-size: 16px !important;
          line-height: 28px !important;
          transition: all 0.2s ease !important;
        }
        
        .leaflet-control-zoom a:hover {
          background: #f1f5f9 !important;
        }
        
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
        a:focus-visible,
        [role="option"]:focus-visible {
          outline: 2px solid #7CBBEB;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}