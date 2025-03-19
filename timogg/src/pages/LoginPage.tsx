import { useNavigate } from 'react-router-dom';
import SocialLogin from '../components/login/SocialLogin.tsx';
import useAuthStore from '../storage/useAuthStore.tsx';
import { useEffect } from 'react';
import Timo from '../assets/images/timo.png';

function LoginPage() {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn]);

  return (
    <>
      <div className="w-full h-screen flex justify-center items-center flex-col">
        <div className="text-center mb-[54px]">
          <h1 className="text-[36px] mb-[12px] font-medium text-[#DDDDDD]">
            TIMOGG에 어서오세요
          </h1>
          <p className="text-[14px]">가입하고 유저들과 의견을 나누어보세요!</p>
        </div>
        <img src={Timo} alt="timo" className="w-[210px] h-[264px] mb-[54px]" />
        <SocialLogin />
      </div>
    </>
  );
}

export default LoginPage;
