import { useEffect, useState } from 'react';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import io from 'socket.io-client';
import { UserData } from '../../storage/useAuthStore';

interface Message {
  message: string;
  from: string;
}

interface ChatProps {
  roomId: number;
  duoInfo: UserData | null;
  socket: ReturnType<typeof io> | null;
}

export default function Chat({ roomId, duoInfo, socket }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  function handleSendMessage(message: string) {
    if (socket) {
      socket.emit('send_message', {
        room: '채팅방',
        roomId: roomId,
        content: message,
      });

      setMessages(prev => [...prev, { message, from: 'me' }]);
    }
  }

  useEffect(() => {
    setMessages([]);
    if (socket) {
      socket.on('receive_message', (data: { content: string }) => {
        setMessages(prev => [...prev, { message: data.content, from: 'duo' }]);
      });

      socket.on('system_message', data => {
        setMessages(prev => [...prev, { message: data, from: 'system' }]);
      });
    }
  }, []);

  return (
    <div className="w-875 flex flex-col gap-10 items-center bg-secondary-realdarkgray py-10">
      <ChatHeader
        playerName={duoInfo?.playerName!}
        playerTag={duoInfo?.playerTag!}
      />
      <ChatMessage messages={messages} />
      <ChatInput onClickEnter={handleSendMessage} />
    </div>
  );
}
