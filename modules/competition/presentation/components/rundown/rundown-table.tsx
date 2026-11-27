"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Clock,
  Search,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  Trophy,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { RundownWithCompetition } from "../../../infrastructure/competition-rundown.repository";
import { RundownEditDialog } from "./rundown-edit-dialog";
import { deleteRundownAction } from "../../../application/competition.actions";

interface RundownTableProps {
  initialRundowns: RundownWithCompetition[];
}

function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function RundownTable({ initialRundowns }: RundownTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selectedRundown, setSelectedRundown] = useState<RundownWithCompetition | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [rundownToDelete, setRundownToDelete] = useState<RundownWithCompetition | null>(null);

  const filteredRundowns = initialRundowns.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.competitionName.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  });

  const handleOpenEdit = (rundown: RundownWithCompetition) => {
    setSelectedRundown(rundown);
    setIsEditDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!rundownToDelete) return;

    startTransition(async () => {
      const res = await deleteRundownAction(rundownToDelete.competitionId);
      if (!res.success) {
        toast.error(res.error || "Gagal menghapus rundown");
        return;
      }
      toast.success(res.message || "Rundown berhasil dihapus!");
      setRundownToDelete(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama event atau rundown..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 bg-card"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-muted-foreground">
            Total: <strong>{filteredRundowns.length}</strong> Rundown
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs">
              <TableHead className="w-[260px] font-semibold">Nama Event / Kompetisi</TableHead>
              <TableHead className="font-semibold">Judul Rundown</TableHead>
              <TableHead className="text-center font-semibold">Jumlah Agenda</TableHead>
              <TableHead className="font-semibold">Periode Acara</TableHead>
              <TableHead className="font-semibold">Terakhir Diperbarui</TableHead>
              <TableHead className="text-right font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRundowns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Clock className="h-8 w-8 text-muted-foreground/40" />
                    <p className="font-medium">
                      {search ? "Tidak ditemukan rundown yang cocok" : "Belum ada rundown acara yang dibuat"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Buka menu Event & Kompetisi, buat event baru atau edit event untuk menambahkan rundown.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredRundowns.map((r) => {
                const itemCount = Array.isArray(r.items) ? r.items.length : 0;
                return (
                  <TableRow key={r.id} className="text-xs hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <Link
                          href={`/dashboard/competition/${r.competitionId}/edit`}
                          className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                        >
                          <span>{r.competitionName}</span>
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </Link>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4 font-normal"
                          >
                            {r.competitionType}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {r.competitionStatus}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-foreground">{r.title}</p>
                        {r.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 max-w-xs">
                            {r.description}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant={itemCount > 0 ? "outline" : "secondary"}
                        className="text-[11px] font-semibold"
                      >
                        <Clock className="h-3 w-3 mr-1 text-emerald-500" />
                        {itemCount} Sesi
                      </Badge>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-[11px]">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground/70" />
                        <span>
                          {formatDate(r.eventStartDate)} - {formatDate(r.eventEndDate)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-muted-foreground text-[11px]">
                      {formatDate(r.updatedAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(r)}
                          className="h-7 text-xs gap-1 px-2.5"
                        >
                          <Edit className="h-3 w-3 text-primary" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setRundownToDelete(r)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedRundown && (
        <RundownEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedRundown(null);
          }}
          competitionId={selectedRundown.competitionId}
          competitionName={selectedRundown.competitionName}
          initialData={selectedRundown}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={Boolean(rundownToDelete)}
        onOpenChange={(open) => !open && setRundownToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Hapus Rundown Acara?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus rundown untuk event{" "}
              <strong>&quot;{rundownToDelete?.competitionName}&quot;</strong>? Seluruh agenda susunan acara akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="text-xs h-8">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs h-8 gap-1"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  Hapus Rundown
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
