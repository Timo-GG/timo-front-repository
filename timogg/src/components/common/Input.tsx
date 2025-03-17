import React from 'react';

interface InputProps {
  type: string;
  placeholder: string;
  width?: number;
  status?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = ({
  type,
  placeholder,
  width,
  status,
  value,
  onChange,
}: InputProps) => {
  return (
    <input
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      className={`h-[53px] px-[15px] rounded-[10px] outline-none text-[15px] transition-all duration-300
        ${
          status === true
            ? 'border-2 border-green-500 bg-green-100 text-green-700'
            : status === false
              ? 'border-2 border-red-500 bg-red-100 text-red-700'
              : 'border border-gray-300 bg-white text-[#5c667b]'
        }`}
      style={{ width: width }}
    />
  );
};
