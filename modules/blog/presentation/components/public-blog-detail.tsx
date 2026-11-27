"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { BlogSelect } from "../../infrastructure/blog.table";
import { PublicBlogCard } from "./public-blog-card";
import {
  formatBlogDate,
  estimateReadingTime,
  extractFirstImageFromHtml,
} from "../../domain/blog-utils";
import { createCommentAction } from "../../application/blog.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Share2,
  Copy,
  Check,
  MessageSquare,
  Send,
  User,
  Sparkles,
  BookOpen,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

interface CommentItem {
  id: string;
  name: string;
  email?: string | null;
  content: string;
  isApproved: boolean;
  createdAt: Date;
}

interface PublicBlogDetailProps {
  blog: BlogSelect & { comments?: CommentItem[] };
  relatedBlogs?: BlogSelect[];
}

export function PublicBlogDetail({ blog, relatedBlogs = [] }: PublicBlogDetailProps) {
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  // State form komentar
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");

  const formattedDate = formatBlogDate(blog.createdAt);
  const readingTime = estimateReadingTime(blog.description);
  const coverImage = extractFirstImageFromHtml(blog.description);

  // Komentar yang disetujui
  const approvedComments = (blog.comments || []).filter(
    (c) => c.isApproved !== false
  );

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Tautan artikel berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== "undefined") {
      const shareUrl = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`*${blog.title}*\n\nBaca artikel selengkapnya di: ${window.location.href}`);
      window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error("Nama dan isi komentar wajib diisi.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await createCommentAction(blog.id, {
          blogId: blog.id,
          name: name.trim(),
          email: email.trim() || undefined,
          content: content.trim(),
        });

        if (res.success) {
          toast.success(res.message || "Komentar berhasil dikirim dan akan tampil di artikel!");
          setName("");
          setEmail("");
          setContent("");
        } else {
          toast.error(res.error || "Gagal mengirim komentar.");
        }
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan sistem saat mengirim komentar.");
      }
    });
  };

  return (
    <article className="space-y-12">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">
            Beranda
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <Link href="/blog" className="hover:text-foreground transition-colors">
            Berita & Artikel
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-[320px]">
            {blog.title}
          </span>
        </div>

        <Link href="/blog">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 cursor-pointer">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Semua Artikel</span>
          </Button>
        </Link>
      </div>

      {/* Article Header */}
      <header className="space-y-5 max-w-4xl mx-auto">
        <div className="flex items-center gap-2.5 flex-wrap">
          {blog.tag && (
            <Badge className="bg-primary/10 text-primary border-primary/25 text-xs font-semibold px-3 py-1">
              {blog.tag}
            </Badge>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-heading font-bold text-foreground tracking-tight leading-tight">
          {blog.title}
        </h1>

        {/* Metadata & Share Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 pb-4 border-y border-border/60 text-xs text-muted-foreground">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{formattedDate}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{readingTime}</span>
            </div>
            {blog.commentStatus && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span>{approvedComments.length} Komentar</span>
                </div>
              </>
            )}
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">Bagikan:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500 font-semibold">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Salin Tautan</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleShareWhatsApp}
              className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Article Body Content */}
      <div className="max-w-4xl mx-auto p-6 sm:p-10">
        <div
          className="prose prose-neutral dark:prose-invert max-w-none text-foreground leading-relaxed text-sm sm:text-base prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground prose-h2:text-xl sm:prose-h2:text-2xl prose-h3:text-lg sm:prose-h3:text-xl prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-strong:text-foreground prose-blockquote:border-l-primary prose-blockquote:text-foreground prose-blockquote:bg-muted/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-img:rounded-2xl prose-img:border prose-img:border-border/60 prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: blog.description }}
        />
      </div>

      {/* Comments Section */}
      <section className="max-w-4xl mx-auto space-y-6 pt-6">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Komentar & Diskusi ({approvedComments.length})</span>
          </h3>
          {!blog.commentStatus && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Komentar Dinonaktifkan
            </Badge>
          )}
        </div>

        {blog.commentStatus ? (
          <div className="space-y-6">
            {/* Form Tambah Komentar */}
            <Card className="border-border/80 bg-card/60 backdrop-blur-xs">
              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Tuliskan Komentar Anda</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <form onSubmit={handleSubmitComment} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">
                        Nama Lengkap <span className="text-destructive">*</span>
                      </label>
                      <Input
                        placeholder="Masukkan nama Anda..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-9 text-xs"
                        disabled={isPending}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-foreground">
                        Email (Opsional, tidak dipublikasikan)
                      </label>
                      <Input
                        type="email"
                        placeholder="contoh@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-9 text-xs"
                        disabled={isPending}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Isi Komentar <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      placeholder="Bagikan tanggapan, pertanyaan, atau kesan Anda mengenai artikel ini..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      rows={3}
                      className="text-xs resize-none"
                      disabled={isPending}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="h-9 text-xs font-medium gap-1.5 cursor-pointer ml-auto flex items-center"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isPending ? "Mengirim..." : "Kirim Komentar"}</span>
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* List Komentar */}
            {approvedComments.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-border/70 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Belum ada komentar.</p>
                <p>Jadilah yang pertama memberikan tanggapan untuk artikel ini!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvedComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-4 rounded-2xl border border-border/70 bg-card/40 backdrop-blur-xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                          {comment.name.slice(0, 1).toUpperCase()}
                        </div>
                        <span className="font-semibold text-foreground">
                          {comment.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">
                        {formatBlogDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 pl-9 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-border/60 bg-muted/20 text-xs text-muted-foreground text-center">
            Kolom komentar telah dinonaktifkan oleh redaksi untuk artikel ini.
          </div>
        )}
      </section>

      {/* Related Blogs Carousel / Grid */}
      {relatedBlogs.length > 0 && (
        <section className="space-y-6 pt-10 border-t border-border/60">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span>Artikel Lainnya yang Menarik</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Rekomendasi bacaan seputar kompetisi, panduan, dan kegiatan Prasasti 2026.
              </p>
            </div>
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="text-xs gap-1 hidden sm:flex">
                <span>Lihat Semua</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedBlogs.slice(0, 3).map((item) => (
              <PublicBlogCard key={item.id} blog={item} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
