const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./src/**/*.{html,js,mjs,jsx,ts,mts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        // lookbook: 'url(/static/JPGs/appliance control animation pages/appliance-control-oven-bg.jpg)'
      },
      fontFamily: {
        sans: [
          '"Avenir LT Std"',
          ...defaultTheme.fontFamily.sans
        ],
        serif: [
          '"Baskerville URW"',
          ...defaultTheme.fontFamily.serif
        ]
      }
    },
    container: {
      center: true
    }
  },
  plugins: []
}
