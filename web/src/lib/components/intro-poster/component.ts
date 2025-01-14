import { html, LitElement, nothing, unsafeCSS } from 'lit'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import { customElement, state } from 'lit/decorators.js'
import 'iconify-icon'
import Theme from '$src/lib/theme'
import icipeLogoPng from '$src/assets/icipe_logo.png'
import uooLogoPng from '$src/assets/university_of_oxford_logo.png'
import vaLogoPng from '$src/assets/vector_atlas_logo.png'
import mapLogoPng from '$src/assets/malaria_atlas_project_logo.png'
import bamgLogoPng from '$src/assets/bill_and_melinda_gates_logo.png'

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
							<div class="w-full h-fit self-center flex flex-col space-y-2 text-ACCENT">
								<div class="flex-1 flex-col h-full">
									<div class="flex-1 flex-col h-full">
										<div class="flex-[9] flex justify-center"><iconify-icon icon="mdi:construction" style="color:${Theme.Color.ACCENT};" width="200" height="200"></iconify-icon></div>
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
							<div class="w-full h-fit self-center flex flex-col space-y-2 text-secondary">
								<div class="flex-1 flex-col h-full">
									<div class="flex-[9] flex justify-center"><iconify-icon icon="mdi:watering-can" style="color:${Theme.Color.SECONDARY};" width="200" height="200"></iconify-icon></div>
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
							<div class="w-full h-fit self-center flex flex-col space-y-2 text-primary">
								<div class="flex-1 flex-col h-full">
									<div class="fkex-[9] flex justify-center"><iconify-icon icon="mdi:explore" style="color:${Theme.Color.PRIMARY};" width="200" height="200"></iconify-icon></div>
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
			<footer class="flex-[1] flex justify-between space-x-1 min-h-fit overflow-x-auto">
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
