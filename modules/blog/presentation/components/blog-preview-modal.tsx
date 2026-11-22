"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Monitor,
  Tablet,
  Smartphone,
  Calendar,
  Clock,
  MessageSquare,
  Send,
  Save,
  Loader2,
  CheckCircle2,
  Eye,
  X,
  Globe,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewportMode = "desktop" | "tablet" | "mobile";

export interface BlogPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  tags?: string[];
  status?: "PUBLIC" | "PRIVATE";
  commentStatus?: boolean;
  createdAt?: Date | string;
  onPublish?: () => void;
  isPending?: boolean;
  isEdit?: boolean;
}

export function BlogPreviewModal({
  open,
  onOpenChange,
  title,
  description,
  tags = [],
  status = "PUBLIC",
  commentStatus = true,
  createdAt,
  onPublish,
  isPending = false,
  isEdit = false,
}: BlogPreviewModalProps) {
  const [viewport, setViewport] = useState<ViewportMode>("desktop");

  // Hitung estimasi waktu baca (rata-rata 180-200 kata per menit)
  const plainText = description ? description.replace(/<[^>]*>/g, " ").trim() : "";
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const displayDate = createdAt
    ? new Date(createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="fixed top-1/2 left-1/2 z-50 flex h-[92vh] max-h-[92vh] w-[95vw] max-w-6xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-background p-0 shadow-2xl duration-200 sm:max-w-6xl"
      >
        <DialogTitle className="sr-only">Pratinjau Artikel Blog</DialogTitle>

        {/* Top Control Bar */}
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border/80 bg-muted/40 px-4 py-2.5 sm:px-6">
          {/* Sisi Kiri: Status & Info */}
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Eye className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-foreground">
                  Pratinjau Artikel
                </span>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider py-0 px-1.5 font-medium">
                  Reader View
                </Badge>
              </div>
              <p className="hidden text-[11px] text-muted-foreground sm:block">
                Tinjau tampilan publik artikel sebelum disimpan atau diterbitkan.
              </p>
            </div>
          </div>

          {/* Sisi Tengah: Device Viewport Switcher (Shadcn ToggleGroup) */}
          <ToggleGroup
            value={[viewport]}
            onValueChange={(val) => {
              if (val && val.length > 0) {
                setViewport(val[0] as ViewportMode);
              }
            }}
            variant="outline"
            size="sm"
            className="border border-border bg-background/90 p-0.5 shadow-2xs rounded-lg"
          >
            <ToggleGroupItem
              value="desktop"
              title="Tampilan Desktop (Penuh)"
              className="gap-1.5 px-2.5 py-1 text-xs font-medium cursor-pointer"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="tablet"
              title="Tampilan Tablet (768px)"
              className="gap-1.5 px-2.5 py-1 text-xs font-medium cursor-pointer"
            >
              <Tablet className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="mobile"
              title="Tampilan Mobile (390px)"
              className="gap-1.5 px-2.5 py-1 text-xs font-medium cursor-pointer"
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Sisi Kanan: Tombol Aksi */}
          <div className="flex items-center gap-2">
            {onPublish && (
              <Button
                onClick={onPublish}
                disabled={isPending}
                size="sm"
                className="gap-1.5 bg-primary text-xs sm:text-sm font-medium shadow-2xs cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : isEdit ? (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Simpan Perubahan</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Publikasikan Sekarang</span>
                  </>
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Tutup</span>
            </Button>
          </div>
        </DialogHeader>

        {/* Viewport Canvas Simulator */}
        <div className="flex-1 overflow-y-auto bg-muted/30 p-3 sm:p-6 flex justify-center items-start">
          <div
            className={cn(
              "w-full bg-card text-card-foreground transition-all duration-300",
              viewport === "desktop" &&
                "max-w-4xl rounded-xl border border-border/80 p-6 sm:p-12 shadow-sm my-2",
              viewport === "tablet" &&
                "max-w-[768px] rounded-xl border border-border/80 p-6 sm:p-8 shadow-sm my-2",
              viewport === "mobile" &&
                "max-w-[390px] rounded-[2.5rem] border-4 border-foreground/15 p-5 sm:p-6 shadow-xl my-2 relative"
            )}
          >
            {/* Mobile Notch Indicator (Hanya saat mode mobile aktif) */}
            {viewport === "mobile" && (
              <div className="mx-auto -mt-2 mb-4 h-4 w-28 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/40 mr-2" />
                <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
              </div>
            )}

            {/* Article Header */}
            <header className="space-y-4">
              {/* Hashtags / Badges */}
              {tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((t, index) => (
                    <Badge
                      key={`${t}-${index}`}
                      variant="secondary"
                      className="px-2 py-0.5 text-xs font-medium bg-muted text-foreground"
                    >
                      #{t.replace(/^#/, "")}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className={cn(
                "font-extrabold font-poppins text-foreground tracking-tight leading-tight",
                viewport === "mobile" ? "text-2xl" : "text-3xl sm:text-4xl lg:text-5xl"
              )}>
                {title.trim() || (
                  <span className="text-muted-foreground/40 italic">
                    (Belum ada judul artikel)
                  </span>
                )}
              </h1>

              {/* Metadata Info Bar */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>{displayDate}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  <span>{readingTime} menit baca ({wordCount} kata)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {status === "PUBLIC" ? (
                    <>
                      <Globe className="h-3.5 w-3.5 text-primary" />
                      <span className="text-primary font-medium">Publik</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground font-medium">Private (Draft)</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  <span className={commentStatus ? "text-primary font-medium" : "text-muted-foreground"}>
                    {commentStatus ? "Komentar Aktif" : "Komentar Nonaktif"}
                  </span>
                </div>
              </div>

              <Separator className="my-6 opacity-60" />
            </header>

            {/* Article Content Rendered */}
            <main>
              {description && description.trim() ? (
                <div
                  className="blog-reader-content text-foreground font-poppins text-sm sm:text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <p className="text-sm font-medium">Belum ada konten tulisan yang dimasukkan.</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Silakan kembali ke kanvas editor untuk mulai mengetik isi artikel.
                  </p>
                </div>
              )}
            </main>

            {/* Comment Section Simulation */}
            <footer className="mt-12 pt-6 border-t border-border/60">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Komentar Pembaca
                    </h3>
                  </div>
                  <Badge variant={commentStatus ? "default" : "secondary"} className="text-[10px]">
                    {commentStatus ? "Terbuka untuk Publik" : "Dinonaktifkan"}
                  </Badge>
                </div>

                {commentStatus ? (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Simulasi Formulir Komentar</p>
                    <p className="mt-1">
                      Pembaca publik akan dapat menuliskan komentar di bagian ini setelah artikel dipublikasikan.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-border/40 bg-muted/10 p-3 text-xs text-muted-foreground italic">
                    Komentar telah dinonaktifkan untuk artikel ini oleh panitia.
                  </div>
                )}
              </div>
            </footer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default BlogPreviewModal;
