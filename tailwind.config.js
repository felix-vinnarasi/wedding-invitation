/** Same utilities as the old CDN setup, but compiled; serif/sans now map to the loaded fonts. */
module.exports = {
  content: ['./index.html', './script.js'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: { 'gold-deep': '#8a6820' },
    },
  },
};
