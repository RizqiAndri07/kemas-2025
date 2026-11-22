export type FormFieldType =
  | "text"        // String / Single-line input
  | "textarea"    // String / Multi-line input
  | "number"      // Integer / Number
  | "file"        // Upload berkas (Gambar, PDF)
  | "url"         // Link web / URL
  | "select"      // Dropdown opsi
  | "radio"       // Pilihan tunggal
  | "checkbox";   // Kotak centang (boolean atau multi-opsi)

export interface FormFieldValidation {
  min?: number;
  max?: number;
  fileConfig?: {
    allowedTypes: ("image" | "pdf")[]; // Jenis berkas yang diizinkan
    maxSizeMb: number; // Ukuran berkas maksimal dalam MB (default: 2)
  };
  options?: Array<{ label: string; value: string }>; // Untuk select atau radio
}

export interface FormFieldConfig {
  id: string; // Identifier unik / slug, cth: 'team_name', 'leader_phone'
  label: string; // Label input yang muncul di formulir pendaftar
  placeholder?: string;
  helperText?: string;
  type: FormFieldType;
  required: boolean;
  order: number;
  validation?: FormFieldValidation;
}

export interface FormSectionConfig {
  id: string; // Identifier unik section, cth: 'sec_identity', 'sec_documents'
  title: string; // Judul section, cth: "Data Identitas Tim"
  description?: string; // Deskripsi petunjuk section
  order: number;
  fields: FormFieldConfig[];
}

export interface CompetitionForm {
  id: string;
  competitionId: string;
  title: string;
  description?: string | null;
  sections: FormSectionConfig[];
  createdAt: Date;
  updatedAt: Date;
}
