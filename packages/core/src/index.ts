import './styles/base.css';
import './styles/timeline.css';
import './styles/resources.css';
import './styles/month.css';
import './styles/timegrid.css';

import CalendarCore from './core/calendarCore.js';

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

class EasyCal extends (CalendarCore as any) {}

if (typeof window !== 'undefined') {
  (window as any).EasyCal = EasyCal;
}

export default EasyCal;
