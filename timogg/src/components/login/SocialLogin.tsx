import {
  DiscordLogo,
  GoogleLogo,
  KakaoLogo,
  NaverLogo,
} from '../../assets/svgs/assets';
import SocialButton from './SocialButton';

function SocialLogin() {
  return (
    <div>
      <div className="mb-[20px] flex items-center text-[12px] text-[#dddddd] gap-[8px]">
        <div className="w-[110px] h-[1px] bg-[#ebeef1]" />
        <p>소셜 계정으로 로그인</p>
        <div className="w-[110px] h-[1px] bg-[#ebeef1]" />
      </div>
      <div className="mb-[70px] flex gap-[25px] items-center justify-center">
        <SocialButton provider="google" />
        <SocialButton provider="naver" />
        <SocialButton provider="kakao" />
        <SocialButton provider="discord" />
      </div>
    </div>
  );
}

export default SocialLogin;
