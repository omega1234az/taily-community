"use client"

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(6, { message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" })
    .regex(/[0-9]/, { message: "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน",
  path: ["confirmPassword"]
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // สถานะสำหรับตรวจสอบเงื่อนไขรหัสผ่าน
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  
  // สถานะสำหรับการแสดงรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // สถานะสำหรับการตรวจสอบ token
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSubmitTimeRef = useRef<number>(0);
  const throttleTimeMs = 3000; // ระยะเวลาที่ต้องรอระหว่างการส่งฟอร์ม (3 วินาที)

  // ตรวจสอบ token เมื่อ component โหลด
  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get('token');
    console.log('URL Token:', urlToken);
    setToken(urlToken);
    
    if (urlToken) {
      setIsTokenValid(true);
    } else {
      setGeneralError('ไม่พบ token สำหรับการรีเซ็ตรหัสผ่าน โปรดตรวจสอบลิงก์ของคุณ');
    }
    
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

  // ตรวจสอบเงื่อนไขของรหัสผ่านเมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    const password = formData.password;
    
    // ตรวจสอบความยาวขั้นต่ำ
    setHasMinLength(password.length >= 6);
    
    // ตรวจสอบว่ามีตัวเลขหรือไม่
    setHasNumber(/[0-9]/.test(password));
    
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      resetPasswordSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setSuccess('');
    
    // ตรวจสอบว่ามี token หรือไม่
    if (!token) {
      setGeneralError('ไม่พบ token สำหรับการรีเซ็ตรหัสผ่าน โปรดตรวจสอบลิงก์ของคุณ');
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    const currentTime = Date.now();
    
    if (isSubmitting || (currentTime - lastSubmitTimeRef.current) < throttleTimeMs) {
      setGeneralError(`กรุณารอสักครู่ก่อนส่งข้อมูลอีกครั้ง (${Math.ceil((throttleTimeMs - (currentTime - lastSubmitTimeRef.current)) / 1000)} วินาที)`);
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);
    lastSubmitTimeRef.current = currentTime;

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token,
          password: formData.password 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน');
      }

      setSuccess('รีเซ็ตรหัสผ่านสำเร็จแล้ว');
      setFormData({ password: '', confirmPassword: '' });
    } catch (err: any) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
      
      submitTimeoutRef.current = setTimeout(() => {
        setIsSubmitting(false);
      }, throttleTimeMs);
    }
  };

  // ฟังก์ชันสลับการแสดงรหัสผ่าน
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // ฟังก์ชันสลับการแสดงยืนยันรหัสผ่าน
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full md:w-1/2 flex items-center justify-center relative">
        <div className="relative w-full h-full">
          <Image 
            src="/login/dog.png"
            alt="Cute dogs"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 bg-white">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            รีเซ็ตรหัสผ่าน
          </h2>
          
          <div className="text-lg text-gray-600 mb-8">
            กรุณากรอกรหัสผ่านใหม่ของคุณ
          </div>
          
          {!isTokenValid ? (
            <div className="p-4 bg-red-100 text-red-700 rounded-md mb-6">
              ไม่พบ token สำหรับการรีเซ็ตรหัสผ่าน โปรดตรวจสอบลิงก์ของคุณหรือขอลิงก์รีเซ็ตรหัสผ่านใหม่
              <div className="mt-6 text-center">
                <Link href="/forgot-password" className="text-lg text-[#FFBA60] hover:text-[#FFBA20]">
                  ขอลิงก์รีเซ็ตรหัสผ่านใหม่
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="mb-6">
              <div className="p-4 bg-green-100 text-green-700 rounded-md">
                {success}
              </div>
              <div className="mt-6 text-center">
                <Link href="/login" className="text-lg text-[#FFBA60] hover:text-[#FFBA20]">
                  กลับไปยังหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                  รหัสผ่านใหม่
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg`}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg`}
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-base font-medium text-gray-700 mb-2">
                  รหัสผ่านของคุณต้องประกอบด้วย:
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full ${hasMinLength ? 'bg-green-100 text-green-500' : 'bg-gray-200 text-gray-400'}`}>
                      {hasMinLength ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                    <span className="ml-2 text-sm text-gray-700">อย่างน้อย 6 ตัวอักษร</span>
                  </li>
                  
                  <li className="flex items-center">
                    <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full ${hasNumber ? 'bg-green-100 text-green-500' : 'bg-gray-200 text-gray-400'}`}>
                      {hasNumber ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                    <span className="ml-2 text-sm text-gray-700">เป็นตัวเลข</span>
                  </li>
                </ul>
              </div>
              
              {generalError && (
                <div className="p-2 text-center text-red-600 bg-red-100 rounded">
                  {generalError}
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={loading || isSubmitting || !hasMinLength || !hasNumber}
                  className="cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-[#FFBA60] hover:bg-[#FFBA20] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}