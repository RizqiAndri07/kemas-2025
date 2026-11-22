"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, Filter, Trophy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CompetitionSelect } from "../../infrastructure/competition.table";
import { CompetitionCard } from "./competition-card";
import { AddCompetitionCard } from "./add-competition-card";
import { EmptyState } from "@/components/dashboard/EmptyState";

interface CompetitionGridProps {
  competitions: CompetitionSelect[];
}

export function CompetitionGrid({ competitions }: CompetitionGridProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredCompetitions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return competitions.filter((comp) => {
      const matchesSearch =
        !q ||
        comp.name.toLowerCase().includes(q) ||
        (comp.description && comp.description.toLowerCase().includes(q));

      const matchesType = typeFilter === "ALL" || comp.type === typeFilter;
      const matchesStatus = statusFilter === "ALL" || comp.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [competitions, search, typeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama kompetisi / event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Type Filter */}
          <Select
            value={typeFilter}
            onValueChange={(val) => {
              if (val) setTypeFilter(val);
            }}
          >
            <SelectTrigger className="h-9 text-xs w-[140px] bg-background">
              <SelectValue placeholder="Pilih Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Tipe</SelectItem>
              <SelectItem value="TOURNAMENT">Tournament</SelectItem>
              <SelectItem value="EVENT">Event</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              if (val) setStatusFilter(val);
            }}
          >
            <SelectTrigger className="h-9 text-xs w-[140px] bg-background">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="OPEN">Pendaftaran Buka</SelectItem>
              <SelectItem value="CLOSED">Pendaftaran Tutup</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Create CTA Button */}
        <Button
          size="sm"
          render={<Link href="/dashboard/competition/create" />}
          className="shrink-0 cursor-pointer shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah Kompetisi
        </Button>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card #1: Dedicated Add Event Card */}
        <AddCompetitionCard />

        {/* Remaining Competition Cards */}
        {filteredCompetitions.map((comp) => (
          <CompetitionCard key={comp.id} competition={comp} />
        ))}
      </div>

      {/* Empty State when filtered result is empty */}
      {filteredCompetitions.length === 0 && competitions.length > 0 && (
        <EmptyState
          icon={Trophy}
          title="Tidak ada kompetisi yang cocok"
          description="Coba ubah kata kunci pencarian atau reset filter tipe dan status."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setTypeFilter("ALL");
                setStatusFilter("ALL");
              }}
            >
              Reset Filter
            </Button>
          }
        />
      )}
    </div>
  );
}
