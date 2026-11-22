"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "motion/react";
import {
  FormSectionConfig,
  FormFieldConfig,
} from "@/modules/competition/domain/competition-form.interface";
import { CompetitionSelect } from "@/modules/competition/infrastructure/competition.table";
import { CompetitionFormSelect } from "@/modules/competition/infrastructure/competition-form.table";
import { saveCompetitionFormAction } from "@/modules/competition/application/competition-form.actions";
import { toast } from "@/components/ui/sonner";
import { QuestionCard } from "./question-card";
import { FormLivePreview } from "./form-live-preview";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Save,
  Eye,
  Layers,
  Loader2,
  GripVertical,
} from "lucide-react";

interface FormBuilderEditorProps {
  competition: CompetitionSelect;
  form: CompetitionFormSelect;
}

interface SectionCardItemProps {
  section: FormSectionConfig;
  sIdx: number;
  sectionsCount: number;
  activeFieldId: string | null;
  setActiveFieldId: (id: string | null) => void;
  handleUpdateSectionMeta: (
    secId: string,
    key: "title" | "description",
    val: string
  ) => void;
  handleMoveSection: (index: number, direction: "up" | "down") => void;
  handleDeleteSection: (secId: string) => void;
  handleAddField: (secId: string) => void;
  handleUpdateField: (secId: string, updatedField: FormFieldConfig) => void;
  handleDuplicateField: (
    secId: string,
    field: FormFieldConfig,
    fIdx: number
  ) => void;
  handleDeleteField: (secId: string, fieldId: string) => void;
  handleMoveField: (
    secId: string,
    fieldIdx: number,
    direction: "up" | "down"
  ) => void;
  handleReorderFields: (secId: string, newFields: FormFieldConfig[]) => void;
}

function SectionCardItem({
  section,
  sIdx,
  sectionsCount,
  activeFieldId,
  setActiveFieldId,
  handleUpdateSectionMeta,
  handleMoveSection,
  handleDeleteSection,
  handleAddField,
  handleUpdateField,
  handleDuplicateField,
  handleDeleteField,
  handleMoveField,
  handleReorderFields,
}: SectionCardItemProps) {
  const sectionDragControls = useDragControls();
  const isFirstSection = sIdx === 0;
  const isLastSection = sIdx === sectionsCount - 1;

  return (
    <Reorder.Item
      value={section}
      as="div"
      dragListener={false}
      dragControls={sectionDragControls}
      className="relative"
    >
      <Card className="border-border/80 shadow-xs overflow-hidden transition-all duration-200">
        {/* Section Header Toolbar */}
        <div className="bg-muted/30 border-b border-border/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {/* Section Drag Handle */}
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  sectionDragControls.start(e);
                }}
                className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1 touch-none"
                title="Tarik untuk memindahkan urutan section"
              >
                <GripVertical className="h-4 w-4" />
              </div>

              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
                {sIdx + 1}
              </span>
              <Input
                value={section.title}
                onChange={(e) =>
                  handleUpdateSectionMeta(section.id, "title", e.target.value)
                }
                placeholder="Judul Section (cth: Data Tim)"
                className="h-8 text-xs font-bold font-heading bg-card max-w-sm"
              />
            </div>
            <div className="pl-6">
              <Input
                value={section.description || ""}
                onChange={(e) =>
                  handleUpdateSectionMeta(
                    section.id,
                    "description",
                    e.target.value
                  )
                }
                placeholder="Deskripsi singkat section..."
                className="h-7 text-[11px] text-muted-foreground bg-card/60"
              />
            </div>
          </div>

          {/* Section Action Controls */}
          <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isFirstSection}
              onClick={() => handleMoveSection(sIdx, "up")}
              className="h-7 w-7 p-0 cursor-pointer"
              title="Pindah Section ke Atas"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLastSection}
              onClick={() => handleMoveSection(sIdx, "down")}
              className="h-7 w-7 p-0 cursor-pointer"
              title="Pindah Section ke Bawah"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteSection(section.id)}
              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 cursor-pointer"
              title="Hapus Section"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Section Questions Body (Reorderable Inline Question Cards) */}
        <CardContent className="p-4 space-y-4">
          {section.fields.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/70 p-6 text-center space-y-2 bg-muted/10">
              <p className="text-xs text-muted-foreground">
                Section ini belum memiliki pertanyaan input.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddField(section.id)}
                className="h-8 text-xs cursor-pointer gap-1.5"
              >
                <Plus className="h-3.5 w-3.5 text-primary" />
                <span>Tambah Pertanyaan Pertama</span>
              </Button>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={section.fields}
              onReorder={(newFields) =>
                handleReorderFields(section.id, newFields)
              }
              as="div"
              className="space-y-3.5"
            >
              {section.fields.map((field: FormFieldConfig, fIdx: number) => {
                const isFirstField = fIdx === 0;
                const isLastField = fIdx === section.fields.length - 1;

                return (
                  <QuestionCard
                    key={field.id}
                    field={field}
                    index={fIdx}
                    isActive={activeFieldId === field.id}
                    onFocus={() => setActiveFieldId(field.id)}
                    onUpdate={(updatedField) =>
                      handleUpdateField(section.id, updatedField)
                    }
                    onDuplicate={() =>
                      handleDuplicateField(section.id, field, fIdx)
                    }
                    onDelete={() => handleDeleteField(section.id, field.id)}
                    onMoveUp={() => handleMoveField(section.id, fIdx, "up")}
                    onMoveDown={() => handleMoveField(section.id, fIdx, "down")}
                    isFirst={isFirstField}
                    isLast={isLastField}
                  />
                );
              })}
            </Reorder.Group>
          )}
        </CardContent>

        {/* Section Footer: Inline Add Question Button */}
        <CardFooter className="bg-muted/10 border-t border-border/50 p-2.5 px-4 flex justify-between items-center">
          <span className="text-[11px] text-muted-foreground">
            {section.fields.length} Pertanyaan di section ini
          </span>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleAddField(section.id)}
            className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/5 cursor-pointer gap-1.5 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Pertanyaan</span>
          </Button>
        </CardFooter>
      </Card>
    </Reorder.Item>
  );
}

