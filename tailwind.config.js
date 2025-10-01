/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#603813',
          dark: '#4A2A0E',
          light: '#7A4F1E',
          warm: '#854224',
        },
        ui: {
          bg: '#FAFAF8',
          panel: '#FFFFFF',
          text: '#37200b',
          muted: '#603813',
          border: '#E5E5E5',
          accent: '#603813',
        },
        dark: {
          bg: '#0a0604',
          panel: '#1a0f08',
          elevated: '#2d1a0a',
          text: '#f5f1e8',
          muted: '#6b5d4f',
          border: '#2d1a0a',
        },
        accent: {
          orange: '#d56a2e',
          coral: '#f45d34',
          amber: '#ec933f',
          gold: '#f4bf34',
        },
        cool: {
          sage: '#788C87',
          slate: '#7A8F98',
          teal: '#82A1A2',
          moss: '#7A9880',
          mint: '#82A291',
          seafoam: '#AEC4B8',
          ocean: '#327BA0',
          azure: '#30ABB7',
          cyan: '#3AC7CE',
        },
      },
      fontFamily: {
        brand: ['"Akzidenz-Grotesk BQ Extended"', 'Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lgx: '14px',
      },
      boxShadow: {
        soft: '0 20px 40px rgba(0,0,0,.25)',
        'soft-dark': '0 20px 40px rgba(45,26,10,.4)',
      },
    },
  },
  plugins: [],
};
