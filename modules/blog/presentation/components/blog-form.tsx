"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  Loader2,
  MessageSquare,
  Plus,
  Save,
  Send,
  Tag as TagIcon,
  X,
  Globe,
  Lock,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BlogFormInput } from "../../domain/blog.schema";
import { createBlogAction, updateBlogAction } from "../../application/blog.actions";
import { uploadBlogImageAction } from "../../application/blog-upload.action";
import { BlogPreviewModal } from "./blog-preview-modal";
import { toast } from "@/components/ui/sonner";

// Dynamic import untuk BlockNote editor agar hanya dieksekusi di sisi client (No SSR)
const BlockNoteEditor = dynamic(
  () => import("./blocknote-editor").then((mod) => mod.BlockNoteEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm font-medium">Memuat kanvas editor Notion...</p>
      </div>
    ),
  }
);

interface BlogFormProps {
  initialData?: {
    id: string;
    title: string;
    description: string;
    tag?: string | null;
    status?: "PUBLIC" | "PRIVATE" | string | null;
    commentStatus: boolean;
  };
  isEdit?: boolean;
}

export function BlogForm({ initialData, isEdit = false }: BlogFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [status, setStatus] = useState<"PUBLIC" | "PRIVATE">(
    initialData?.status === "PRIVATE" ? "PRIVATE" : "PUBLIC"
  );
  const [commentStatus, setCommentStatus] = useState<boolean>(
    initialData?.commentStatus ?? true
  );

  // Hashtags State (Multi-tag)
  const [tags, setTags] = useState<string[]>(() => {
    if (!initialData?.tag) return [];
    return initialData.tag
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);
  });
  const [tagInput, setTagInput] = useState("");
  const [isEditingTag, setIsEditingTag] = useState(false);

  // Deferred Upload State & Cache Ref
  const [uploadProgressText, setUploadProgressText] = useState<string | null>(null);
  const pendingImagesRef = useRef<Map<string, File>>(new Map());

  // Membersihkan seluruh object URL yang belum dipakai saat berpindah halaman
  useEffect(() => {
    return () => {
      pendingImagesRef.current.forEach((_, blobUrl) => {
        URL.revokeObjectURL(blobUrl);
      });
      pendingImagesRef.current.clear();
    };
  }, []);

  const handleFileCached = (blobUrl: string, file: File) => {
    pendingImagesRef.current.set(blobUrl, file);
  };

  const tagInputRef = useRef<HTMLInputElement>(null);
  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus tag input saat mode penambahan hashtag aktif
  useEffect(() => {
    if (isEditingTag && tagInputRef.current) {
      tagInputRef.current.focus();
    }
  }, [isEditingTag]);

  // Auto-resize title textarea seiring bertambahnya baris teks
  useEffect(() => {
    if (titleTextareaRef.current) {
      titleTextareaRef.current.style.height = "auto";
      titleTextareaRef.current.style.height = `${titleTextareaRef.current.scrollHeight}px`;
    }
  }, [title]);

  // Menambahkan hashtag baru ke daftar
  const commitTag = (rawInput: string) => {
    const clean = rawInput.trim().replace(/^#+/, "");
    if (!clean) return;
    if (!tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput("");
  };

  // Keyboard navigation untuk hashtag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput.trim()) {
        commitTag(tagInput);
        // Tetap buka input field agar user langsung bisa mengetik hashtag berikutnya
        setIsEditingTag(true);
      }
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      // Hapus tag terakhir saat input kosong dan tombol backspace ditekan
      e.preventDefault();
      setTags((prev) => prev.slice(0, -1));
    } else if (e.key === "Escape") {
      setTagInput("");
      setIsEditingTag(false);
    }
  };

  const handleTagBlur = () => {
    if (tagInput.trim()) {
      commitTag(tagInput);
    }
    setIsEditingTag(false);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTags((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (title.trim().length < 5) {
      const msg = "Judul artikel minimal 5 karakter.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (description.trim().length < 10) {
      const msg = "Isi artikel masih kosong. Tuliskan konten minimal 10 karakter.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    startTransition(async () => {
      try {
        let finalDescription = description;

        // 1. Deteksi semua blob URL yang masih aktif di dalam teks konten
        const blobMatches = Array.from(
          description.matchAll(/src=["'](blob:[^"']+)["']/gi),
          (m) => m[1]
        );
        const uniqueBlobUrls = Array.from(new Set(blobMatches));

        // 2. Jika ada berkas baru di cache lokal, unggah bersamaan ke Supabase Storage
        if (uniqueBlobUrls.length > 0) {
          for (let i = 0; i < uniqueBlobUrls.length; i++) {
            const blobUrl = uniqueBlobUrls[i];
            const file = pendingImagesRef.current.get(blobUrl);

            if (file) {
              setUploadProgressText(
                `Mengunggah gambar (${i + 1}/${uniqueBlobUrls.length})...`
              );
              const formData = new FormData();
              formData.append("file", file);

              const uploadRes = await uploadBlogImageAction(formData);
              if (!uploadRes.success) {
                const msg = uploadRes.error || "Gagal mengunggah gambar artikel ke storage.";
                setErrorMessage(msg);
                toast.error(msg);
                setUploadProgressText(null);
                return;
              }

              if (!uploadRes.data?.url) {
                const msg = "URL berkas hasil unggahan tidak ditemukan.";
                setErrorMessage(msg);
                toast.error(msg);
                setUploadProgressText(null);
                return;
              }

              // Ganti object URL lokal dengan URL permanen Supabase di HTML
              finalDescription = finalDescription.replaceAll(blobUrl, uploadRes.data.url);

              // Revoke blob URL dari memori browser
              URL.revokeObjectURL(blobUrl);
              pendingImagesRef.current.delete(blobUrl);
            }
          }
        }

        // 3. Bersihkan sisa blob URL yang sempat dimasukkan ke editor tapi dibatalkan/dihapus
        pendingImagesRef.current.forEach((_, blobUrl) => {
          URL.revokeObjectURL(blobUrl);
        });
        pendingImagesRef.current.clear();

        setUploadProgressText("Menyimpan artikel ke database...");

        const payload: BlogFormInput = {
          title: title.trim(),
          description: finalDescription,
          tag: tags.length > 0 ? tags.join(", ") : null,
          status,
          commentStatus,
        };

        const res =
          isEdit && initialData
            ? await updateBlogAction(initialData.id, payload)
            : await createBlogAction(payload);

        setUploadProgressText(null);

        if (res.success) {
          setIsSaved(true);
          toast.success(res.message || (isEdit ? "Artikel berhasil diperbarui!" : "Artikel baru berhasil diterbitkan!"));
          setTimeout(() => {
            router.push("/dashboard/blog");
            router.refresh();
          }, 500);
        } else {
          const msg = res.error || "Gagal menyimpan artikel ke database.";
          setErrorMessage(msg);
          toast.error(msg);
        }
      } catch (err) {
        setUploadProgressText(null);
        const msg =
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan internal saat memproses artikel.";
        setErrorMessage(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <div className="w-full pb-20">
      {/* Top Header Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60 w-full">
        {/* Sisi Kiri: Navigasi & Status */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/blog">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kembali ke Daftar Artikel</span>
              <span className="sm:hidden">Kembali</span>
            </Button>
          </Link>

          <Separator orientation="vertical" className="h-4" />

          <Badge variant={isEdit ? "secondary" : "outline"} className="text-[11px] font-normal">
            {isEdit ? "Mode Edit Halaman" : "Halaman Baru"}
          </Badge>

          {isSaved && (
            <span className="hidden items-center gap-1 text-xs text-primary font-medium sm:inline-flex">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tersimpan
            </span>
          )}
        </div>

        {/* Sisi Kanan: Visibilitas & Allow Komentar Toggle + Aksi Publish */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Widget Toggle Visibilitas Public / Private */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background/80 px-2.5 py-1 text-xs shadow-2xs">
            {status === "PUBLIC" ? (
              <Globe className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="hidden md:inline text-xs text-muted-foreground font-medium">
              Visibilitas:
            </span>
            <Switch
              id="blog-status"
              checked={status === "PUBLIC"}
              onCheckedChange={(checked) =>
                setStatus(checked ? "PUBLIC" : "PRIVATE")
              }
              aria-label="Status Visibilitas Artikel"
            />
            <span
              className={cn(
                "text-[11px] font-medium",
                status === "PUBLIC" ? "text-primary" : "text-muted-foreground"
              )}
            >
              {status === "PUBLIC" ? "Public" : "Private"}
            </span>
          </div>

          {/* Widget Toggle Allow Komentar */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-background/80 px-2.5 py-1 text-xs shadow-2xs">
            <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden md:inline text-xs text-muted-foreground font-medium">
              Komentar:
            </span>
            <Switch
              id="comment-status"
              checked={commentStatus}
              onCheckedChange={setCommentStatus}
              aria-label="Izinkan Komentar"
            />
            <span className="text-[11px] font-medium text-foreground">
              {commentStatus ? "Aktif" : "Mati"}
            </span>
          </div>

          <Separator orientation="vertical" className="hidden sm:block h-4" />

          {/* Tombol Tinjau / Preview Artikel */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="gap-1.5 text-xs sm:text-sm font-medium cursor-pointer"
            title="Pratinjau tampilan publik artikel"
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Preview</span>
          </Button>

          {/* Tombol Utama Simpan / Publikasikan */}
          <Button
            onClick={() => handleSubmit()}
            disabled={isPending}
            size="sm"
            className="gap-1.5 bg-primary font-medium text-xs sm:text-sm cursor-pointer min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{uploadProgressText || "Menyimpan..."}</span>
              </>
            ) : isEdit ? (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Perubahan</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Publikasikan</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notion Document Canvas with Hashtag Sidebar */}
      <div className="w-full pt-6 flex flex-col lg:flex-row-reverse gap-8">
        {/* Right Sidebar: Hashtag Section */}
        <aside className="w-full lg:w-72 shrink-0 lg:border-l lg:border-border/60 lg:pl-6 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <TagIcon className="h-3.5 w-3.5 text-primary" />
            <span>Hashtags</span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-snug">
            Ketik hashtag lalu tekan <kbd className="rounded border border-border px-1 py-0.5 text-[10px] bg-muted">Enter</kbd> untuk menambahkan tag baru.
          </p>

          {/* List of Hashtag Badges + Inline Input */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {tags.map((t, index) => (
              <Badge
                key={`${t}-${index}`}
                variant="secondary"
                className="group inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-muted text-foreground hover:bg-muted/80 rounded-md transition-all shadow-2xs"
              >
                <span className="text-muted-foreground">#</span>
                <span>{t}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveTag(index)}
                  className="h-4 w-4 ml-1 p-0 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                  title={`Hapus #${t}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}

            {isEditingTag ? (
              <div className="inline-flex items-center gap-1 rounded-md border border-primary/50 bg-background px-2 py-0.5 shadow-2xs">
                <span className="text-xs text-muted-foreground font-semibold">#</span>
                <Input
                  ref={tagInputRef}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  onBlur={handleTagBlur}
                  placeholder="Ketik hashtag..."
                  className="h-6 w-28 border-none p-0 text-xs focus-visible:ring-0 bg-transparent"
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditingTag(true)}
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-dashed border-border bg-background/60 px-2.5 text-xs font-medium text-muted-foreground hover:border-primary/60 hover:text-foreground hover:bg-muted/50 transition-all shadow-2xs cursor-pointer"
                title="Tambah hashtag baru"
              >
                <Plus className="h-3 w-3 text-primary" />
                <span>Tambah Hashtag</span>
              </Button>
            )}
          </div>
        </aside>

        {/* Left / Main Document Canvas */}
        <div className="flex-1 min-w-0">
          {errorMessage && (
            <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          {/* Document Title (Borderless auto-expanding Notion style) */}
          <div className="mb-6">
            <Textarea
              ref={titleTextareaRef}
              rows={1}
              placeholder="Judul Halaman Artikel..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full resize-none border-none bg-transparent p-0 text-3xl font-extrabold tracking-tight text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-0 focus-visible:border-none shadow-none min-h-0 sm:text-5xl leading-tight"
            />
          </div>

          <Separator className="my-6 opacity-40" />

          {/* Notion Block Editor Canvas */}
          <div className="notion-editor-canvas w-full">
            <BlockNoteEditor
              initialContent={description}
              onChange={(html) => setDescription(html)}
              onFileCached={handleFileCached}
            />
          </div>
        </div>
      </div>

      {/* Interactive Review & Preview Modal */}
      <BlogPreviewModal
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title={title}
        description={description}
        tags={tags}
        status={status}
        commentStatus={commentStatus}
        createdAt={initialData ? undefined : undefined}
        onPublish={() => {
          setIsPreviewOpen(false);
          handleSubmit();
        }}
        isPending={isPending}
        isEdit={isEdit}
      />
    </div>
  );
}

export default BlogForm;
