export interface ContactPersonSelect {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactPersonInsert {
  id?: string;
  name: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CompetitionContactPersonSelect {
  competitionId: string;
  contactPersonId: string;
  createdAt: Date;
}
