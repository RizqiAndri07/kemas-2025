import { FormSectionConfig } from "../domain/competition-form.interface";

export interface CompetitionFormSelect {
  id: string;
  competitionId: string;
  title: string;
  description: string | null;
  sections: FormSectionConfig[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitionFormInsert {
  id?: string;
  competitionId: string;
  title: string;
  description?: string | null;
  sections?: FormSectionConfig[];
  createdAt?: Date;
  updatedAt?: Date;
}
