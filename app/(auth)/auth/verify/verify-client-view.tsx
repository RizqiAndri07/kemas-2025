"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Check, MailCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordUpdateForm } from "@/modules/auth/presentation/components/password-update-form";

interface VerifyClientViewProps {
  data: {
    username: string;
    email: string;
    randomPassword: string;
    setupToken: string;
  };
}

export function VerifyClientView({ data }: VerifyClientViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.randomPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Box Notifikasi Akun Berhasil Diverifikasi & Kata Sandi Acak */}
      <Card className="border-border shadow-xl backdrop-blur-md bg-card/90">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-bold font-heading text-foreground">
            Akun Berhasil Diverifikasi! 🎉
          </CardTitle>
          <CardDescription className="text-xs">
            Selamat datang, <strong className="text-foreground">@{data.username}</strong> ({data.email}). Akun Anda kini aktif!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-1">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-center space-y-1.5">
            <p className="text-[11px] font-medium text-muted-foreground">
              Kata Sandi Acak Sementara Anda:
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-base font-mono font-bold tracking-wider px-2.5 py-1 rounded-md bg-background border border-border text-foreground select-all">
                {data.randomPassword}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 cursor-pointer"
                onClick={handleCopy}
                title="Salin Kata Sandi"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </Button>
            </div>
            {copied && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                Kata sandi berhasil disalin ke clipboard!
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
            <MailCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Email konfirmasi dan salinan kata sandi acak di atas juga telah dikirimkan ke <strong>{data.email}</strong>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Form Update Password Mandiri */}
      <PasswordUpdateForm
        token={data.setupToken}
        title="Atur Kata Sandi Baru Anda"
        description="Silakan masukkan kata sandi baru pilihan Anda untuk menggantikan kata sandi acak di atas."
        isInitialSetup={true}
      />
    </div>
  );
}
