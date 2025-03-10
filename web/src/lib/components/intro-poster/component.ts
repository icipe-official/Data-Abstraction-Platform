import { html, LitElement, nothing, unsafeCSS } from 'lit'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import { customElement, state } from 'lit/decorators.js'
import Theme from '@lib/theme'
import icipeLogoPng from '@assets/icipe_logo.png'
import uooLogoPng from '@assets/university_of_oxford_logo.png'
import vaLogoPng from '@assets/vector_atlas_logo.png'
import mapLogoPng from '@assets/malaria_atlas_project_logo.png'
import bamgLogoPng from '@assets/bill_and_melinda_gates_logo.png'

@customElement('intro-poster')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@state() private _slideNumber = 0

	private _slideInterval?: number

	connectedCallback(): void {
		super.connectedCallback()
		this._slideInterval = window.setInterval(() => {
			this._slideNumber = this._slideNumber === 2 ? 0 : this._slideNumber + 1
		}, 4000)
	}

	disconnectedCallback(): void {
		window.clearInterval(this._slideInterval)
		super.disconnectedCallback()
	}

	protected render(): unknown {
		return html`
			<header class="flex-[0.5]">
				<h1 class="text-3xl text-center font-bold">VECTOR ATLAS<span>-</span><span class="text-primary-focus">DATA ABSTRACTION PLAFORM</span></h1>
			</header>
			<main class="flex-[9] flex justify-center overflow-auto">
				${(() => {
					if (this._slideNumber === 0) {
						return html`
							<div class="w-full h-fit self-center flex flex-col gap-y-2 text-ACCENT">
								<div class="flex-1 flex-col h-full">
									<div class="flex-1 flex-col h-full">
										<div class="flex-[9] flex justify-center">
											<!--mdi:construction source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
												<path
													fill="${Theme.Color.ACCENT}"
													d="M12 15c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4M8 9a4 4 0 0 0 4 4a4 4 0 0 0 4-4m-4.5-7c-.3 0-.5.21-.5.5v3h-1V3s-2.25.86-2.25 3.75c0 0-.75.14-.75 1.25h10c-.05-1.11-.75-1.25-.75-1.25C16.25 3.86 14 3 14 3v2.5h-1v-3c0-.29-.19-.5-.5-.5z"
												/>
											</svg>
										</div>
										<div class="flex-1 text-3xl text-center">Prepare</div>
									</div>
									<div class="flex-[9]">
										<ul class="text-center text-xl">
											<li>Build your team</li>
											<li>Upload documents to abstract</li>
											<li>Model the structure of your data using metadata-models</li>
										</ul>
									</div>
								</div>
							</div>
						`
					} else if (this._slideNumber === 1) {
						return html`
							<div class="w-full h-fit self-center flex flex-col gap-y-2 text-secondary">
								<div class="flex-1 flex-col h-full">
									<div class="flex-[9] flex justify-center">
										<!--mdi:watering-can source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
											<path
												fill="${Theme.Color.SECONDARY}"
												d="M18.5 7.47c-.74.73-.93 1.78-.58 2.68L15 13.07V11c0-.55-.45-1-1-1h-1.03c.03-.17.03-.33.03-.5C13 6.46 10.54 4 7.5 4A5.497 5.497 0 0 0 4 13.74V20c0 .55.45 1 1 1h9c.55 0 1-.45 1-1v-4.11l4.33-4.33c.9.35 1.95.17 2.67-.56zM4.05 10C4.03 9.83 4 9.67 4 9.5C4 7.57 5.57 6 7.5 6S11 7.57 11 9.5c0 .17-.03.33-.05.5z"
											/>
										</svg>
									</div>
									<div class="flex-1 text-3xl text-center h-full font-bold">Collect</div>
								</div>
								<div class="flex-[9]">
									<ul class="text-center text-xl">
										<li>Abstract data</li>
									</ul>
								</div>
							</div>
						`
					} else if (this._slideNumber === 2) {
						return html`
							<div class="w-full h-fit self-center flex flex-col gap-y-2 text-primary">
								<div class="flex-1 flex-col h-full">
									<div class="fkex-[9] flex justify-center">
										<!--mdi:explore source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 24 24">
											<path fill="${Theme.Color.PRIMARY}" d="M14.19 14.19L6 18l3.81-8.19L18 6m-6-4A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2m0 8.9a1.1 1.1 0 0 0-1.1 1.1a1.1 1.1 0 0 0 1.1 1.1a1.1 1.1 0 0 0 1.1-1.1a1.1 1.1 0 0 0-1.1-1.1" s />
										</svg>
									</div>
									<div class="flex-1 text-3xl text-center">Explore</div>
								</div>
								<div class="flex-[9]">
									<ul class="text-center text-xl">
										<li>View and filter through data</li>
										<li>Generate excel workbooks and csv files</li>
									</ul>
								</div>
							</div>
						`
					} else {
						return nothing
					}
				})()}
			</main>
			<footer class="flex-[1] flex justify-between gap-x-1 min-h-fit overflow-x-auto">
				<img src=${icipeLogoPng} alt="icipe logo" class="max-w-[10vw] max-h-[5vh] self-center" />
				<img src=${uooLogoPng} alt="university of oxford logo" class="max-w-[10vw] max-h-[5vh] self-center" />
				<img src=${vaLogoPng} alt="vector atlas logo" class="max-w-[10vw] max-h-[10vh] self-center" />
				<img src=${mapLogoPng} alt="malaria atlas logo" class="max-w-[10vw] max-h-[5vh] self-center" />
				<img src=${bamgLogoPng} alt="bill and melinda gates foundation logo" class="max-w-[10vw] max-h-[5vh] self-center" />
			</footer>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'intro-poster': Component
	}
}
