"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Coins,
  Calendar,
  Users,
  Loader2,
  AlertCircle,
  Plus,
  Pencil,
  Info,
} from "lucide-react";
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
import { CompetitionSelect } from "../../infrastructure/competition.table";
import { CompetitionPresaleSelect } from "../../infrastructure/competition-presale.table";
import {
  createPresaleAction,
  updatePresaleAction,
} from "../../application/presale.actions";

interface PresaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitions: CompetitionSelect[];
  presaleToEdit?: CompetitionPresaleSelect | null;
  defaultCompetitionId?: string;
}

function toDatetimeLocal(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function PresaleDialog({
  open,
  onOpenChange,
  competitions,
  presaleToEdit,
  defaultCompetitionId,
}: PresaleDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEdit = Boolean(presaleToEdit);

  // Form State
  const [competitionId, setCompetitionId] = useState(
    defaultCompetitionId || (competitions[0]?.id ?? "")
  );
  const [name, setName] = useState("");
  const [price, setPrice] = useState("0");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quota, setQuota] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Cari kompetisi yang terpilih untuk menampilkan namanya secara eksplisit (bukan UUID)
  const selectedComp = competitions.find((c) => c.id === competitionId);

  useEffect(() => {
    if (presaleToEdit) {
      setCompetitionId(presaleToEdit.competitionId);
      setName(presaleToEdit.name);
      setPrice(String(presaleToEdit.price));
      setStartDate(toDatetimeLocal(presaleToEdit.startDate));
      setEndDate(toDatetimeLocal(presaleToEdit.endDate));
      setQuota(presaleToEdit.quota ? String(presaleToEdit.quota) : "");
      setIsActive(presaleToEdit.isActive);
    } else {
      setCompetitionId(defaultCompetitionId || (competitions[0]?.id ?? ""));
      setName("");
      setPrice("0");
      setStartDate("");
      setEndDate("");
      setQuota("");
      setIsActive(true);
    }
    setErrorMessage(null);
  }, [presaleToEdit, open, defaultCompetitionId, competitions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!competitionId) {
      setErrorMessage("Silakan pilih kompetisi / event terlebih dahulu.");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Nama gelombang presale wajib diisi.");
      return;
    }
    if (!startDate || !endDate) {
      setErrorMessage("Tanggal mulai dan tanggal berakhir wajib diisi.");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setErrorMessage("Tanggal berakhir tidak boleh mendahului tanggal mulai gelombang.");
      return;
    }

    const payload = {
      competitionId,
      name: name.trim(),
      price: Number(price) || 0,
      startDate,
      endDate,
      quota: quota ? Number(quota) : undefined,
      isActive,
    };

    startTransition(async () => {
      try {
        if (isEdit && presaleToEdit) {
          const res = await updatePresaleAction(presaleToEdit.id, payload);
          if (!res.success) {
            setErrorMessage(res.error || "Gagal memperbarui gelombang presale");
            return;
          }
        } else {
          const res = await createPresaleAction(payload);
          if (!res.success) {
            setErrorMessage(res.error || "Gagal membuat gelombang presale");
            return;
          }
        }

        onOpenChange(false);
        router.refresh();
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Terjadi kesalahan internal"
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {isEdit ? <Pencil className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
            </div>
            <div>
              <DialogTitle>
                {isEdit ? "Edit Gelombang Presale" : "Tambah Gelombang Presale Baru"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {isEdit
                  ? "Perbarui harga tier, kuota, atau jadwal masa berlaku presale."
                  : "Tentukan harga pendaftaran khusus berdasarkan periode waktu pendaftaran."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Pilih Kompetisi / Event (Menggunakan Nama Event, bukan UUID) */}
          <div className="space-y-1.5">
            <Label htmlFor="competition" className="text-xs font-medium">
              Kompetisi / Event Terkait <span className="text-destructive">*</span>
            </Label>
            <Select
              value={competitionId}
              onValueChange={(val) => {
                if (val) setCompetitionId(val);
              }}
              disabled={isPending || isEdit}
            >
              <SelectTrigger id="competition" className="h-9 text-sm w-full">
                <SelectValue placeholder="Pilih Kompetisi">
                  {selectedComp
                    ? `${selectedComp.name} (${selectedComp.type})`
                    : "Pilih Kompetisi"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {competitions.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.name} ({comp.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-muted-foreground">
              Gelombang presale ini akan diterapkan khusus untuk cabang lomba / event di atas.
            </p>
          </div>

          {/* Nama Gelombang */}
          <div className="space-y-1.5">
            <Label htmlFor="presaleName" className="text-xs font-medium">
              Nama Gelombang <span className="text-destructive">*</span>
            </Label>
            <Input
              id="presaleName"
              placeholder="Contoh: Early Bird, Presale 1, atau Regular Wave"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              className="h-9 text-sm"
              required
            />
          </div>

          {/* Biaya & Kuota Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Biaya */}
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-medium">
                Biaya Pendaftaran (Rp) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs text-muted-foreground font-semibold">
                  Rp
                </span>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="100000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={isPending}
                  className="pl-8 h-9 text-sm"
                  required
                />
              </div>
            </div>

            {/* Kuota */}
            <div className="space-y-1.5">
              <Label htmlFor="quota" className="text-xs font-medium">
                Batas Kuota Slot
              </Label>
              <Input
                id="quota"
                type="number"
                min="1"
                placeholder="Tak Terbatas"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                disabled={isPending}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Jadwal Mulai & Selesai Presale */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-xs font-medium">
                Tanggal Mulai Berlaku <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isPending}
                className="h-9 text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-xs font-medium">
                Tanggal Berakhir Berlaku <span className="text-destructive">*</span>
              </Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isPending}
                className="h-9 text-sm"
                required
              />
            </div>
          </div>

          {/* Status Aktif */}
          <div className="space-y-1.5">
            <Label htmlFor="isActive" className="text-xs font-medium">
              Status Gelombang
            </Label>
            <Select
              value={isActive ? "ACTIVE" : "INACTIVE"}
              onValueChange={(val) => setIsActive(val === "ACTIVE")}
              disabled={isPending}
            >
              <SelectTrigger id="isActive" className="h-9 text-sm w-full">
                <SelectValue placeholder="Pilih Status">
                  {isActive ? "Aktif (Dapat dipilih peserta)" : "Nonaktif / Ditutup Manual"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Aktif (Dapat dipilih peserta)</SelectItem>
                <SelectItem value="INACTIVE">Nonaktif / Ditutup Manual</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 mt-1">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                Aturan: 1 event hanya boleh memiliki 1 presale aktif. Mengaktifkan gelombang ini akan otomatis menonaktifkan gelombang presale lain di event yang sama.
              </span>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" disabled={isPending} className="cursor-pointer">
              {isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Tambah Gelombang"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
