import Link from "next/link";
import { CompetitionSelect } from "@/modules/competition/infrastructure/competition.table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Coins,
  FileText,
  Users,
  ArrowRight,
  UserCheck,
} from "lucide-react";

interface EventCardProps {
  competition: CompetitionSelect;
}

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

const EventCard = ({ competition }: EventCardProps) => {
  const isOpen = competition.status === "OPEN";
  const formattedFee = formatFee(competition.fee, competition.priceList);
  const regStart = formatDate(competition.registrationStartDate);
  const regEnd = formatDate(competition.registrationEndDate);
  const eventStart = formatDate(competition.eventStartDate);
  const eventEnd = formatDate(competition.eventEndDate);

  const documentCount = competition.documents?.length || (competition.guidebookUrl ? 1 : 0);

  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition-shadow border-border/80">
      <div>
        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className="text-[11px] font-semibold tracking-wide uppercase">
              {competition.type}
            </Badge>
            <Badge
              variant={isOpen ? "default" : "secondary"}
              className={isOpen ? "bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]" : "text-[11px]"}
            >
              {isOpen ? "Pendaftaran Dibuka" : "Pendaftaran Ditutup"}
            </Badge>
          </div>

          <div className="space-y-1">
            <CardTitle className="text-xl font-heading font-bold text-foreground line-clamp-1">
              {competition.name}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[34px]">
              {competition.description || "Kompetisi resmi Kemas Prasasti 2026."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-2.5 pb-4 text-xs">
          {/* Periode Pendaftaran */}
          <div className="flex items-start gap-2.5 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold uppercase text-foreground/80 block">
                Pendaftaran
              </span>
              <span>
                {regStart} - {regEnd}
              </span>
            </div>
          </div>

          {/* Pelaksanaan Event */}
          <div className="flex items-start gap-2.5 text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0 text-secondary mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold uppercase text-foreground/80 block">
                Pelaksanaan
              </span>
              <span>
                {eventStart} - {eventEnd}
              </span>
            </div>
          </div>

          {/* Biaya */}
          <div className="flex items-start gap-2.5 text-muted-foreground">
            <Coins className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <span className="text-[11px] font-semibold uppercase text-foreground/80 block">
                Biaya Pendaftaran
              </span>
              <span className="font-semibold text-foreground">{formattedFee}</span>
              {competition.priceList && competition.priceList.length > 1 && (
                <span className="text-[10px] text-muted-foreground block">
                  ({competition.priceList.length} pilihan paket biaya)
                </span>
              )}
            </div>
          </div>

          {/* Kuota */}
          <div className="flex items-center gap-2.5 text-muted-foreground">
            <Users className="h-4 w-4 shrink-0 text-sky-600" />
            <span>
              {competition.maxQuota
                ? `Kuota Maksimal: ${competition.maxQuota} peserta`
                : "Kuota: Terbuka untuk umum"}
            </span>
          </div>

          {/* Panduan */}
          {documentCount > 0 && (
            <div className="flex items-center gap-2.5 text-muted-foreground text-[11px]">
              <FileText className="h-4 w-4 shrink-0 text-primary/80" />
              <span>{documentCount} Berkas panduan & regulasi tersedia</span>
            </div>
          )}
        </CardContent>
      </div>

      <CardFooter className="pt-3 border-t border-border/60 flex flex-col sm:flex-row gap-2">
        <Link href={`/competition/${competition.id}`} className="w-full sm:flex-1">
          <Button variant="outline" size="sm" className="w-full text-xs">
            <FileText className="h-3.5 w-3.5 mr-1" />
            Lihat Detail
          </Button>
        </Link>

        {isOpen && !competition.noRegistrationNeeded ? (
          <Link href={`/competition/${competition.id}/register`} className="w-full sm:flex-1">
            <Button size="sm" className="w-full text-xs font-semibold">
              <UserCheck className="h-3.5 w-3.5 mr-1" />
              Daftar Sekarang
            </Button>
          </Link>
        ) : competition.noRegistrationNeeded ? (
          <Button variant="secondary" size="sm" disabled className="w-full sm:flex-1 text-xs">
            Tanpa Registrasi
          </Button>
        ) : (
          <Button variant="secondary" size="sm" disabled className="w-full sm:flex-1 text-xs">
            Pendaftaran Ditutup
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;