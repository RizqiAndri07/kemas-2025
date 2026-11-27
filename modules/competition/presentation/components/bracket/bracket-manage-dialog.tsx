"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/sonner";
import {
  Trophy,
  Users,
  Shuffle,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Save,
  Loader2,
  Swords,
  Crown,
  Sparkles,
} from "lucide-react";
import { BracketWithCompetition, VerifiedParticipant } from "../../../infrastructure/competition-bracket.repository";
import {
  getVerifiedParticipantsAction,
  saveBracketAction,
} from "../../../application/competition.actions";
import {
  generateBracketStage,
  updateMatchScore,
  resetMatch,
  extractBracketRounds,
  shuffleParticipants,
  FormattedBracketRound,
} from "../../../domain/bracket-engine.helper";

interface BracketManageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bracket: BracketWithCompetition | null;
  onSuccess?: () => void;
}

export function BracketManageDialog({
  isOpen,
  onClose,
  bracket,
  onSuccess,
}: BracketManageDialogProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("drawing");
  const [isPending, startTransition] = useTransition();

  // State Form Metadata
  const [title, setTitle] = useState("");
  const [type, setType] = useState("SINGLE_ELIMINATION");
  const [challongeUrl, setChallongeUrl] = useState("");

  // State Verified Participants & Seeding
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);
  const [verifiedList, setVerifiedList] = useState<VerifiedParticipant[]>([]);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [seedOrder, setSeedOrder] = useState<VerifiedParticipant[]>([]);

  // State Bracket Data
  const [currentStage, setCurrentStage] = useState<any>(null);
  const [showConfirmRegenerate, setShowConfirmRegenerate] = useState(false);

  // Match Scoring Temporary Inputs
  const [matchScores, setMatchScores] = useState<Record<string, { scoreA: number | ""; scoreB: number | "" }>>({});

  useEffect(() => {
    if (isOpen && bracket) {
      setTitle(bracket.title || `Bagan Pertandingan ${bracket.competitionName}`);
      setType(bracket.type || "SINGLE_ELIMINATION");
      setChallongeUrl(bracket.challongeUrl || "");
      setCurrentStage(bracket.data && typeof bracket.data === "object" && (bracket.data as any).groups ? bracket.data : null);

      // Default to matches tab if stage already exists, else drawing
      const hasStage = bracket.data && typeof bracket.data === "object" && (bracket.data as any).groups?.length > 0;
      setActiveTab(hasStage ? "matches" : "drawing");

      // Load verified participants
      loadParticipants(bracket.competitionId);
    }
  }, [isOpen, bracket]);

  const loadParticipants = async (competitionId: string) => {
    setIsLoadingParticipants(true);
    try {
      const res = await getVerifiedParticipantsAction(competitionId);
      if (res.success && res.data) {
        setVerifiedList(res.data);
        setSelectedParticipantIds(res.data.map((p) => p.id));
        setSeedOrder(res.data);
      } else {
        setVerifiedList([]);
        setSelectedParticipantIds([]);
        setSeedOrder([]);
      }
    } catch (err) {
      console.error("Gagal memuat peserta terverifikasi:", err);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedParticipantIds(verifiedList.map((p) => p.id));
      setSeedOrder(verifiedList);
    } else {
      setSelectedParticipantIds([]);
      setSeedOrder([]);
    }
  };

  const handleToggleParticipant = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedParticipantIds((prev) => [...prev, id]);
      const p = verifiedList.find((item) => item.id === id);
      if (p) setSeedOrder((prev) => [...prev, p]);
    } else {
      setSelectedParticipantIds((prev) => prev.filter((item) => item !== id));
      setSeedOrder((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleShuffleSeeds = () => {
    setSeedOrder((prev) => shuffleParticipants(prev));
    toast.success("Urutan seeding berhasil diacak secara acak (shuffle)!");
  };

  const handleGenerateBracket = () => {
    if (!bracket) return;
    if (seedOrder.length < 2) {
      toast.error("Minimal harus memilih 2 tim/peserta terverifikasi untuk mengundi bagan");
      return;
    }

    if (currentStage && currentStage.groups?.length > 0) {
      setShowConfirmRegenerate(true);
      return;
    }

    executeBracketGeneration();
  };

  const executeBracketGeneration = () => {
    if (!bracket) return;

    try {
      const newStage = generateBracketStage(seedOrder, type);
      setCurrentStage(newStage);

      startTransition(async () => {
        const res = await saveBracketAction(bracket.competitionId, {
          title: title.trim(),
          type,
          challongeUrl: challongeUrl.trim() || null,
          data: newStage,
        });

        if (!res.success) {
          toast.error(res.error || "Gagal menyimpan bagan pertandingan yang baru diundi");
          return;
        }

        toast.success(`Bagan turnamen berhasil diundi dengan ${seedOrder.length} peserta!`);
        setShowConfirmRegenerate(false);
        setActiveTab("matches");
        onSuccess?.();
        router.refresh();
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengundi bagan turnamen");
    }
  };

  const rounds: FormattedBracketRound[] = useMemo(() => {
    if (!currentStage) return [];
    return extractBracketRounds(currentStage);
  }, [currentStage]);

  // Handle Score Inputs
  const handleScoreChange = (matchId: string, team: "scoreA" | "scoreB", value: string) => {
    const num = value === "" ? "" : Math.max(0, parseInt(value, 10) || 0);
    setMatchScores((prev) => ({
      ...prev,
      [matchId]: {
        scoreA: team === "scoreA" ? num : (prev[matchId]?.scoreA ?? ""),
        scoreB: team === "scoreB" ? num : (prev[matchId]?.scoreB ?? ""),
      },
    }));
  };

  const handleSaveMatchScore = (matchId: string, currentScoreA?: number, currentScoreB?: number) => {
    if (!bracket || !currentStage) return;

    const inputScore = matchScores[matchId];
    const scoreA = typeof inputScore?.scoreA === "number" ? inputScore.scoreA : (currentScoreA ?? 0);
    const scoreB = typeof inputScore?.scoreB === "number" ? inputScore.scoreB : (currentScoreB ?? 0);

    if (scoreA === scoreB) {
      toast.error("Pertandingan sistem gugur memerlukan pemenang. Skor tidak boleh seri.");
      return;
    }

    try {
      const updatedStage = updateMatchScore(currentStage, matchId, [scoreA, scoreB]);
      setCurrentStage(updatedStage);

      startTransition(async () => {
        const res = await saveBracketAction(bracket.competitionId, {
          title,
          type,
          challongeUrl: challongeUrl.trim() || null,
          data: updatedStage,
        });

        if (!res.success) {
          toast.error(res.error || "Gagal menyimpan skor pertandingan");
          return;
        }

        toast.success("Skor pertandingan berhasil disimpan & pemenang lolos!");
        onSuccess?.();
        router.refresh();
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal memperbarui skor pertandingan");
    }
  };

  const handleResetMatchScore = (matchId: string) => {
    if (!bracket || !currentStage) return;

    try {
      const updatedStage = resetMatch(currentStage, matchId);
      setCurrentStage(updatedStage);

      startTransition(async () => {
        const res = await saveBracketAction(bracket.competitionId, {
          title,
          type,
          challongeUrl: challongeUrl.trim() || null,
          data: updatedStage,
        });

        if (!res.success) {
          toast.error(res.error || "Gagal mereset skor pertandingan");
          return;
        }

        toast.success("Hasil pertandingan berhasil direset!");
        onSuccess?.();
        router.refresh();
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mereset pertandingan");
    }
  };

  const handleSaveInfo = () => {
    if (!bracket) return;
    if (!title.trim()) {
      toast.error("Judul bagan pertandingan tidak boleh kosong");
      return;
    }

    startTransition(async () => {
      const res = await saveBracketAction(bracket.competitionId, {
        title: title.trim(),
        type,
        challongeUrl: challongeUrl.trim() || null,
        data: currentStage || {},
      });

      if (!res.success) {
        toast.error(res.error || "Gagal menyimpan info bagan");
        return;
      }

      toast.success("Informasi bagan berhasil diperbarui!");
      onSuccess?.();
      router.refresh();
    });
  };

  if (!bracket) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6">
          <DialogHeader className="border-b border-border/60 pb-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium text-xs">
              <Trophy className="h-4 w-4" />
              <span>Kelola Bagan & Turnamen</span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              {bracket.competitionName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Drawing peserta terverifikasi, manajemen skor babak tanding, dan status bracket.
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col min-h-0 pt-2"
          >
            <TabsList className="grid w-full grid-cols-3 bg-muted/70 p-1 mb-4 flex-shrink-0">
              <TabsTrigger value="drawing" className="text-xs flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>1. Drawing & Seeding</span>
              </TabsTrigger>
              <TabsTrigger value="matches" className="text-xs flex items-center gap-1.5">
                <Swords className="h-3.5 w-3.5" />
                <span>2. Live Match & Skor</span>
              </TabsTrigger>
              <TabsTrigger value="info" className="text-xs flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                <span>3. Info & Challonge</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: DRAWING & SEEDING */}
            <TabsContent value="drawing" className="flex-1 overflow-auto space-y-4 pr-1">
              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-foreground">
                      Pendaftar Terverifikasi (Status VERIFIED)
                    </span>
                    <Badge variant="secondary" className="text-[11px] font-mono">
                      {seedOrder.length} dari {verifiedList.length} terpilih
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Hanya pendaftar berstatus terverifikasi yang dapat dimasukkan ke dalam bagan pertandingan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10"
                    onClick={handleShuffleSeeds}
                    disabled={seedOrder.length < 2 || isPending}
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    <span>Acak Urutan (Shuffle)</span>
                  </Button>

                  <Button
                    size="sm"
                    className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium gap-1.5 shadow-sm"
                    onClick={handleGenerateBracket}
                    disabled={seedOrder.length < 2 || isPending}
                  >
                    {isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5 fill-current" />
                    )}
                    <span>Generate Bagan</span>
                  </Button>
                </div>
              </div>

              {/* Participants Selection Checklist */}
              {isLoadingParticipants ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-xs gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  <span>Memuat daftar peserta terverifikasi...</span>
                </div>
              ) : verifiedList.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-8 text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
                  <h4 className="font-semibold text-sm text-foreground">Belum Ada Peserta Terverifikasi</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Belum ada pendaftaran dengan status VERIFIED untuk kompetisi ini. Verifikasi pendaftaran terlebih dahulu di menu Pendaftaran.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="select-all"
                        checked={
                          selectedParticipantIds.length === verifiedList.length &&
                          verifiedList.length > 0
                        }
                        onCheckedChange={handleToggleSelectAll}
                      />
                      <label
                        htmlFor="select-all"
                        className="text-xs font-semibold cursor-pointer text-foreground"
                      >
                        Pilih Semua ({verifiedList.length} Peserta)
                      </label>
                    </div>
                    <span className="text-[11px] text-muted-foreground italic">
                      Urutan di bawah ini menjadi Seed #1, Seed #2, dst.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {seedOrder.map((participant, idx) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted/40 transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <Checkbox
                            id={`part-${participant.id}`}
                            checked={selectedParticipantIds.includes(participant.id)}
                            onCheckedChange={(checked) =>
                              handleToggleParticipant(participant.id, !!checked)
                            }
                          />
                          <Badge
                            variant="outline"
                            className="h-5 w-5 p-0 flex items-center justify-center font-mono text-[10px] bg-muted"
                          >
                            #{idx + 1}
                          </Badge>
                          <div className="truncate">
                            <span className="font-semibold text-foreground truncate block">
                              {participant.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {participant.registrationNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: LIVE MATCH & SCORING */}
            <TabsContent value="matches" className="flex-1 overflow-auto space-y-4 pr-1">
              {!currentStage || rounds.length === 0 ? (
                <div className="border border-dashed border-border rounded-xl p-10 text-center space-y-3">
                  <Swords className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground">
                      Bagan Belum Diundi
                    </h4>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Silakan buka tab <strong>1. Drawing & Seeding</strong> untuk memilih peserta dan mengundi bagan pertandingan terlebih dahulu.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => setActiveTab("drawing")}
                  >
                    Buka Tab Drawing
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {rounds.map((round) => (
                    <div key={round.roundNumber} className="space-y-2.5">
                      <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-purple-600 text-white font-semibold text-xs">
                            {round.title}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {round.matches.length} Pertandingan
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {round.matches.map((match) => {
                          const inputScore = matchScores[match.id];
                          const scoreA =
                            inputScore?.scoreA !== undefined && inputScore.scoreA !== ""
                              ? inputScore.scoreA
                              : (match.teamA?.score ?? "");
                          const scoreB =
                            inputScore?.scoreB !== undefined && inputScore.scoreB !== ""
                              ? inputScore.scoreB
                              : (match.teamB?.score ?? "");

                          const isReady = !!match.teamA && !!match.teamB;
                          const isCompleted = match.status === "completed";

                          return (
                            <div
                              key={match.id}
                              className={`border rounded-xl p-3 bg-card shadow-sm space-y-3 transition-colors ${
                                isCompleted
                                  ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                                  : isReady
                                    ? "border-border/80"
                                    : "border-border/40 opacity-70"
                              }`}
                            >
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span className="font-mono font-medium">
                                  {match.id.toUpperCase()}
                                </span>
                                {isCompleted ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-semibold gap-1"
                                  >
                                    <Crown className="h-2.5 w-2.5" /> Selesai
                                  </Badge>
                                ) : isReady ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]"
                                  >
                                    Siap Tanding
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-[10px] text-muted-foreground"
                                  >
                                    Menunggu Lawan
                                  </Badge>
                                )}
                              </div>

                              {/* Tim A Row */}
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`text-xs truncate flex-1 ${
                                    match.teamA?.isWinner
                                      ? "font-bold text-emerald-600 dark:text-emerald-400"
                                      : "text-foreground"
                                  }`}
                                  title={match.teamA?.name || "TBD"}
                                >
                                  {match.teamA?.name || <em className="text-muted-foreground/60">TBD (Menunggu)</em>}
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  className="w-16 h-8 text-xs text-center font-mono font-semibold"
                                  value={scoreA}
                                  onChange={(e) =>
                                    handleScoreChange(match.id, "scoreA", e.target.value)
                                  }
                                  disabled={!isReady || isPending}
                                />
                              </div>

                              {/* Tim B Row */}
                              <div className="flex items-center justify-between gap-2">
                                <span
                                  className={`text-xs truncate flex-1 ${
                                    match.teamB?.isWinner
                                      ? "font-bold text-emerald-600 dark:text-emerald-400"
                                      : "text-foreground"
                                  }`}
                                  title={match.teamB?.name || "TBD"}
                                >
                                  {match.teamB?.name || <em className="text-muted-foreground/60">TBD (Menunggu)</em>}
                                </span>
                                <Input
                                  type="number"
                                  min="0"
                                  placeholder="0"
                                  className="w-16 h-8 text-xs text-center font-mono font-semibold"
                                  value={scoreB}
                                  onChange={(e) =>
                                    handleScoreChange(match.id, "scoreB", e.target.value)
                                  }
                                  disabled={!isReady || isPending}
                                />
                              </div>

                              {/* Match Action Buttons */}
                              {isReady && (
                                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/40">
                                  {isCompleted && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-[11px] text-muted-foreground hover:text-destructive gap-1 px-2"
                                      onClick={() => handleResetMatchScore(match.id)}
                                      disabled={isPending}
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                      Reset
                                    </Button>
                                  )}

                                  <Button
                                    size="sm"
                                    className="h-7 text-[11px] bg-purple-600 hover:bg-purple-700 text-white font-medium gap-1 px-2.5"
                                    onClick={() =>
                                      handleSaveMatchScore(
                                        match.id,
                                        match.teamA?.score,
                                        match.teamB?.score
                                      )
                                    }
                                    disabled={isPending}
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Simpan Skor & Loloskan
                                  </Button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 3: INFO & CHALLONGE */}
            <TabsContent value="info" className="flex-1 overflow-auto space-y-4 pr-1">
              <div className="space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <Label htmlFor="bracket-title" className="text-xs font-semibold">
                    Judul Bagan Pertandingan
                  </Label>
                  <Input
                    id="bracket-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Bagan Pertandingan MLBB Kemas 2025"
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bracket-type" className="text-xs font-semibold">
                    Tipe Turnamen
                  </Label>
                  <Select
                    value={type}
                    onValueChange={(val) => setType(val || "SINGLE_ELIMINATION")}
                  >
                    <SelectTrigger id="bracket-type" className="text-xs h-9">
                      <SelectValue placeholder="Pilih tipe turnamen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SINGLE_ELIMINATION">
                        Single Elimination (Sistem Gugur Tunggal)
                      </SelectItem>
                      <SelectItem value="DOUBLE_ELIMINATION">
                        Double Elimination (Sistem Gugur Ganda)
                      </SelectItem>
                      <SelectItem value="ROUND_ROBIN">
                        Round Robin (Setengah Kompetisi)
                      </SelectItem>
                      <SelectItem value="SWISS">Swiss System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="challonge-url" className="text-xs font-semibold">
                    Tautan Bagan Challonge (Opsional)
                  </Label>
                  <Input
                    id="challonge-url"
                    value={challongeUrl}
                    onChange={(e) => setChallongeUrl(e.target.value)}
                    placeholder="https://challonge.com/id_bracket_turnamen"
                    className="text-xs h-9 font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Jika turnamen di-host di Challonge, admin atau publik dapat langsung diarahkan ke bagan live Challonge.
                  </p>
                </div>

                <Button
                  onClick={handleSaveInfo}
                  disabled={isPending}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 h-8 mt-2"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  <span>Simpan Perubahan</span>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog Konfirmasi Undi Ulang */}
      <AlertDialog
        open={showConfirmRegenerate}
        onOpenChange={setShowConfirmRegenerate}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold">
              Undi Ulang Bagan Turnamen?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs leading-relaxed text-muted-foreground">
              Bagan turnamen ini sudah memiliki struktur dan mungkin memiliki catatan skor tanding. Mengundi ulang akan menghapus pohon bracket sebelumnya dan membuat jadwal babak awal yang baru dari daftar peserta terpilih.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
              onClick={executeBracketGeneration}
            >
              Ya, Undi Ulang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
