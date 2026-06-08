/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: '#FAF1EA',
        forestGreen: '#014421',
        sageGreen: '#A6B385',
        speakGreen: '#013B13',
        charcoal: '#1A1A1A',
        recordRed: '#DC2626',
        filterInactive: '#D3D3D3',
        pomeloWhite: '#FAF1EA',
      },
      fontFamily: {
        barrio: ['Barrio_400Regular'],
        jua: ['Jua_400Regular'],
      },
      borderRadius: {
        card: '28px',
        nav: '30px',
      },
    },
  },
  plugins: [],
};
