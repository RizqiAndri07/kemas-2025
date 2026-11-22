import { getAllBlogs } from "@/modules/blog/infrastructure/blog.repository";
import { BlogTable } from "@/modules/blog/presentation/components/blog-table";
import { PageHeader } from "@/components/dashboard/PageHeader";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const blogs = await getAllBlogs();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Artikel & Berita"
        description="Kelola publikasi artikel, pengumuman, dan liputan kegiatan Kemas Prasasti 2025."
      />
      <BlogTable blogs={blogs} />
    </div>
  );
}
