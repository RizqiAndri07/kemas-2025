"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Calendar,
  Clock,
  Coins,
  Users,
  FileText,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Save,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompetitionSelect } from "../../infrastructure/competition.table";
import { CompetitionType } from "../../domain/competition-type.enum";
import { CompetitionStatus } from "../../domain/competition-status.enum";
import {
  createCompetitionAction,
  updateCompetitionAction,
} from "../../application/competition.actions";

interface CompetitionFormProps {
  initialData?: CompetitionSelect | null;
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

export function CompetitionForm({ initialData }: CompetitionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEdit = Boolean(initialData);

  // Form State
  const [name, setName] = useState(initialData?.name || "");
  const [type, setType] = useState<CompetitionType>(
    (initialData?.type as CompetitionType) || CompetitionType.TOURNAMENT
  );
  const [registrationStartDate, setRegistrationStartDate] = useState(
    toDatetimeLocal(initialData?.registrationStartDate)
  );
  const [registrationEndDate, setRegistrationEndDate] = useState(
    toDatetimeLocal(initialData?.registrationEndDate)
  );
  const [eventStartDate, setEventStartDate] = useState(
    toDatetimeLocal(initialData?.eventStartDate)
  );
  const [eventEndDate, setEventEndDate] = useState(
    toDatetimeLocal(initialData?.eventEndDate)
  );
  const [fee, setFee] = useState<string>(
    initialData ? String(initialData.fee) : "0"
  );
  const [maxQuota, setMaxQuota] = useState<string>(
    initialData?.maxQuota ? String(initialData.maxQuota) : ""
  );
  const [status, setStatus] = useState<CompetitionStatus>(
    (initialData?.status as CompetitionStatus) || CompetitionStatus.OPEN
  );
  const [description, setDescription] = useState(initialData?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!name.trim()) {
      setErrorMessage("Nama kompetisi wajib diisi.");
      return;
    }
    if (!registrationStartDate || !registrationEndDate) {
      setErrorMessage("Periode buka dan tutup registrasi wajib diisi.");
      return;
    }
    if (!eventStartDate || !eventEndDate) {
      setErrorMessage("Jadwal mulai dan selesai acara wajib diisi.");
      return;
    }

    if (new Date(registrationEndDate) < new Date(registrationStartDate)) {
      setErrorMessage("Tanggal close register tidak boleh mendahului tanggal buka pendaftaran.");
      return;
    }
    if (new Date(eventEndDate) < new Date(eventStartDate)) {
      setErrorMessage("Tanggal selesai acara tidak boleh mendahului tanggal dimulai acara.");
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      registrationStartDate,
      registrationEndDate,
      eventStartDate,
      eventEndDate,
      fee: Number(fee) || 0,
      description: description.trim() || undefined,
      maxQuota: maxQuota ? Number(maxQuota) : undefined,
      status,
    };

    startTransition(async () => {
      try {
        if (isEdit && initialData) {
          const res = await updateCompetitionAction(initialData.id, payload);
          if (!res.success) {
            setErrorMessage(res.error || "Gagal memperbarui kompetisi");
            return;
          }
        } else {
          const res = await createCompetitionAction(payload);
          if (!res.success) {
            setErrorMessage(res.error || "Gagal membuat kompetisi");
            return;
          }
        }

        // Redirect kembali ke katalog kompetisi
        router.push("/dashboard/competition");
        router.refresh();
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Terjadi kesalahan internal pada server"
        );
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/dashboard/competition"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Katalog Kompetisi</span>
        </Link>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/60 pb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {type === CompetitionType.TOURNAMENT ? (
                <Trophy className="h-5 w-5" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl font-heading font-bold">
                {isEdit ? "Edit Rincian Kompetisi / Event" : "Form Tambah Kompetisi / Event Baru"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isEdit
                  ? "Perbarui jadwal pendaftaran, waktu pelaksanaan acara, atau informasi biaya."
                  : "Lengkapi data cabang lomba atau kegiatan untuk menambahkan kartu event ke dashboard."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {errorMessage && (
          <div className="mx-6 mt-6 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            {/* Section 1: Informasi Utama */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Informasi Utama
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nama Kompetisi */}
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium">
                    Nama Kompetisi / Event <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Futsal Championship 2025 atau National Try Out"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isPending}
                    className="h-10 text-sm"
                    required
                  />
                </div>

                {/* Tipe [EVENT, TOURNAMENT] */}
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-medium">
                    Tipe Kegiatan <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={type}
                    onValueChange={(val) => {
                      if (val) setType(val as CompetitionType);
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger id="type" className="h-10 text-sm w-full">
                      <SelectValue placeholder="Pilih Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CompetitionType.TOURNAMENT}>
                        Tournament (Turnamen)
                      </SelectItem>
                      <SelectItem value={CompetitionType.EVENT}>
                        Event (Agenda Acara)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: Jadwal & Tanggal */}
            <div className="space-y-4 pt-2 border-t border-border/40">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Periode Registrasi & Pelaksanaan Acara
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tanggal Pendaftaran Dibuka */}
                <div className="space-y-1.5">
                  <Label htmlFor="regStart" className="text-xs font-medium">
                    Tanggal Buka Pendaftaran <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="regStart"
                    type="datetime-local"
                    value={registrationStartDate}
                    onChange={(e) => setRegistrationStartDate(e.target.value)}
                    disabled={isPending}
                    className="h-10 text-sm"
                    required
                  />
                </div>

                {/* Tanggal Close Register */}
                <div className="space-y-1.5">
                  <Label htmlFor="regEnd" className="text-xs font-medium">
                    Tanggal Close Register <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="regEnd"
                    type="datetime-local"
                    value={registrationEndDate}
                    onChange={(e) => setRegistrationEndDate(e.target.value)}
                    disabled={isPending}
                    className="h-10 text-sm"
                    required
                  />
                </div>

                {/* Tanggal Dimulai Acara */}
                <div className="space-y-1.5">
                  <Label htmlFor="eventStart" className="text-xs font-medium">
                    Tanggal Dimulai Acara <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="eventStart"
                    type="datetime-local"
                    value={eventStartDate}
                    onChange={(e) => setEventStartDate(e.target.value)}
                    disabled={isPending}
                    className="h-10 text-sm"
                    required
                  />
                </div>

                {/* Tanggal Selesai Acara */}
                <div className="space-y-1.5">
                  <Label htmlFor="eventEnd" className="text-xs font-medium">
                    Tanggal Selesai Acara <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="eventEnd"
                    type="datetime-local"
                    value={eventEndDate}
                    onChange={(e) => setEventEndDate(e.target.value)}
                    disabled={isPending}
                    className="h-10 text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Biaya & Kuota */}
            <div className="space-y-4 pt-2 border-t border-border/40">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5" />
                Biaya & Batasan Kuota
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Biaya Pendaftaran */}
                <div className="space-y-1.5">
                  <Label htmlFor="fee" className="text-xs font-medium">
                    Biaya Pendaftaran (Rp) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">
                      Rp
                    </span>
                    <Input
                      id="fee"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="0"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      disabled={isPending}
                      className="pl-9 h-10 text-sm"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Isi 0 jika pendaftaran gratis (Free Entry).
                  </p>
                </div>

                {/* Kuota Maksimal */}
                <div className="space-y-1.5">
                  <Label htmlFor="maxQuota" className="text-xs font-medium">
                    Batas Kuota Peserta (Opsional)
                  </Label>
                  <Input
                    id="maxQuota"
                    type="number"
                    min="1"
                    placeholder="Contoh: 32 (Kosongkan jika bebas)"
                    value={maxQuota}
                    onChange={(e) => setMaxQuota(e.target.value)}
                    disabled={isPending}
                    className="h-10 text-sm"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Jumlah slot maksimal tim / peserta.
                  </p>
                </div>

                {/* Status Pendaftaran */}
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-xs font-medium">
                    Status Pendaftaran <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(val) => {
                      if (val) setStatus(val as CompetitionStatus);
                    }}
                    disabled={isPending}
                  >
                    <SelectTrigger id="status" className="h-10 text-sm w-full">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CompetitionStatus.OPEN}>
                        Pendaftaran Buka (Open)
                      </SelectItem>
                      <SelectItem value={CompetitionStatus.CLOSED}>
                        Pendaftaran Tutup (Closed)
                      </SelectItem>
                      <SelectItem value={CompetitionStatus.UPCOMING}>
                        Akan Datang (Upcoming)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 4: Deskripsi Tambahan */}
            <div className="space-y-1.5 pt-2 border-t border-border/40">
              <Label htmlFor="description" className="text-xs font-medium">
                Deskripsi / Keterangan Tambahan (Opsional)
              </Label>
              <Textarea
                id="description"
                placeholder="Tuliskan format turnamen, persyaratan singkat, atau catatan penting bagi peserta..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                rows={3}
                className="text-sm resize-none"
              />
            </div>
          </CardContent>

          <CardFooter className="bg-muted/10 border-t border-border/60 p-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/competition")}
              disabled={isPending}
            >
              Batal
            </Button>

            <Button type="submit" size="sm" disabled={isPending} className="cursor-pointer shadow-sm">
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {isEdit ? "Simpan Perubahan" : "Simpan Kompetisi"}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
