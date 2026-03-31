export type EasyCalEvent = {
  id?: string;
  title: string;
  start: Date | string;
  end: Date | string;
  resourceId?: string;
  color?: string;
  textColor?: string;
};

export type EasyCalResource = {
  id: string;
  title: string;
  children?: EasyCalResource[];
};

export type EasyCalOptions = {
  mode?: 'standard' | 'timeline';
  defaultView?: string;
  initialView?: string;
  initialDate?: Date | string;
  events?: EasyCalEvent[];
  resources?: EasyCalResource[];
  dateClick?: (info: any) => void;
  eventClick?: (info: any) => void;
  eventDrop?: (info: any) => void;
  eventResize?: (info: any) => void;
  [key: string]: any;
};

export default class EasyCal {
  constructor(el: string | HTMLElement, options?: EasyCalOptions);
  setOptions(options: EasyCalOptions): void;
  addEvent(event: EasyCalEvent): EasyCalEvent;
  removeEvent(id: string): void;
  updateEvent(id: string, patch: Partial<EasyCalEvent>): EasyCalEvent | null;
  getEvents(): EasyCalEvent[];
  next(): void;
  prev(): void;
  today(): void;
  changeView(view: string): void;
  destroy(): void;
}
