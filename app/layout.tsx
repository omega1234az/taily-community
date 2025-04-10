// layout.tsx (Server Component)
import { Kanit } from "next/font/google";
import "./globals.css";
import ClientSessionProvider from "./component/ClientSessionProvider";
import type { Metadata } from "next";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  title: 'หน้าแรก',
  icons: {
    icon: './login/dog.png', 
  },
  description: '...',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={`${kanit.className} antialiased`}>
        <ClientSessionProvider>{children}</ClientSessionProvider>
      </body>
    </html>
  );
}