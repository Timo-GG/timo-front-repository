import { useState } from 'react';
import ChatInput from './ChatInput';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import io from 'socket.io-client';

interface Message {
  message: string;
  from: string;
}

export const Chat = ({ socket }: { socket: ReturnType<typeof io> | null }) => {
  if (!socket) return null;
  //듀오 메세지 수신하면 메세지 객체에 추가
  const newDuomessage: Message = { message: '안녕하세요', from: 'duo' };
  const newMymessage: Message = { message: '안녕하세요', from: 'me' };
  const [messages, setMessages] = useState<Message[]>([
    newDuomessage,
    newMymessage,
  ]);

  const onEnter = (message: string) => {
    setMessages([...messages, { message, from: 'me' }]);
    socket.emit('send_message', {
      room: '1_2',
      roomId: '1',
      message: message,
    });
  };
  // todo : 듀오에게 메세지 왔을때 메세지 객체에 추가
  return (
    <div className="w-875 flex flex-col gap-10 items-center bg-secondary-realdarkgray py-10">
      <ChatHeader playerName="롤10년차개고수" playerTag="KR1" />
      <ChatMessage messages={messages} />
      <ChatInput onClickEnter={onEnter} />
    </div>
  );
};
