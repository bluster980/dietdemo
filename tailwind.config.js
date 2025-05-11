export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryStart: '#FFD98E',
        primaryEnd: '#FFFFFF',
      },
      fontFamily: {
        manjari: ['Manjari', 'sans-serif'],
        mako: ['Mako', 'sans-serif'], 
        palanquindark: ['Palanquin Dark', 'sans-serif'],
        mada: ['Mada', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        palanquin: ['Palanquin', 'sans-serif'],
        jetbrainsmono: ['JetBrains Mono', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
