import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import Lib from '@lib/lib'
import indexCss from '@assets/index.css?inline'
import '@lib/components/metadata-model/view/query-panel/component'
import '@lib/components/metadata-model/view/table/component'
import Theme from '@lib/theme'
import MetadataModel from '@lib/metadata_model'
import Entities from '@domentities'
import { IAppContextProvider } from '@dominterfaces/context/app'
import { AppContextProvider } from '@interfaces/context/app'
import { SpaPageNavigation } from '@interfaces/spa_page_navigation/spa_page_navigation'
import { ISpaPageNavigation } from '@dominterfaces/spa_page_navigation/spa_page_navigation'

interface IComponentData {
	openid_endpoints?: Entities.AppContext.OpenidEndpoints
	iam_credential?: Entities.IamCredentials.Interface
	directory_group_id?: string
}

/**
 * Provides the following functions:
 * * Displays a toast at the bottom of the screen when the event {@linkcode Lib.CustomEvents.TOAST_NOTIFY} is fired.
 * * Displays a loading screen when the event {@linkcode Lib.CustomEvents.SHOW_LOADING_SCREEN} is fired.
 *
 * @listens {@linkcode Lib.CustomEvents.TOAST_NOTIFY} - Takes in event of type {@linkcode ToastNotifyEvent}.
 * @listens {@linkcode Lib.CustomEvents.SHOW_LOADING_SCREEN} - Takes in event of type {@linkcode ShowLoadingScreenEvent}.
 */
