"use client";
import React, { useState } from "react";

type Report = {
  name: string;
  email: string;
  report: string;
};

const initialReportData: Report[] = [
  {
    name: "สมชาย ใจดี",
    email: "somchai@example.com",
    report: "รายงานการใช้งานไม่เหมาะสม",
  },
  {
    name: "มานี สุขใจ",
    email: "manee@example.com",
    report: "รายงานเนื้อหาสแปม",
  },
  {
    name: "เจนจิรา พิพัฒน์",
    email: "jane@example.com",
    report: "รายงานพฤติกรรมก้าวร้าว",
  },
  {
    name: "วีระชัย สายสมร",
    email: "weerachai@example.com",
    report: "รายงานภาพไม่เหมาะสม",
  },
  {
    name: "สมหญิง บัวบาน",
    email: "somying@example.com",
    report: "แจ้งพฤติกรรมผู้ใช้ไม่เหมาะสมในคอมเมนต์",
  },
  {
    name: "เจนจิรา พิพัฒน์",
    email: "jane@example.com",
    report: "แจ้งว่าพบเจ้าของแล้วแต่ยังไม่ลบโพสต์",
  },
  {
    name: "ประยุทธ จริงใจ",
    email: "prayut@example.com",
    report: "รายงานแสดงความคิดเห็นหยาบคาย",
  },
  {
    name: "วีระชัย สายสมร",
    email: "weerachai@example.com",
    report: "รายงานภาพสัตว์ไม่เหมาะสม",
  },
  {
    name: "อนงค์ แสนดี",
    email: "anang@example.com",
    report: "รายงานพฤติกรรมรุนแรง",
  },
  {
    name: "วีณา คำโต",
    email: "weena@example.com",
    report: "รายงานการโพสต์ซ้ำซาก",
  },
  {
    name: "บุญช่วย สุขสม",
    email: "boon@example.com",
    report: "รายงานใช้ถ้อยคำไม่เหมาะสม",
  },
  {
    name: "นวลจันทร์ งามดี",
    email: "nuan@example.com",
    report: "รายงานคุกคามผู้อื่น",
  },
];
export default function Report() {
  const [users, setUsers] = useState<Report[]>(initialReportData);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleHide = (index: number) => {
    const newUsers = [...users];
    newUsers.splice(indexOfFirstUser + index, 1);
    setUsers(newUsers);
  };

  const handleDelete = (index: number) => {
    const newUsers = [...users];
    newUsers.splice(indexOfFirstUser + index, 1);
    setUsers(newUsers);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 font-semibold bg-[#AFDAFB] sm:p-5 p-3 xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[10px]">
        <div>ชื่อ</div>
        <div>อีเมล</div>
        <div className="lg:pl-3 sm:pl-7 pl-6">การรายงาน</div>
      </div>

      {currentUsers.map((user, index) => (
        <div
          key={index}
          className={`grid grid-cols-4 items-center xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px] p-3 ${
            index % 2 === 0 ? "bg-white" : "bg-[#d3edfe]"
          }`}
        >
          <div>{user.name}</div>
          <div>{user.email}</div>
          <div className="lg:pl-3 sm:pl-7 pl-7">{user.report}</div>
          <div className="text-right space-x-2">
            <button
              onClick={() => handleHide(index)}
              className="bg-[#EAD64D] hover:bg-yellow-300 text-black sm:px-5 sm:py-1.5 px-3 py-1 rounded cursor-pointer"
            >
              ซ่อน
            </button>
            <button
              onClick={() => handleDelete(index)}
              className="bg-[#EA3434] hover:bg-red-700 text-black sm:px-5 sm:py-1.5 px-3 py-1 rounded cursor-pointer"
            >
              ลบ
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-center items-center space-x-5 lg:pt-14 sm:pt-10 pt-8">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-[#D9D9D9] rounded sm:p-3 p-2 disabled:opacity-50 cursor-pointer"
        >
          <img src="/home/arrow.svg" alt="arrow" className="w-3 sm:w-5" />
        </button>

        <span className="bg-[#D9D9D9] rounded lg:px-5 sm:py-2 sm:px-4.5 px-3 py-1.5 lg:text-lg sm:text-[16px] text-[10px]">
          {currentPage}
        </span>
        <span className="lg:text-lg sm:text-[16px] text-[12px]">ถึง</span>
        <span className="bg-[#D9D9D9] rounded lg:px-5 sm:py-2 sm:px-4.5 px-3 py-1.5 lg:text-lg sm:text-[16px] text-[10px]">
          {totalPages}
        </span>

        <button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="bg-[#D9D9D9] rounded sm:p-3 p-2 disabled:opacity-50 cursor-pointer"
        >
          <img src="/home/arrowl.svg" alt="arrowl" className="w-3 sm:w-5" />
        </button>
      </div>
    </div>
  );
}
