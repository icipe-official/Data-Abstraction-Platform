import MetadataModel from "$src/lib/metadata_model"
import Misc from "$src/lib/miscellaneous"
import Theme from "$src/lib/theme"
import { LitElement, unsafeCSS, html, nothing } from "lit"
import { customElement, state } from "lit/decorators.js"
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import 'iconify-icon'
// import '$src/lib/components/metadata-model/view/panel/component'
// import '$src/lib/components/metadata-model/view/table/component'

/**
 * Toast Nofitication Event Type.
 */
type ToastNotifyEvent = CustomEvent & {
	detail: {
		/**
		 * Determines background of toast message.
		 */
		toastType: Misc.ToastType
		/**
		 * If toast message is an array of string, each element will be displayed in a numbered list.
		 */
		toastMessage: string | string[]

		toastTitle: string

		toastMetadataModelSearchResults: MetadataModel.ISearchResults
	}
}

/**
 * Component displays a toast at the bottom of the screen when the event {@linkcode Misc.CustomEvents.TOAST_NOTIFY} is fired.
 * @listens {@linkcode Misc.CustomEvents.TOAST_NOTIFY} - Takes in event of type {@linkcode ToastNotifyEvent}.
 */
@customElement('toast-notification')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@state() private _toastType: string | null = null
	@state() private _toastMessage: string | string[] | null = null
	@state() private _toastTitle: string | null = null
	@state() private _toastMetadataModelSearchResults: MetadataModel.ISearchResults | null = null

	@state() private _queryConditions: any = {}
	@state() private _filterincludeindexes: number[] = []

	private _closeToastTimeout?: number

	private _closeToast() {
		this._toastType = null
		this._toastMessage = null
		this._toastTitle = null
		this._toastMetadataModelSearchResults = null
		this._queryConditions = {}
		this._filterincludeindexes = []
		this._showFilterPanel = false
	}

	private _toastNotifyListener = (e: ToastNotifyEvent) => {
		this._toastType = e.detail.toastType
		this._toastMessage = e.detail.toastMessage
		this._toastTitle = e.detail.toastTitle
		this._toastMetadataModelSearchResults = e.detail.toastMetadataModelSearchResults
	}

	@state() _showFilterPanel: boolean = false

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth //1000
	}

	connectedCallback(): void {
		super.connectedCallback()
		window.addEventListener(Misc.CustomEvents.TOAST_NOTIFY, this._toastNotifyListener as EventListenerOrEventListenerObject)
		window.addEventListener('resize', this._handleWindowResize)
	}

	disconnectedCallback(): void {
		window.clearTimeout(this._closeToastTimeout)
		window.removeEventListener(Misc.CustomEvents.TOAST_NOTIFY, this._toastNotifyListener as EventListenerOrEventListenerObject)
		window.removeEventListener('resize', this._handleWindowResize)
		super.disconnectedCallback()
	}

	protected render(): unknown {
		return html`
			${(() => {
				if (this._toastType !== null && this._toastMessage !== null) {
					this._closeToastTimeout = window.setTimeout(() => this._closeToast(), typeof this._toastMessage === 'string' ? 3000 : 10000)
					return html`
						<div role="alert" class="alert shadow-sm shadow-slate-600 flex ${this._toastType === Misc.ToastType.ERROR ? 'alert-error' : this._toastType === Misc.ToastType.WARNING ? 'alert-warning' : this._toastType === Misc.ToastType.SUCCESS ? 'alert-success' : 'alert-info'}">
							<div class="flex w-full h-fit space-x-1">
								${(() => {
									if (typeof this._toastMessage === 'string') {
										return html`<div class="break-words flex-[9.5] self-center">${this._toastMessage}</div>`
									} else if (Array.isArray(this._toastMessage)) {
										return html` <div class="flex flex-col self-center">${this._toastMessage.map((tm, index) => html`<div class="break-words flex-[0.5] w-full text-left">${index + 1}-${tm}</div>`)}</div> `
									} else {
										return html`<div class="break-words flex-[9.5] self-center">No message...</div>`
									}
								})()}
								${(() => {
									if (typeof this._toastMetadataModelSearchResults !== 'undefined' && this._toastMetadataModelSearchResults !== null) {
										return html`
											<button
												class="link link-hover font-bold italic w-full text-left self-center"
												@click=${() => {
													window.clearTimeout(this._closeToastTimeout)
													this._toastType = null
													this._toastMessage = null
													;(this.shadowRoot?.querySelector('#metadata-model-search-results-dialog') as HTMLDialogElement).showModal()
												}}
											>
												view more...
											</button>
										`
									} else {
										return nothing
									}
								})()}
								<button
									class="btn btn-circle btn-ghost p-0 w-fit h-fit self-center"
									@click=${() => {
										window.clearTimeout(this._closeToastTimeout)
										this._closeToast()
									}}
								>
									<iconify-icon
										icon="mdi:close"
										style="color:${this._toastType === Misc.ToastType.ERROR ? Theme.Color.ERROR_CONTENT : this._toastType === Misc.ToastType.WARNING ? Theme.Color.WARNING_CONTENT : Theme.Color.INFO_CONTENT};"
										width=${Misc.IconifySize()}
										height=${Misc.IconifySize()}
									></iconify-icon>
								</button>
							</div>
						</div>
					`
				} else {
					window.clearTimeout(this._closeToastTimeout)
					return nothing
				}
			})()}
			<dialog id="metadata-model-search-results-dialog" class="modal">
				<form method="dialog" class="modal-box p-0 rounded min-w-[500px] w-full max-w-fit max-h-fit overflow-hidden">
					<header class="sticky flex justify-between items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
						<div class="h-fit w-fit flex space-x-1">
							<button
								class="btn btn-circle btn-ghost flex justify-center"
								@click=${(e: Event) => {
									e.preventDefault()
									this._showFilterPanel = !this._showFilterPanel
								}}
							>
								<iconify-icon icon="mdi:filter" style="color:${Theme.Color.INFO};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
							</button>
							<div class="flex self-center space-x-1">${typeof this._toastTitle !== 'undefined' && this._toastTitle !== null ? this._toastTitle : 'More information'}</div>
						</div>
						<button class="btn btn-circle btn-ghost flex justify-center" @click=${this._closeToast}>
							<iconify-icon icon="mdi:close-thick" style="color:${Theme.Color.ERROR};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
						</button>
					</header>
					<main class="flex-[9.5] p-2 space-x-1 max-w-[90vw] overflow-hidden max-h-[90vh] flex">
						${(() => {
							if (typeof this._toastMetadataModelSearchResults !== 'undefined' && this._toastMetadataModelSearchResults !== null) {
								return html`
									${(() => {
										if (this._showFilterPanel) {
											return html`
												<div class="flex-[2] flex flex-col bg-gray-100 shadow-inner shadow-gray-800 space-y-1 rounded-md overflow-hidden max-w-fit p-1">
													<metadata-model-view-panel
														class="flex-[9.5] max-w-fit"
														.queryconditions=${this._queryConditions}
														.metadatamodel=${this._toastMetadataModelSearchResults.metadata_model}
														@metadata-model-view-panel:updatequeryconditions=${(e: CustomEvent) => {
															this._queryConditions = JSON.parse(JSON.stringify(e.detail.value))
														}}
														@metadata-model-view-panel:updatemetadatamodel=${(e: CustomEvent) => {
															this._toastMetadataModelSearchResults!.metadata_model = e.detail
															this._toastMetadataModelSearchResults = JSON.parse(JSON.stringify(this._toastMetadataModelSearchResults))
														}}
													></metadata-model-view-panel>
													<button
														class="flex-[0.5] btn btn-primary"
														@click=${(e: Event) => {
															e.preventDefault()
															this._filterincludeindexes = MetadataModel.FilterData(this._queryConditions, this._toastMetadataModelSearchResults!.data!)
														}}
													>
														Filter
													</button>
												</div>
											`
										} else {
											return nothing
										}
									})()}
									${(() => {
										if (!this._showFilterPanel || this._windowWidth > 1000) {
											return html`
												<div class="flex-[3] overflow-hidden flex rounded-md bg-white">
													<metadata-model-view-table
														class="flex-[1]"
														.addclickcolumn=${false}
														.multiselectcolumns=${false}
														.addselectcolumn=${false}
														.filterincludeindexes=${this._filterincludeindexes}
														.metadatamodel=${this._toastMetadataModelSearchResults.metadata_model}
														.data=${this._toastMetadataModelSearchResults.data!}
													></metadata-model-view-table>
												</div>
											`
										} else {
											return nothing
										}
									})()}
								`
							} else {
								return nothing
							}
						})()}
					</main>
				</form>
			</dialog>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'toast-notification': Component
	}
}

