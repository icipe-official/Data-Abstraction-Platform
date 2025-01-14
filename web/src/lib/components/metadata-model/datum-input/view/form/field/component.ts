import { html, LitElement, nothing, PropertyValues, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import Misc from '$src/lib/miscellaneous'
import './text/component'
import './number/component'
import './checkbox/component'
import './date-time/component'
import './select/component'

@customElement('metadata-model-datum-input-form-field')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) field: any = {}
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ type: String }) color!: Theme.Color
	@property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
	@property({ attribute: false }) getdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
	@property({ attribute: false }) updatedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
	@property({ attribute: false }) deletedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ type: String }) copiedcutfieldgroupkey: string = ''
	@property({ attribute: false }) setcopiedfieldgroupkey!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ attribute: false }) setcutfieldgroupdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ attribute: false }) pastefieldgroupdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void

	@state() private _totalNoOfRows: number = 1

	@state() private _viewJsonOutput: boolean = false

	@state() private _showDescription: boolean = false

	@state() private _showMenu: boolean = false

	protected firstUpdated(_changedProperties: PropertyValues): void {
		const fieldData = this.getdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
		if (Array.isArray(fieldData) && (fieldData as any[]).length > 1) {
			this._totalNoOfRows = (fieldData as any[]).length
		}
	}

	@state() private _showRowMenuIndex: string = ''

	private _inputFieldHtmlTemplate(rowIndex: number) {
		switch (this.field[MetadataModel.FgProperties.FIELD_UI] as MetadataModel.FieldUi) {
			case MetadataModel.FieldUi.TEXT:
			case MetadataModel.FieldUi.TEXTAREA:
				return html`
					<metadata-model-datum-input-form-field-text .color=${this.color} .field=${this.field} .arrayindexplaceholders=${[...this.arrayindexplaceholders, rowIndex]} .getdata=${this.getdata} .deletedata=${this.deletedata} .updatedata=${this.updatedata}></metadata-model-datum-input-form-field-text>
				`
			case MetadataModel.FieldUi.NUMBER:
				return html`
					<metadata-model-datum-input-form-field-number
						.color=${this.color}
						.field=${this.field}
						.arrayindexplaceholders=${[...this.arrayindexplaceholders, rowIndex]}
						.getdata=${this.getdata}
						.deletedata=${this.deletedata}
						.updatedata=${this.updatedata}
					></metadata-model-datum-input-form-field-number>
				`
			case MetadataModel.FieldUi.CHECKBOX:
				return html`
					<metadata-model-datum-input-form-field-checkbox
						.color=${this.color}
						.field=${this.field}
						.arrayindexplaceholders=${[...this.arrayindexplaceholders, rowIndex]}
						.getdata=${this.getdata}
						.deletedata=${this.deletedata}
						.updatedata=${this.updatedata}
					></metadata-model-datum-input-form-field-checkbox>
				`
			case MetadataModel.FieldUi.DATETIME:
				return html`
					<metadata-model-datum-input-form-field-date-time
						.color=${this.color}
						.field=${this.field}
						.arrayindexplaceholders=${[...this.arrayindexplaceholders, rowIndex]}
						.getdata=${this.getdata}
						.deletedata=${this.deletedata}
						.updatedata=${this.updatedata}
					></metadata-model-datum-input-form-field-date-time>
				`
			default:
				return html`<div class="text-error">...field ui is not valid/supported...</div>`
		}
	}

	protected render(): unknown {
		return html`
			<section class="flex flex-col w-fit">
				<button class="btn btn-circle btn-sm btn-ghost self-start" @click=${() => (this._showMenu = !this._showMenu)}>
					<iconify-icon icon="mdi:dots-vertical" style="color: black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
				</button>
				<div class="relative w-full">
					${(() => {
						if (this._showMenu) {
							return html`
								<div class="absolute top-0 flex flex-col w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 min-w-[200px]">
									<button
										class="btn btn-ghost p-1 w-full justify-start"
										@click=${() => {
											this.deletedata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
											this._totalNoOfRows = 1
										}}
									>
										<div class="flex self-center">
											<iconify-icon icon="mdi:delete-empty" style="color: black;" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('32')}></iconify-icon>
										</div>
										<div class="self-center font-bold">delete data</div>
									</button>
									<button class="btn btn-ghost p-1 w-full justify-start" @click=${() => (this._viewJsonOutput = !this._viewJsonOutput)}>
										<div class="flex flex-col justify-center">
											<div class="flex self-center">
												<iconify-icon icon="mdi:code-json" style="color:black;" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
												${(() => {
													if (this._viewJsonOutput) {
														return html` <iconify-icon icon="mdi:close-circle" style="color:black;" width=${Misc.IconifySize('10')} height=${Misc.IconifySize('10')}></iconify-icon> `
													} else {
														return nothing
													}
												})()}
											</div>
										</div>
										<div class="self-center font-bold">view json data</div>
									</button>
									${(() => {
										if (this.copiedcutfieldgroupkey !== this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
											return html`
												<button
													class="btn btn-ghost p-1 w-full justify-start"
													@click=${() => {
														this.setcopiedfieldgroupkey(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
													}}
												>
													<div class="flex self-center">
														<iconify-icon icon="mdi:content-copy" style="color:black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
													</div>
													<div class="self-center font-bold">copy data</div>
												</button>
												<button
													class="btn btn-ghost p-1 w-full justify-start"
													@click=${() => {
														this.setcutfieldgroupdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
													}}
												>
													<div class="flex self-center">
														<iconify-icon icon="mdi:content-cut" style="color:black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
													</div>
													<div class="self-center font-bold">cut data</div>
												</button>
											`
										} else {
											return nothing
										}
									})()}
								</div>
							`
						}

						return nothing
					})()}
				</div>
			</section>
			<header class="flex flex-col">
				<div class="flex space-x-1 h-full">
					<div class="w-full flex h-fit self-center">
						${(() => {
							if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_NAME] === 'string' && (this.field[MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).length > 0) {
								return this.field[MetadataModel.FgProperties.FIELD_GROUP_NAME]
							} else {
								if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
									return html`${(this.field[MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).split('.').pop()}`
								} else {
									return html`<div class="text-error h-fit">...field key is not valid...</div>`
								}
							}
						})()}
					</div>
					${(() => {
						if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this.field[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0) {
							return html`
								<button
									class="btn btn-circle btn-sm btn-ghost self-start"
									@click=${() => {
										this._showDescription = !this._showDescription
									}}
								>
									<iconify-icon icon="mdi:question-mark-circle" style="color: black;" width=${Misc.IconifySize('28')} height=${Misc.IconifySize('28')}></iconify-icon>
								</button>
							`
						}

						return nothing
					})()}
					${(() => {
						if (this.copiedcutfieldgroupkey.length > 0 && this.copiedcutfieldgroupkey === this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
							return html`
								<button
									class="btn btn-circle btn-sm btn-ghost self-start"
									@click=${() => {
										this.pastefieldgroupdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
									}}
								>
									<iconify-icon icon="mdi:content-paste" style="color:black;" width=${Misc.IconifySize('28')} height=${Misc.IconifySize('28')}></iconify-icon>
								</button>
							`
						} else {
							return nothing
						}
					})()}
					${(() => {
						if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number' && this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] !== 1 && this.field[MetadataModel.FgProperties.FIELD_UI] !== MetadataModel.FieldUi.SELECT) {
							return html`
								<button
									class="btn btn-circle btn-sm btn-ghost self-start"
									@click=${() => {
										if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number') {
											if (this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] < 1) {
												this._totalNoOfRows += 1
											} else {
												if (this._totalNoOfRows < this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]) {
													this._totalNoOfRows += 1
												}
											}
										} else {
											this._totalNoOfRows += 1
										}
									}}
									.disabled=${typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number' && this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] > 1 && this._totalNoOfRows >= this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]}
								>
									<iconify-icon icon="mdi:plus-circle" style="color:black;" width=${Misc.IconifySize('28')} height=${Misc.IconifySize('28')}></iconify-icon>
								</button>
							`
						} else {
							return nothing
						}
					})()}
				</div>
				<div class="relative w-full">
					${(() => {
						if (this._showDescription) {
							return html` <div class="absolute top-0 flex flex-col w-full bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black text-sm max-h-[80vh] overflow-auto">${this.field[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}</div> `
						}

						return nothing
					})()}
				</div>
			</header>
			${(() => {
				if (this._viewJsonOutput) {
					const jsonData = this.getdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)

					return html`
						<div class="w-full h-full"></div>
						<pre class="flex-1 bg-gray-700 text-white lg:max-w-[50vw] w-full h-fit max-h-[80vh] overflow-auto shadow-inner shadow-gray-800 p-1 rounded-md"><code>${JSON.stringify(jsonData, null, 4)}</code></pre>
					`
				}

				if (this.field[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.SELECT) {
					return html`
						<div class="w-full h-full"></div>
						<metadata-model-datum-input-form-field-select .color=${this.color} .field=${this.field} .arrayindexplaceholders=${this.arrayindexplaceholders} .getdata=${this.getdata} .deletedata=${this.deletedata} .updatedata=${this.updatedata}></metadata-model-datum-input-form-field-select>
					`
				}

				if (this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 1) {
					return html`
						<div class="w-full h-full"></div>
						${this._inputFieldHtmlTemplate(0)}
					`
				}

				let templates: TemplateResult<1>[] = []

				for (let rowIndex = 0; rowIndex < this._totalNoOfRows; rowIndex++) {
					if (typeof this.field[MetadataModel.FgProperties.FIELD_UI] === 'string' && (this.field[MetadataModel.FgProperties.FIELD_UI] as string).length > 0) {
						templates.push(html`
							<div class="w-full h-full"></div>
							<div class="flex space-x-1 mb-1">
								<div class="font-bold text-lg h-full self-start">${rowIndex + 1}</div>
								${this._inputFieldHtmlTemplate(rowIndex)}
								${(() => {
									if (this.copiedcutfieldgroupkey.length > 0 && this.copiedcutfieldgroupkey === `${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`) {
										return html`
											<button
												class="self-end btn rounded-none ${this.color === Theme.Color.ACCENT ? 'btn-primary' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : 'btn-accent'} p-1"
												@click=${() => {
													this.pastefieldgroupdata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
												}}
											>
												<iconify-icon
													icon="mdi:content-paste"
													style="color:${this.color === Theme.Color.ACCENT ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.PRIMARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
													width=${Misc.IconifySize()}
													height=${Misc.IconifySize()}
												></iconify-icon>
											</button>
										`
									} else {
										return nothing
									}
								})()}
								<div class="flex flex-col">
									<button
										class="btn btn-circle btn-xs btn-ghost self-start"
										@click=${() => {
											if (this._showRowMenuIndex === '') {
												this._showRowMenuIndex = `${rowIndex}`
											} else {
												this._showRowMenuIndex = ''
											}
										}}
									>
										<iconify-icon icon="mdi:dots-vertical" style="color: black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
									</button>
									<div class="relative">
										${(() => {
											if (this._showRowMenuIndex === `${rowIndex}`) {
												return html`
													<div class="absolute top-0 right-0 flex flex-col w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 min-w-[200px]">
														<button
															class="btn btn-ghost p-1 w-full justify-end"
															@click=${() => {
																this.setcopiedfieldgroupkey(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
															}}
														>
															<div class="self-center font-bold">Copy field data</div>
															<div class="flex self-center">
																<iconify-icon icon="mdi:content-copy" style="color:black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
															</div>
														</button>
														<button
															class="btn btn-ghost p-1 w-full justify-end"
															@click=${() => {
																this.setcutfieldgroupdata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
															}}
														>
															<div class="self-center font-bold">Cut field data</div>
															<div class="flex self-center">
																<iconify-icon icon="mdi:content-cut" style="color:black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
															</div>
														</button>
														<button
															class="btn btn-ghost p-1 w-full justify-end"
															@click=${() => {
																this.deletedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
																if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
																	const fieldData = this.getdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
																	if (Array.isArray(fieldData)) {
																		if ((fieldData as any[]).length !== 0) {
																			this._totalNoOfRows = (fieldData as any[]).length
																			for (const fd of fieldData) {
																				if (fd) {
																					return
																				}
																			}
																		}
																		this.deletedata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
																	} else {
																		if (this._totalNoOfRows - 1 !== 0) {
																			this._totalNoOfRows -= 1
																		}
																	}
																}
															}}
														>
															<div class="self-center font-bold">Delete field data</div>
															<div class="flex self-center">
																<iconify-icon icon="mdi:delete" style="color:black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
															</div>
														</button>
													</div>
												`
											}

											return nothing
										})()}
									</div>
								</div>
							</div>
						`)
					} else {
						templates.push(html`<div class="text-error">...field ui is not valid...</div>`)
					}
				}

				return templates
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-form-field': Component
	}
}
