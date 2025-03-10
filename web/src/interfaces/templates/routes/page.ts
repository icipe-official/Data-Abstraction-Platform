import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import pageCss from './page.css?inline'
import '@lib/components/intro-poster/component'
import '@lib/components/log-in/component'

@customElement('home-page')
class Page extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(pageCss)]

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth
	}

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
				<log-in class="self-center rounded-lg shadow-md shadow-gray-800 max-w-[95%]"></log-in>
			</section>
			${(() => {
				if (this._windowWidth > 1200) {
					return html`<section class="flex-1 flex flex-col justify-center overflow-hidden p-1"><intro-poster class="bg-white rounded-lg shadow-md shadow-gray-800"></intro-poster></section>`
				}
				
				return nothing
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'home-page': Page
	}
}
