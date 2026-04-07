import {
  forwardRef,
  isValidElement,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import EasyCalCore from '@brinda_yawa/easycal';

export type EasyCalEventInfo = {
  date?: Date;
  resourceId?: string | null;
  event?: unknown;
  [key: string]: unknown;
};

export type EasyCalResourceFieldMap = {
  id?: string;
  label?: string;
};

export type EasyCalResourceRenderer = (resource: any) => ReactNode | HTMLElement | string;

export type EasyCalEventFormContext = {
  mode: 'create' | 'edit';
  event?: any;
  date?: Date;
  resourceId?: string | null;
  save: (data?: any) => void;
  update: (data?: any) => void;
  delete: () => void;
  close: () => void;
};

export type EasyCalProps = {
  initialDate?: string | Date;
  className?: string;
  style?: CSSProperties;
  resources?: any[];
  resourceRenderer?: EasyCalResourceRenderer;
  resourceFieldMap?: EasyCalResourceFieldMap;
  eventFormRenderer?: (context: EasyCalEventFormContext) => ReactNode;
  onDateChange?: (info: EasyCalEventInfo) => void;
  dateClick?: (info: EasyCalEventInfo) => void;
  eventClick?: (info: EasyCalEventInfo) => void;
  eventDrop?: (info: EasyCalEventInfo) => void;
  eventResize?: (info: EasyCalEventInfo) => void;
  [key: string]: any;
};

export type EasyCalRef = {
  getInstance: () => any;
  prev: () => void;
  next: () => void;
  today: () => void;
  gotoDate: (date: string | Date, source?: string) => void;
  changeView: (view: string) => void;
  addEvent: (event: unknown) => unknown;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, patch: unknown) => unknown;
  getEvents: () => unknown[];
};

function normalizeDate(value: string | Date): string | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function normalizeInfo(info: EasyCalEventInfo) {
  return {
    ...info,
    resourceId: info?.resourceId ?? null,
  };
}

function toCoreResourceRenderer(renderer?: EasyCalResourceRenderer) {
  if (typeof renderer !== 'function') return undefined;

  return (resource: any) => {
    const result = renderer(resource);
    if (typeof result === 'string' || result instanceof HTMLElement) return result;
    if (result == null || typeof result === 'boolean') return '';
    if (isValidElement(result)) return renderToStaticMarkup(result);
    return String(result);
  };
}

function toCoreEventFormRenderer(renderer?: (context: EasyCalEventFormContext) => ReactNode) {
  if (typeof renderer !== 'function') return undefined;

  return (context: EasyCalEventFormContext) => {
    const result = renderer(context);
    if (typeof result === 'string' || result instanceof HTMLElement) return result;
    if (result == null || typeof result === 'boolean') return '';
    if (isValidElement(result)) return renderToStaticMarkup(result);
    return String(result);
  };
}

function buildBoundOptions(propsRef: React.MutableRefObject<EasyCalProps>, lastAppliedDateRef: React.MutableRefObject<string | null>) {
  return {
    ...propsRef.current,
    resourceRenderer: toCoreResourceRenderer(propsRef.current.resourceRenderer),
    eventFormRenderer: toCoreEventFormRenderer(propsRef.current.eventFormRenderer),
    onDateChange: (info: EasyCalEventInfo) => {
      if (info?.date instanceof Date && !Number.isNaN(info.date.getTime())) {
        lastAppliedDateRef.current = info.date.toISOString().slice(0, 10);
      }
      propsRef.current.onDateChange?.(normalizeInfo(info));
    },
    dateClick: (info: EasyCalEventInfo) => propsRef.current.dateClick?.(normalizeInfo(info)),
    eventClick: (info: EasyCalEventInfo) => propsRef.current.eventClick?.(normalizeInfo(info)),
    eventDrop: (info: EasyCalEventInfo) => propsRef.current.eventDrop?.(normalizeInfo(info)),
    eventResize: (info: EasyCalEventInfo) => propsRef.current.eventResize?.(normalizeInfo(info)),
  };
}

const EasyCal = forwardRef<EasyCalRef, EasyCalProps>(function EasyCal(props, ref) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<any>(null);
  const propsRef = useRef<EasyCalProps>(props);
  const lastAppliedDateRef = useRef<string | null>(null);

  propsRef.current = props;

  useImperativeHandle(ref, () => ({
    getInstance: () => instanceRef.current,
    prev: () => instanceRef.current?.prev?.(),
    next: () => instanceRef.current?.next?.(),
    today: () => instanceRef.current?.today?.(),
    gotoDate: (date, source) => instanceRef.current?.gotoDate?.(date, source),
    changeView: (view) => instanceRef.current?.changeView?.(view),
    addEvent: (event) => instanceRef.current?.addEvent?.(event),
    removeEvent: (id) => instanceRef.current?.removeEvent?.(id),
    updateEvent: (id, patch) => instanceRef.current?.updateEvent?.(id, patch),
    getEvents: () => instanceRef.current?.getEvents?.() || [],
  }), []);

  useEffect(() => {
    if (!containerRef.current) return;

    instanceRef.current = new (EasyCalCore as any)(containerRef.current, buildBoundOptions(propsRef, lastAppliedDateRef));

    return () => {
      instanceRef.current?.destroy?.();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance?.setOptions) return;
    instance.setOptions(buildBoundOptions(propsRef, lastAppliedDateRef));
  }, [props]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance?.gotoDate || props.initialDate == null) return;

    const normalized = normalizeDate(props.initialDate);
    if (!normalized || normalized === lastAppliedDateRef.current) return;

    const nextDate = props.initialDate instanceof Date ? props.initialDate : new Date(props.initialDate);
    lastAppliedDateRef.current = normalized;
    instance.gotoDate(nextDate);
  }, [props.initialDate]);

  return <div ref={containerRef} className={props.className} style={props.style} />;
});

export default EasyCal;
