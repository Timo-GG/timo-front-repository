import { useEffect } from 'react';

interface Message {
  message: string;
  from: string;
}

interface MessageProps {
  messages: Message[];
}

export default function Message({ messages }: MessageProps) {
  // 끝부분이 뾰족한 말풍선 모양
  const myTaileStyle =
    'solid h-0 w-0 border-8 border-t-8 border-r-transparent border-b-transparent border-secondary-green';
  const duoTailStyle =
    'h-0 w-0 border-8 border-t-8 border-l-transparent border-b-transparent border-secondary-gray';
  const myMessageStyle =
    'bg-secondary-green text-sm text-white rounded-s-10 rounded-br-10';
  const duoMessageStyle =
    'bg-secondary-gray text-sm text-white rounded-e-10 rounded-bl-10';
  const systemMessageStyle =
    'bg-gray-400 text-white text-sm px-10 py-10 rounded'; // 시스템 메세지 스타일

  // myMessages 값이 추가되면 자동으로 스크롤 내려가게 하기
  useEffect(() => {
    const chat = document.querySelector('#chat');
    chat?.scrollTo(0, chat.scrollHeight);
  }, [messages]);

  return (
    <div
      className="w-full h-300 px-12 overflow-auto rounded flex flex-col gap-4"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      id="chat"
    >
      {messages.map((msg, index) => {
        if (msg.from === 'system') {
          // system 메시지는 가운데 정렬
          return (
            <div key={index} className="self-center">
              <div className={systemMessageStyle}>{msg.message}</div>
            </div>
          );
        }
        return (
          <div
            key={index}
            className={`flex ${msg.from === 'me' ? 'self-end' : 'self-start'}`}
          >
            {msg.from === 'duo' && <div className={duoTailStyle}></div>}
            <div
              className={`py-10 px-10 ${msg.from === 'duo' ? duoMessageStyle : myMessageStyle}`}
            >
              {msg.message}
            </div>
            {msg.from === 'me' && <div className={myTaileStyle}></div>}
          </div>
        );
      })}
    </div>
  );
}
