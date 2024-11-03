import { LitElement, PropertyValueMap, TemplateResult, html, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import 'iconify-icon'
import tailwindCss from '$src/assets/index.css?inline'
import multiSelectCss from './multi-select.css?inline'
import multiSelectRenderBreakpointCss from './multi-select-render-breakpoint.css?inline'
import Theme from '$src/lib/theme'
import Log from '$src/lib/log'
import Misc from '$src/lib/miscellaneous'

interface SelectOption {
	label: string
	value: any
}

/**
 * Component offers a dropdown list of options that can be select once or twice.
 */
@customElement('multi-select')
class Component extends LitElement {
	static styles = [unsafeCSS(tailwindCss), unsafeCSS(multiSelectCss)]

	@property() placeholder: string = 'Search...'
	@property({ type: Array }) selectoptions: SelectOption[] = []
	@property({ type: Object }) selectedoptions: SelectOption[] | SelectOption | null = null
	@property({ type: Boolean }) multiselect: boolean = false
	@property() color: Theme.Color = Theme.Color.PRIMARY
	@property({ type: Number }) maxselectedoptions: number = 0
	@property({ type: Boolean }) disabled: boolean = false

	@state() private _showSelectOptions: boolean = false
	@state() private _componentFocused: boolean = false
	@state() private _selectSearchQuery: string = ''
	@state() private _selectSearchOptions: number[] = []

	private _focusSelectInputSearchField(e: MouseEvent) {
		e.preventDefault()
		Log.Log(Log.Level.DEBUG, this.localName, 'Focusing select input search field')
		if (this._componentFocused) return
		this._componentFocused = true
		this._showSelectOptions = true
		;(this.shadowRoot?.querySelector('.hs-multi-select-input-field') as HTMLInputElement).focus()
	}

	private _unfocusSelectInputSearchField() {
		Log.Log(Log.Level.DEBUG, this.localName, 'Unfocusing select input search field')
		this._componentFocused = false
		this._showSelectOptions = false
	}

	private _addSelectedOptions = (so: SelectOption) => {
		Log.Log(Log.Level.DEBUG, this.localName, so, 'Add select option')
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
		Log.Log(Log.Level.DEBUG, this.localName, this.selectedoptions, 'Updated select options')
		this.dispatchEvent(
			new CustomEvent('multi-select:addselectedoptions', {
				detail: so
			})
		)
		this.dispatchEvent(
			new CustomEvent('multi-select:updateselectedoptions', {
				detail: this.selectedoptions
			})
		)
	}

	private _removeSelectedOptions(so: SelectOption) {
		Log.Log(Log.Level.DEBUG, this.localName, so, 'Remove select option')
		if (this.multiselect) {
			if (Array.isArray(this.selectedoptions)) {
				this.selectedoptions = this.selectedoptions.filter((seo) => seo.label !== so.label && seo.value !== so.value)
			}
		} else {
			this.selectedoptions = null
			this._selectSearchQuery = ''
		}
		Log.Log(Log.Level.DEBUG, this.localName, this.selectedoptions, 'Updated select options')
		this.dispatchEvent(
			new CustomEvent('multi-select:Delete selectedoptions', {
				detail: so
			})
		)
		this.dispatchEvent(
			new CustomEvent('multi-select:updateselectedoptions', {
				detail: this.selectedoptions
			})
		)
	}

	private _searchSelectOptions(value: string) {
		this._selectSearchQuery = value
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
		Log.Log(Log.Level.DEBUG, this.localName, this._selectSearchOptions, 'Searched select options')
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
			<header class="h-full w-full min-h-fit overflow-y-auto overflow-x-hidden flex flex-wrap input  ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} border-none rounded-none">
				${this.multiselect && Array.isArray(this.selectedoptions)
					? html`
							${this.selectedoptions.map((so) => {
								return html`
									<div class="p-[4px] flex justify-between rounded-lg  ${this.color === Theme.Color.PRIMARY ? ' bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? ' bg-secondary text-secondary-content' : ' bg-accent text-accent-content'} h-fit w-fit m-[2px] min-w-[50px]">
										<span class="self-center h-fit w-fit">${so.label}</span>
										${!this.disabled
											? html`
													<button class="btn btn-circle btn-ghost w-fit min-h-fit max-h-[21px] p-0 self-center" @click=${() => this._removeSelectedOptions(so)}>
														<iconify-icon
															icon="mdi:close-thick"
															style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
															width=${Misc.IconifySize('20')}
															height=${Misc.IconifySize('20')}
														></iconify-icon>
													</button>
												`
											: nothing}
									</div>
								`
							})}
						`
					: nothing}
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
							this._searchSelectOptions(e.currentTarget.value)
						}}
						@focusout=${this._unfocusSelectInputSearchField}
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
					${!this.disabled
						? html`
								<button
									class="btn btn-circle btn-ghost w-fit min-h-fit max-h-[26px] p-0 self-center"
									@click=${() => {
										this.selectedoptions = null
										this.dispatchEvent(
											new CustomEvent('multi-select:Delete selectedoptions', {
												detail: this.selectedoptions
											})
										)
										this.dispatchEvent(
											new CustomEvent('multi-select:updateselectedoptions', {
												detail: this.selectedoptions
											})
										)
									}}
								>
									<iconify-icon icon="mdi:delete" style="color:${this.color};" width=${Misc.IconifySize('25')} height=${Misc.IconifySize('25')}></iconify-icon>
								</button>
							`
						: nothing}
				</div>
			</header>
			<main class="relative h-0">
				${this._showSelectOptions
					? html`<div class="hs-multi-select-render-options mt-3 absolute rounded-lg bg-white shadow-md shadow-gray-800 p-1 w-full top-0 min-h-max max-h-[30vh] overflow-x-hidden overflow-y-auto flex flex-col">
							${this.selectoptions.length > 0
								? html`
										${(() => {
											let nso = this.selectoptions.filter((so, index) => {
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
											})
											Log.Log(Log.Level.DEBUG, this.localName, nso, 'Displayed select options')
											if (nso.length < 1) {
												return nothing
											} else {
												let templates: TemplateResult<1>[] = []
												for (let i = 0; i <= Math.floor(nso.length / 30); i++) {
													templates.push(
														html`<multi-select-render-breakpoint
															.selectoptions=${nso.slice(i * 30, i * 30 + 30)}
															.majorbreakpointid=${i.toString()}
															.addselectedoptions=${this._addSelectedOptions}
															.maxselectedoptions=${this.maxselectedoptions}
															.noofselectedoptions=${Array.isArray(this.selectedoptions) ? this.selectedoptions.length : 0}
															.selectoptionscontainerelement=${this.querySelector('.hs-multi-select-render-options')}
															.disabled=${this.disabled}
														></multi-select-render-breakpoint>`
													)
												}
												return templates
											}
										})()}
									`
								: html`<div class="w-full font-bold italic text-center">No options available...</div>`}
						</div> `
					: nothing}
			</main>
		`
	}
}

/**
 * Component conditionally renders a section of select options when they come into view in the select box.
 */
@customElement('multi-select-render-breakpoint')
class MultiSelectRenderBreakPoint extends LitElement {
	static styles = [unsafeCSS(tailwindCss), unsafeCSS(multiSelectRenderBreakpointCss)]

	@property({ attribute: false }) selectoptions!: SelectOption[]
	@property({ attribute: false }) majorbreakpointid!: string
	@property() color: Theme.Color = Theme.Color.PRIMARY
	@property({ attribute: false }) addselectedoptions!: (so: SelectOption) => void
	@property({ type: Number }) noofselectedoptions!: number
	@property({ type: Number }) maxselectedoptions!: number
	@property({ type: Object }) selectoptionscontainerelement!: Element | null
	@property({ type: Boolean }) disabled!: boolean
	@state() private _renderBreakpoint: boolean = false

	private _intersectionObserver!: IntersectionObserver
	private _step = 0
	protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
		this._intersectionObserver = new IntersectionObserver(
			(entries) => {
				for (let entry of entries) {
					const majorBreakPointExtract = /hs-multi-select-render-mabp-([0-9]+)/.exec(entry.target.id)
					if (majorBreakPointExtract) {
						if (entry.intersectionRatio > 0.25) {
							this._renderBreakpoint = true
						} else {
							if (this._step === 3) {
								this._renderBreakpoint = false
								this._step = 0
							}
							this._step += 1
						}
						Log.Log(Log.Level.DEBUG, this.localName, `breakpoint ${entry.target.id} render status: ${this._renderBreakpoint}`)
					}
				}
			},
			{
				root: this.selectoptionscontainerelement,
				rootMargin: '100px',
				threshold: [0.0, 0.25, 0.5, 0.75, 1.0]
			}
		)

		this._intersectionObserver.observe((this.shadowRoot as ShadowRoot).querySelector(`#hs-multi-select-render-mabp-${this.majorbreakpointid}`) as Element)
	}

	disconnectedCallback(): void {
		this._intersectionObserver.disconnect()
	}

	protected render(): unknown {
		return html`
			<div id="hs-multi-select-render-mabp-${this.majorbreakpointid}" class="w-full h-0"></div>
			${this._renderBreakpoint
				? this.selectoptions.map((so) => {
						return html`
							<button
								class="w-full p-1 text-left ${this.color === Theme.Color.PRIMARY ? 'hover:bg-primary hover:text-primary-content' : this.color === Theme.Color.SECONDARY ? 'hover:bg-secondary hover:text-secondary-content' : 'hover:bg-accent hover:text-accent-content'} disabled:hover:bg-white"
								@click=${() => {
									if (this.addselectedoptions) {
										this.addselectedoptions(so)
									}
								}}
								.disabled=${this.disabled || (this.maxselectedoptions > 0 ? (this.noofselectedoptions > 0 && this.maxselectedoptions === this.noofselectedoptions ? true : false) : false)}
							>
								${so.label}
							</button>
						`
					})
				: html`<div class="w-full text-center">loading...</div>`}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'multi-select': Component
		'multi-select-render-breakpoint': MultiSelectRenderBreakPoint
	}
}
