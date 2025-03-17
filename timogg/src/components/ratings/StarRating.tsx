import { useState } from 'react';
import { Star } from '../../assets/svgs/assets';

interface StarRatingProps {
  defaultRating?: number;
  onChange?: (rating: number) => void;
  width?: string;
  height?: string;
}

function StarRating({
  defaultRating = 0,
  onChange = undefined,
  width,
  height,
}: StarRatingProps) {
  const [rating, setRating] = useState<number>(defaultRating);

  const handleClick = (value: number) => {
    if (onChange !== undefined) setRating(value);
    if (onChange !== undefined) onChange(value);
  };

  return (
    <div className="flex gap-[8px]">
      {[1, 2, 3, 4, 5].map(value => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          className={
            onChange !== undefined
              ? 'cursor-pointer p-0 m-0'
              : 'cursor-default p-0 m-0'
          }
          aria-label={`rating-${value}`}
        >
          <Star
            className={
              value <= rating
                ? 'fill-[#46cfa7] transition-colors duration-200'
                : 'fill-[#9aa4af] transition-colors duration-200'
            }
            width={width}
            height={height}
          />
        </button>
      ))}
    </div>
  );
}

StarRating.defaultProps = {
  defaultRating: 0,
  onChange: undefined,
  width: '64px',
  height: '60.44px',
};

export default StarRating;
