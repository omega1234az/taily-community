"use client";
import React, { useState, useEffect } from "react";

type User = {
  id: string;
  name: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  image: string;
  role: string;
  houseNumber: string | null;
  street: string | null;
  village: string | null;
  subDistrict: string | null;
  district: string | null;
  province: string | null;
  emailVerified: string | null;
  createdAt: string;
  updatedAt: string;
  status: boolean;
};

type ApiResponse = {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [totalPages, setTotalPages] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<null | string>(null);
  const usersPerPage = 8;

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const query = statusFilter === "all" ? "" : `?status=${statusFilter}`;
        const res = await fetch(`/api/users${query}`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const json: ApiResponse = await res.json();
        setUsers(json.users || []);
        setTotalPages(json.totalPages || 1);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [statusFilter]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

  const handleToggleBan = async (
    index: number,
    id: string,
    currentStatus: boolean
  ) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: !currentStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const newUsers = [...users];
      newUsers[indexOfFirstUser + index].status = !currentStatus;
      setUsers(newUsers);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("อัปเดตสถานะผู้ใช้ไม่สำเร็จ");
    }
  };

  const handleChangeRole = async (
    index: number,
    id: string,
    newRole: string
  ) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      const newUsers = [...users];
      newUsers[indexOfFirstUser + index].role = newRole;
      setUsers(newUsers);
    } catch (error) {
      console.error("Error updating role:", error);
      alert("เปลี่ยนบทบาทไม่สำเร็จ");
    }
  };

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleSelect = (name: string, value: string) => {
    if (name === "status") {
      setStatusFilter(value);
      setCurrentPage(1);
    }
    setOpenDropdown(null);
  };

  const renderDropdown = (
    label: string,
    selected: string,
    options: { label: string; value: string }[],
    name: string
  ) => (
    <div className="relative">
      <title>จัดการผู้ใช้</title>
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

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        จัดการผู้ใช้
      </h1>

      {/* Filter Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          ตัวกรองผู้ใช้
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {renderDropdown(
            "สถานะผู้ใช้",
            statusFilter,
            [
              { label: "ทั้งหมด", value: "all" },
              { label: "ใช้งาน", value: "true" },
              { label: "ไม่ใช้งาน", value: "false" },
            ],
            "status"
          )}
        </div>
      </div>

      {/* Summary Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          สรุปข้อมูลผู้ใช้
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl shadow-md flex items-start gap-4">
            <svg
              className="w-10 h-10 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-600 text-lg">
                ผู้ใช้ทั้งหมด
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {users.length}
              </p>
            </div>
          </div>
          <div className="bg-green-50 p-6 rounded-xl shadow-md flex items-start gap-4">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-green-600 text-lg">
                ผู้ใช้ที่ใช้งาน
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {users.filter((user) => user.status).length}
              </p>
            </div>
          </div>
          <div className="bg-red-50 p-6 rounded-xl shadow-md flex items-start gap-4">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-red-600 text-lg">
                ผู้ใช้ที่ไม่ใช้งาน
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {users.filter((user) => !user.status).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          รายการผู้ใช้
        </h2>
        <div className="overflow-x-auto rounded-xl shadow-md">
          <div className="grid grid-cols-6 gap-4 bg-blue-50 p-4 font-semibold text-gray-700 text-sm">
            <div>รูป</div>
            <div>ชื่อ</div>
            <div>อีเมล</div>
            <div>บทบาท</div>
            <div>อัปเดตล่าสุด</div>
            <div>สถานะ/การจัดการ</div>
          </div>
          {currentUsers.length > 0 ? (
            currentUsers.map((user, index) => (
              <div
                key={user.id}
                className={`grid grid-cols-6 gap-4 items-center p-4 text-sm ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition-colors`}
              >
                <div>
                  <img
                    src={user.image}
                    alt={`${user.name}'s avatar`}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      img.src = "/all/owen.png";
                    }}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                </div>
                <div className="truncate">{user.name}</div>
                <div className="truncate">{user.email}</div>
                <div>
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleChangeRole(index, user.id, e.target.value)
                    }
                    className="w-full text-sm p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  {new Date(user.updatedAt).toLocaleString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status ? "ใช้งาน" : "ไม่ใช้งาน"}
                  </span>
                  <button
                    onClick={() => handleToggleBan(index, user.id, user.status)}
                    className={`${
                      user.status
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-green-500 hover:bg-green-600"
                    } text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors`}
                  >
                    {user.status ? "แบนผู้ใช้" : "ปลดแบน"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 col-span-6">
              ไม่มีข้อมูลผู้ใช้ในเงื่อนไขนี้
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-5 mt-8">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-gray-200 hover:bg-gray-300 rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="bg-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-600">
          {currentPage}
        </span>
        <span className="text-sm text-gray-600">ถึง</span>
        <span className="bg-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-600">
          {totalPages}
        </span>
        <button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="bg-gray-200 hover:bg-gray-300 rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
