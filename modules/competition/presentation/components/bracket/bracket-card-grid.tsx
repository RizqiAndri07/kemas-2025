"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "@/components/ui/sonner";
import { Trophy, Search, Filter, Loader2, Sparkles } from "lucide-react";
import { BracketWithCompetition } from "../../../infrastructure/competition-bracket.repository";
import { BracketCard } from "./bracket-card";
import { BracketManageDialog } from "./bracket-manage-dialog";
import { deleteBracketAction } from "../../../application/competition.actions";

interface BracketCardGridProps {
  initialBrackets: BracketWithCompetition[];
}

export function BracketCardGrid({ initialBrackets }: BracketCardGridProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  // Dialog States
  const [editBracket, setEditBracket] = useState<BracketWithCompetition | null>(null);
  const [bracketToDelete, setBracketToDelete] = useState<BracketWithCompetition | null>(null);

  const filteredBrackets = initialBrackets.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      b.title.toLowerCase().includes(q) ||
      b.competitionName.toLowerCase().includes(q) ||
      b.type.toLowerCase().includes(q);

    const matchType = filterType === "ALL" || b.type === filterType;

    return matchSearch && matchType;
  });

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
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama event atau judul bagan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs h-9 bg-background"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={filterType}
            onValueChange={(val) => setFilterType(val || "ALL")}
          >
            <SelectTrigger className="text-xs h-9 w-full sm:w-48 bg-background">
              <SelectValue placeholder="Format Bagan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Format Bagan</SelectItem>
              <SelectItem value="SINGLE_ELIMINATION">Single Elimination</SelectItem>
              <SelectItem value="DOUBLE_ELIMINATION">Double Elimination</SelectItem>
              <SelectItem value="ROUND_ROBIN">Round Robin</SelectItem>
              <SelectItem value="SWISS">Swiss System</SelectItem>
            </SelectContent>
          </Select>

          {(search || filterType !== "ALL") && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-9 text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSearch("");
                setFilterType("ALL");
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Cards Grid Container */}
      {filteredBrackets.length === 0 ? (
        <div className="border border-dashed border-border rounded-xl p-12 text-center space-y-3 bg-muted/10">
          <div className="p-3.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20 w-fit mx-auto">
            <Trophy className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">
              {search || filterType !== "ALL"
                ? "Tidak Ada Bagan yang Cocok"
                : "Belum Ada Bagan Pertandingan"}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {search || filterType !== "ALL"
                ? "Coba sesuaikan kata kunci pencarian atau bersihkan filter format bagan."
                : "Bagan pertandingan dibuat otomatis saat event baru dibuat atau melalui pengaturan Additional Event di form edit kompetisi."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBrackets.map((bracket) => (
            <BracketCard
              key={bracket.id}
              bracket={bracket}
              onEdit={(b) => setEditBracket(b)}
              onDelete={(b) => setBracketToDelete(b)}
            />
          ))}
        </div>
      )}

      {/* Manage Bracket Dialog (Seeding & Scoring) */}
      <BracketManageDialog
        isOpen={!!editBracket}
        onClose={() => setEditBracket(null)}
        bracket={editBracket}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Alert Dialog Delete Confirmation */}
      <AlertDialog
        open={!!bracketToDelete}
        onOpenChange={(open) => !open && setBracketToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive">
              Hapus Bagan Pertandingan?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
              Apakah Anda yakin ingin menghapus bagan pertandingan untuk kompetisi{" "}
              <strong>{bracketToDelete?.competitionName}</strong>? Data bagan turnamen, seeding
              peserta, dan riwayat skor yang tersimpan akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs" disabled={isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Menghapus...
                </>
              ) : (
                "Hapus Bagan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
