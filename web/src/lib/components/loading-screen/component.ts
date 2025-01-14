import Interface from "$src/lib/interface"
import Misc from "$src/lib/miscellaneous"
import { LitElement, unsafeCSS, html, nothing } from "lit"
import { customElement, property, state } from "lit/decorators.js"
import indexCss from '$src/assets/index.css?inline'

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
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss)]

	@property({ type: Object }) data: Interface.SessionData | null = null

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
		sessionStorage.setItem(Misc.SharedStorageKey.SESSION_DATA, JSON.stringify(this.data))
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
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'loading-screen': Component
	}
}
