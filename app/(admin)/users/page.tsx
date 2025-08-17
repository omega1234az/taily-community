"use client";
import React, { useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  email: string;
  lastLogin: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const usersPerPage = 8;

  // ✅ โหลดข้อมูลจาก API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/users"); // 👈 ไม่ต้องใส่ http://localhost:3000
        if (!res.ok) throw new Error("Failed to fetch users");
        const json = await res.json();
        const data: User[] = Array.isArray(json) ? json : json.users ?? [];
        setUsers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // ✅ ซ่อนจาก state อย่างเดียว
  const handleHide = (index: number) => {
    const newUsers = [...users];
    newUsers.splice(indexOfFirstUser + index, 1);
    setUsers(newUsers);
  };

  // ✅ ลบผ่าน API
  const handleDelete = async (index: number, id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      const newUsers = [...users];
      newUsers.splice(indexOfFirstUser + index, 1);
      setUsers(newUsers);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("ลบผู้ใช้ไม่สำเร็จ");
    }
  };

  if (loading) return <div>กำลังโหลดข้อมูล...</div>;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="grid grid-cols-4 font-semibold bg-[#AFDAFB] sm:p-5 p-3 xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[9px]">
        <div>ชื่อ</div>
        <div>อีเมล</div>
        <div className="lg:pl-14 sm:pl-8 pl-6">เข้าสู่ระบบล่าสุด</div>
      </div>

      {/* Users */}
      {currentUsers.map((user, index) => (
        <div
          key={user.id}
          className={`grid grid-cols-4 items-center xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px] sm:p-3 p-2 ${
            index % 2 === 0 ? "bg-white" : "bg-[#d3edfe]"
          }`}
        >
          <div>{user.name}</div>
          <div>{user.email}</div>
          <div className="lg:pl-14 sm:pl-8 pl-7">{user.lastLogin}</div>
          <div className="text-right lg:space-x-6 md:space-x-4 sm:space-x-3 space-x-2">
            <button
              onClick={() => handleHide(index)}
              className="bg-[#EAD64D] hover:bg-yellow-300 text-black lg:px-7.5 lg:py-1.5 md:px-6 md:py-1.5 sm:px-4.5 sm:py-1.5 px-3 py-1 rounded cursor-pointer"
            >
              ซ่อน
            </button>
            <button
              onClick={() => handleDelete(index, user.id)}
              className="bg-[#EA3434] hover:bg-red-700 text-black lg:px-9 md:px-6 md:py-1.5 sm:px-4.5 sm:py-1.5 px-3 py-1 rounded cursor-pointer"
            >
              ลบ
            </button>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-5 lg:pt-14 sm:pt-10 pt-8">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-[#D9D9D9] rounded sm:p-3 p-2 disabled:opacity-50 cursor-pointer"
        >
          <img
            src="/home/arrow.svg"
            alt="arrow"
            className="w-3 sm:w-4 lg:w-5"
          />
        </button>

        <span className="bg-[#D9D9D9] rounded lg:px-5 sm:py-2 sm:px-4.5 px-3 py-1.5 lg:text-lg sm:text-[15px] text-[10px]">
          {currentPage}
        </span>
        <span className="lg:text-lg sm:text-[14px] text-[12px]">ถึง</span>
        <span className="bg-[#D9D9D9] rounded lg:px-5 sm:py-2 sm:px-4.5 px-3 py-1.5 lg:text-lg sm:text-[15px] text-[10px]">
          {totalPages}
        </span>

        <button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="bg-[#D9D9D9] rounded sm:p-3 p-2 disabled:opacity-50 cursor-pointer"
        >
          <img
            src="/home/arrowl.svg"
            alt="arrowl"
            className="w-3 sm:w-4 lg:w-5"
          />
        </button>
      </div>
    </div>
  );
}
