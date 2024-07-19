/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ "./views/**/*.{ejs,html}" ],
  theme: {
    extend: {
      colors: {
        snow: "#ffffff"
      },
      fontFamily: {
        krona: [ '"Krona One"', 'sans-serif' ],
        inter: [ 'Inter', 'sans-serif' ]
      }
    },
  },
  plugins: [],
}

