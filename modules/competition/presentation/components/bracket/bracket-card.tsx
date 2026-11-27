"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Eye,
  Sliders,
  Trash2,
  ExternalLink,
  Calendar,
  Users,
  Swords,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { BracketWithCompetition } from "../../../infrastructure/competition-bracket.repository";

interface BracketCardProps {
  bracket: BracketWithCompetition;
  onView?: (bracket: BracketWithCompetition) => void;
  onEdit: (bracket: BracketWithCompetition) => void;
  onDelete: (bracket: BracketWithCompetition) => void;
}

function formatBracketType(type: string): string {
  switch (type) {
    case "SINGLE_ELIMINATION":
      return "Single Elimination";
    case "DOUBLE_ELIMINATION":
      return "Double Elimination";
    case "ROUND_ROBIN":
      return "Round Robin";
    case "SWISS":
      return "Swiss System";
    default:
      return type;
  }
}

function formatDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function BracketCard({
  bracket,
  onView,
  onEdit,
  onDelete,
}: BracketCardProps) {
  const bracketStats = useMemo(() => {
    if (!bracket.data || typeof bracket.data !== "object") {
      return { isGenerated: false, roundsCount: 0, matchesCount: 0, completedMatches: 0 };
    }
    const d = bracket.data as any;
    const group = d.groups?.[0];
    if (!group || !Array.isArray(group.rounds) || group.rounds.length === 0) {
      return { isGenerated: false, roundsCount: 0, matchesCount: 0, completedMatches: 0 };
    }

    const roundsCount = group.rounds.length;
    let matchesCount = 0;
    let completedMatches = 0;

    for (const r of group.rounds) {
      if (Array.isArray(r.matches)) {
        matchesCount += r.matches.length;
        for (const m of r.matches) {
          if (m.status === "completed") {
            completedMatches++;
          }
        }
      }
    }

    return {
      isGenerated: true,
      roundsCount,
      matchesCount,
      completedMatches,
    };
  }, [bracket.data]);

  return (
    <Card className="flex flex-col justify-between border-border/80 shadow-sm hover:shadow-md hover:border-purple-500/40 transition-all duration-200 overflow-hidden bg-card">
      <div>
        {/* Header Ribbon & Badges */}
        <CardHeader className="p-4 pb-3 space-y-2 border-b border-border/40 bg-muted/20">
          <div className="flex items-center justify-between gap-2">
            <Badge
              variant="outline"
              className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 text-[10px] font-semibold flex items-center gap-1"
            >
              <Trophy className="h-3 w-3" />
              {formatBracketType(bracket.type)}
            </Badge>

            <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(bracket.updatedAt)}
            </span>
          </div>

          <div className="space-y-0.5">
            <CardTitle className="text-base font-bold tracking-tight text-foreground line-clamp-1">
              {bracket.competitionName}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground line-clamp-1">
              {bracket.title || "Bagan Pertandingan Turnamen"}
            </CardDescription>
          </div>
        </CardHeader>

        {/* Content Body */}
        <CardContent className="p-4 space-y-3 text-xs">
          {/* Status Bagan */}
          {bracketStats.isGenerated ? (
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Bagan Aktif & Berjalan
                </span>
                <span className="text-[10px] font-mono font-medium text-muted-foreground">
                  {bracketStats.completedMatches} / {bracketStats.matchesCount} Selesai
                </span>
              </div>

              {/* Progress bar match selesai */}
              <div className="w-full bg-emerald-500/20 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      bracketStats.matchesCount > 0
                        ? (bracketStats.completedMatches / bracketStats.matchesCount) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                <span className="flex items-center gap-1">
                  <Swords className="h-3 w-3 text-muted-foreground" />
                  {bracketStats.roundsCount} Babak Turnamen
                </span>
                <span>{bracketStats.matchesCount} Pertandingan</span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold text-xs">
                <Clock className="h-3.5 w-3.5" />
                Bagan Belum Diundi
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Pilih peserta terverifikasi dan lakukan undian bagan turnamen melalui tombol Edit.
              </p>
            </div>
          )}

          {/* Challonge Link if available */}
          {bracket.challongeUrl && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/60 text-[11px]">
              <span className="text-muted-foreground truncate max-w-[170px]">
                {bracket.challongeUrl.replace(/^https?:\/\//, "")}
              </span>
              <a
                href={bracket.challongeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>Buka</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </div>

      {/* Footer Action Buttons */}
      <CardFooter className="p-4 pt-2 border-t border-border/40 flex items-center justify-between gap-2 bg-muted/10">
        <Link
          href={`/dashboard/competition/bracket/${bracket.competitionId}`}
          className={buttonVariants({
            variant: "outline",
            size: "sm",
            className:
              "h-8 text-xs gap-1.5 flex-1 border-border/80 hover:bg-purple-500/10 hover:text-purple-700 dark:hover:text-purple-300 hover:border-purple-500/30 font-medium",
          })}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>View</span>
        </Link>

        <Button
          variant="default"
          size="sm"
          className="h-8 text-xs gap-1.5 flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm"
          onClick={() => onEdit(bracket)}
        >
          <Sliders className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={() => onDelete(bracket)}
          title="Hapus Bagan Pertandingan"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
