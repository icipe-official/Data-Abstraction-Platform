import { LitElement, html, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import 'iconify-icon'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Misc from '$src/lib/miscellaneous'
import Theme from '$src/lib/theme'
import '$src/lib/components/vertical-flex-scroll/component'

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
	@property({ type: String }) color: Theme.Color | undefined
	@property({ type: Number }) maxselectedoptions: number = 0
	@property({ type: Boolean }) disabled: boolean = false
	@property({ type: Boolean }) addinputborder: boolean = true
	@property({ type: Boolean }) borderrounded: boolean = true

	@state() private _showSelectOptions: boolean = false
	@state() private _componentFocused: boolean = false
	@state() private _selectSearchQuery: string = ''
	@state() private _selectSearchOptions: number[] = []

	private _focusSelectInputSearchField(e: MouseEvent) {
		e.preventDefault()
		if (this._componentFocused) return
		this._componentFocused = true
		this._showSelectOptions = true
		;(this.shadowRoot?.querySelector('.hs-multi-select-input-field') as HTMLInputElement).focus()
	}

	connectedCallback(): void {
		super.connectedCallback()
		if (!this.multiselect && this.selectedoptions !== null && typeof this.selectedoptions === 'object') {
			if (Array.isArray(this.selectedoptions)) {
				this._selectSearchQuery = (this.selectedoptions as SelectOption[])[0].label
			} else {
				this._selectSearchQuery = (this.selectedoptions as SelectOption).label
			}
		}
		this.addEventListener('mousedown', (e) => this._focusSelectInputSearchField(e))
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()
		this.removeEventListener('mousedown', this._focusSelectInputSearchField)
	}

	protected render(): unknown {
		return html`
			<header
				class="h-fit w-full min-w-[300px] overflow-y-auto max-h-[200px] overflow-x-hidden flex flex-wrap input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : this.color === Theme.Color.ACCENT ? 'input-accent' : ''} ${this
					.addinputborder
					? `border-2 ${this.color === Theme.Color.PRIMARY ? 'border-primary' : this.color === Theme.Color.SECONDARY ? 'border-secondary' : this.color === Theme.Color.ACCENT ? 'border-accent' : 'border-black'}`
					: ''} ${this.borderrounded ? ' rounded-md' : ''}"
			>
				${(() => {
					if (Array.isArray(this.selectedoptions) && (this.selectedoptions.length > 1 || this.multiselect)) {
						return this.selectedoptions.map((so) => {
							return html`
								<div
									class="p-[4px] flex justify-between rounded-lg  ${this.color === Theme.Color.PRIMARY
										? ' bg-primary text-primary-content'
										: this.color === Theme.Color.SECONDARY
											? ' bg-secondary text-secondary-content'
											: this.color === Theme.Color.ACCENT
												? ' bg-accent text-accent-content'
												: 'bg-black text-white'} h-fit w-fit m-[2px] min-w-[50px]"
								>
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
														style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : this.color === Theme.Color.ACCENT ? Theme.Color.ACCENT_CONTENT : 'black'};"
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
						<iconify-icon icon="mdi:close" style="color:${typeof this.color !== 'undefined' ? this.color : 'black'};" width=${Misc.IconifySize('25')} height=${Misc.IconifySize('25')}></iconify-icon>
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
									<iconify-icon icon="mdi:delete" style="color:${typeof this.color !== 'undefined' ? this.color : 'black'};" width=${Misc.IconifySize('25')} height=${Misc.IconifySize('25')}></iconify-icon>
								</button>
							`
						} else {
							return nothing
						}
					})()}
				</div>
			</header>
			${(() => {
				if (this._showSelectOptions) {
					return html`
						<div class="w-full min-h-[4px]"></div>
						<virtual-flex-scroll
							class="rounded-lg bg-white shadow-md shadow-gray-800 p-1 w-full max-h-[30vh]"
							.data=${this.selectoptions.filter((so, index) => {
								if (this.selectedoptions !== null && typeof this.selectedoptions === 'object') {
									if (Array.isArray(this.selectedoptions)) {
										for (let seo of this.selectedoptions) {
											if (seo.label === so.label && seo.value === so.value) {
												return false
											}
										}
									}

									if ((this.selectedoptions as SelectOption).label === so.label && (this.selectedoptions as SelectOption).value === so.value) {
										return false
									}
								}

								return this._selectSearchOptions.length === 0 || this._selectSearchOptions.includes(index)
							})}
							.foreachrowrender=${(datum: SelectOption, _: number) => {
								return html`
									<button
										class="w-full p-1 mt-1 mb-1 text-left ${this.color === Theme.Color.PRIMARY
											? 'hover:bg-primary hover:text-primary-content'
											: this.color === Theme.Color.SECONDARY
												? 'hover:bg-secondary hover:text-secondary-content'
												: this.color === Theme.Color.ACCENT
													? 'hover:bg-accent hover:text-accent-content'
													: 'hover:bg-black hover:text-white'} disabled:hover:bg-white"
										@click=${() => {
											if (this.multiselect) {
												if (Array.isArray(this.selectedoptions)) {
													for (let seo of this.selectedoptions) {
														if (seo.value === datum.value && seo.label === datum.label) {
															return
														}
													}
													this.selectedoptions = [...this.selectedoptions, datum]
												} else {
													this.selectedoptions = [datum]
												}
											} else {
												this.selectedoptions = datum
												this._selectSearchQuery = datum.label
											}
											this.dispatchEvent(
												new CustomEvent('multi-select:addselectedoptions', {
													detail: {
														value: datum
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
										.disabled=${(() => {
											if (this.disabled) {
												return true
											}

											if (this.maxselectedoptions > 1 && this.maxselectedoptions === (Array.isArray(this.selectedoptions) ? this.selectedoptions.length : 0)) {
												return true
											}

											return false
										})()}
									>
										${datum.label}
									</button>
								`
							}}
						></virtual-flex-scroll>
					`
				}

				return nothing
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'multi-select': Component
	}
}
