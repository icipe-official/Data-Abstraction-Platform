import { LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'

@customElement('app-context')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss)]

	@property({ type: Object }) data: any | null = null

	connectedCallback(): void {
		super.connectedCallback()
		console.log(this.data)
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-context': Component
	}
}
