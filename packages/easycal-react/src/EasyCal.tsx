import { useEffect, useRef, type CSSProperties } from 'react';
import EasyCalCore from '@brinda_yawa/easycal';
import EasyCalOptions from "@brinda_yawa/easycal"
export type EasyCalEventInfo = {
  date?: Date;
  resourceId?: string | null;
  event?: unknown;
  [key: string]: unknown;
};

export type EasyCalProps = EasyCalOptions & {
  initialDate?: string | Date;
  className?: string;
  style?: CSSProperties;
  onDateChange?: (info: EasyCalEventInfo) => void;
  dateClick?: (info: EasyCalEventInfo) => void;
  eventClick?: (info: EasyCalEventInfo) => void;
  eventDrop?: (info: EasyCalEventInfo) => void;
  eventResize?: (info: EasyCalEventInfo) => void;
};

function normalizeDate(value: string | Date): string | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export default function EasyCal(props: EasyCalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<any>(null);
  const propsRef = useRef<EasyCalProps>(props);
  const lastAppliedDateRef = useRef<string | null>(null);

  propsRef.current = props;

  useEffect(() => {
    if (!containerRef.current) return;

    const boundOptions = {
      ...propsRef.current,
      onDateChange: (info: EasyCalEventInfo) => {
        if (info?.date instanceof Date && !Number.isNaN(info.date.getTime())) {
          lastAppliedDateRef.current = info.date.toISOString().slice(0, 10);
        }
        propsRef.current.onDateChange?.(info);
      },
      onDateClick: (info: EasyCalEventInfo) => propsRef.current.dateClick?.(info),
      onEventClick: (info: EasyCalEventInfo) => propsRef.current.eventClick?.(info),
      eventDrag: (info: EasyCalEventInfo) => propsRef.current.eventDrop?.(info),
      eventResize: (info: EasyCalEventInfo) => propsRef.current.eventResize?.(info),
    };

    instanceRef.current = new (EasyCalCore as any)(containerRef.current, boundOptions);

    return () => {
      instanceRef.current?.destroy?.();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance?.setOptions) return;

    instance.setOptions({
      ...props,
      onDateChange: (info: EasyCalEventInfo) => {
        if (info?.date instanceof Date && !Number.isNaN(info.date.getTime())) {
          lastAppliedDateRef.current = info.date.toISOString().slice(0, 10);
        }
        propsRef.current.onDateChange?.(info);
      },
      onDateClick: (info: EasyCalEventInfo) => propsRef.current.dateClick?.(info),
      onEventClick: (info: EasyCalEventInfo) => propsRef.current.eventClick?.(info),
      eventDrag: (info: EasyCalEventInfo) => propsRef.current.eventDrop?.(info),
      eventResize: (info: EasyCalEventInfo) => propsRef.current.eventResize?.(info),
    });
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
}
