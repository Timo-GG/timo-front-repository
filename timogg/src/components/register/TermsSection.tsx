interface TermsSectionProps {
  title: string;
  checkboxText: string;
  checked: boolean;
  onChange: () => void;
  showError: boolean;
}

export const TermsSection = ({
  title,
  checkboxText,
  checked,
  onChange,
  showError,
}: TermsSectionProps) => {
  return (
    <div className="w-full flex justify-center flex-col">
      <p className="ml-10 mb-2 text-body3-13-bold">{title}</p>
      <textarea
        className="w-full text-primary-gray p-10 rounded-10 border-primary-gray border-2 resize-none h-[150px]"
        readOnly
      />
      <div
        className={`mt-6 mr-10 flex gap-2 items-center justify-end ${showError ? 'animate-shake' : ''}`}
      >
        <input
          type="checkbox"
          className={`${showError ? 'border-red-500' : ''}`}
          checked={checked}
          onChange={onChange}
        />
        <p
          className={`text-body4-12-regular ${showError ? 'text-red-500' : ''}`}
        >
          {checkboxText}
        </p>
      </div>
    </div>
  );
};
