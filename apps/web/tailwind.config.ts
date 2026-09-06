import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f0',
          100: '#faecd8',
          200: '#f4d5a8',
          300: '#ecb96e',
          400: '#e5a04a',
          500: '#d4872e',
          600: '#b86d1f',
          700: '#9a5619',
          800: '#7d4518',
          900: '#633716',
          950: '#3a1d0a',
        },
        secondary: {
          50: '#f4f7f0',
          100: '#e5eddb',
          200: '#cddcba',
          300: '#aec48f',
          400: '#8faa67',
          500: '#6f8d47',
          600: '#577035',
          700: '#44572b',
          800: '#384726',
          900: '#303d22',
          950: '#18210f',
        },
        earth: {
          50: '#faf5f0',
          100: '#f0e6d3',
          200: '#e1cba6',
          300: '#d2b07a',
          400: '#c4964e',
          500: '#a67c3d',
          600: '#8a6532',
          700: '#6e4f28',
          800: '#53391d',
          900: '#372513',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
