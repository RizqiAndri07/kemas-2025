"use client";

import { useState, useMemo } from "react";
import { BlogSelect } from "../../infrastructure/blog.table";
import { PublicBlogCard } from "./public-blog-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  ArrowUpDown,
  X,
  Newspaper,
  SlidersHorizontal,
  Calendar,
} from "lucide-react";

interface PublicBlogCatalogProps {
  initialBlogs: BlogSelect[];
}

export function PublicBlogCatalog({ initialBlogs }: PublicBlogCatalogProps) {
  // Hanya tampilkan artikel dengan status PUBLIC untuk umum
  const publicBlogs = useMemo(
    () => initialBlogs.filter((b) => b.status === "PUBLIC"),
    [initialBlogs]
  );

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Ekstrak tag unik dari seluruh artikel
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    publicBlogs.forEach((b) => {
      if (b.tag && b.tag.trim()) {
        tags.add(b.tag.trim());
      }
    });
    return Array.from(tags);
  }, [publicBlogs]);

  // Filter & Sort blogs
  const filteredBlogs = useMemo(() => {
    let result = [...publicBlogs];

    // Filter berdasarkan kata kunci pencarian
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.tag && b.tag.toLowerCase().includes(q)) ||
          b.description.toLowerCase().includes(q)
      );
    }

    // Filter berdasarkan Tag / Kategori
    if (selectedTag !== "ALL") {
      result = result.filter(
        (b) => (b.tag || "").toLowerCase() === selectedTag.toLowerCase()
      );
    }

    // Pengurutan Terbaru vs Terlama
    result.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return sortOrder === "newest" ? timeB - timeA : timeA - timeB;
    });

    return result;
  }, [publicBlogs, search, selectedTag, sortOrder]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedTag("ALL");
    setSortOrder("newest");
  };

  const isFiltered = search.trim() !== "" || selectedTag !== "ALL" || sortOrder !== "newest";

  return (
    <div className="space-y-8">
      {/* Search & Sort Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/80 shadow-xs">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul artikel, topik, atau kata kunci..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-9 h-10 text-xs sm:text-sm bg-background/80"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Action Controls */}
        <div className="flex items-center gap-3">
          {/* Dropdown Urutkan */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Urutkan:</span>
            </span>
            <Select
              value={sortOrder}
              onValueChange={(val) => {
                if (val === "newest" || val === "oldest") setSortOrder(val);
              }}
            >
              <SelectTrigger className="h-10 text-xs sm:text-sm min-w-[150px] bg-background/80">
                <SelectValue placeholder="Pilih Urutan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest" className="text-xs sm:text-sm">
                  Terbaru (Terbit Terakhir)
                </SelectItem>
                <SelectItem value="oldest" className="text-xs sm:text-sm">
                  Terlama (Arsip Awal)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reset Button if active filter */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-10 text-xs gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Category Tag Pills Filter */}
      {availableTags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-1 flex items-center gap-1 shrink-0">
            <SlidersHorizontal className="h-3 w-3" />
            <span>Kategori:</span>
          </span>

          <Button
            type="button"
            variant={selectedTag === "ALL" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTag("ALL")}
            className="h-8 text-xs rounded-full px-3.5 shrink-0 cursor-pointer"
          >
            Semua ({publicBlogs.length})
          </Button>

          {availableTags.map((tag) => {
            const count = publicBlogs.filter((b) => (b.tag || "").toLowerCase() === tag.toLowerCase()).length;
            const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();

            return (
              <Button
                key={tag}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(isSelected ? "ALL" : tag)}
                className="h-8 text-xs rounded-full px-3.5 shrink-0 cursor-pointer gap-1"
              >
                <span>{tag}</span>
                <span className={`text-[10px] ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  ({count})
                </span>
              </Button>
            );
          })}
        </div>
      )}

      {/* Result Stats Indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Menampilkan <strong>{filteredBlogs.length}</strong> dari {publicBlogs.length} artikel resmi
        </span>
        {search && (
          <span className="italic">
            Hasil pencarian untuk &ldquo;{search}&rdquo;
          </span>
        )}
      </div>

      {/* Blog Cards Grid */}
      {filteredBlogs.length === 0 ? (
        <Card className="max-w-md mx-auto text-center p-8 border-dashed bg-card/40">
          <CardContent className="space-y-3 p-0">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
              <Newspaper className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Artikel Tidak Ditemukan
            </h3>
            <p className="text-xs text-muted-foreground">
              {search
                ? `Tidak ada artikel yang cocok dengan kata kunci "${search}". Coba gunakan kata kunci lain.`
                : "Belum ada artikel publik yang tersedia pada kategori ini."}
            </p>
            {isFiltered && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="text-xs mt-2 cursor-pointer"
              >
                Kembalikan Semua Artikel
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBlogs.map((blog) => (
            <PublicBlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}
