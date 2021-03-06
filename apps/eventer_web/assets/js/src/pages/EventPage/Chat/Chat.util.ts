import {
  differenceInMinutes,
  format,
  isToday,
  isYesterday,
  parseISO,
} from 'date-fns';
import { groupChatMessagesT, dayMessagesT, singleMessageT } from './chatTypes';

export const CHAT_HIDING_BREAKPOINT = '490';

function getDay(date: Date): string {
  switch (true) {
    case isToday(date):
      return 'Today';
    case isYesterday(date):
      return 'Yesterday';
    default:
      return format(date, 'eeee, dd. LLL');
  }
}

export const groupChatMessages: groupChatMessagesT = (messages) => messages
  .reduce<dayMessagesT[]>((groupedMessages, newMessage) => {
    const newMessageDate = newMessage.inserted_at === '...'
      ? new Date()
      : parseISO(`${newMessage.inserted_at}Z`);
    const day = getDay(newMessageDate);

    if (groupedMessages.length > 0) {
      const lastDay = groupedMessages[groupedMessages.length - 1];
      if (lastDay.day === day) {
        const { messages } = lastDay;
        const lastMessagesItem = messages[messages.length - 1];
        if (lastMessagesItem.isGroup) {
          const { userId, startTime } = lastMessagesItem;
          if (
            !newMessage.is_bot
            && userId === newMessage.user_id
            && differenceInMinutes(newMessageDate, startTime) <= 5
          ) {
            lastMessagesItem.messages = [
              ...lastMessagesItem.messages,
              newMessage,
            ];
          } else {
            lastDay.messages = [
              ...messages,
              { isGroup: false, message: newMessage } as singleMessageT,
            ];
          }
        } else {
          const { message: lastMessage } = lastMessagesItem;
          const lastMessageDate = parseISO(`${lastMessage.inserted_at}Z`);
          if (
            !newMessage.is_bot
            && !lastMessage.is_bot
            && lastMessage.user_id === newMessage.user_id
            && differenceInMinutes(newMessageDate, lastMessageDate) <= 5
          ) {
            lastDay.messages[messages.length - 1] = {
              isGroup: true,
              userId: lastMessage.user_id,
              startTime: lastMessageDate,
              messages: [lastMessage, newMessage],
            };
          } else {
            lastDay.messages = [
              ...messages,
              { isGroup: false, message: newMessage },
            ];
          }
        }
        return groupedMessages;
      }
      const newDay: dayMessagesT = {
        day,
        messages: [{ isGroup: false, message: newMessage }],
      };
      return [...groupedMessages, newDay];
    }
    const newDay: dayMessagesT = {
      day,
      messages: [{ isGroup: false, message: newMessage }],
    };
    return [newDay];
  }, [] as dayMessagesT[]);
