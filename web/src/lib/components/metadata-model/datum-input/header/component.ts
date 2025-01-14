import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import 'iconify-icon'
import MetadataModel from '$src/lib/metadata_model'
import Misc from '$src/lib/miscellaneous'
import Theme from '$src/lib/theme'

@customElement('metadata-model-datum-input-header')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) group: any = {}
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ type: String }) color!: Theme.Color
	@property({ type: Boolean }) viewjsonoutput: boolean = false
	@property({ attribute: false }) updateviewjsonoutput!: (newviewjsonoutput: boolean) => void
	@property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
	@property({ attribute: false }) deletedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void

	@state() private _showMoreDescription: boolean = false

	@state() private _showMenu: boolean = false

	protected render(): unknown {
		return html`
			<section class="flex flex-col">
				<button class="btn btn-circle btn-sm btn-ghost self-start" @click=${() => (this._showMenu = !this._showMenu)}>
					<iconify-icon
						icon="mdi:dots-vertical"
						style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
						width=${Misc.IconifySize()}
						height=${Misc.IconifySize()}
					></iconify-icon>
				</button>
				<section class="relative w-full">
					${(() => {
						if (this._showMenu) {
							return html`
								<div class="absolute top-0 flex flex-col space-y-1 w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black min-w-[200px]">
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
											<iconify-icon icon=${this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE ? 'mdi:table-large' : 'mdi:form'} style="color: black;" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('32')}></iconify-icon>
										</div>
										<div class="self-center font-bold">data input view</div>
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
							`
						}

						return nothing
					})()}
				</section>
			</section>
			<div class="flex-[9] flex break-words text-md font-bold h-full">
				<span class="self-center">
					${(() => {
						if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).length > 0) {
							return this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME]
						}

						return 'Data Entry'
					})()}
				</span>
			</div>
			<div class="w-full h-full"></div>
			${(() => {
				if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0) {
					return html`
						<div class="w-full overflow-auto max-h-[100px] flex flex-wrap text-sm">
							<span>
								${(() => {
									if (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION].length > 100) {
										return (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).slice(0, this._showMoreDescription ? this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION].length - 1 : 100)
									}

									return this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]
								})()}
							</span>
							${(() => {
								if (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION].length > 100) {
									return html`
										<button
											class="link link-hover font-bold italic w-fit"
											@click=${() => {
												this._showMoreDescription = !this._showMoreDescription
											}}
										>
											${this._showMoreDescription ? ' less' : ' more'}...
										</button>
									`
								}

								return nothing
							})()}
						</div>
					`
				}

				return html`<div class="w-full h-full"></div>`
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-header': Component
	}
}
