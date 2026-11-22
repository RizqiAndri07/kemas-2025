"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  User,
  Plus,
  Pencil,
  Trash2,
  Search,
  ExternalLink,
  Loader2,
  AlertCircle,
  Trophy,
  AlertTriangle,
  PhoneCall,
  MoreVertical,
  Calendar,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTableColumnHeader } from "@/components/dashboard/DataTableColumnHeader";
import { DataTablePagination } from "@/components/dashboard/DataTablePagination";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ContactPersonWithCompetitions } from "../../infrastructure/contact-person.repository";
import {
  createContactPersonAction,
  updateContactPersonAction,
  deleteContactPersonAction,
} from "../../application/contact-person.actions";
import { toast } from "@/components/ui/sonner";

interface ContactPersonTableProps {
  initialData: ContactPersonWithCompetitions[];
}

type SortColumn = "name" | "phone" | "competitions" | "createdAt";
type SortDirection = "asc" | "desc";

export function ContactPersonTable({ initialData }: ContactPersonTableProps) {
  const router = useRouter();
  const [data, setData] = useState<ContactPersonWithCompetitions[]>(initialData);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Sorting State
  const [sortColumn, setSortColumn] = useState<SortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination State
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Dialog State (Tambah / Edit)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCp, setDeletingCp] = useState<ContactPersonWithCompetitions | null>(null);

  // Handler Sorting
  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  // Filtered & Sorted Data Memoization
  const processedData = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = data.filter((cp) => {
      if (!q) return true;
      return (
        cp.name.toLowerCase().includes(q) ||
        cp.phone.includes(q) ||
        cp.competitions.some((c) => c.name.toLowerCase().includes(q))
      );
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "phone":
          comparison = a.phone.localeCompare(b.phone);
          break;
        case "competitions":
          comparison = a.competitions.length - b.competitions.length;
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [data, search, sortColumn, sortDirection]);

  // Paginated Rows
  const totalRows = processedData.length;
  const pageCount = Math.ceil(totalRows / pageSize);
  const paginatedData = useMemo(() => {
    const start = pageIndex * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, pageIndex, pageSize]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setName("");
    setPhone("");
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (cp: ContactPersonWithCompetitions) => {
    setEditingId(cp.id);
    setName(cp.name);
    setPhone(cp.phone);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenDelete = (cp: ContactPersonWithCompetitions) => {
    setDeletingCp(cp);
    setDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim().replace(/[\s\-]/g, "");

    if (cleanName.length < 2) {
      const msg = "Nama narahubung minimal 2 karakter";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (cleanPhone.length < 8) {
      const msg = "Nomor HP minimal 8 digit";
      setFormError(msg);
      toast.error(msg);
      return;
    }

    startTransition(async () => {
      if (editingId) {
        const res = await updateContactPersonAction(editingId, {
          name: cleanName,
          phone: cleanPhone,
        });

        if (!res.success) {
          const msg = res.error || "Gagal memperbarui contact person";
          setFormError(msg);
          toast.error(msg);
          return;
        }

        if (!res.data) {
          const msg = "Data contact person tidak ditemukan";
          setFormError(msg);
          toast.error(msg);
          return;
        }

        toast.success(res.message || "Contact person berhasil diperbarui!");
        setData((prev) =>
          prev.map((item) =>
            item.id === editingId
              ? { ...item, name: cleanName, phone: cleanPhone }
              : item
          )
        );
      } else {
        const res = await createContactPersonAction({
          name: cleanName,
          phone: cleanPhone,
        });

        if (!res.success) {
          const msg = res.error || "Gagal menambahkan contact person";
          setFormError(msg);
          toast.error(msg);
          return;
        }

        if (!res.data) {
          const msg = "Data contact person gagal dibuat";
          setFormError(msg);
          toast.error(msg);
          return;
        }

        toast.success(res.message || "Contact person baru berhasil ditambahkan!");
        setData((prev) => [
          {
            ...res.data!,
            competitions: [],
          },
          ...prev,
        ]);
      }

      setDialogOpen(false);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deletingCp) return;

    startTransition(async () => {
      const res = await deleteContactPersonAction(deletingCp.id);
      if (res.success) {
        toast.success(res.message || "Contact person berhasil dihapus!");
        setData((prev) => prev.filter((item) => item.id !== deletingCp.id));
        setDeleteOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus contact person.");
      }
    });
  };

  const formatWhatsAppUrl = (rawPhone: string) => {
    let p = rawPhone.replace(/\D/g, "");
    if (p.startsWith("0")) {
      p = "62" + p.slice(1);
    }
    return `https://wa.me/${p}`;
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4 w-full">
      {/* Top Toolbar: Search & Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari narahubung atau kompetisi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(0);
            }}
            className="pl-8.5 h-9 text-xs bg-card"
          />
        </div>

        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="gap-1.5 cursor-pointer shadow-xs self-end sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Contact Person</span>
        </Button>
      </div>

      {/* Main Data Table Card */}
      <Card className="border-border shadow-xs overflow-hidden w-full">
        {data.length === 0 ? (
          <EmptyState
            icon={PhoneCall}
            title="Belum Ada Contact Person"
            description="Tambahkan narahubung panitia pertama Anda untuk dikaitkan dengan cabang perlombaan."
            action={
              <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 cursor-pointer">
                <Plus className="h-4 w-4" />
                <span>Tambah Contact Person</span>
              </Button>
            }
          />
        ) : (
          <>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  {/* Kolom Narahubung */}
                  <TableHead className="w-[30%]">
                    <DataTableColumnHeader
                      title="Narahubung"
                      isSorted={sortColumn === "name" ? sortDirection : false}
                      onSort={() => handleSort("name")}
                    />
                  </TableHead>

                  {/* Kolom Nomor HP */}
                  <TableHead className="w-[25%]">
                    <DataTableColumnHeader
                      title="Nomor WhatsApp / HP"
                      isSorted={sortColumn === "phone" ? sortDirection : false}
                      onSort={() => handleSort("phone")}
                    />
                  </TableHead>

                  {/* Kolom Kompetisi Terkait */}
                  <TableHead className="w-[30%]">
                    <DataTableColumnHeader
                      title="Kompetisi Terkait"
                      isSorted={sortColumn === "competitions" ? sortDirection : false}
                      onSort={() => handleSort("competitions")}
                    />
                  </TableHead>

                  {/* Kolom Aksi */}
                  <TableHead className="w-[15%] text-right font-semibold text-xs">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-xs text-muted-foreground"
                    >
                      Tidak ada contact person yang sesuai dengan kata kunci &quot;{search}&quot;.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((cp) => (
                    <TableRow key={cp.id} className="hover:bg-muted/40 transition-colors">
                      {/* Nama CP */}
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold text-xs shrink-0">
                            {cp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-xs text-foreground truncate">
                              {cp.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Dibuat: {formatDate(cp.createdAt)}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Nomor HP */}
                      <TableCell>
                        <a
                          href={formatWhatsAppUrl(cp.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>{cp.phone}</span>
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </a>
                      </TableCell>

                      {/* Kompetisi Terkait */}
                      <TableCell>
                        {cp.competitions.length === 0 ? (
                          <span className="text-[11px] text-muted-foreground italic">
                            Belum dikaitkan ke kompetisi
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {cp.competitions.map((comp) => (
                              <Badge
                                key={comp.id}
                                variant="secondary"
                                className="text-[10px] gap-1 px-2 py-0.5 bg-muted text-foreground border border-border/80"
                              >
                                <Trophy className="h-2.5 w-2.5 text-primary" />
                                <span>{comp.name}</span>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>

                      {/* Aksi */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={buttonVariants({
                              variant: "ghost",
                              size: "icon",
                              className: "h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer",
                            })}
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(cp)}
                              className="cursor-pointer text-xs"
                            >
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit Kontak
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleOpenDelete(cp)}
                              className="cursor-pointer text-xs text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Hapus Kontak
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Shadcn Reusable DataTablePagination Controls */}
            {totalRows > 0 && (
              <DataTablePagination
                pageIndex={pageIndex}
                pageSize={pageSize}
                pageCount={pageCount}
                totalRows={totalRows}
                onPageChange={setPageIndex}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize);
                  setPageIndex(0);
                }}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            )}
          </>
        )}
      </Card>

      {/* Dialog: Tambah / Edit Contact Person */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4 text-primary" />
                <span>{editingId ? "Edit Contact Person" : "Tambah Contact Person Baru"}</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {editingId
                  ? "Perbarui informasi kontak narahubung panitia."
                  : "Tambahkan narahubung panitia baru yang nantinya dapat dikaitkan dengan berbagai cabang kompetisi."}
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="cp-name" className="text-xs font-medium">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cp-name"
                  placeholder="Contoh: Muhammad Rizky atau Kak Sarah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isPending}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cp-phone" className="text-xs font-medium">
                  Nomor HP / WhatsApp <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cp-phone"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isPending}
                  className="h-9 text-xs font-mono"
                  required
                />
                <p className="text-[10px] text-muted-foreground">
                  Gunakan format angka aktif yang terhubung dengan WhatsApp.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={isPending}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={isPending} className="cursor-pointer">
                {isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Narahubung"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Hapus Contact Person?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus narahubung{" "}
              <strong className="text-foreground">{deletingCp?.name}</strong>? Narahubung
              ini juga akan otomatis dilepas dari semua kompetisi yang terkait.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Ya, Hapus Narahubung"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