@customElement('app-context')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss)]

	@property({ type: Object }) data: IComponentData | null = null

	constructor() {
		super()
		this._appContextProvider = new AppContextProvider(undefined)
		this._pageNavigation = new SpaPageNavigation(this._appContextProvider)
	}

	// loading screen start
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
	// loading screen end

	//toast notification start
	@state() private _toastType: string | null = null
	@state() private _toastMessage: string | string[] | null = null
	@state() private _toastTitle: string | null = null
	@state() private _toastMetadataModelSearchResults: Entities.MetadataModel.ISearchResults | null = null

	@state() private _queryConditions: any[] = []
	@state() private _filterexcludeindexes: number[] = []

	private _closeToastTimeout?: number

	private _closeToast() {
		this._toastType = null
		this._toastMessage = null
		this._toastTitle = null
		this._toastMetadataModelSearchResults = null
		this._queryConditions = []
		this._filterexcludeindexes = []
		this._showFilterPanel = false
	}

	private _toastNotifyListener = (e: ToastNotifyEvent) => {
		this._toastType = e.detail.toastType
		this._toastMessage = e.detail.toastMessage
		this._toastTitle = e.detail.toastTitle
		this._toastMetadataModelSearchResults = structuredClone(e.detail.toastMetadataModelSearchResults)
	}

	@state() _showFilterPanel: boolean = false
	//toast notification end

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth //1000
	}

	private _appContextProvider: IAppContextProvider

	private _pageNavigation: ISpaPageNavigation

	private _handlePageNavigation = async (e: PopStateEvent) => {
		await this._pageNavigation.HandlePopState(e)
	}

	connectedCallback(): void {
		super.connectedCallback()

		if (typeof this.data?.openid_endpoints?.login_endpoint === 'string') {
			let newOpenID: Entities.AppContext.OpenidEndpoints = {
				login_endpoint: this.data.openid_endpoints.login_endpoint
			}
			if (this.data.openid_endpoints.registration_endpoint) {
				newOpenID.registration_endpoint = this.data.openid_endpoints.registration_endpoint
			}
			if (this.data.openid_endpoints.account_management_endpoint) {
				newOpenID.account_management_endpoint = this.data.openid_endpoints.account_management_endpoint
			}
			this._appContextProvider.UpdateOpenidendpoints(newOpenID)
		} else {
			this._appContextProvider.UpdateOpenidendpoints(undefined)
		}

		if (typeof this.data?.iam_credential === 'object') {
			this._appContextProvider.UpdateIamcredential(this.data.iam_credential)
		} else {
			this._appContextProvider.UpdateIamcredential(undefined)
		}

		if (typeof this.data?.directory_group_id === 'string') {
			this._appContextProvider.UpdateIamdirectorygroupid(this.data.directory_group_id)
		} else {
			this._appContextProvider.UpdateIamdirectorygroupid(undefined)
		}

		window.addEventListener(Lib.CustomEvents.SHOW_LOADING_SCREEN, this._showLoadingScreenListener as EventListenerOrEventListenerObject)
		window.addEventListener(Lib.CustomEvents.TOAST_NOTIFY, this._toastNotifyListener as EventListenerOrEventListenerObject)
		window.addEventListener('resize', this._handleWindowResize)
		window.addEventListener('popstate', this._handlePageNavigation)
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()

		window.clearTimeout(this._closeToastTimeout)
		window.removeEventListener(Lib.CustomEvents.SHOW_LOADING_SCREEN, this._showLoadingScreenListener as EventListenerOrEventListenerObject)
		window.removeEventListener(Lib.CustomEvents.TOAST_NOTIFY, this._toastNotifyListener as EventListenerOrEventListenerObject)
		window.removeEventListener('resize', this._handleWindowResize)
		window.removeEventListener('popstate', this._handlePageNavigation)
	}

	protected render(): unknown {
		return html`
			<!--toast-notification start-->
			${(() => {
				if (this._toastType !== null && this._toastMessage !== null) {
					this._closeToastTimeout = window.setTimeout(() => this._closeToast(), typeof this._toastMessage === 'string' ? 3000 : 10000)
					return html`
						<div class="z-[2] toast max-sm:toast-center max-sm:w-full sm:toast-end">
							<div role="alert" class="alert shadow-sm shadow-slate-600 flex ${this._toastType === Lib.ToastType.ERROR ? 'alert-error' : this._toastType === Lib.ToastType.WARNING ? 'alert-warning' : this._toastType === Lib.ToastType.SUCCESS ? 'alert-success' : 'alert-info'}">
								<div class="flex w-full h-fit gap-x-1">
									${(() => {
										if (typeof this._toastMessage === 'string') {
											return html`<div class="break-words flex-[9.5] self-center">${this._toastMessage}</div>`
										}
										if (Array.isArray(this._toastMessage)) {
											return html` <div class="flex flex-col self-center">${this._toastMessage.map((tm, index) => html`<div class="break-words flex-[0.5] w-full text-left">${index + 1}-${tm}</div>`)}</div> `
										}
										return html`<div class="break-words flex-[9.5] self-center">No message...</div>`
									})()}
									${(() => {
										if (this._toastMetadataModelSearchResults?.metadata_model) {
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
										}
										return nothing
									})()}
									<button
										class="btn btn-circle btn-ghost p-0 w-fit h-fit self-center"
										@click=${() => {
											window.clearTimeout(this._closeToastTimeout)
											this._closeToast()
										}}
									>
										<!--mdi:close source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path
												fill="${this._toastType === Lib.ToastType.ERROR ? Theme.Color.ERROR_CONTENT : this._toastType === Lib.ToastType.WARNING ? Theme.Color.WARNING_CONTENT : Theme.Color.INFO_CONTENT}"
												d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"
											/>
										</svg>
									</button>
								</div>
							</div>
						</div>
					`
				}
				window.clearTimeout(this._closeToastTimeout)
				return nothing
			})()}
			<dialog id="metadata-model-search-results-dialog" class="modal">
				<form method="dialog" class="modal-box p-0 rounded min-w-[500px] w-full max-w-fit max-h-fit overflow-hidden">
					<header class="sticky flex justify-between items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
						<div class="h-fit w-fit flex gap-x-1">
							<button
								class="btn btn-circle btn-ghost flex justify-center"
								@click=${(e: Event) => {
									e.preventDefault()
									this._showFilterPanel = !this._showFilterPanel
								}}
							>
								<!--mdi:filter source: https://icon-sets.iconify.design-->
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
									<path fill="${Theme.Color.INFO}" d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z" />
								</svg>
							</button>
							<div class="flex self-center gap-x-1">${typeof this._toastTitle !== 'undefined' && this._toastTitle !== null ? this._toastTitle : 'More information'}</div>
						</div>
						<button class="btn btn-circle btn-ghost flex justify-center" @click=${this._closeToast}>
							<!--mdi:close-thick source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="${Theme.Color.ERROR}" d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z" />
							</svg>
						</button>
					</header>
					<main class="flex-[9.5] p-2 gap-x-1 max-w-[90vw] overflow-hidden max-h-[90vh] flex">
						${(() => {
							if (this._toastMetadataModelSearchResults?.metadata_model) {
								return html`
									${(() => {
										if (this._showFilterPanel) {
											return html`
												<div class="flex-[2] flex flex-col bg-gray-100 shadow-inner shadow-gray-800 gap-y-1 rounded-md overflow-hidden max-w-fit p-1">
													<metadata-model-view-query-panel
														class="flex-[9.5] max-w-fit"
														.queryconditions=${this._queryConditions}
														.metadatamodel=${this._toastMetadataModelSearchResults.metadata_model}
														@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
															this._toastMetadataModelSearchResults!.metadata_model = structuredClone(e.detail.value)
															this._toastMetadataModelSearchResults = structuredClone(this._toastMetadataModelSearchResults)
														}}
														@metadata-model-view-query-panel:updatequeryconditions=${(e: CustomEvent) => {
															this._queryConditions = structuredClone(e.detail.value)
														}}
													></metadata-model-view-query-panel>
													<button
														class="flex-[0.5] btn btn-primary"
														@click=${(e: Event) => {
															e.preventDefault()
															this._filterexcludeindexes = structuredClone(MetadataModel.FilterData(this._queryConditions, this._toastMetadataModelSearchResults!.data!))
														}}
													>
														Filter
													</button>
												</div>
											`
										}
										return nothing
									})()}
									${(() => {
										if (!this._showFilterPanel || this._windowWidth > 1000) {
											return html`
												<div class="flex-[3] border-[1px] border-gray-400 rounded-md h-fit max-h-[70vh] max-w-full flex overflow-hidden">
													<metadata-model-view-table
														.addclickcolumn=${false}
														.multiselectcolumns=${false}
														.addselectcolumn=${false}
														.filterincludeindexes=${this._filterexcludeindexes}
														.metadatamodel=${this._toastMetadataModelSearchResults.metadata_model}
														.data=${this._toastMetadataModelSearchResults.data!}
													></metadata-model-view-table>
												</div>
											`
										}
										return nothing
									})()}
								`
							}
							return nothing
						})()}
					</main>
				</form>
			</dialog>
			<!--toast-notification end-->
			<!--loading-screen start-->
			<dialog id="loading-screen-dialog" class="modal">
				<form method="dialog" class="modal-backdrop min-w-[200px]">
					<div class="flex flex-col justify-center items-center text-xl gap-y-5">
						<div class="flex">
							<span class="loading loading-ball loading-sm text-accent"></span>
							<span class="loading loading-ball loading-md text-secondary"></span>
							<span class="loading loading-ball loading-lg text-primary"></span>
						</div>
						${(() => {
							if (this._loadingMessage) {
								return html` <span class="text-white">${this._loadingMessage}</span> `
							} else {
								return nothing
							}
						})()}
					</div>
				</form>
			</dialog>
			<!--loading-screen end-->
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-context': Component
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
		loading: Lib.ToastType
		/**
		 * If toast message is an array of string, each element will be displayed in a numbered list.
		 */
		loadingMessage: string | null
	}
}

/**
 * Toast Nofitication Event Type.
 */
type ToastNotifyEvent = CustomEvent & {
	detail: {
		/**
		 * Determines background of toast message.
		 */
		toastType: Lib.ToastType
		/**
		 * If toast message is an array of string, each element will be displayed in a numbered list.
		 */
		toastMessage: string | string[]

		toastTitle: string

		toastMetadataModelSearchResults: Entities.MetadataModel.ISearchResults
	}
}
