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
					50:  'rgb(var(--primary-50) / <alpha-value>)',
					100: 'rgb(var(--primary-100) / <alpha-value>)',
					200: 'rgb(var(--primary-200) / <alpha-value>)',
					300: 'rgb(var(--primary-300) / <alpha-value>)',
					400: 'rgb(var(--primary-400) / <alpha-value>)',
					500: 'rgb(var(--primary-500) / <alpha-value>)',
					600: 'rgb(var(--primary-600) / <alpha-value>)',
					700: 'rgb(var(--primary-700) / <alpha-value>)',
					800: 'rgb(var(--primary-800) / <alpha-value>)',
					900: 'rgb(var(--primary-900) / <alpha-value>)',
					11: "#2247b3"
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
		'bg-primary-500/10',
		'dark:bg-primary-500/15',
		'dark:bg-primary-500/10',
		'border-primary-300',
		'border-primary-500/50',
		'dark:border-primary-500/50',
	],
	plugins: [require("flowbite/plugin")],
};
