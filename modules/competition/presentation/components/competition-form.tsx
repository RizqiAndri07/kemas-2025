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
  AlertTriangle,
  ClipboardList,
  ExternalLink,
  FileSpreadsheet,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
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
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompetitionSelect, PriceListItem } from "../../infrastructure/competition.table";
import { CompetitionFormSelect } from "../../infrastructure/competition-form.table";
import { PriceListSelector } from "./price-list-selector";
import { ContactPersonSelector } from "./contact-person-selector";
import {
  CompetitionDocumentsManager,
  CompetitionDocumentItem,
} from "./competition-documents-manager";
import { CompetitionType } from "../../domain/competition-type.enum";
import { CompetitionStatus } from "../../domain/competition-status.enum";
import {
  createCompetitionAction,
  updateCompetitionAction,
} from "../../application/competition.actions";

interface CompetitionFormProps {
  initialData?: CompetitionSelect | null;
  initialContactPersonIds?: string[];
  initialDocuments?: CompetitionDocumentItem[];
  initialAvailableForms?: CompetitionFormSelect[];
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

export function CompetitionForm({
  initialData,
  initialContactPersonIds,
  initialDocuments,
  initialAvailableForms = [],
}: CompetitionFormProps) {
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

  // Price List State: Default 'Normal Price' = Rp 0 jika event baru
  const defaultPriceList: PriceListItem[] =
    initialData?.priceList && initialData.priceList.length > 0
      ? initialData.priceList
      : [{ id: "default", name: "Normal Price", price: initialData ? initialData.fee : 0 }];

  const [priceList, setPriceList] = useState<PriceListItem[]>(defaultPriceList);
  const [selectedPriceId, setSelectedPriceId] = useState<string>(
    initialData?.selectedPriceId || defaultPriceList[0]?.id || "default"
  );
  const [contactPersonIds, setContactPersonIds] = useState<string[]>(
    initialContactPersonIds || []
  );
  const [maxQuota, setMaxQuota] = useState<string>(
    initialData?.maxQuota ? String(initialData.maxQuota) : ""
  );
  const [noRegistrationNeeded, setNoRegistrationNeeded] = useState<boolean>(
    Boolean(initialData?.noRegistrationNeeded)
  );
  const [activeFormId, setActiveFormId] = useState<string>(
    initialData?.activeFormId || ""
  );
  const [availableForms, setAvailableForms] = useState<CompetitionFormSelect[]>(
    initialAvailableForms
  );
  const [status, setStatus] = useState<CompetitionStatus>(
    (initialData?.status as CompetitionStatus) || CompetitionStatus.CLOSED
  );

  // Inisialisasi daftar dokumen: dari initialDocuments, atau fallback dari initialData.guidebookUrl jika ada
  const defaultDocuments: CompetitionDocumentItem[] =
    initialDocuments && initialDocuments.length > 0
      ? initialDocuments
      : initialData?.guidebookUrl
      ? [{ name: "Buku Panduan / Rulebook", filePath: initialData.guidebookUrl }]
      : [];

  const [documents, setDocuments] = useState<CompetitionDocumentItem[]>(defaultDocuments);
  const [description, setDescription] = useState(initialData?.description || "");

  const executeSubmit = (
    e?: React.FormEvent,
    redirectToForms: boolean = false
  ) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!name.trim()) {
      const msg = "Nama kompetisi wajib diisi.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!registrationStartDate || !registrationEndDate) {
      const msg = "Periode buka dan tutup registrasi wajib diisi.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!eventStartDate || !eventEndDate) {
      const msg = "Jadwal mulai dan selesai acara wajib diisi.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (new Date(registrationEndDate) < new Date(registrationStartDate)) {
      const msg = "Tanggal close register tidak boleh mendahului tanggal buka pendaftaran.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (new Date(eventEndDate) < new Date(eventStartDate)) {
      const msg = "Tanggal selesai acara tidak boleh mendahului tanggal dimulai acara.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // Guard: Jika status OPEN saat create event baru dan butuh pendaftaran
    if (!isEdit && status === CompetitionStatus.OPEN && !noRegistrationNeeded) {
      const msg =
        "Pendaftaran tidak dapat dibuka (status OPEN) saat membuat event baru karena formulir belum memiliki field. Silakan simpan dengan status 'Tutup' terlebih dahulu untuk merancang formulir, atau aktifkan 'Tanpa Pendaftaran'.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // Biaya aktif dihitung otomatis dari tier price list yang terpilih
    const activeTier = priceList.find((p) => p.id === selectedPriceId);
    const activeFee = activeTier ? activeTier.price : 0;

    // Filter dokumen yang valid (wajib memiliki filePath terunggah)
    const validDocs = documents.filter((d) => d.filePath.trim() !== "");
    const activeGuidebookUrl = validDocs.length > 0 ? validDocs[0].filePath : undefined;

    const payload = {
      name: name.trim(),
      type,
      registrationStartDate,
      registrationEndDate,
      eventStartDate,
      eventEndDate,
      priceList,
      selectedPriceId,
      fee: activeFee,
      contactPersonIds,
      guidebookUrl: activeGuidebookUrl,
      documents: validDocs,
      description: description.trim() || undefined,
      maxQuota: maxQuota ? Number(maxQuota) : undefined,
      noRegistrationNeeded,
      activeFormId: activeFormId.trim() !== "" ? activeFormId : undefined,
      status,
    };

    startTransition(async () => {
      try {
        let targetId = initialData?.id;
        if (isEdit && initialData) {
          const res = await updateCompetitionAction(initialData.id, payload);
          if (!res.success) {
            setErrorMessage(res.error || "Gagal memperbarui kompetisi");
            toast.error(res.error || "Gagal memperbarui kompetisi");
            return;
          }
          toast.success(res.message || "Data kompetisi berhasil diperbarui!");
        } else {
          const res = await createCompetitionAction(payload);
          if (!res.success) {
            setErrorMessage(res.error || "Gagal membuat kompetisi");
            toast.error(res.error || "Gagal membuat kompetisi");
            return;
          }
          targetId = res.data?.id;
          toast.success(res.message || "Kompetisi baru berhasil dibuat!");
        }

        // Redirect sesuai pilihan admin
        if (redirectToForms && targetId) {
          router.push(`/dashboard/competition/${targetId}/form`);
        } else {
          router.push("/dashboard/competition");
        }
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan internal pada server";
        setErrorMessage(msg);
        toast.error(msg);
      }
    });
  };

  return (
    <div className="w-full space-y-6">
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

      <Card className="border-border shadow-sm overflow-hidden w-full">
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
                {isEdit ? "Edit Event" : "Event Baru"}
              </CardTitle>
              <CardDescription className="text-xs">
                {isEdit
                  ? "Perbarui jadwal pendaftaran, waktu pelaksanaan acara, atau informasi biaya."
                  : "Lengkapi data cabang lomba atau kegiatan untuk menambahkan kartu event ke dashboard."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={(e) => executeSubmit(e, false)}>
          <CardContent className="space-y-6 pt-6">
            {/* Section 1: Informasi Utama */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Informasi Utama
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                {/* Nama Kompetisi */}
                <div className="lg:col-span-2 space-y-1.5">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            {/* Section 3: Price List & Biaya Pendaftaran */}
            <div className="space-y-4 pt-2 border-t border-border/40">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5" />
                Price List & Biaya Pendaftaran
              </h4>

              {/* Price List Selector Dropdown */}
              <div className="w-full">
                <PriceListSelector
                  priceList={priceList}
                  selectedPriceId={selectedPriceId}
                  onChangePriceList={setPriceList}
                  onSelectPrice={(id) => {
                    setSelectedPriceId(id);
                  }}
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    defaultValue={CompetitionStatus.CLOSED}
                  >
                    <SelectTrigger id="status" className="h-10 text-sm w-full">
                      <SelectValue placeholder="Pilih Status">
                        {status === CompetitionStatus.OPEN
                          ? "Pendaftaran Buka (Open)"
                          : status === CompetitionStatus.UPCOMING
                          ? "Akan Datang (Upcoming)"
                          : "Pendaftaran Tutup (Closed)"}
                      </SelectValue>
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

            {/* Section: Pengaturan Pendaftaran & Formulir Dinamis */}
            <div className="space-y-4 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5 text-primary" />
                  Pengaturan Pendaftaran & Formulir Peserta
                </h4>
                {isEdit && initialData && !noRegistrationNeeded && (
                  <Link
                    href={`/dashboard/competition/${initialData.id}/form`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline bg-primary/10 px-2.5 py-1 rounded-md"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Buka Form Builder</span>
                    <ExternalLink className="h-3 w-3 ml-0.5" />
                  </Link>
                )}
              </div>

              {/* Switch No Registration Needed */}
              <div className="flex items-start justify-between rounded-xl border border-border/70 p-4 bg-muted/20">
                <div className="space-y-1 pr-4">
                  <Label
                    htmlFor="noRegistrationNeeded"
                    className="text-sm font-semibold cursor-pointer text-foreground flex items-center gap-2"
                  >
                    <span>Tanpa Pendaftaran (No Registration Needed)</span>
                    {noRegistrationNeeded && (
                      <span className="text-[10px] bg-primary/20 text-primary font-medium px-2 py-0.5 rounded-full">
                        Acara Bebas Terbuka
                      </span>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Aktifkan jika acara ini terbuka untuk umum tanpa proses pendaftaran formulir (contoh: Pameran, Acara Pembukaan, Konser Musik Bebas Masuk).
                  </p>
                </div>
                <Switch
                  id="noRegistrationNeeded"
                  checked={noRegistrationNeeded}
                  onCheckedChange={(checked) => {
                    setNoRegistrationNeeded(checked);
                    if (checked) {
                      setActiveFormId("");
                    }
                  }}
                  disabled={isPending}
                />
              </div>

              {/* Status Formulir 1:1 Terintegrasi (Jika registrasi diperlukan) */}
              {!noRegistrationNeeded && (
                <div className="rounded-xl border border-border/70 p-4 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold">Formulir Pendaftaran</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isEdit
                        ? "Formulir pendaftaran dinamis untuk calon peserta kompetisi ini."
                        : "Formulir pendaftaran 1:1 akan langsung diinisialisasi begitu event disimpan."}
                    </p>
                  </div>
                  {isEdit && initialData ? (
                    <Link
                      href={`/dashboard/competition/${initialData.id}/form`}
                      className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shrink-0"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      <span>Edit Form Builder</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span className="text-[11px] text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-md border border-border/50 shrink-0">
                      Klik &quot;Simpan & Lanjut Buat Formulir&quot; di bawah
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Section 4: Narahubung / Contact Person (CP) */}
            <div className="space-y-4 pt-2 border-t border-border/40">
              <ContactPersonSelector
                selectedIds={contactPersonIds}
                onChangeSelectedIds={setContactPersonIds}
                disabled={isPending}
              />
            </div>

            {/* Section 5: Dokumen & Berkas Kegiatan (PDF) */}
            <div className="pt-2 border-t border-border/40">
              <CompetitionDocumentsManager
                documents={documents}
                onChangeDocuments={setDocuments}
                disabled={isPending}
              />
            </div>

            {/* Section 6: Deskripsi Tambahan */}
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

          <CardFooter className="bg-muted/10 border-t border-border/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/competition")}
              disabled={isPending}
            >
              Batal
            </Button>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              {!isEdit && !noRegistrationNeeded && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={isPending}
                  onClick={(e) => executeSubmit(e, true)}
                  className="cursor-pointer border border-border/60 hover:bg-secondary/80"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-primary" />
                      Simpan & Lanjut Buat Formulir
                    </>
                  )}
                </Button>
              )}

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
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
