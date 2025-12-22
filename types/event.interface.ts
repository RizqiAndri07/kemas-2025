export interface IDataEvent {
  id: number;
  name: string;
  logo: string;

  maskot?: string;
  date: string;
  location: string;

  description: string;
  open_registration: string;
  link_registration?: string;

  prize: number | Record<string, number> | string;
  pamflet?: string;

  contact?: Record<string, string>;

  berkas?: Record<string, string>;
}
