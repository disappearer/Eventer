import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from '../../components/Link';
import { eventT, getEvents } from '../../util/event_service';
import { Description, Title, Top, MainWrapper } from './common.styled';

const Events = styled.div``;

const Event = styled.div`
  padding: 15px 0px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const EventTitle = styled.h2`
  justify-self: center;
`;

const TimePlace = styled.div`
  align-self: center;
  display: grid;
  grid-template-columns: 1fr;
  grid-row-gap: 5px;
`;

const TimePlaceItem = styled.div``;

const EventList: React.FC = () => {
  const { events } = useEvents();

  return (
    <MainWrapper>
      <Top>
        <Title>Your events</Title>
        <Description>
          These are the events of which you are the creator or a participant.
        </Description>
      </Top>
      <Events>
        {events.map(event => (
          <Event key={event.id_hash}>
            <EventTitle>
              <Link to={`/events/${event.id_hash}`}>{event.title}</Link>
            </EventTitle>
            <TimePlace>
              <TimePlaceItem>Time: {event.time || 'TBD'}</TimePlaceItem>
              <TimePlaceItem>Place: {event.place || 'TBD'}</TimePlaceItem>
            </TimePlace>
          </Event>
        ))}
      </Events>
    </MainWrapper>
  );
};

export default EventList;

type useEventsT = () => { events: eventT[] };
const useEvents: useEventsT = () => {
  const [events, setEvents] = useState<eventT[]>([]);

  useEffect(() => {
    const fetchAndSetEvents = async () => {
      const result = await getEvents();
      if (result.ok) {
        setEvents(result.data.events);
      }
    };

    fetchAndSetEvents();
  }, []);

  return { events };
};