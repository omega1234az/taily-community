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

  if (loading) return <div className="text-center py-8 text-gray-600">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;


  return (
    <div className="w-full max-w-7xl mx-auto p-6  bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">จัดการรายงาน</h1>

      {/* Summary Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">สรุปรายงาน</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl shadow-md flex items-start gap-4">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-600 text-lg">รายงานทั้งหมด</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">{reports.length}</p>
            </div>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl shadow-md flex items-start gap-4">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-yellow-600 text-lg">รายงานสัตว์หาย</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {reports.filter(r => r.post.type === "lostpet").length}
              </p>
            </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl shadow-md flex items-start gap-4">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-purple-600 text-lg">รายงานหาเจ้าของ</h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {reports.filter(r => r.post.type === "foundpet").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="mb-10">
  <h2 className="text-xl font-semibold text-gray-700 mb-4">รายการรายงาน</h2>
  <div className="overflow-x-auto rounded-xl shadow-md">
    <div className="grid grid-cols-5 gap-4 bg-blue-50 p-4 font-semibold text-gray-700 text-sm">
      <div>ชื่อผู้รายงาน</div>
      <div>อีเมล</div>
      <div>เหตุผลการรายงาน</div>
      <div>ประเภทโพสต์</div>
      <div className="text-center">การจัดการ</div>
    </div>

    {currentReports.length === 0 ? (
      <div className="p-6 text-center text-gray-500 text-sm">
        ไม่มีรายงาน
      </div>
    ) : (
      currentReports.map((r, index) => (
        <div
          key={r.id}
          className={`grid grid-cols-5 gap-4 items-center p-4 text-sm ${
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          } hover:bg-gray-100 transition-colors border-b border-gray-100`}
        >
          <div className="truncate">{r.name}</div>
          <div className="truncate">{r.email}</div>
          <div className="truncate max-w-xs">{r.report}</div>
          <div className="capitalize">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                r.post.type === "lostpet"
                  ? "bg-red-100 text-red-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {r.post.type === "lostpet" ? "สัตว์หาย" : "หาเจ้าของ"}
            </span>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => openModal(r)}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ดูรายละเอียด
            </button>
            <button
              onClick={() => handleDelete(r.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              ลบ
            </button>
          </div>
        </div>
      ))
    )}
  </div>
</div>


      {/* Modal */}
      {selectedReport && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full border shadow-2xl overflow-auto max-h-[90vh] relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">📌 รายละเอียดรายงาน</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Report Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">ข้อมูลผู้รายงาน</h3>
                  <p className="text-sm text-gray-600"><strong>ชื่อ:</strong> {selectedReport.name}</p>
                  <p className="text-sm text-gray-600"><strong>อีเมล:</strong> {selectedReport.email}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">รายละเอียดการรายงาน</h3>
                  <p className="text-sm text-gray-600"><strong>เหตุผล:</strong> {selectedReport.report}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">ข้อมูลโพสต์</h3>
                  <p className="text-sm text-gray-600">
                    <strong>ประเภท:</strong> {selectedReport.post.type === "lostpet" ? "สัตว์หาย" : "หาเจ้าของ"}
                  </p>
                  {selectedReport.post.pet && (
                    <p className="text-sm text-gray-600"><strong>ชื่อสัตว์:</strong> {selectedReport.post.pet.name}</p>
                  )}
                  <p className="text-sm text-gray-600"><strong>สถานที่:</strong> {selectedReport.post.location}</p>
                  <p className="text-sm text-gray-600"><strong>คำอธิบาย:</strong> {selectedReport.post.description}</p>
                </div>
              </div>
            </div>

            {/* Images */}
            {(selectedReport.post.pet?.images?.length || selectedReport.post.images?.length) ? (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-700 mb-4">รูปภาพ</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedReport.post.pet?.images?.map((img, idx) => (
                    <img
                      key={`pet-${idx}`}
                      src={img.url}
                      alt="Pet"
                      className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    />
                  ))}
                  {selectedReport.post.images?.map((img, idx) => (
                    <img
                      key={`post-${idx}`}
                      src={img.url}
                      alt="Post"
                      className="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-end gap-4 pt-4 border-t border-gray-200">
              {selectedReport.post.id && (
                <a
                  href={`/${selectedReport.post.type}/${selectedReport.post.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  ไปยังโพสต์
                </a>
              )}
              <button
                onClick={() => handleHide(selectedReport.id)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12H9m12 0a9 9 0 11-18.18-5.18M15 12a2.5 2.5 0 01-5 0m0 0a2.5 2.5 0 015 0m6.36-.86l-1.5-1.5" />
                </svg>
                ลบโพสต์
              </button>
              <button
                onClick={() => handleDelete(selectedReport.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                ลบรายงาน
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-5">
        <button
          onClick={() => paginate(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-gray-200 hover:bg-gray-300 rounded-lg p-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
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
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}