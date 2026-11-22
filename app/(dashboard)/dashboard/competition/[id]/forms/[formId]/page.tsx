import { redirect } from "next/navigation";

interface FormBuilderPageProps {
  params: Promise<{
    id: string;
    formId: string;
  }>;
}

export default async function LegacyFormBuilderPage({ params }: FormBuilderPageProps) {
  const { id } = await params;
  redirect(`/dashboard/competition/${id}/form`);
}
