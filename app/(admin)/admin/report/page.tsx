"use client";
import React, { useState, useEffect } from "react";

type Report = {
  id: number;
  name: string;
  email: string;
  report: string;
};

export default function Report() {
  const [users, setUsers] = useState<Report[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const usersPerPage = 8;

  // Calculate pagination indices
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Fetch reports from the API
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/reports");
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        // Map API response to match Report type
        const data = await response.json();
        const formattedReports: Report[] = data.map((report: any) => ({
          id: report.id,
          name: report.reporter.name || "Unknown",
          email: report.reporter.email || "Unknown",
          report: report.reason,
        }));
        setUsers(formattedReports);
        setError(null);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Handle hiding a report (PUT request to update status to 'rejected')
  const handleHide = async (reportId: number) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: 0 }), // Maps to 'rejected' in backend
      });

      if (!response.ok) {
        throw new Error("Failed to hide report");
      }

      // Update local state to reflect the hidden report
      setUsers(users.filter((user) => user.id !== reportId));
    } catch (err: any) {
      setError(err.message || "Failed to hide report");
    }
  };

  // Handle deleting a report (DELETE request)
  const handleDelete = async (reportId: number) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      // Update local state to remove the deleted report
      setUsers(users.filter((user) => user.id !== reportId));
    } catch (err: any) {
      setError(err.message || "Failed to delete report");
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="text-center p-5">Loading...</div>;
  }

  if (error) {
    return <div className="text-center p-5 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 font-semibold bg-[#AFDAFB] sm:p-5 p-3 xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[10px]">
        <div>ชื่อ</div>
        <div>อีเมล</div>
        <div className="lg:pl-3 sm:pl-7 pl-6">การรายงาน</div>
        <div></div>
      </div>

      {currentUsers.map((user) => (
        <div
          key={user.id}
          className={`grid grid-cols-4 items-center xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px] p-3 ${
            currentUsers.indexOf(user) % 2 === 0 ? "bg-white" : "bg-[#d3edfe]"
          }`}
        >
          <div>{user.name}</div>
          <div>{user.email}</div>
          <div className="lg:pl-3 sm:pl-7 pl-7">{user.report}</div>
          <div className="text-right space-x-2">
            <button
              onClick={() => handleHide(user.id)}
              className="bg-[#EAD64D] hover:bg-yellow-300 text-black sm:px-5 sm:py-1.5 px-3 py-1 rounded cursor-pointer"
            >
              ซ่อน
            </button>
            <button
              onClick={() => handleDelete(user.id)}
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