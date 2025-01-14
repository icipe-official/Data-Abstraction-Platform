import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import pageCss from './page.css?inline'
import '$src/lib/components/intro-poster/component'
import Misc from '$src/lib/miscellaneous'
import Interface from '$src/lib/interface'
import '$src/lib/components/login-screen/component'

@customElement('home-page')
class Page extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(pageCss)]

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth
	}

	private _sessionData: Interface.SessionData | null = null

	connectedCallback(): void {
		super.connectedCallback()
		window.addEventListener('resize', this._handleWindowResize)
		Misc.AddHistoryState(import.meta.env.VITE_LAYOUT_ROUTES, window.location.pathname)
		const sessionData = sessionStorage.getItem(Misc.SharedStorageKey.SESSION_DATA)
		if (sessionData === null) {
			this._sessionData = sessionData
		} else {
			this._sessionData = JSON.parse(sessionData)
		}
	}

	disconnectedCallback(): void {
		window.removeEventListener('resize', this._handleWindowResize)
		super.disconnectedCallback()
	}

	protected render(): unknown {
		return html`
			<section class="flex-1 flex flex-col justify-center overflow-hidden">
				<login-screen class="self-center rounded-lg shadow-md shadow-gray-800 md:max-w-[70%]"></login-screen>
			</section>
			${(() => {
				if (this._windowWidth > 1000) {
					return html`<section class="flex-1 flex flex-col justify-center overflow-hidden p-1"><intro-poster class="bg-white rounded-lg shadow-md shadow-gray-800"></intro-poster></section>`
				} else {
					return nothing
				}
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'home-page': Page
	}
}
