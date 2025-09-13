"use client";
import React, { useState, useEffect } from "react";

type Report = {
  id: number;
  name: string;
  email: string;
  report: string;
  post: {
    id?: number;
    type: "lostpet" | "foundpet";
    description: string;
    location: string;
    pet?: {
      name: string;
      images?: { url: string; mainImage?: boolean }[];
    };
    images?: { url: string }[];
  };
};

export default function Report() {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const usersPerPage = 8;
  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentReports = reports.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(reports.length / usersPerPage);

  // Fetch reports
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/reports");
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลรายงานได้");
        const data = await res.json();

        const formatted: Report[] = data.map((r: any) => ({
          id: r.id,
          name: r.reporter?.name || "Unknown",
          email: r.reporter?.email || "Unknown",
          report: r.reason,
          post: {
            id: r.post?.id,
            type: r.post?.type || "lostpet",
            description: r.post?.description || "No description",
            location: r.post?.location || "Unknown",
            pet: r.post?.pet
              ? { name: r.post.pet.name || "Unknown", images: r.post.pet.images || [] }
              : undefined,
            images: r.post?.images || [],
          },
        }));
        setReports(formatted);
        setError(null);
      } catch (err: any) {
        setError(err.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleHide = async (id: number) => {
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "hidden" }),
      });
      if (!res.ok) throw new Error("ซ่อนรายงานไม่สำเร็จ");
      setReports(reports.filter((r) => r.id !== id));
      setSelectedReport(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบรายงานไม่สำเร็จ");
      setReports(reports.filter((r) => r.id !== id));
      setSelectedReport(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openModal = (report: Report) => setSelectedReport(report);
  const closeModal = () => setSelectedReport(null);
  const paginate = (page: number) => setCurrentPage(page);

  if (loading) return <div className="text-center p-5 text-lg">กำลังโหลด...</div>;
  if (error) return <div className="text-center p-5 text-red-500 text-lg">{error}</div>;

  return (
    <div className="w-full relative p-4">
      {/* ตาราง Header */}
      <div className="grid grid-cols-5 font-semibold bg-[#AFDAFB] sm:p-6 p-4 xl:text-xl lg:text-lg md:text-base text-sm rounded-t">
        <div>ชื่อ</div>
        <div>อีเมล</div>
        <div>การรายงาน</div>
        <div>ประเภทโพสต์</div>
        <div className="text-center">จัดการ</div>
      </div>

      {/* รายงาน */}
      {currentReports.map((r, index) => (
        <div
          key={r.id}
          className={`grid grid-cols-5 items-center sm:p-5 p-4 xl:text-xl lg:text-lg md:text-base text-sm ${
            index % 2 === 0 ? "bg-white" : "bg-[#d3edfe]"
          }`}
        >
          <div>{r.name}</div>
          <div>{r.email}</div>
          <div className="pl-2">{r.report}</div>
          <div className="capitalize">{r.post.type}</div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => openModal(r)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm sm:text-base"
            >
              ดูรายละเอียด
            </button>
            <button
              onClick={() => handleDelete(r.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm sm:text-base"
            >
              ลบ
            </button>
          </div>
        </div>
      ))}

      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full border shadow-lg overflow-auto max-h-[90vh] relative">
            <h2 className="text-3xl font-semibold mb-6 text-center">📌 รายละเอียดโพสต์ที่ถูกรายงาน</h2>

            <div className="space-y-3 text-base sm:text-lg">
              <p>
                <strong>📂 ประเภทโพสต์:</strong>{" "}
                {selectedReport.post.type === "lostpet" ? "สัตว์หาย" : "เจอสัตว์"}
              </p>
              {selectedReport.post.pet && (
                <p>
                  <strong>🐾 ชื่อสัตว์เลี้ยง:</strong> {selectedReport.post.pet.name}
                </p>
              )}
              <p>
                <strong>📝 คำอธิบาย:</strong> {selectedReport.post.description}
              </p>
              <p>
                <strong>📍 สถานที่:</strong> {selectedReport.post.location}
              </p>
            </div>

            {/* Images */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {selectedReport.post.pet?.images?.map((img, idx) => (
                <img
                  key={`pet-${idx}`}
                  src={img.url}
                  alt="Pet"
                  className="w-full h-40 object-cover rounded"
                />
              ))}
              {selectedReport.post.images?.map((img, idx) => (
                <img
                  key={`post-${idx}`}
                  src={img.url}
                  alt="Post"
                  className="w-full h-40 object-cover rounded"
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap justify-between gap-4">
              {selectedReport.post.id && (
                <a
                  href={`/${selectedReport.post.type}/${selectedReport.post.id}`}
                  target="_blank"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-base"
                >
                  🔗 ไปยังโพสต์จริง
                </a>
              )}
              <button
                onClick={() => handleHide(selectedReport.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded text-base"
              >
                👁 ลบโพสต์
              </button>
              <button
                onClick={() => handleDelete(selectedReport.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded text-base"
              >
                🗑 ลบรายงาน
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-black px-5 py-2 rounded text-base"
              >
                ❌ ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-5 mt-8">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-[#D9D9D9] rounded p-3 disabled:opacity-50 cursor-pointer"
        >
          <img src="/home/arrow.svg" alt="arrow" className="w-5" />
        </button>

        <span className="bg-[#D9D9D9] rounded px-4 py-2 text-base">{currentPage}</span>
        <span className="text-base">ถึง</span>
        <span className="bg-[#D9D9D9] rounded px-4 py-2 text-base">{totalPages}</span>

        <button
          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="bg-[#D9D9D9] rounded p-3 disabled:opacity-50 cursor-pointer"
        >
          <img src="/home/arrowl.svg" alt="arrowl" className="w-5" />
        </button>
      </div>
    </div>
  );
}
