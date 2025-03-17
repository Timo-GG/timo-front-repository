import React, { useState } from 'react';
import Button from '../common/Button';
import { Input } from '../common/Input';
import { checkNickname, checkSummoner, putMyInfo } from '../../apis/member';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../storage/useAuthStore';

function AdditionalInfoForm() {
  const [playerName, setPlayerName] = useState('');
  const [playerTag, setPlayerTag] = useState('');
  const [nickname, setNickname] = useState('');

  const [playerNameErrorMessage, setPlayerNameErrorMessage] = useState('');
  const [nicknameErrorMessage, setNicknameErrorMessage] = useState('');

  const router = useNavigate();

  const { setUserData } = useAuthStore();

  const onSubmit = async () => {
    let valid = true;
    if (playerName === '' || playerTag === '') {
      setPlayerNameErrorMessage('소환사명을 입력해주세요.');
      return;
    } else if (nickname === '') {
      setNicknameErrorMessage('닉네임을 입력해주세요.');
      return;
    }

    await checkSummoner(playerName, playerTag).catch(_ => {
      setPlayerNameErrorMessage('소환사가 존재하지 않습니다.'), (valid = false);
    });
    await checkNickname(nickname).catch(_ => {
      setNicknameErrorMessage('이미 존재하는 닉네임입니다.'), (valid = false);
    });

    if (valid) {
      putMyInfo(nickname, playerName, playerTag)
        .then(res => {
          setUserData(res.memberProfile);
          alert('등록이 완료되었습니다.');
          router('/');
        })
        .catch(() => {
          alert('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
        });
    }
  };

  const onChangePlayerName = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
    setPlayerNameErrorMessage('');
  };

  const onChangePlayerTag = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerTag(e.target.value);
    setPlayerNameErrorMessage('');
  };

  const onChangeNickname = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(e.target.value);
    setNicknameErrorMessage('');
  };

  return (
    <div className="mb-[64px] flex flex-col gap-[8px]">
      <div className="flex flex-col gap-[8px] mb-[12px]">
        <div className="flex gap-[8px] flex-row">
          <Input
            value={playerName}
            onChange={onChangePlayerName}
            type="text"
            placeholder="소환사명"
            status={playerNameErrorMessage ? false : undefined}
          />
          <Input
            value={playerTag}
            onChange={onChangePlayerTag}
            type="text"
            placeholder="태그"
            width={100}
            status={playerNameErrorMessage ? false : undefined}
          />
        </div>
        {playerNameErrorMessage && (
          <p className="text-[12px] text-[#FF0000] text-center mt-[-6px]">
            {playerNameErrorMessage}
          </p>
        )}

        <Input
          value={nickname}
          onChange={onChangeNickname}
          type="text"
          placeholder="닉네임"
          status={nicknameErrorMessage ? false : undefined}
        />
        {nicknameErrorMessage && (
          <p className="text-[12px] text-[#FF0000] text-center mt-[-6px]">
            {nicknameErrorMessage}
          </p>
        )}
      </div>
      <Button
        type="submit"
        width={305}
        height={53}
        label="등록하기"
        onSubmit={onSubmit}
      />
    </div>
  );
}

export default AdditionalInfoForm;
