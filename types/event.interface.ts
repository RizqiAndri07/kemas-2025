export interface IDataEvent {
  id: number;
  name: string;
  logo: string;
  typograpghy?: string;
  maskot?: Record<string, string>;
  date: string;
  location: string;

  description: string;
  open_registration?: string;
  link_registration?: string;

  prize?: number | Record<string, number> | string;
  pamflet?: string;

  contact?: Record<string, string>;
  note?: string;
  berkas?: Record<string, string>;
}
