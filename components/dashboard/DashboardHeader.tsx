"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, LogOut, Shield, UserCheck, Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";
import {
  getCurrentSessionUser,
  logoutAction,
  SessionUserInfo,
} from "@/modules/auth/application/auth.actions";

interface DashboardHeaderProps {
  title?: string;
  description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<SessionUserInfo | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getCurrentSessionUser().then((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/login");
      router.refresh();
    });
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "SUPERADMIN":
        return (
          <Badge
            variant="outline"
            className="hidden sm:inline-flex items-center gap-1.5 border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium text-xs px-2.5 py-1"
          >
            <Shield className="h-3 w-3" />
            Superadmin
          </Badge>
        );
      case "ADMIN":
        return (
          <Badge
            variant="outline"
            className="hidden sm:inline-flex items-center gap-1.5 border-sky-500/20 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium text-xs px-2.5 py-1"
          >
            <UserCheck className="h-3 w-3" />
            Admin
          </Badge>
        );
      case "CMS_WRITER":
        return (
          <Badge
            variant="outline"
            className="hidden sm:inline-flex items-center gap-1.5 border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-xs px-2.5 py-1"
          >
            CMS Writer
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="hidden sm:inline-flex items-center gap-1.5 border-primary/20 bg-primary/10 text-primary font-medium text-xs px-2.5 py-1"
          >
            <Shield className="h-3 w-3" />
            Panitia
          </Badge>
        );
    }
  };

  const displayName = currentUser?.username || "Admin Kemas";
  const displayEmail = currentUser?.email || "panitia@kemasprasasti.com";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-border bg-card/80 px-4 md:px-8 backdrop-blur-md">
      {/* Left: Official Shadcn SidebarTrigger & Title */}
      <div className="flex items-center gap-3">

        {title && (
          <div className="hidden sm:flex flex-col">
            <h1 className="text-base font-semibold leading-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
      </div>

      {/* Right: Role Badge, Theme Toggle, Notifications & Profile Dropdown */}
      <div className="flex items-center gap-3">
        {getRoleBadge(currentUser?.role)}

        {/* Theme Toggle Mode */}
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground h-9 w-9"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
        </Button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({
              variant: "ghost",
              className: "flex items-center gap-2 px-2 hover:bg-muted cursor-pointer",
            })}
          >
            <Avatar className="h-8 w-8 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:inline-block text-xs font-medium text-foreground">
              {displayName}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold truncate">{displayName}</span>
              <span className="text-xs text-muted-foreground font-normal truncate">
                {displayEmail}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" disabled>
              <User className="mr-2 h-4 w-4" />
              <span>Profil Akun</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isPending}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-4 w-4" />
              )}
              <span>{isPending ? "Mengeluarkan..." : "Keluar (Logout)"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
