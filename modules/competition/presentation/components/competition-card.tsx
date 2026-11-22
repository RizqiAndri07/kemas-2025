"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Calendar,
  Clock,
  Coins,
  Users,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Tag,
  FileText,
  ExternalLink,
  FileSpreadsheet,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CompetitionSelect } from "../../infrastructure/competition.table";
import { EventDocumentSelect } from "../../infrastructure/event-document.table";
import { CompetitionType } from "../../domain/competition-type.enum";
import { CompetitionStatus } from "../../domain/competition-status.enum";
import {
  deleteCompetitionAction,
  toggleCompetitionStatusAction,
} from "../../application/competition.actions";

interface CompetitionCardProps {
  competition: CompetitionSelect;
  documents?: EventDocumentSelect[];
}

export function CompetitionCard({ competition, documents = [] }: CompetitionCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const formatDateTime = (date: Date | string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Free Entry (Gratis)";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleToggleStatus = () => {
    const nextStatus =
      competition.status === CompetitionStatus.OPEN
        ? CompetitionStatus.CLOSED
        : CompetitionStatus.OPEN;

    startTransition(async () => {
      const res = await toggleCompetitionStatusAction(competition.id, nextStatus);
      if (res.success) {
        toast.success(res.message || "Status kompetisi berhasil diperbarui!");
      } else {
        toast.error(res.error || "Gagal mengubah status kompetisi");
      }
      router.refresh();
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteCompetitionAction(competition.id);
      if (res.success) {
        toast.success(res.message || "Kompetisi berhasil dihapus!");
      } else {
        toast.error(res.error || "Gagal menghapus kompetisi");
      }
      setDeleteOpen(false);
      router.refresh();
    });
  };

  const isTournament = competition.type === CompetitionType.TOURNAMENT;
  const isOpen = competition.status === CompetitionStatus.OPEN;

  // Temukan tier price list yang sedang aktif
  const activeTier =
    competition.priceList?.find((p) => p.id === competition.selectedPriceId) ||
    competition.priceList?.[0] || {
      id: "default",
      name: "Normal Price",
      price: competition.fee,
    };

  const hasMultipleTiers = (competition.priceList?.length || 0) > 1;

  return (
    <>
      <Card className="h-full flex flex-col justify-between border-border bg-card/70 hover:bg-card hover:border-primary/40 transition-all duration-200 shadow-sm hover:shadow-md overflow-hidden relative group">
        {/* Top color indicator stripe */}
        <div
          className={`h-1.5 w-full ${
            isTournament
              ? "bg-gradient-to-r from-purple-500 to-indigo-500"
              : "bg-gradient-to-r from-emerald-500 to-teal-500"
          }`}
        />

        <CardHeader className="p-4 pb-2 space-y-2">
          {/* Badges & Actions row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Type Badge */}
              {isTournament ? (
                <Badge
                  variant="outline"
                  className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-[10px] px-2 py-0.5"
                >
                  <Trophy className="mr-1 h-3 w-3" />
                  Tournament
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] px-2 py-0.5"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  Event
                </Badge>
              )}

              {/* Status Badge */}
              {isOpen ? (
                <Badge
                  variant="outline"
                  className="border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 font-medium text-[10px] px-2 py-0.5"
                >
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Pendaftaran Buka
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="border-muted-foreground/30 bg-muted/40 text-muted-foreground font-medium text-[10px] px-2 py-0.5"
                >
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Pendaftaran Tutup
                </Badge>
              )}

              {/* Active Price Tier Badge */}
              <Badge
                variant="outline"
                className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-[10px] px-2 py-0.5"
              >
                <Tag className="mr-1 h-3 w-3" />
                {activeTier.name}
              </Badge>
            </div>

            {/* Action Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon",
                  className: "h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer -mr-1",
                })}
                disabled={isPending}
              >
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  render={<Link href={`/dashboard/competition/${competition.id}/edit`} />}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Edit Rincian
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href={`/dashboard/competition/${competition.id}/form`} />}
                  className="cursor-pointer"
                >
                  <FileSpreadsheet className="mr-2 h-3.5 w-3.5 text-primary" />
                  Kelola Formulir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleStatus} className="cursor-pointer">
                  {isOpen ? (
                    <>
                      <XCircle className="mr-2 h-3.5 w-3.5 text-amber-500" />
                      Tutup Pendaftaran
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-green-500" />
                      Buka Pendaftaran
                    </>
                  )}
                </DropdownMenuItem>
                {documents.length > 0 ? (
                  documents.map((doc) => (
                    <DropdownMenuItem
                      key={doc.id}
                      render={
                        <a
                          href={doc.filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                        />
                      }
                      className="cursor-pointer"
                    >
                      <FileText className="mr-2 h-3.5 w-3.5 text-primary" />
                      <span className="truncate">Unduh {doc.name}</span>
                    </DropdownMenuItem>
                  ))
                ) : competition.guidebookUrl ? (
                  <DropdownMenuItem
                    render={
                      <a
                        href={competition.guidebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                    className="cursor-pointer"
                  >
                    <FileText className="mr-2 h-3.5 w-3.5 text-primary" />
                    Unduh Buku Panduan
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteOpen(true)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Hapus Kompetisi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Competition Title */}
          <div>
            <h3 className="font-heading font-bold text-base text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {competition.name}
            </h3>
            {competition.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                {competition.description}
              </p>
            )}

            {/* Registration & Form Status Indicator */}
            <div className="flex items-center gap-1.5 mt-2">
              {competition.noRegistrationNeeded ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                  Tanpa Pendaftaran
                </span>
              ) : competition.activeFormId ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Formulir Terhubung
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  Formulir Belum Dipilih
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-1 pb-3 space-y-2.5">
          {/* Dates Info */}
          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5 space-y-1.5 text-xs">
            {/* Periode Pendaftaran */}
            <div className="flex items-start gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Periode Pendaftaran
                </span>
                <span className="font-medium text-foreground text-[11px]">
                  {formatDateTime(competition.registrationStartDate)} – {formatDateTime(competition.registrationEndDate)}
                </span>
              </div>
            </div>

            {/* Tanggal Acara */}
            <div className="flex items-start gap-2 pt-1 border-t border-border/40">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                  Jadwal Acara
                </span>
                <span className="font-medium text-foreground text-[11px]">
                  {formatDateTime(competition.eventStartDate)} – {formatDateTime(competition.eventEndDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Price List & Quota Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60">
              <Coins className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-muted-foreground truncate font-medium">
                  {activeTier.name}
                </span>
                <span className="font-bold text-foreground text-[11px] truncate">
                  {formatCurrency(activeTier.price)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/60">
              <Users className="h-3.5 w-3.5 text-primary shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-muted-foreground">Kuota</span>
                <span className="font-bold text-foreground text-[11px] truncate">
                  {competition.maxQuota ? `${competition.maxQuota} Kuota` : "Tak Terbatas"}
                </span>
              </div>
            </div>
          </div>

          {/* Dokumen / Berkas Kegiatan (PDF) */}
          {documents.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              {documents.map((doc, idx) => (
                <div
                  key={doc.id || idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-[11px] font-medium text-foreground truncate">
                      {doc.name}
                    </span>
                  </div>
                  <a
                    href={doc.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline shrink-0"
                  >
                    <span>Lihat PDF</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              ))}
            </div>
          ) : competition.guidebookUrl ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="text-[11px] font-medium text-foreground truncate">
                  Buku Panduan (PDF)
                </span>
              </div>
              <a
                href={competition.guidebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline shrink-0"
              >
                <span>Lihat PDF</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="p-3 pt-0 border-t border-border/40 flex items-center justify-between gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            disabled={isPending}
            className="flex-1 h-8 text-xs cursor-pointer"
          >
            {isOpen ? "Tutup Pendaftaran" : "Buka Pendaftaran"}
          </Button>

          <Button
            variant="default"
            size="sm"
            render={<Link href={`/dashboard/competition/${competition.id}/edit`} />}
            className="h-8 text-xs px-3 cursor-pointer"
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Hapus Kompetisi?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus kompetisi{" "}
              <strong className="text-foreground">{competition.name}</strong>? Seluruh
              data yang terkait tidak dapat dipulihkan kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Ya, Hapus Kompetisi"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
