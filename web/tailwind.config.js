/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,ts}'],
	theme: {
		extend: {}
	},
	daisyui: {
		themes: [
			{
				mytheme: {
					primary: '#3c7847',
					secondary: '#d4c16d',
					accent: '#000000',
					neutral: '#ffffff',
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
