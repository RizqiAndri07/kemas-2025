"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bracket, participantMap } from "react-brackets";
import {
  Trophy,
  ExternalLink,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Crown,
  ArrowLeft,
  Sliders,
  CheckCircle2,
  Clock,
  Swords,
  Users,
  RefreshCw,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BracketWithCompetition } from "../../../infrastructure/competition-bracket.repository";
import { BracketManageDialog } from "./bracket-manage-dialog";

interface BracketDetailViewProps {
  bracket: BracketWithCompetition;
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

export function BracketDetailView({ bracket }: BracketDetailViewProps) {
  const router = useRouter();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);

  const stage = useMemo(() => {
    if (!bracket?.data || typeof bracket.data !== "object") return null;
    const d = bracket.data as any;
    if (!d.groups || !Array.isArray(d.groups) || d.groups.length === 0) return null;
    return d;
  }, [bracket?.data]);

  const pMap = useMemo(() => {
    if (!stage) return new Map();
    try {
      return participantMap(stage);
    } catch {
      return new Map();
    }
  }, [stage]);

  // Statistics Calculation
  const stats = useMemo(() => {
    if (!stage?.groups?.[0]?.rounds) {
      return {
        totalRounds: 0,
        totalMatches: 0,
        completedMatches: 0,
        champion: null as string | null,
        totalParticipants: 0,
      };
    }

    const rounds = stage.groups[0].rounds;
    let totalMatches = 0;
    let completedMatches = 0;

    for (const r of rounds) {
      if (Array.isArray(r.matches)) {
        totalMatches += r.matches.length;
        for (const m of r.matches) {
          if (m.status === "completed") {
            completedMatches++;
          }
        }
      }
    }

    // Check final match for champion
    let champion: string | null = null;
    const finalRound = rounds[rounds.length - 1];
    if (finalRound?.matches?.length > 0) {
      const finalMatch = finalRound.matches[0];
      if (finalMatch?.status === "completed" && finalMatch.winner !== undefined && finalMatch.winner !== null) {
        const winSlot = finalMatch.slots?.[finalMatch.winner];
        if (winSlot?.participantId) {
          const part = pMap.get(winSlot.participantId);
          champion = part?.name || null;
        }
      }
    }

    return {
      totalRounds: rounds.length,
      totalMatches,
      completedMatches,
      champion,
      totalParticipants: pMap.size,
    };
  }, [stage, pMap]);

