import { useCallback, useState } from 'react';
import { discardPollT, discardResolutionT } from '../../types';

type decisionActionT =
  | 'view'
  | 'edit'
  | 'resolve'
  | 'discard_resolution'
  | 'add_poll'
  | 'discard_poll';

type useDecisionActionsT = (
  decisionId: number,
  onResolutionDiscard: discardResolutionT,
  onPollDiscard: discardPollT,
) => {
  decisionAction: decisionActionT;
  showEditForm: () => void;
  showResolveForm: () => void;
  resetDecisionModal: () => void;
  showDiscardResolutionConfirmation: () => void;
  showDiscardPollConfirmation: () => void;
  discardResolution: (onSuccess: () => void, onError: () => void) => void;
  discardPoll: (onSuccess: () => void, onError: () => void) => void;
  showAddPollForm: () => void;
};
export const useDecisionActions: useDecisionActionsT = (
  decisionId,
  onResolutionDiscard,
  onPollDiscard,
) => {
  const [decisionAction, setDecisionAction] = useState<decisionActionT>('view');

  const showEditForm = useCallback(() => {
    setDecisionAction('edit');
  }, [setDecisionAction]);

  const showResolveForm = useCallback(() => {
    setDecisionAction('resolve');
  }, [setDecisionAction]);

  const resetDecisionModal = useCallback(() => {
    setDecisionAction('view');
  }, [setDecisionAction]);

  const showDiscardResolutionConfirmation = useCallback(() => {
    setDecisionAction('discard_resolution');
  }, [setDecisionAction]);

  const showDiscardPollConfirmation = useCallback(() => {
    setDecisionAction('discard_poll');
  }, [setDecisionAction]);

  const discardResolution = useCallback(
    (onSuccess: () => void, onError: () => void) => {
      onResolutionDiscard({ decisionId }, onSuccess, onError);
    },
    [setDecisionAction],
  );

  const discardPoll = useCallback(
    (onSuccess: () => void, onError: () => void) => {
      onPollDiscard({ decisionId }, onSuccess, onError);
    },
    [setDecisionAction],
  );

  const showAddPollForm = useCallback(() => {
    setDecisionAction('add_poll');
  }, [setDecisionAction]);

  return {
    decisionAction,
    showEditForm,
    showResolveForm,
    resetDecisionModal,
    showDiscardResolutionConfirmation,
    showDiscardPollConfirmation,
    discardResolution,
    discardPoll,
    showAddPollForm,
  };
};
