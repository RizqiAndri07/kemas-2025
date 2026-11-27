"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  RegistrationItem,
  RegistrationStats,
} from "../../domain/registration.interface";
import {
  RegistrationStatus,
  RegistrationStatusLabels,
} from "../../domain/registration-status.enum";
import {
  updateRegistrationStatusAction,
  deleteRegistrationAction,
} from "../../application/registration.actions";
import { RegistrationDetailDialog } from "./registration-detail-dialog";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTablePagination } from "@/components/dashboard/DataTablePagination";
import { DataTableColumnHeader } from "@/components/dashboard/DataTableColumnHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { toast } from "sonner";
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Copy,
  Trophy,
  Users,
  Calendar,
  FileCheck2,
  Check,
} from "lucide-react";

interface RegistrationsTableProps {
  initialRegistrations: RegistrationItem[];
  competitions: Array<{ id: string; name: string }>;
  initialStats?: RegistrationStats;
}

export function RegistrationsTable({
  initialRegistrations,
  competitions,
  initialStats,
}: RegistrationsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [registrations, setRegistrations] =
    useState<RegistrationItem[]>(initialRegistrations);

  // Filter & Search states
  const [search, setSearch] = useState("");
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Sorting state
  const [sortColumn, setSortColumn] = useState<"createdAt" | "registrationNumber" | "status">(
    "createdAt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Dialog states
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationItem | null>(null);

  // Delete Alert states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] =
    useState<RegistrationItem | null>(null);

  // Copied indicator state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyRegNumber = (regNumber: string, id: string) => {
    navigator.clipboard.writeText(regNumber);
    setCopiedId(id);
    toast.success("Nomor registrasi berhasil disalin.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper untuk mengekstrak nama utama pendaftar dari data dinamis
  const extractParticipantName = (data: Record<string, any>): string => {
    if (!data) return "-";
    const nameKeys = [
      "fullName",
      "fullname",
      "namaLengkap",
      "nama_lengkap",
      "nama",
      "teamName",
      "team_name",
      "namaTim",
      "nama_tim",
      "name",
    ];

    for (const key of nameKeys) {
      if (data[key] && typeof data[key] === "string" && data[key].trim() !== "") {
        return data[key].trim();
      }
    }

    // Fallback ke string pertama yang bukan boolean/file
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === "string" && v.trim() !== "" && !v.startsWith("http")) {
        return v;
      }
    }

    return "Peserta Terdaftar";
  };

  // Quick action update status
  const handleQuickUpdateStatus = async (
    reg: RegistrationItem,
    newStatus: RegistrationStatus
  ) => {
    startTransition(async () => {
      try {
        const res = await updateRegistrationStatusAction({
          id: reg.id,
          status: newStatus,
        });

        if (res.success) {
          toast.success(res.message || `Status berhasil diubah ke ${newStatus}.`);
          setRegistrations((prev) =>
            prev.map((item) =>
              item.id === reg.id
                ? { ...item, status: newStatus, verifiedAt: new Date() }
                : item
            )
          );
        } else {
          toast.error(res.error || "Gagal mengubah status.");
        }
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan.");
      }
    });
  };

  // Delete action
  const handleConfirmDelete = async () => {
    if (!registrationToDelete) return;
    startTransition(async () => {
      try {
        const res = await deleteRegistrationAction(registrationToDelete.id);
        if (res.success) {
          toast.success(res.message || "Data pendaftar berhasil dihapus.");
          setRegistrations((prev) =>
            prev.filter((r) => r.id !== registrationToDelete.id)
          );
          setDeleteDialogOpen(false);
          setRegistrationToDelete(null);
        } else {
          toast.error(res.error || "Gagal menghapus data.");
        }
      } catch (err: any) {
        toast.error(err.message || "Terjadi kesalahan.");
      }
    });
  };

  // Sorting toggle
  const handleToggleSort = (column: "createdAt" | "registrationNumber" | "status") => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
    setPageIndex(0);
  };

  // Filtered & Sorted list
  const filteredRegistrations = useMemo(() => {
    let result = [...registrations];

    // Filter Competition
    if (selectedCompetitionId !== "ALL") {
      result = result.filter((r) => r.competitionId === selectedCompetitionId);
    }

    // Filter Status
    if (selectedStatus !== "ALL") {
      result = result.filter((r) => r.status === selectedStatus);
    }

    // Search query
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      result = result.filter((r) => {
        const regNo = r.registrationNumber.toLowerCase();
        const comp = r.competitionName.toLowerCase();
        const name = extractParticipantName(r.data).toLowerCase();
        const dataStr = JSON.stringify(r.data).toLowerCase();
        return (
          regNo.includes(q) ||
          comp.includes(q) ||
          name.includes(q) ||
          dataStr.includes(q)
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      let compA: string | number = "";
      let compB: string | number = "";

      if (sortColumn === "createdAt") {
        compA = new Date(a.createdAt).getTime();
        compB = new Date(b.createdAt).getTime();
      } else if (sortColumn === "registrationNumber") {
        compA = a.registrationNumber;
        compB = b.registrationNumber;
      } else if (sortColumn === "status") {
        compA = a.status;
        compB = b.status;
      }

      if (compA < compB) return sortDirection === "asc" ? -1 : 1;
      if (compA > compB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    registrations,
    selectedCompetitionId,
    selectedStatus,
    search,
    sortColumn,
    sortDirection,
  ]);

  // Paginated slice
  const paginatedRegistrations = useMemo(() => {
    const start = pageIndex * pageSize;
    return filteredRegistrations.slice(start, start + pageSize);
  }, [filteredRegistrations, pageIndex, pageSize]);

  const pageCount = Math.ceil(filteredRegistrations.length / pageSize) || 1;

  // Stats calculate
  const stats = useMemo(() => {
    let unverified = 0;
    let verified = 0;
    let rejected = 0;
    for (const r of registrations) {
      if (r.status === "UNVERIFIED") unverified++;
      if (r.status === "VERIFIED") verified++;
      if (r.status === "REJECTED") rejected++;
    }
    return {
      total: registrations.length,
      unverified,
      verified,
      rejected,
    };
  }, [registrations]);

  const renderStatusBadge = (st: RegistrationStatus) => {
    switch (st) {
      case "VERIFIED":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Terverifikasi</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 gap-1 font-medium">
            <XCircle className="h-3 w-3" />
            <span>Ditolak</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 gap-1 font-medium">
            <Clock className="h-3 w-3" />
            <span>Menunggu</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Ringkasan Metrik / Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/70 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Pendaftar</p>
              <h3 className="text-2xl font-bold font-heading mt-1">{stats.total}</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/5 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                Menunggu Verifikasi
              </p>
              <h3 className="text-2xl font-bold font-heading mt-1 text-amber-700 dark:text-amber-400">
                {stats.unverified}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Terverifikasi
              </p>
              <h3 className="text-2xl font-bold font-heading mt-1 text-emerald-700 dark:text-emerald-400">
                {stats.verified}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-500/20 bg-rose-500/5 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-rose-700 dark:text-rose-400">Ditolak</p>
              <h3 className="text-2xl font-bold font-heading mt-1 text-rose-700 dark:text-rose-400">
                {stats.rejected}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Toolbar & Filter Interaktif */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Pencarian Global */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nomor registrasi, nama tim/peserta..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageIndex(0);
                }}
                className="pl-9 h-9 text-xs"
              />
            </div>

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Kompetisi */}
              <div className="w-48 sm:w-56">
                <Select
                  value={selectedCompetitionId}
                  onValueChange={(val) => {
                    setSelectedCompetitionId(val || "ALL");
                    setPageIndex(0);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-full">
                    <SelectValue placeholder="Semua Kompetisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Kompetisi ({competitions.length})</SelectItem>
                    {competitions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Status */}
              <div className="w-40 sm:w-44">
                <Select
                  value={selectedStatus}
                  onValueChange={(val) => {
                    setSelectedStatus(val || "ALL");
                    setPageIndex(0);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-full">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Status</SelectItem>
                    <SelectItem value="UNVERIFIED">Belum Terverifikasi</SelectItem>
                    <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                    <SelectItem value="REJECTED">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. Data Table Shadcn UI */}
      <Card className="border-border/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px]">
                  <DataTableColumnHeader
                    title="No. Registrasi"
                    isSorted={
                      sortColumn === "registrationNumber" ? sortDirection : false
                    }
                    onSort={() => handleToggleSort("registrationNumber")}
                  />
                </TableHead>
                <TableHead className="min-w-[180px]">Nama Peserta / Tim</TableHead>
                <TableHead className="min-w-[160px]">Kompetisi / Acara</TableHead>
                <TableHead className="w-[160px]">
                  <DataTableColumnHeader
                    title="Waktu Daftar"
                    isSorted={sortColumn === "createdAt" ? sortDirection : false}
                    onSort={() => handleToggleSort("createdAt")}
                  />
                </TableHead>
                <TableHead className="w-[150px]">
                  <DataTableColumnHeader
                    title="Status"
                    isSorted={sortColumn === "status" ? sortDirection : false}
                    onSort={() => handleToggleSort("status")}
                  />
                </TableHead>
                <TableHead className="w-[80px] text-right pr-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <EmptyState
                      icon={FileCheck2}
                      title="Tidak ada data pendaftar"
                      description={
                        search.trim() !== "" ||
                        selectedCompetitionId !== "ALL" ||
                        selectedStatus !== "ALL"
                          ? "Tidak ditemukan data pendaftar yang sesuai dengan filter atau kata kunci pencarian Anda."
                          : "Belum ada peserta yang mendaftar ke kompetisi saat ini."
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRegistrations.map((row) => {
                  const participantName = extractParticipantName(row.data);
                  const formattedDate = new Date(row.createdAt).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <TableRow key={row.id} className="hover:bg-muted/20">
                      {/* Nomor Registrasi */}
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[140px]">
                            {row.registrationNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyRegNumber(row.registrationNumber, row.id)
                            }
                            className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Salin Nomor Registrasi"
                          >
                            {copiedId === row.id ? (
                              <Check className="h-3 w-3 text-emerald-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      </TableCell>

                      {/* Nama Peserta / Tim */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-foreground">
                            {participantName}
                          </span>
                          <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                            Form: {row.formTitle}
                          </span>
                        </div>
                      </TableCell>

                      {/* Nama Kompetisi */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Trophy className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-xs font-medium text-foreground truncate max-w-[160px]">
                            {row.competitionName}
                          </span>
                        </div>
                      </TableCell>

                      {/* Waktu Daftar */}
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>{renderStatusBadge(row.status)}</TableCell>

                      {/* Tombol Aksi */}
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
                            onClick={() => router.push(`/dashboard/registrations/${row.id}`)}
                          >
                            <FileCheck2 className="h-3.5 w-3.5 text-primary" />
                            <span>Validasi</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 cursor-pointer"
                                >
                                  <span className="sr-only">Buka menu aksi</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              }
                            />
                            <DropdownMenuContent align="end" className="w-52 text-xs">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/registrations/${row.id}`)}
                                className="cursor-pointer font-medium"
                              >
                                <FileCheck2 className="h-3.5 w-3.5 mr-2 text-primary" />
                                Halaman Validasi & Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedRegistration(row);
                                  setDetailOpen(true);
                                }}
                                className="cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                Quick Preview (Modal)
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            {row.status !== "VERIFIED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleQuickUpdateStatus(row, "VERIFIED")
                                }
                                className="cursor-pointer text-emerald-600 focus:text-emerald-700"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                                Verifikasi (Terima)
                              </DropdownMenuItem>
                            )}
                            {row.status !== "REJECTED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleQuickUpdateStatus(row, "REJECTED")
                                }
                                className="cursor-pointer text-rose-600 focus:text-rose-700"
                              >
                                <XCircle className="h-3.5 w-3.5 mr-2" />
                                Tolak Pendaftaran
                              </DropdownMenuItem>
                            )}
                            {row.status !== "UNVERIFIED" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleQuickUpdateStatus(row, "UNVERIFIED")
                                }
                                className="cursor-pointer text-amber-600 focus:text-amber-700"
                              >
                                <Clock className="h-3.5 w-3.5 mr-2" />
                                Set Belum Terverifikasi
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setRegistrationToDelete(row);
                                setDeleteDialogOpen(true);
                              }}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Hapus Pendaftar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginasi Terpadu */}
        <DataTablePagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          pageCount={pageCount}
          totalRows={filteredRegistrations.length}
          onPageChange={setPageIndex}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setPageIndex(0);
          }}
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </Card>

      {/* Modal Detail Pendaftar & Aksi Verifikasi */}
      <RegistrationDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        registration={selectedRegistration}
        onStatusUpdated={(updated) => {
          setRegistrations((prev) =>
            prev.map((item) => (item.id === updated.id ? updated : item))
          );
        }}
      />

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-heading font-bold">
              Hapus Data Pendaftar?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Tindakan ini akan menghapus data pendaftaran secara permanen dari database
              beserta riwayat audit verifikasi. Aksi ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} className="text-xs">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-semibold"
            >
              {isPending ? "Menghapus..." : "Ya, Hapus Pendaftar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
