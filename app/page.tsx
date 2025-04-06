
"use client"
import { useSession, signIn, signOut} from "next-auth/react";
import { redirect } from "next/navigation";


import { getToken } from "next-auth/jwt";

export default function Home() {
  const { data: session } = useSession();
  if (!session) {
    redirect("/login");
  }
  console.log(session);
  return (<>

    <img
      className="h-8 w-8 rounded-full"
      src={session.user?.image || ""}
      alt="User Profile"
    />
    <p>{session.user?.name || ""}</p>
    <p>{session.user?.role || ""}</p>
    <button onClick={() => signOut()} className="px-5 py-2 bg-red-400 ">ออกจากระบบ</button>
  </>

  );
}
