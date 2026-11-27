"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import { Bracket, participantMap } from "react-brackets";
import { BracketWithCompetition } from "../../../infrastructure/competition-bracket.repository";

interface BracketViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bracket: BracketWithCompetition | null;
  onOpenEdit?: () => void;
}

export function BracketViewerDialog({
  isOpen,
  onClose,
  bracket,
  onOpenEdit,
}: BracketViewerDialogProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

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

  const handleZoom = (delta: number) => {
    setZoomScale((prev) => Math.min(Math.max(0.6, prev + delta), 1.8));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  if (!bracket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`flex flex-col transition-all duration-200 ${
          isFullscreen
            ? "fixed inset-0 w-screen h-screen max-w-none rounded-none m-0 p-6 z-50 bg-background"
            : "max-w-6xl max-h-[92vh] h-[850px] p-6"
        }`}
      >
        {/* Header Bar */}
        <DialogHeader className="border-b border-border/60 pb-3 flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20 text-[11px] font-semibold flex items-center gap-1"
                >
                  <Trophy className="h-3 w-3" />
                  {bracket.type === "SINGLE_ELIMINATION"
                    ? "Single Elimination"
                    : bracket.type === "DOUBLE_ELIMINATION"
                      ? "Double Elimination"
                      : bracket.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Event: <strong className="text-foreground">{bracket.competitionName}</strong>
                </span>
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {bracket.title || "Bagan Pertandingan"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Visualisasi bagan pohon turnamen resmi Kemas Prasasti 2025.
              </DialogDescription>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {bracket.challongeUrl && (
                <a
                  href={bracket.challongeUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Buka Challonge"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium border border-border/80 bg-background hover:bg-muted/60 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="hidden sm:inline">Challonge</span>
                </a>
              )}

              <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => handleZoom(-0.15)}
                  title="Perkecil (Zoom Out)"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={handleResetZoom}
                  title="Reset Ukuran"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-xs"
                  onClick={() => handleZoom(0.15)}
                  title="Perbesar (Zoom In)"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-xs border-border/80"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? "Keluar Layar Penuh" : "Layar Penuh"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-3.5 w-3.5" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5" />
                )}
              </Button>

              {onOpenEdit && (
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium"
                  onClick={() => {
                    onClose();
                    onOpenEdit();
                  }}
                >
                  Kelola Skor & Seeding
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Bracket Content Container */}
        <div className="flex-1 overflow-auto bg-muted/20 dark:bg-muted/10 rounded-xl border border-border/60 p-4 sm:p-6 relative">
          {stage ? (
            <div
              className="min-w-fit min-h-full flex items-center justify-center transition-transform origin-top-left duration-150"
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
                    <div className="w-56 bg-card dark:bg-card/95 border border-border/80 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden text-xs">
                      {/* Match Status Strip */}
                      <div className="px-2.5 py-1 bg-muted/40 border-b border-border/60 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>{match.id?.split(".")?.slice(-2)?.join(" ")?.toUpperCase() || "MATCH"}</span>
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
                            <span className="text-muted-foreground/80">MENUNGGU</span>
                          )}
                        </span>
                      </div>

                      {/* Team A Slot */}
                      <div
                        className={`flex items-center justify-between px-3 py-2 border-b border-border/40 transition-colors ${
                          isWinnerA
                            ? "bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300"
                            : isCompleted
                              ? "opacity-60 text-muted-foreground"
                              : "text-foreground"
                        }`}
                      >
                        <span className="truncate pr-2 max-w-[140px]" title={partA?.name || "TBD"}>
                          {partA?.name || <em className="text-muted-foreground/60">TBD</em>}
                        </span>
                        <span
                          className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                            isWinnerA
                              ? "bg-emerald-600 text-white font-bold"
                              : "bg-muted text-foreground/80"
                          }`}
                        >
                          {slotA?.score !== undefined ? slotA.score : "-"}
                        </span>
                      </div>

                      {/* Team B Slot */}
                      <div
                        className={`flex items-center justify-between px-3 py-2 transition-colors ${
                          isWinnerB
                            ? "bg-emerald-500/10 font-bold text-emerald-700 dark:text-emerald-300"
                            : isCompleted
                              ? "opacity-60 text-muted-foreground"
                              : "text-foreground"
                        }`}
                      >
                        <span className="truncate pr-2 max-w-[140px]" title={partB?.name || "TBD"}>
                          {partB?.name || <em className="text-muted-foreground/60">TBD</em>}
                        </span>
                        <span
                          className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                            isWinnerB
                              ? "bg-emerald-600 text-white font-bold"
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
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4 py-16">
              <div className="p-4 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">
                <Trophy className="h-10 w-10" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-semibold text-foreground">
                  Bagan Pertandingan Belum Diundi
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Bagan untuk turnamen <strong>{bracket.competitionName}</strong> ini masih dalam
                  status draf atau belum dilakukan seeding peserta terverifikasi.
                </p>
              </div>
              {onOpenEdit && (
                <Button
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 shadow-sm"
                  onClick={() => {
                    onClose();
                    onOpenEdit();
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Mulai Undi Peserta Sekarang
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
