/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#06B6D4',
          cyan: '#06B6D4',
          light: '#22D3EE',
          dark: '#0E7490',
          hover: '#0891B2',
          muted: 'rgba(6, 182, 212, 0.1)',
        },
        brand: {
          cyan: '#06B6D4',
          cyanLight: '#22D3EE',
          cyanDark: '#0E7490',
          red: '#DC2626',
          redBright: '#EF4444',
          orange: '#F97316',
          orangeBright: '#FB923C',
        },
        status: {
          success: '#22C55E',
          warning: '#EAB308',
          error: '#DC2626',
          info: '#06B6D4',
        },
        dark: {
          bg: '#000000',
          surface: '#111111',
          border: '#262626',
          heading: '#FAFAFA',
          body: '#A1A1AA',
        },
        light: {
          bg: '#FFFFFF',
          surface: '#F4F4F5',
          border: '#E4E4E7',
          heading: '#18181B',
          body: '#52525B',
        },
      },
      fontFamily: {
        heading: ['Poppins', 'Noto Sans Gujarati', 'Noto Sans Devanagari', 'sans-serif'],
        sans: ['Inter', 'Noto Sans Gujarati', 'Noto Sans Devanagari', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #06B6D4 0%, #0E7490 100%)',
        'cyan-gradient': 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)',
        'upload-gradient': 'linear-gradient(90deg, #DC2626 0%, #F97316 100%)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      lineHeight: {
        'indic': '1.7',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.6)',
        'glow-cyan': '0 0 15px -3px rgba(6, 182, 212, 0.4)',
        'glow-cyan-dark': '0 0 15px -3px rgba(34, 211, 238, 0.4)',
        'glow-red': '0 0 20px 2px rgba(220, 38, 38, 0.35)',
        'glow-red-bright': '0 0 25px 4px rgba(239, 68, 68, 0.45)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 15px 2px rgba(220, 38, 38, 0.3)',
            borderColor: '#DC2626',
          },
          '50%': {
            boxShadow: '0 0 30px 6px rgba(239, 68, 68, 0.6)',
            borderColor: '#EF4444',
          },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 1.8s infinite ease-in-out',
      },
    },
  },
  plugins: [],
};
