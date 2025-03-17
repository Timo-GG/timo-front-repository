import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import MatchOptionStatus from './MatchOptionStatus';
import DuoFindStatus from './DuoFindStatus';
import DuoFindingStatus from './DuoFindingStatus';
import DuoEndConfirmStatus from './DuoEndConfirmStatus';
import DuoEndedStatus from './DuoEndedStatus';
import InitialStatus from './InitialStatus';
import DuoPlayingStatus from './DuoPlayingStatus';

import io from 'socket.io-client';
import { UserData } from '../../../storage/useAuthStore';
import { getDuoInfo } from '../../../apis/member';

interface MatchSidebarProps {
  socket: ReturnType<typeof io> | null;
  roomId: number;
  setRoomId: React.Dispatch<React.SetStateAction<number>>;
  matchInfo: {
    matchId: number;
    matchUserId: number;
  };
  setMatchInfo: React.Dispatch<
    React.SetStateAction<{
      matchId: number;
      matchUserId: number;
    }>
  >;
  duoInfo: UserData | null;
  setDuoInfo: React.Dispatch<React.SetStateAction<UserData | null>>;
}

const MatchSidebar = ({
  socket,
  roomId,
  setRoomId,
  matchInfo,
  setMatchInfo,
  duoInfo,
  setDuoInfo,
}: MatchSidebarProps) => {
  const [step, setStep] = useState(0);

  const onClickDuoFindStartBtn = () => {
    setStep((prev: number) => 1);
  };
  const onClickFindCancelDuoBtn = () => {
    setStep((prev: number) => 1);
  };
  const onClickCloseOptionsBtn = () => {
    setStep((prev: number) => 0);
  };

  const onClickMatchingStartBtn = () => {
    const matchOption = JSON.parse(localStorage.getItem('matchOption')!);

    if (
      !matchOption.queueType ||
      !matchOption.myPosition ||
      !matchOption.playStyle ||
      !matchOption.gameStatus ||
      !matchOption.mic ||
      !matchOption.duoPosition ||
      !matchOption.duoStyle ||
      !socket
    ) {
      alert('모든 항목을 선택해주세요.');
      return;
    }

    socket.emit('match_start', {
      userInfo: {
        introduce: '안녕하세요',
        gameMode: matchOption.queueType,
        playPosition: matchOption.myPosition,
        playCondition: matchOption.gameStatus,
        voiceChat: matchOption.mic,
        playStyle: matchOption.playStyle,
      },
      duoInfo: {
        duoPlayPosition: matchOption.duoPosition,
        duoPlayStyle: matchOption.duoStyle,
      },
    });

    socket.on('match_found', async data => {
      setMatchInfo({
        matchId: data.matchId,
        matchUserId: data.opponentId,
      });
      setDuoInfo(await getDuoInfo(data.opponentId));
      setStep((prev: number) => 3);
    });
    socket.on('match_declined', () => {
      setStep((prev: number) => 1);
      setDuoInfo(null);
      setRoomId(0);
      setMatchInfo({
        matchId: 0,
        matchUserId: 0,
      });
      alert('매칭이 거절되었습니다. UI 추가 필요');
    });
    socket.on('match_accepted', data => {
      setStep((prev: number) => 4);
      setRoomId(data);
    });
    socket.on('match_pending', () => {
      alert('매칭 대기중입니다. UI 추가 필요');
    });
    setStep((prev: number) => 2);
  };
  const onClickMatchAccept = () => {
    socket!.emit('match_response', {
      matchId: matchInfo.matchId,
      isAccepted: true,
    });
    setStep((prev: number) => 4);
  };
  const onClickMatchReject = () => {
    socket!.emit('match_response', {
      matchId: matchInfo.matchId,
      isAccepted: false,
    });
    setStep((prev: number) => 1);
  };
  const onClickDuoEndBtn = () => {
    setStep((prev: number) => 5);
  };
  const onClickDuoEndConfirmBtn = () => {
    socket!.emit('leave_room', {
      roomId: roomId,
    });
    setStep((prev: number) => 6);
  };
  const onClickConfirmEndBtn = () => {
    setStep((prev: number) => 0);
  };
  return (
    <>
      <motion.div
        className="w-295 py-20 bg-secondary-realdarkgray rounded-15 overflow-hidden "
        layout
        layoutRoot
        transition={{
          duration: 0.5,
          ease: 'easeOut',
        }}
      >
        {step === 0 && (
          <motion.div layout className="w-full flex flex-col items-center">
            <InitialStatus onClickDuoFindStartBtn={onClickDuoFindStartBtn} />
          </motion.div>
        )}
        {step === 1 && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: 'linear',
            }}
            className="w-full flex flex-col gap-24 items-center"
          >
            <MatchOptionStatus
              onClickMatchingStartBtn={onClickMatchingStartBtn}
              onClickCloseOptionsBtn={onClickCloseOptionsBtn}
            />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: 'linear',
            }}
            className="w-full flex flex-col gap-24 items-center"
          >
            <DuoFindingStatus
              onClickDuoFindCancelBtn={onClickFindCancelDuoBtn}
            />
          </motion.div>
        )}
        {step === 3 && (
          // <div className="w-307 h-546 bg-secondary-realdarkgray pt-18 px-10 rounded-12 flex flex-col items-center">
          <motion.div
            layout
            initial={{ opacity: 0.2 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: 'easeIn',
            }}
            className="w-full"
          >
            <DuoFindStatus
              onClickMatchAccept={onClickMatchAccept}
              onClickMatchReject={onClickMatchReject}
            />
          </motion.div>
        )}
        {
          // <div className="w-307 h-146 flex flex-col items-center bg-secondary-realdarkgray rounded-12 pt-18 px-10">
          step === 4 && (
            <motion.div
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5,
                ease: 'linear',
              }}
              className="w-full flex flex-col items-center"
            >
              <DuoPlayingStatus
                duoName={duoInfo?.playerName!}
                duoTag={duoInfo?.playerTag!}
                onClickDuoEndBtn={onClickDuoEndBtn}
              />
            </motion.div>
          )
        }
        {step === 5 && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: 'linear',
            }}
            className="w-full flex flex-col items-center"
          >
            <DuoEndConfirmStatus
              onClickDuoEndConfirmBtn={onClickDuoEndConfirmBtn}
            />
          </motion.div>
        )}
        {step === 6 && (
          <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: 'linear',
            }}
            className="w-full flex flex-col items-center"
          >
            <DuoEndedStatus
              duoName={duoInfo?.nickname!}
              onConfirm={onClickConfirmEndBtn}
            />
          </motion.div>
        )}
      </motion.div>
    </>
  );
};

export default MatchSidebar;
