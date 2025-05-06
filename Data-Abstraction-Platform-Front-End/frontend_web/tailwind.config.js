/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	daisyui: {
		themes: [
			{
				mytheme: {
					primary: '#3c7847',
					secondary: '#d4c16d',
					accent: '#ffffff',
					neutral: '#000000',
					'base-100': '#ffffff',
					success: '#008000',
					error: '#ff0000',
					info: '#0000cd'
				}
			}
		]
	},
	plugins: [require('daisyui')]
}

// Old theme
// mytheme: {
// 	primary: "#159947",
// 	secondary: "#851f2d",
// 	accent: "#1c231d",
// 	neutral: "#ffffff",
// 	"base-100": "#000000",
// 	success: "#008000",
// 	error: "#ff0000",
// 	info: "#0000cd"
// }
