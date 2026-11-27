import React from "react";
import { Metadata } from "next";
import { getAllBlogs } from "@/modules/blog/infrastructure/blog.repository";
import { PublicBlogCatalog } from "@/modules/blog/presentation/components/public-blog-catalog";
import { Newspaper, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Berita & Artikel Resmi - PRASASTI 2026",
  description:
    "Kumpulan berita, rilis pengumuman, panduan kompetisi, dan artikel resmi seputar rangkaian kegiatan Kemas Prasasti 2026 UNS Sukoharjo.",
  keywords: [
    "blog prasasti",
    "berita prasasti",
    "artikel prasasti 2026",
    "kemas uns",
    "futsal prasasti",
    "tryout snbt",
    "mlbb turnamen",
    "festival prasasti",
  ],
};

export default async function BlogLandingPage() {
  const blogs = await getAllBlogs();

  return (
    <div className="container mx-auto px-4 py-24 sm:py-28 max-w-7xl space-y-12">
      {/* Blog Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge
            variant="outline"
            className="px-3.5 py-1 text-xs font-semibold gap-1.5 border-primary/30 bg-primary/5 text-primary rounded-full shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Kabar & Edukasi Prasasti</span>
          </Badge>
        </div>

        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-foreground tracking-tight leading-tight">
          Berita, Wawasan & Informasi Terkini
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Simak rilis resmi, panduan persiapan lomba, informasi teknis pertandingan, serta artikel seputar perjalanan satu dekade Kemas Prasasti 2026.
        </p>
      </div>

      {/* Interactive Catalog (Search, Sort, Filter, Cards) */}
      <PublicBlogCatalog initialBlogs={blogs} />
    </div>
  );
}
