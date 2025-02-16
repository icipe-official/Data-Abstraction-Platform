import { html, LitElement, nothing, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import '../../column-field/text/component'
import '../../column-field/number/component'
import '../../column-field/checkbox/component'
import '../../column-field/date-time/component'
import '../../column-field/select/component'
import MetadataModel from '$src/lib/metadata_model'
import Misc from '$src/lib/miscellaneous'
import 'iconify-icon'
import '$src/lib/components/drop-down/component'

@customElement('metadata-model-datum-input-table-column')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) field: any = {}
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ type: String }) color!: Theme.Color
	@property({ attribute: false }) getdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
	@property({ attribute: false }) updatedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
	@property({ attribute: false }) deletedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ type: Number }) stickyleft!: number
	@property({ type: Number }) stickytop!: number
	@property({ type: Number }) selectedrowminindex: number = -1
	@property({ type: Number }) selectedrowmaxindex: number = -1
	@property({ type: Number }) selectedcolumnminindex: number = -1
	@property({ type: Number }) selectedcolumnmaxindex: number = -1
	@property({ attribute: false }) updateselectedrowcolumnindex!: (row: number, column: number) => void

	@state() private _totalNoOfRows: number = 1

	@state() private _showRowMenuIndex: string = ''

	connectedCallback(): void {
		super.connectedCallback()

		if (this.field[MetadataModel.FgProperties.FIELD_UI] !== MetadataModel.FieldUi.SELECT) {
			const fieldData = this.getdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
			if (Array.isArray(fieldData) && fieldData.length > 1) {
				this._totalNoOfRows = fieldData.length
			}
		}
	}

	protected render(): unknown {
		return html`
			<div
				class="relative h-full min-h-full w-full min-w-fit p-1 ${this.arrayindexplaceholders[0] >= this.selectedrowminindex &&
				this.arrayindexplaceholders[0] <= this.selectedrowmaxindex &&
				this.arrayindexplaceholders[1] >= this.selectedcolumnminindex &&
				this.arrayindexplaceholders[1] <= this.selectedcolumnmaxindex
					? `bg-opacity-40 ${this.color === Theme.Color.PRIMARY ? 'bg-primary' : this.color === Theme.Color.SECONDARY ? 'bg-secondary' : 'bg-accent'}`
					: ''}"
			>
				<div style="left: ${this.stickyleft}px; top: ${this.stickytop}px;" class="flex min-w-fit w-fit h-fit">
					<div class="w-fit h-full">
						<button class="w-fit h-fit" @click=${() => this.updateselectedrowcolumnindex(this.arrayindexplaceholders[0], this.arrayindexplaceholders[1])}>
							<iconify-icon
								icon=${this.arrayindexplaceholders[0] >= this.selectedrowminindex && this.arrayindexplaceholders[0] <= this.selectedrowmaxindex && this.arrayindexplaceholders[1] >= this.selectedcolumnminindex && this.arrayindexplaceholders[1] <= this.selectedcolumnmaxindex
									? 'mdi:square-medium'
									: 'mdi:square-medium-outline'}
								style="color:${this.color};"
								width=${Misc.IconifySize('18')}
								height=${Misc.IconifySize('18')}
							></iconify-icon>
						</button>
					</div>
					<div class="flex flex-col space-y-1">
						${(() => {
							let templates: TemplateResult<1>[] = []

							for (let rowIndex = 0; rowIndex < this._totalNoOfRows; rowIndex++) {
								let rowField = structuredClone(this.field)

								if (typeof rowField[MetadataModel.FgProperties.FIELD_UI] !== 'string' || (rowField[MetadataModel.FgProperties.FIELD_UI] as string).length === 0) {
									templates.push(html`<div class="text-error">...field ui is not valid...</div>`)
									continue
								}

								if (rowField[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] && typeof rowField[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] === 'number') {
									rowField[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] = 1
								}

								templates.push(html`
									<section class="flex space-x-1 w-fit">
										${(() => {
											if (typeof rowField[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] !== 'number' || rowField[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] !== 1) {
												if (typeof rowField[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] !== 'number') {
													rowField[MetadataModel.FgProperties.FIELD_GROUP_NAME] = `${MetadataModel.GetFieldGroupName(rowField)} #${rowIndex + 1}`
													return html` <div class="font-bold text-lg h-full self-start">${rowIndex + 1}</div> `
												}
											}

											return nothing
										})()}
										${(() => {
											switch (rowField[MetadataModel.FgProperties.FIELD_UI] as MetadataModel.FieldUi) {
												case MetadataModel.FieldUi.TEXT:
												case MetadataModel.FieldUi.TEXTAREA:
													return html`
														<metadata-model-datum-input-column-field-text
															.color=${this.color}
															.field=${rowField}
															.arrayindexplaceholders=${rowField[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] ? this.arrayindexplaceholders : [...this.arrayindexplaceholders, rowIndex]}
															.getdata=${this.getdata}
															.deletedata=${this.deletedata}
															.updatedata=${this.updatedata}
														></metadata-model-datum-input-column-field-text>
													`
												case MetadataModel.FieldUi.NUMBER:
													return html`
														<metadata-model-datum-input-column-field-number
															.color=${this.color}
															.field=${rowField}
															.arrayindexplaceholders=${rowField[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] ? this.arrayindexplaceholders : [...this.arrayindexplaceholders, rowIndex]}
															.getdata=${this.getdata}
															.deletedata=${this.deletedata}
															.updatedata=${this.updatedata}
														></metadata-model-datum-input-column-field-number>
													`
												case MetadataModel.FieldUi.CHECKBOX:
													return html`
														<metadata-model-datum-input-column-field-checkbox
															.color=${this.color}
															.field=${rowField}
															.arrayindexplaceholders=${rowField[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] ? this.arrayindexplaceholders : [...this.arrayindexplaceholders, rowIndex]}
															.getdata=${this.getdata}
															.deletedata=${this.deletedata}
															.updatedata=${this.updatedata}
															.includeplaceholdertext=${false}
														></metadata-model-datum-input-column-field-checkbox>
													`
												case MetadataModel.FieldUi.DATETIME:
													return html`
														<metadata-model-datum-input-column-field-date-time
															.color=${this.color}
															.field=${rowField}
															.arrayindexplaceholders=${rowField[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] ? this.arrayindexplaceholders : [...this.arrayindexplaceholders, rowIndex]}
															.getdata=${this.getdata}
															.deletedata=${this.deletedata}
															.updatedata=${this.updatedata}
														></metadata-model-datum-input-column-field-date-time>
													`
												case MetadataModel.FieldUi.SELECT:
													return html`
														<metadata-model-datum-input-column-field-select
															.color=${this.color}
															.field=${rowField}
															.arrayindexplaceholders=${this.arrayindexplaceholders}
															.getdata=${this.getdata}
															.deletedata=${this.deletedata}
															.updatedata=${this.updatedata}
														></metadata-model-datum-input-column-field-select>
													`
												default:
													return html`<div class="text-error">...field ui is not valid/supported...</div>`
											}
										})()}
										<drop-down
											.showdropdowncontent=${this._showRowMenuIndex === `${rowIndex}`}
											drop-down:showdropdowncontentupdate=${(e: CustomEvent) => {
												this._showRowMenuIndex = e.detail.value ? `${rowIndex}` : ''
											}}
										>
											<button
												slot="header"
												class="btn btn-circle btn-xs btn-ghost self-start"
												@click=${() => {
													this._showRowMenuIndex = this._showRowMenuIndex === `${rowIndex}` ? '' : `${rowIndex}`
												}}
											>
												<iconify-icon icon="mdi:dots-vertical" style="color: black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
											</button>
											<div slot="content" class="flex flex-col w-full bg-white p-1 rounded-md shadow-md shadow-gray-800 min-w-[200px]">
												${(() => {
													if (typeof rowField[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number' && rowField[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] !== 1 && rowField[MetadataModel.FgProperties.FIELD_UI] !== MetadataModel.FieldUi.SELECT) {
														return html`
															<button
																class="btn btn-ghost p-1 w-full justify-start"
																@click=${() => {
																	if (typeof rowField[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number') {
																		if (rowField[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] < 1) {
																			this._totalNoOfRows += 1
																		} else {
																			if (this._totalNoOfRows < rowField[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]) {
																				this._totalNoOfRows += 1
																			}
																		}
																	} else {
																		this._totalNoOfRows += 1
																	}
																}}
																.disabled=${typeof rowField[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number' && rowField[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] > 1 && this._totalNoOfRows >= rowField[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]}
															>
																<div class="flex self-center">
																	<iconify-icon icon="mdi:plus" style="color:black;" width=${Misc.IconifySize('28')} height=${Misc.IconifySize('28')}></iconify-icon>
																</div>
																<div class="self-center font-bold">Add field data</div>
															</button>
														`
													} else {
														return nothing
													}
												})()}
												<button
													class="btn btn-ghost p-1 w-full justify-start"
													@click=${() => {
														this.deletedata(`${rowField[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])

														if (this._totalNoOfRows - 1 !== 0) {
															this._totalNoOfRows -= 1
														}
													}}
												>
													<div class="flex self-center">
														<iconify-icon icon="mdi:delete" style="color:black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
													</div>
													<div class="self-center font-bold">Delete field data</div>
												</button>
											</div>
										</drop-down>
									</section>
								`)
							}

							return templates
						})()}
					</div>
				</div>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-table-column': Component
	}
}
