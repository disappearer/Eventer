import { post, get } from './api';

export type eventDataT = {
  title: string;
  description: string;
  time: Date | null;
  place: string | null;
};

type createEventBodyT = {
  event: eventDataT;
};

type createEventSuccessResponseT = { ok: true; event_id_hash: string };
type createEventErrorResponseT = { ok: false; errors: any };
type createEventResponseT =
  | createEventSuccessResponseT
  | createEventErrorResponseT;

type createEventT = (data: eventDataT) => Promise<createEventResponseT>;
export const createEvent: createEventT = async eventData => {
  const event = await post<createEventResponseT, createEventBodyT>(
    '/api/events',
    { event: eventData },
  );
  return event;
};

export type eventT = {
  title: string;
  time: string;
  place: string;
  id_hash: string;
};
type getEventsResponseT = {
  events: eventT[];
};

type getEventsT = () => Promise<getEventsResponseT>;
export const getEvents: getEventsT = async () => {
  const events = await get<getEventsResponseT>('/api/events');
  return events;
};