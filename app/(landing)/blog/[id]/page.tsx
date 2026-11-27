import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogById, getAllBlogs } from "@/modules/blog/infrastructure/blog.repository";
import { PublicBlogDetail } from "@/modules/blog/presentation/components/public-blog-detail";
import { stripHtmlToText, extractFirstImageFromHtml } from "@/modules/blog/domain/blog-utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const blog = await getBlogById(id);

  if (!blog) {
    return {
      title: "Artikel Tidak Ditemukan - PRASASTI 2026",
    };
  }

  const excerpt = stripHtmlToText(blog.description, 160);
  const coverImage = extractFirstImageFromHtml(blog.description);

  return {
    title: `${blog.title} - PRASASTI 2026`,
    description: excerpt,
    keywords: [
      blog.tag || "berita",
      "prasasti 2026",
      "kemas uns",
      "artikel",
      "kompetisi",
    ],
    openGraph: {
      title: blog.title,
      description: excerpt,
      type: "article",
      images: coverImage ? [{ url: coverImage }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;
  const blog = await getBlogById(id);

  if (!blog) {
    return (
      <div className="container mx-auto px-4 py-32 max-w-lg text-center">
        <Card className="p-8 space-y-4 border-dashed bg-card/60 backdrop-blur-md">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Newspaper className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-heading font-bold text-foreground">
              Artikel Tidak Ditemukan
            </h2>
            <p className="text-xs text-muted-foreground">
              Artikel yang Anda cari tidak tersedia, belum dipublikasikan, atau telah dihapus oleh redaksi.
            </p>
          </div>
          <Link href="/blog">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 cursor-pointer">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Halaman Blog</span>
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Ambil artikel terkait lainnya untuk rekomendasi bacaan
  const allBlogs = await getAllBlogs();
  const relatedBlogs = allBlogs.filter(
    (b) => b.id !== id && b.status === "PUBLIC"
  );

  return (
    <div className="container mx-auto px-4 py-24 sm:py-28 max-w-5xl">
      <PublicBlogDetail blog={blog as any} relatedBlogs={relatedBlogs} />
    </div>
  );
}
