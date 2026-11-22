import { notFound } from "next/navigation";
import { getBlogById } from "@/modules/blog/infrastructure/blog.repository";
import { BlogForm } from "@/modules/blog/presentation/components/blog-form";

interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;
  const blog = await getBlogById(id);

  if (!blog) {
    notFound();
  }

  return <BlogForm initialData={blog} isEdit />;
}
