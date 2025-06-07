"use client";
import React, { useState } from "react";

type User = {
  name: string;
  email: string;
  lastLogin: string;
};

const initialUsersData: User[] = [
  // (ข้อมูลเดิมทั้งหมด)
  { name: "สมชาย ใจดี", email: "somchai@example.com", lastLogin: "2025-06-05" },
  { name: "มานี สุขใจ", email: "manee@example.com", lastLogin: "2025-06-04" },
  {
    name: "เจนจิรา พิพัฒน์",
    email: "jane@example.com",
    lastLogin: "2025-06-03",
  },
  {
    name: "วีระชัย สายสมร",
    email: "weerachai@example.com",
    lastLogin: "2025-06-01",
  },
  { name: "สมชาย ใจดี", email: "somchai@example.com", lastLogin: "2025-06-05" },
  { name: "มานี สุขใจ", email: "manee@example.com", lastLogin: "2025-06-04" },
  {
    name: "เจนจิรา พิพัฒน์",
    email: "jane@example.com",
    lastLogin: "2025-06-03",
  },
  {
    name: "วีระชัย สายสมร",
    email: "weerachai@example.com",
    lastLogin: "2025-06-01",
  },
  { name: "สมชาย ใจดี", email: "somchai@example.com", lastLogin: "2025-06-05" },
  { name: "มานี สุขใจ", email: "manee@example.com", lastLogin: "2025-06-04" },
  {
    name: "เจนจิรา พิพัฒน์",
    email: "jane@example.com",
    lastLogin: "2025-06-03",
  },
  {
    name: "วีระชัย สายสมร",
    email: "weerachai@example.com",
    lastLogin: "2025-06-01",
  },
];

export default function Users() {
  const [users, setUsers] = useState<User[]>(initialUsersData);
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
      <div className="grid grid-cols-4 font-semibold bg-[#AFDAFB] p-3 xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px]">
        <div>ชื่อ</div>
        <div>อีเมล</div>
        <div className="lg:pl-14 sm:pl-8 pl-6">เข้าสู่ระบบล่าสุด</div>
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
          <div className="lg:pl-14 sm:pl-8 pl-7">{user.lastLogin}</div>
          <div className="text-right space-x-2">
            <button
              onClick={() => handleHide(index)}
              className="bg-[#EAD64D] hover:bg-yellow-300 text-black md:px-7 sm:px-5 px-2 py-1 rounded cursor-pointer"
            >
              ซ่อน
            </button>
            <button
              onClick={() => handleDelete(index)}
              className="bg-[#EA3434] hover:bg-red-700 text-black md:px-7 sm:px-5 px-2 py-1 rounded cursor-pointer"
            >
              ลบ
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-center items-center space-x-5 pt-8">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center justify-center bg-[#D9D9D9] rounded sm:p-2 p-1.5 disabled:opacity-50 cursor-pointer"
        >
          <img
            src="/home/arrow.svg"
            alt="arrow"
            className="xl:w-7 lg:w-5 md:w-3 sm:w-2.5 w-2 object-contain"
          />
        </button>

        <span className="bg-[#D9D9D9] rounded xl:px-5 xl:py-2 py-1 lg:px-4 sm:px-3 px-2 text-center xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px]">
          {currentPage}
        </span>
        <span className="xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px]">
          ถึง
        </span>
        <span className="bg-[#D9D9D9] rounded xl:px-5 xl:py-2 py-1 lg:px-4 sm:px-3 px-2 text-center xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px]">
          {totalPages}
        </span>

        <button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center bg-[#D9D9D9] rounded sm:p-2 p-1.5 disabled:opacity-50 cursor-pointer"
        >
          <img
            src="/home/arrowl.svg"
            alt="arrowl"
            className="xl:w-7 lg:w-5 md:w-3 sm:w-2.5 w-2 object-contain"
          />
        </button>
      </div>
    </div>
  );
}
