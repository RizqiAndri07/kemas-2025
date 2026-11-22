import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { LoginForm } from "@/modules/auth/presentation/components/login-form";

export const metadata: Metadata = {
  title: "Masuk - Kemas Prasasti 2025",
  description: "Masuk ke Panel Administrasi dan CMS Kemas Prasasti 2025",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-background selection:bg-primary/20">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Bar / Back to Public Site */}
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 px-3 rounded-lg border border-border/60 bg-card/40 backdrop-blur-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Website</span>
        </Link>
      </div>

      {/* Main Login Container */}
      <div className="w-full max-w-md z-10 flex flex-col items-center gap-6">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-heading font-bold text-lg tracking-tight text-foreground">
              Kemas Prasasti
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Admin & CMS Panel 2025
            </span>
          </div>
        </div>

        {/* Login Form Card wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="flex h-64 w-full items-center justify-center rounded-xl border border-border/70 bg-card/90">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>

        {/* Footer info */}
        <p className="text-xs text-muted-foreground/80 text-center">
          &copy; {new Date().getFullYear()} Kemas Prasasti. Dilindungi oleh Supabase Auth & Rate Limiter.
        </p>
      </div>
    </div>
  );
}
