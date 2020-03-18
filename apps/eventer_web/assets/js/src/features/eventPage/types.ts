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
  description: string;
  place: string | null;
  time: string | null;
};

export type specificObjectiveT =  'time' | 'place';
export type objectiveT = specificObjectiveT | 'general';

export type decisionT = {
  title: string;
  description: string;
  objective: objectiveT;
  pending: boolean;
  creator_id: number;
  resolution: string | null;
};
export type responseDecisionT = decisionT & { id: number };
export type stateDecisionsT = {
  [key: number]: decisionT;
};
export type responseDecisionsT = responseDecisionT[];

export type userT = {
  displayName: string;
  email: string;
};
export type responseUserT = userT & {
  id: number;
};
export type stateUsersT = {
  [key: number]: userT;
};
export type responseUsersT = responseUserT[];
