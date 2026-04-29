/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: "class",
	content: [
		"./node_modules/flowbite-react/**/*.js",
		"./pages/**/*.{js,ts,jsx,tsx}",
		"./components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			background: "#000000",
			colors: {
				primary: {
					50: "#fefdf0",
					100: "#fdf8d0",
					200: "#faf0a0",
					300: "#f5e268",
					400: "#edc94a",
					500: "#e9bb42",
					600: "#c99928",
					700: "#a67b1a",
					800: "#886213",
					900: "#70500e",
					11:"#2247b3"
				},

				
			},
		},
		fontFamily: {
			sans: ["Manrope", "sans-serif"],
		},
		screens: {
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
			"2col": "1170px",
			"3col": "1568px",
			"4col": "1972px",
			announcement: "413px",
		},
	},
	safelist: [
		{
			pattern: /(text|bg)-(green|blue|yellow|orange|red)-400/,
		},
		{
			pattern: /bg-gray-(50|100|700|800|900)/,
		},
		'bg-primary-50',
		'bg-primary-100',
		'dark:bg-yellow-900/20',
		'dark:bg-yellow-700/20',
		'dark:bg-yellow-500/20',
		'border-primary-300',
		'dark:border-primary-500/50',
	],
	plugins: [require("flowbite/plugin")],
};
