import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'

@customElement('drop-down')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss)]

	@property({ type: Boolean }) showdropdowncontent: boolean = true

	private _headerElement!: Element

	private _contentElement: Element | undefined
	private _contentElements: Element[] | undefined
	@state() private _contentElementTopBottomFixedPosition: string = 'top'
	@state() private _contentElementTopBottomPosition: number = -window.innerHeight / 2

	@state() private _contentElementLeftRightFixedPosition: string = 'left'
	@state() private _contentElementLeftRightPosition: number = -window.innerWidth / 2

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

	private _contentElementID: string = 'dropdown-content-'

	@state() private _headerIsFocused: boolean = false
	@state() private _contentIsFocused: boolean = false

	connectedCallback(): void {
		super.connectedCallback()
		let randomContentID = new Int32Array(1)
		window.crypto.getRandomValues(randomContentID)
		this._contentElementID = this._contentElementID + randomContentID[0].toString()
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()
		this._removeContentFromView()
		this._contentElement = undefined
		if (typeof this._removeContentFromViewTimeout === 'number') {
			window.clearTimeout(this._removeContentFromViewTimeout)
		}
	}

	private _removeContentFromView() {
		if (typeof this._contentPositionInterval === 'number') {
			window.clearInterval(this._contentPositionInterval)
			this._contentPositionInterval = undefined
		}
		if (document.body.querySelector(`#${this._contentElementID}`) && this._contentElement) {
			document.body.removeChild(this._contentElement)
		}
	}

	private _removeContentFromViewTimeout: number | undefined
	private _newHeaderIsFocused?: boolean
	private _newContentIsFocused?: boolean

	private _handleFocusUpdate(_headerIsFocused?: boolean, _contentIsFocused?: boolean) {
		if (typeof _headerIsFocused === 'boolean') {
			if (!_headerIsFocused && !this._contentIsFocused) {
				this._newHeaderIsFocused = _headerIsFocused
				this._removeContentFromViewTimeout = window.setTimeout(() => {
					this._headerIsFocused = this._newHeaderIsFocused as boolean
					this._updateShowdropdownContent()
				}, 30)
				return
			}
			this._headerIsFocused = _headerIsFocused
			if (typeof this._newContentIsFocused === 'boolean') {
				this._contentIsFocused = this._newContentIsFocused
				this._newContentIsFocused = undefined
			}
		}
		if (typeof _contentIsFocused === 'boolean') {
			if (!this._headerIsFocused && !_contentIsFocused) {
				this._newContentIsFocused = _contentIsFocused
				this._removeContentFromViewTimeout = window.setTimeout(() => {
					this._contentIsFocused = this._newContentIsFocused as boolean
					this._updateShowdropdownContent()
				}, 30)
				return
			}
			this._contentIsFocused = _contentIsFocused
			if (typeof this._newHeaderIsFocused === 'boolean') {
				this._headerIsFocused = this._newHeaderIsFocused
				this._newHeaderIsFocused = undefined
			}
		}

		if (typeof this._removeContentFromViewTimeout === 'number') {
			window.clearTimeout(this._removeContentFromViewTimeout)
		}
	}

	private _updateShowdropdownContent() {
		this.dispatchEvent(
			new CustomEvent('drop-down:showdropdowncontentupdate', {
				detail: {
					value: this._headerIsFocused || this._contentIsFocused
				}
			})
		)
	}

	protected render(): unknown {
		if (typeof this._contentElement !== 'undefined' && typeof this._contentElements === 'undefined') {
			;(async () => {
				await new Promise((resolve: (e: HTMLSlotElement) => void) => {
					if ((this.shadowRoot as ShadowRoot).querySelector('slot[name=content]')) {
						resolve((this.shadowRoot as ShadowRoot).querySelector('slot[name=content]') as HTMLSlotElement)
						return
					}

					const observer = new MutationObserver(() => {
						if ((this.shadowRoot as ShadowRoot).querySelector('slot[name=content]')) {
							resolve((this.shadowRoot as ShadowRoot).querySelector('slot[name=content]') as HTMLSlotElement)
							observer.disconnect()
						}
					})

					observer.observe(this.shadowRoot as ShadowRoot, {
						childList: true,
						subtree: true
					})
				}).then((e) => {
					this._contentElements = e.assignedElements()
				})
			})()
		}

		return html`
			<div
				id="header"
				@focusin=${() => {
					this._handleFocusUpdate(true)
				}}
				@focusout=${() => {
					this._handleFocusUpdate(false)
				}}
			>
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
			<div
				id="${this._contentElementID}"
				class="fixed max-w-fit max-h-fit"
				style="${(this._headerIsFocused || this._contentIsFocused) && this.showdropdowncontent && this._contentElementTopBottomPosition >= 0 && this._contentElementLeftRightPosition >= 0 ? '' : 'visibility: hidden;'} ${this._contentElementTopBottomFixedPosition}: ${this
					._contentElementTopBottomPosition}px; ${this._contentElementLeftRightFixedPosition}: ${this._contentElementLeftRightPosition}px;z-index: 999;"
				@focusin=${() => {
					this._handleFocusUpdate(undefined, true)
				}}
				@focusout=${() => {
					this._handleFocusUpdate(undefined, false)
				}}
			>
				<slot name="content"></slot>
				${(() => {
					if (typeof this._contentElement === 'undefined') {
						;(async () => {
							await new Promise((resolve: (e: Element) => void) => {
								if ((this.shadowRoot as ShadowRoot).querySelector(`#${this._contentElementID}`)) {
									resolve((this.shadowRoot as ShadowRoot).querySelector(`#${this._contentElementID}`) as Element)
									return
								}

								const observer = new MutationObserver(() => {
									if ((this.shadowRoot as ShadowRoot).querySelector(`#${this._contentElementID}`)) {
										resolve((this.shadowRoot as ShadowRoot).querySelector(`#${this._contentElementID}`) as Element)
										observer.disconnect()
									}
								})

								observer.observe(this.shadowRoot as ShadowRoot, {
									childList: true,
									subtree: true
								})
							}).then((e) => {
								this._contentElement = e
							})
						})()
					}

					// if (true) {
					if ((this._headerIsFocused || this._contentIsFocused) && this.showdropdowncontent) {
						if (typeof this._contentPositionInterval !== 'number') {
							this._contentPositionInterval = window.setInterval(() => this._handleUpdateContentPosition(), 50)
						}
						if (!document.body.querySelector(`#${this._contentElementID}`) && this._contentElement && Array.isArray(this._contentElements)) {
							document.body.appendChild(this._contentElement)
							this._contentElement.append(...this._contentElements)
						}

						return nothing
					}

					this._removeContentFromView()

					return nothing
				})()}
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'drop-down': Component
	}
}
