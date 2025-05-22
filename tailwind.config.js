const { default: tailwindcss } = require("@tailwindcss/vite");

// tailwind.config.js
module.exports = {
  content: ['.;/src/pages/NotFoundPage.jsx'], 
  theme: {
    extend: {},
  },
  plugins: [tailwindcss(),],
};
