"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DataTableColumnHeader } from "@/components/dashboard/DataTableColumnHeader";
import { DataTablePagination } from "@/components/dashboard/DataTablePagination";
import { CompetitionSelect } from "../../infrastructure/competition.table";
import { CompetitionPresaleSelect } from "../../infrastructure/competition-presale.table";
import { PresaleWithCompetition } from "../../infrastructure/competition-presale.repository";
import { PresaleDialog } from "./presale-dialog";
import {
  deletePresaleAction,
  togglePresaleStatusAction,
} from "../../application/presale.actions";

interface PresaleTableProps {
  presales: PresaleWithCompetition[];
  competitions: CompetitionSelect[];
}

type PresaleSortColumn = "competitionName" | "name" | "price" | "startDate" | "status";
type SortDirection = "asc" | "desc";

interface ToggleConfirmState {
  presale: PresaleWithCompetition;
  nextActive: boolean;
  otherActivePresale?: PresaleWithCompetition | null;
}

export function PresaleTable({ presales, competitions }: PresaleTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [selectedCompId, setSelectedCompId] = useState<string>("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [presaleToEdit, setPresaleToEdit] = useState<CompetitionPresaleSelect | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CompetitionPresaleSelect | null>(null);

  // Modal Peringatan untuk Toggle Status Aktif / Nonaktif
  const [toggleConfirm, setToggleConfirm] = useState<ToggleConfirmState | null>(null);

  // Sorting State
  const [sortColumn, setSortColumn] = useState<PresaleSortColumn>("startDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Pagination State
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (col: PresaleSortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const formatDateTime = (date: Date | string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Free Entry (Gratis)";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPresaleTimingStatus = (item: CompetitionPresaleSelect) => {
    if (!item.isActive) {
      return {
        label: "Nonaktif",
        badgeClass: "border-muted-foreground/30 bg-muted/30 text-muted-foreground",
        rank: 4,
      };
    }

    const now = Date.now();
    const start = new Date(item.startDate).getTime();
    const end = new Date(item.endDate).getTime();

    if (now < start) {
      return {
        label: "Belum Mulai",
        badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
        rank: 2,
      };
    }
    if (now > end) {
      return {
        label: "Sudah Berakhir",
        badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
        rank: 3,
      };
    }

    return {
      label: "Sedang Berjalan",
      badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold",
      rank: 1,
    };
  };

  // Filtered & Sorted Presales
  const processedPresales = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = presales.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.competitionName.toLowerCase().includes(q);

      const matchesComp =
        selectedCompId === "ALL" || item.competitionId === selectedCompId;

      return matchesSearch && matchesComp;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortColumn === "competitionName") {
        comparison = a.competitionName.localeCompare(b.competitionName);
      } else if (sortColumn === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortColumn === "price") {
        comparison = a.price - b.price;
      } else if (sortColumn === "startDate") {
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      } else if (sortColumn === "status") {
        comparison = getPresaleTimingStatus(a).rank - getPresaleTimingStatus(b).rank;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [presales, search, selectedCompId, sortColumn, sortDirection]);

  // Paginated Rows
  const totalRows = processedPresales.length;
  const pageCount = Math.ceil(totalRows / pageSize) || 1;
  const currentPresales = useMemo(() => {
    const start = pageIndex * pageSize;
    return processedPresales.slice(start, start + pageSize);
  }, [processedPresales, pageIndex, pageSize]);

  const handlePageChange = (newIndex: number) => {
    setPageIndex(Math.max(0, Math.min(newIndex, pageCount - 1)));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0);
  };

  const handleOpenCreate = () => {
    setPresaleToEdit(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: CompetitionPresaleSelect) => {
    setPresaleToEdit(item);
    setDialogOpen(true);
  };

  // Trigger modal konfirmasi toggle status (Aktif / Nonaktif)
  const handleInitiateToggle = (presale: PresaleWithCompetition) => {
    const nextActive = !presale.isActive;
    const otherActive = nextActive
      ? presales.find(
          (p) =>
            p.competitionId === presale.competitionId &&
            p.id !== presale.id &&
            p.isActive
        )
      : null;

    setToggleConfirm({
      presale,
      nextActive,
      otherActivePresale: otherActive,
    });
  };

  const handleExecuteToggle = () => {
    if (!toggleConfirm) return;

    startTransition(async () => {
      await togglePresaleStatusAction(
        toggleConfirm.presale.id,
        toggleConfirm.nextActive
      );
      setToggleConfirm(null);
      router.refresh();
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      await deletePresaleAction(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const selectedFilterComp = competitions.find((c) => c.id === selectedCompId);

  return (
    <div className="space-y-6">
      {/* Top Filter and Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari gelombang presale atau lomba..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(0);
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Filter by Competition (Menampilkan Nama Event, bukan UUID) */}
          <Select
            value={selectedCompId}
            onValueChange={(val) => {
              if (val) {
                setSelectedCompId(val);
                setPageIndex(0);
              }
            }}
          >
            <SelectTrigger className="h-9 text-xs w-[240px] bg-background">
              <SelectValue placeholder="Semua Kompetisi">
                {selectedCompId === "ALL"
                  ? "Semua Kompetisi"
                  : selectedFilterComp
                  ? selectedFilterComp.name
                  : "Pilih Kompetisi"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Kompetisi</SelectItem>
              {competitions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          size="sm"
          onClick={handleOpenCreate}
          disabled={competitions.length === 0}
          className="shrink-0 cursor-pointer shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah Gelombang Presale
        </Button>
      </div>

      {/* Shadcn Data Table Card */}
      <Card className="border-border overflow-hidden">
        {processedPresales.length === 0 ? (
          <EmptyState
            icon={Tag}
            title={
              presales.length === 0
                ? "Belum ada gelombang presale"
                : "Tidak ada gelombang presale yang cocok"
            }
            description={
              presales.length === 0
                ? "Buat gelombang pendaftaran bertingkat (Early Bird, Presale 1, Regular) untuk kompetisi atau event Anda."
                : "Coba ubah kata kunci pencarian atau reset filter kompetisi."
            }
            action={
              competitions.length > 0 && presales.length === 0 ? (
                <Button size="sm" onClick={handleOpenCreate}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Tambah Gelombang Pertama
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="py-3">
                      <DataTableColumnHeader
                        title="Kompetisi / Event"
                        isSorted={sortColumn === "competitionName" ? sortDirection : false}
                        onSort={() => handleSort("competitionName")}
                      />
                    </TableHead>
                    <TableHead className="py-3">
                      <DataTableColumnHeader
                        title="Nama Gelombang"
                        isSorted={sortColumn === "name" ? sortDirection : false}
                        onSort={() => handleSort("name")}
                      />
                    </TableHead>
                    <TableHead className="py-3">
                      <DataTableColumnHeader
                        title="Biaya Pendaftaran"
                        isSorted={sortColumn === "price" ? sortDirection : false}
                        onSort={() => handleSort("price")}
                      />
                    </TableHead>
                    <TableHead className="py-3">
                      <DataTableColumnHeader
                        title="Periode Berlaku"
                        isSorted={sortColumn === "startDate" ? sortDirection : false}
                        onSort={() => handleSort("startDate")}
                      />
                    </TableHead>
                    <TableHead className="py-3 text-xs font-semibold text-muted-foreground">
                      Batas Kuota
                    </TableHead>
                    <TableHead className="py-3">
                      <DataTableColumnHeader
                        title="Status Waktu"
                        isSorted={sortColumn === "status" ? sortDirection : false}
                        onSort={() => handleSort("status")}
                      />
                    </TableHead>
                    <TableHead className="w-12 text-right py-3 text-xs font-semibold">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPresales.map((item) => {
                    const statusInfo = getPresaleTimingStatus(item);

                    return (
                      <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                        {/* Competition Name */}
                        <TableCell className="py-3 font-semibold text-sm text-foreground">
                          {item.competitionName}
                        </TableCell>

                        {/* Presale Name */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-1.5">
                            <Tag className="h-3.5 w-3.5 text-primary shrink-0" />
                            <span className="font-medium text-xs text-foreground">{item.name}</span>
                          </div>
                        </TableCell>

                        {/* Price */}
                        <TableCell className="py-3 font-bold text-xs text-foreground">
                          {formatCurrency(item.price)}
                        </TableCell>

                        {/* Date Range */}
                        <TableCell className="py-3 text-xs text-muted-foreground">
                          <div className="flex flex-col">
                            <span>{formatDateTime(item.startDate)}</span>
                            <span className="text-[11px] text-muted-foreground/70">
                              s/d {formatDateTime(item.endDate)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Quota */}
                        <TableCell className="py-3 text-xs text-muted-foreground">
                          {item.quota ? (
                            <span className="font-medium text-foreground">{item.quota} Slot</span>
                          ) : (
                            <span className="italic text-muted-foreground/70">Bebas / Tak Terbatas</span>
                          )}
                        </TableCell>

                        {/* Timing Status Badge */}
                        <TableCell className="py-3">
                          <Badge
                            variant="outline"
                            className={`${statusInfo.badgeClass} text-[10px] px-2 py-0.5`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className={buttonVariants({
                                variant: "ghost",
                                size: "icon",
                                className:
                                  "h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer",
                              })}
                              disabled={isPending}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(item)}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit Gelombang
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleInitiateToggle(item)}
                                className="cursor-pointer"
                              >
                                {item.isActive ? (
                                  <>
                                    <XCircle className="mr-2 h-3.5 w-3.5 text-amber-500" />
                                    Nonaktifkan Gelombang
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-green-500" />
                                    Aktifkan Gelombang
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(item)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Shadcn DataTablePagination */}
            <DataTablePagination
              pageIndex={pageIndex}
              pageSize={pageSize}
              pageCount={pageCount}
              totalRows={totalRows}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}
      </Card>

      {/* Create / Edit Dialog */}
      <PresaleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        competitions={competitions}
        presaleToEdit={presaleToEdit}
        defaultCompetitionId={selectedCompId !== "ALL" ? selectedCompId : undefined}
      />

      {/* Modal Peringatan Khusus untuk Mengaktifkan / Menonaktifkan Presale */}
      <AlertDialog
        open={Boolean(toggleConfirm)}
        onOpenChange={(open) => !open && setToggleConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle
                className={`h-5 w-5 ${
                  toggleConfirm?.nextActive ? "text-amber-500" : "text-destructive"
                }`}
              />
              {toggleConfirm?.nextActive
                ? "Konfirmasi Pengaktifan Presale"
                : "Konfirmasi Penonaktifan Presale"}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 pt-1 text-sm text-muted-foreground">
              {toggleConfirm?.nextActive ? (
                <>
                  {toggleConfirm.otherActivePresale ? (
                    <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                      <strong>Perhatian:</strong> Event{" "}
                      <strong className="text-foreground">
                        {toggleConfirm.presale.competitionName}
                      </strong>{" "}
                      saat ini sudah memiliki presale aktif, yaitu{" "}
                      <strong className="text-foreground">
                        &quot;{toggleConfirm.otherActivePresale.name}&quot;
                      </strong>
                      .<br />
                      Karena <strong>1 event hanya boleh memiliki 1 presale aktif</strong>,
                      mengaktifkan gelombang{" "}
                      <strong className="text-foreground">
                        &quot;{toggleConfirm.presale.name}&quot;
                      </strong>{" "}
                      akan otomatis menonaktifkan gelombang sebelumnya.
                    </div>
                  ) : (
                    <p>
                      Apakah Anda yakin ingin mengaktifkan gelombang presale{" "}
                      <strong className="text-foreground">
                        &quot;{toggleConfirm.presale.name}&quot;
                      </strong>{" "}
                      untuk event{" "}
                      <strong className="text-foreground">
                        {toggleConfirm.presale.competitionName}
                      </strong>
                      ? Pendaftar akan dikenakan tarif sesuai gelombang ini.
                    </p>
                  )}
                </>
              ) : (
                <p>
                  Apakah Anda yakin ingin menonaktifkan gelombang presale{" "}
                  <strong className="text-foreground">
                    &quot;{toggleConfirm?.presale.name}&quot;
                  </strong>
                  ? Jika dinonaktifkan, pendaftaran untuk event ini akan menggunakan
                  biaya pendaftaran standar / flat.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExecuteToggle}
              disabled={isPending}
              variant={toggleConfirm?.nextActive ? "default" : "destructive"}
            >
              {isPending
                ? "Memproses..."
                : toggleConfirm?.nextActive
                ? "Ya, Aktifkan Gelombang"
                : "Ya, Nonaktifkan Gelombang"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Hapus Gelombang Presale?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus gelombang presale{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Ya, Hapus Gelombang"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
