import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import pageCss from './page.css?inline'
import '@lib/components/intro-poster/component'
import Lib from '@lib/lib'
import Interface from '@lib/interface'
import '@lib/components/login-screen/component'

@customElement('home-page')
class Page extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(pageCss)]

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth
	}

	//open id context

	connectedCallback(): void {
		super.connectedCallback()
		window.addEventListener('resize', this._handleWindowResize)
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
