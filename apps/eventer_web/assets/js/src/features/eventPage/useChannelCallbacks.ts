import { Option } from 'funfix';
import { Channel } from 'phoenix';
import { useCallback } from 'react';
import {
  addDecisionT,
  discardResolutionT,
  removeDecisionT,
  resolveDecisionT,
  updateDecisionT,
  updateEventT,
  addPollT,
  voteT,
} from './types';

type useChannelCallbacksT = (
  channel: Option<Channel>,
) => {
  joinEvent: () => void;
  leaveEvent: () => void;
  updateEvent: updateEventT;
  addDecision: addDecisionT;
  updateDecision: updateDecisionT;
  openTimeDiscussion: () => void;
  openPlaceDiscussion: () => void;
  resolveDecision: resolveDecisionT;
  discardResolution: discardResolutionT;
  removeDecision: removeDecisionT;
  addPoll: addPollT;
  vote: voteT;
};
const useChannelCallbacks: useChannelCallbacksT = channel => {
  const joinEvent = useCallback(() => {
    channel.get().push('join_event', {});
  }, [channel]);

  const leaveEvent = useCallback(() => {
    channel.get().push('leave_event', {});
  }, [channel]);

  const updateEvent = useCallback<updateEventT>(
    (data, onSuccess, onError) => {
      channel
        .get()
        .push('update_event', { event: data })
        .receive('ok', onSuccess)
        .receive('error', response => onError(response.errors));
    },
    [channel],
  );

  const addDecision = useCallback<addDecisionT>(
    (decision, onSuccess, onError) => {
      channel
        .get()
        .push('add_decision', { decision })
        .receive('ok', onSuccess)
        .receive('error', response => onError(response.errors));
    },
    [channel],
  );

  const updateDecision = useCallback<updateDecisionT>(
    (decision, onSuccess, onError) => {
      channel
        .get()
        .push('update_decision', { decision })
        .receive('ok', onSuccess)
        .receive('error', response => {
          onError(response.errors);
        });
    },
    [channel],
  );

  const openTimeDiscussion = useCallback(() => {
    channel.get().push('open_discussion', { objective: 'time' });
  }, [channel]);

  const openPlaceDiscussion = useCallback(() => {
    channel.get().push('open_discussion', { objective: 'place' });
  }, [channel]);

  const resolveDecision = useCallback<resolveDecisionT>(
    ({ decisionId, resolution }, onSuccess, onError) => {
      channel
        .get()
        .push('resolve_decision', { decision: { id: decisionId, resolution } })
        .receive('ok', onSuccess)
        .receive('error', response => {
          onError(response.errors);
        });
    },
    [channel],
  );

  const discardResolution = useCallback<discardResolutionT>(
    id => {
      channel.get().push('discard_resolution', { decision_id: id });
    },
    [channel],
  );

  const removeDecision = useCallback<removeDecisionT>(
    id => {
      channel.get().push('remove_decision', { decision_id: id });
    },
    [channel],
  );

  const addPoll = useCallback<addPollT>(
    (id, poll) => {
      channel.get().push('add_poll', { decision_id: id, poll });
    },
    [channel],
  );

  const vote = useCallback<voteT>(
    ({ decisionId, customOption, optionsVotedFor }, onError) => {
      channel
        .get()
        .push('vote', {
          decision_id: decisionId,
          custom_option: customOption,
          options: optionsVotedFor,
        })
        .receive('error', response => {
          onError(response.errors);
        });
    },
    [channel],
  );

  return {
    joinEvent,
    leaveEvent,
    updateEvent,
    addDecision,
    updateDecision,
    openTimeDiscussion,
    openPlaceDiscussion,
    resolveDecision,
    discardResolution,
    removeDecision,
    addPoll,
    vote,
  };
};

export default useChannelCallbacks;
