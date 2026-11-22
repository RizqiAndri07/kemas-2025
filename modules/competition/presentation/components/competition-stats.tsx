import { Trophy, Calendar, CheckCircle2, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CompetitionSelect } from "../../infrastructure/competition.table";
import { CompetitionType } from "../../domain/competition-type.enum";
import { CompetitionStatus } from "../../domain/competition-status.enum";

interface CompetitionStatsProps {
  competitions: CompetitionSelect[];
}

export function CompetitionStats({ competitions }: CompetitionStatsProps) {
  const total = competitions.length;
  const tournaments = competitions.filter((c) => c.type === CompetitionType.TOURNAMENT).length;
  const events = competitions.filter((c) => c.type === CompetitionType.EVENT).length;
  const openRegistrations = competitions.filter((c) => c.status === CompetitionStatus.OPEN).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total */}
      <Card className="p-3.5 bg-card/60 backdrop-blur-sm border-border flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Total Kompetisi & Event</p>
          <p className="text-2xl font-bold font-heading text-foreground">{total}</p>
        </div>
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <LayoutGrid className="h-5 w-5" />
        </div>
      </Card>

      {/* Tournaments */}
      <Card className="p-3.5 bg-card/60 backdrop-blur-sm border-border flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Turnamen (Tournament)</p>
          <p className="text-2xl font-bold font-heading text-purple-600 dark:text-purple-400">
            {tournaments}
          </p>
        </div>
        <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <Trophy className="h-5 w-5" />
        </div>
      </Card>

      {/* Events */}
      <Card className="p-3.5 bg-card/60 backdrop-blur-sm border-border flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Agenda (Event)</p>
          <p className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400">
            {events}
          </p>
        </div>
        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <Calendar className="h-5 w-5" />
        </div>
      </Card>

      {/* Open Registrations */}
      <Card className="p-3.5 bg-card/60 backdrop-blur-sm border-border flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">Pendaftaran Terbuka</p>
          <p className="text-2xl font-bold font-heading text-sky-600 dark:text-sky-400">
            {openRegistrations}
          </p>
        </div>
        <div className="h-9 w-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </Card>
    </div>
  );
}
