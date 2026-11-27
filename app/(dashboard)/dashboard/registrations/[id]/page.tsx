import { Metadata } from "next";
import Link from "next/link";
import { getRegistrationById } from "@/modules/registration/infrastructure/registration.repository";
import { RegistrationValidationView } from "@/modules/registration/presentation/components/registration-validation-view";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ShieldAlert } from "lucide-react";

interface RegistrationDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: RegistrationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const registration = await getRegistrationById(id);

  if (!registration) {
    return {
      title: "Data Pendaftar Tidak Ditemukan - Admin Dashboard",
    };
  }

  return {
    title: `Validasi Pendaftar ${registration.registrationNumber} - Admin Dashboard`,
    description: `Halaman detail dan validasi pendaftaran peserta ${registration.registrationNumber} kompetisi ${registration.competitionName}.`,
  };
}

export default async function RegistrationDetailPage({
  params,
}: RegistrationDetailPageProps) {
  const { id } = await params;
  const registration = await getRegistrationById(id);

  if (!registration) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center space-y-4 border-dashed">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-heading font-bold text-foreground">
              Data Pendaftar Tidak Ditemukan
            </h2>
            <p className="text-xs text-muted-foreground">
              Pendaftaran dengan ID &quot;{id}&quot; tidak ditemukan dalam database atau telah dihapus.
            </p>
          </div>
          <Link href="/dashboard/registrations">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Daftar Registrasi
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <RegistrationValidationView initialRegistration={registration} />;
}
