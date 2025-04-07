"use client";
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // ใช้ useEffect เพื่อรอให้ session พร้อมก่อนที่จะ redirect
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push("/");
      router.refresh();
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    try {
      // สังเกตว่าเปลี่ยนจาก "Credentials" เป็น "credentials" (ตัวพิมพ์เล็ก)
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        // เมื่อล็อกอินสำเร็จ นำทางไปยังหน้าอื่น (จะทำงานร่วมกับ useEffect)
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      console.error(error);
    }
  };

  // แสดง loading ระหว่างตรวจสอบ session
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
  }
  
  // ถ้ามี session อยู่แล้ว redirect ไปหน้าหลัก (เป็นการป้องกันเพิ่มเติม)
  if (status === "authenticated") {
    return null; // ไม่แสดงอะไรระหว่างการ redirect
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Head>
        <title>Sing Up - Login</title>
        <meta name="description" content="Login to your account" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Left side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-8 bg-white">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome back
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className=" text-lg text-blue-400 hover:text-blue-500">
              Signup
            </Link>
          </p>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-lg font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-lg font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-lg"
                />
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
              <button onClick={() => signIn("facebook")}
                type="button"
                className="cursor-pointer inline-flex justify-center items-center p-2 border border-gray-300 rounded-full shadow-sm bg-white hover:bg-gray-50"
              >
                <span className="sr-only">Sign in with Facebook</span>
                <svg className="h-10 w-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22,12c0-5.52-4.48-10-10-10S2,6.48,2,12c0,4.84,3.44,8.87,8,9.8V15H8v-3h2V9.5C10,7.57,11.57,6,13.5,6H16v3h-2 c-0.55,0-1,0.45-1,1v2h3v3h-3v6.95C18.05,21.45,22,17.19,22,12z" />
                </svg>
              </button>
              
              <button onClick={() => signIn("google")}
                type="button"
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
            </div>

            <div>
              {error && (
                <div className="mb-4 p-2 text-center text-red-600 bg-red-100 rounded">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Dog Image */}
      <div className="w-[50%]  flex items-center justify-center p-8 relative">
        <div className="relative w-full h-full ">
          <Image 
            src="/login/dog.png"
            alt="Cute dogs"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}