import React, { useMemo } from 'react';
import ReactTooltip from 'react-tooltip';
import { toast } from 'react-toastify';
import Description from '../../components/Description';
import { getDateString, getTimeString } from '../../util/time';
import {
  CreatedBy,
  DiscussButton,
  EditEventButton,
  EventTitle,
  EventTitleLine,
  BasicEventInfoWrapper,
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
  CreatedByAndParticipationButton,
  ParticipationButton,
  ShareEventUrl,
} from './BasicEventInfo.styles';
import useParticipation from './hooks/useParticipation';
import { stateEventT } from './types';
import Markdown from '../../components/Markdown';
import { getOSAndBrowser } from '../../util/deviceInfo';
import { HorizontalSeparator } from '../../components/Separator';
import { copyUrlToClipboard } from '../../util/copyUrlToClipboard';

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
  const {
    title, description, time, place, creatorId, participants,
  } = event;
  const isCurrentUserParticipating = useParticipation();

  const isMobile = useMemo(() => {
    const { os } = getOSAndBrowser();
    return os === 'Android' || os === 'iOS';
  }, []);

  const sortedParticipants = useMemo(
    () => Object.entries(participants).sort(
      (a, b) => (a[1].isOnline === b[1].isOnline ? 0 : a[1].isOnline ? -1 : 1),
    ),
    [participants],
  );

  const handleShareEventUrl = () => {
    copyUrlToClipboard(window.location.href);
    toast('Event URL copied to clipboard!');
  };

  return (
    <BasicEventInfoWrapper>
      {!isMobile && <ReactTooltip />}
      <Info>
        <EventTitleLine>
          <EventTitle>
            {title}
            {isCurrentUserParticipating && (
              <>
                <EditEventButton
                  onClick={onEditEventClick}
                  data-tip="Edit event title or description"
                  data-place="bottom"
                />
                <ShareEventUrl onClick={handleShareEventUrl} />
              </>
            )}
          </EventTitle>
        </EventTitleLine>
        {description && (
          <Description>
            <Markdown>{description}</Markdown>
          </Description>
        )}
        <CreatedByAndParticipationButton>
          <CreatedBy>
            Created by
            {participants[creatorId].name}
          </CreatedBy>
          {creatorId !== currentUserId && (
            <ParticipationButton
              onClick={participants[currentUserId] ? leaveEvent : joinEvent}
              action={participants[currentUserId] ? 'leave' : 'join'}
            >
              {participants[currentUserId] ? 'leave' : 'join'}
            </ParticipationButton>
          )}
        </CreatedByAndParticipationButton>
      </Info>
      <HorizontalSeparator />
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
      <HorizontalSeparator />
      <Participants>
        <Label>
          Participants (
          {Object.keys(participants).length}
          )
        </Label>
        <ParticipantsGrid>
          {sortedParticipants.map(([participantId, participantData]) => (
            <Participant key={participantId}>
              <div>
                <PresenceIndicator isOnline={participantData.isOnline} />
              </div>
              {participantData.name}
            </Participant>
          ))}
        </ParticipantsGrid>
      </Participants>
    </BasicEventInfoWrapper>
  );
};

export default BasicEventInfo;
