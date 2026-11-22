"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileSpreadsheet,
  Plus,
  Search,
  Pencil,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Filter,
  ExternalLink,
  Layers,
  Sparkles,
  Trophy,
  MoreVertical,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { CompetitionSelect } from "@/modules/competition/infrastructure/competition.table";
import {
  createCompetitionFormAction,
  deleteCompetitionFormAction,
  duplicateCompetitionFormAction,
  setActiveCompetitionFormAction,
} from "@/modules/competition/application/competition-form.actions";
import { toast } from "@/components/ui/sonner";

export interface GlobalFormRow {
  id: string;
  competitionId: string;
  title: string;
  description: string | null;
  sections: any[];
  createdAt: Date;
  updatedAt: Date;
  competitionName: string;
  competitionActiveFormId: string | null;
  competitionType: string;
  competitionStatus: string;
}

interface GlobalFormsTableProps {
  forms: GlobalFormRow[];
  competitions: CompetitionSelect[];
}

export function GlobalFormsTable({ forms, competitions }: GlobalFormsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedCompetitionFilter, setSelectedCompetitionFilter] = useState("all");

  // Sorting
  const [sortColumn, setSortColumn] = useState<"title" | "competition" | "fields" | "createdAt">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Create Form Dialog State
  const [createOpen, setCreateOpen] = useState(false);
  const [targetCompetitionId, setTargetCompetitionId] = useState<string>(
    competitions[0]?.id || ""
  );
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<GlobalFormRow | null>(null);

  // Filtered & Sorted Data
  const processedData = useMemo(() => {
    let result = forms.filter((item) => {
      // Filter by competition
      if (
        selectedCompetitionFilter !== "all" &&
        item.competitionId !== selectedCompetitionFilter
      ) {
        return false;
      }

      // Search term filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchComp = item.competitionName.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query) ?? false;
        if (!matchTitle && !matchComp && !matchDesc) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "competition":
          comparison = a.competitionName.localeCompare(b.competitionName);
          break;
        case "fields": {
          const aCount =
            a.sections?.reduce((acc, s) => acc + (s.fields?.length || 0), 0) || 0;
          const bCount =
            b.sections?.reduce((acc, s) => acc + (s.fields?.length || 0), 0) || 0;
          comparison = aCount - bCount;
          break;
        }
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [forms, search, selectedCompetitionFilter, sortColumn, sortDirection]);

  // Paginated Rows
  const totalRows = processedData.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, pageIndex, pageSize]);

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!targetCompetitionId) {
      const msg = "Pilih kompetisi tujuan terlebih dahulu.";
      setCreateError(msg);
      toast.error(msg);
      return;
    }

    if (!newTitle.trim()) {
      const msg = "Judul formulir wajib diisi.";
      setCreateError(msg);
      toast.error(msg);
      return;
    }

    startTransition(async () => {
      const res = await createCompetitionFormAction({
        competitionId: targetCompetitionId,
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });

      if (!res.success) {
        const msg = res.error || "Gagal membuat formulir.";
        setCreateError(msg);
        toast.error(msg);
        return;
      }

      toast.success(res.message || "Formulir pendaftaran berhasil dibuat!");
      setCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      router.push(`/dashboard/competition/${targetCompetitionId}/form`);
      router.refresh();
    });
  };

  const handleSetActive = (item: GlobalFormRow) => {
    startTransition(async () => {
      const res = await setActiveCompetitionFormAction(item.competitionId, item.id);
      if (res.success) {
        toast.success(res.message || "Formulir aktif berhasil diperbarui!");
      } else {
        toast.error(res.error || "Gagal mengubah formulir aktif.");
      }
      router.refresh();
    });
  };

  const handleDuplicate = (item: GlobalFormRow) => {
    startTransition(async () => {
      const res = await duplicateCompetitionFormAction(item.id, item.competitionId);
      if (res.success) {
        toast.success(res.message || "Formulir berhasil diduplikasi!");
      } else {
        toast.error(res.error || "Gagal menduplikasi formulir.");
      }
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      const res = await deleteCompetitionFormAction(deleteTarget.id, deleteTarget.competitionId);
      if (res.success) {
        toast.success(res.message || "Formulir berhasil dihapus!");
      } else {
        toast.error(res.error || "Gagal menghapus formulir.");
      }
      setDeleteTarget(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Toolbar Controls */}
      <Card className="border-border/70 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari formulir atau kompetisi..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageIndex(0);
                }}
                className="pl-8 h-9 text-xs"
              />
            </div>

            {/* Filter by Competition */}
            <div className="w-full sm:w-64">
              <Select
                value={selectedCompetitionFilter}
                onValueChange={(val) => {
                  setSelectedCompetitionFilter(val || "all");
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="h-9 text-xs w-full">
                  <SelectValue placeholder="Semua Kompetisi">
                    {selectedCompetitionFilter === "all"
                      ? "Semua Kompetisi"
                      : competitions.find((c) => c.id === selectedCompetitionFilter)?.name || "Semua Kompetisi"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kompetisi ({competitions.length})</SelectItem>
                  {competitions.map((comp) => (
                    <SelectItem key={comp.id} value={comp.id} className="text-xs">
                      {comp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={() => {
              setCreateError(null);
              setCreateOpen(true);
            }}
            size="sm"
            className="cursor-pointer gap-1.5 h-9 text-xs shrink-0 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Formulir Baru</span>
          </Button>
        </div>
      </Card>

      {/* Table Area */}
      {processedData.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="Tidak Ada Formulir Ditemukan"
          description={
            search || selectedCompetitionFilter !== "all"
              ? "Tidak ada formulir pendaftaran yang sesuai dengan kriteria filter atau pencarian Anda."
              : "Belum ada formulir pendaftaran yang dibuat. Klik tombol di bawah untuk membuat formulir pertama."
          }
          action={
            <Button
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCompetitionFilter("all");
                setCreateError(null);
                setCreateOpen(true);
              }}
              className="cursor-pointer gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Buat Formulir Baru</span>
            </Button>
          }
        />
      ) : (
        <Card className="border-border/70 overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead
                  onClick={() => handleSort("title")}
                  className="cursor-pointer select-none text-xs font-semibold"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Nama Formulir</span>
                    {sortColumn === "title" && (
                      <span className="text-primary font-bold">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort("competition")}
                  className="cursor-pointer select-none text-xs font-semibold"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Kompetisi / Event</span>
                    {sortColumn === "competition" && (
                      <span className="text-primary font-bold">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>

                <TableHead className="text-xs font-semibold">
                  Status Form
                </TableHead>

                <TableHead
                  onClick={() => handleSort("fields")}
                  className="cursor-pointer select-none text-xs font-semibold"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Struktur (Sec/Field)</span>
                    {sortColumn === "fields" && (
                      <span className="text-primary font-bold">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>

                <TableHead
                  onClick={() => handleSort("createdAt")}
                  className="cursor-pointer select-none text-xs font-semibold"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Dibuat Pada</span>
                    {sortColumn === "createdAt" && (
                      <span className="text-primary font-bold">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>

                <TableHead className="text-right text-xs font-semibold">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedData.map((item) => {
                const isActive = item.id === item.competitionActiveFormId;
                const sectionsCount = item.sections?.length || 0;
                const fieldsCount =
                  item.sections?.reduce(
                    (acc: number, s: any) => acc + (s.fields?.length || 0),
                    0
                  ) || 0;

                return (
                  <TableRow key={item.id} className="hover:bg-muted/20">
                    {/* Nama Formulir */}
                    <TableCell className="font-medium text-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs line-clamp-1">
                          {item.title}
                        </span>
                        {item.description && (
                          <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Kompetisi */}
                    <TableCell className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="font-medium text-foreground line-clamp-1">
                          {item.competitionName}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status Form */}
                    <TableCell className="text-xs">
                      {isActive ? (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] gap-1 px-2 py-0.5">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Aktif untuk Pendaftaran</span>
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground text-[10px]">
                          Varian / Draft
                        </Badge>
                      )}
                    </TableCell>

                    {/* Struktur */}
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{sectionsCount}</span>{" "}
                      Sec •{" "}
                      <span className="font-semibold text-foreground">{fieldsCount}</span>{" "}
                      Field
                    </TableCell>

                    {/* Tanggal */}
                    <TableCell className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }).format(new Date(item.createdAt))}
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          render={
                            <Link
                              href={`/dashboard/competition/${item.competitionId}/form`}
                            />
                          }
                          className="h-8 text-xs cursor-pointer gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          <span>Builder</span>
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 cursor-pointer"
                              />
                            }
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {!isActive && (
                              <DropdownMenuItem
                                onClick={() => handleSetActive(item)}
                                disabled={isPending}
                                className="cursor-pointer text-emerald-600 focus:text-emerald-700"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                Jadikan Form Aktif
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(item)}
                              disabled={isPending}
                              className="cursor-pointer"
                            >
                              <Copy className="h-3.5 w-3.5 mr-2" />
                              Duplikat Formulir
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              render={
                                <Link
                                  href={`/dashboard/competition/${item.competitionId}/form`}
                                />
                              }
                              className="cursor-pointer"
                            >
                              <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-primary" />
                              Buka Form Builder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(item)}
                              disabled={isPending}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Hapus Formulir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination Toolbar */}
          <div className="flex items-center justify-between p-3 border-t border-border/50 bg-muted/10 text-xs text-muted-foreground">
            <div>
              Menampilkan {paginatedData.length} dari {totalRows} formulir
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex === 0}
                onClick={() => setPageIndex((prev) => Math.max(0, prev - 1))}
                className="h-7 text-xs"
              >
                Sebelumnya
              </Button>
              <span className="text-xs">
                Halaman {pageIndex + 1} dari {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pageIndex >= pageCount - 1}
                onClick={() => setPageIndex((prev) => prev + 1)}
                className="h-7 text-xs"
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Dialog Buat Formulir Baru */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-heading font-bold">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Buat Formulir Pendaftaran Baru
              </DialogTitle>
              <DialogDescription className="text-xs">
                Pilih kompetisi yang akan menggunakan formulir ini, lalu atur judul formulir.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {createError && (
                <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Target Competition Selector */}
              <div className="space-y-1.5">
                <Label htmlFor="compTarget" className="text-xs font-medium">
                  Event Tujuan <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={targetCompetitionId}
                  onValueChange={(val) => setTargetCompetitionId(val || "")}
                >
                  <SelectTrigger id="compTarget" className="h-9 text-xs w-full">
                    <SelectValue placeholder="Pilih Kompetisi">
                      {targetCompetitionId
                        ? competitions.find((c) => c.id === targetCompetitionId)?.name || "Pilih Kompetisi"
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {competitions.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <Label htmlFor="globalFormTitle" className="text-xs font-medium">
                  Judul Formulir <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="globalFormTitle"
                  placeholder="Contoh: Formulir Pendaftaran Utama, Gelombang 1, Form SMA"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={isPending}
                  className="h-9 text-sm"
                  autoFocus
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1.5">
                <Label htmlFor="globalFormDesc" className="text-xs font-medium">
                  Deskripsi / Petunjuk Pengisian (Opsional)
                </Label>
                <Textarea
                  id="globalFormDesc"
                  placeholder="Tuliskan petunjuk umum bagi calon peserta sebelum mengisi..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  disabled={isPending}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isPending} className="cursor-pointer">
                {isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Buat Formulir
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Hapus Formulir Pendaftaran?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus formulir{" "}
              <strong className="text-foreground">{deleteTarget?.title}</strong> pada
              kompetisi{" "}
              <strong className="text-foreground">{deleteTarget?.competitionName}</strong>?
              Seluruh konfigurasi section dan field di dalamnya akan terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Ya, Hapus Formulir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
