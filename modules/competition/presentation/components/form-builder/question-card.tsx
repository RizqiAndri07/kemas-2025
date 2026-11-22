"use client";

import { useState } from "react";
import { Reorder, useDragControls } from "motion/react";
import {
  FormFieldConfig,
  FormFieldType,
} from "@/modules/competition/domain/competition-form.interface";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Type,
  AlignLeft,
  Hash,
  UploadCloud,
  Link as LinkIcon,
  List,
  CircleDot,
  CheckSquare,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  MoreVertical,
  HelpCircle,
  FileText,
  GripHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  field: FormFieldConfig;
  isActive: boolean;
  onFocus: () => void;
  onUpdate: (field: FormFieldConfig) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  index: number;
}

const FIELD_TYPES: Array<{
  value: FormFieldType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { value: "text", label: "Jawaban Singkat", icon: Type },
  { value: "textarea", label: "Paragraf", icon: AlignLeft },
  { value: "radio", label: "Pilihan Ganda", icon: CircleDot },
  { value: "checkbox", label: "Kotak Centang", icon: CheckSquare },
  { value: "select", label: "Dropdown", icon: List },
  { value: "file", label: "Upload Berkas", icon: UploadCloud },
  { value: "number", label: "Angka", icon: Hash },
  { value: "url", label: "Tautan / URL", icon: LinkIcon },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "_")
    .replace(/^-+|-+$/g, "");
}

