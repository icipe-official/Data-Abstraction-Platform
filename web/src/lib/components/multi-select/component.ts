import { LitElement, PropertyValues, TemplateResult, html, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import 'iconify-icon'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import componentRenderOptionsCss from './component.renderoptions.css?inline'
import Log from '$src/lib/log'
import Misc from '$src/lib/miscellaneous'
import Theme from '$src/lib/theme'

interface SelectOption {
	label: string
	value: any
}

/**
 * Component offers a dropdown list of options that can be select once or twice.
 */
@customElement('multi-select')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property() placeholder: string = 'Search...'
	@property({ type: Array }) selectoptions: SelectOption[] = []
	@property({ type: Object }) selectedoptions: SelectOption[] | SelectOption | null = null
	@property({ type: Boolean }) multiselect: boolean = false
	@property({ type: String }) color: Theme.Color = Theme.Color.PRIMARY
	@property({ type: Number }) maxselectedoptions: number = 0
	@property({ type: Boolean }) disabled: boolean = false

	@state() private _showSelectOptions: boolean = false
	@state() private _componentFocused: boolean = false
	@state() private _selectSearchQuery: string = ''
	@state() private _selectSearchOptions: number[] = []

	private _focusSelectInputSearchField(e: MouseEvent) {
		e.preventDefault()
		// // Log.Log(Log.Level.DEBUG, this.localName, this._focusSelectInputSearchField.name, 'Focusing select input search field')
		if (this._componentFocused) return
		this._componentFocused = true
		this._showSelectOptions = true
		;(this.shadowRoot?.querySelector('.hs-multi-select-input-field') as HTMLInputElement).focus()
		// // Log.Log(Log.Level.DEBUG, this.localName, this._focusSelectInputSearchField.name, 'select input search field focuse')
	}

	connectedCallback(): void {
		super.connectedCallback()
		if (!this.multiselect && this.selectedoptions !== null && typeof this.selectedoptions === 'object' && !Array.isArray(this.selectedoptions) && (this.selectedoptions as SelectOption).label) {
			this._selectSearchQuery = (this.selectedoptions as SelectOption).label
		}
		this.addEventListener('mousedown', (e) => this._focusSelectInputSearchField(e))
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()
		this.removeEventListener('mousedown', this._focusSelectInputSearchField)
	}

	protected render(): unknown {
		return html`
			<header class="h-full w-full overflow-y-auto max-h-[200px] overflow-x-hidden flex flex-wrap input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} border-none rounded-none">
				${(() => {
					if (this.multiselect && Array.isArray(this.selectedoptions)) {
						return this.selectedoptions.map((so) => {
							return html`
								<div class="p-[4px] flex justify-between rounded-lg  ${this.color === Theme.Color.PRIMARY ? ' bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? ' bg-secondary text-secondary-content' : ' bg-accent text-accent-content'} h-fit w-fit m-[2px] min-w-[50px]">
									<span class="self-center h-fit w-fit">${so.label}</span>
									${(() => {
										if (!this.disabled) {
											return html`
												<button
													class="btn btn-circle btn-ghost w-fit min-h-fit max-h-[21px] p-0 self-center"
													@click=${(_: Event) => {
														// Log.Log(Log.Level.DEBUG, this.localName, _, so, 'Remove select option')
														this.selectedoptions = (this.selectedoptions as SelectOption[]).filter((seo) => seo.label !== so.label && seo.value !== so.value)
														// Log.Log(Log.Level.DEBUG, this.localName, _, this.selectedoptions, 'Updated select options')
														this.dispatchEvent(
															new CustomEvent('multi-select:deleteselectedoptions', {
																detail: {
																	value: so
																}
															})
														)
														this.dispatchEvent(
															new CustomEvent('multi-select:updateselectedoptions', {
																detail: {
																	value: this.selectedoptions
																}
															})
														)
													}}
												>
													<iconify-icon
														icon="mdi:close-thick"
														style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
														width=${Misc.IconifySize('20')}
														height=${Misc.IconifySize('20')}
													></iconify-icon>
												</button>
											`
										} else {
											return nothing
										}
									})()}
								</div>
							`
						})
					} else {
						return nothing
					}
				})()}
				<div class="flex-1 flex justify-between m-[2px] min-w-[200px] w-full">
					<input
						class="hs-multi-select-input-field flex-[9] w-full border-none p-1 border-0"
						style="outline:none;"
						type="text"
						.value=${this._selectSearchQuery}
						.placeholder=${`${this.placeholder} ${this.multiselect && this.maxselectedoptions > 0 ? `(MAX ${this.maxselectedoptions})` : ''}`}
						@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
							if (!this._componentFocused) {
								this._componentFocused = true
							}

							this._selectSearchQuery = e.currentTarget.value
							this._selectSearchOptions = []
							if (this._selectSearchQuery.length > 0) {
								this.selectoptions.forEach((so, index) => {
									if (so.label.toLowerCase().includes(this._selectSearchQuery.toLowerCase())) {
										this._selectSearchOptions = [...this._selectSearchOptions, index]
									}
								})
							} else {
								this._selectSearchOptions = []
							}
							// // Log.Log(Log.Level.DEBUG, this.localName, e, this._selectSearchOptions, 'Searched select options')
						}}
						@focusout=${() => {
							// // Log.Log(Log.Level.DEBUG, this.localName, 'Unfocusing select input search field')
							this._componentFocused = false
							this._showSelectOptions = false
						}}
					/>
					<button
						class="btn btn-circle btn-ghost w-fit min-h-fit max-h-[26px] p-0 self-center"
						@click=${() => {
							this._selectSearchOptions = []
							if (this.multiselect) {
								this._selectSearchQuery = ''
							} else {
								if (this.selectedoptions !== null && !Array.isArray(this.selectedoptions)) {
									this._selectSearchQuery = this.selectedoptions.label
								}
							}
						}}
					>
						<iconify-icon icon="mdi:close" style="color:${this.color};" width=${Misc.IconifySize('25')} height=${Misc.IconifySize('25')}></iconify-icon>
					</button>
					${(() => {
						if (!this.disabled) {
							return html`
								<button
									class="btn btn-circle btn-ghost w-fit min-h-fit max-h-[26px] p-0 self-center"
									@click=${() => {
										this.selectedoptions = null
										this.dispatchEvent(
											new CustomEvent('multi-select:deleteselectedoptions', {
												detail: {
													value: this.selectedoptions
												}
											})
										)
										this.dispatchEvent(
											new CustomEvent('multi-select:updateselectedoptions', {
												detail: {
													value: this.selectedoptions
												}
											})
										)
									}}
								>
									<iconify-icon icon="mdi:delete" style="color:${this.color};" width=${Misc.IconifySize('25')} height=${Misc.IconifySize('25')}></iconify-icon>
								</button>
							`
						} else {
							return nothing
						}
					})()}
				</div>
			</header>
			<main class="relative h-0">
				${(() => {
					if (this._showSelectOptions) {
						return html`
							<multi-select-render-options
								class="mt-3 absolute rounded-lg bg-white shadow-md shadow-gray-800 p-1 w-full top-0"
								.selectoptions=${this.selectoptions.filter((so, index) => {
									if (this.selectedoptions !== null && typeof this.selectedoptions === 'object') {
										if (Array.isArray(this.selectedoptions)) {
											for (let seo of this.selectedoptions) {
												if (seo.label === so.label && seo.value === so.value) {
													return false
												}
											}
										} else {
											if ((this.selectedoptions as SelectOption).label === so.label && (this.selectedoptions as SelectOption).value === so.value) {
												return false
											}
										}
									}
									return this._selectSearchOptions.length === 0 || this._selectSearchOptions.includes(index)
								})}
								.color=${this.color}
								.addselectedoptions=${(so: SelectOption) => {
									// // Log.Log(Log.Level.DEBUG, this.localName, so, 'Add select option')
									if (this.multiselect) {
										if (Array.isArray(this.selectedoptions)) {
											for (let seo of this.selectedoptions) {
												if (seo.value === so.value && seo.label === so.label) {
													return
												}
											}
											this.selectedoptions = [...this.selectedoptions, so]
										} else {
											this.selectedoptions = [so]
										}
									} else {
										this.selectedoptions = so
										this._selectSearchQuery = so.label
									}
									// // Log.Log(Log.Level.DEBUG, this.localName, this.selectedoptions, 'Updated select options')
									this.dispatchEvent(
										new CustomEvent('multi-select:addselectedoptions', {
											detail: {
												value: so
											}
										})
									)
									this.dispatchEvent(
										new CustomEvent('multi-select:updateselectedoptions', {
											detail: {
												value: this.selectedoptions
											}
										})
									)
								}}
								.noofselectedoptions=${Array.isArray(this.selectedoptions) ? this.selectedoptions.length : 0}
								.maxselectedoptions=${this.maxselectedoptions}
								.disabled=${this.disabled}
							></multi-select-render-options>
						`
					} else {
						return nothing
					}
				})()}
			</main>
		`
	}
}

