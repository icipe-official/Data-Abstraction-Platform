import { defineConfig, loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'node:path'
import * as fs from 'node:fs'

class EntryPoints {
	rollupOptionsInputs = {}
	htmlPages = {}
	regexTestGoHtmlFile = new RegExp(/(.+).hbs.html/)

	/**
	 * @function generateEntryPoints Locates entry points, files ending with `go.hbs` and pushes the details into {@linkcode rollupOptionsInputs}.
	 * @param {string} currentRelativeFolderPath
	 * @returns {void}
	 * */
	generateEntryPoints(currentRelativeFolderPath) {
		/**@type {string[]} */
		const dirContent = fs.readdirSync(currentRelativeFolderPath)
		dirContent.forEach((dc) => {
			let currentFileFolderPath = path.resolve(__dirname, currentRelativeFolderPath, dc)
			if (fs.lstatSync(currentFileFolderPath).isDirectory()) {
				this.generateEntryPoints(currentRelativeFolderPath + '/' + dc)
			} else {
				const ENTRYPOINT_FILE_EXTRACT = this.regexTestGoHtmlFile.exec(dc)
				if (ENTRYPOINT_FILE_EXTRACT !== null) {
					let inputKey = currentRelativeFolderPath.slice(4) + '/' + dc.slice(0, dc.lastIndexOf('.hbs.html'))
					if (inputKey.startsWith('/')) {
						inputKey = inputKey.replace('/', '')
					}
					this.rollupOptionsInputs[inputKey] = currentFileFolderPath
				}
			}
		})
	}

	writeHtmlPages() {
		Object.keys(this.rollupOptionsInputs).forEach((key) => {
			this.htmlPages[key] = `${key}.hbs.html`
		})
	}
}

export default defineConfig(({ mode }) => {
	process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

	let ep = new EntryPoints()
	return {
		define: {
			VITE_WEBSITE_LOG_LEVEL: JSON.stringify(
				(() => {
					const logLevel = process.env.VITE_WEBSITE_LOG_LEVEL
					return logLevel ? logLevel : '0'
				})()
			),
			VITE_WEBSITE_TITLE: JSON.stringify(
				(() => {
					const websiteTitle = process.env.VITE_WEBSITE_TITLE
					return websiteTitle ? websiteTitle : 'Data Abstraction Platform Dev'
				})()
			),
			VITE_WEB_SERVICE_API_CORE_URL: JSON.stringify(
				(() => {
					const apiCoreUrl = process.env.VITE_WEB_SERVICE_API_CORE_URL
					return apiCoreUrl ? apiCoreUrl : 'http://localhost:5173/api'
				})()
			)
		},
		root: 'src/',
		base: process.env.WEB_SERVICE_BASE_PATH ? process.env.WEB_SERVICE_BASE_PATH : '/',
		build: {
			emptyOutDir: true,
			outDir: path.resolve(__dirname, 'dist/'),
			rollupOptions: {
				input: ep.rollupOptionsInputs
			}
		},
		plugins: [
			tsconfigPaths(),
			{
				name: 'generate-html-entrypoints',
				options: (options) => {
					console.log('Generating html entry points....')
					ep.generateEntryPoints('src')
					console.log('<---Generated html entry points--->')
					console.log(ep.rollupOptionsInputs)
					console.log('<------------------------------->\n')
					options.input = ep.rollupOptionsInputs
					return options
				}
			},
			{
				name: 'write-html-entrypoints',
				closeBundle: () => {
					console.log("Writing paths to html pages in 'html_pages.json'...")
					ep.writeHtmlPages()
					if (!fs.existsSync(path.resolve(__dirname, 'dist'))) {
						fs.mkdirSync(path.resolve(__dirname, 'dist'), { recursive: true })
					}
					fs.writeFileSync(path.resolve(__dirname, 'dist/', 'html_pages.json'), JSON.stringify(ep.htmlPages, null, '  '))
					console.log('Write complete.')
				}
			}
		]
	}
})
