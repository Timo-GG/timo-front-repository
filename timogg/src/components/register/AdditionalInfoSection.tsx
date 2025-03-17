import AdditionalInfoForm from './AdditionalInfoForm';

export default function AdditionalInfoSection() {
  return (
    <>
      <div className="text-center mb-[54px]">
        <h1 className="text-[36px] mb-[12px] font-medium text-[#DDDDDD]">
          추가 정보 입력
        </h1>
        <p className="text-[14px]">
          서비스를 이용하기 위해 추가 정보를 입력해주세요.
        </p>
      </div>
      <AdditionalInfoForm />
    </>
  );
}
