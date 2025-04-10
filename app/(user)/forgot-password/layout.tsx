
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";



export const metadata: Metadata = {
  title: 'ลิมรหัสผ่าน',
  icons: {
    icon: './login/dog.png', 
  },
  description: '...',
}



export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <>
      {children}
      </>
      
     
  );
}
