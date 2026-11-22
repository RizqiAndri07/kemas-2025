"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Phone,
  User,
  Plus,
  Check,
  ChevronDown,
  X,
  Search,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getAllContactPersonsAction,
  createContactPersonAction,
} from "../../application/contact-person.actions";

export interface ContactPersonItem {
  id: string;
  name: string;
  phone: string;
}

interface ContactPersonSelectorProps {
  selectedIds: string[];
  onChangeSelectedIds: (ids: string[]) => void;
  disabled?: boolean;
}

export function ContactPersonSelector({
  selectedIds,
  onChangeSelectedIds,
  disabled = false,
}: ContactPersonSelectorProps) {
  const [open, setOpen] = useState(false);
  const [contactPersons, setContactPersons] = useState<ContactPersonItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk form inline tambah CP baru
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Muat daftar contact person dari database
  const fetchContactPersons = async () => {
    setIsLoading(true);
    const res = await getAllContactPersonsAction();
    if (res.success && res.data) {
      setContactPersons(
        res.data.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
        }))
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchContactPersons();
  }, []);

  // Filter CP berdasarkan nama atau no HP
  const filteredList = contactPersons.filter(
    (cp) =>
      cp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cp.phone.includes(searchQuery)
  );

  // Toggle pilihan CP
  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChangeSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      onChangeSelectedIds([...selectedIds, id]);
    }
  };

  // Hapus chip CP yang terpilih
  const handleRemoveChip = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onChangeSelectedIds(selectedIds.filter((item) => item !== id));
  };

  // Handler: Tambah CP Baru secara inline
  const handleCreateNewCp = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddError(null);

    const cleanName = newName.trim();
    const cleanPhone = newPhone.trim().replace(/[\s\-]/g, "");

    if (cleanName.length < 2) {
      setAddError("Nama narahubung minimal 2 karakter");
      return;
    }
    if (cleanPhone.length < 8) {
      setAddError("Nomor HP minimal 8 digit");
      return;
    }

    startTransition(async () => {
      const res = await createContactPersonAction({
        name: cleanName,
        phone: cleanPhone,
      });

      if (!res.success) {
        setAddError(res.error || "Gagal menambahkan contact person");
        return;
      }
      if (!res.data) {
        setAddError("Data contact person gagal dibuat");
        return;
      }

      const created = {
        id: res.data.id,
        name: res.data.name,
        phone: res.data.phone,
      };

      // Perbarui state lokal dan otomatis pilih CP yang baru dibuat
      setContactPersons((prev) => [created, ...prev]);
      onChangeSelectedIds([...selectedIds, created.id]);

      // Reset form inline
      setNewName("");
      setNewPhone("");
      setIsAddingNew(false);
    });
  };

  // Daftar item CP terpilih
  const selectedItems = contactPersons.filter((cp) =>
    selectedIds.includes(cp.id)
  );

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-primary" />
          Narahubung / Contact Person (CP)
        </Label>
        <span className="text-[11px] text-muted-foreground">
          {selectedIds.length} narahubung dipilih
        </span>
      </div>

      {/* Popover Dropdown Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          disabled={disabled}
          className="flex h-11 w-full items-center justify-between rounded-md border border-input bg-card px-3.5 py-2 text-sm shadow-2xs hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 truncate">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            {selectedIds.length === 0 ? (
              <span className="text-muted-foreground text-xs">
                Klik untuk memilih atau menambah Contact Person...
              </span>
            ) : (
              <span className="text-xs font-medium text-foreground">
                {selectedIds.length} Contact Person ditugaskan
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200" />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          className="w-[360px] sm:w-[420px] p-0 shadow-lg border-border"
        >
          {/* Header Popover: Pencarian & Tombol Buat Baru */}
          <div className="p-3 border-b border-border/60 space-y-2 bg-muted/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Pilih Contact Person
              </span>
              {!isAddingNew && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingNew(true)}
                  className="h-7 text-[11px] gap-1 px-2 cursor-pointer"
                >
                  <Plus className="h-3 w-3 text-primary" />
                  Tambah CP Baru
                </Button>
              )}
            </div>

            {/* Input Pencarian */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau no HP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Form Inline Tambah CP Baru */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateNewCp}
              className="p-3 bg-muted/40 border-b border-border space-y-2.5 animate-in fade-in-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Narahubung Baru
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsAddingNew(false);
                    setAddError(null);
                  }}
                  className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {addError && (
                <div className="flex items-center gap-1.5 text-[11px] text-destructive bg-destructive/10 p-2 rounded-md">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{addError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Input
                  placeholder="Nama Lengkap (misal: Budi Santoso)"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={isPending}
                  className="h-8 text-xs bg-background"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Input
                  placeholder="Nomor HP/WA (misal: 081234567890)"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  disabled={isPending}
                  className="h-8 text-xs bg-background"
                  required
                />
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingNew(false)}
                  disabled={isPending}
                  className="h-7 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="h-7 text-xs gap-1 cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Plus className="h-3 w-3" />
                  )}
                  Simpan & Pilih
                </Button>
              </div>
            </form>
          )}

          {/* List Contact Persons */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-1">
            {isLoading ? (
              <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Memuat data narahubung...</span>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                {searchQuery
                  ? "Tidak ada narahubung yang sesuai pencarian"
                  : "Belum ada narahubung terdaftar"}
              </div>
            ) : (
              filteredList.map((cp) => {
                const isSelected = selectedIds.includes(cp.id);
                return (
                  <div
                    key={cp.id}
                    onClick={() => handleToggle(cp.id)}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer text-xs transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`h-4 w-4 rounded flex items-center justify-center border transition-colors ${
                          isSelected
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-muted-foreground/40 bg-background"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate leading-tight font-medium">
                          {cp.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {cp.phone}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 px-1.5 border-primary/30 text-primary"
                      >
                        Terpilih
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Contact Persons Badges / Chips */}
      {selectedItems.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {selectedItems.map((cp) => (
            <Badge
              key={cp.id}
              variant="secondary"
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 text-xs bg-muted/60 border border-border/80 hover:bg-muted text-foreground rounded-lg transition-all shadow-2xs"
            >
              <Phone className="h-3 w-3 text-primary shrink-0" />
              <span className="font-semibold">{cp.name}</span>
              <span className="text-[10px] text-muted-foreground">
                ({cp.phone})
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                onClick={(e) => handleRemoveChip(e, cp.id)}
                className="h-4 w-4 ml-0.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title={`Hapus ${cp.name}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground italic">
          Belum ada narahubung yang dikaitkan ke kompetisi ini.
        </p>
      )}
    </div>
  );
}
