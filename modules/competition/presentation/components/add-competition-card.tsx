"use client";

import Link from "next/link";
import { Plus, Trophy, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AddCompetitionCard() {
  return (
    <Link
      href="/dashboard/competition/create"
      className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
    >
      <Card className="h-full min-h-[340px] border-2 border-dashed border-primary/30 hover:border-primary bg-card/40 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center p-6 text-center cursor-pointer relative overflow-hidden group-hover:shadow-lg group-hover:shadow-primary/5">
        {/* Subtle decorative glow */}
        <div className="absolute inset-0 bg-radial from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm group-hover:scale-110">
          <Plus className="h-7 w-7 transition-transform duration-300 group-hover:rotate-90" />
        </div>

        <div className="space-y-1.5 relative">
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary uppercase tracking-wider mb-1">
            <Sparkles className="h-3 w-3" />
            <span>Event Baru</span>
          </div>
          <h3 className="font-heading font-bold text-base text-foreground group-hover:text-primary transition-colors">
            Tambah Kompetisi / Event
          </h3>
          <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
            Buka pendaftaran cabang lomba baru atau jadwalkan agenda kegiatan resmi.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-full group-hover:bg-primary/10 transition-colors">
          <Trophy className="h-3.5 w-3.5" />
          <span>Buka Formulir Pendaftaran</span>
        </div>
      </Card>
    </Link>
  );
}
