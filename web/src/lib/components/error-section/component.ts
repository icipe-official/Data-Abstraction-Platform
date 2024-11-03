import { LitElement, html, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import tailwindCss from '$src/assets/index.css?inline'
import errorSectionCss from './component.css?inline'

/**
 * Component displays an error with the code and message.
 */
@customElement('error-section')
class ErrorSection extends LitElement {
	static styles = [unsafeCSS(tailwindCss), unsafeCSS(errorSectionCss)]

	@property({ type: Number }) errorcode: number = 0
	@property() errormessage: string = 'NO ERROR MESSAGE'

	protected render(): unknown {
		return html`
			<div class="flex flex-col space-y-2 self-center">
				<div class="w-full text-lg text-error">Error</div>
				<div class="text-xl w-full text-center text-error">${this.errorcode}</div>
			</div>
			<div class="divider divider-horizontal"></div>
			<div class="text-md w-full text-center h-fit self-center text-neutral break-words">${this.errormessage}</div>
		`
	}
}
declare global {
	interface HTMLElementTagNameMap {
		'error-section': ErrorSection
	}
}
