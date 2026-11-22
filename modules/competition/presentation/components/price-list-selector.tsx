"use client";

import { useState } from "react";
import {
  Tag,
  Check,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  X,
  Sparkles,
  AlertCircle,
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
import { PriceListItem } from "../../infrastructure/competition.table";

interface PriceListSelectorProps {
  priceList: PriceListItem[];
  selectedPriceId: string;
  onChangePriceList: (list: PriceListItem[]) => void;
  onSelectPrice: (id: string, price: number) => void;
  disabled?: boolean;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PriceListSelector({
  priceList,
  selectedPriceId,
  onChangePriceList,
  onSelectPrice,
  disabled = false,
}: PriceListSelectorProps) {
  const [open, setOpen] = useState(false);

  // State untuk penambahan tier baru
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [addError, setAddError] = useState<string | null>(null);

  // State untuk inline editing tier yang ada
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // Temukan item terpilih saat ini
  const selectedItem =
    priceList.find((p) => p.id === selectedPriceId) ||
    priceList[0] || {
      id: "default",
      name: "Normal Price",
      price: 0,
    };

  // Handler: Pilih tier aktif
  const handleSelect = (item: PriceListItem) => {
    onSelectPrice(item.id, item.price);
    setOpen(false);
  };

  // Handler: Buka inline edit
  const handleStartEdit = (e: React.MouseEvent, item: PriceListItem) => {
    e.stopPropagation();
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(String(item.price));
  };

  // Handler: Batal inline edit
  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditName("");
    setEditPrice("");
  };

  // Handler: Simpan inline edit
  const handleSaveEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const cleanName = editName.trim();
    const parsedPrice = parseInt(editPrice, 10);

    if (!cleanName) return;
    if (isNaN(parsedPrice) || parsedPrice < 0) return;

    const updatedList = priceList.map((item) => {
      if (item.id === id) {
        return { ...item, name: cleanName, price: parsedPrice };
      }
      return item;
    });

    onChangePriceList(updatedList);

    // Jika item yang sedang diedit adalah item aktif, sinkronkan nominal fee
    if (id === selectedPriceId) {
      onSelectPrice(id, parsedPrice);
    }

    setEditingId(null);
  };

  // Handler: Hapus tier tambahan
  const handleDeleteTier = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (priceList.length <= 1) return;

    const filtered = priceList.filter((item) => item.id !== id);
    onChangePriceList(filtered);

    // Jika yang dihapus adalah tier yang sedang terpilih, kembalikan ke item pertama
    if (id === selectedPriceId) {
      const fallback = filtered[0];
      if (fallback) {
        onSelectPrice(fallback.id, fallback.price);
      }
    }
  };

  // Handler: Tambah tier baru
  const handleAddNewTier = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const cleanName = newName.trim();
    const parsedPrice = parseInt(newPrice, 10);

    if (!cleanName) {
      setAddError("Nama price list wajib diisi.");
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setAddError("Harga harus berupa nominal angka valid (min. 0).");
      return;
    }

    const newId = `tier-${Date.now()}`;
    const newItem: PriceListItem = {
      id: newId,
      name: cleanName,
      price: parsedPrice,
    };

    const updatedList = [...priceList, newItem];
    onChangePriceList(updatedList);

    // Otomatis aktifkan tier baru yang baru saja ditambahkan
    onSelectPrice(newId, parsedPrice);

    // Reset input
    setNewName("");
    setNewPrice("");
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-primary" />
          Price List & Gelombang Pendaftaran
        </span>
        <span className="text-[11px] text-muted-foreground font-normal">
          Pilih harga aktif atau atur daftar harga
        </span>
      </Label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="w-full h-11 justify-between px-3.5 text-left font-normal bg-card hover:bg-accent/40 border-border shadow-xs"
            />
          }
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Tag className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-2 truncate">
              <span className="font-semibold text-sm text-foreground truncate">
                {selectedItem.name}
              </span>
              <Badge
                variant="secondary"
                className="font-medium text-xs bg-muted text-foreground"
              >
                {selectedItem.price === 0 ? "Gratis (Rp 0)" : formatRupiah(selectedItem.price)}
              </Badge>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-96 p-0 shadow-lg border-border bg-popover text-popover-foreground z-50"
        >
          {/* Header Popover */}
          <div className="p-3.5 pb-2.5 bg-muted/30 border-b border-border/60">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Kelola Price List Event
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Pilih harga yang sedang berlaku, edit nominal, atau tambahkan gelombang presale.
            </p>
          </div>

          {/* List Item Price List */}
          <div className="p-2 space-y-1 max-h-56 overflow-y-auto">
            {priceList.map((item) => {
              const isSelected = item.id === selectedPriceId;
              const isEditing = editingId === item.id;
              const isDefaultTier = item.id === "default" || item.id === priceList[0]?.id;

              if (isEditing) {
                return (
                  <div
                    key={item.id}
                    className="p-2 rounded-lg border border-primary/30 bg-primary/5 space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Nama Tier</Label>
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nama"
                          className="h-8 text-xs bg-background"
                          autoFocus
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Harga (Rp)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="1000"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          placeholder="Nominal"
                          className="h-8 text-xs bg-background"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEdit}
                        className="h-6 px-2 text-[11px]"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Batal
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => handleSaveEdit(e, item.id)}
                        className="h-6 px-2 text-[11px]"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Simpan
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/10 text-primary font-medium border border-primary/25"
                      : "hover:bg-muted/60 text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`h-4 w-4 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/40 group-hover:border-foreground"
                      }`}
                    >
                      {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                    </div>
                    <span className="truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <Badge
                      variant={isSelected ? "default" : "secondary"}
                      className="text-[11px] font-mono px-2 py-0"
                    >
                      {item.price === 0 ? "Rp 0" : formatRupiah(item.price)}
                    </Badge>

                    {/* Tombol Edit */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleStartEdit(e, item)}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-60 group-hover:opacity-100"
                      title="Edit Nama / Harga"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>

                    {/* Tombol Hapus (jika bukan default dan jumlah item > 1) */}
                    {!isDefaultTier && priceList.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteTier(e, item.id)}
                        className="h-6 w-6 text-destructive/70 hover:text-destructive opacity-60 group-hover:opacity-100"
                        title="Hapus Tier"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          {/* Form Tambah Tier Baru */}
          <form onSubmit={handleAddNewTier} className="p-3 bg-muted/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-foreground">
                Tambah Price List / Presale Baru
              </span>
            </div>

            {addError && (
              <div className="flex items-center gap-1.5 text-[11px] text-destructive bg-destructive/10 p-1.5 rounded">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <div className="grid grid-cols-5 gap-1.5">
              <div className="col-span-3">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Misal: Presale 1"
                  className="h-8 text-xs bg-background"
                />
              </div>
              <div className="col-span-2">
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Rp (30000)"
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs font-medium cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Tambahkan ke Price List
            </Button>
          </form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
