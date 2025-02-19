import { html, LitElement, nothing, PropertyValues, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import { Task } from '@lit/task'
import MetadataModel from '$src/lib/metadata_model'
import Json from '$src/lib/json'

@customElement('metadata-model-view-datum')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) metadatamodel: any = {}
	@property({ type: Array }) data: any = {}
	@property({ type: String }) color: Theme.Color = Theme.Color.PRIMARY
	@property({ type: Object }) scrollelement: Element | undefined
	@property({ type: Number }) basestickyleft: number = 0
	@property({ type: Number }) basestickytop: number = 0
	@property({ type: Number }) scrollelementwidth: number = 0
	@property({ type: Number }) scrollelementheight: number = 0
	@property({ type: Number }) maxnoofgroupfields: number = 20

	@state() private _componentNested: boolean = false

	private _resizeObserver!: ResizeObserver

	private _importVirtualFlexScrollTask = new Task(this, {
		task: async () => {
			await import('$src/lib/components/vertical-flex-scroll/component')
		},
		args: () => []
	})

	private _importMMTableTask = new Task(this, {
		task: async () => {
			await import('$src/lib/components/metadata-model/view/table/component')
		},
		args: () => []
	})

	private _errorTaskHtmlTemplate = () => html`
		<div class="flex flex-col justify-center items-center w-full h-fit">
			<span class="w-fit text-error font-bold">Error: Could not download section content.</span>
		</div>
	`

	private _pendingTaskHtmlTemplate = () => html`
		<div class="flex flex-col justify-center items-center text-xl space-y-5 w-full h-fit">
			<div class="flex">
				<span class="loading loading-ball loading-sm text-accent"></span>
				<span class="loading loading-ball loading-md text-secondary"></span>
				<span class="loading loading-ball loading-lg text-primary"></span>
			</div>
		</div>
	`

	protected firstUpdated(_changedProperties: PropertyValues): void {
		this._resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target.id === 'scroll-element') {
					this.scrollelementwidth = entry.contentRect.width
					this.scrollelementheight = entry.contentRect.height
				}
			}
		})
	}

	private _rowColumnDatum(field: any, datum: any) {
		switch (field[MetadataModel.FgProperties.FIELD_DATATYPE] as MetadataModel.FieldType) {
			case MetadataModel.FieldType.BOOLEAN:
				if (datum === true || (typeof field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] !== 'undefined' && Json.AreValuesEqual(datum, field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]))) {
					return html`
						<div class="flex space-x-1 justify-center w-fit h-fit">
							<!--mdi:checkbox-marked source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${this.color}" d="m10 17l-5-5l1.41-1.42L10 14.17l7.59-7.59L19 8m0-5H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2" /></svg>
							${(() => {
								if (typeof field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] !== 'undefined') {
									return html`<div class="font-bold">(${field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]})</div>`
								}

								return nothing
							})()}
						</div>
					`
				}

				if (datum === false || (typeof field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] !== 'undefined' && Json.AreValuesEqual(datum, field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]))) {
					return html`
						<div class="flex space-x-1 justify-center w-fit h-fit">
							<!--mdi:close-box source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${this.color}" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3.4 14L12 13.4L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7L17 8.4L13.4 12l3.6 3.6z" /></svg>
							${(() => {
								if (typeof field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] !== 'undefined') {
									return html`<div class="font-bold">(${field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]})</div>`
								}

								return nothing
							})()}
						</div>
					`
				}

				return html`<div class="text-error font-bold">...no valid checkbox value found...</div>`
			default:
				if (typeof datum === 'undefined' || datum === null) {
					return html`<div class="font-bold italic">...no data...</div>`
				}

				if (field[MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.TIMESTAMP) {
					return html`<div>${this._formatDateTimeValue(field[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT], datum)}</div>`
				}

				return html`<div>${datum}</div>`
		}
	}

	private _formatDateTimeValue = (datetimeformat: string = 'yyyy-mm-dd hh:mm', datetimevalue: any) => {
		const getDateTimeUnitsString = (value: number) => (typeof value !== 'undefined' && value < 10 ? `0${value}` : `${value}`)
		const newDateValue = new Date(datetimevalue)
		switch (datetimeformat.toLowerCase()) {
			case 'yyyy-mm-dd hh:mm':
				return `${newDateValue.getFullYear()}-${getDateTimeUnitsString(newDateValue.getMonth() + 1)}-${getDateTimeUnitsString(newDateValue.getDate())} ${getDateTimeUnitsString(newDateValue.getHours())}:${getDateTimeUnitsString(newDateValue.getMinutes())}`
			case 'yyyy-mm-dd':
				return `${newDateValue.getFullYear()}-${getDateTimeUnitsString(newDateValue.getMonth() + 1)}-${getDateTimeUnitsString(newDateValue.getDate())}`
			case 'yyyy-mm':
				return `${newDateValue.getFullYear()}-${getDateTimeUnitsString(newDateValue.getMonth() + 1)}`
			case 'yyyy':
				return newDateValue.getFullYear()
			case 'mm':
				return newDateValue.getMonth() === 0
					? 'January'
					: newDateValue.getMonth() === 1
						? 'February'
						: newDateValue.getMonth() === 2
							? 'March'
							: newDateValue.getMonth() === 3
								? 'April'
								: newDateValue.getMonth() === 4
									? 'May'
									: newDateValue.getMonth() === 5
										? 'June'
										: newDateValue.getMonth() === 6
											? 'July'
											: newDateValue.getMonth() === 7
												? 'August'
												: newDateValue.getMonth() === 8
													? 'September'
													: newDateValue.getMonth() === 9
														? 'October'
														: newDateValue.getMonth() === 10
															? 'November'
															: 'December'
			case 'hh:mm':
				return `${getDateTimeUnitsString(newDateValue.getHours())}:${getDateTimeUnitsString(newDateValue.getMinutes())}`
			default:
				return datetimevalue ? datetimevalue : `...no data...`
		}
	}

	connectedCallback(): void {
		super.connectedCallback()

		if (typeof this.scrollelement !== 'undefined') {
			this._componentNested = true
		}

		if (typeof this.data === 'undefined') {
			this.data = {}
		}
	}

	protected render(): unknown {
		return html`
			<div id="scroll-element" class="flex-1 ${!this._componentNested ? 'overflow-auto max-h-full max-w-full' : 'min-h-fit min-w-fit'}">
				${(() => {
					if (typeof this.scrollelement === 'undefined') {
						;(async () => {
							await new Promise((resolve: (e: Element) => void) => {
								if ((this.shadowRoot as ShadowRoot).querySelector('#scroll-element')) {
									resolve((this.shadowRoot as ShadowRoot).querySelector('#scroll-element') as Element)
									return
								}

								const observer = new MutationObserver(() => {
									if ((this.shadowRoot as ShadowRoot).querySelector('#scroll-element')) {
										resolve((this.shadowRoot as ShadowRoot).querySelector('#scroll-element') as Element)
										observer.disconnect()
									}
								})

								observer.observe(this.shadowRoot as ShadowRoot, {
									childList: true,
									subtree: true
								})
							})
								.then((e) => {
									this.scrollelement = e
									this._resizeObserver.observe(e)
								})
								.catch((err) => {
									console.error('get scroll-element failed', err)
								})
						})()

						return html`
							<div class="flex">
								<span class="loading loading-spinner loading-md"></span>
							</div>
						`
					}

					if (Array.isArray(this.metadatamodel[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
						if (this.metadatamodel[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS].length > this.maxnoofgroupfields || (Array.isArray(this.data) && this.data.length > 1)) {
							return this._importMMTableTask.render({
								pending: () => this._pendingTaskHtmlTemplate(),
								complete: () => html`
									<div class="border-[1px] border-gray-400 h-fit max-h-full max-w-full">
										<metadata-model-view-table
											.color=${this.color}
											.metadatamodel=${this.metadatamodel}
											.data=${this.data}
											.addclickcolumn=${false}
											.scrollelement=${this.scrollelement}
											.scrollelementheight=${this.scrollelementheight}
											.scrollelementwidth=${this.scrollelementwidth}
											.basestickytop=${this.basestickytop}
										></metadata-model-view-table>
									</div>
								`,
								error: (e) => {
									console.error(e)
									return this._errorTaskHtmlTemplate()
								}
							})
						} else {
							return this._importVirtualFlexScrollTask.render({
								pending: () => this._pendingTaskHtmlTemplate(),
								complete: () => html`
									<virtual-flex-scroll
										class="w-full h-fit"
										.data=${this.metadatamodel[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]}
										.scrollelement=${this.scrollelement}
										.enablescrollintoview=${false}
										.foreachrowrender=${(datum: string, _: number) => {
											const fieldgroup = this.metadatamodel[MetadataModel.FgProperties.GROUP_FIELDS][0][datum]
											const rowdata = (Array.isArray(this.data) ? (this.data.length === 1 ? this.data[0] : {}) : this.data)[datum]
											if (MetadataModel.IsGroupReadOrderOfFieldsValid(fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
												return html`
													<div class="flex flex-col pb-2">
														<header
															class="flex h-[24px] sticky z-[2] ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'} shadow-sm shadow-gray-800"
															style="top: ${this.basestickytop}px;"
														>
															<div class="sticky left-0 pl-1">${MetadataModel.GetFieldGroupName(fieldgroup)}</div>
														</header>
														<metadata-model-view-datum
															class="z-[1] pl-1 pr-1 ${this._componentNested ? 'shadow-inner shadow-gray-800':''}"
															.color=${this.color}
															.basestickytop=${this.basestickytop + 24}
															.metadatamodel=${fieldgroup}
															.data=${rowdata}
															.scrollelement=${this.scrollelement}
															.scrollelementheight=${this.scrollelementheight}
															.scrollelementwidth=${this.scrollelementwidth}
														></metadata-model-view-datum>
													</div>
												`
											}

											return html`
												<div class="pt-2 pb-2">
													${(() => {
														if (Array.isArray(rowdata)) {
															if (rowdata.length === 1) {
																return html`
																	<div class="flex flex-col">
																		<div>${MetadataModel.GetFieldGroupName(fieldgroup)}</div>
																		<div class="p-1 border-2 rounded-md ${this.color === Theme.Color.PRIMARY ? 'border-primary' : this.color === Theme.Color.SECONDARY ? 'border-secondary' : 'border-accent'}">${this._rowColumnDatum(fieldgroup, rowdata[0])}</div>
																	</div>
																`
															}

															return html`
																<div
																	class="rounded-md self-center flex flex-col ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content shadow-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content shadow-secondary-content'
																			: 'bg-accent text-accent-content shadow-accent-content'}"
																>
																	<header class="h-[6px] bg-transparent"></header>
																	<main style="grid-template-columns: repeat(2, auto);" class="relative grid overflow-auto min-w-[200px] max-h-[400px] w-fit h-fit">
																		<header style="grid-column:1/3; grid-template-columns: subgrid;" class="grid h-fit sticky top-0 z-[2] font-bold text-sm shadow-sm ">
																			<div
																				class="sticky left-0 shadow-sm min-w-[5px] p-1 ${this.color === Theme.Color.PRIMARY
																					? 'bg-primary text-primary-content shadow-primary-content'
																					: this.color === Theme.Color.SECONDARY
																						? 'bg-secondary text-secondary-content shadow-secondary-content'
																						: 'bg-accent text-accent-content accent-primary-content'}"
																			>
																				#
																			</div>
																			<div class="p-1">${MetadataModel.GetFieldGroupName(fieldgroup)}</div>
																		</header>
																		<main style="grid-column:1/3; grid-template-columns: subgrid;" class="grid text-xs z-[1]">
																			${(rowdata as any[]).map((rd, index) => {
																				return html`
																					<div
																						style="grid-column:1/3; grid-template-columns: subgrid;"
																						class="grid${index > 0 ? ` border-t-[1px] ${this.color === Theme.Color.PRIMARY ? 'border-secondary-content' : this.color === Theme.Color.SECONDARY ? 'border-accent-content' : 'border-primary-content'}` : ''}"
																					>
																						<div
																							class="font-bold p-1 flex sticky left-0 shadow-sm ${this.color === Theme.Color.PRIMARY
																								? 'bg-primary text-primary-content shadow-primary-content'
																								: this.color === Theme.Color.SECONDARY
																									? 'bg-secondary text-secondary-content shadow-secondary-content'
																									: 'bg-accent text-accent-content accent-primary-content'}"
																						>
																							<div class="self-center">${index + 1}</div>
																						</div>
																						<div class="flex p-1">${this._rowColumnDatum(fieldgroup, rd)}</div>
																					</div>
																				`
																			})}
																		</main>
																	</main>
																	<footer class="h-[6px] bg-transparent"></footer>
																</div>
															`
														}

														return html`
															<div class="flex flex-col space-y-1">
																<div>${MetadataModel.GetFieldGroupName(fieldgroup)}</div>
																<div class="p-1 border-2 rounded-md ${this.color === Theme.Color.PRIMARY ? 'border-primary' : this.color === Theme.Color.SECONDARY ? 'border-secondary' : 'border-accent'}">${this._rowColumnDatum(fieldgroup, rowdata)}</div>
															</div>
														`
													})()}
												</div>
											`
										}}
									></virtual-flex-scroll>
								`,
								error: (e) => {
									console.error(e)
									return this._errorTaskHtmlTemplate()
								}
							})
						}
					}

					return nothing
				})()}
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-view-datum': Component
	}
}
