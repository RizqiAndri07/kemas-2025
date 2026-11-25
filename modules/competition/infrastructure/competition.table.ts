import { CompetitionType } from "../domain/competition-type.enum";
import { CompetitionStatus } from "../domain/competition-status.enum";

export interface PriceListItem {
  id: string;
  name: string;
  price: number;
}

export interface CompetitionSelect {
  id: string;
  name: string;
  type: CompetitionType;
  registrationStartDate: Date;
  registrationEndDate: Date;
  eventStartDate: Date;
  eventEndDate: Date;
  fee: number;
  priceList: PriceListItem[];
  selectedPriceId: string;
  guidebookUrl: string | null;
  description: string | null;
  maxQuota: number | null;
  status: CompetitionStatus;
  noRegistrationNeeded: boolean;
  activeFormId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitionInsert {
  id?: string;
  name: string;
  type?: CompetitionType;
  registrationStartDate: Date;
  registrationEndDate: Date;
  eventStartDate: Date;
  eventEndDate: Date;
  fee?: number;
  priceList?: PriceListItem[];
  selectedPriceId?: string;
  guidebookUrl?: string | null;
  description?: string | null;
  maxQuota?: number | null;
  status?: CompetitionStatus;
  noRegistrationNeeded?: boolean;
  activeFormId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
