import { LitElement, unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import logo from '@assets/logo.png'
import layoutCss from './layout.css?inline'

@customElement('group-id-navigation-bar')
class Layout extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(layoutCss)]
}

declare global {
	interface HTMLElementTagNameMap {
		'group-id-navigation-bar': Layout
	}
}
