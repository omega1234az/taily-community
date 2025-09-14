"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';
import { z } from 'zod';


const loginSchema = z.object({
  email: z.string()
    .email({ message: "รูปแบบอีเมลไม่ถูกต้อง" })
    .min(1, { message: "กรุณากรอกอีเมล" }),
  password: z.string()
    .min(8, { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" })
});


type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/");
      router.refresh();
    }
  }, [session, status, router]);

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
      loginSchema.parse(formData);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError("");
    
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      
      if (result?.error) {
        setGeneralError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setGeneralError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  const getErrorMessage = (field: keyof LoginFormData) => {
    return errors[field] || '';
  };
  
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
  }
  
  if (status === "authenticated") {
    return null; 
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 bg-white">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            เข้าสู่ระบบ
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            ยังไม่มี Account?{' '}
            <Link href="/register" className="text-lg text-blue-400 hover:text-blue-500">
              สมัครสมาชิก
            </Link>
          </p>
          
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

            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg`}
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-blue-400 hover:text-blue-500">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-sm w-full">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              
              
              <button 
                type="button" 
                onClick={() => signIn("google", { callbackUrl: '/' })}
                className="cursor-pointer inline-flex justify-center items-center p-2 border border-gray-300 rounded-full shadow-sm bg-white hover:bg-gray-50"
              >
                <span className="sr-only">Sign in with Google</span>
                <svg className="h-10 w-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                </svg>
              </button>
              <button 
                type="button" 
                onClick={() => signIn("line", { callbackUrl: '/' })}
                className="cursor-pointer inline-flex justify-center items-center p-2 border border-gray-300 rounded-full shadow-sm bg-white hover:bg-gray-50"
              >
                <span className="sr-only">Sign in with Line</span>
                <img className='h-10 w-10' src="login/line.png" alt="" />
              </button>
              
            </div>

            <div>
              {generalError && (
                <div className="mb-4 p-2 text-center text-red-600 bg-red-100 rounded">
                  {generalError}
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLoading ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ'}
              </button>
            </div>
          </form>
        </div>
      </div>
            
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
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
    </motion.div>
  );
}