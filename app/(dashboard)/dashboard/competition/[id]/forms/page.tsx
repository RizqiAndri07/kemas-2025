import { redirect } from "next/navigation";

interface CompetitionFormsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CompetitionFormsRedirectPage({
  params,
}: CompetitionFormsPageProps) {
  const { id } = await params;
  // Relasi 1:1: Halaman daftar formulir dialihkan langsung ke direct builder
  redirect(`/dashboard/competition/${id}/form`);
}
