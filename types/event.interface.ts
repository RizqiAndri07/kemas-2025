export interface IDataEvent {
  id: number;
  name: string;
  logo: string;
  typography?: string;
  maskot?: Record<string, string>;
  date?: string[];
  location: string;
  venue?: string;
  description: string;
  open_registration?: string;
  link_registration?: string;

  prize?: number | Record<string, number> | "Free Entry";
  pamflet?: string;

  contact?: Record<string, string>;
  note?: string;
  berkas?: Record<string, string>;
}
