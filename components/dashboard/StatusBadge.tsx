import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: boolean | string;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
}

export function StatusBadge({
  status,
  activeLabel = "Aktif",
  inactiveLabel = "Nonaktif",
  className,
}: StatusBadgeProps) {
  const isPositive =
    typeof status === "boolean"
      ? status
      : status.toLowerCase() === "open" ||
        status.toLowerCase() === "published" ||
        status.toLowerCase() === "verified";

  const label = typeof status === "boolean" ? (status ? activeLabel : inactiveLabel) : status;

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium text-xs px-2.5 py-0.5 capitalize",
        isPositive
          ? "border-primary/20 bg-primary/10 text-primary"
          : "border-destructive/20 bg-destructive/10 text-destructive",
        className
      )}
    >
      <span
        className={cn(
          "mr-1.5 h-1.5 w-1.5 rounded-full inline-block",
          isPositive ? "bg-primary" : "bg-destructive"
        )}
      />
      {label}
    </Badge>
  );
}
