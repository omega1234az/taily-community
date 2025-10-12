
"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

type Category = {
  id: number;
  name: string;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");
  const [showAddBox, setShowAddBox] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const categoriesPerPage = 8;
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // โหลดข้อมูลจาก API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/pets/species");
        if (!res.ok) throw new Error("ไม่สามารถดึงข้อมูลประเภทสัตว์เลี้ยงได้");
        const data = await res.json();
        setCategories(data);
        setError(null);
      } catch (error: any) {
        setError(error.message || "เกิดข้อผิดพลาด");
      }
    };
    fetchCategories();
  }, []);

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedName(currentCategories[index].name);
  };

  const handleSave = async () => {
    if (editingIndex !== null) {
      if (editedName.trim() === "") {
        setError("กรุณากรอกชื่อประเภทสัตว์เลี้ยง");
        return;
      }
      const category = currentCategories[editingIndex];
      try {
        const res = await fetch(`/api/pets/species/${category.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editedName.trim() }),
        });
        if (!res.ok) throw new Error("แก้ไขประเภทไม่สำเร็จ");
        const updatedCategories = [...categories];
        updatedCategories[indexOfFirstCategory + editingIndex].name =
          editedName.trim();
        setCategories(updatedCategories);
        setEditingIndex(null);
        setError(null);
      } catch (error: any) {
        setError(error.message || "เกิดข้อผิดพลาด");
      }
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedName("");
    setError(null);
  };

  const handleDelete = async (index: number) => {
    const category = currentCategories[index];
    const result = await Swal.fire({
      title: "ยืนยันการลบประเภท",
      text: `คุณแน่ใจหรือไม่ที่จะลบประเภท "${category.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/pets/species/${category.id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("ลบประเภทไม่สำเร็จ");
        const newCategories = categories.filter((c) => c.id !== category.id);
        setCategories(newCategories);
        setError(null);
        Swal.fire("ลบสำเร็จ!", `ประเภท "${category.name}" ถูกลบแล้ว`, "success");
      } catch (error: any) {
        setError(error.message || "เกิดข้อผิดพลาด");
        Swal.fire("เกิดข้อผิดพลาด!", error.message || "ลบประเภทไม่สำเร็จ", "error");
      }
    }
  };

  const handleAddNewCategory = async () => {
    if (newCategoryName.trim() === "") {
      setError("กรุณากรอกชื่อประเภทสัตว์เลี้ยง");
      return;
    }
    try {
      const res = await fetch("/api/pets/species", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      if (!res.ok) throw new Error("เพิ่มประเภทไม่สำเร็จ");
      const newCategory = await res.json();
      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName("");
      setShowAddBox(false);
      setCurrentPage(Math.ceil((categories.length + 1) / categoriesPerPage));
      setError(null);
    } catch (error: any) {
      setError(error.message || "เกิดข้อผิดพลาด");
    }
  };

  // If there's an error, show it
  if (error)
    return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <title>จัดการหมวดหมู่</title>
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        จัดการประเภทสัตว์เลี้ยง
      </h1>

      {/* Summary Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          สรุปประเภทสัตว์เลี้ยง
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                ประเภททั้งหมด
              </h3>
              <p className="text-3xl font-bold text-gray-800 mt-1">
                {categories.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowAddBox(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          เพิ่มประเภท
        </button>
      </div>

      {/* Table Section */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          รายการประเภทสัตว์เลี้ยง
        </h2>
        <div className="overflow-x-auto rounded-xl shadow-md">
          <div className="grid grid-cols-3 gap-4 bg-blue-50 p-4 font-semibold text-gray-700 text-sm">
            <div>ประเภทสัตว์เลี้ยง</div>
            <div className="col-span-2 text-center">การจัดการ</div>
          </div>
          {categories.length === 0 ? (
            <div className="text-center py-8 text-gray-600 bg-white border-b border-gray-100">
              ไม่มีประเภทสัตว์เลี้ยง
            </div>
          ) : (
            currentCategories.map((category, index) => (
              <div
                key={category.id}
                className={`grid grid-cols-3 gap-4 items-center p-4 text-sm ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition-colors border-b border-gray-100`}
              >
                <div className="truncate">
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full text-sm p-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="กรอกชื่อประเภท"
                    />
                  ) : (
                    category.name
                  )}
                </div>
                <div className="col-span-2 flex justify-end space-x-2">
                  {editingIndex === index ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        บันทึก
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        ยกเลิก
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(index)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        แก้ไข
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        ลบ
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Adding Category */}
      {showAddBox && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                เพิ่มประเภทสัตว์เลี้ยง
              </h2>
              <button
                onClick={() => {
                  setShowAddBox(false);
                  setNewCategoryName("");
                  setError(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ชื่อประเภทสัตว์เลี้ยง
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกชื่อประเภท เช่น แมว, สุนัข"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleAddNewCategory}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {categories.length > 0 && (
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
      )}
    </div>
  );
}
