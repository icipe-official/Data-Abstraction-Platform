import { html, LitElement, nothing, PropertyValues, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Log from '$src/lib/log'
import 'iconify-icon'
import Misc from '$src/lib/miscellaneous'

interface RenderTracker {
	ContentIntersectionObserved: boolean
	ContentHasBeenInView: boolean
	ContentIntersectionRatio: number
	ContentHeight: number
	ContentWidth: number
}

@customElement('virtual-flex-scroll')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Array }) data!: any[]
	@property({ type: Boolean }) flexcolumn: boolean = true
	@property({ attribute: false }) foreachrowrender!: (datum: any, index: number) => TemplateResult<1>
	@property({ type: Object }) scrollelement!: Element
	@property({ type: Boolean }) enablescrollintoview: boolean = true
	@property({ type: Boolean }) disableremoveitemsoutofview: boolean = true

	private readonly NO_OF_ROWS_TO_ADD: number = 20

	@state() private _rowRenderTrackers: { [type: string]: RenderTracker } = {}

	@state() private _rowStartIndex: number = 0
	@state() private _rowEndIndex: number = 0
	private _rowItemsOutOfView: number[] = []

	@state() private _rowDecrementStartIndexTimeout?: number
	private _rowDecrementStartIndex(startIndex: number) {
		this._rowStartIndex = startIndex - this.NO_OF_ROWS_TO_ADD > 0 ? startIndex - this.NO_OF_ROWS_TO_ADD : 0
		if (this.enablescrollintoview) {
			;(async (previousStartIndex: number) => {
				await new Promise((resolve: (e: Element) => void) => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${previousStartIndex}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${previousStartIndex}`) as Element)
						return
					}

					const observer = new MutationObserver(() => {
						if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${previousStartIndex}`)) {
							resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${previousStartIndex}`) as Element)
							observer.disconnect()
						}
					})

					observer.observe(this.shadowRoot as ShadowRoot, {
						childList: true,
						subtree: true
					})
				})
					.then((e) => {
						e.scrollIntoView({ behavior: 'smooth', block: this.flexcolumn ? 'center' : 'start', inline: this.flexcolumn ? 'nearest' : 'center' })
					})
					.catch((err) => {
						Log.Log(Log.Level.ERROR, this.localName, 'Cannot scroll to item at index', previousStartIndex, 'failed', err)
					})
			})(startIndex + this.NO_OF_ROWS_TO_ADD - 1)
		}
		this._rowDecrementStartIndexTimeout = undefined
	}

	@state() private _rowIncrementEndIndexTimeout?: number
	private _rowIncrementEndIndex(endIndex: number) {
		this._rowEndIndex = endIndex + this.NO_OF_ROWS_TO_ADD < this.data.length ? endIndex + this.NO_OF_ROWS_TO_ADD : this.data.length - 1
		if (this.enablescrollintoview) {
			;(async () => {
				await new Promise((resolve: (e: Element) => void) => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${endIndex}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${endIndex}`) as Element)
						return
					}

					const observer = new MutationObserver(() => {
						if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${endIndex}`)) {
							resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${endIndex}`) as Element)
							observer.disconnect()
						}
					})

					observer.observe(this.shadowRoot as ShadowRoot, {
						childList: true,
						subtree: true
					})
				})
					.then((e) => {
						e.scrollIntoView({ behavior: 'smooth', block: this.flexcolumn ? 'center' : 'start', inline: this.flexcolumn ? 'nearest' : 'center' })
					})
					.catch((err) => {
						Log.Log(Log.Level.ERROR, this.localName, 'Cannot scroll to item at index', endIndex, 'failed', err)
					})
			})()
		}
		this._rowIncrementEndIndexTimeout = undefined
	}

	private _rowStartEndIntersectionobserver!: IntersectionObserver
	private _rowRenderTrackerStartObserved: boolean = false
	private _rowRenderTrackerEndObserved: boolean = false

	private _rowContentItemIntersectionObserver!: IntersectionObserver

	private readonly ROW_RENDER_TRACKER_CONTENT_ID_REGEX = /row-render-tracker-content-item-([0-9]+)/

	protected firstUpdated(_changedProperties: PropertyValues): void {
		this._rowContentItemIntersectionObserver = new IntersectionObserver(
			(entries) => {
				let decrementStartIndex = false
				let incrementEndIndex = false
				for (const entry of entries) {
					const renderItemElementID = this.ROW_RENDER_TRACKER_CONTENT_ID_REGEX.exec(entry.target.id)
					if (renderItemElementID === null) {
						continue
					}

					const itemID = Number(renderItemElementID[1])
					if (typeof this._rowRenderTrackers[itemID] === 'undefined') {
						continue
					}

					this._rowRenderTrackers[itemID].ContentIntersectionRatio = entry.intersectionRatio

					if (this._rowRenderTrackers[itemID].ContentIntersectionRatio > 0) {
						this._rowItemsOutOfView = this._rowItemsOutOfView.filter((itemid) => itemid !== itemID)

						if (this._rowRenderTrackers[itemID].ContentIntersectionRatio === 1) {
							if (!decrementStartIndex) {
								decrementStartIndex = itemID === this._rowStartIndex
								this._rowRenderTrackers[itemID].ContentHasBeenInView = false
							}
							if (!incrementEndIndex) {
								incrementEndIndex = itemID === this._rowEndIndex
								this._rowRenderTrackers[itemID].ContentHasBeenInView = false
							}
							this._rowRenderTrackers[itemID].ContentHasBeenInView = true
						}
					} else {
						if (this._rowRenderTrackers[itemID].ContentHasBeenInView && !this._rowItemsOutOfView.includes(itemID)) {
							this._rowItemsOutOfView.push(itemID)
						}
					}
				}
				try {
					this._rowRenderTrackers = structuredClone(this._rowRenderTrackers)
				} catch (e) {
					console.error(this._rowRenderTrackers, e)
				}
			},
			{
				root: this.scrollelement,
				rootMargin: '100px',
				threshold: [0.0, 0.25, 0.5, 0.75, 1.0]
			}
		)

		this._rowStartEndIntersectionobserver = new IntersectionObserver(
			(entries) => {
				let decrementStartIndex = false
				let incrementEndIndex = false

				for (const entry of entries) {
					const renderStartEnd = /row-render-tracker-(start|end)/.exec(entry.target.id)
					if (renderStartEnd === null) {
						continue
					}

					if (entry.intersectionRatio > 0) {
						switch (renderStartEnd[1]) {
							case 'start':
								if (typeof this._rowDecrementStartIndexTimeout === 'number') {
									break
								}

								if (this._rowStartIndex > 0) {
									decrementStartIndex = true
									if (typeof this._rowIncrementEndIndexTimeout === 'number') {
										window.clearTimeout(this._rowIncrementEndIndexTimeout)
										this._rowIncrementEndIndexTimeout = undefined
									}
								}
								break
							case 'end':
								if (typeof this._rowIncrementEndIndexTimeout === 'number') {
									break
								}

								if (this._rowEndIndex < this.data.length - 1) {
									incrementEndIndex = true
									if (typeof this._rowDecrementStartIndexTimeout === 'number') {
										window.clearTimeout(this._rowDecrementStartIndexTimeout)
										this._rowDecrementStartIndexTimeout = undefined
									}
								}
								break
						}
					}
				}

				if (decrementStartIndex && typeof this._rowDecrementStartIndexTimeout !== 'number') {
					this._rowDecrementStartIndexTimeout = window.setTimeout(() => this._rowDecrementStartIndex(this._rowStartIndex), 200)
				}

				if (incrementEndIndex && typeof this._rowIncrementEndIndexTimeout !== 'number') {
					this._rowIncrementEndIndexTimeout = window.setTimeout(() => this._rowIncrementEndIndex(this._rowEndIndex), 200)
				}

				if (decrementStartIndex || incrementEndIndex) {
					let minStartIndex = this._rowStartIndex
					let maxEndIndex = this._rowEndIndex
					for (const itemID of this._rowItemsOutOfView) {
						if (incrementEndIndex && itemID > minStartIndex && maxEndIndex - itemID >= this.NO_OF_ROWS_TO_ADD) {
							minStartIndex = itemID
							continue
						}

						if (decrementStartIndex && itemID < maxEndIndex && itemID - minStartIndex >= this.NO_OF_ROWS_TO_ADD) {
							maxEndIndex = itemID
							continue
						}
					}

					for (const itemID of structuredClone(this._rowItemsOutOfView)) {
						if (itemID <= minStartIndex || itemID >= maxEndIndex) {
							this._rowItemsOutOfView = this._rowItemsOutOfView.filter((ioovid) => itemID !== ioovid)
							delete this._rowRenderTrackers[itemID]
						}
					}

					for (const key of Object.keys(this._rowRenderTrackers)) {
						const keyNumber = Number(key)
						if (keyNumber < minStartIndex || keyNumber > maxEndIndex) {
							delete this._rowRenderTrackers[keyNumber]
						}
					}

					if (this._rowStartIndex !== minStartIndex) {
						this._rowStartIndex = minStartIndex - 1 > 0 ? minStartIndex - 1 : 0
					}

					if (this._rowEndIndex !== maxEndIndex) {
						this._rowEndIndex = maxEndIndex - 1
					}
				}
			},
			{
				root: this.scrollelement,
				rootMargin: '100px'
			}
		)
	}

	connectedCallback(): void {
		super.connectedCallback()
		if (this.data.length > this.NO_OF_ROWS_TO_ADD) {
			this._rowEndIndex = this.data.length > this.NO_OF_ROWS_TO_ADD ? this.NO_OF_ROWS_TO_ADD : this.data.length
		}

		let currStyle = this.getAttribute('style')
		if (typeof this.scrollelement === 'undefined') {
			this.scrollelement = this
			if (typeof currStyle === 'string') {
				currStyle = `${currStyle} ${this.flexcolumn ? 'overflow-x: hidden; overflow-y: auto; flex-direction: column;' : 'overflow-x: auto; overflow-y: hidden;'}`
			} else {
				currStyle = this.flexcolumn ? 'overflow-x: hidden; overflow-y: auto; flex-direction: column;' : 'overflow-x: auto; overflow-y: hidden;'
			}
		} else {
			if (typeof currStyle === 'string') {
				currStyle = `${currStyle} overflow-x: visible; overflow-y: visible; min-height: fit-content; min-width: fit-content;${this.flexcolumn ? ' flex-direction: column;' : ''}`
			} else {
				currStyle = `overflow-x: visible; overflow-y: visible; min-height: fit-content; min-width: fit-content;${this.flexcolumn ? ' flex-direction: column;' : ''}`
			}
		}
		this.setAttribute('style', currStyle)
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()
		this._rowStartEndIntersectionobserver.disconnect()
		this._rowContentItemIntersectionObserver.disconnect()

		if (typeof this._rowDecrementStartIndexTimeout === 'number') {
			window.clearTimeout(this._rowDecrementStartIndexTimeout)
		}
		if (typeof this._rowIncrementEndIndexTimeout === 'number') {
			window.clearTimeout(this._rowIncrementEndIndexTimeout)
		}
	}

	private _handleClickDecrementStartIndex() {
		if (typeof this._rowDecrementStartIndexTimeout === 'number') {
			window.clearTimeout(this._rowDecrementStartIndexTimeout)
		}

		if (typeof this._rowIncrementEndIndexTimeout === 'number') {
			window.clearTimeout(this._rowIncrementEndIndexTimeout)
		}

		this._rowDecrementStartIndexTimeout = window.setTimeout(() => this._rowDecrementStartIndex(this._rowStartIndex), 500)
	}

	private _handleClickIncrementEndIndex() {
		if (typeof this._rowIncrementEndIndexTimeout === 'number') {
			window.clearTimeout(this._rowIncrementEndIndexTimeout)
		}

		if (typeof this._rowDecrementStartIndexTimeout === 'number') {
			window.clearTimeout(this._rowDecrementStartIndexTimeout)
		}

		this._rowIncrementEndIndexTimeout = window.setTimeout(() => this._rowIncrementEndIndex(this._rowEndIndex), 500)
	}

	protected render(): unknown {
		if (this._rowEndIndex > this.data.length - 1) {
			this._rowEndIndex = this.data.length - 1
		}

		if (!this._rowRenderTrackerStartObserved) {
			;(async () => {
				await new Promise((resolve: (e: Element) => void) => {
					if ((this.shadowRoot as ShadowRoot).querySelector('#row-render-tracker-start')) {
						resolve((this.shadowRoot as ShadowRoot).querySelector('#row-render-tracker-start') as Element)
						return
					}

					const observer = new MutationObserver(() => {
						if ((this.shadowRoot as ShadowRoot).querySelector('#row-render-tracker-start')) {
							resolve((this.shadowRoot as ShadowRoot).querySelector('#row-render-tracker-start') as Element)
							observer.disconnect()
						}
					})

					observer.observe(this.shadowRoot as ShadowRoot, {
						childList: true,
						subtree: true
					})
				}).then((e) => {
					this._rowStartEndIntersectionobserver.observe(e)
					this._rowRenderTrackerStartObserved = true
				})
			})()	
		}

		if (!this._rowRenderTrackerEndObserved) {
			;(async () => {
				await new Promise((resolve: (e: Element) => void) => {
					if ((this.shadowRoot as ShadowRoot).querySelector('#row-render-tracker-end')) {
						resolve((this.shadowRoot as ShadowRoot).querySelector('#row-render-tracker-end') as Element)
						return
					}

					const observer = new MutationObserver(() => {
						if ((this.shadowRoot as ShadowRoot).querySelector('#row-render-tracker-end')) {
							resolve((this.shadowRoot as ShadowRoot).querySelector('#row-render-tracker-end') as Element)
							observer.disconnect()
						}
					})

					observer.observe(this.shadowRoot as ShadowRoot, {
						childList: true,
						subtree: true
					})
				}).then((e) => {
					this._rowStartEndIntersectionobserver.observe(e)
					this._rowRenderTrackerEndObserved = true
				})
			})()
		}

		return html`
			<div id="row-render-tracker-start" class="w-full h-fit flex flex-col justify-center">
				${(() => {
					if (typeof this._rowDecrementStartIndexTimeout === 'number') {
						if (this.flexcolumn) {
							return html`
								<div class="flex flex-col justify-center items-center text-xl space-y-5">
									<div class="flex">
										<span class="loading loading-ball loading-sm text-black"></span>
										<span class="loading loading-ball loading-md text-black"></span>
										<span class="loading loading-ball loading-lg text-black"></span>
									</div>
								</div>
							`
						}

						return html`
							<div class="flex">
								<span class="loading loading-spinner loading-md"></span>
							</div>
						`
					}

					if (this._rowStartIndex > 0) {
						if (this.flexcolumn) {
							return html`
								<div class="divider h-fit">
									<button class="link link-hover" @click=${this._handleClickDecrementStartIndex}>...load previous...</button>
								</div>
							`
						}

						return html` <button @click=${this._handleClickDecrementStartIndex}><iconify-icon icon="mdi:chevron-double-left" style="color: black;" width=${Misc.IconifySize('18')} height=${Misc.IconifySize('18')}></iconify-icon></button> `
					}

					return nothing
				})()}
			</div>
			${(() => {
				let templates: TemplateResult<1>[] = []

				for (let rowIndex = this._rowStartIndex; rowIndex <= this._rowEndIndex; rowIndex++) {
					if (typeof this._rowRenderTrackers[rowIndex] === 'undefined') {
						this._rowRenderTrackers[rowIndex] = {
							ContentIntersectionObserved: false,
							ContentIntersectionRatio: 1,
							ContentHasBeenInView: false,
							ContentHeight: 20,
							ContentWidth: 20
						}
					}

					;(async () => {
						await new Promise((resolve: (e: Element) => void) => {
							if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${rowIndex}`)) {
								resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${rowIndex}`) as Element)
								return
							}

							const observer = new MutationObserver(() => {
								if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${rowIndex}`)) {
									resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${rowIndex}`) as Element)
									observer.disconnect()
								}
							})

							observer.observe(this.shadowRoot as ShadowRoot, {
								childList: true,
								subtree: true
							})
						})
							.then((e) => {
								if (typeof this._rowRenderTrackers[rowIndex] === 'undefined') {
									return
								}

								if (!this._rowRenderTrackers[rowIndex].ContentIntersectionObserved) {
									this._rowContentItemIntersectionObserver.observe(e)
									this._rowRenderTrackers[rowIndex].ContentIntersectionObserved = true
								}
								const eBCR = e.getBoundingClientRect()
								if (eBCR.height > 0) {
									this._rowRenderTrackers[rowIndex].ContentHeight = eBCR.height
								}
								if (eBCR.width > 0) {
									this._rowRenderTrackers[rowIndex].ContentWidth = eBCR.width
								}
							})
							.catch((err) => {
								Log.Log(Log.Level.ERROR, 'Observe item at index', rowIndex, 'failed', err)
							})
					})()

					templates.push(html`
						<div id="row-render-tracker-content-item-${rowIndex}" class="min-w-fit min-h-fit">
							${(() => {
								if (this._rowItemsOutOfView.includes(rowIndex) && !this.disableremoveitemsoutofview) {
									return html`<div style="height: ${this._rowRenderTrackers[rowIndex].ContentHeight}px; width: ${this._rowRenderTrackers[rowIndex].ContentWidth}px;"></div>`
								}

								return this.foreachrowrender(this.data[rowIndex], rowIndex)
							})()}
						</div>
					`)
				}

				return templates
			})()}
			<div id="row-render-tracker-end" class="w-full h-fit flex flex-col justify-center">
				${(() => {
					if (typeof this._rowIncrementEndIndexTimeout === 'number') {
						if (this.flexcolumn) {
							return html`
								<div class="flex flex-col justify-center items-center text-xl space-y-5">
									<div class="flex">
										<span class="loading loading-ball loading-sm text-black"></span>
										<span class="loading loading-ball loading-md text-black"></span>
										<span class="loading loading-ball loading-lg text-black"></span>
									</div>
								</div>
							`
						}

						return html`
							<div class="flex">
								<span class="loading loading-spinner loading-md"></span>
							</div>
						`
					}

					if (this._rowEndIndex < this.data.length - 1) {
						if (this.flexcolumn) {
							return html`
								<div class="divider h-fit">
									<button class="justify-self-end link link-hover font-bold" @click=${this._handleClickIncrementEndIndex}>...load more...</button>
								</div>
							`
						}

						return html` <button @click=${this._handleClickIncrementEndIndex}><iconify-icon icon="mdi:chevron-double-right" style="color: black;" width=${Misc.IconifySize('18')} height=${Misc.IconifySize('18')}></iconify-icon></button> `
					}

					return nothing
				})()}
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'virtual-flex-scroll': Component
	}
}
