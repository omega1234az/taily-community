"use client"

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "รูปแบบอีเมลไม่ถูกต้อง" }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSubmitTimeRef = useRef<number>(0);
  const throttleTimeMs = 3000; // ระยะเวลาที่ต้องรอระหว่างการส่งฟอร์ม (3 วินาที)

  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current);
      }
    };
  }, []);

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
      forgotPasswordSchema.parse(formData);
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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'เกิดข้อผิดพลาดในการส่งคำขอรีเซ็ตรหัสผ่าน');
      }

      setSuccess('ส่งลิงก์สำหรับรีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ');
      setFormData({ email: '' });
    } catch (err: any) {
      setGeneralError(err.message);
    } finally {
      setLoading(false);
      
      submitTimeoutRef.current = setTimeout(() => {
        setIsSubmitting(false);
      }, throttleTimeMs);
    }
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
            ลืมรหัสผ่าน
          </h2>
          
          <div className="text-lg text-gray-600 mb-8">
            กรอกอีเมล์ของคุณเพื่อกู้คืนรหัสผ่านของคุณ
          </div>
          
          {success ? (
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
                <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                  อีเมล
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>
              
              {generalError && (
                <div className="p-2 text-center text-red-600 bg-red-100 rounded">
                  {generalError}
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-[#FFBA60] hover:bg-[#FFBA20] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'กำลังดำเนินการ...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <Link href="/login" className="text-lg text-[#FFBA60] hover:text-[#FFBA20]">
                  กลับไปยังหน้าเข้าสู่ระบบ
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
}