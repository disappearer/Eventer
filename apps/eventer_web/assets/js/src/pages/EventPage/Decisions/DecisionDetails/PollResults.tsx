import React, { useContext } from 'react';
import styled from 'styled-components';
import EventContext from '../../EventContext';
import { optionT, stateEventT } from '../../types';

const Options = styled.div`
  display: grid;
  grid-gap: 9px;
`;

const Option = styled.div`
  display: grid;
  grid-gap: 5px;
  justify-items: start;
`;

const OptionText = styled.div`
  font-size: 0.9rem;
  padding: 5px 17px;
  text-align: center;
  border-radius: 27px;
  border: 1px solid ${(props) => props.theme.colors.pale};
  color: ${(props) => props.theme.colors.emperor};
`;

const Voters = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.emperor};
  max-width: 269px;
`;

type getVotersT = (option: optionT, event: stateEventT) => string;
const getVoters: getVotersT = (option, event) => {
  if (option.votes.length === 0) {
    return 'Nobody voted';
  }
  const { participants, exParticipants } = event;
  const voters = option.votes.reduce((voters, voterId) => {
    const voter = participants[voterId] || exParticipants[voterId];
    return `${voters} ${voter.name},`;
  }, 'Voted by: ');
  return voters.slice(0, -1);
};

type pollResultsT = {
  options: optionT[];
};
const PollResults: React.FC<pollResultsT> = ({ options }) => {
  const { event } = useContext(EventContext);

  return (
    <Options>
      {options.map((option) => (
        <Option key={option.id}>
          <OptionText>{option.text}</OptionText>
          <Voters>{getVoters(option, event)}</Voters>
        </Option>
      ))}
    </Options>
  );
};

export default PollResults;
