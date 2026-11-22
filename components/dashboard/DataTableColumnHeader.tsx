"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps {
  title: string;
  isSorted?: "asc" | "desc" | false;
  onSort?: () => void;
  className?: string;
}

export function DataTableColumnHeader({
  title,
  isSorted = false,
  onSort,
  className,
}: DataTableColumnHeaderProps) {
  if (!onSort) {
    return <span className={cn("font-semibold text-xs", className)}>{title}</span>;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onSort}
      className={cn(
        "-ml-3 h-8 text-xs font-semibold hover:bg-muted/80 data-[state=open]:bg-accent cursor-pointer",
        className
      )}
    >
      <span>{title}</span>
      {isSorted === "desc" ? (
        <ArrowDown className="ml-1.5 h-3.5 w-3.5 text-foreground" />
      ) : isSorted === "asc" ? (
        <ArrowUp className="ml-1.5 h-3.5 w-3.5 text-foreground" />
      ) : (
        <ArrowUpDown className="ml-1.5 h-3.5 w-3.5 text-muted-foreground/50" />
      )}
    </Button>
  );
}
