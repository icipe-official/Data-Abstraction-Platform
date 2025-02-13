import { html, LitElement, nothing, PropertyValues, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import 'iconify-icon'
import MetadataModel from '$src/lib/metadata_model'
import Misc from '$src/lib/miscellaneous'
import Theme from '$src/lib/theme'
import '$src/lib/components/drop-down/component'

@customElement('metadata-model-datum-input-header')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) group: any = {}
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ type: String }) color!: Theme.Color
	@property({ type: Boolean }) viewjsonoutput: boolean = false
	@property({ attribute: false }) updateviewjsonoutput!: (newvalue: boolean) => void
	@property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
	@property({ attribute: false }) deletedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ attribute: false }) headerheightupdate: ((newheight: number) => void) | undefined

	@state() private _showDescription: boolean = false

	@state() private _showMenu: boolean = false

	private _resizeObserver: ResizeObserver | undefined

	protected firstUpdated(_changedProperties: PropertyValues): void {
		if (typeof this.headerheightupdate === 'function') {
			this._resizeObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					if (entry.contentRect.height > 0) {
						this.headerheightupdate!(entry.contentRect.height)
					}
				}
			})
			this._resizeObserver.observe(this)
		}
	}

	protected render(): unknown {
		return html`
			<section class="flex justify-between w-full">
				<div class="flex-1 w-full">
					<div class="flex sticky left-0 w-fit">
						<drop-down .showdropdowncontent=${this._showMenu} @drop-down:showdropdowncontentupdate=${(e: CustomEvent) => (this._showMenu = e.detail.value)}>
							<button slot="header" class="btn btn-circle btn-sm btn-ghost self-start" @click=${() => (this._showMenu = !this._showMenu)}>
								<iconify-icon
									icon="mdi:dots-vertical"
									style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
									width=${Misc.IconifySize()}
									height=${Misc.IconifySize()}
								></iconify-icon>
							</button>
							<div id="drop-down-content" slot="content" class="flex flex-col space-y-1 w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black min-w-[200px]">
								${(() => {
									;(async () => {
										await new Promise((resolve: (e: Element) => void) => {
											if ((this.shadowRoot as ShadowRoot).querySelector('#drop-down-content')) {
												resolve((this.shadowRoot as ShadowRoot).querySelector('#drop-down-content') as Element)
												return
											}

											const observer = new MutationObserver(() => {
												if ((this.shadowRoot as ShadowRoot).querySelector('#drop-down-content')) {
													resolve((this.shadowRoot as ShadowRoot).querySelector('#drop-down-content') as Element)
													observer.disconnect()
												}
											})

											observer.observe(this.shadowRoot as ShadowRoot, {
												childList: true,
												subtree: true
											})
										}).then((ddcElement) => {
											;(async () => {
												await new Promise((resolve: (e: HTMLSlotElement) => void) => {
													if ((this.shadowRoot as ShadowRoot).querySelector('slot[name=header-menu-additional-content]')) {
														resolve((this.shadowRoot as ShadowRoot).querySelector('slot[name=header-menu-additional-content]') as HTMLSlotElement)
														return
													}

													const observer = new MutationObserver(() => {
														if ((this.shadowRoot as ShadowRoot).querySelector('slot[name=header-menu-additional-content]')) {
															resolve((this.shadowRoot as ShadowRoot).querySelector('slot[name=header-menu-additional-content]') as HTMLSlotElement)
															observer.disconnect()
														}
													})

													observer.observe(this.shadowRoot as ShadowRoot, {
														childList: true,
														subtree: true
													})
												}).then((hmacElement) => {
													ddcElement.append(...hmacElement.assignedElements())
												})
											})()
										})
									})()
								})()}
								<button class="btn btn-ghost p-1 w-full justify-start" @click=${() => this.updateviewjsonoutput(!this.viewjsonoutput)}>
									<div class="flex flex-col justify-center">
										<div class="flex self-center">
											<iconify-icon icon="mdi:code-json" style="color: black;" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
											${(() => {
												if (this.viewjsonoutput) {
													return html` <iconify-icon icon="mdi:close-circle" style="color: black;" width=${Misc.IconifySize('10')} height=${Misc.IconifySize('10')}></iconify-icon> `
												} else {
													return nothing
												}
											})()}
										</div>
									</div>
									<div class="self-center font-bold">view json data</div>
								</button>
								<button
									class="btn btn-ghost p-1 w-full justify-start"
									@click=${() => {
										if (this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
											delete this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW]
										} else {
											this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] = MetadataModel.DView.TABLE
										}
										this.updatemetadatamodel(this.group)
									}}
								>
									<div class="flex self-center">
										<iconify-icon icon=${this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE ? 'mdi:form' : 'mdi:table-large'} style="color: black;" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('32')}></iconify-icon>
									</div>
									<div class="self-center font-bold">Switch to ${this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE ? 'form' : 'table'} view</div>
								</button>
								<button
									class="btn btn-ghost p-1 w-full justify-start"
									@click=${() => {
										this.deletedata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
									}}
								>
									<div class="flex self-center">
										<iconify-icon icon="mdi:delete-empty" style="color: black;" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('32')}></iconify-icon>
									</div>
									<div class="self-center font-bold">delete data</div>
								</button>
							</div>
						</drop-down>
						<span class="self-center sticky">
							${(() => {
								if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).length > 0) {
									return this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME]
								}

								return 'Data Entry'
							})()}
						</span>
						${(() => {
							if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0) {
								return html`
									<button class="ml-2 btn btn-circle btn-sm btn-ghost self-start" @click=${() => (this._showDescription = !this._showDescription)}>
										<iconify-icon
											icon="mdi:question-mark-circle"
											style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
											width=${Misc.IconifySize()}
											height=${Misc.IconifySize()}
										></iconify-icon>
									</button>
								`
							}

							return nothing
						})()}
					</div>
				</div>
				<div class="flex-1 w-full relative flex justify-end">
					<div class="sticky right-0 w-fit">
						<slot name="header-sticky-right-content"></slot>
					</div>
				</div>
			</section>
			<section class="flex">
				<div class="w-[30px] h-full"></div>
				${(() => {
					if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0 && this._showDescription) {
						return html` <div class="w-full overflow-auto max-h-[100px] flex flex-wrap text-sm">${this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}</div> `
					}

					return html`<div class="w-full h-full"></div>`
				})()}
			</section>
			<slot name="header-menu-additional-content" class="hidden"></slot>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-header': Component
	}
}
