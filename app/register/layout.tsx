
import type { Metadata } from "next";

import { SessionProvider } from "next-auth/react";



export const metadata: Metadata = {
  title: 'สมัครสมาชิก',
  icons: {
    icon: './login/dog.png', 
  },
  description: '...',
}



export default function RegLayout({
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
