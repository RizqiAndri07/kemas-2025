"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  Plus,
  ArrowLeft,
  CheckCircle2,
  Copy,
  Trash2,
  Pencil,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CompetitionSelect } from "@/modules/competition/infrastructure/competition.table";
import { CompetitionFormSelect } from "@/modules/competition/infrastructure/competition-form.table";
import { FormSectionConfig } from "@/modules/competition/domain/competition-form.interface";
import {
  createCompetitionFormAction,
  deleteCompetitionFormAction,
  duplicateCompetitionFormAction,
  setActiveCompetitionFormAction,
} from "@/modules/competition/application/competition-form.actions";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { toast } from "@/components/ui/sonner";

interface CompetitionFormsManagerProps {
  competition: CompetitionSelect;
  forms: CompetitionFormSelect[];
}

export function CompetitionFormsManager({
  competition,
  forms,
}: CompetitionFormsManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Create Form Dialog State
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<CompetitionFormSelect | null>(null);

  const activeFormId = competition.activeFormId;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newTitle.trim()) {
      const msg = "Judul formulir wajib diisi.";
      setCreateError(msg);
      toast.error(msg);
      return;
    }

    startTransition(async () => {
      const res = await createCompetitionFormAction({
        competitionId: competition.id,
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });

      if (!res.success) {
        const msg = res.error || "Gagal membuat formulir.";
        setCreateError(msg);
        toast.error(msg);
        return;
      }

      toast.success(res.message || "Formulir pendaftaran berhasil dibuat!");
      setCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      router.push(`/dashboard/competition/${competition.id}/forms/${res.data?.id}`);
      router.refresh();
    });
  };

  const handleSetActive = (formId: string) => {
    startTransition(async () => {
      const res = await setActiveCompetitionFormAction(competition.id, formId);
      if (res.success) {
        toast.success(res.message || "Formulir aktif berhasil diperbarui!");
      } else {
        toast.error(res.error || "Gagal mengubah formulir aktif.");
      }
      router.refresh();
    });
  };

  const handleDuplicate = (formId: string) => {
    startTransition(async () => {
      const res = await duplicateCompetitionFormAction(formId, competition.id);
      if (res.success) {
        toast.success(res.message || "Formulir berhasil diduplikasi!");
      } else {
        toast.error(res.error || "Gagal menduplikasi formulir.");
      }
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const res = await deleteCompetitionFormAction(deleteTarget.id, competition.id);
      if (res.success) {
        toast.success(res.message || "Formulir berhasil dihapus!");
      } else {
        toast.error(res.error || "Gagal menghapus formulir.");
      }
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href={`/dashboard/competition/${competition.id}/edit`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Edit: {competition.name}</span>
        </Link>

        <Button
          onClick={() => {
            setCreateError(null);
            setCreateOpen(true);
          }}
          size="sm"
          className="cursor-pointer gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Formulir Baru</span>
        </Button>
      </div>

      {/* Overview Banner Card */}
      <Card className="border-border/70 bg-gradient-to-r from-primary/5 via-card to-card shadow-sm">
        <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-heading font-bold text-foreground">
              {competition.name}
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Kelola berbagai versi formulir pendaftaran untuk cabang lomba ini. Tentukan satu formulir aktif yang akan diisi oleh peserta saat registrasi dibuka.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-card p-3 rounded-xl border border-border/60">
            <div className="text-right">
              <span className="text-[11px] text-muted-foreground block">Status Formulir Aktif</span>
              <span className="text-xs font-bold text-foreground">
                {competition.noRegistrationNeeded
                  ? "Tanpa Pendaftaran (Bebas)"
                  : activeFormId
                    ? "Formulir Terhubung"
                    : "Belum Ada Form Terpilih"}
              </span>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms List Grid */}
      {forms.length === 0 ? (
        <Card className="border-dashed border-2 border-border/80">
          <CardContent className="py-12">
            <EmptyState
              icon={FileSpreadsheet}
              title="Belum Ada Formulir Pendaftaran"
              description="Buat formulir pertama Anda untuk mengatur section, field input teks, nomor, upload dokumen/foto, dan link yang dibutuhkan dari peserta."
              action={
                <Button
                  onClick={() => {
                    setCreateError(null);
                    setCreateOpen(true);
                  }}
                  size="sm"
                  className="cursor-pointer gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat Formulir Sekarang</span>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form) => {
            const isActive = form.id === activeFormId;
            const sectionsCount = form.sections?.length || 0;
            const fieldsCount =
              form.sections?.reduce(
                (acc: number, sec: FormSectionConfig) => acc + (sec.fields?.length || 0),
                0
              ) || 0;

            return (
              <Card
                key={form.id}
                className={`flex flex-col justify-between border transition-all duration-200 hover:shadow-md ${isActive
                    ? "border-emerald-500/50 bg-emerald-500/[0.02] shadow-sm"
                    : "border-border/70"
                  }`}
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <FileSpreadsheet className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-heading font-bold text-foreground line-clamp-1">
                          {form.title}
                        </CardTitle>
                        <span className="text-[10px] text-muted-foreground">
                          Dibuat:{" "}
                          {new Intl.DateTimeFormat("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(form.createdAt))}
                        </span>
                      </div>
                    </div>

                    {isActive && (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] gap-1 px-2 py-0.5 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Aktif Digunakan</span>
                      </Badge>
                    )}
                  </div>

                  {form.description && (
                    <CardDescription className="text-xs line-clamp-2 mt-2 leading-relaxed">
                      {form.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="p-4 pt-1 pb-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/20 p-2 rounded-lg border border-border/40">
                    <div className="flex items-center gap-1">
                      <Layers className="h-3.5 w-3.5 text-primary" />
                      <span className="font-semibold text-foreground">
                        {sectionsCount}
                      </span>{" "}
                      Section
                    </div>
                    <span>•</span>
                    <div>
                      <span className="font-semibold text-foreground">
                        {fieldsCount}
                      </span>{" "}
                      Field Input
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-3 bg-muted/10 border-t border-border/50 flex flex-col gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      variant="default"
                      size="sm"
                      render={
                        <Link
                          href={`/dashboard/competition/${competition.id}/forms/${form.id}`}
                        />
                      }
                      className="flex-1 h-8 text-xs cursor-pointer gap-1"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Buka Builder</span>
                    </Button>

                    {!isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetActive(form.id)}
                        disabled={isPending}
                        className="h-8 text-xs cursor-pointer text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-500/30"
                      >
                        Jadikan Aktif
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center justify-between w-full pt-1 border-t border-border/40">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicate(form.id)}
                      disabled={isPending}
                      className="h-7 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer px-2"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Duplikat
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(form)}
                      disabled={isPending}
                      className="h-7 text-[11px] text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer px-2"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog Buat Formulir Baru */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-heading font-bold">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Buat Formulir Pendaftaran Baru
              </DialogTitle>
              <DialogDescription className="text-xs">
                Masukkan judul dan deskripsi formulir untuk kompetisi{" "}
                <strong className="text-foreground">{competition.name}</strong>. Anda dapat mengonfigurasi sections dan fields di halaman Form Builder setelahnya.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {createError && (
                <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-xs font-medium">
                  Judul Formulir <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Contoh: Formulir Pendaftaran Utama, Gelombang 1, Form SMA"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={isPending}
                  className="h-9 text-sm"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="desc" className="text-xs font-medium">
                  Deskripsi / Petunjuk Pengisian (Opsional)
                </Label>
                <Textarea
                  id="desc"
                  placeholder="Tuliskan petunjuk umum bagi calon peserta sebelum mengisi..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  disabled={isPending}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isPending} className="cursor-pointer">
                {isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Buat Formulir
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Konfirmasi Hapus Formulir */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Hapus Formulir Pendaftaran?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus formulir{" "}
              <strong className="text-foreground">{deleteTarget?.title}</strong>? Seluruh
              konfigurasi section dan field yang ada di dalamnya akan terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Ya, Hapus Formulir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
