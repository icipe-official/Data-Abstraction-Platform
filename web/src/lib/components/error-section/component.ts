import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'

/**
 * Component displays an error with the code and message.
 */
@customElement('error-section')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Number }) errorcode: number = 0
	@property({ type: String }) errormessage: string = 'NO ERROR MESSAGE'

	protected render(): unknown {
		return html`
			<div class="flex flex-col gap-y-2 self-center">
				<div class="w-full text-lg text-error">Error</div>
				<div class="text-xl w-full text-center text-error">${this.errorcode}</div>
			</div>
			<div class="divider divider-horizontal"></div>
			<div class="text-md w-full text-center h-fit self-center text-error break-words">${this.errormessage}</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'error-section': Component
	}
}