interface RenderTracker {
	ContentIntersectionObserved: boolean
	ContentHasBeenInView: boolean
	ContentIntersectionRatio: number
}

@customElement('multi-select-render-options')
class ComponentRenderOptions extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentRenderOptionsCss)]

	@property({ type: Array }) selectoptions!: SelectOption[]
	@property({ type: String }) color: Theme.Color = Theme.Color.PRIMARY
	@property({ attribute: false }) addselectedoptions!: (so: SelectOption) => void
	@property({ type: Number }) noofselectedoptions!: number
	@property({ type: Number }) maxselectedoptions!: number
	@property({ type: Boolean }) disabled!: boolean

	private readonly NO_OF_RENDER_CONTENT_TO_ADD: number = 20

	private _renderTrackers: { [type: string]: RenderTracker } = {}
	@state() private _startIndex: number = 0
	@state() private _endIndex: number = 0
	private _itemsOutOfView: number[] = []

	@state() private _startAddContentTimeout?: number
	private _addContentAtStartPosition(startIndex: number) {
		this._startIndex = startIndex - this.NO_OF_RENDER_CONTENT_TO_ADD > 0 ? startIndex - this.NO_OF_RENDER_CONTENT_TO_ADD : 0
		;(async (psi: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${psi - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${psi - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${psi - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${psi - 2}`) as Element)
						observer.disconnect()
					}
				})

				observer.observe(this.shadowRoot as ShadowRoot, {
					childList: true,
					subtree: true
				})
			})
				.then((e) => {
					e.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
				})
				.catch((err) => {
					Log.Log(Log.Level.ERROR, this.localName, 'Cannot scroll to item at index', psi - 2, 'failed', err)
				})
		})(startIndex)

		this._startAddContentTimeout = undefined
	}

	private _addContentAtEndPosition(endIndex: number) {
		this._endIndex = endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD < this._currentNumberOfRenderContent ? endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD : this._currentNumberOfRenderContent - 1

		;(async (pei: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${pei - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${pei - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${pei - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${pei - 2}`) as Element)
						observer.disconnect()
					}
				})

				observer.observe(this.shadowRoot as ShadowRoot, {
					childList: true,
					subtree: true
				})
			})
				.then((e) => {
					e.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
				})
				.catch((err) => {
					Log.Log(Log.Level.ERROR, this.localName, 'Cannot scroll to item at index', pei - 2, 'failed', err)
				})
		})(endIndex)

		this._endAddContentTimeout = undefined
	}

	@state() private _endAddContentTimeout?: number

	private _startEndIntersectionobserver!: IntersectionObserver
	private _contentItemIntersectionObserver!: IntersectionObserver

	private readonly RENDER_ITEM_CONTENT_ELEMENT_ID_REGEX = /render-tracker-content-item-([0-9]+)/

	protected firstUpdated(_changedProperties: PropertyValues): void {
		this._startEndIntersectionobserver = new IntersectionObserver(
			(entries) => {
				let decrementStartIndex = false
				let incrementEndIndex = false

				for (const entry of entries) {
					const renderStartEnd = /render-tracker-(start|end)/.exec(entry.target.id)
					if (renderStartEnd === null) {
						continue
					}
					// // Log.Log(Log.Level.DEBUG, this.localName, 'before', entry.target.id, entry.intersectionRatio, this._startIndex, this._endIndex)
					// // Log.Log(Log.Level.DEBUG, this.localName, 'before', entry.target.id, entry.intersectionRatio, JSON.parse(JSON.stringify(this._renderTrackers)), JSON.parse(JSON.stringify(this._itemsOutOfView)))
					if (entry.intersectionRatio > 0) {
						switch (renderStartEnd[1]) {
							case 'start':
								if (typeof this._startAddContentTimeout === 'number') {
									break
								}

								if (this._startIndex > 0) {
									decrementStartIndex = true
									if (typeof this._endAddContentTimeout === 'number') {
										window.clearTimeout(this._endAddContentTimeout)
										this._endAddContentTimeout = undefined
									}
								}
								break
							case 'end':
								if (typeof this._endAddContentTimeout === 'number') {
									break
								}

								if (this._endIndex < this._currentNumberOfRenderContent - 1) {
									incrementEndIndex = true
									if (typeof this._startAddContentTimeout === 'number') {
										window.clearTimeout(this._startAddContentTimeout)
										this._startAddContentTimeout = undefined
									}
								}
								break
						}
					}
				}

				if (decrementStartIndex) {
					if (typeof this._startAddContentTimeout !== 'number') {
						this._startAddContentTimeout = window.setTimeout(() => this._addContentAtStartPosition(this._startIndex), 500)
					}
				}

				if (incrementEndIndex) {
					if (typeof this._endAddContentTimeout !== 'number') {
						this._endAddContentTimeout = window.setTimeout(() => this._addContentAtEndPosition(this._endIndex), 500)
					}
				}

				if (this._itemsOutOfView.length > 0) {
					let minStartIndex = this._startIndex
					let maxEndIndex = this._endIndex
					for (const itemID of this._itemsOutOfView) {
						if (incrementEndIndex && itemID > minStartIndex && maxEndIndex - itemID >= this.NO_OF_RENDER_CONTENT_TO_ADD) {
							minStartIndex = itemID
							continue
						}

						if (decrementStartIndex && itemID < maxEndIndex && itemID - minStartIndex >= this.NO_OF_RENDER_CONTENT_TO_ADD) {
							maxEndIndex = itemID
							continue
						}
					}

					for (const itemID of JSON.parse(JSON.stringify(this._itemsOutOfView)) as number[]) {
						if (itemID <= minStartIndex || itemID >= maxEndIndex) {
							this._itemsOutOfView = this._itemsOutOfView.filter((ioovid) => itemID !== ioovid)
							delete this._renderTrackers[itemID]
						}
					}

					for (const key of Object.keys(this._renderTrackers)) {
						const keyNumber = Number(key)
						if (keyNumber < minStartIndex || keyNumber > maxEndIndex) {
							delete this._renderTrackers[keyNumber]
						}
					}

					if (this._startIndex !== minStartIndex) {
						this._startIndex = minStartIndex - 1 > 0 ? minStartIndex - 1 : 0
					}

					if (this._endIndex !== maxEndIndex) {
						this._endIndex = maxEndIndex - 1
					}
				}
			},
			{
				root: this
			}
		)
		this._startEndIntersectionobserver.observe((this.shadowRoot as ShadowRoot).querySelector('#render-tracker-start') as Element)
		this._startEndIntersectionobserver.observe((this.shadowRoot as ShadowRoot).querySelector('#render-tracker-end') as Element)

		this._contentItemIntersectionObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const renderItemElementID = this.RENDER_ITEM_CONTENT_ELEMENT_ID_REGEX.exec(entry.target.id)
					if (renderItemElementID === null) {
						continue
					}

					const itemID = Number(renderItemElementID[1])
					if (typeof this._renderTrackers[itemID] === 'undefined') {
						continue
					}

					this._renderTrackers[itemID].ContentIntersectionRatio = entry.intersectionRatio

					if (this._renderTrackers[itemID].ContentIntersectionRatio > 0) {
						if (this._itemsOutOfView.includes(itemID)) {
							this._itemsOutOfView = this._itemsOutOfView.filter((itemid) => itemid !== itemID)
						}

						if (this._renderTrackers[itemID].ContentIntersectionRatio === 1) {
							this._renderTrackers[itemID].ContentHasBeenInView = true
						}
					} else {
						if (this._renderTrackers[itemID].ContentHasBeenInView && !this._itemsOutOfView.includes(itemID)) {
							this._itemsOutOfView = [...this._itemsOutOfView, itemID]
						}
					}
				}
			},
			{
				root: this,
				rootMargin: '500px',
				threshold: [0.0, 0.25, 0.5, 0.75, 1.0]
			}
		)
	}

	@state() private _currentNumberOfRenderContent: number = 0

	disconnectedCallback(): void {
		super.disconnectedCallback()
		this._startEndIntersectionobserver.disconnect()
		this._contentItemIntersectionObserver.disconnect()
		if (typeof this._startAddContentTimeout === 'number') {
			window.clearTimeout(this._startAddContentTimeout)
		}
		if (typeof this._endAddContentTimeout === 'number') {
			window.clearTimeout(this._endAddContentTimeout)
		}
	}

	protected render(): unknown {
		if (this.selectoptions.length !== this._currentNumberOfRenderContent) {
			this._currentNumberOfRenderContent = this.selectoptions.length

			this._startIndex = 0
			if (typeof this._startAddContentTimeout === 'number') {
				window.clearTimeout(this._startAddContentTimeout)
				this._startAddContentTimeout = undefined
			}
			if (typeof this._endAddContentTimeout === 'number') {
				window.clearTimeout(this._endAddContentTimeout)
				this._endAddContentTimeout = undefined
			}

			this._endIndex = this._currentNumberOfRenderContent < this.NO_OF_RENDER_CONTENT_TO_ADD ? this._currentNumberOfRenderContent - 1 : this.NO_OF_RENDER_CONTENT_TO_ADD
			for (let i = 0; i <= this._endIndex; i++) {
				this._renderTrackers[i] = {
					ContentIntersectionObserved: false,
					ContentIntersectionRatio: 0,
					ContentHasBeenInView: false
				}
			}
			this._itemsOutOfView = []
		}

		return html`
			<div id="render-tracker-start" class="w-full h-fit flex flex-col justify-center">
				${(() => {
					if (typeof this._startAddContentTimeout === 'number') {
						return html`
							<div class="justify-self-end flex flex-col justify-center items-center text-xl space-y-5">
								<div class="flex">
									<span class="loading loading-ball loading-sm text-accent"></span>
									<span class="loading loading-ball loading-md text-secondary"></span>
									<span class="loading loading-ball loading-lg text-primary"></span>
								</div>
							</div>
						`
					} else if (this._startIndex > 0) {
						return html`
							<div class="divider h-fit">
								<button
									class="justify-self-end link link-hover"
									@click=${() => {
										if (typeof this._startAddContentTimeout === 'number') {
											window.clearTimeout(this._startAddContentTimeout)
										}

										if (typeof this._endAddContentTimeout === 'number') {
											window.clearTimeout(this._endAddContentTimeout)
										}

										this._startAddContentTimeout = window.setTimeout(() => this._addContentAtStartPosition(this._startIndex), 500)
									}}
								>
									...load previous...
								</button>
							</div>
						`
					} else {
						return nothing
					}
				})()}
			</div>
			${(() => {
				let templates: TemplateResult<1>[] = []

				for (let index = this._startIndex; index <= this._endIndex; index++) {
					if (typeof this._renderTrackers[index] === 'undefined') {
						this._renderTrackers[index] = {
							ContentIntersectionObserved: false,
							ContentIntersectionRatio: 0,
							ContentHasBeenInView: false
						}
					}

					;(async (Index: number) => {
						await new Promise((resolve: (e: Element) => void) => {
							if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${Index}`)) {
								resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${Index}`) as Element)
								return
							}

							const observer = new MutationObserver(() => {
								if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${Index}`)) {
									resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${Index}`) as Element)
									observer.disconnect()
								}
							})

							observer.observe(this.shadowRoot as ShadowRoot, {
								childList: true,
								subtree: true
							})
						})
							.then((e) => {
								if (typeof this._renderTrackers[Index] === 'undefined') {
									return
								}
								if (!this._renderTrackers[Index].ContentIntersectionObserved) {
									this._contentItemIntersectionObserver.observe(e)
									this._renderTrackers[Index].ContentIntersectionObserved = true
								}
							})
							.catch((err) => {
								Log.Log(Log.Level.ERROR, 'Observed item at index', Index, 'failed', err)
							})
					})(index)

					templates.push(
						html`<button
							id="render-tracker-content-item-${index}"
							class="w-full p-1 text-left ${this.color === Theme.Color.PRIMARY ? 'hover:bg-primary hover:text-primary-content' : this.color === Theme.Color.SECONDARY ? 'hover:bg-secondary hover:text-secondary-content' : 'hover:bg-accent hover:text-accent-content'} disabled:hover:bg-white"
							@click=${() => {
								if (this.addselectedoptions) {
									this.addselectedoptions(this.selectoptions[index])
								}
							}}
							.disabled=${this.disabled || (this.maxselectedoptions > 0 ? (this.noofselectedoptions > 0 && this.maxselectedoptions === this.noofselectedoptions ? true : false) : false)}
						>
							${this.selectoptions[index].label}
						</button>`
					)
				}

				return templates
			})()}
			<div id="render-tracker-end" class="w-full h-fit flex flex-col justify-center">
				${(() => {
					if (typeof this._endAddContentTimeout === 'number') {
						return html`
							<div class="justify-self-end flex flex-col justify-center items-center text-xl space-y-5">
								<div class="flex">
									<span class="loading loading-ball loading-sm text-accent"></span>
									<span class="loading loading-ball loading-md text-secondary"></span>
									<span class="loading loading-ball loading-lg text-primary"></span>
								</div>
							</div>
						`
					} else if (this._endIndex < this._currentNumberOfRenderContent - 1) {
						return html`
							<div class="divider h-fit">
								<button
									class="justify-self-end link link-hover"
									@click=${() => {
										if (typeof this._endAddContentTimeout === 'number') {
											window.clearTimeout(this._endAddContentTimeout)
										}

										if (typeof this._startAddContentTimeout === 'number') {
											window.clearTimeout(this._startAddContentTimeout)
										}

										this._endAddContentTimeout = window.setTimeout(() => this._addContentAtEndPosition(this._endIndex), 500)
									}}
								>
									...load next...
								</button>
							</div>
						`
					} else {
						return nothing
					}
				})()}
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'multi-select': Component
		'multi-select-render-options': ComponentRenderOptions
	}
}
