"use client";
import React, { useState } from "react";

type Category = {
  name: string;
};

const initialCategoryData: Category[] = [
  { name: "สุนัข" },
  { name: "แมว" },
  { name: "นก" },
  { name: "หนู" },
  { name: "ชูก้าไรเดอร์" },
  { name: "เฟอร์ริต" },
  { name: "เม่นแคระ" },
  { name: "กระต่าย" },
  { name: "งู" },
  { name: "กระรอก" },
];

export default function Report() {
  const [categories, setCategories] = useState<Category[]>(initialCategoryData);
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

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditedName(currentCategories[index].name);
  };

  const handleSave = () => {
    if (editingIndex !== null) {
      const updatedCategories = [...categories];
      updatedCategories[indexOfFirstCategory + editingIndex].name = editedName;
      setCategories(updatedCategories);
      setEditingIndex(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedName("");
  };

  const handleDelete = (index: number) => {
    const newCategories = [...categories];
    newCategories.splice(indexOfFirstCategory + index, 1);
    setCategories(newCategories);
  };

  // ฟังก์ชันเพิ่มประเภทสัตว์เลี้ยงใหม่จากกล่อง input
  const handleAddNewCategory = () => {
    if (newCategoryName.trim() === "") {
      alert("กรุณากรอกประเภทสัตว์เลี้ยง");
      return;
    }
    setCategories((prev) => [...prev, { name: newCategoryName.trim() }]);
    setNewCategoryName("");
    setShowAddBox(false);
    setCurrentPage(Math.ceil((categories.length + 1) / categoriesPerPage));
  };

  return (
    <div className="w-full relative">
      <div className="flex justify-end mb-2">
        {!showAddBox && (
          <button
            onClick={() => setShowAddBox(true)}
            className="bg-[#EAD64D] hover:bg-yellow-400 text-black xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px] font-semibold md:px-8 sm:px-5 px-3 py-1 rounded cursor-pointer"
          >
            เพิ่ม
          </button>
        )}
      </div>

      {/* Modal Overlay */}
      {showAddBox && (
        <div
          className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 sm:mb-10 lg:mb-0 mb-80"
          // คลิกพื้นหลังเฉย ๆ จะไม่ทำอะไร
          onClick={() => {}}
        >
          <div
            className="sm:w-80 sm:h-40 w-60 h-36 bg-white rounded px-4 py-3 shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()} // ป้องกัน event click หลุดไปถึง parent
          >
            {/* Header */}
            <div className="flex justify-between items-center text-black font-semibold lg:text-xl sm:text-lg text-md relative z-10">
              <span>สัตว์เลี้ยง</span>
              <button
                onClick={() => {
                  setShowAddBox(false);
                  setNewCategoryName("");
                }}
                className="text-black font-bold sm:text-5xl text-4xl leading-none cursor-pointer"
                aria-label="Close add box"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="lg:text-lg sm:text-md text-sm sm:pl-5 pl-2 leading-tight relative z-10">
              ประเภทสัตว์เลี้ยง
            </div>

            {/* Footer */}
            <div className="relative mt-3">
              <span className="absolute -right-14 top-0 w-20 h-16 bg-[#EAD64D] rounded-l-full z-0"></span>
              <span className="absolute right-14 -top-20 w-7 h-7 bg-[#7CBBEB] rounded-full z-0"></span>
              <span className="absolute -left-5 top-8 w-5 h-5 bg-[#7CBBEB] rounded-full z-0"></span>
              <span className="absolute -left-2 -top-10 w-8 h-8 bg-[#EAD64D] rounded-full z-0"></span>
              <span className="absolute left-18 -top-22 w-6 h-6 bg-[#7CBBEB] rounded-full z-0"></span>
              <span className="absolute left-36 -top-14 w-4 h-4 bg-[#EAD64D] rounded-full z-0"></span>
              <span className="absolute left-24 top-10 w-5 h-5 bg-[#EAD64D] rounded-full z-0"></span>

              <div className="flex space-x-2 relative z-10">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-grow w-[120px] sm:w-auto border border-black rounded-2xl px-2 sm:py-2 py-1 text-black text-sm relative z-10"
                />
                <button
                  onClick={() => {
                    handleAddNewCategory();
                    setShowAddBox(false);
                  }}
                  className="bg-[#7CBBEB] hover:bg-blue-400 sm:px-4 px-2  py-1  rounded text-sm cursor-pointer"
                >
                  บันทึก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 font-semibold bg-[#EAD64D] p-3 xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px]">
        <div>ประเภทสัตว์เลี้ยง</div>
      </div>

      {currentCategories.map((category, index) => (
        <div
          key={index}
          className={`grid grid-cols-2 items-center xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px] p-3 ${
            index % 2 === 0 ? "bg-white" : "bg-[#fbed8d]"
          }`}
        >
          <div>
            {editingIndex === index ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 w-full text-black text-sm"
              />
            ) : (
              category.name
            )}
          </div>
          <div className="text-right xl:text-xl lg:text-lg md:text-sm sm:text-xs text-[8px] space-x-2">
            {editingIndex === index ? (
              <>
                <button
                  onClick={handleSave}
                  className="bg-[#7CBBEB] hover:bg-blue-400 text-black lg:px-5 sm:px-4.5  px-3  py-1 rounded cursor-pointer"
                >
                  บันทึก
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-black lg:px-4.5 sm:px-4.5 px-3  py-1 rounded cursor-pointer"
                >
                  ยกเลิก
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleEdit(index)}
                  className="bg-[#7CBBEB] hover:bg-blue-400 text-black lg:px-7 sm:px-6 px-4 py-1 rounded cursor-pointer"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(index)}
                  className="bg-[#EA3434] hover:bg-red-700 text-black lg:px-7 sm:px-6 px-4 py-1 rounded cursor-pointer"
                >
                  ลบ
                </button>
              </>
            )}
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
            className="xl:w-7 lg:w-5 md:w-3 sm:w-2.5 w-2"
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
            className="xl:w-7 lg:w-5 md:w-3 sm:w-2.5 w-2"
          />
        </button>
      </div>
    </div>
  );
}