export function FormBuilderEditor({ competition, form }: FormBuilderEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form Meta states
  const [title, setTitle] = useState(form.title);
  const [description, setDescription] = useState(form.description || "");

  // Sections and fields state
  const [sections, setSections] = useState<FormSectionConfig[]>(
    form.sections && form.sections.length > 0
      ? form.sections
      : [
          {
            id: "sec_default",
            title: "Informasi Pendaftaran",
            description: "Silakan lengkapi data pendaftaran di bawah ini.",
            order: 0,
            fields: [],
          },
        ]
  );

  // Active question state (Google Forms active focus indicator)
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);

  // Live preview state
  const [previewOpen, setPreviewOpen] = useState(false);

  // SECTION ACTIONS
  const handleAddSection = () => {
    const nextIdx = sections.length + 1;
    const newSection: FormSectionConfig = {
      id: `sec_${Date.now()}`,
      title: `Bagian ${nextIdx}: Informasi Tambahan`,
      description: "Lengkapi data pendukung berikut.",
      order: sections.length,
      fields: [],
    };
    setSections([...sections, newSection]);
    toast.success("Section baru berhasil ditambahkan.");
  };

  const handleUpdateSectionMeta = (
    secId: string,
    key: "title" | "description",
    val: string
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, [key]: val } : s))
    );
  };

  const handleDeleteSection = (secId: string) => {
    if (sections.length <= 1) {
      toast.error("Formulir harus memiliki minimal 1 section.");
      return;
    }
    setSections((prev) => prev.filter((s) => s.id !== secId));
    toast.success("Section berhasil dihapus.");
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // re-index order
    setSections(updated.map((sec, idx) => ({ ...sec, order: idx })));
  };

  const handleReorderSections = (newSections: FormSectionConfig[]) => {
    setSections(newSections.map((sec, idx) => ({ ...sec, order: idx })));
  };

  // INLINE QUESTION (FIELD) ACTIONS - GOOGLE FORMS STYLE
  const handleAddField = (secId: string) => {
    const newFieldId = `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const targetSec = sections.find((s) => s.id === secId);
    const order = targetSec ? targetSec.fields.length : 0;

    const newField: FormFieldConfig = {
      id: newFieldId,
      label: "Pertanyaan Baru",
      type: "text",
      required: false,
      order,
    };

    setSections((prev) =>
      prev.map((sec) =>
        sec.id === secId
          ? { ...sec, fields: [...sec.fields, newField] }
          : sec
      )
    );
    setActiveFieldId(newFieldId);
    toast.success("Pertanyaan baru ditambahkan.");
  };

  const handleUpdateField = (secId: string, updatedField: FormFieldConfig) => {
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === secId
          ? {
              ...sec,
              fields: sec.fields.map((f) =>
                f.id === updatedField.id ? updatedField : f
              ),
            }
          : sec
      )
    );
  };

  const handleDuplicateField = (
    secId: string,
    field: FormFieldConfig,
    fIdx: number
  ) => {
    const duplicateId = `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const duplicateField: FormFieldConfig = {
      ...field,
      id: duplicateId,
      label: `${field.label} (Salinan)`,
      order: fIdx + 1,
    };

    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== secId) return sec;
        const newFields = [...sec.fields];
        newFields.splice(fIdx + 1, 0, duplicateField);
        return {
          ...sec,
          fields: newFields.map((f, i) => ({ ...f, order: i })),
        };
      })
    );
    setActiveFieldId(duplicateId);
    toast.success("Pertanyaan berhasil diduplikasi.");
  };

  const handleDeleteField = (secId: string, fieldId: string) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== secId) return sec;
        return {
          ...sec,
          fields: sec.fields
            .filter((f) => f.id !== fieldId)
            .map((f, i) => ({ ...f, order: i })),
        };
      })
    );
    toast.success("Pertanyaan dihapus.");
  };

  const handleMoveField = (
    secId: string,
    fieldIdx: number,
    direction: "up" | "down"
  ) => {
    setSections((prev) =>
      prev.map((sec) => {
        if (sec.id !== secId) return sec;

        const targetIdx = direction === "up" ? fieldIdx - 1 : fieldIdx + 1;
        if (targetIdx < 0 || targetIdx >= sec.fields.length) return sec;

        const updatedFields = [...sec.fields];
        const temp = updatedFields[fieldIdx];
        updatedFields[fieldIdx] = updatedFields[targetIdx];
        updatedFields[targetIdx] = temp;

        return {
          ...sec,
          fields: updatedFields.map((f, idx) => ({ ...f, order: idx })),
        };
      })
    );
  };

  const handleReorderFields = (secId: string, newFields: FormFieldConfig[]) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== secId) return s;
        return {
          ...s,
          fields: newFields.map((f, i) => ({ ...f, order: i })),
        };
      })
    );
  };

  // SAVE FORM TO DATABASE
  const handleSaveAll = () => {
    if (!title.trim()) {
      toast.error("Judul formulir wajib diisi.");
      return;
    }

    startTransition(async () => {
      const res = await saveCompetitionFormAction({
        id: form.id,
        competitionId: competition.id,
        title: title.trim(),
        description: description.trim() || null,
        sections,
      });

      if (!res.success) {
        toast.error(res.error || "Gagal menyimpan konfigurasi formulir.");
        return;
      }

      toast.success(res.message || "Konfigurasi formulir pendaftaran berhasil disimpan!");
      router.refresh();
    });
  };

  const totalFields = sections.reduce(
    (acc, s) => acc + (s.fields?.length || 0),
    0
  );

  return (
    <div className="space-y-6 mx-auto pb-16">
      <Link
        href="/dashboard/competition"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mb-1"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Kembali ke Katalog Event ({competition.name})</span>
      </Link>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-heading font-bold text-foreground">
              {title || "Formulir Pendaftaran"}
            </h1>
            {form.id === competition.activeFormId && (
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px]">
                Formulir Aktif
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rancang formulir pendaftaran secara langsung (inline) seperti Google Forms dengan drag & drop reordering.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            className="h-8 text-xs cursor-pointer gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Pratinjau Peserta</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveAll}
            disabled={isPending}
            className="h-8 text-xs cursor-pointer gap-1.5 shadow-sm"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Form Metadata Card */}
      <Card className="border-border/70 shadow-xs border-t-4 border-t-primary">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-heading font-semibold text-foreground">
            Informasi Umum Formulir
          </CardTitle>
          <CardDescription className="text-xs">
            Judul dan instruksi pembuka yang dibaca oleh peserta sebelum mengisi data.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          <div className="space-y-1">
            <Label htmlFor="formTitle" className="text-xs font-medium">
              Judul Formulir <span className="text-destructive">*</span>
            </Label>
            <Input
              id="formTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Formulir Pendaftaran Futsal Cup 2025"
              className="h-9 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="formDesc" className="text-xs font-medium">
              Deskripsi / Petunjuk Pengisian (Opsional)
            </Label>
            <Textarea
              id="formDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan petunjuk umum bagi calon peserta..."
              rows={2}
              className="text-xs resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sections & Inline Question Cards Container */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h2 className="font-heading font-bold text-sm text-foreground">
              Bagian & Pertanyaan ({sections.length} Section, {totalFields} Pertanyaan)
            </h2>
          </div>
        </div>

        {/* Reorderable Section Cards */}
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={handleReorderSections}
          as="div"
          className="space-y-6"
        >
          {sections.map((section, sIdx) => (
            <SectionCardItem
              key={section.id}
              section={section}
              sIdx={sIdx}
              sectionsCount={sections.length}
              activeFieldId={activeFieldId}
              setActiveFieldId={setActiveFieldId}
              handleUpdateSectionMeta={handleUpdateSectionMeta}
              handleMoveSection={handleMoveSection}
              handleDeleteSection={handleDeleteSection}
              handleAddField={handleAddField}
              handleUpdateField={handleUpdateField}
              handleDuplicateField={handleDuplicateField}
              handleDeleteField={handleDeleteField}
              handleMoveField={handleMoveField}
              handleReorderFields={handleReorderFields}
            />
          ))}
        </Reorder.Group>

        {/* Button Tambah Section Baru (Di Bawah Section Paling Akhir) */}
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={handleAddSection}
            className="h-10 px-6 text-xs font-semibold border-dashed border-primary/40 hover:border-primary text-primary hover:bg-primary/5 cursor-pointer gap-2 rounded-xl shadow-xs transition-all w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Section / Bagian Baru</span>
          </Button>
        </div>
      </div>

      {/* Live Preview Modal */}
      <FormLivePreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        formTitle={title}
        formDescription={description}
        sections={sections}
      />
    </div>
  );
}
