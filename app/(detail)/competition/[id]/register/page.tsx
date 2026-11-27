import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompetitionById,
  getActiveOrCreateForm,
} from "@/modules/competition/infrastructure/competition.repository";
import { DynamicFormRenderer } from "@/modules/registration/presentation/components/dynamic-form-renderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Coins,
  FileText,
  HelpCircle,
  MessageCircle,
  Phone,
  ShieldAlert,
  Trophy,
  Users,
} from "lucide-react";

interface PublicRegisterPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PublicRegisterPageProps): Promise<Metadata> {
  const { id } = await params;
  const competition = await getCompetitionById(id);

  if (!competition) {
    return {
      title: "Pendaftaran Tidak Ditemukan - Kemas Prasasti 2025",
    };
  }

  return {
    title: `Pendaftaran ${competition.name} - Kemas Prasasti 2025`,
    description: `Formulir pendaftaran resmi peserta ${competition.name} Kemas Prasasti 2025.`,
  };
}

export default async function PublicRegisterPage({
  params,
}: PublicRegisterPageProps) {
  const { id } = await params;
  const competition = await getCompetitionById(id);

  if (!competition) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-heading font-bold text-foreground">
              Kompetisi Tidak Ditemukan
            </h2>
            <p className="text-xs text-muted-foreground">
              Kompetisi dengan identitas &quot;{id}&quot; tidak terdaftar pada sistem kami.
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

  // Ambil formulir aktif untuk kompetisi ini
  let activeForm =
    competition.forms?.find((f) => f.id === competition.activeFormId) ||
    competition.forms?.[0] ||
    null;

  if (!activeForm) {
    activeForm = await getActiveOrCreateForm(competition.id);
  }

  const isClosed = competition.status === "CLOSED" || competition.status === "COMPLETED";

  const formattedFee =
    competition.fee === 0
      ? "Gratis (Free Entry)"
      : `Rp ${Number(competition.fee).toLocaleString("id-ID")}`;

  const formattedRegStart = new Date(competition.registrationStartDate).toLocaleDateString(
    "id-ID",
    { dateStyle: "medium" }
  );
  const formattedRegEnd = new Date(competition.registrationEndDate).toLocaleDateString(
    "id-ID",
    { dateStyle: "medium" }
  );

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Top Navigation & Breadcrumb */}
      <div className="flex items-center justify-between gap-4">
        <Link href={`/competition/${competition.id}`}>
          <Button variant="outline" size="sm" className="text-xs gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Detail Lomba</span>
          </Button>
        </Link>
        <Badge
          variant={isClosed ? "destructive" : "default"}
          className="text-xs font-semibold px-3 py-1"
        >
          {isClosed ? "Pendaftaran Ditutup" : "Pendaftaran Dibuka"}
        </Badge>
      </div>

      {/* Hero Header Box */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-background to-accent/15 border border-primary/20 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                {competition.type}
              </Badge>
              <span className="text-xs text-muted-foreground">Kemas Prasasti 2025</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">
              Formulir Pendaftaran: {competition.name}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
              {competition.description ||
                "Silakan lengkapi formulir pendaftaran resmi di bawah ini dengan data yang valid dan benar."}
            </p>
          </div>

          <div className="flex flex-col gap-2 bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border/60 shrink-0 text-xs min-w-[220px]">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Periode:</span>
            </div>
            <span className="font-semibold text-foreground">
              {formattedRegStart} - {formattedRegEnd}
            </span>
            <div className="border-t border-border/50 pt-2 space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Biaya:</span>
                <span className="font-bold text-primary">{formattedFee}</span>
              </div>
              {competition.priceList && competition.priceList.length > 1 && (
                <div className="space-y-1 pt-1 border-t border-border/40 text-[11px]">
                  {competition.priceList.map((tier) => {
                    const isExpired = tier.status === "EXPIRED";
                    return (
                      <div
                        key={tier.id}
                        className={`flex items-center justify-between gap-2 ${
                          isExpired
                            ? "line-through text-muted-foreground opacity-60"
                            : "text-foreground font-medium"
                        }`}
                      >
                        <span className="truncate">{tier.name}</span>
                        <span className="shrink-0 font-mono">
                          {tier.price === 0
                            ? "Gratis"
                            : `Rp ${Number(tier.price).toLocaleString("id-ID")}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Banner Jika Pendaftaran Ditutup */}
      {isClosed ? (
        <Card className="border-rose-500/30 bg-rose-500/5 p-8 text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <Calendar className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-heading font-bold text-foreground">
              Pendaftaran Telah Ditutup
            </h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Mohon maaf, periode pendaftaran untuk kompetisi{" "}
              <strong>{competition.name}</strong> saat ini sedang ditutup atau kuota pendaftaran telah terpenuhi.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link href="/competition">
              <Button size="sm" className="text-xs">
                Lihat Kompetisi Lain
              </Button>
            </Link>
          </div>
        </Card>
      ) : activeForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Dynamic Form */}
          <div className="lg:col-span-3">
            <DynamicFormRenderer
              competition={competition}
              form={activeForm}
            />
          </div>

          {/* Right Sidebar: Guidelines & Contact Person */}
          <div className="space-y-6">
            <Card className="border-border/70 shadow-xs">
              <CardContent className="p-5 space-y-3.5">
                <div className="flex items-center gap-2 text-primary font-heading font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="h-4 w-4" />
                  <span>Petunjuk Pendaftaran</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4 leading-relaxed">
                  <li>
                    Gunakan <strong>1 email aktif</strong> per pendaftaran. Sistem menolak pendaftaran ganda dengan email yang sama.
                  </li>
                  <li>
                    Sistem memiliki proteksi anti-spam (maksimal 3x submit/menit). Jangan melakukan klik berulang kali.
                  </li>
                  <li>
                    Pastikan berkas foto/PDF yang diunggah terbaca jelas dan tidak melebihi batas ukuran maksimal.
                  </li>
                  <li>
                    Simpan nomor registrasi yang didapatkan setelah formulir berhasil terkirim.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact Person Card */}
            {competition.contactPersons && competition.contactPersons.length > 0 && (
              <Card className="border-border/70 shadow-xs">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-foreground font-heading font-bold text-xs">
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    <span>Bantuan & Hubungi Panitia</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Jika ada kendala pendaftaran atau duplikasi email, hubungi:
                  </p>
                  <div className="space-y-2">
                    {competition.contactPersons.map((cp: any, idx: number) => {
                      const cleanPhone = String(cp.phone || "").replace(/[^0-9]/g, "");
                      const waUrl = cleanPhone.startsWith("0")
                        ? `https://wa.me/62${cleanPhone.slice(1)}`
                        : `https://wa.me/${cleanPhone}`;

                      return (
                        <div
                          key={cp.id || idx}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-muted/20 border border-border/50 text-xs"
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
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-md transition-colors"
                            >
                              <span>WA</span>
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card className="p-8 text-center space-y-3 border-dashed">
          <p className="text-xs text-muted-foreground">
            Formulir pendaftaran untuk kompetisi ini sedang dipersiapkan oleh panitia.
          </p>
        </Card>
      )}
    </div>
  );
}
