import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { options } from "@/app/api/auth/[...nextauth]/option"; 
import TopNavbar from "@/app/component/TopNavbar";

export default async function MissingPetLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(options);

  if (!session) {
    redirect("/login"); // redirect ถ้าไม่ได้ login
  }

  return (
   
      
      <main className="">
        {children}
      </main>

  );
}
