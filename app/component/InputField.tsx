
"use client";
import React from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean; 
}

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
  disabled = false,
}: InputFieldProps) {
  return (
    <div className="flex flex-col items-start xl:w-[40%] w-[70%]">
      <p className="mb-2 sm:text-lg xl:text-xl">{label}</p>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full mt-1 p-2 border border-gray-300 rounded-md mb-3 disabled:bg-gray-100"
      />
    </div>
  );
}
