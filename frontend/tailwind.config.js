/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'teraplus-primary': '#FFFFFF',              // Primary interactive elements are white (Header BG)
        'teraplus-primary-hover': '#F3F4F6',        // Light gray for hover on white primary elements (gray-100)
        'teraplus-text-on-primary': '#093b5e',      // Dark blue text for white primary elements
        'teraplus-border-primary': '#093b5e',       // Dark blue border for white primary elements

        'teraplus-brand-blue': '#093b5e',           // Dark Blue from logo (for text, links, non-primary interactive)
        'teraplus-brand-blue-dark': '#07304f',      // Darker shade of brand blue for hover states on links

        'teraplus-accent': '#073c5c',               // Dark Blue (from logo "other")
        'teraplus-page-bg': '#FFFFFF',              // White - for overall page background (UserLayout, Login/Register)
        'teraplus-card-bg': '#FFFFFF',              // White (for cards, modals, form backgrounds - same as primary now)
        'teraplus-text-default': '#000000',         // Black - for general text
        // 'teraplus-text-on-primary' (old def for dark bg) is now 'teraplus-text-on-brand-blue' if needed, or just white.
        // For dark blue backgrounds (like current navbar), text would be white.
      },
      boxShadow: {
        '3xl': '0 0 25px 0px rgba(0, 0, 0, 0.15), 0 20px 40px -15px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
  ],
};
