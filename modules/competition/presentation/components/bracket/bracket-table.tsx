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
import { Button, buttonVariants } from "@/components/ui/button";
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
  Trophy,
  Search,
  Globe,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { BracketWithCompetition } from "../../../infrastructure/competition-bracket.repository";
import { BracketEditDialog } from "./bracket-edit-dialog";
import { deleteBracketAction } from "../../../application/competition.actions";

interface BracketTableProps {
  initialBrackets: BracketWithCompetition[];
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

function formatBracketType(type: string): string {
  switch (type) {
    case "SINGLE_ELIMINATION":
      return "Single Elimination";
    case "DOUBLE_ELIMINATION":
      return "Double Elimination";
    case "ROUND_ROBIN":
      return "Round Robin";
    case "SWISS":
      return "Swiss System";
    default:
      return type;
  }
}

export function BracketTable({ initialBrackets }: BracketTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [selectedBracket, setSelectedBracket] = useState<BracketWithCompetition | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [bracketToDelete, setBracketToDelete] = useState<BracketWithCompetition | null>(null);

  const filteredBrackets = initialBrackets.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.competitionName.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q)
    );
  });

  const handleOpenEdit = (bracket: BracketWithCompetition) => {
    setSelectedBracket(bracket);
    setIsEditDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!bracketToDelete) return;

    startTransition(async () => {
      const res = await deleteBracketAction(bracketToDelete.competitionId);
      if (!res.success) {
        toast.error(res.error || "Gagal menghapus bagan pertandingan");
        return;
      }
      toast.success(res.message || "Bagan pertandingan berhasil dihapus!");
      setBracketToDelete(null);
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
            placeholder="Cari turnamen atau bagan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 bg-card"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-muted-foreground">
            Total: <strong>{filteredBrackets.length}</strong> Bagan Pertandingan
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 text-xs">
              <TableHead className="w-[260px] font-semibold">Nama Event / Kompetisi</TableHead>
              <TableHead className="font-semibold">Judul Bagan</TableHead>
              <TableHead className="font-semibold">Format Pertandingan</TableHead>
              <TableHead className="font-semibold">Tautan Live Challonge</TableHead>
              <TableHead className="font-semibold">Terakhir Diperbarui</TableHead>
              <TableHead className="text-right font-semibold">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrackets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Trophy className="h-8 w-8 text-muted-foreground/40" />
                    <p className="font-medium">
                      {search
                        ? "Tidak ditemukan bagan pertandingan yang cocok"
                        : "Belum ada bagan pertandingan (bracket) yang dibuat"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Buka menu Event & Kompetisi, buat event turnamen baru atau edit turnamen untuk menambahkan bracket.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBrackets.map((b) => (
                <TableRow key={b.id} className="text-xs hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="space-y-1">
                      <Link
                        href={`/dashboard/competition/${b.competitionId}/edit`}
                        className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1.5"
                      >
                        <span>{b.competitionName}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </Link>
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 h-4 font-normal"
                        >
                          {b.competitionType}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {b.competitionStatus}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="font-semibold text-foreground">{b.title}</p>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-[11px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20">
                      <Trophy className="h-3 w-3 mr-1 text-purple-600 dark:text-purple-400" />
                      {formatBracketType(b.type)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {b.challongeUrl ? (
                      <a
                        href={b.challongeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-mono bg-primary/10 px-2 py-0.5 rounded"
                      >
                        <Globe className="h-3 w-3" />
                        <span className="max-w-[180px] truncate">{b.challongeUrl}</span>
                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-muted-foreground italic">
                        Belum terhubung
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-muted-foreground text-[11px]">
                    {formatDate(b.updatedAt)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/dashboard/competition/bracket/${b.competitionId}`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                          className:
                            "h-7 text-xs gap-1 px-2.5 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 border-purple-500/30",
                        })}
                      >
                        <Eye className="h-3 w-3" />
                        <span>Lihat</span>
                      </Link>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(b)}
                        className="h-7 text-xs gap-1 px-2.5"
                      >
                        <Edit className="h-3 w-3 text-primary" />
                        <span>Edit</span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setBracketToDelete(b)}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      {selectedBracket && (
        <BracketEditDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedBracket(null);
          }}
          competitionId={selectedBracket.competitionId}
          competitionName={selectedBracket.competitionName}
          initialData={selectedBracket}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={Boolean(bracketToDelete)}
        onOpenChange={(open) => !open && setBracketToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Hapus Bagan Pertandingan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus bagan pertandingan untuk turnamen{" "}
              <strong>&quot;{bracketToDelete?.competitionName}&quot;</strong>? Pengaturan sistem gugur dan tautan Challonge akan dihapus.
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
                  Hapus Bagan
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
