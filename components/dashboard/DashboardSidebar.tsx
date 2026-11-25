"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Trophy,
  Users,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Tag,
  Clock,
  LayoutGrid,
  PhoneCall,
  FileSpreadsheet,
  LogOut,
  Loader2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { logoutAction } from "@/modules/auth/application/auth.actions";
import { toast } from "@/components/ui/sonner";

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  // Cek apakah rute saat ini berada di bawah Events / Competition
  const isEventsActive = pathname.startsWith("/dashboard/competition");
  const [eventsOpen, setEventsOpen] = useState(isEventsActive);

  // Buka dropdown secara otomatis jika panitia menavigasi ke rute Events
  useEffect(() => {
    if (isEventsActive) {
      setEventsOpen(true);
    }
  }, [isEventsActive]);

  const handleLogout = () => {
    startLogoutTransition(async () => {
      const res = await logoutAction();
      if (res.success) {
        toast.success(res.message || "Berhasil keluar (logout)");
      } else {
        toast.error(res.error || "Gagal melakukan logout");
      }
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <Sidebar collapsible="icon" className="">
      {/* Brand Header */}
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex flex-col gap-0.5 text-left leading-none">
                <span className="font-heading font-bold text-sm tracking-tight text-foreground">
                  Kemas Prasasti
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Admin Panel 2025
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>


      {/* Main Navigation Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* 1. Overview */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/dashboard"}
                  tooltip="Overview"
                  render={<Link href="/dashboard" />}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 2. Manajemen Blog */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/dashboard/blog")}
                  tooltip="Manajemen Blog"
                  render={<Link href="/dashboard/blog" />}
                >
                  <FileText className="h-4 w-4" />
                  <span>Manajemen Blog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 3. Events Dropdown (Kompetisi, Presale, Bracket, Rundown) */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isEventsActive}
                  tooltip="Events & Turnamen"
                  onClick={() => setEventsOpen(!eventsOpen)}
                  className="cursor-pointer justify-between group/events"
                >
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium">Events</span>
                  </div>
                  {eventsOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
                  )}
                </SidebarMenuButton>

                {eventsOpen && (
                  <SidebarMenuSub className="my-1 border-l border-border/60 pl-3">
                    {/* Sub 1: Katalog Event */}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={pathname === "/dashboard/competition" || pathname === "/dashboard/competition/create"}
                        render={<Link href="/dashboard/competition" />}
                      >
                        <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                        <span>Katalog Event</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    {/* Sub 2: Formulir Pendaftaran */}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={pathname.startsWith("/dashboard/competition/forms") || (pathname.startsWith("/dashboard/competition/") && (pathname.includes("/forms") || pathname.includes("/form")))}
                        render={<Link href="/dashboard/competition/forms" />}
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 mr-1" />
                        <span>Formulir Pendaftaran</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    {/* Sub 2: Bracket */}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={pathname.startsWith("/dashboard/competition/bracket")}
                        render={<Link href="/dashboard/competition/bracket" />}
                      >
                        <Trophy className="h-3.5 w-3.5 mr-1" />
                        <span>Bracket</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    {/* Sub 3: Rundown */}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={pathname.startsWith("/dashboard/competition/rundown")}
                        render={<Link href="/dashboard/competition/rundown" />}
                      >
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>Rundown</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>

                    {/* Sub 4: Contact Person */}
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        isActive={pathname.startsWith("/dashboard/competition/contact-person")}
                        render={<Link href="/dashboard/competition/contact-person" />}
                      >
                        <PhoneCall className="h-3.5 w-3.5 mr-1" />
                        <span>Contact Person</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* 4. Data Pendaftar */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/dashboard/registrations")}
                  tooltip="Data Pendaftar"
                  render={<Link href="/dashboard/registrations" />}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Data Pendaftar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* 5. Kelola Pengguna */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/dashboard/users")}
                  tooltip="Kelola Pengguna"
                  render={<Link href="/dashboard/users" />}
                >
                  <Users className="h-4 w-4" />
                  <span>Kelola Pengguna</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Navigation */}
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Buka Website Publik"
              render={<Link href="/" target="_blank" />}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Website Publik</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Keluar (Logout)"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive transition-colors"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span>{isLoggingOut ? "Mengeluarkan..." : "Keluar"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* Resizable / Collapsible Rail */}
      <SidebarRail />
    </Sidebar>
  );
}
