"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  MessageSquare,
  Search,
  Plus,
  FileText,
  Calendar,
  AlertTriangle,
  Globe,
  Lock,
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
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DataTableColumnHeader } from "@/components/dashboard/DataTableColumnHeader";
import { DataTablePagination } from "@/components/dashboard/DataTablePagination";
import { BlogSelect } from "../../infrastructure/blog.table";
import {
  deleteBlogAction,
  toggleBlogCommentAction,
  toggleBlogStatusAction,
} from "../../application/blog.actions";
import { BlogPreviewModal } from "./blog-preview-modal";

interface BlogTableProps {
  blogs: BlogSelect[];
}

type SortColumn = "title" | "status" | "commentStatus" | "createdAt";
type SortDirection = "asc" | "desc";

export function BlogTable({ blogs }: BlogTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Dialog & Modal States
  const [previewBlog, setPreviewBlog] = useState<BlogSelect | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<BlogSelect | null>(null);

  // Sorting State
  const [sortColumn, setSortColumn] = useState<SortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Pagination State
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const handleSort = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  // Filtered & Sorted Blogs
  const processedBlogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = blogs.filter((blog) => {
      if (!q) return true;
      return (
        blog.title.toLowerCase().includes(q) ||
        (blog.tag && blog.tag.toLowerCase().includes(q)) ||
        (blog.description && blog.description.toLowerCase().includes(q))
      );
    });

    result.sort((a, b) => {
      let comparison = 0;
      if (sortColumn === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortColumn === "status") {
        comparison = (a.status || "PUBLIC").localeCompare(b.status || "PUBLIC");
      } else if (sortColumn === "commentStatus") {
        comparison = Number(a.commentStatus) - Number(b.commentStatus);
      } else if (sortColumn === "createdAt") {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [blogs, search, sortColumn, sortDirection]);

  // Paginated Rows
  const totalRows = processedBlogs.length;
  const pageCount = Math.ceil(totalRows / pageSize) || 1;
  const currentBlogs = useMemo(() => {
    const start = pageIndex * pageSize;
    return processedBlogs.slice(start, start + pageSize);
  }, [processedBlogs, pageIndex, pageSize]);

  // Handle Page Change with bounds check
  const handlePageChange = (newIndex: number) => {
    setPageIndex(Math.max(0, Math.min(newIndex, pageCount - 1)));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0);
  };

  const handleConfirmDelete = () => {
    if (!blogToDelete) return;
    const targetId = blogToDelete.id;

    startTransition(async () => {
      await deleteBlogAction(targetId);
      setBlogToDelete(null);
      router.refresh();
    });
  };

  const handleToggleComment = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleBlogCommentAction(id, !currentStatus);
      router.refresh();
    });
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "PUBLIC" ? "PRIVATE" : "PUBLIC";
    startTransition(async () => {
      await toggleBlogStatusAction(id, nextStatus);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul, tag, atau isi artikel..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(0);
            }}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <Link href="/dashboard/blog/create">
          <Button size="sm" className="cursor-pointer">
            <Plus className="mr-1.5 h-4 w-4" />
            Tulis Artikel Baru
          </Button>
        </Link>
      </div>

      {/* Blogs Data Table */}
      {processedBlogs.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? "Artikel tidak ditemukan" : "Belum ada artikel"}
          description={
            search
              ? `Tidak ditemukan artikel dengan kata kunci "${search}".`
              : "Mulai buat artikel dan publikasi pertama untuk Kemas Prasasti 2025."
          }
          action={
            <Link href="/dashboard/blog/create">
              <Button size="sm" className="cursor-pointer">
                <Plus className="mr-1.5 h-4 w-4" />
                Tulis Artikel Sekarang
              </Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-[40%]">
                    <DataTableColumnHeader
                      title="Judul Artikel"
                      isSorted={sortColumn === "title" ? sortDirection : false}
                      onSort={() => handleSort("title")}
                    />
                  </TableHead>
                  <TableHead className="w-[16%]">
                    <DataTableColumnHeader
                      title="Status Publikasi"
                      isSorted={
                        sortColumn === "status" ? sortDirection : false
                      }
                      onSort={() => handleSort("status")}
                    />
                  </TableHead>
                  <TableHead className="w-[16%]">
                    <DataTableColumnHeader
                      title="Status Komentar"
                      isSorted={
                        sortColumn === "commentStatus" ? sortDirection : false
                      }
                      onSort={() => handleSort("commentStatus")}
                    />
                  </TableHead>
                  <TableHead className="w-[16%]">
                    <DataTableColumnHeader
                      title="Tanggal Publikasi"
                      isSorted={
                        sortColumn === "createdAt" ? sortDirection : false
                      }
                      onSort={() => handleSort("createdAt")}
                    />
                  </TableHead>
                  <TableHead className="w-[12%] text-right font-semibold text-xs">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBlogs.map((blog) => (
                  <TableRow key={blog.id} className="hover:bg-muted/30">
                    <TableCell>
                      <span className="font-semibold text-foreground line-clamp-1">
                        {blog.title}
                      </span>
                    </TableCell>

                    {/* Status Publikasi */}
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
                          blog.status === "PUBLIC"
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-border bg-muted/60 text-muted-foreground"
                        )}
                      >
                        {blog.status === "PUBLIC" ? (
                          <>
                            <Globe className="h-3.5 w-3.5" />
                            Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-3.5 w-3.5" />
                            Private
                          </>
                        )}
                      </span>
                    </TableCell>

                    <TableCell>
                      <StatusBadge
                        status={blog.commentStatus}
                        activeLabel="Terbuka"
                        inactiveLabel="Tertutup"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(blog.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
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
                        <DropdownMenuContent align="end" className="w-52">
                          <DropdownMenuItem
                            onClick={() => setPreviewBlog(blog)}
                            className="cursor-pointer"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Pratinjau Artikel
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/dashboard/blog/${blog.id}/edit`)
                            }
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Artikel
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleStatus(blog.id, blog.status)
                            }
                            className="cursor-pointer"
                          >
                            {blog.status === "PUBLIC" ? (
                              <>
                                <Lock className="mr-2 h-4 w-4" />
                                Jadikan Private
                              </>
                            ) : (
                              <>
                                <Globe className="mr-2 h-4 w-4" />
                                Jadikan Public
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleComment(blog.id, blog.commentStatus)
                            }
                            className="cursor-pointer"
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            {blog.commentStatus
                              ? "Tutup Komentar"
                              : "Buka Komentar"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setBlogToDelete(blog)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus Artikel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
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
        </Card>
      )}

      {/* Blog Preview Modal */}
      {previewBlog && (
        <BlogPreviewModal
          open={!!previewBlog}
          onOpenChange={(open) => {
            if (!open) setPreviewBlog(null);
          }}
          title={previewBlog.title}
          description={previewBlog.description}
          tags={
            previewBlog.tag
              ? previewBlog.tag.split(",").map((t) => t.trim().replace(/^#/, ""))
              : []
          }
          status={(previewBlog.status || "PUBLIC") as "PUBLIC" | "PRIVATE"}
          commentStatus={previewBlog.commentStatus}
          createdAt={previewBlog.createdAt}
          isEdit={true}
        />
      )}

      {/* Shadcn Alert Dialog for Blog Deletion */}
      <AlertDialog
        open={Boolean(blogToDelete)}
        onOpenChange={(open) => {
          if (!open) setBlogToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Hapus Artikel?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus artikel{" "}
              <strong className="text-foreground">
                "{blogToDelete?.title}"
              </strong>
              ? Data artikel yang telah dihapus tidak dapat dipulihkan kembali.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "Menghapus..." : "Ya, Hapus Artikel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
