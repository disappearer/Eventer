import Markdown from 'markdown-to-jsx';
import React from 'react';
import Button from '../../components/Button';
import Description from '../../components/Description';
import { getDateString, getTimeString } from '../../util/time';
import {
  CreatedBy,
  DiscussButton,
  EditEventButton,
  EventTitle,
  EventTitleLine,
  Grid,
  Info,
  Label,
  Participant,
  Participants,
  ParticipantsGrid,
  PlaceData,
  PlaceDiscussButton,
  PlaceLabel,
  PresenceIndicator,
  TimeData,
  TimePlace,
} from './BasicEventInfo.styles';
import useParticipation from './hooks/useParticipation';
import { stateEventT } from './types';

type basicEventInfoPropsT = {
  event: stateEventT;
  currentUserId: number;
  onEditEventClick: () => void;
  onDiscussTimeClick: () => void;
  onDiscussPlaceClick: () => void;
  joinEvent: () => void;
  leaveEvent: () => void;
};
const BasicEventInfo: React.FC<basicEventInfoPropsT> = ({
  event,
  currentUserId,
  onEditEventClick,
  onDiscussTimeClick,
  onDiscussPlaceClick,
  joinEvent,
  leaveEvent,
}) => {
  const { title, description, time, place, creatorId, participants } = event;
  const isCurrentUserParticipating = useParticipation();
  return (
    <Grid>
      <Info>
        <EventTitleLine>
          <EventTitle>{title}</EventTitle>
          {isCurrentUserParticipating && (
            <EditEventButton onClick={onEditEventClick}>
              Edit basic info
            </EditEventButton>
          )}
        </EventTitleLine>
        {description && (
          <Description>
            <Markdown>{description}</Markdown>
          </Description>
        )}
        <CreatedBy>Created by {participants[creatorId].name}</CreatedBy>
      </Info>
      <TimePlace>
        <Label>Time</Label>
        {time ? (
          <TimeData>
            <div>{getDateString(time)}</div>
            <div>{getTimeString(time)}</div>
          </TimeData>
        ) : (
          <TimeData>TBD</TimeData>
        )}
        {isCurrentUserParticipating && time && (
          <DiscussButton onClick={onDiscussTimeClick}>Discuss</DiscussButton>
        )}
        <PlaceLabel>Place</PlaceLabel>
        <PlaceData>
          {(place && <Markdown>{place}</Markdown>) || 'TBD'}
        </PlaceData>
        {isCurrentUserParticipating && place && (
          <PlaceDiscussButton onClick={onDiscussPlaceClick}>
            Discuss
          </PlaceDiscussButton>
        )}
      </TimePlace>
      <Participants>
        <Label>Participants</Label>
        <ParticipantsGrid>
          {Object.entries(participants).map(
            ([participantId, participantData]) => (
              <Participant key={participantId}>
                <div>
                  <PresenceIndicator isOnline={participantData.isOnline} />
                </div>
                {participantData.name}
              </Participant>
            ),
          )}
          {creatorId !== currentUserId && (
            <Button
              onClick={participants[currentUserId] ? leaveEvent : joinEvent}
            >
              {participants[currentUserId] ? 'Leave' : 'Join'}
            </Button>
          )}
        </ParticipantsGrid>
      </Participants>
    </Grid>
  );
};

export default BasicEventInfo;
