import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import pageCss from './page.css?inline'
import MetadataModel from '$src/lib/metadata_model'
import Misc from '$src/lib/miscellaneous'
import 'iconify-icon'
import '$src/lib/components/metadata-model/build/component'
import '$src/lib/components/metadata-model/datum-input/component'
import '$src/lib/components/metadata-model/view/table/component'
import '$src/lib/components/metadata-model/view/query-panel/component'
import Log from '$src/lib/log'
import Theme from '$src/lib/theme'

enum Tab {
	PROPERTIES = 'PROPERTIES',
	BUILD = 'BUILD',
	VIEW = 'VIEW'
}

enum ViewTab {
	DATUM_INPUT = 'DATUM_INPUT',
	TABLE = 'TABLE',
	QUERY_PANEL = 'QUERY_PANEL'
}

@customElement('metadata-model-page')
class Page extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(pageCss)]

	@property({ type: Object }) data: MetadataModel.ISearchResults | null = null

	private _currentDirectoryGroupID: string | null = null

	@state() private _currentTab: Tab = Tab.PROPERTIES

	@state() private _expandRightSection: boolean = false

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth
		if (this._windowWidth > 1000) {
			if (this._currentTab === Tab.VIEW) this._currentTab = Tab.PROPERTIES
			if (this._expandRightSection) this._expandRightSection = false
		}
	}

	@state() private _data: any = MetadataModel.EmptyMetadataModel()

	@state() private _currentViewTab: ViewTab = ViewTab.DATUM_INPUT

	@state() private _datuminputsamplemetadatamodel: any = structuredClone(this._data)
	@state() private _datuminputsampledata: any = {}
	@state() private _datumeinputqueryconditions: any[] = []

	@state() private _colorTheme: Theme.Color = Theme.Color.PRIMARY

	private _viewHtmlTemplate() {
		return html`
			<header role="tablist" class="tabs tabs-bordered">
				<button role="tab" class="tab${this._currentViewTab === ViewTab.DATUM_INPUT ? ' tab-active' : ''}" @click=${() => (this._currentViewTab = ViewTab.DATUM_INPUT)}>Datum Input</button>
				<button role="tab" class="tab${this._currentViewTab === ViewTab.TABLE ? ' tab-active' : ''}" @click=${() => (this._currentViewTab = ViewTab.TABLE)}>Table</button>
				<button role="tab" class="tab${this._currentViewTab === ViewTab.QUERY_PANEL ? ' tab-active' : ''}" @click=${() => (this._currentViewTab = ViewTab.QUERY_PANEL)}>Query Panel</button>
			</header>
			<main class="flex-[9] h-full w-full overflow-hidden flex">
				${(() => {
					switch (this._currentViewTab) {
						case ViewTab.DATUM_INPUT:
							return html`
								<metadata-model-datum-input
									class="flex-1"
									.metadatamodel=${this._datuminputsamplemetadatamodel}
									.data=${this._datuminputsampledata}
									.startcolor=${this._colorTheme}
									@metadata-model-datum-input:updatedata=${(e: CustomEvent) => {
										this._datuminputsampledata = structuredClone(e.detail.value)
									}}
									@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
										this._datuminputsamplemetadatamodel = structuredClone(e.detail.value)
									}}
								></metadata-model-datum-input>
							`
						case ViewTab.TABLE:
							return html`
								<div class="border-[1px] border-gray-400 flex-1 h-fit max-h-full max-w-full flex overflow-hidden">
									<metadata-model-view-table .color=${this._colorTheme} .metadatamodel=${this._datuminputsamplemetadatamodel} .data=${[this._datuminputsampledata]} .color=${Theme.Color.SECONDARY}></metadata-model-view-table>
								</div>
							`
						case ViewTab.QUERY_PANEL:
							return html`
								<metadata-model-view-query-panel
									.metadatamodel=${this._datuminputsamplemetadatamodel}
									.queryconditions=${this._datumeinputqueryconditions}
									.startcolor=${this._colorTheme}
									@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
										this._datuminputsamplemetadatamodel = structuredClone(e.detail.value)
									}}
									@metadata-model-view-query-panel:updatequeryconditions=${(e: CustomEvent) => {
										this._datumeinputqueryconditions = structuredClone(e.detail.value)
									}}
								></metadata-model-view-query-panel>
							`
						default:
							return html`<div class="text-error font-bold">Tab not implemented</div>`
					}
				})()}
			</main>
		`
	}

	connectedCallback(): void {
		super.connectedCallback()
		window.addEventListener('resize', this._handleWindowResize)
		this._currentDirectoryGroupID = Misc.CurrentDirectoryGroupID(window.location.toString())
	}

	disconnectedCallback(): void {
		window.removeEventListener('resize', this._handleWindowResize)
		super.disconnectedCallback()
	}

	protected render(): unknown {
		return html`
			${(() => {
				if (!this._expandRightSection || this._windowWidth <= 1000) {
					return html`
						<section id="left-section" class="flex-1 flex flex-col rounded-md shadow-md shadow-gray-800 bg-white p-1 space-y-1 overflow-hidden">
							<header role="tablist" class="tabs tabs-bordered">
								<button role="tab" class="tab${this._currentTab === Tab.PROPERTIES ? ' tab-active' : ''}" @click=${() => (this._currentTab = Tab.PROPERTIES)}>Properties</button>
								<button role="tab" class="tab${this._currentTab === Tab.BUILD ? ' tab-active' : ''}" @click=${() => (this._currentTab = Tab.BUILD)}>Building</button>
								${(() => {
									if (this._windowWidth <= 1000) {
										return html`<button role="tab" class="tab${this._currentTab === Tab.VIEW ? ' tab-active' : ''}" @click=${() => (this._currentTab = Tab.VIEW)}>Viewing</button>`
									} else {
										return nothing
									}
								})()}
							</header>
							<main class="flex-[9.5] flex flex-col space-y-1 overflow-hidden">
								${(() => {
									switch (this._currentTab) {
										case Tab.PROPERTIES:
											return html`
												<div class="join join-vertical">
													<div class="join-item join-label-primary p-1">Upload metadata model (JSON)</div>
													<input
														class="join-item file-input file-input-primary"
														type="file"
														accept="application/json"
														@change=${async (e: any) => {
															if (e.target.files === null) {
																return
															}

															const fileList = e.target.files as FileList
															if (fileList.item(0)?.type !== 'application/json') {
																return
															}

															const fileText = await fileList.item(0)?.text()
															if (typeof fileText === 'undefined') {
																return
															}

															try {
																this._data = JSON.parse(fileText)
																this._datuminputsamplemetadatamodel = JSON.parse(fileText)
																window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.SUCCESS, toastMessage: 'metadata model successfully uploaded' }, bubbles: true, composed: true }))
															} catch (e) {
																window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.ERROR, toastMessage: 'Failed to parse json file content' }, bubbles: true, composed: true }))
																Log.Log(Log.Level.ERROR, this.localName, 'parse json failed', e)
															}
														}}
													/>
												</div>
												<button
													class="btn btn-primary"
													@click=${() => {
														const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(this._data)], { type: 'application/json' }))
														const downloadLink = document.createElement('a')
														downloadLink.href = objectUrl
														downloadLink.setAttribute('download', `metadatamodel.json`)
														document.body.appendChild(downloadLink)
														downloadLink.click()
														document.body.removeChild(downloadLink)
														URL.revokeObjectURL(objectUrl)
													}}
												>
													Download metadata model
												</button>
												<div class="join join-vertical">
													<div class="join-item p-1 bg-primary text-primary-content">Color Theme</div>
													<select
														class="join-item select select-primary w-full"
														@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
															this._colorTheme = e.currentTarget.value as Theme.Color
														}}
													>
														<option value="${Theme.Color.PRIMARY}" .selected=${this._colorTheme === Theme.Color.PRIMARY}>Primary</option>
														<option value="${Theme.Color.SECONDARY}" .selected=${this._colorTheme === Theme.Color.SECONDARY}>Secondary</option>
														<option value="${Theme.Color.ACCENT}" .selected=${this._colorTheme === Theme.Color.ACCENT}>Accent</option>
													</select>
												</div>
											`
										case Tab.BUILD:
											return html`
												<metadata-model-build
													class="flex-[9] flex flex-col rounded-md bg-gray-100 shadow-inner shadow-gray-800 p-1"
													.metadatamodel=${this._data}
													.startcolor=${this._colorTheme}
													@metadata-model-build:updatemetadatamodel=${(e: CustomEvent) => {
														this._data = structuredClone(e.detail.value)
														this._datuminputsamplemetadatamodel = structuredClone(e.detail.value)
													}}
												></metadata-model-build>
											`
										case Tab.VIEW:
											return this._viewHtmlTemplate()
										default:
											return html`tab not implemented`
									}
								})()}
							</main>
						</section>
					`
				} else {
					return nothing
				}
			})()}
			${(() => {
				if (this._windowWidth > 1000) {
					return html`
						<section id="right-section" class="flex-1 flex flex-col rounded-md shadow-md shadow-gray-800 bg-white p-1 space-y-1 overflow-hidden">
							<header class="flex justify-between">
								<div class="font-bold text-lg h-fit self-center">View metadata-model</div>
								<button class="btn btn-circle btn-ghost self-center" @click=${() => (this._expandRightSection = !this._expandRightSection)}>
									<iconify-icon icon=${this._expandRightSection ? 'mdi:expand-vertical' : 'mdi:collapse-vertical'} style="color:black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
								</button>
							</header>
							${this._viewHtmlTemplate()}
						</section>
					`
				} else {
					return nothing
				}
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-page': Page
	}
}
