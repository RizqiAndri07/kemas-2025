import React from "react";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface HeroSectionProps {
  totalCount: number;
}

const HeroSection = ({ totalCount }: HeroSectionProps) => {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-3 max-w-2xl mx-auto">
      <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs">
        <Trophy className="h-3.5 w-3.5 text-primary" />
        <span>{totalCount} Kompetisi & Event Tersedia</span>
      </Badge>
      <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground">
        Kompetisi & Event PRASASTI 2026
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Pilih kompetisi atau acara yang sesuai dengan bakatmu, pelajari panduan regulasinya, dan daftarkan tim atau dirimu sekarang juga.
      </p>
    </div>
  );
};

export default HeroSection;
