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
  newUsers: number;
  cluesReported: number;
  lostPetViews: number;  // ยอดวิว LostPet (แบบเก่า)
  ownerSearchViews: number; // ยอดวิว FoundPet (แบบเก่า)
};

type ApiResponse = ChartData[];

type SpeciesItem = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const CustomTooltip = ({ active, payload, label, metric }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce(
      (sum: number, p: any) => sum + (p.value || 0),
      0
    );
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-md">
        <p className="font-bold text-gray-800">{label}</p>
        {payload.map((p: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: p.fill }}>
            {`${p.name}: ${p.value || 0} ${metric === 'views' ? 'ครั้ง' : 'โพสต์'}`}
          </p>
        ))}
        <p className="font-bold mt-2 text-gray-800">รวม: {total} {metric === 'views' ? 'ครั้ง' : 'โพสต์'}</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [selectedType, setSelectedType] = useState<
    "ทั้งหมด" | "สัตว์เลี้ยงหาย" | "หาเจ้าของ"
  >("ทั้งหมด");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedRange, setSelectedRange] = useState<
    "1 สัปดาห์" | "1 เดือน" | "6 เดือน" | "1 ปี"
  >("1 ปี");
  const [selectedMetric, setSelectedMetric] = useState<"posts" | "views">("posts");
  const [openDropdown, setOpenDropdown] = useState<null | string>(null);

  const {
    data: speciesData,
    error: speciesError,
    isLoading: speciesLoading,
  } = useSWR<SpeciesItem[]>("/api/pets/species", fetcher);

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
  const categoryParam = selectedCategoryId;

  const {
    data: chartData = [],
    error,
    isLoading,
  } = useSWR<ApiResponse>(
    `/api/dashboard?type=${typeParam}&category=${categoryParam}&range=${rangeParam}&metric=${selectedMetric}`,
    fetcher
  );

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleSelect = (name: string, value: string) => {
    if (name === "type") setSelectedType(value as any);
    if (name === "category") setSelectedCategoryId(value);
    if (name === "range") setSelectedRange(value as any);
    if (name === "metric") setSelectedMetric(value as any);
    setOpenDropdown(null);
  };

  const renderDropdown = (
    label: string,
    selected: string,
    options: { label: string; value: string }[],
    name: string
  ) => (
    <div className="relative">
      <p className="text-sm font-semibold text-gray-700 mb-1">{label}</p>
      <div className="relative w-full mb-4">
        <input
          value={options.find((opt) => opt.value === selected)?.label || ""}
          onClick={() => toggleDropdown(name)}
          readOnly
          className="w-full text-sm p-3 border border-gray-300 rounded-lg bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" />
        </svg>
        {openDropdown === name && (
          <ul className="absolute w-full mt-2 bg-white shadow-lg rounded-lg z-20 border border-gray-200 max-h-48 overflow-y-auto">
            {options.map((option) => (
              <li
                key={option.value}
                className="px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer transition-colors"
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
      <div className="text-red-500 text-center py-8">เกิดข้อผิดพลาดในการโหลดประเภทสัตว์เลี้ยง: {speciesError.message}</div>
    );
  if (speciesLoading) return <div className="text-center py-8">กำลังโหลดประเภทสัตว์เลี้ยง...</div>;
  if (error) return <div className="text-red-500 text-center py-8">เกิดข้อผิดพลาดในการโหลดข้อมูล: {error.message}</div>;
  if (isLoading) return <div className="text-center py-8">กำลังโหลดข้อมูลชาร์ต...</div>;
  if (chartData.length === 0)
    return <div className="text-center py-8 text-gray-600">ไม่มีข้อมูลสำหรับตัวกรองที่เลือก</div>;

  const categoryOptions = [
    { label: "ทั้งหมด", value: "all" },
    ...(speciesData?.map((s) => ({ label: s.name, value: s.id.toString() })) ||
      []),
  ];

  const metricOptions = [
    { label: "จำนวนโพสต์", value: "posts" },
    { label: "ยอดวิว", value: "views" },
  ];

  // เลือก dataKey และชื่อตาม metric
  const getDataKeyAndName = (type: "lost" | "found") => {
    if (selectedMetric === "posts") {
      return type === "lost" 
        ? { key: "lostPets", name: "สัตว์เลี้ยงหาย" }
        : { key: "ownerSearch", name: "หาเจ้าของ" };
    } else {
      return type === "lost" 
        ? { key: "lostPetViews", name: "สัตว์เลี้ยงหาย (วิว)" }
        : { key: "ownerSearchViews", name: "หาเจ้าของ (วิว)" };
    }
  };

  const lostData = getDataKeyAndName("lost");
  const foundData = getDataKeyAndName("found");

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">แดชบอร์ดสถิติระบบ</h1>
      
      {/* Filters Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">ตัวกรองข้อมูล</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {renderDropdown(
            "ประเภทประกาศ",
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
            "ช่วงเวลา",
            selectedRange,
            [
              { label: "1 สัปดาห์", value: "1 สัปดาห์" },
              { label: "1 เดือน", value: "1 เดือน" },
              { label: "6 เดือน", value: "6 เดือน" },
              { label: "1 ปี", value: "1 ปี" },
            ],
            "range"
          )}
          {renderDropdown(
            "ประเภทข้อมูล",
            selectedMetric,
            metricOptions,
            "metric"
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">สรุปสถิติรวม</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl shadow-md flex items-start gap-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-600 text-lg">
                {selectedMetric === "posts" ? "จำนวนสัตว์เลี้ยงหาย" : "ยอดวิวสัตว์เลี้ยงหาย"}
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {chartData.reduce((sum, d) => sum + (d[lostData.key as keyof ChartData] as number), 0)}
              </p>
            </div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl shadow-md flex items-start gap-4">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-600 text-lg">
                {selectedMetric === "posts" ? "จำนวนหาเจ้าของ" : "ยอดวิวหาเจ้าของ"}
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {chartData.reduce((sum, d) => sum + (d[foundData.key as keyof ChartData] as number), 0)}
              </p>
            </div>
          </div>
          <div className="bg-green-50 p-6 rounded-xl shadow-md flex items-start gap-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0-12l-1 3m-3-3h6l-1 3M7 10l-1 3m-3-3h6l-1 3m9-9v12" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-600 text-lg">จำนวนผู้ใช้ใหม่</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {chartData.reduce((sum, d) => sum + d.newUsers, 0)}
              </p>
            </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl shadow-md flex items-start gap-4">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <h3 className="font-semibold text-purple-600 text-lg">จำนวนเบาะแสที่แจ้ง</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {chartData.reduce((sum, d) => sum + d.cluesReported, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">กราฟสถิติรายปี</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
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
              className="text-sm text-gray-600"
            />
            <YAxis
              label={{
                value: selectedMetric === "posts" ? "จำนวนโพสต์ / รายการ" : "ยอดวิว (ครั้ง)",
                angle: -90,
                position: "insideLeft",
                className: "text-sm text-gray-600",
              }}
              className="text-sm text-gray-600"
            />
            <Tooltip content={<CustomTooltip metric={selectedMetric} />} />
            <Legend wrapperStyle={{ paddingTop: 20 }} />
            {(selectedType === "ทั้งหมด" || selectedType === "สัตว์เลี้ยงหาย") && (
              <Bar
                dataKey={lostData.key as keyof ChartData}
                name={lostData.name}
                fill="#7CBBEB"
                barSize={chartData.length > 12 ? 20 : 40}
                radius={[4, 4, 0, 0]}
              />
            )}
            {(selectedType === "ทั้งหมด" || selectedType === "หาเจ้าของ") && (
              <Bar
                dataKey={foundData.key as keyof ChartData}
                name={foundData.name}
                fill="#FBBF24"
                barSize={chartData.length > 12 ? 20 : 40}
                radius={[4, 4, 0, 0]}
              />
            )}
            <Bar
              dataKey="newUsers"
              name="ผู้ใช้ใหม่"
              fill="#34D399"
              barSize={chartData.length > 12 ? 20 : 40}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="cluesReported"
              name="เบาะแสที่แจ้ง"
              fill="#C084FC"
              barSize={chartData.length > 12 ? 20 : 40}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;