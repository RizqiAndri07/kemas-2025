import { PageHeader } from "@/components/dashboard/PageHeader";
import { ContactPersonTable } from "@/modules/competition/presentation/components/contact-person-table";
import { getAllContactPersons } from "@/modules/competition/infrastructure/contact-person.repository";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact Person Kompetisi - Admin Dashboard",
  description: "Manajemen narahubung panitia untuk seluruh cabang perlombaan dan event Kemas Prasasti 2025",
};

export default async function ContactPersonPage() {
  const contactPersons = await getAllContactPersons();

  return (
    <div className="space-y-6 w-full">
      <PageHeader
        title="Manajemen Contact Person"
        description="Kelola narahubung panitia (CP) yang dapat dikaitkan dengan berbagai cabang perlombaan dan kegiatan event."
      />
      <ContactPersonTable initialData={contactPersons} />
    </div>
  );
}
