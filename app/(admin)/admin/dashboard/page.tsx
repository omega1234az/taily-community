"use client";
import React, { useState } from "react";
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

type RawDataItem = {
  date: string;
  year: string;
  type: "lostPets" | "ownerSearch";
  petType: string;
  views: number;
};

const rawData: RawDataItem[] = [
  {
    date: "2025-01-10",
    year: "2025",
    type: "lostPets",
    petType: "สุนัข",
    views: 50,
  },
  {
    date: "2025-01-12",
    year: "2025",
    type: "ownerSearch",
    petType: "แมว",
    views: 30,
  },
  {
    date: "2025-02-05",
    year: "2025",
    type: "lostPets",
    petType: "นก",
    views: 20,
  },
  {
    date: "2025-02-15",
    year: "2025",
    type: "ownerSearch",
    petType: "สุนัข",
    views: 40,
  },
  {
    date: "2025-03-01",
    year: "2025",
    type: "lostPets",
    petType: "แมว",
    views: 60,
  },
  {
    date: "2025-03-10",
    year: "2025",
    type: "ownerSearch",
    petType: "สุนัข",
    views: 45,
  },
  {
    date: "2025-12-25",
    year: "2025",
    type: "lostPets",
    petType: "ชูก้าไรเดอร์",
    views: 25,
  },
  {
    date: "2025-12-20",
    year: "2025",
    type: "ownerSearch",
    petType: "กระต่าย",
    views: 35,
  },
  {
    date: "2025-01-20",
    year: "2025",
    type: "lostPets",
    petType: "แมว",
    views: 70,
  },
  {
    date: "2025-01-25",
    year: "2025",
    type: "ownerSearch",
    petType: "แมว",
    views: 55,
  },
];

type YearData = {
  year: string;
  lostPets: number;
  ownerSearch: number;
};

const getChartData = (
  rawData: RawDataItem[],
  selectedType: "ทั้งหมด" | "สัตว์เลี้ยงหาย" | "หาเจ้าของ",
  selectedCategory: string,
  selectedRange: "1 สัปดาห์" | "1 เดือน" | "6 เดือน" | "1 ปี"
): YearData[] => {
  const now = new Date(); // ✅ ใช้วันที่ปัจจุบัน
  const startDate = new Date(now);

  switch (selectedRange) {
    case "1 สัปดาห์":
      startDate.setDate(now.getDate() - 7);
      break;
    case "1 เดือน":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "6 เดือน":
      startDate.setMonth(now.getMonth() - 6);
      break;
    case "1 ปี":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const result: Record<string, YearData> = {};

  for (const d of rawData) {
    const date = new Date(d.date);
    if (date < startDate) continue;

    if (
      (selectedType !== "ทั้งหมด" &&
        ((selectedType === "สัตว์เลี้ยงหาย" && d.type !== "lostPets") ||
          (selectedType === "หาเจ้าของ" && d.type !== "ownerSearch"))) ||
      (selectedCategory !== "ทั้งหมด" && d.petType !== selectedCategory)
    ) {
      continue;
    }

    if (!result[d.year]) {
      result[d.year] = { year: d.year, lostPets: 0, ownerSearch: 0 };
    }

    result[d.year][d.type === "lostPets" ? "lostPets" : "ownerSearch"] +=
      d.views;
  }

  return Object.values(result).sort((a, b) => Number(a.year) - Number(b.year));
};

const Dashboard = () => {
  const [selectedType, setSelectedType] = useState<
    "ทั้งหมด" | "สัตว์เลี้ยงหาย" | "หาเจ้าของ"
  >("ทั้งหมด");
  const [selectedCategory, setSelectedCategory] = useState<string>("ทั้งหมด");
  const [selectedRange, setSelectedRange] = useState<
    "1 สัปดาห์" | "1 เดือน" | "6 เดือน" | "1 ปี"
  >("1 ปี");
  const [openDropdown, setOpenDropdown] = useState<null | string>(null);

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleSelect = (name: string, value: string) => {
    if (name === "type") setSelectedType(value as any);
    if (name === "category") setSelectedCategory(value);
    if (name === "range") setSelectedRange(value as any);
    setOpenDropdown(null);
  };

  const chartData = getChartData(
    rawData,
    selectedType,
    selectedCategory,
    selectedRange
  );

  const renderDropdown = (
    label: string,
    selected: string,
    options: string[],
    name: string
  ) => (
    <div className="relative">
      <p className="sm:text-md lg:text-lg text-sm font-bold mb-1">{label}</p>
      <div className="relative sm:w-36 lg:w-60 w-24 mb-10">
        <input
          value={selected}
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
                key={option}
                className="px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(name, option)}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full p-4 rounded-xl shadow relative">
      {/* Dropdown Filters */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {renderDropdown(
          "ประเภท",
          selectedType,
          ["ทั้งหมด", "สัตว์เลี้ยงหาย", "หาเจ้าของ"],
          "type"
        )}
        {renderDropdown(
          "ประเภทสัตว์เลี้ยง",
          selectedCategory,
          [
            "ทั้งหมด",
            "แมว",
            "สุนัข",
            "นก",
            "หนู",
            "ชูก้าไรเดอร์",
            "เฟอร์ริต",
            "เม่นแคระ",
            "กระรอก",
            "กระต่าย",
            "งู",
            "อื่นๆ",
          ],
          "category"
        )}
        {renderDropdown(
          "ระยะเวลา",
          selectedRange,
          ["1 สัปดาห์", "1 เดือน", "6 เดือน", "1 ปี"],
          "range"
        )}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
          barCategoryGap={chartData.length <= 2 ? 80 : 20}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis
            label={{
              value: "จำนวนคนเข้าชม",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />
          {(selectedType === "ทั้งหมด" ||
            selectedType === "สัตว์เลี้ยงหาย") && (
            <Bar
              dataKey="lostPets"
              name="สัตว์เลี้ยงหาย"
              fill="#7CBBEB"
              barSize={40}
            />
          )}
          {(selectedType === "ทั้งหมด" || selectedType === "หาเจ้าของ") && (
            <Bar
              dataKey="ownerSearch"
              name="หาเจ้าของ"
              fill="#FBBF24"
              barSize={40}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard;
