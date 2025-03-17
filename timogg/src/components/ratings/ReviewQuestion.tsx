import { useState } from 'react';
import { JSX } from 'react/jsx-runtime';

interface Option {
  label: string;
  value: string;
}

interface ReviewQuestionProps {
  title: string;
  options: Option[];
  defaultValue?: string;
  onChange: (value: string) => void;
}

function ReviewQuestion({
  title,
  options,
  defaultValue,
  onChange,
}: ReviewQuestionProps): JSX.Element {
  const [selected, setSelected] = useState(defaultValue as string);

  const handleChange = (value: string) => {
    setSelected(value);
    onChange(value);
  };

  return (
    <div className="text-center">
      <p className="mb-[12px] font-bold text-[15px]">{title}</p>
      <div className="flex h-[46px] text-[16px]">
        {options.map((option, idx) => {
          const isSelected = selected === option.value;
          let borderClasses = '';

          if (idx === 0) {
            borderClasses = 'rounded-l-[10px]';
          } else if (idx === options.length - 1) {
            borderClasses = 'rounded-r-[10px]';
          } else {
            borderClasses = 'border-l border-r';
          }

          const nonSelectedBg = 'bg-[#585858] text-[#dddddd]';
          const selectedBg = 'bg-[#46cfa7] text-white font-bold';
          const borderColor = isSelected
            ? 'border-[#f5f5f5]'
            : 'border-[#9aa4af]';

          const classes = `flex items-center justify-center w-[150px] cursor-pointer ${borderClasses} ${
            isSelected ? selectedBg : nonSelectedBg
          } ${borderColor}`;

          const inputId = `${title}-${option.value}`;

          return (
            <div key={option.value} className={classes}>
              <input
                type="radio"
                name={title}
                id={inputId}
                value={option.value}
                checked={isSelected}
                onChange={() => handleChange(option.value)}
                className="hidden"
              />
              <label
                htmlFor={inputId}
                className="cursor-pointer w-full h-full flex items-center justify-center"
              >
                {option.label}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

ReviewQuestion.defaultProps = {
  defaultValue: '',
};

export default ReviewQuestion;
