
"use client"
import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";
export default function Home() {
  const { data: session } = useSession();
  if (!session) {
    redirect("/login");
  }
  return (<>

    <img
      className="h-8 w-8 rounded-full"
      src={session.user?.image || ""}
      alt="User Profile"
    />
  </>

  );
}
