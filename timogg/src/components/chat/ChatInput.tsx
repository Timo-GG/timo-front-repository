import { useRef, useState } from 'react';
import { SendIcon } from '../../assets/svgs/assets';

interface ChatInputProps {
  onClickEnter: (message: string) => void;
}

interface QuickRepliesMenuProps {
  quickReplies: string[];
  selectedIndex: number;
  onClick: (index: number) => void;
}

const chatInputHeight = 40;

export default function ChatInput({ onClickEnter }: ChatInputProps) {
  const quickReplies = [
    '안녕하세요',
    '조합 맞추고 할까요?',
    '지금 접속중이신가요?',
    '즐거운 롤 되세요~',
  ];

  const [input, setInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const switchKey: { [key: string]: () => void } = {
      ArrowUp: () => {
        // 화살표 위 키로 빠른응답 메뉴 이동
        setSelectedIndex(prev =>
          prev <= 0 ? quickReplies.length - 1 : prev - 1,
        );
        setInput(quickReplies[selectedIndex]);
        isMenuOpen || setIsMenuOpen(true);
        // 화살표 위키로 이동시 포커스가 맨 앞으로가는 것을 방지
        e.preventDefault();
      },
      ArrowDown: () => {
        // 화살표 아래 키로 빠른응답 메뉴 이동
        setSelectedIndex(prev =>
          prev >= quickReplies.length - 1 ? 0 : prev + 1,
        );
        setInput(quickReplies[selectedIndex]);
        isMenuOpen || setIsMenuOpen(true);
      },
      Enter: () => {
        // 엔터키로 메시지 전송
        if (selectedIndex >= 0) {
          sendMessage(quickReplies[selectedIndex]);
        } else {
          sendMessage(input);
        }
      },
      Escape: () => {
        // ESC 키로 메뉴 닫기
        setIsMenuOpen(false);
        setInput(inputRef.current?.value || '');
        setSelectedIndex(-1);
      },
      default: () => {},
    };
    (switchKey[e.key] || switchKey['default'])();
  };
  // 빠른 응답 메뉴 클릭 이벤트 핸들러
  const onClickMenu = (index: number) => {
    setInput(quickReplies[index]);
    inputRef.current?.focus();
    setSelectedIndex(index);
  };
  // 메시지 전송 함수
  const sendMessage = (message: string) => {
    if (message.trim()) {
      onClickEnter(message);
      setInput('');
      setSelectedIndex(-1);
      inputRef.current?.focus();
      setIsMenuOpen(false);
    }
  };
  // 인풋창 입력 이벤트 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setSelectedIndex(-1);
    setIsMenuOpen(false);
  };

  return (
    <div className={`w-675`}>
      {isMenuOpen && (
        <QuickRepliesMenu
          quickReplies={quickReplies}
          selectedIndex={selectedIndex}
          onClick={onClickMenu}
        />
      )}

      <div
        className={`flex flex-row items-center bg-secondary-darkgray rounded-10 overflow-hidden`}
      >
        <div
          className="px-10 py-10 text-primary-white text-center cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          빠른 응답
        </div>
        <div className="after:border-r after:border-primary-gray" />
        <input
          type="text"
          value={selectedIndex >= 0 ? quickReplies[selectedIndex] : input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="px-8 py-10 flex-1 bg-secondary-darkgray border-secondary-darkgray focus:outline-none"
          placeholder="메시지를 입력하세요..."
          ref={inputRef}
        />
        <div
          className="flex items-center justify-center p-10 cursor-pointer"
          onClick={() => sendMessage(input)}
        >
          <SendIcon className=" text-white " />
        </div>
      </div>
    </div>
  );
}

// 빠른 응답 메뉴 컴포넌트
const QuickRepliesMenu = ({
  quickReplies,
  selectedIndex,
  onClick,
}: QuickRepliesMenuProps) => {
  return (
    <div
      className={`rounded-t-10 overflow-hidden absolute z-10 border-secondary-gray -translate-y-[100%]`}
    >
      {quickReplies.map((reply, index) => (
        <div
          key={index}
          className={`h-40 py-12 px-12 flex items-center border-t border-secondary-gray ${
            index === selectedIndex
              ? 'bg-secondary-gray text-primary-white'
              : 'bg-secondary-darkgray'
          }`}
          onClick={() => onClick(index)}
        >
          {reply}
        </div>
      ))}
    </div>
  );
};
