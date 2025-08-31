"use client";
import React, { useState, useEffect } from "react";

type Category = {
  id: number; // สมมติ API มี id
  name: string;
};

export default function Report() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");
  const [showAddBox, setShowAddBox] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

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
        const data = await res.json();
        setCategories(data); // สมมติ data = [{id:1, name:"แมว"}, ...]
      } catch (error) {
        console.error("Error fetching categories:", error);
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
      const category = currentCategories[editingIndex];
      try {
        await fetch(`/api/pets/species/${category.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editedName }),
        });

        const updatedCategories = [...categories];
        updatedCategories[indexOfFirstCategory + editingIndex].name =
          editedName;
        setCategories(updatedCategories);
        setEditingIndex(null);
      } catch (error) {
        console.error("Error updating category:", error);
      }
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedName("");
  };

  const handleDelete = async (index: number) => {
    const category = currentCategories[index];
    try {
      await fetch(`/api/pets/species/${category.id}`, {
        method: "DELETE",
      });

      const newCategories = categories.filter((c) => c.id !== category.id);
      setCategories(newCategories);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleAddNewCategory = async () => {
    if (newCategoryName.trim() === "") {
      alert("กรุณากรอกประเภทสัตว์เลี้ยง");
      return;
    }

    try {
      const res = await fetch("/api/pets/species", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const newCategory = await res.json();

      setCategories((prev) => [...prev, newCategory]);
      setNewCategoryName("");
      setShowAddBox(false);
      setCurrentPage(Math.ceil((categories.length + 1) / categoriesPerPage));
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <div className="w-full relative">
      {/* ปุ่มเพิ่ม */}
      <div className="flex justify-end mb-5">
        {!showAddBox && (
          <button
            onClick={() => setShowAddBox(true)}
            className="bg-[#EAD64D] hover:bg-yellow-400 text-black xl:text-xl lg:text-lg md:text-[16px] sm:text-xs text-[10px]  md:px-8 sm:px-6 px-4 py-2 rounded cursor-pointer"
          >
            เพิ่ม
          </button>
        )}
      </div>

      {/* Modal เพิ่ม */}
      {showAddBox && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 sm:mb-10 lg:mb-0 mb-80">
          <div
            className="xl:w-150 xl:h-100 lg:w-135 lg:h-90 md:w-120 md:h-80 sm:w-110 sm:h-80 w-80 h-60 bg-white rounded xl:p-14 lg:p-10 p-7 shadow-lg overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background circles */}
            <span className="absolute right-0 bottom-[50px] w-20 h-36 bg-[#EAD64D] rounded-l-full z-0"></span>
            <span className="absolute right-20 -top-[20px] w-20 h-20 bg-[#7CBBEB] rounded-full z-0"></span>
            <span className="absolute hidden lg:block right-52 top-[90px] w-18 h-18 bg-[#EAD64D] rounded-full z-0"></span>
            <span className="absolute hidden lg:block right-10 top-[130px] w-8 h-8 bg-[#7CBBEB] rounded-full z-0"></span>
            <span className="absolute -left-2 top-2 w-14 h-14 bg-[#7CBBEB] rounded-full z-0"></span>

            <span className="absolute right-72 top-[20px] w-9 h-9 bg-[#7CBBEB] rounded-full z-0"></span>
            <span className="absolute lg:left-40 top-[50px] left-44  w-18 h-18 bg-[#EAD64D] rounded-full z-0"></span>
            <span className="absolute  left-[100px] top-[5px] w-6 h-6 bg-[#7CBBEB] rounded-full z-0"></span>
            <span className="absolute left-[90px] top-[13px] w-6 h-6 bg-[#EAD64D] rounded-full z-0"></span>
            <span className="absolute left-[10px] top-[140px] w-5 h-5 bg-[#EAD64D] rounded-full z-0"></span>
            <span className="absolute left-[40px] lg:bottom-[30px] bottom-[20px] w-24 h-24  lg:w-30 lg:h-30 bg-[#7CBBEB] rounded-full z-0"></span>
            <span className="absolute left-[250px] bottom-[50px] w-20 h-20 bg-[#EAD64D] rounded-full z-0"></span>
            <span className="absolute left-[170px] bottom-[20px] w-6 h-6 bg-[#EAD64D] rounded-full z-0"></span>
            <span className="absolute hidden lg:block right-30 bottom-[10px] w-18 h-18 bg-[#7CBBEB] rounded-full z-0"></span>
            <span className="absolute hidden lg:block right-60 bottom-[40px] w-14 h-14 bg-[#7CBBEB] rounded-full z-0"></span>

            {/* Header */}
            <div className="flex justify-between items-center text-black font-semibold lg:text-2xl sm:text-xl text-md relative z-10">
              <span>สัตว์เลี้ยง</span>
              <button
                onClick={() => {
                  setShowAddBox(false);
                  setNewCategoryName("");
                }}
                className="text-black font-bold sm:text-6xl text-4xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Label */}
            <div className="lg:text-xl sm:text-lg text-sm sm:pl-4 pl-2 lg:my-5 mb-5 relative z-10">
              ประเภทสัตว์เลี้ยง
            </div>

            {/* Input */}
            <div className="relative mt-3 flex flex-col space-y-3 mb-6 z-10">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="border border-black rounded-2xl px-4 sm:py-2 lg:py-3 py-1 text-black g:text-lg text-[16px] relative z-10"
              />
            </div>

            {/* Save button aligned right */}
            <div className="flex justify-end z-10">
              <button
                onClick={handleAddNewCategory}
                className="bg-[#7CBBEB] hover:bg-blue-400 sm:px-5 px-2 py-2 rounded lg:text-lg text-[16px] cursor-pointer mt-3 relative z-10"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ตารางแสดง */}
      <div className="grid grid-cols-2 font-semibold bg-[#EAD64D] sm:p-5 p-3 xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[10px]">
        <div>ประเภทสัตว์เลี้ยง</div>
      </div>

      {currentCategories.map((category, index) => (
        <div
          key={category.id}
          className={`grid grid-cols-2 items-center xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px] sm:p-3 p-2 ${
            index % 2 === 0 ? "bg-white" : "bg-[#fbed8d]"
          }`}
        >
          <div>
            {editingIndex === index ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 w-full text-black xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px]"
              />
            ) : (
              category.name
            )}
          </div>
          <div className="text-right sm:space-x-6 space-x-4">
            {editingIndex === index ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-[#7CBBEB] hover:bg-blue-400 sm:px-5 sm:py-1.5 px-3.5 py-1 rounded cursor-pointer"
                >
                  บันทึก
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 sm:px-4 sm:py-1.5 px-3.5 py-1 rounded cursor-pointer"
                >
                  ยกเลิก
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(index)}
                  className="bg-[#7CBBEB] hover:bg-blue-400 sm:px-6 sm:py-1.5 px-4 py-1 rounded cursor-pointer"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="bg-[#EA3434] hover:bg-red-700 sm:px-7.5 sm:py-1.5 px-5 py-1 rounded cursor-pointer"
                >
                  ลบ
                </button>
              </>
            )}
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
