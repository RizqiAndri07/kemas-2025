import { Metadata } from "next";
import Link from "next/link";
import { getCompetitionById } from "@/modules/competition/infrastructure/competition.repository";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Calendar,
  Coins,
  Download,
  ExternalLink,
  FileText,
  MessageCircle,
  ShieldAlert,
  Users,
  Clock,
  Layers,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

function formatDate(date: string | Date | undefined): string {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(date);
  }
}

function formatFee(fee: number | undefined, priceList?: any[]): string {
  if (fee === 0 || (priceList && priceList.length === 1 && priceList[0].price === 0)) {
    return "Gratis (Free Entry)";
  }
  if (fee !== undefined && fee !== null) {
    return `Rp ${Number(fee).toLocaleString("id-ID")}`;
  }
  return "Gratis";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const comp = await getCompetitionById(id);

  if (!comp) {
    return {
      title: "Kompetisi Tidak Ditemukan - PRASASTI 2026",
      robots: { index: false },
    };
  }

  return {
    title: `${comp.name} - PRASASTI 2026`,
    description:
      comp.description ||
      `Detail dan buku panduan resmi ${comp.name} Kemas Prasasti 2026.`,
  };
}

export default async function CompetitionDetailPage({ params }: Props) {
  const { id } = await params;
  const competition = await getCompetitionById(id);

  if (!competition) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-heading font-bold text-foreground">
              Kompetisi Tidak Ditemukan
            </h2>
            <p className="text-xs text-muted-foreground">
              Data kompetisi dengan identitas &quot;{id}&quot; tidak terdaftar pada sistem kami.
            </p>
          </div>
          <Link href="/competition">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Daftar Kompetisi
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const isOpen = competition.status === "OPEN";
  const formattedFee = formatFee(competition.fee, competition.priceList);
  const regStart = formatDate(competition.registrationStartDate);
  const regEnd = formatDate(competition.registrationEndDate);
  const eventStart = formatDate(competition.eventStartDate);
  const eventEnd = formatDate(competition.eventEndDate);

  const rundown = competition.rundown as any;
  const bracket = competition.bracket as any;

  // Kumpulkan seluruh berkas dokumen
  const allDocuments = [...(competition.documents || [])];
  if (
    competition.guidebookUrl &&
    !allDocuments.some((d) => d.filePath === competition.guidebookUrl)
  ) {
    allDocuments.unshift({
      id: "guidebook_main",
      name: "Buku Panduan Utama (Guidebook)",
      filePath: competition.guidebookUrl,
      competitionId: competition.id,
      createdAt: competition.createdAt,
      updatedAt: competition.updatedAt,
    });
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link href="/competition">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Daftar Kompetisi</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs uppercase font-semibold">
            {competition.type}
          </Badge>
          <Badge
            variant={isOpen ? "default" : "secondary"}
            className={isOpen ? "bg-emerald-600 hover:bg-emerald-700 text-white text-xs" : "text-xs"}
          >
            {isOpen ? "Pendaftaran Dibuka" : "Pendaftaran Ditutup"}
          </Badge>
        </div>
      </div>

      {/* Hero Header Card */}
      <Card className="border shadow-xs">
        <CardHeader className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                Kemas Prasasti 2026
              </span>
              <CardTitle className="text-2xl sm:text-3xl font-heading font-bold text-foreground mt-1">
                {competition.name}
              </CardTitle>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-muted-foreground block">Biaya Registrasi</span>
              <span className="text-xl sm:text-2xl font-bold text-primary font-heading">
                {formattedFee}
              </span>
            </div>
          </div>
          <CardDescription className="text-sm leading-relaxed text-muted-foreground">
            {competition.description ||
              "Silakan pelajari regulasi teknis, jadwal pelaksanaan, dan berkas persyaratan di bawah ini."}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Jadwal & Waktu Pelaksanaan */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-bold">Jadwal & Waktu Pelaksanaan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-lg border border-border/70 bg-muted/20 space-y-1">
                  <span className="text-muted-foreground block font-medium">
                    Periode Pendaftaran Peserta
                  </span>
                  <span className="text-sm font-semibold text-foreground block">
                    {regStart} - {regEnd}
                  </span>
                </div>
                <div className="p-3.5 rounded-lg border border-border/70 bg-muted/20 space-y-1">
                  <span className="text-muted-foreground block font-medium">
                    Waktu Pelaksanaan Acara
                  </span>
                  <span className="text-sm font-semibold text-foreground block">
                    {eventStart} - {eventEnd}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Biaya & Paket Registrasi */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-base font-bold">Biaya & Paket Registrasi</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Rincian skema tarif atau pilihan paket pendaftaran yang berlaku.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {competition.priceList && competition.priceList.length > 0 ? (
                <div className="rounded-lg border border-border/70 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="text-xs">
                        <TableHead>Nama Paket / Kategori</TableHead>
                        <TableHead className="text-right">Biaya</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {competition.priceList.map((tier) => {
                        const isExpired = tier.status === "EXPIRED";
                        return (
                          <TableRow key={tier.id}>
                            <TableCell
                              className={
                                isExpired
                                  ? "line-through text-muted-foreground opacity-60 font-medium"
                                  : "font-medium text-foreground"
                              }
                            >
                              {tier.name}
                            </TableCell>
                            <TableCell
                              className={
                                isExpired
                                  ? "text-right line-through text-muted-foreground opacity-60 font-semibold"
                                  : "text-right font-semibold text-foreground"
                              }
                            >
                              {tier.price === 0
                                ? "Gratis"
                                : `Rp ${Number(tier.price).toLocaleString("id-ID")}`}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted/20 border border-border/70 text-xs">
                  <span className="text-muted-foreground">Biaya Pendaftaran: </span>
                  <span className="font-bold text-foreground">{formattedFee}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Berkas Panduan & Regulasi */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-bold">Buku Panduan & Dokumen Resmi</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Unduh dokumen regulasi perlombaan, petunjuk teknis (Juknis), atau template formulir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allDocuments.length > 0 ? (
                <div className="space-y-2.5">
                  {allDocuments.map((doc, idx) => (
                    <div
                      key={doc.id || idx}
                      className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-muted/10 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-3">
                        <FileText className="h-4 w-4 shrink-0 text-primary" />
                        <span className="font-medium text-foreground truncate">
                          {doc.name}
                        </span>
                      </div>
                      <a
                        href={doc.filePath}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="shrink-0"
                      >
                        <Button variant="outline" size="sm" className="text-xs gap-1.5">
                          <Download className="h-3.5 w-3.5" />
                          <span>Unduh</span>
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Belum ada berkas panduan yang diunggah untuk kompetisi ini.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Rundown Acara (Jika ada) */}
          {rundown && rundown.items && rundown.items.length > 0 && (
            <Card className="border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-bold">
                    {rundown.title || "Susunan Acara (Rundown)"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border/70 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="text-xs">
                        <TableHead className="w-32">Waktu</TableHead>
                        <TableHead>Agenda / Kegiatan</TableHead>
                        <TableHead>Lokasi / Keterangan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {rundown.items.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="font-semibold text-foreground">
                            {item.time || "-"}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {item.agenda || "-"}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.location || "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 5: Bagan Turnamen / Bracket (Jika ada) */}
          {bracket && (
            <Card className="border shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base font-bold">
                    {bracket.title || "Bagan Pertandingan"}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Format turnamen: {bracket.type || "Single Elimination"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Bagan pertandingan diperbarui secara berkala oleh panitia selama perlombaan berlangsung.
                </p>
                {bracket.challongeUrl && (
                  <a
                    href={bracket.challongeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="text-xs gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Buka Bagan di Challonge</span>
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Card: Pendaftaran Peserta */}
          <Card className="border shadow-xs">
            <CardHeader className="space-y-2 pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-bold">Pendaftaran Peserta</CardTitle>
              </div>
              <CardDescription className="text-xs">
                {isOpen
                  ? "Formulir pendaftaran sedang dibuka secara online."
                  : "Pendaftaran saat ini sedang ditutup."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-2 border-y border-border/70 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status Pendaftaran:</span>
                  <span className="font-semibold text-foreground">
                    {isOpen ? "Dibuka" : "Ditutup"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Kuota Peserta:</span>
                  <span className="font-semibold text-foreground">
                    {competition.maxQuota
                      ? `${competition.maxQuota} peserta/tim`
                      : "Terbuka untuk umum"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Biaya Registrasi:</span>
                  <span className="font-bold text-primary">{formattedFee}</span>
                </div>
              </div>

              {isOpen && !competition.noRegistrationNeeded ? (
                <Link href={`/competition/${competition.id}/register`} className="w-full block">
                  <Button size="lg" className="w-full text-xs font-semibold gap-2">
                    <Users className="h-4 w-4" />
                    <span>Daftar Sekarang (Formulir Online)</span>
                  </Button>
                </Link>
              ) : competition.noRegistrationNeeded ? (
                <Button size="lg" disabled variant="secondary" className="w-full text-xs">
                  Event Bebas Registrasi
                </Button>
              ) : (
                <Button size="lg" disabled variant="destructive" className="w-full text-xs">
                  Pendaftaran Ditutup
                </Button>
              )}

              <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
                Pastikan sudah membaca buku panduan sebelum mengisi formulir pendaftaran resmi.
              </p>
            </CardContent>
          </Card>

          {/* Card: Narahubung / Contact Person */}
          <Card className="border shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-base font-bold">Narahubung (Contact Person)</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Hubungi narahubung panitia untuk pertanyaan seputar teknis lomba.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {competition.contactPersons && competition.contactPersons.length > 0 ? (
                <div className="space-y-2.5">
                  {competition.contactPersons.map((cp: any, idx: number) => {
                    const cleanPhone = String(cp.phone || "").replace(/[^0-9]/g, "");
                    const waUrl = cleanPhone.startsWith("0")
                      ? `https://wa.me/62${cleanPhone.slice(1)}`
                      : `https://wa.me/${cleanPhone}`;

                    return (
                      <div
                        key={cp.id || idx}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-muted/10 text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground">{cp.name}</p>
                          <p className="text-[11px] text-muted-foreground">{cp.phone}</p>
                        </div>
                        {cleanPhone && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 border-emerald-500/20"
                            >
                              <MessageCircle className="h-3.5 w-3.5 mr-1" />
                              <span>Chat WA</span>
                            </Button>
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Belum ada narahubung khusus yang dicantumkan untuk kompetisi ini.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}