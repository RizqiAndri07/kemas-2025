import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ competitionId: string }>;
}

export default async function RegisterRedirectPage({ params }: Props) {
  const { competitionId } = await params;
  if (!competitionId) {
    redirect("/competition");
  }
  redirect(`/competition/${competitionId}/register`);
}