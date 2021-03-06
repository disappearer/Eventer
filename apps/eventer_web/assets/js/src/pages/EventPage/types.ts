export type stateEventT = eventDataT & {
  decisions: stateDecisionsT;
  participants: stateUsersT;
  exParticipants: stateUsersT;
  creatorId: number;
};

export type responseEventT = eventDataT & {
  decisions: responseDecisionsT;
  participants: responseUsersT;
  exParticipants: responseUsersT;
  creator: responseUserT;
};

export type eventDataT = {
  id: number;
  title: string;
  description: string | null;
  place: string | null;
  time: string | null;
};

export type specificObjectiveT = 'time' | 'place';
export type objectiveT = specificObjectiveT | 'general';

export type optionT = {
  id: string;
  text: string;
  votes: number[];
};

export type pollT = {
  question: string;
  custom_answer_enabled: boolean;
  multiple_answers_enabled: boolean;
  voted_by: number[];
  options: optionT[];
};

export type pollValuesT = {
  question: string;
  custom_answer_enabled: boolean;
  multiple_answers_enabled: boolean;
  options: {
    text: string;
    id: string | undefined;
  }[];
};

export type decisionT = {
  id: number;
  title: string;
  description: string | null;
  objective: objectiveT;
  pending: boolean;
  creator_id: number;
  resolution: string | null;
  poll: pollT | null;
};
export type stateDecisionsT = {
  [key: number]: decisionT;
};
export type responseDecisionsT = decisionT[];

export type userT = {
  name: string;
  email: string;
  image: string;
  isOnline: boolean;
};
export type responseUserT = userT & {
  id: number;
};
export type stateUsersT = {
  [key: number]: userT;
};
export type responseUsersT = responseUserT[];

export type updateEventT = (
  data: {
    title: string;
    description: string;
  },
  onSuccess: () => void,
  onError: (e: { title?: string }) => void,
) => void;

export type openDiscussionT = (
  objective: 'time' | 'place',
  onSuccess: () => void,
  onError: () => void,
) => void;

export type addDecisionT = (
  data: {
    title: string;
    description: string;
  },
  onSuccess: () => void,
  onError: (e: { title?: string }) => void,
) => void;

export type removeDecisionT = (
  id: number,
  onSuccess: () => void,
  onError: () => void,
) => void;

export type updateDecisionT = (
  data: {
    id: number;
    title: string;
    description: string;
  },
  onSuccess: () => void,
  onError: (e: { title?: string }) => void,
) => void;

export type resolutionT = Date | string;

export type resolveDecisionT = (
  data: {
    decisionId: number;
    resolution: resolutionT;
  },
  onSuccess: () => void,
  onError: (e: { resolution?: string }) => void,
) => void;

export type discardResolutionT = (
  data: { decisionId: number },
  onSuccess: () => void,
  onError: () => void,
) => void;

export type discardPollT = (
  data: { decisionId: number },
  onSuccess: () => void,
  onError: () => void,
) => void;

export type addPollT = (
  data: { decisionId: number; poll: pollValuesT },
  onSuccess: () => void,
  onError: (e: { question: string; options: { text: string }[] }) => void,
) => void;

type customOptionT = {
  text: string;
};
export type voteT = (
  data: {
    decisionId: number;
    customOption: customOptionT | null;
    optionsVotedFor: string[];
  },
  onError: (e: { customOption?: string }) => void,
) => void;
