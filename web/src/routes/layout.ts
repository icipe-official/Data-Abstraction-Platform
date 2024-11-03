import { LitElement, html, nothing, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import tailwindCss from '$src/assets/index.css?inline'
import toastNotificationCss from './layout.toast-notification.css?inline'
import 'iconify-icon'
import Misc from '$src/lib/miscellaneous'
import Theme from '$src/lib/theme'
import { Interface } from '$src/lib/interface'
import Log from '$src/lib/log'
import MetadataModel from '$src/lib/metadata_model'
import '$src/lib/components/metadata-model/view/panel/component'
import '$src/lib/components/metadata-model/view/table/component'

// listen to back forward navigation
window.addEventListener('popstate', async (e: PopStateEvent) => {
	try {
		const fetchResponse = await fetch((e.state as Interface.HistoryState).url, {
			credentials: 'include'
		})
		const fetchData = await fetchResponse.text()
		const elementToReplaceContent = document.querySelector(`#${(e.state as Interface.HistoryState).targetElementID}`)
		if (elementToReplaceContent !== null) {
			elementToReplaceContent.innerHTML = fetchData
			Array.from(elementToReplaceContent.querySelectorAll('script')).forEach((oldScript) => {
				const newScript = document.createElement('script')
				Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value))
				newScript.appendChild(document.createTextNode(oldScript.innerHTML))
				oldScript.parentNode?.replaceChild(newScript, oldScript)
			})
		} else {
			Log.Log(Log.Level.ERROR, 'page-navigation', 'Handle pop state failed', 'Section does not exist')
			window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.ERROR, toastMessage: 'Section does not exist' }, bubbles: true, composed: true }))
		}
	} catch (error) {
		Log.Log(Log.Level.ERROR, 'page-navigation', 'Handle pop state failed', e, error)
		window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.ERROR, toastMessage: Misc.DEFAULT_FETCH_ERROR }, bubbles: true, composed: true }))
	}
})

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

		toastMetadataModelSearchResults: MetadataModel.Index.ISearchResults
	}
}
/**
 * Component displays a toast at the bottom of the screen when the event {@linkcode Misc.CustomEvents.TOAST_NOTIFY} is fired.
 * @listens {@linkcode Misc.CustomEvents.TOAST_NOTIFY} - Takes in event of type {@linkcode ToastNotifyEvent}.
 */
@customElement('toast-notification')
class ToastNotification extends LitElement {
	static styles = [unsafeCSS(tailwindCss), unsafeCSS(toastNotificationCss)]

	@state() private _toastType: string | null = null
	@state() private _toastMessage: string | string[] | null = null
	@state() private _toastTitle: string | null = null
	@state() private _toastMetadataModelSearchResults: MetadataModel.Index.ISearchResults | null = null

	@state() private _queryConditions: any = {}
	@state() private _filterincludeindexes: number[] = []

	private _closeToastTimeout: number | undefined

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
			${this._toastType !== null && this._toastMessage !== null
				? (() => {
						this._closeToastTimeout = window.setTimeout(() => this._closeToast(), typeof this._toastMessage === 'string' ? 3000 : 10000)
						return html`
							<div role="alert" class="alert shadow-sm shadow-slate-600 flex ${this._toastType === Misc.ToastType.ERROR ? 'alert-error' : this._toastType === Misc.ToastType.WARNING ? 'alert-warning' : this._toastType === Misc.ToastType.SUCCESS ? 'alert-success' : 'alert-info'}">
								<div class="flex flex-col w-full h-fit">
									${typeof this._toastMessage === 'string'
										? html`<div class="break-words flex-[9.5]">${this._toastMessage}</div>`
										: Array.isArray(this._toastMessage)
											? html` <div class="flex flex-col">${this._toastMessage.map((tm, index) => html`<div class="break-words flex-[0.5] w-full text-left">${index + 1}-${tm}</div>`)}</div> `
											: html`<div class="break-words flex-[9.5]">No message...</div>`}
									${typeof this._toastMetadataModelSearchResults !== 'undefined' && this._toastMetadataModelSearchResults !== null
										? html`
												<button
													class="link link-hover font-bold italic w-full text-left"
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
										: nothing}
								</div>
								<button
									class="btn btn-circle btn-ghost p-0 w-fit h-fit"
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
						`
					})()
				: (() => {
						window.clearTimeout(this._closeToastTimeout)
						return nothing
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
						${typeof this._toastMetadataModelSearchResults !== 'undefined' && this._toastMetadataModelSearchResults !== null
							? html`
									${this._showFilterPanel
										? html`
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
										: nothing}
									${!this._showFilterPanel || this._windowWidth > 1000
										? html`
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
										: nothing}
								`
							: nothing}
					</main>
				</form>
			</dialog>
		`
	}
}

/**
 * Show Loading Screen Event Type.
 */
type ShowLoadingScreenEvent = CustomEvent & {
	detail: {
		/**
		 * Determines background of toast message.
		 */
		loading: Misc.ToastType
		/**
		 * If toast message is an array of string, each element will be displayed in a numbered list.
		 */
		loadingMessage: string | null
	}
}
/**
 * Component displays a loading screen when the event {@linkcode Misc.CustomEvents.SHOW_LOADING_SCREEN} is fired.
 * @listens {@linkcode Misc.CustomEvents.SHOW_LOADING_SCREEN} - Takes in event of type {@linkcode ShowLoadingScreenEvent}.
 */
@customElement('loading-screen')
class LoadingScreen extends LitElement {
	static styles = [unsafeCSS(tailwindCss)]

	@state() private _loading: boolean = false
	@state() private _loadingMessage: string | null = null

	private _showLoadingScreenListener = (e: ShowLoadingScreenEvent) => {
		this._loading = e.detail.loading
		this._loadingMessage = e.detail.loadingMessage
		if (this._loading) {
			;(this.shadowRoot?.querySelector('#loading-screen-dialog') as HTMLDialogElement).showModal()
		} else {
			this._loadingMessage = null
			;(this.shadowRoot?.querySelector('#loading-screen-dialog') as HTMLDialogElement).close()
		}
	}

	connectedCallback(): void {
		super.connectedCallback()
		window.addEventListener(Misc.CustomEvents.SHOW_LOADING_SCREEN, this._showLoadingScreenListener as EventListenerOrEventListenerObject)
	}

	disconnectedCallback(): void {
		window.removeEventListener(Misc.CustomEvents.SHOW_LOADING_SCREEN, this._showLoadingScreenListener as EventListenerOrEventListenerObject)
		super.disconnectedCallback()
	}

	protected render(): unknown {
		return html`
			<dialog id="loading-screen-dialog" class="modal">
				<form method="dialog" class="modal-backdrop min-w-[200px]">
					<div class="flex flex-col justify-center items-center text-xl space-y-5">
						<div class="flex">
							<span class="loading loading-ball loading-sm text-accent"></span>
							<span class="loading loading-ball loading-md text-secondary"></span>
							<span class="loading loading-ball loading-lg text-primary"></span>
						</div>
						${this._loadingMessage ? html` <span class="text-white">${this._loadingMessage}</span> ` : nothing}
					</div>
				</form>
			</dialog>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'toast-notification': ToastNotification
		'loading-screen': LoadingScreen
	}
}