  const handleZoom = (delta: number) => {
    setZoomScale((prev) => Math.min(Math.max(0.5, Number((prev + delta).toFixed(2))), 2.0));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-background p-6 overflow-hidden flex flex-col" : ""}`}>
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col gap-4 border-b border-border/60 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Back & Breadcrumb / Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/competition/bracket"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className: "h-8 -ml-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground",
                })}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Daftar Bagan</span>
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Badge
                variant="outline"
                className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 text-[11px] font-semibold flex items-center gap-1"
              >
                <Trophy className="h-3 w-3" />
                {formatBracketType(bracket.type)}
              </Badge>
              <Badge variant="secondary" className="text-[10px] h-5">
                {bracket.competitionName}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span>{bracket.title || `Bagan ${bracket.competitionName}`}</span>
              {stats.champion && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-medium">
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  Juara: <strong>{stats.champion}</strong>
                </span>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">
              Skema dan visualisasi struktur bagan pertandingan kompetisi turnamen resmi.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2.5 self-start sm:self-center">
            {bracket.challongeUrl && (
              <a
                href={bracket.challongeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-border/80 bg-background hover:bg-muted/60 transition-colors shadow-xs"
                title="Buka Challonge di tab baru"
              >
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Challonge</span>
              </a>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => handleZoom(-0.15)}
                title="Perkecil (Zoom Out)"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-mono"
                onClick={handleResetZoom}
                title="Reset Ukuran Zoom (100%)"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                <span>{Math.round(zoomScale * 100)}%</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => handleZoom(0.15)}
                title="Perbesar (Zoom In)"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            {/* Fullscreen Toggle */}
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 border-border/80"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Keluar Layar Penuh (ESC)" : "Layar Penuh"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>

            {/* Manage Scores and Seeding */}
            <Button
              variant="default"
              size="sm"
              className="h-9 text-xs gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-medium shadow-sm"
              onClick={() => setIsManageDialogOpen(true)}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Kelola Skor & Seeding</span>
            </Button>
          </div>
        </div>

        {/* Tournament Quick Stats Bar (Only when stage exists and not in compact fullscreen mode) */}
        {stage && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-2xs">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                <Users className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Total Tim / Slot</span>
                <p className="text-sm font-bold text-foreground">{stats.totalParticipants} Peserta</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-2xs">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                <Swords className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Babak Turnamen</span>
                <p className="text-sm font-bold text-foreground">{stats.totalRounds} Babak</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-2xs">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Pertandingan Selesai</span>
                <p className="text-sm font-bold text-foreground">
                  {stats.completedMatches} / {stats.totalMatches} Selesai
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border/80 shadow-2xs">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                <Trophy className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider">Status Juara</span>
                <p className="text-sm font-bold text-foreground truncate max-w-[150px]">
                  {stats.champion || "Sedang Berlangsung"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Bracket Interactive Canvas */}
      <div
        className={`bg-muted/20 dark:bg-muted/10 rounded-2xl border border-border/70 p-6 sm:p-8 relative overflow-auto shadow-inner ${
          isFullscreen ? "flex-1 min-h-0" : "min-h-[650px] max-h-[calc(100vh-250px)]"
        }`}
      >
        {stage ? (
          <div
            className="min-w-fit min-h-full flex items-center justify-start p-4 transition-transform origin-top-left duration-150"
            style={{ transform: `scale(${zoomScale})` }}
          >
            <Bracket
              stage={stage}
              renderMatch={(match: any) => {
                const slotA = match.slots?.[0];
                const slotB = match.slots?.[1];

                const partA = slotA?.participantId ? pMap.get(slotA.participantId) : null;
                const partB = slotB?.participantId ? pMap.get(slotB.participantId) : null;

                const isWinnerA = match.winner === 0;
                const isWinnerB = match.winner === 1;
                const isCompleted = match.status === "completed";

                return (
                  <div className="w-60 bg-card dark:bg-card/95 border border-border/80 rounded-xl shadow-xs hover:shadow-md transition-all overflow-hidden text-xs">
                    {/* Match Header Strip */}
                    <div className="px-3 py-1.5 bg-muted/40 border-b border-border/60 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span className="font-semibold text-foreground/80">
                        {match.id?.split(".")?.slice(-2)?.join(" ")?.toUpperCase() || "MATCH"}
                      </span>
                      <span>
                        {isCompleted ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                            <Crown className="h-2.5 w-2.5" /> SELESAI
                          </span>
                        ) : partA && partB ? (
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            SIAP TANDING
                          </span>
                        ) : (
                          <span className="text-muted-foreground/70">MENUNGGU</span>
                        )}
                      </span>
                    </div>

                    {/* Team A Slot */}
                    <div
                      className={`flex items-center justify-between px-3.5 py-2.5 border-b border-border/40 transition-colors ${
                        isWinnerA
                          ? "bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300"
                          : isCompleted
                            ? "opacity-60 text-muted-foreground"
                            : "text-foreground"
                      }`}
                    >
                      <span className="truncate pr-2 max-w-[150px]" title={partA?.name || "TBD"}>
                        {partA?.name || <em className="text-muted-foreground/60">TBD</em>}
                      </span>
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                          isWinnerA
                            ? "bg-emerald-600 text-white font-bold shadow-2xs"
                            : "bg-muted text-foreground/80"
                        }`}
                      >
                        {slotA?.score !== undefined ? slotA.score : "-"}
                      </span>
                    </div>

                    {/* Team B Slot */}
                    <div
                      className={`flex items-center justify-between px-3.5 py-2.5 transition-colors ${
                        isWinnerB
                          ? "bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300"
                          : isCompleted
                            ? "opacity-60 text-muted-foreground"
                            : "text-foreground"
                      }`}
                    >
                      <span className="truncate pr-2 max-w-[150px]" title={partB?.name || "TBD"}>
                        {partB?.name || <em className="text-muted-foreground/60">TBD</em>}
                      </span>
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded-md ${
                          isWinnerB
                            ? "bg-emerald-600 text-white font-bold shadow-2xs"
                            : "bg-muted text-foreground/80"
                        }`}
                      >
                        {slotB?.score !== undefined ? slotB.score : "-"}
                      </span>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center max-w-md mx-auto space-y-4 py-16">
            <div className="p-4 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
              <Trophy className="h-10 w-10" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-semibold text-foreground">
                Bagan Pertandingan Belum Diundi
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Bagan untuk turnamen <strong>{bracket.competitionName}</strong> ini masih dalam status draf
                atau belum dilakukan pengundian seeding dari peserta terverifikasi.
              </p>
            </div>
            <Button
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 shadow-sm"
              onClick={() => setIsManageDialogOpen(true)}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Mulai Undi Peserta & Buat Bagan Sekarang</span>
            </Button>
          </div>
        )}
      </div>

      {/* Bracket Manage / Edit Score & Seeding Dialog */}
      <BracketManageDialog
        isOpen={isManageDialogOpen}
        onClose={() => setIsManageDialogOpen(false)}
        bracket={bracket}
        onSuccess={() => {
          setIsManageDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
