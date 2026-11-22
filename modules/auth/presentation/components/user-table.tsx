"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  UserCheck,
  Shield,
  ShieldAlert,
  Clock,
  Calendar,
  AlertTriangle,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DataTableColumnHeader } from "@/components/dashboard/DataTableColumnHeader";
import { DataTablePagination } from "@/components/dashboard/DataTablePagination";
import { UserSelect } from "../../infrastructure/user.table";
import { UserRole } from "../../domain/role.enum";
import { UserStatus } from "../../domain/user-status.enum";
import { UserDialog } from "./user-dialog";
import {
  deleteUserAction,
  toggleUserStatusAction,
} from "../../application/user.actions";

interface UserTableProps {
  users: UserSelect[];
}

type UserSortColumn = "username" | "role" | "status" | "createdAt";
type UserSortDirection = "asc" | "desc";

export function UserTable({ users }: UserTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserSelect | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<UserSelect | null>(null);

  // Sorting State
  const [sortColumn, setSortColumn] = useState<UserSortColumn>("createdAt");
  const [sortDirection, setSortDirection] =
    useState<UserSortDirection>("desc");

  // Pagination State
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (col: UserSortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  const handleOpenCreate = () => {
    setUserToEdit(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: UserSelect) => {
    setUserToEdit(user);
    setDialogOpen(true);
  };

  const handleToggleStatus = (user: UserSelect) => {
    const nextStatus =
      user.status === UserStatus.VERIFIED
        ? UserStatus.UNVERIFIED
        : UserStatus.VERIFIED;

    startTransition(async () => {
      await toggleUserStatusAction(user.id, nextStatus);
      router.refresh();
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      await deleteUserAction(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    });
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case UserRole.SUPERADMIN:
        return (
          <Badge
            variant="outline"
            className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium text-[11px]"
          >
            <Shield className="mr-1 h-3 w-3" />
            Superadmin
          </Badge>
        );
      case UserRole.ADMIN:
        return (
          <Badge
            variant="outline"
            className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-medium text-[11px]"
          >
            <UserCheck className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        );
      case UserRole.CMS_WRITER:
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-[11px]"
          >
            CMS Writer
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="font-medium text-[11px]">
            {role}
          </Badge>
        );
    }
  };

  // Filtered & Sorted Users
  const processedUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = users.filter((u) => {
      const matchesSearch =
        !q ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortColumn === "username") {
        comparison = a.username.localeCompare(b.username);
      } else if (sortColumn === "role") {
        comparison = a.role.localeCompare(b.role);
      } else if (sortColumn === "status") {
        comparison = a.status.localeCompare(b.status);
      } else if (sortColumn === "createdAt") {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [users, search, roleFilter, statusFilter, sortColumn, sortDirection]);

  // Paginated Rows
  const totalRows = processedUsers.length;
  const pageCount = Math.ceil(totalRows / pageSize) || 1;
  const currentUsers = useMemo(() => {
    const start = pageIndex * pageSize;
    return processedUsers.slice(start, start + pageSize);
  }, [processedUsers, pageIndex, pageSize]);

  const handlePageChange = (newIndex: number) => {
    setPageIndex(Math.max(0, Math.min(newIndex, pageCount - 1)));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0);
  };

  // Metric counts
  const superadminCount = users.filter(
    (u) => u.role === UserRole.SUPERADMIN
  ).length;
  const adminCount = users.filter((u) => u.role === UserRole.ADMIN).length;
  const unverifiedCount = users.filter(
    (u) => u.status === UserStatus.UNVERIFIED
  ).length;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-3.5 bg-card/60 backdrop-blur-sm border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Total Pengguna
            </p>
            <p className="text-2xl font-bold font-heading text-foreground">
              {users.length}
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-sm border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Superadmin
            </p>
            <p className="text-2xl font-bold font-heading text-purple-600 dark:text-purple-400">
              {superadminCount}
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-sm border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Admin</p>
            <p className="text-2xl font-bold font-heading text-sky-600 dark:text-sky-400">
              {adminCount}
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <UserCheck className="h-5 w-5" />
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-sm border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">
              Belum Verifikasi
            </p>
            <p className="text-2xl font-bold font-heading text-rose-600 dark:text-rose-400">
              {unverifiedCount}
            </p>
          </div>
          <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </Card>
      </div>

      {/* Search, Filter, and Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari username atau email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageIndex(0);
              }}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Filter Role (Shadcn Select) */}
          <Select
            value={roleFilter}
            onValueChange={(val) => {
              if (val) {
                setRoleFilter(val);
                setPageIndex(0);
              }
            }}
          >
            <SelectTrigger className="h-9 text-xs w-[140px] bg-background">
              <SelectValue placeholder="Pilih Peran" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Peran</SelectItem>
              <SelectItem value={UserRole.SUPERADMIN}>Superadmin</SelectItem>
              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
              <SelectItem value={UserRole.CMS_WRITER}>CMS Writer</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter Status (Shadcn Select) */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              if (val) {
                setStatusFilter(val);
                setPageIndex(0);
              }
            }}
          >
            <SelectTrigger className="h-9 text-xs w-[140px] bg-background">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value={UserStatus.VERIFIED}>Verified</SelectItem>
              <SelectItem value={UserStatus.UNVERIFIED}>Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button size="sm" onClick={handleOpenCreate} className="shrink-0 cursor-pointer">
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah Pengguna
        </Button>
      </div>

      {/* User Data Table Card */}
      <Card className="border-border overflow-hidden">
        {processedUsers.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title={
              users.length === 0
                ? "Belum ada akun pengguna"
                : "Tidak ada pengguna yang cocok"
            }
            description={
              users.length === 0
                ? "Daftarkan akun panitia atau admin baru untuk mulai mengelola sistem."
                : "Coba ubah kata kunci pencarian atau reset filter peran/status."
            }
            action={
              users.length === 0 ? (
                <Button size="sm" onClick={handleOpenCreate}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Tambah Pengguna Baru
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
                        title="Pengguna"
                        isSorted={
                          sortColumn === "username" ? sortDirection : false
                        }
                        onSort={() => handleSort("username")}
                      />
                    </TableHead>
                    <TableHead className="py-3">
                      <DataTableColumnHeader
                        title="Peran (Role)"
                        isSorted={sortColumn === "role" ? sortDirection : false}
                        onSort={() => handleSort("role")}
                      />
                    </TableHead>
                    <TableHead className="py-3">
                      <DataTableColumnHeader
                        title="Status Akun"
                        isSorted={
                          sortColumn === "status" ? sortDirection : false
                        }
                        onSort={() => handleSort("status")}
                      />
                    </TableHead>
                    <TableHead className="font-semibold text-xs py-3 text-muted-foreground">
                      Terakhir Login
                    </TableHead>
                    <TableHead className="py-3">
                      <DataTableColumnHeader
                        title="Dibuat Pada"
                        isSorted={
                          sortColumn === "createdAt" ? sortDirection : false
                        }
                        onSort={() => handleSort("createdAt")}
                      />
                    </TableHead>
                    <TableHead className="w-12 text-right py-3 font-semibold text-xs">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => {
                    const initials = user.username.slice(0, 2).toUpperCase();
                    const formattedLastLogin = formatDate(user.lastLogin);
                    const formattedCreatedAt = formatDate(user.createdAt);

                    return (
                      <TableRow
                        key={user.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        {/* User Info */}
                        <TableCell className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-lg border border-border">
                              <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-foreground">
                                {user.username}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Role */}
                        <TableCell className="py-3">
                          {getRoleBadge(user.role)}
                        </TableCell>

                        {/* Status */}
                        <TableCell className="py-3">
                          <StatusBadge
                            status={user.status}
                            activeLabel="Verified"
                            inactiveLabel="Unverified"
                          />
                        </TableCell>

                        {/* Last Login */}
                        <TableCell className="py-3 text-xs text-muted-foreground">
                          {formattedLastLogin ? (
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                              <span>{formattedLastLogin}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60 italic">
                              Belum pernah login
                            </span>
                          )}
                        </TableCell>

                        {/* Created At */}
                        <TableCell className="py-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                            <span>{formattedCreatedAt}</span>
                          </div>
                        </TableCell>

                        {/* Action Menu */}
                        <TableCell className="py-3 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className={buttonVariants({
                                variant: "ghost",
                                size: "icon",
                                className:
                                  "h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer",
                              })}
                              disabled={isPending}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleOpenEdit(user)}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Pengguna
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(user)}
                                className="cursor-pointer"
                              >
                                {user.status === UserStatus.VERIFIED ? (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4 text-amber-500" />
                                    <span>Tandai Unverified</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                    <span>Verifikasi Akun</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(user)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Hapus Akun
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

            {/* Data Table Pagination */}
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
      <UserDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userToEdit={userToEdit}
      />

      {/* Shadcn Alert Dialog for User Deletion */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Hapus Pengguna?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus akun pengguna{" "}
              <strong className="text-foreground">
                @{deleteTarget?.username}
              </strong>{" "}
              ({deleteTarget?.email})? Tindakan ini bersifat permanen dan tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Ya, Hapus Pengguna"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
