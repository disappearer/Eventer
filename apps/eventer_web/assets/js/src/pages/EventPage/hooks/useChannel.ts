import { None, Option, Some } from 'funfix';
import { Channel, Socket } from 'phoenix';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Dispatch } from 'redux';
import { setIsChannelJoined } from '../../../features/event/eventActions';
import {
  addStateDecision,
  addStatePoll,
  addUserToParticipants,
  discardStateResolution,
  mapResponseEventToStateEvent,
  moveToExParticipants,
  openStateDiscussion,
  removeStateDecision,
  removeStatePoll,
  resolveStateDecision,
  setPresenceData,
  updatePresenceData,
  updateStateDecision,
  updateStateEvent,
  updateStateVote,
} from '../stateTransformations';
import { stateEventT } from '../types';

type useChannelT = (
  token: string,
  setEvent: React.Dispatch<React.SetStateAction<Option<stateEventT>>>,
) => {
  channel: Option<Channel>;
};
const useChannel: useChannelT = (token, setEvent) => {
  const { id_hash } = useParams();
  const [channel, setChannel] = useState<Option<Channel>>(None);
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = new Socket('/socket', { params: { token } });
    socket.connect();

    const channel = getNewChannel(id_hash, setEvent, socket, dispatch);

    const leaveChannel = () => {
      channel.leave();
      dispatch(setIsChannelJoined(false));
    };

    const joinChannel = () => {
      const newChannel = getNewChannel(id_hash, setEvent, socket, dispatch);
      setChannel(Some(newChannel));
    };

    window.addEventListener('blur', leaveChannel);
    window.addEventListener('focus', joinChannel);

    setChannel(Some(channel));

    return () => {
      socket.disconnect();
      window.removeEventListener('blur', leaveChannel);
      window.removeEventListener('focus', joinChannel);
    };
  }, [dispatch, id_hash, setEvent, token]);

  return { channel };
};

type getNewChannelT = (
  hashId: string | undefined,
  setEvent: React.Dispatch<React.SetStateAction<Option<stateEventT>>>,
  socket: Socket,
  dispatch: Dispatch,
) => Channel;
const getNewChannel: getNewChannelT = (hashId, setEvent, socket, dispatch) => {
  const channel = socket.channel(`event:${hashId}`);
  channel
    .join()
    .receive('ok', ({ event }) => {
      const stateEvent = mapResponseEventToStateEvent(event);
      setEvent(Some(stateEvent));
      dispatch(setIsChannelJoined(true));
    })
    .receive('error', ({ reason }) => console.log('failed join', reason));

  channel.on('user_joined', ({ user }) => {
    setEvent((event) => {
      const e = event.get();
      return Some(addUserToParticipants(e, user));
    });
  });

  channel.on('user_left', ({ userId }) => {
    setEvent((event) => {
      const e = event.get();
      return Some(moveToExParticipants(e, userId));
    });
  });

  channel.on('event_updated', ({ event: data }) => {
    setEvent((event) => {
      const e = event.get();
      return Some(updateStateEvent(e, data));
    });
  });

  channel.on('decision_added', ({ decision }) => {
    setEvent((event) => {
      const e = event.get();
      return Some(addStateDecision(e, decision));
    });
  });

  channel.on('decision_updated', ({ decision }) => {
    setEvent((event) => {
      const e = event.get();
      return Some(updateStateDecision(e, decision));
    });
  });

  channel.on('decision_resolved', ({ decision }) => {
    setEvent((event) => {
      const e = event.get();
      return Some(resolveStateDecision(e, decision));
    });
  });

  channel.on('resolution_discarded', ({ decision_id }) => {
    setEvent((event) => {
      const e = event.get();
      return Some(discardStateResolution(e, decision_id));
    });
  });

  channel.on('decision_removed', ({ decision_id }) => {
    setEvent((event) => {
      const e = event.get();
      return Some(removeStateDecision(e, decision_id));
    });
  });

  channel.on('discussion_opened', (data) => {
    setEvent((event) => {
      const e = event.get();
      return Some(openStateDiscussion(e, data));
    });
  });

  channel.on('poll_added', ({ decision_id, poll }) => {
    setEvent((event) => {
      const e = event.get();
      return Some(addStatePoll(e, decision_id, poll));
    });
  });

  channel.on('poll_removed', ({ decision_id }) => {
    setEvent((event) => {
      const e = event.get();
      return Some(removeStatePoll(e, decision_id));
    });
  });

  channel.on(
    'user_voted',
    ({
      user_id, decision_id, custom_option, options,
    }) => {
      setEvent((event) => {
        const e = event.get();
        return Some(
          updateStateVote(e, user_id, decision_id, custom_option, options),
        );
      });
    },
  );

  channel.on('presence_state', (presenceState) => {
    setEvent((event) => {
      const e = event.get();
      return Some(setPresenceData(e, presenceState));
    });
  });

  channel.on('presence_diff', (presenceDiff) => {
    setEvent((event) => {
      const e = event.get();
      return Some(updatePresenceData(e, presenceDiff));
    });
  });

  return channel;
};

export default useChannel;
