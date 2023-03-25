/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    fontFamily: {
      sans: ["poppins", "sans-serif"],
    },
    extend: {
      colors: {
        "c-sky": "#CAE1E2",
        "tag-green": "#9DCE77",
        "tag-yellow": "#F5D06F",
        "tag-purple": "#B383DA",
      },
    },
  },
  plugins: [],
};
