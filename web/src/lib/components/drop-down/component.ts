import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'

@customElement('drop-down')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss)]

	@property({ type: Boolean }) showdropdown: boolean = false

	private _headerElement!: Element

	private _contentElement!: Element
	@state() private _contentElementTopBottomFixedPosition: string = 'top'
	@state() private _contentElementTopBottomPosition: number = 0

	@state() private _contentElementLeftRightFixedPosition: string = 'left'
	@state() private _contentElementLeftRightPosition: number = 0

	private _contentPositionInterval: number | undefined

	private _handleUpdateContentPosition() {
		if (typeof this._headerElement !== 'undefined' && typeof this._contentElement !== 'undefined') {
			const headerBoundingClientRect = this._headerElement.getBoundingClientRect()
			const contentBoundingClientRect = this._contentElement.getBoundingClientRect()
			if (window.innerHeight - headerBoundingClientRect.bottom > contentBoundingClientRect.bottom - contentBoundingClientRect.top) {
				this._contentElementTopBottomFixedPosition = 'top'
				this._contentElementTopBottomPosition = headerBoundingClientRect.bottom + 1
			} else {
				this._contentElementTopBottomFixedPosition = 'bottom'
				this._contentElementTopBottomPosition = window.innerHeight - headerBoundingClientRect.top + 1
			}
			if (window.innerWidth - headerBoundingClientRect.left > contentBoundingClientRect.right - contentBoundingClientRect.left) {
				this._contentElementLeftRightFixedPosition = 'left'
				this._contentElementLeftRightPosition = headerBoundingClientRect.left
			} else {
				this._contentElementLeftRightFixedPosition = 'right'
				this._contentElementLeftRightPosition = window.innerWidth - headerBoundingClientRect.right
			}
		}
	}

	disconnectedCallback(): void {
		if (typeof this._contentPositionInterval === 'number') {
			window.clearInterval(this._contentPositionInterval)
		}
		super.disconnectedCallback()
	}

	protected render(): unknown {
		return html`
			<div class="flex flex-col">
				<div id="header">
					${(() => {
						if (typeof this._headerElement === 'undefined') {
							;(async () => {
								await new Promise((resolve: (e: Element) => void) => {
									if ((this.shadowRoot as ShadowRoot).querySelector('#header')) {
										resolve((this.shadowRoot as ShadowRoot).querySelector('#header') as Element)
										return
									}

									const observer = new MutationObserver(() => {
										if ((this.shadowRoot as ShadowRoot).querySelector('#header')) {
											resolve((this.shadowRoot as ShadowRoot).querySelector('#header') as Element)
											observer.disconnect()
										}
									})

									observer.observe(this.shadowRoot as ShadowRoot, {
										childList: true,
										subtree: true
									})
								}).then((e) => {
									this._headerElement = e
								})
							})()
						}

						return html` <slot name="header"></slot>`
					})()}
				</div>
				<div id="content" class="fixed" style="${this._contentElementTopBottomFixedPosition}: ${this._contentElementTopBottomPosition}px; ${this._contentElementLeftRightFixedPosition}: ${this._contentElementLeftRightPosition}px;z-index: 99999999999999999999999999;">
					${(() => {
						if (typeof this._contentElement === 'undefined') {
							;(async () => {
								await new Promise((resolve: (e: Element) => void) => {
									if ((this.shadowRoot as ShadowRoot).querySelector('#content')) {
										resolve((this.shadowRoot as ShadowRoot).querySelector('#content') as Element)
										return
									}

									const observer = new MutationObserver(() => {
										if ((this.shadowRoot as ShadowRoot).querySelector('#content')) {
											resolve((this.shadowRoot as ShadowRoot).querySelector('#content') as Element)
											observer.disconnect()
										}
									})

									observer.observe(this.shadowRoot as ShadowRoot, {
										childList: true,
										subtree: true
									})
								}).then((e) => {
									this._contentElement = e
									this._handleUpdateContentPosition()
								})
							})()
						}

						if (this.showdropdown) {
							this._contentPositionInterval = window.setInterval(() => this._handleUpdateContentPosition(), 50)
							return html` <slot name="content"></slot>`
						}

						if (typeof this._contentPositionInterval === 'number') {
							window.clearInterval(this._contentPositionInterval)
							this._contentPositionInterval = undefined
						}

						return nothing
					})()}
				</div>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'drop-down': Component
	}
}
