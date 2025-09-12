"use client";
import React, { useState } from "react";
import useSWR from "swr";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  year: string;
  lostPets: number;
  ownerSearch: number;
};

type ApiResponse = ChartData[];

type SpeciesItem = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce(
      (sum: number, p: any) => sum + (p.value || 0),
      0
    );
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow">
        <p className="font-bold">{label}</p>
        {payload.map((p: any, index: number) => (
          <p key={index} style={{ color: p.fill }}>
            {`${p.name}: ${p.value || 0}`}
          </p>
        ))}
        <p className="font-bold mt-1">รวม: {total}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [selectedType, setSelectedType] = useState<
    "ทั้งหมด" | "สัตว์เลี้ยงหาย" | "หาเจ้าของ"
  >("ทั้งหมด");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all"); // เก็บ speciesId
  const [selectedRange, setSelectedRange] = useState<
    "1 สัปดาห์" | "1 เดือน" | "6 เดือน" | "1 ปี"
  >("1 ปี");
  const [openDropdown, setOpenDropdown] = useState<null | string>(null);

  // Fetch species
  const {
    data: speciesData,
    error: speciesError,
    isLoading: speciesLoading,
  } = useSWR<SpeciesItem[]>("/api/pets/species", fetcher);

  // Map state to API params
  const typeParam =
    selectedType === "ทั้งหมด"
      ? "all"
      : selectedType === "สัตว์เลี้ยงหาย"
      ? "lost"
      : "found";
  const rangeParam =
    selectedRange === "1 สัปดาห์"
      ? "1w"
      : selectedRange === "1 เดือน"
      ? "1m"
      : selectedRange === "6 เดือน"
      ? "6m"
      : "1y";
  const categoryParam = selectedCategoryId; // ส่ง speciesId ตรงๆ

  const {
    data: chartData = [],
    error,
    isLoading,
  } = useSWR<ApiResponse>(
    `/api/dashboard/?type=${typeParam}&category=${categoryParam}&range=${rangeParam}`,
    fetcher
  );

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleSelect = (name: string, value: string) => {
    if (name === "type") setSelectedType(value as any);
    if (name === "category") setSelectedCategoryId(value); // เก็บเป็น id
    if (name === "range") setSelectedRange(value as any);
    setOpenDropdown(null);
  };

  const renderDropdown = (
    label: string,
    selected: string,
    options: { label: string; value: string }[],
    name: string
  ) => (
    <div className="relative">
      <p className="sm:text-md lg:text-lg text-sm font-bold mb-1">{label}</p>
      <div className="relative sm:w-36 lg:w-60 w-24 mb-10">
        <input
          value={options.find((opt) => opt.value === selected)?.label || ""}
          onClick={() => toggleDropdown(name)}
          readOnly
          className="w-full text-xs sm:text-sm p-2 border border-gray-300 rounded-md bg-white cursor-pointer"
        />
        <svg
          className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" />
        </svg>
        {openDropdown === name && (
          <ul className="absolute w-full mt-1 bg-white shadow-md rounded-md z-20 border border-gray-200 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <li
                key={option.value}
                className="px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(name, option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  if (speciesError)
    return (
      <div>เกิดข้อผิดพลาดในการโหลดประเภทสัตว์เลี้ยง: {speciesError.message}</div>
    );
  if (speciesLoading) return <div>กำลังโหลดประเภทสัตว์เลี้ยง...</div>;
  if (error) return <div>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}</div>;
  if (isLoading) return <div>กำลังโหลดข้อมูลชาร์ต...</div>;
  if (chartData.length === 0)
    return <div className="text-center py-8">ไม่มีข้อมูลสำหรับตัวกรองที่เลือก</div>;

  // เตรียม options สำหรับ dropdown
  const categoryOptions = [
    { label: "ทั้งหมด", value: "all" },
    ...(speciesData?.map((s) => ({ label: s.name, value: s.id.toString() })) ||
      []),
  ];

  return (
    <div className="w-full p-4 rounded-xl shadow relative">
      {/* Dropdown Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {renderDropdown(
          "ประเภท",
          selectedType,
          [
            { label: "ทั้งหมด", value: "ทั้งหมด" },
            { label: "สัตว์เลี้ยงหาย", value: "สัตว์เลี้ยงหาย" },
            { label: "หาเจ้าของ", value: "หาเจ้าของ" },
          ],
          "type"
        )}
        {renderDropdown("ประเภทสัตว์เลี้ยง", selectedCategoryId, categoryOptions, "category")}
        {renderDropdown(
          "ระยะเวลา",
          selectedRange,
          [
            { label: "1 สัปดาห์", value: "1 สัปดาห์" },
            { label: "1 เดือน", value: "1 เดือน" },
            { label: "6 เดือน", value: "6 เดือน" },
            { label: "1 ปี", value: "1 ปี" },
          ],
          "range"
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-blue-600">รวมสัตว์เลี้ยงหาย</h3>
          <p className="text-2xl font-semibold">
            {chartData.reduce((sum, d) => sum + d.lostPets, 0)}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-bold text-yellow-600">รวมหาเจ้าของ</h3>
          <p className="text-2xl font-semibold">
            {chartData.reduce((sum, d) => sum + d.ownerSearch, 0)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-bold text-green-600">รวมทั้งหมด</h3>
          <p className="text-2xl font-semibold">
            {chartData.reduce(
              (sum, d) => sum + d.lostPets + d.ownerSearch,
              0
            )}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 60 }}
          barCategoryGap={
            chartData.length > 12 ? 8 : chartData.length > 6 ? 15 : 30
          }
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            angle={-45}
            textAnchor="end"
            height={70}
            interval={0}
          />
          <YAxis
            label={{
              value: "จำนวนคนเข้าชม",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {(selectedType === "ทั้งหมด" || selectedType === "สัตว์เลี้ยงหาย") && (
            <Bar
              dataKey="lostPets"
              name="สัตว์เลี้ยงหาย"
              fill="#7CBBEB"
              barSize={chartData.length > 12 ? 20 : 40}
            />
          )}
          {(selectedType === "ทั้งหมด" || selectedType === "หาเจ้าของ") && (
            <Bar
              dataKey="ownerSearch"
              name="หาเจ้าของ"
              fill="#FBBF24"
              barSize={chartData.length > 12 ? 20 : 40}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard;
