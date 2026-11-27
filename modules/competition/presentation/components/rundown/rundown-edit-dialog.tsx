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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { Plus, Trash2, Clock, Calendar, MapPin, Loader2, Save } from "lucide-react";
import { RundownItem, CompetitionRundownSelect } from "../../../infrastructure/competition-rundown.table";
import { saveRundownAction } from "../../../application/competition.actions";

interface RundownEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  competitionId: string;
  competitionName: string;
  initialData?: CompetitionRundownSelect | null;
  onSuccess?: () => void;
}

export function RundownEditDialog({
  isOpen,
  onClose,
  competitionId,
  competitionName,
  initialData,
  onSuccess,
}: RundownEditDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initialData?.title || `Rundown ${competitionName}`);
  const [description, setDescription] = useState(initialData?.description || "");
  const [items, setItems] = useState<RundownItem[]>(initialData?.items || []);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || `Rundown ${competitionName}`);
      setDescription(initialData?.description || "");
      setItems(initialData?.items || []);
    }
  }, [isOpen, initialData, competitionName]);

  const handleAddItem = () => {
    const newItem: RundownItem = {
      id: crypto.randomUUID(),
      time: "08:00 - 09:00",
      activity: "Agenda Baru",
      location: "",
      notes: "",
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof RundownItem, value: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Judul rundown wajib diisi");
      return;
    }

    startTransition(async () => {
      const res = await saveRundownAction(competitionId, {
        title: title.trim(),
        description: description.trim() || null,
        items,
      });

      if (!res.success) {
        toast.error(res.error || "Gagal menyimpan rundown");
        return;
      }

      toast.success(res.message || "Rundown berhasil disimpan!");
      onSuccess?.();
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2 text-primary font-medium text-xs">
            <Clock className="h-4 w-4" />
            <span>Kelola Susunan Acara (Rundown)</span>
          </div>
          <DialogTitle className="text-lg font-bold">
            {competitionName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Atur timeline acara, sesi kegiatan menit demi menit, dan lokasi stage atau lapangan.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rundown-title" className="text-xs font-semibold">
              Judul Rundown
            </Label>
            <Input
              id="rundown-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Rundown Babak Penyisihan & Final"
              className="text-sm"
              disabled={isPending}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rundown-desc" className="text-xs font-semibold">
              Deskripsi / Catatan Acara (Opsional)
            </Label>
            <Textarea
              id="rundown-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan umum rundown, dresscode panitia, atau info teknis..."
              rows={2}
              className="text-xs resize-none"
              disabled={isPending}
            />
          </div>

          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Daftar Sesi & Agenda Waktu</h4>
                <p className="text-[11px] text-muted-foreground">
                  {items.length} agenda telah ditambahkan
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddItem}
                disabled={isPending}
                className="h-7 text-xs gap-1 border-dashed"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Agenda
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg bg-muted/20 text-muted-foreground space-y-2">
                <Clock className="h-6 w-6 mx-auto opacity-50" />
                <p className="text-xs font-medium">Belum ada agenda dalam susunan acara ini</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddItem}
                  className="text-xs gap-1 h-7"
                >
                  <Plus className="h-3 w-3" />
                  Tambah Agenda Pertama
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-border/70 bg-card hover:border-primary/40 transition-colors space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-muted-foreground w-6">
                        #{idx + 1}
                      </span>
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <Input
                          value={item.time}
                          onChange={(e) => handleUpdateItem(item.id, "time", e.target.value)}
                          placeholder="Waktu (e.g. 08:00 - 09:00)"
                          className="h-8 text-xs font-mono"
                          disabled={isPending}
                        />
                        <Input
                          value={item.activity}
                          onChange={(e) => handleUpdateItem(item.id, "activity", e.target.value)}
                          placeholder="Nama Kegiatan / Sesi"
                          className="h-8 text-xs font-medium"
                          disabled={isPending}
                        />
                      </div>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={isPending}
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                      <Input
                        value={item.location || ""}
                        onChange={(e) => handleUpdateItem(item.id, "location", e.target.value)}
                        placeholder="Lokasi / Stage (Opsional)"
                        className="h-7 text-[11px]"
                        disabled={isPending}
                      />
                      <Input
                        value={item.notes || ""}
                        onChange={(e) => handleUpdateItem(item.id, "notes", e.target.value)}
                        placeholder="Keterangan / PIC (Opsional)"
                        className="h-7 text-[11px]"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-border/60 bg-muted/10 flex items-center justify-between sm:justify-between">
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
                Simpan Rundown
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
