export interface RundownItem {
  id: string;
  time: string;
  activity: string;
  location?: string | null;
  notes?: string | null;
}

export interface CompetitionRundownSelect {
  id: string;
  competitionId: string;
  title: string;
  description: string | null;
  items: RundownItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitionRundownInsert {
  id?: string;
  competitionId: string;
  title?: string;
  description?: string | null;
  items?: RundownItem[];
  createdAt?: Date;
  updatedAt?: Date;
}
