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
        "tag-lgray": "#D9D9D9",
        "tag-gray": "#A4A4A4",
        "tag-brown": "#B4816C",
        "tag-orange": "#E88C59",
        "tag-yellow": "#F5D06F",
        "tag-green": "#9DCE77",
        "tag-blue": "#5BB4E5",
        "tag-purple": "#B383DA",
        "tag-pink": "#EE86D1",
        "tag-red": "#F47575",
      },
    },
  },
  plugins: [],
};
