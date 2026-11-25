export interface EventDocumentSelect {
  id: string;
  competitionId: string;
  name: string;
  filePath: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventDocumentInsert {
  id?: string;
  competitionId: string;
  name: string;
  filePath: string;
  createdAt?: Date;
  updatedAt?: Date;
}
