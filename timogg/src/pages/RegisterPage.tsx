import { useNavigate } from 'react-router-dom';
import useAuthStore from '../storage/useAuthStore.tsx';
import { useEffect, useState } from 'react';
import { checkRegister } from '../utils/checkRegister.tsx';
import AdditionalInfoSection from '../components/register/AdditionalInfoSection.tsx';
import { RegisterForm } from '../components/register/RegisterForm.tsx';

function RegisterPage() {
  const router = useNavigate();
  const { userData } = useAuthStore.getState();
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  useEffect(() => {
    checkRegister().then(result => {
      if (result) {
        router('/', { replace: true });
      }
    });
  }, [userData]);

  return (
    <div className="w-full h-screen flex justify-center items-center flex-col overflow-y-auto py-50">
      {!showAdditionalInfo ? (
        <RegisterForm setShowAdditionalInfo={setShowAdditionalInfo} />
      ) : (
        <AdditionalInfoSection />
      )}
    </div>
  );
}

export default RegisterPage;
