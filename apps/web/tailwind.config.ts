import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Charte Sen Biopest : vert #107434 (feuille, nom) = primary-600,
        // doré #C2A547 (cercle, visage) = secondary-500. Généré par mélange avec blanc / noir.
        primary: {
          50: '#f3f8f5',
          100: '#e5f0e9',
          200: '#c8dfd0',
          300: '#9bc5aa',
          400: '#6ba981',
          500: '#3b8d59',
          600: '#107434',
          700: '#0d5f2b',
          800: '#0b4d22',
          900: '#083c1b',
          950: '#052712',
        },
        secondary: {
          50: '#faf8f0',
          100: '#f4efde',
          200: '#e9dfbd',
          300: '#dccb94',
          400: '#ceb76c',
          500: '#c2a547',
          600: '#9f873a',
          700: '#78662c',
          800: '#5d4f22',
          900: '#463b1a',
          950: '#2f2811',
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
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // Rounded like the lettering of the logo
        display: ['var(--font-nunito)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
