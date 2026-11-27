"use client";

import Link from "next/link";
import { BlogSelect } from "../../infrastructure/blog.table";
import {
  extractFirstImageFromHtml,
  stripHtmlToText,
  estimateReadingTime,
  formatBlogDate,
} from "../../domain/blog-utils";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Newspaper,
  Sparkles,
  Trophy,
  GraduationCap,
  Gamepad2,
  Music,
} from "lucide-react";

interface PublicBlogCardProps {
  blog: BlogSelect;
}

export function PublicBlogCard({ blog }: PublicBlogCardProps) {
  const coverImage = extractFirstImageFromHtml(blog.description);
  const excerpt = stripHtmlToText(blog.description, 140);
  const readingTime = estimateReadingTime(blog.description);
  const formattedDate = formatBlogDate(blog.createdAt);

  const getTagIcon = (tag?: string | null) => {
    const lower = (tag || "").toLowerCase();
    if (lower.includes("kompetisi") || lower.includes("lomba")) {
      return <Trophy className="h-3.5 w-3.5" />;
    }
    if (lower.includes("pendidikan") || lower.includes("try out") || lower.includes("snbt")) {
      return <GraduationCap className="h-3.5 w-3.5" />;
    }
    if (lower.includes("esport") || lower.includes("game") || lower.includes("mlbb")) {
      return <Gamepad2 className="h-3.5 w-3.5" />;
    }
    if (lower.includes("seni") || lower.includes("musik") || lower.includes("dance")) {
      return <Music className="h-3.5 w-3.5" />;
    }
    if (lower.includes("festival") || lower.includes("event")) {
      return <Sparkles className="h-3.5 w-3.5" />;
    }
    return <Newspaper className="h-3.5 w-3.5" />;
  };

  return (
    <Card className="group flex flex-col justify-between overflow-hidden border-border/80 bg-card/60 backdrop-blur-xs hover:border-primary/50 hover:shadow-lg transition-all duration-300">
      {/* Thumbnail / Header Media */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
        {coverImage ? (
          <img
            src={coverImage}
            alt={blog.title}
            loading="lazy"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-primary/15 via-secondary/10 to-accent/20 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/10 rounded-full blur-xl pointer-events-none" />
            <div className="h-12 w-12 rounded-2xl bg-background/80 border border-border/60 shadow-xs flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
              {getTagIcon(blog.tag)}
            </div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest font-mono">
              PRASASTI 2026
            </span>
          </div>
        )}

        {/* Floating Tag Badge */}
        {blog.tag && (
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-md border border-border/60 text-xs font-medium gap-1 px-2.5 py-1 shadow-xs"
            >
              {getTagIcon(blog.tag)}
              <span>{blog.tag}</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Card Content */}
      <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          {/* Metadata: Tanggal & Estimasi Waktu Baca */}
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-primary" />
              <span>{formattedDate}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>{readingTime}</span>
            </div>
          </div>

          {/* Judul Artikel */}
          <Link href={`/blog/${blog.id}`} className="block group/link">
            <h3 className="text-base sm:text-lg font-heading font-bold text-foreground leading-snug line-clamp-2 group-hover/link:text-primary transition-colors">
              {blog.title}
            </h3>
          </Link>

          {/* Cuplikan Teks */}
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {excerpt || "Klik tombol baca di bawah untuk menyimak ulasan dan rincian lengkap artikel ini."}
          </p>
        </div>
      </CardContent>

      {/* Card Footer with Read Button */}
      <CardFooter className="p-5 pt-0 border-t border-border/40 mt-auto flex items-center justify-between">
        <Link href={`/blog/${blog.id}`} className="w-full">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs font-medium gap-1.5 cursor-pointer hover:bg-primary hover:text-primary-foreground group-hover:border-primary/50 transition-all justify-center"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Baca Selengkapnya</span>
            <ArrowRight className="h-3.5 w-3.5 ml-0.5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
