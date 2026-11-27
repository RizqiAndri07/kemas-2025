import { CompetitionType } from "../domain/competition-type.enum";
import { CompetitionStatus } from "../domain/competition-status.enum";
import { CompetitionFormSelect } from "./competition-form.table";
import { EventDocumentSelect } from "./event-document.table";

export interface PriceListItem {
  id: string;
  name: string;
  price: number;
  status?: "ACTIVE" | "EXPIRED";
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
  documents?: EventDocumentSelect[];
}

export interface CompetitionDetailSelect extends CompetitionSelect {
  forms?: CompetitionFormSelect[];
  contactPersons?: any[];
  documents?: any[];
  rundown?: any;
  bracket?: any;
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
