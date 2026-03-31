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
  className?: string;
  style?: CSSProperties;
  dateClick?: (info: EasyCalEventInfo) => void;
  eventClick?: (info: EasyCalEventInfo) => void;
  eventDrop?: (info: EasyCalEventInfo) => void;
  eventResize?: (info: EasyCalEventInfo) => void;
};

export default function EasyCal(props: EasyCalProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<any>(null);
  const propsRef = useRef<EasyCalProps>(props);

  propsRef.current = props;

  useEffect(() => {
    if (!containerRef.current) return;

    const boundOptions = {
      ...propsRef.current,
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
      onDateClick: (info: EasyCalEventInfo) => propsRef.current.dateClick?.(info),
      onEventClick: (info: EasyCalEventInfo) => propsRef.current.eventClick?.(info),
      eventDrag: (info: EasyCalEventInfo) => propsRef.current.eventDrop?.(info),
      eventResize: (info: EasyCalEventInfo) => propsRef.current.eventResize?.(info),
    });
  }, [props]);

  return <div ref={containerRef} className={props.className} style={props.style} />;
}
