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
        brand: {
          red: {
            DEFAULT: '#DC2626',
            hover: '#B91C1C',
            bright: '#EF4444',
          },
          orange: {
            DEFAULT: '#F97316',
            hover: '#EA580C',
            bright: '#FB923C',
          },
        },
        dark: {
          bg: '#000000',
          surface: '#111111',
          border: '#262626',
          text: {
            primary: '#F9FAFB',
            secondary: '#9CA3AF',
            muted: '#6B7280',
          },
        },
        light: {
          bg: '#FFFFFF',
          surface: '#F5F5F5',
          border: '#E5E5E5',
          heading: '#0A0A0A',
          text: '#404040',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
        devanagari: ['Noto Sans Devanagari', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'glow-red': '0 0 15px -3px rgba(220, 38, 38, 0.3)',
        'glow-orange': '0 0 15px -3px rgba(249, 115, 22, 0.3)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      lineHeight: {
        'multilingual': '1.75',
      },
    },
  },
  plugins: [],
};
