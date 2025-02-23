/** @type {import('tailwindcss').Config} */
import pxtoRem from 'tailwindcss-preset-px-to-rem';
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [pxtoRem],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans KR', 'sans-serif'],
      },
      colors: {
        'secondary-realdarkgray': '#171717',
        'secondary-darkgray': '#292929',
        'secondary-gray': '#9AA4AF',
        'secondary-green': '#46CFA7',
        'primary-gray': '#585858',
        'primary-lightgray': '#DDDDDD',
        'primary-white': '#FFFFFF',
        'primary-green': '#00FFD0',
        'tier-iron': '#7B6663',
        'tier-bronze': '#A38376',
        'tier-silver': '#ABB4B9',
        'tier-gold': '#E7CC92',
        'tier-platinum': '#216977',
        'tier-emerald': '#50DA8C',
        'tier-diamond': '#376BD9',
        'tier-master': '#D076EA',
        'tier-grandmaster': '#E67529',
        'tier-challenger': '#EEFDFF',
      },
      fontSize: {
        'title-1-24-regular': [
          '24px',
          { lineHeight: '36px', fontWeight: '400' },
        ],
        'title1-24-medium': ['24px', { lineHeight: '28px', fontWeight: '500' }],
        'title2-20-demilight': [
          '20px',
          { lineHeight: '22px', fontWeight: '300' },
        ],
        'title2-20-regular': [
          '20px',
          { lineHeight: '16px', fontWeight: '400' },
        ],
        'title2-20-medium': ['20px', { lineHeight: '22px', fontWeight: '500' }],
        'title2-20-bold': ['20px', { lineHeight: '22px', fontWeight: '700' }],
        'title3-18-bold': ['18px', { lineHeight: '20px', fontWeight: '700' }],
        'body1-16-demilight': [
          '16px',
          { lineHeight: '22px', fontWeight: '300' },
        ],
        'body1-16-regular': ['16px', { lineHeight: '22px', fontWeight: '400' }],
        'body1-16-medium': ['16px', { lineHeight: '22px', fontWeight: '500' }],
        'body1-16-bold': ['16px', { lineHeight: '22px', fontWeight: '700' }],
        'body2-15-demilight': [
          '15px',
          { lineHeight: '22px', fontWeight: '300' },
        ],
        'body2-15-regular': ['15px', { lineHeight: '22px', fontWeight: '400' }],
        'body2-15-medium': ['15px', { lineHeight: '22px', fontWeight: '500' }],
        'body2-15-bold': ['15px', { lineHeight: '22px', fontWeight: '700' }],
        'body3-13-demilight': [
          '13px',
          { lineHeight: '16px', fontWeight: '300' },
        ],
        'body3-13-regular': ['13px', { lineHeight: '16px', fontWeight: '400' }],
        'body3-13-medium': ['13px', { lineHeight: '16px', fontWeight: '500' }],
        'body3-13-bold': ['13px', { lineHeight: '16px', fontWeight: '700' }],
        'body4-12-demilight': [
          '12px',
          { lineHeight: '16px', fontWeight: '300' },
        ],
        'body4-12-regular': ['12px', { lineHeight: '16px', fontWeight: '400' }],
        'body5-10-regular': ['10px', { lineHeight: '16px', fontWeight: '400' }],
        'body5-10-demilight': [
          '10px',
          { lineHeight: '16px', fontWeight: '300' },
        ],
      },
    },
  },
  plugins: [],
};
