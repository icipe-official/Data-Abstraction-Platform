import { html, LitElement, nothing, PropertyValues, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import MetadataModel from '$src/lib/metadata_model'
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
				<div class="flex sticky left-0 w-fit">
					<drop-down class="h-fit self-center" .showdropdowncontent=${this._showMenu} @drop-down:showdropdowncontentupdate=${(e: CustomEvent) => (this._showMenu = e.detail.value)}>
						<button slot="header" class="btn btn-circle btn-sm btn-ghost self-start" @click=${() => (this._showMenu = !this._showMenu)}>
							<!--mdi:dots-vertical source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path
									fill="${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT}"
									d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"
								/>
							</svg>
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
										<!--mdi:code-json source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
											<path
												fill="black"
												d="M5 3h2v2H5v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3zm-7 12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1"
											/>
										</svg>
										${(() => {
											if (this.viewjsonoutput) {
												return html`
													<!--mdi:close-circle source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
														<path fill="black" d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" />
													</svg>
												`
											}

											return nothing
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
									${(() => {
										if (this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
											return html`
												<!--mdi:form source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24"><path fill="black" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zm10 2h-6v-2h6zm0-4h-6v-2h6zm0-4h-6V7h6z" /></svg>
											`
										}

										return html`
											<!--mdi:table-large source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24">
												<path fill="black" d="M4 3h16a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 4v3h4V7zm6 0v3h4V7zm10 3V7h-4v3zM4 12v3h4v-3zm0 8h4v-3H4zm6-8v3h4v-3zm0 8h4v-3h-4zm10 0v-3h-4v3zm0-8h-4v3h4z" />
											</svg>
										`
									})()}
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
									<!--mdi:close-circle source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24"><path fill="black" d="m20.37 8.91l-1 1.73l-12.13-7l1-1.73l3.04 1.75l1.36-.37l4.33 2.5l.37 1.37zM6 19V7h5.07L18 11v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2" /></svg>
								</div>
								<div class="self-center font-bold">delete data</div>
							</button>
						</div>
					</drop-down>
					<span class="self-center sticky"> ${MetadataModel.GetFieldGroupName(this.group, 'Data Entry')} </span>
					${(() => {
						if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0) {
							return html`
								<button class="ml-2 btn btn-circle btn-sm btn-ghost self-start" @click=${() => (this._showDescription = !this._showDescription)}>
									<!--mdi:question-mark-circle source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
										<path
											fill="${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT}"
											d="m15.07 11.25l-.9.92C13.45 12.89 13 13.5 13 15h-2v-.5c0-1.11.45-2.11 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41a2 2 0 0 0-2-2a2 2 0 0 0-2 2H8a4 4 0 0 1 4-4a4 4 0 0 1 4 4a3.2 3.2 0 0 1-.93 2.25M13 19h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
										/>
									</svg>
								</button>
							`
						}

						return nothing
					})()}
				</div>
				<div class="sticky right-0 w-fit">
					<slot name="header-sticky-right-content"></slot>
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
