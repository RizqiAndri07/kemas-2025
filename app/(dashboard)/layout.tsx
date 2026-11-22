import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard - Kemas Prasasti 2025",
  description: "Panel Administrasi dan CMS Kemas Prasasti 2025",
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className={`${jakartaSans.variable} font-sans antialiased bg-background text-foreground`}
      >
        <SidebarProvider defaultOpen={true}>
          <DashboardSidebar />
          <SidebarInset className="min-w-0">
            <DashboardHeader />
            <main className="flex-1 p-4 md:p-8 w-full mx-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
