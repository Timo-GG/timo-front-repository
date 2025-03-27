import { useState } from 'react';
import { TermsSection } from './TermsSection';
import Button from '../common/Button.tsx';
import tos from '../../assets/markdown/tos.md';
import privacy from '../../assets/markdown/privacy.md';

interface RegisterFormProps {
  setShowAdditionalInfo: (value: boolean) => void;
}

export const RegisterForm = ({ setShowAdditionalInfo }: RegisterFormProps) => {
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleNextClick = () => {
    if (!agreeTerms || !agreePrivacy) {
      setShowError(true);
    } else {
      setShowError(false);
      setShowAdditionalInfo(true);
    }
  };

  return (
    <>
      <div className="text-center mb-[40px]">
        <h1 className="text-[36px] mb-[12px] font-medium text-[#DDDDDD]">
          회원가입
        </h1>
        <p className="text-[14px]">
          서비스 이용을 위한 약관 동의 및 추가 정보 입력
        </p>
      </div>

      <div className="w-full items-center flex flex-col gap-40 px-30 max-w-[800px]">
        <div className="w-full flex flex-col items-center gap-40">
          <TermsSection
            title="서비스 이용약관"
            checkboxText="[필수] 서비스 이용약관에 동의합니다."
            checked={agreeTerms}
            onChange={() => setAgreeTerms(!agreeTerms)}
            showError={showError && !agreeTerms}
            mdUrl={tos}
          />
          <TermsSection
            title="개인정보 수집 및 이용 동의"
            checkboxText="[필수] 개인정보 수집 및 이용에 동의합니다."
            checked={agreePrivacy}
            onChange={() => setAgreePrivacy(!agreePrivacy)}
            showError={showError && !agreePrivacy}
            mdUrl={privacy}
          />
        </div>
        <Button label="다음" width={'100%'} onSubmit={handleNextClick} />
      </div>
    </>
  );
};
