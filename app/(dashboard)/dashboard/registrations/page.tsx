import { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { RegistrationsTable } from "@/modules/registration/presentation/components/registrations-table";
import {
  getRegistrations,
  getRegistrationStats,
} from "@/modules/registration/infrastructure/registration.repository";
import { getAllCompetitions } from "@/modules/competition/infrastructure/competition.repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Data Pendaftar - Admin Dashboard",
  description:
    "Manajemen data pendaftar kompetisi, verifikasi berkas, dan filter pendaftaran Kemas Prasasti 2025",
};

export default async function RegistrationsPage() {
  const [registrationsResult, competitions, stats] = await Promise.all([
    getRegistrations({ limit: 200 }),
    getAllCompetitions(),
    getRegistrationStats(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Data Pendaftar"
        description="Kelola dan verifikasi pendaftaran peserta kompetisi, filter per cabang lomba, periksa bukti bayar, dan pantau status kelolosan."
      />

      <RegistrationsTable
        initialRegistrations={registrationsResult.data}
        competitions={competitions.map((c) => ({ id: c.id, name: c.name }))}
        initialStats={stats}
      />
    </div>
  );
}