export function QuestionCard({
  field,
  isActive,
  onFocus,
  onUpdate,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  index,
}: QuestionCardProps) {
  const dragControls = useDragControls();
  const [showDescription, setShowDescription] = useState(Boolean(field.helperText));
  const [showPlaceholder, setShowPlaceholder] = useState(Boolean(field.placeholder));
  const [showManualId, setShowManualId] = useState(false);

  // TYPE SWITCH HANDLER
  const handleTypeChange = (newType: FormFieldType) => {
    const updated: FormFieldConfig = {
      ...field,
      type: newType,
    };

    if (newType === "radio" || newType === "select" || newType === "checkbox") {
      if (!updated.validation?.options || updated.validation.options.length === 0) {
        updated.validation = {
          ...updated.validation,
          options: [{ label: "Opsi 1", value: "opsi_1" }],
        };
      }
    } else if (newType === "file") {
      if (!updated.validation?.fileConfig) {
        updated.validation = {
          ...updated.validation,
          fileConfig: {
            allowedTypes: ["image", "pdf"],
            maxSizeMb: 2,
          },
        };
      }
    }

    onUpdate(updated);
  };

  // OPTIONS HANDLER (RADIO / CHECKBOX / SELECT)
  const options = field.validation?.options || [
    { label: "Opsi 1", value: "opsi_1" },
  ];

  const handleOptionChange = (optIdx: number, newLabel: string) => {
    const updatedOptions = [...options];
    updatedOptions[optIdx] = {
      label: newLabel,
      value: slugify(newLabel) || `opt_${optIdx + 1}`,
    };
    onUpdate({
      ...field,
      validation: {
        ...field.validation,
        options: updatedOptions,
      },
    });
  };

  const handleAddOption = () => {
    const nextNum = options.length + 1;
    const label = `Opsi ${nextNum}`;
    const updatedOptions = [
      ...options,
      { label, value: slugify(label) || `opsi_${nextNum}` },
    ];
    onUpdate({
      ...field,
      validation: {
        ...field.validation,
        options: updatedOptions,
      },
    });
  };

  const handleRemoveOption = (optIdx: number) => {
    if (options.length <= 1) return;
    const updatedOptions = options.filter((_, i) => i !== optIdx);
    onUpdate({
      ...field,
      validation: {
        ...field.validation,
        options: updatedOptions,
      },
    });
  };

  // FILE CONFIG HANDLER
  const fileConfig = field.validation?.fileConfig || {
    allowedTypes: ["image", "pdf"],
    maxSizeMb: 2,
  };

  const handleToggleFileType = (fileType: "image" | "pdf", checked: boolean) => {
    let currentTypes = [...fileConfig.allowedTypes];
    if (checked && !currentTypes.includes(fileType)) {
      currentTypes.push(fileType);
    } else if (!checked && currentTypes.includes(fileType)) {
      if (currentTypes.length > 1) {
        currentTypes = currentTypes.filter((t) => t !== fileType);
      }
    }
    onUpdate({
      ...field,
      validation: {
        ...field.validation,
        fileConfig: {
          ...fileConfig,
          allowedTypes: currentTypes,
        },
      },
    });
  };

  const handleChangeMaxSize = (size: number) => {
    onUpdate({
      ...field,
      validation: {
        ...field.validation,
        fileConfig: {
          ...fileConfig,
          maxSizeMb: size,
        },
      },
    });
  };

  return (
    <Reorder.Item
      value={field}
      as="div"
      dragListener={false}
      dragControls={dragControls}
      className="relative"
    >
      <div
        onClick={onFocus}
        className={cn(
          "group relative rounded-xl border bg-card p-4 pt-2 transition-all duration-200 cursor-pointer",
          isActive
            ? "border-l-4 border-l-primary border-primary/50 shadow-md ring-1 ring-primary/25"
            : "border-l-4 border-l-transparent border-border/80 hover:border-border shadow-xs hover:shadow-sm"
        )}
      >
        {/* Top Center Drag Handle (Google Forms Signature) */}
        <div
          onPointerDown={(e) => {
            e.stopPropagation();
            dragControls.start(e);
          }}
          className="flex items-center justify-center -mt-1 pb-1 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground transition-colors touch-none"
          title="Tarik untuk memindahkan urutan pertanyaan"
        >
          <GripHorizontal className="h-4 w-6" />
        </div>

        {/* Top Row: Question Title & Type Selector */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
              {index + 1}
            </span>
            <Input
              value={field.label}
              onChange={(e) => onUpdate({ ...field, label: e.target.value })}
              placeholder="Tuliskan pertanyaan / label field di sini..."
              className="h-10 text-sm font-semibold text-foreground bg-muted/20 focus:bg-card border-input transition-colors flex-1"
            />
          </div>

          <div className="shrink-0 self-end sm:self-start">
            <Select
              value={field.type}
              onValueChange={(val) => {
                if (val) handleTypeChange(val as FormFieldType);
              }}
            >
              <SelectTrigger className="h-10 w-[180px] text-xs shrink-0 bg-muted/20 focus:bg-card border-input">
                <SelectValue placeholder="Tipe Pertanyaan" />
              </SelectTrigger>
              <SelectContent align="end">
                {FIELD_TYPES.map((t) => {
                  const Icon = t.icon;
                  return (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                        <span>{t.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Optional Description / Helper Text Input */}
        {showDescription && (
          <div className="mt-2.5 pl-8">
            <Input
              value={field.helperText || ""}
              onChange={(e) => onUpdate({ ...field, helperText: e.target.value })}
              placeholder="Tambahkan petunjuk pengisian untuk peserta (deskripsi)..."
              className="h-8 text-xs text-muted-foreground bg-muted/10 border-dashed"
            />
          </div>
        )}

        {/* Optional Placeholder Input */}
        {showPlaceholder && (
          <div className="mt-2 pl-8">
            <Input
              value={field.placeholder || ""}
              onChange={(e) => onUpdate({ ...field, placeholder: e.target.value })}
              placeholder="Teks placeholder di dalam input..."
              className="h-8 text-xs text-muted-foreground bg-muted/10 border-dashed"
            />
          </div>
        )}

        {/* Optional Slug ID Input */}
        {showManualId && (
          <div className="mt-2 pl-8 flex items-center gap-2">
            <span className="text-[11px] font-mono text-muted-foreground shrink-0">
              Slug ID:
            </span>
            <Input
              value={field.id}
              onChange={(e) =>
                onUpdate({
                  ...field,
                  id: slugify(e.target.value) || e.target.value,
                })
              }
              placeholder="id_pertanyaan"
              className="h-7 text-xs font-mono max-w-xs bg-muted/10"
            />
          </div>
        )}

        {/* Body: Dynamic Type-Specific Preview & Controls */}
        <div className="mt-4 pl-8">
          {/* TEXT */}
          {field.type === "text" && (
            <div className="py-1">
              <Input
                disabled
                placeholder={field.placeholder || "Teks jawaban singkat"}
                className="max-w-md h-8 text-xs border-b border-t-0 border-x-0 rounded-none bg-transparent opacity-60 italic cursor-not-allowed"
              />
            </div>
          )}

          {/* TEXTAREA */}
          {field.type === "textarea" && (
            <div className="py-1">
              <Textarea
                disabled
                placeholder={field.placeholder || "Teks jawaban panjang (paragraf)"}
                rows={2}
                className="max-w-lg text-xs border-b border-t-0 border-x-0 rounded-none bg-transparent opacity-60 italic resize-none cursor-not-allowed"
              />
            </div>
          )}

          {/* NUMBER */}
          {field.type === "number" && (
            <div className="space-y-2 py-1">
              <Input
                disabled
                placeholder={field.placeholder || "0"}
                className="w-32 h-8 text-xs border-b border-t-0 border-x-0 rounded-none bg-transparent opacity-60 italic cursor-not-allowed"
              />
              {isActive && (
                <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                  <span className="text-[11px] font-medium">Batasan Angka:</span>
                  <div className="flex items-center gap-1.5">
                    <span>Min:</span>
                    <Input
                      type="number"
                      value={field.validation?.min !== undefined ? field.validation.min : ""}
                      onChange={(e) =>
                        onUpdate({
                          ...field,
                          validation: {
                            ...field.validation,
                            min: e.target.value !== "" ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      placeholder="Min"
                      className="h-7 w-20 text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>Max:</span>
                    <Input
                      type="number"
                      value={field.validation?.max !== undefined ? field.validation.max : ""}
                      onChange={(e) =>
                        onUpdate({
                          ...field,
                          validation: {
                            ...field.validation,
                            max: e.target.value !== "" ? Number(e.target.value) : undefined,
                          },
                        })
                      }
                      placeholder="Max"
                      className="h-7 w-20 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* URL */}
          {field.type === "url" && (
            <div className="py-1">
              <Input
                disabled
                placeholder="https://..."
                className="max-w-md h-8 text-xs border-b border-t-0 border-x-0 rounded-none bg-transparent opacity-60 italic cursor-not-allowed"
              />
            </div>
          )}

          {/* RADIO / CHECKBOX / SELECT OPTIONS */}
          {(field.type === "radio" ||
            field.type === "checkbox" ||
            field.type === "select") && (
            <div className="space-y-2 py-1">
              {options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2 max-w-md">
                  {field.type === "radio" && (
                    <CircleDot className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  {field.type === "checkbox" && (
                    <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  {field.type === "select" && (
                    <span className="text-xs text-muted-foreground font-mono w-4 shrink-0">
                      {optIdx + 1}.
                    </span>
                  )}
                  <Input
                    value={opt.label}
                    onChange={(e) => handleOptionChange(optIdx, e.target.value)}
                    placeholder={`Opsi ${optIdx + 1}`}
                    className="h-8 text-xs flex-1"
                  />
                  {options.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(optIdx);
                      }}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                      title="Hapus Opsi"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddOption();
                  }}
                  className="h-7 text-xs text-primary hover:text-primary gap-1 px-2 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Opsi</span>
                </Button>
              </div>
            </div>
          )}

          {/* FILE CONFIGURATION */}
          {field.type === "file" && (
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-2.5 max-w-md">
              <div className="flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground">
                  Pengaturan Berkas
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <span className="text-[11px] text-muted-foreground font-medium">
                  Jenis berkas yang diizinkan:
                </span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <Checkbox
                      checked={fileConfig.allowedTypes.includes("image")}
                      onCheckedChange={(checked) =>
                        handleToggleFileType("image", Boolean(checked))
                      }
                    />
                    <span>Gambar (JPG, PNG, WEBP)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs">
                    <Checkbox
                      checked={fileConfig.allowedTypes.includes("pdf")}
                      onCheckedChange={(checked) =>
                        handleToggleFileType("pdf", Boolean(checked))
                      }
                    />
                    <span>Dokumen PDF</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <span className="text-muted-foreground">Ukuran maksimal:</span>
                <Select
                  value={String(fileConfig.maxSizeMb || 2)}
                  onValueChange={(val) => {
                    if (val) handleChangeMaxSize(Number(val));
                  }}
                >
                  <SelectTrigger className="h-7 w-24 text-xs bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 MB</SelectItem>
                    <SelectItem value="2">2 MB</SelectItem>
                    <SelectItem value="5">5 MB</SelectItem>
                    <SelectItem value="10">10 MB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Toolbar: Reorder, Duplicate, Delete, Required Switch, More Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-border/50 pt-2.5 mt-4 gap-2 text-xs text-muted-foreground pl-8">
          {/* Left: Reorder Controls & Field Slug Indicator */}
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isFirst}
              onClick={(e) => {
                e.stopPropagation();
                onMoveUp();
              }}
              className="h-7 w-7 p-0 cursor-pointer"
              title="Pindah ke Atas"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLast}
              onClick={(e) => {
                e.stopPropagation();
                onMoveDown();
              }}
              className="h-7 w-7 p-0 cursor-pointer"
              title="Pindah ke Bawah"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[11px] font-mono text-muted-foreground/60 ml-1 truncate max-w-[150px]">
              ID: {field.id}
            </span>
          </div>

          {/* Right: Duplicate, Delete, Separator, Required Switch, More Menu */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="h-7 px-2 text-xs gap-1 hover:text-foreground cursor-pointer"
              title="Duplikasi Pertanyaan"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Duplikasi</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-7 px-2 text-xs gap-1 text-destructive hover:bg-destructive/10 cursor-pointer"
              title="Hapus Pertanyaan"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Hapus</span>
            </Button>

            <Separator orientation="vertical" className="h-4 mx-1" />

            {/* Required Switch */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 pr-1"
            >
              <Label
                htmlFor={`req-${field.id}`}
                className="text-xs cursor-pointer font-medium text-foreground select-none"
              >
                Wajib diisi
              </Label>
              <Switch
                id={`req-${field.id}`}
                checked={field.required}
                onCheckedChange={(checked) =>
                  onUpdate({ ...field, required: checked })
                }
              />
            </div>

            <Separator orientation="vertical" className="h-4 mx-0.5" />

            {/* More Options Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                  className:
                    "h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer",
                })}
                aria-label="Opsi Lainnya"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDescription(!showDescription);
                  }}
                  className="cursor-pointer text-xs"
                >
                  <HelpCircle className="mr-2 h-3.5 w-3.5" />
                  <span>
                    {showDescription
                      ? "Sembunyikan Petunjuk"
                      : "Tampilkan Petunjuk"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaceholder(!showPlaceholder);
                  }}
                  className="cursor-pointer text-xs"
                >
                  <FileText className="mr-2 h-3.5 w-3.5" />
                  <span>
                    {showPlaceholder
                      ? "Sembunyikan Placeholder"
                      : "Tampilkan Placeholder"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowManualId(!showManualId);
                  }}
                  className="cursor-pointer text-xs"
                >
                  <Hash className="mr-2 h-3.5 w-3.5" />
                  <span>{showManualId ? "Sembunyikan Slug ID" : "Atur Slug ID"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}
