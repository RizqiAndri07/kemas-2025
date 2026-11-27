"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Trophy, Globe, Loader2, Save, ExternalLink } from "lucide-react";
import { CompetitionBracketSelect } from "../../../infrastructure/competition-bracket.table";
import { saveBracketAction } from "../../../application/competition.actions";

interface BracketEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  competitionId: string;
  competitionName: string;
  initialData?: CompetitionBracketSelect | null;
  onSuccess?: () => void;
}

const BRACKET_TYPES = [
  { value: "SINGLE_ELIMINATION", label: "Single Elimination (Sistem Gugur Tunggal)" },
  { value: "DOUBLE_ELIMINATION", label: "Double Elimination (Sistem Gugur Ganda)" },
  { value: "ROUND_ROBIN", label: "Round Robin (Setengah Kompetisi / Grup)" },
  { value: "SWISS", label: "Swiss System" },
];

export function BracketEditDialog({
  isOpen,
  onClose,
  competitionId,
  competitionName,
  initialData,
  onSuccess,
}: BracketEditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(
    initialData?.title || `Bagan Pertandingan ${competitionName}`
  );
  const [type, setType] = useState(initialData?.type || "SINGLE_ELIMINATION");
  const [challongeUrl, setChallongeUrl] = useState(initialData?.challongeUrl || "");

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || `Bagan Pertandingan ${competitionName}`);
      setType(initialData?.type || "SINGLE_ELIMINATION");
      setChallongeUrl(initialData?.challongeUrl || "");
    }
  }, [isOpen, initialData, competitionName]);

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Judul bagan pertandingan wajib diisi");
      return;
    }

    startTransition(async () => {
      const res = await saveBracketAction(competitionId, {
        title: title.trim(),
        type,
        challongeUrl: challongeUrl.trim() || null,
        data: initialData?.data || {},
      });

      if (!res.success) {
        toast.error(res.error || "Gagal menyimpan bagan pertandingan");
        return;
      }

      toast.success(res.message || "Bagan pertandingan berhasil disimpan!");
      onSuccess?.();
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-xs">
            <Trophy className="h-4 w-4" />
            <span>Kelola Bagan Pertandingan (Bracket)</span>
          </div>
          <DialogTitle className="text-lg font-bold">{competitionName}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Konfigurasi format bagan turnamen dan tautan integrasi Challonge live bracket.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="bracket-title" className="text-xs font-semibold">
              Judul Bagan Pertandingan
            </Label>
            <Input
              id="bracket-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Bagan Turnamen Futsal / MLBB"
              className="text-sm"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bracket-type" className="text-xs font-semibold">
              Format / Sistem Pertandingan
            </Label>
            <Select
              value={type}
              onValueChange={(val) => setType(val || "SINGLE_ELIMINATION")}
              disabled={isPending}
            >
              <SelectTrigger id="bracket-type" className="text-xs h-9">
                <SelectValue placeholder="Pilih sistem bagan..." />
              </SelectTrigger>
              <SelectContent>
                {BRACKET_TYPES.map((bt) => (
                  <SelectItem key={bt.value} value={bt.value} className="text-xs">
                    {bt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="challonge-url" className="text-xs font-semibold flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-primary" />
                Tautan Challonge / Live Bracket (Opsional)
              </Label>
              {challongeUrl && (
                <a
                  href={challongeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-primary hover:underline flex items-center gap-1"
                >
                  Buka Link
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <Input
              id="challonge-url"
              value={challongeUrl}
              onChange={(e) => setChallongeUrl(e.target.value)}
              placeholder="https://challonge.com/id_turnamen"
              className="text-xs font-mono"
              disabled={isPending}
            />
            <p className="text-[11px] text-muted-foreground">
              Masukkan URL Challonge atau bagan turnamen eksternal agar peserta dapat melihat hasil bagan secara live.
            </p>
          </div>
        </div>

        <DialogFooter className="border-t border-border/60 pt-3 flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="gap-1.5 shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Simpan Bagan
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
