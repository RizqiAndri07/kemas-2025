"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Calendar,
  FileText,
  Clock,
  GitBranch,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { quickCreateCompetitionAction } from "../../application/competition.actions";
import { CompetitionType } from "../../domain/competition-type.enum";
import { toast } from "sonner";

interface CreateCompetitionDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateCompetitionDialog({
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: CreateCompetitionDialogProps) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen! : setInternalOpen;

  const [name, setName] = useState("");
  const [type, setType] = useState<CompetitionType>(CompetitionType.TOURNAMENT);
  const [createRegistrationForm, setCreateRegistrationForm] = useState(true);
  const [createRundown, setCreateRundown] = useState(true);
  const [createBracket, setCreateBracket] = useState(true);

  const [isPending, startTransition] = useTransition();

  const handleReset = () => {
    setName("");
    setType(CompetitionType.TOURNAMENT);
    setCreateRegistrationForm(true);
    setCreateRundown(true);
    setCreateBracket(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Silakan masukkan nama event / kompetisi");
      return;
    }

    if (name.trim().length < 3) {
      toast.error("Nama event minimal 3 karakter");
      return;
    }

    startTransition(async () => {
      try {
        const result = await quickCreateCompetitionAction({
          name: name.trim(),
          type,
          createRegistrationForm,
          createRundown,
          createBracket,
        });

        if (!result.success) {
          toast.error(result.error || "Gagal membuat event");
          return;
        }

        if (!result.data) {
          toast.error("Gagal mendapatkan data event");
          return;
        }

        toast.success(`Event "${result.data.name}" berhasil dibuat!`, {
          description: "Mengarahkan ke halaman detail untuk melengkapi informasi...",
        });

        setOpen(false);
        handleReset();

        // Arahkan ke halaman edit event agar pengguna bisa langsung mengisi informasi lainnya
        router.push(`/dashboard/competition/${result.data.id}/edit`);
        router.refresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Terjadi kesalahan saat membuat event"
        );
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger render={trigger as any} />}

      <DialogContent className="sm:max-w-lg border-border/80 shadow-2xl p-0 overflow-hidden">
        {/* Accent Header Banner */}
        <div className="bg-primary/5 border-b border-border/60 px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Event Builder Instan</span>
          </div>
          <DialogTitle className="text-xl font-heading font-bold text-foreground">
            Buat Event / Kompetisi Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Masukkan nama kegiatan dan tentukan komponen awal yang ingin dibuatkan draft kosongnya secara otomatis.
          </DialogDescription>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Input Nama Event */}
          <div className="space-y-1.5">
            <Label htmlFor="competition-name" className="text-xs font-semibold text-foreground">
              Nama Event / Perlombaan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="competition-name"
              placeholder="Contoh: Turnamen Futsal Kemas 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
              autoFocus
              className="h-10 text-sm"
              required
            />
          </div>

          {/* Tipe Kegiatan */}
          <div className="space-y-1.5">
            <Label htmlFor="competition-type" className="text-xs font-semibold text-foreground">
              Tipe Kegiatan
            </Label>
            <Select
              value={type}
              onValueChange={(val) => {
                if (val) {
                  const newType = val as CompetitionType;
                  setType(newType);
                  // Otomatis nonaktifkan bracket jika tipe EVENT umum
                  if (newType === CompetitionType.EVENT) {
                    setCreateBracket(false);
                  } else {
                    setCreateBracket(true);
                  }
                }
              }}
              disabled={isPending}
            >
              <SelectTrigger id="competition-type" className="h-10 text-xs">
                <SelectValue placeholder="Pilih Tipe Kegiatan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={CompetitionType.TOURNAMENT}>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span>Tournament (Kompetisi / Pertandingan Bertingkat)</span>
                  </div>
                </SelectItem>
                <SelectItem value={CompetitionType.EVENT}>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <span>Event (Seminar, Festival, atau Agenda Umum)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checkbox Komponen Otomatis */}
          <div className="space-y-2.5 pt-1">
            <Label className="text-xs font-semibold text-foreground">
              Komponen Draft Otomatis (Dibuat Kosong)
            </Label>
            <p className="text-[11px] text-muted-foreground -mt-1">
              Pilih modul yang ingin disiapkan. Nantinya Anda dapat mengedit dan mengisi nilainya secara terpisah.
            </p>

            <div className="space-y-2">
              {/* Option 1: Registration Form */}
              <label
                htmlFor="cb-reg-form"
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                  createRegistrationForm
                    ? "border-primary/50 bg-primary/5 shadow-xs"
                    : "border-border/60 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <Checkbox
                  id="cb-reg-form"
                  checked={createRegistrationForm}
                  onCheckedChange={(checked) => setCreateRegistrationForm(Boolean(checked))}
                  disabled={isPending}
                  className="mt-0.5"
                />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>Formulir Pendaftaran (Registration Form)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Siapkan struktur form builder kosong untuk menampung formulir isian pendaftaran peserta publik.
                  </p>
                </div>
              </label>

              {/* Option 2: Rundown Timeline */}
              <label
                htmlFor="cb-rundown"
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                  createRundown
                    ? "border-primary/50 bg-primary/5 shadow-xs"
                    : "border-border/60 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <Checkbox
                  id="cb-rundown"
                  checked={createRundown}
                  onCheckedChange={(checked) => setCreateRundown(Boolean(checked))}
                  disabled={isPending}
                  className="mt-0.5"
                />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Clock className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Susunan Acara (Rundown Timeline)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Siapkan agenda rundown awal untuk mengatur jadwal waktu pelaksanaan per sesi acara.
                  </p>
                </div>
              </label>

              {/* Option 3: Tournament Bracket */}
              <label
                htmlFor="cb-bracket"
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none ${
                  createBracket
                    ? "border-primary/50 bg-primary/5 shadow-xs"
                    : "border-border/60 bg-muted/20 hover:bg-muted/40"
                }`}
              >
                <Checkbox
                  id="cb-bracket"
                  checked={createBracket}
                  onCheckedChange={(checked) => setCreateBracket(Boolean(checked))}
                  disabled={isPending}
                  className="mt-0.5"
                />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <GitBranch className="h-3.5 w-3.5 text-purple-500" />
                    <span>Bagan Pertandingan (Bracket Bagan Tanding)</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Siapkan bagan eliminasi pertandingan untuk mengelola skema turnamen dan bagan juara.
                  </p>
                </div>
              </label>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setOpen(false);
                handleReset();
              }}
              disabled={isPending}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !name.trim()}
              className="gap-1.5 cursor-pointer shadow-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Membuat Event...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Buat Event Sekarang</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
