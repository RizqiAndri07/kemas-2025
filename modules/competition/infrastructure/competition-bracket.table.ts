export interface BracketMatch {
  id: string;
  round: number;
  matchNumber: number;
  teamA?: string;
  teamB?: string;
  scoreA?: number;
  scoreB?: number;
  winner?: string;
}

export interface BracketStructure {
  rounds?: number;
  matches?: BracketMatch[];
  [key: string]: any;
}

export interface CompetitionBracketSelect {
  id: string;
  competitionId: string;
  title: string;
  type: string;
  challongeUrl: string | null;
  data: BracketStructure;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitionBracketInsert {
  id?: string;
  competitionId: string;
  title?: string;
  type?: string;
  challongeUrl?: string | null;
  data?: BracketStructure;
  createdAt?: Date;
  updatedAt?: Date;
}
