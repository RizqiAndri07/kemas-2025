"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitSetupPasswordAction } from "../../application/auth.actions";
import { toast } from "@/components/ui/sonner";

interface PasswordUpdateFormProps {
  token: string;
  title?: string;
  description?: string;
  isInitialSetup?: boolean;
}

export function PasswordUpdateForm({
  token,
  title = "Atur Kata Sandi Baru",
  description = "Masukkan kata sandi baru yang aman untuk akun Anda.",
  isInitialSetup = false,
}: PasswordUpdateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Requirements checks
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatching = password.length > 0 && password === confirmPassword;

  const isFormValid = hasMinLength && hasLetter && hasNumber && isMatching;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      const msg = "Token sesi tidak valid atau tidak ditemukan.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!isFormValid) {
      const msg = "Harap lengkapi semua syarat kata sandi.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    startTransition(async () => {
      try {
        const res = await submitSetupPasswordAction({
          token,
          password,
          confirmPassword,
        });

        if (!res.success) {
          const msg = res.error || "Gagal memperbarui kata sandi";
          setErrorMessage(msg);
          toast.error(msg);
          return;
        }

        setIsSuccess(true);
        toast.success(res.message || "Kata sandi berhasil diperbarui!");
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Terjadi kesalahan internal";
        setErrorMessage(msg);
        toast.error(msg);
      }
    });
  };

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto border-border shadow-xl backdrop-blur-md bg-card/90">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-xl font-bold font-heading text-foreground">
            Kata Sandi Berhasil Disimpan!
          </CardTitle>
          <CardDescription className="text-sm">
            {isInitialSetup
              ? "Akun Anda telah sepenuhnya dikonfigurasi dan siap digunakan."
              : "Kata sandi baru Anda telah aktif. Silakan masuk menggunakan kata sandi yang baru."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 text-center">
          <Link href="/login" className="w-full block">
            <Button className="w-full h-10 font-semibold cursor-pointer">
              <span>Menuju Halaman Login</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-border shadow-xl backdrop-blur-md bg-card/90">
      <CardHeader className="text-center pb-3">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <KeyRound className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-bold font-heading text-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {errorMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kata Sandi Baru */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">
              Kata Sandi Baru <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isPending}
                className="pl-9 pr-10 h-9 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-medium">
              Konfirmasi Kata Sandi <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isPending}
                className="pl-9 pr-10 h-9 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Checklist Ketentuan Password */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5 text-[11px]">
            <p className="font-semibold text-muted-foreground mb-1">
              Ketentuan Kata Sandi:
            </p>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] ${
                  hasMinLength
                    ? "bg-emerald-500 text-white"
                    : "bg-muted-foreground/30 text-background"
                }`}
              >
                ✓
              </span>
              <span className={hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
                Minimal 8 karakter
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] ${
                  hasLetter
                    ? "bg-emerald-500 text-white"
                    : "bg-muted-foreground/30 text-background"
                }`}
              >
                ✓
              </span>
              <span className={hasLetter ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
                Memuat huruf (A-Z, a-z)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] ${
                  hasNumber
                    ? "bg-emerald-500 text-white"
                    : "bg-muted-foreground/30 text-background"
                }`}
              >
                ✓
              </span>
              <span className={hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
                Memuat angka (0-9)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] ${
                  isMatching
                    ? "bg-emerald-500 text-white"
                    : "bg-muted-foreground/30 text-background"
                }`}
              >
                ✓
              </span>
              <span className={isMatching ? "text-emerald-600 dark:text-emerald-400 font-medium" : ""}>
                Kedua kata sandi cocok
              </span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-9 text-sm font-semibold cursor-pointer"
            disabled={isPending || !isFormValid}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Menyimpan..." : "Simpan Kata Sandi"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="pt-0 justify-center">
        <Link
          href="/login"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Kembali ke Halaman Login
        </Link>
      </CardFooter>
    </Card>
  );
}
