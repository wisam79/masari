/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        surface: '#FFFFFF',
        surfaceMuted: '#EEF2F6',
        text: '#172026',
        textMuted: '#68737D',
        border: '#D9E0E7',
        primary: '#0B7A75',
        primaryDark: '#075E59',
        danger: '#C2413A',
        warning: '#B7791F',
        success: '#2F855A',
      }
    },
  },
  plugins: [],
}