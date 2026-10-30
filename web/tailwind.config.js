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
        bg: '#1B2A4A',
        surface: '#24345A',
        primary: '#E4A0A0',
        secondary: '#EED9A0',
        textMain: '#FFFFFF',
        textMuted: '#B8C2D9',
        danger: '#EF4444'
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '8px',
        md: '8px',
        lg: '8px',
        xl: '8px',
        '2xl': '8px',
        full: '8px' // Consistent 8px everywhere per design rule
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

