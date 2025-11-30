import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dashboard kemasuns",
  description: "dashboard prasasti kemas uns",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakartaSans.variable} antialiased bg-zinc-100 font-sans`}
      >
        <main className="min-h-screen scroll-smooth ">
          {children}
        </main>
      </body>
    </html>
  );
}
