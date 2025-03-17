import { socialLogin, socialLoginCallback } from '../../apis/auth';
import {
  DiscordLogo,
  GoogleLogo,
  KakaoLogo,
  NaverLogo,
} from '../../assets/svgs/assets';

export interface OAuthProvider {
  provider: 'google' | 'naver' | 'kakao' | 'discord';
}

function SocialButton({ provider }: OAuthProvider) {
  function getLogo() {
    switch (provider) {
      case 'google':
        return <GoogleLogo />;
      case 'naver':
        return <NaverLogo />;
      case 'kakao':
        return <KakaoLogo />;
      case 'discord':
        return <DiscordLogo />;
      default:
        return null;
    }
  }
  return (
    <button onClick={() => socialLoginCallback(provider)}>{getLogo()}</button>
  );
}

export default SocialButton;
