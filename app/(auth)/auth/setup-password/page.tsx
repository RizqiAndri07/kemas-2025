import Link from "next/link";
import { AlertCircle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { checkTokenValidityAction } from "@/modules/auth/application/auth.actions";
import { TokenType } from "@/modules/auth/domain/token-type.enum";
import { PasswordUpdateForm } from "@/modules/auth/presentation/components/password-update-form";

export const dynamic = "force-dynamic";

interface SetupPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function SetupPasswordPage({
  searchParams,
}: SetupPasswordPageProps) {
  const params = await searchParams;
  const token = params?.token;

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="w-full max-w-md">
          <Card className="border-border shadow-xl backdrop-blur-md bg-card/90">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl font-bold font-heading text-foreground">
                Tautan Tidak Valid
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Parameter token tidak ditemukan pada tautan pengaturan kata sandi.
              </CardDescription>
            </CardHeader>
            <CardFooter className="pt-4">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full text-xs cursor-pointer">
                  Kembali ke Halaman Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Validasi token di server
  const validity = await checkTokenValidityAction(token, TokenType.PASSWORD_RESET);

  if (!validity.success) {
    const isExpired = validity.code === "EXPIRED";
    const isAlreadyUsed = validity.code === "ALREADY_USED";

    return (
      <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="w-full max-w-md">
          <Card className="border-border shadow-xl backdrop-blur-md bg-card/90">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                {isExpired ? (
                  <Clock className="h-8 w-8 text-amber-500" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-destructive" />
                )}
              </div>
              <CardTitle className="text-xl font-bold font-heading text-foreground">
                {isExpired
                  ? "Email Expired (Tautan Kedaluwarsa)"
                  : "Tautan Tidak Valid"}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {isExpired
                  ? "Tautan pembaruan kata sandi telah melewati batas waktu 12 jam."
                  : isAlreadyUsed
                  ? "Tautan ini tidak valid karena sudah pernah digunakan untuk memperbarui kata sandi."
                  : "Tautan tidak dikenali di sistem."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive leading-relaxed font-medium">
                {validity.error}
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>Informasi Penting:</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {isExpired
                    ? "Tautan pengaturan kata sandi berlaku selama 12 jam. Silakan hubungi Superadmin untuk mengirimkan tautan baru."
                    : isAlreadyUsed
                    ? "Kata sandi Anda sudah berhasil diperbarui sebelumnya. Silakan langsung login menggunakan kata sandi yang telah Anda tetapkan."
                    : "Pastikan Anda menggunakan tautan resmi yang dikirimkan ke email Anda."}
                </p>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full text-xs cursor-pointer">
                  Menuju Halaman Login
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  // Token valid
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="w-full max-w-md">
        <PasswordUpdateForm
          token={token}
          title="Perbarui Kata Sandi Anda"
          description={`Halo @${validity.data?.username}, masukkan kata sandi baru pilihan Anda untuk mengamankan akun.`}
          isInitialSetup={true}
        />
      </div>
    </div>
  );
}
