// layout.tsx (Server Component)
import { Kanit } from "next/font/google";
import "./globals.css";
import ClientSessionProvider from "./component/ClientSessionProvider";

const kanit = Kanit({
  subsets: ["thai", "latin"],
  weight: ["300", "400"],
});

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