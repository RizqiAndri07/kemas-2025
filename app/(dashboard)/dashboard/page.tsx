import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Users,
  Trophy,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/StatCard";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";
import { getAllBlogs } from "@/modules/blog/infrastructure/blog.repository";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const blogs = await getAllBlogs();
  const totalBlogs = blogs.length;
  const activeCommentsCount = blogs.filter((b) => b.commentStatus).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ringkasan Sistem & Analitik"
        description="Selamat datang di Pusat Kendali Administrasi Kemas Prasasti 2025."
      >
        <Link href="/dashboard/blog/create">
          <Button size="sm" className="cursor-pointer">
            <Plus className="mr-1.5 h-4 w-4" />
            Tulis Artikel Baru
          </Button>
        </Link>
      </PageHeader>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Artikel Blog"
          value={totalBlogs}
          icon={FileText}
          description="Publikasi artikel terdaftar"
        />
        <StatCard
          title="Komentar Aktif"
          value={activeCommentsCount}
          icon={MessageSquare}
          description="Artikel dengan status komentar terbuka"
        />
        <StatCard
          title="Cabang Kompetisi"
          value={5}
          icon={Trophy}
          description="Lomba aktif & terbuka"
        />
        <StatCard
          title="Pendaftar Terverifikasi"
          value="128"
          icon={Users}
          description="Peserta terverifikasi panitia"
        />
      </div>

      {/* Recent Blogs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Publikasi Artikel Terbaru
              </CardTitle>
              <CardDescription>
                Daftar artikel yang baru saja dibuat atau diperbarui.
              </CardDescription>
            </div>
            <Link href="/dashboard/blog">
              <Button variant="ghost" size="sm" className="text-xs cursor-pointer">
                Lihat Semua <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {blogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Belum ada artikel yang dibuat.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {blogs.slice(0, 5).map((blog) => (
                  <div
                    key={blog.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="space-y-0.5 max-w-md">
                      <Link
                        href={`/dashboard/blog/${blog.id}/edit`}
                        className="text-sm font-medium text-foreground hover:underline line-clamp-1"
                      >
                        {blog.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        {blog.tag && <span>Tag: {blog.tag}</span>}
                        <span>•</span>
                        <span>
                          {new Date(blog.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border",
                          blog.status === "PUBLIC"
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-border bg-muted/60 text-muted-foreground"
                        )}
                      >
                        {blog.status === "PUBLIC" ? "Public" : "Private"}
                      </span>
                      <StatusBadge
                        status={blog.commentStatus}
                        activeLabel="Komentar Buka"
                        inactiveLabel="Komentar Tutup"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links & Shortcuts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Pintasan Cepat
            </CardTitle>
            <CardDescription>Akses cepat modul administrasi.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              href="/dashboard/blog/create"
              className="flex items-center justify-between rounded-lg border border-border p-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Buat Rilis Berita Baru
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <Link
              href="/dashboard/competition"
              className="flex items-center justify-between rounded-lg border border-border p-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Kelola Kuota Lomba
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
            <Link
              href="/dashboard/registrations"
              className="flex items-center justify-between rounded-lg border border-border p-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-500" />
                Antrean Verifikasi Berkas
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
