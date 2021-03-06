import styled from 'styled-components';
import TextArea from 'react-autosize-textarea';
import { Send } from '@styled-icons/ionicons-sharp/Send';
import { CHAT_HIDING_BREAKPOINT } from './Chat.util';

type chatWrapperPropsT = {
  visible: boolean;
};
export const ChatWrapper = styled.div<chatWrapperPropsT>`
  flex: 3;
  display: flex;
  flex-direction: column;
  min-height: 0;

  @media (max-width: ${CHAT_HIDING_BREAKPOINT}px) {
    display: ${({ visible }) => (visible ? 'flex' : 'none')};
    flex: 1;
  }
  overflow: hidden;
`;

export const Title = styled.h5`
  margin: 0;
  margin-bottom: 14px;
`;

export const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  font-size: 0.9rem;
`;

export const Day = styled.div`
  text-align: center;
  margin: 11px 0;
  color: ${({ theme }) => theme.colors.grey};
  font-weight: 300;
  font-size: 0.8rem;
`;

export const Message = styled.div`
  display: flex;
  padding: 5px 0;
`;

export const Avatar = styled.img`
  flex: none;
  border-radius: 50%;
  margin-right: 5px;
`;

export const MessageData = styled.div`
  flex: 1;
  width: 200px;
`;

export const UserName = styled.div`
  color: ${({ theme }) => theme.colors.secondary};
  letter-spacing: 0.03rem;
  font-weight: 400;
`;

export const TimeStamp = styled.span`
  margin-left: 5px;
  color: ${({ theme }) => theme.colors.grey};
  font-weight: 300;
  font-size: 0.8rem;
`;

export const MessageText = styled.div`
  word-break: break-all;
  word-wrap: break-word;
  color: ${({ theme }) => theme.colors.mineShaft};
  font-size: 1rem;
  padding: 3px 0;
  white-space: pre-line;
  &:hover {
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0) 0%,
      ${({ theme }) => theme.colors.roseOfSharon}0f 10%,
      rgba(0, 0, 0, 0) 90%
    );
  }
`;

export const BotMessage = styled.div`
  padding: 7px 0;
`;

export const Input = styled(TextArea)`
  width: 90%;
  line-height: 16px;
  font-size: 1rem;
  font-weight: 300;
  font-family: 'Helvetica', 'Arial', sans-serif;
  padding: 7px;
  outline: none;
  border-radius: 5px;
  border: 1px solid ${({ theme }) => theme.colors.main};

  resize: none;
`;

export const TypingIndicator = styled.div<{ visible: boolean }>`
  color: ${({ theme }) => theme.colors.grey};
  font-weight: 300;
  font-size: 0.8rem;

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  height: 20px;
  width: 90%;

  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const SendBtnWrapper = styled.div`
  margin-left: 10px;
  background-color: ${({ theme }) => theme.colors.main};
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
    cursor: pointer;
  }
  border-radius: 50%;
`;
export const ChatSendBtnMobile = styled(Send)`
  width: 34px;
  height: 34px;
  color: white;
  padding: 7px;
  padding-left: 10px;
  align-self: bottom;
`;

export const ChatInputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
`;
