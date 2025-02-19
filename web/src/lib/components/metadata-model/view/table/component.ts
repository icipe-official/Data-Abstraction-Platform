import Theme from '$src/lib/theme'
import { html, LitElement, nothing, PropertyValues, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import MetadataModel from '$src/lib/metadata_model'
import Papa from 'papaparse'
import { cache } from 'lit/directives/cache.js'
import { keyed } from 'lit/directives/keyed.js'
import '$src/lib/components/drop-down/component'
import Json from '$src/lib/json'

@customElement('metadata-model-view-table')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) metadatamodel: any = {}
	@property({ type: Array }) data: any[] = []
	@property({ type: String }) color: Theme.Color = Theme.Color.PRIMARY
	@property({ type: Boolean }) addselectcolumn: boolean = false
	@property({ type: Boolean }) addclickcolumn: boolean = true
	@property({ type: Boolean }) multiselectcolumns: boolean = true
	@property({ type: Array }) selecteddataindexes: number[] = []
	@property({ type: Array }) filterincludeindexes: number[] = []
	@property({ type: Array }) selecteddataindexesactions: { actionName: string; action: (selecteddataindexes: number[]) => void }[] = []
	@property({ type: Object }) scrollelement: Element | undefined
	@property({ type: Number }) basestickyleft: number = 0
	@property({ type: Number }) basestickytop: number = 0
	@property({ type: Number }) scrollelementwidth: number = 0
	@property({ type: Number }) scrollelementheight: number = 0

	private _dataFields: (MetadataModel.IMetadataModel | any)[] = []

	private _objectTo2DArray!: MetadataModel.ConvertObjectsTo2DArray

	@state() private _currentOpenDropdownID: string = ''

	@state() private _tableViewIn2DStateChanged: boolean = true
	@state() private _columnDataFieldsLockStateChanged: boolean = true
	@state() private _lockedColumnData2DFieldsIndex: number[] = []
	@state() private _unlockedColumnData2DFieldsIndex: number[] = []

	private readonly NO_OF_RENDER_CONTENT_TO_ADD: number = 20
	private _topHeaderResizeObserved: boolean = false
	private _columnHeaderLockedResizeObserved: boolean = false

	@state() private _unlockedColumnStartIndex: number = 0
	@state() private _unlockedColumnEndIndex: number = 0

	private _rowRenderTrackers: { [type: string]: RenderTracker } = {}
	private _rowRenderTrackerStartObserved: boolean = false
	private _rowRenderTrackerEndObserved: boolean = false

	@state() private _rowStartIndex: number = 0
	@state() private _rowEndIndex: number = 10
	private _rowItemsOutOfView: number[] = []

	@state() private _rowStartAddContentTimeout?: number
	private _rowAddContentAtStartPosition(startIndex: number) {
		this._rowStartIndex = startIndex - this.NO_OF_RENDER_CONTENT_TO_ADD > 0 ? startIndex - this.NO_OF_RENDER_CONTENT_TO_ADD : 0
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
					e.scrollIntoView({ behavior: 'smooth', block: 'center' })
				})
				.catch((err) => {
					console.error(this.localName, 'Cannot scroll to item at index', previousStartIndex, 'failed', err)
				})
		})(startIndex + this.NO_OF_RENDER_CONTENT_TO_ADD)

		this._rowStartAddContentTimeout = undefined
	}

	@state() private _rowEndAddContentTimeout?: number
	private _rowAddContentAtEndPosition(endIndex: number) {
		this._rowEndIndex = endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD < this.data.length ? endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD : this.data.length - 1
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
					e.scrollIntoView({ behavior: 'smooth', block: 'center' })
				})
				.catch((err) => {
					console.error(this.localName, 'Cannot scroll to item at index', endIndex, 'failed', err)
				})
		})()

		this._rowEndAddContentTimeout = undefined
	}

	private _rowStartEndIntersectionobserver!: IntersectionObserver
	private _rowContentItemIntersectionObserver!: IntersectionObserver
	private _resizeObserver!: ResizeObserver

	@state() private _topHeaderHeight: number = 0
	@state() private _columnHeaderLockedWidth: number = 0

	protected firstUpdated(_changedProperties: PropertyValues): void {
		this._resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target.id === 'top-header') {
					this._topHeaderHeight = entry.contentRect.height
					continue
				}

				if (entry.target.id === 'column-header-locked') {
					this._columnHeaderLockedWidth = entry.contentRect.width
					continue
				}

				if (entry.target.id === 'scroll-element') {
					this.scrollelementwidth = entry.contentRect.width
					this.scrollelementheight = entry.contentRect.height
				}
			}
		})
	}

	private _columnHeaderHtmlTemplate(columnIndex: number, dfIndex: number) {
		const fieldGroup = this._dataFields[dfIndex]
		let columnId = fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (typeof fieldGroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] === 'number') {
			columnId += `@${fieldGroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX]}`
		}

		return keyed(
			`${columnIndex}-${dfIndex}`,
			html`
				<div id="${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] ? 'locked' : 'unlocked'}-column-${columnIndex}" class="flex flex-col self-center h-full ${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] ? '' : 'w-full min-w-fit'}">
					${(() => {
						if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
							return nothing
						}

						return html`
							<drop-down
								.showdropdowncontent=${this._currentOpenDropdownID === columnId}
								@drop-down:showdropdowncontentupdate=${(e: CustomEvent) => {
									this._currentOpenDropdownID = e.detail.value ? columnId : ''
								}}
							>
								<div slot="header" class="min-w-[120px] flex space-x-1 p-1 w-fit h-full sticky ${!fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] ? ' right-0' : ''}" style="left: ${this.basestickyleft + this._columnHeaderLockedWidth}px;">
									<button
										class="w-fit h-fit p-0 self-center"
										@click=${() => {
											this._currentOpenDropdownID = this._currentOpenDropdownID === columnId ? '' : columnId
										}}
									>
										<!--mdi:dots-vertical source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path fill="${Theme.GetColorContent(this.color)}" d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2" />
										</svg>
									</button>
									<div class="self-center">${columnIndex + 1} - ${MetadataModel.GetFieldGroupName(fieldGroup)}</div>
									${(() => {
										if (typeof fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0) {
											const dropdownColumnID = `${columnId}-${MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION}`
											return html`
												<drop-down
													.showdropdowncontent=${this._currentOpenDropdownID === dropdownColumnID}
													@drop-down:showdropdowncontentupdate=${(e: CustomEvent) => {
														this._currentOpenDropdownID = e.detail.value ? dropdownColumnID : ''
													}}
												>
													<button slot="header" class="btn btn-circle btn-sm btn-ghost" @click=${() => (this._currentOpenDropdownID = this._currentOpenDropdownID === dropdownColumnID ? '' : dropdownColumnID)}>
														<!--mdi:question-mark-circle source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
															<path
																fill="${Theme.GetColorContent(this.color)}"
																d="m15.07 11.25l-.9.92C13.45 12.89 13 13.5 13 15h-2v-.5c0-1.11.45-2.11 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41a2 2 0 0 0-2-2a2 2 0 0 0-2 2H8a4 4 0 0 1 4-4a4 4 0 0 1 4 4a3.2 3.2 0 0 1-.93 2.25M13 19h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
															/>
														</svg>
													</button>

													<div
														slot="content"
														class="min-w-fit max-w-[700px] overflow-auto max-h-[200px] flex flex-wrap text-sm shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
															? 'bg-primary text-primary-content'
															: this.color === Theme.Color.SECONDARY
																? 'bg-secondary text-secondary-content'
																: 'bg-accent text-accent-content'}"
													>
														${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}
													</div>
												</drop-down>
											`
										}

										return nothing
									})()}
								</div>
								<div slot="content" class="min-w-[120px] shadow-sm shadow-gray-800 p-1 rounded-md bg-white text-black w-full flex flex-col">
									<button
										class="flex w-full space-x-1"
										@click=${() => {
											if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]) {
												delete fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]
											} else {
												fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] = true
											}
											this._currentOpenDropdownID = ''
											this.dispatchEvent(
												new CustomEvent('metadata-model-view-table:updatefieldgroup', {
													detail: {
														value: fieldGroup
													}
												})
											)
											this._columnDataFieldsLockStateChanged = true
										}}
									>
										<div class="w-fit h-fit self-center">
											${(() => {
												if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]) {
													return html`
														<!--mdi:lock-open-variant source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
															<path fill="black" d="M18 1c-2.76 0-5 2.24-5 5v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12c1.11 0 2-.89 2-2V10a2 2 0 0 0-2-2h-1V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2h2V6c0-2.76-2.24-5-5-5m-8 12a2 2 0 0 1 2 2c0 1.11-.89 2-2 2a2 2 0 1 1 0-4" />
														</svg>
													`
												}

												return html`
													<!--mdi:lock source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path fill="black" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
													</svg>
												`
											})()}
										</div>
										<div class="w-fit h-fit self-center">${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] ? 'unfreeze' : 'freeze'} column</div>
									</button>
									<button
										class="flex w-full space-x-1"
										@click=${() => {
											fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
											this._currentOpenDropdownID = ''
											this.dispatchEvent(
												new CustomEvent('metadata-model-view-table:updatefieldgroup', {
													detail: {
														value: fieldGroup
													}
												})
											)
										}}
									>
										<div class="w-fit h-fit self-center">
											<!--mdi:eye-off source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
												<path
													fill="black"
													d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
												/>
											</svg>
										</div>
										<div class="w-fit h-fit self-center">hide column</div>
									</button>
								</div>
							</drop-down>
						`
					})()}
				</div>
			`
		)
	}

	private _rowColumnDataHtmlTemplate(rowIndex: number, columnIndex: number, stickyleft: number, stickytop: number, rowdata: any) {
		return keyed(
			`${rowIndex}-${columnIndex}`,
			html`
				<div class="relative h-full min-h-full w-full min-w-fit p-1">
					<div style="left: ${stickyleft}px; top: ${stickytop}px;" class="sticky w-fit h-fit">
						${(() => {
							if (typeof rowdata === 'undefined' || rowdata === null || (Array.isArray(rowdata) && rowdata.length === 0)) {
								return html`<div class="font-bold italic text-xs">...no data...</div>`
							}

							if (MetadataModel.IsGroupReadOrderOfFieldsValid(this._dataFields[columnIndex][MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
								return html`
									<metadata-model-view-table
										.metadatamodel=${this._dataFields[columnIndex]}
										.data=${rowdata}
										.color=${this.color}
										.addclickcolumn=${false}
										.scrollelement=${this.scrollelement}
										.basestickyleft=${this.basestickyleft + this._columnHeaderLockedWidth > this.scrollelementwidth / 4 ? this.basestickyleft : this.basestickyleft + this._columnHeaderLockedWidth}
										.basestickytop=${this.basestickytop + this._topHeaderHeight > this.scrollelementheight / 4 ? this.basestickytop : this.basestickytop + this._topHeaderHeight}
										.scrollelementheight=${this.scrollelementheight}
										.scrollelementwidth=${this.scrollelementwidth}
									></metadata-model-view-table>
								`
							}

							if (Array.isArray(rowdata)) {
								if (rowdata.length === 1) {
									return this._rowColumnDatum(columnIndex, rowdata[0])
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
												<div class="p-1">${MetadataModel.GetFieldGroupName(this._dataFields[columnIndex])}</div>
											</header>
											<main style="grid-column:1/3; grid-template-columns: subgrid;" class="grid text-xs z-[1]">
												${(rowdata as any[]).map((rd, index) => {
													return html`
														<div style="grid-column:1/3; grid-template-columns: subgrid;" class="grid${index > 0 ? ` border-t-[1px] ${this.color === Theme.Color.PRIMARY ? 'border-secondary-content' : this.color === Theme.Color.SECONDARY ? 'border-accent-content' : 'border-primary-content'}` : ''}">
															<div
																class="font-bold p-1 flex sticky left-0 shadow-sm ${this.color === Theme.Color.PRIMARY
																	? 'bg-primary text-primary-content shadow-primary-content'
																	: this.color === Theme.Color.SECONDARY
																		? 'bg-secondary text-secondary-content shadow-secondary-content'
																		: 'bg-accent text-accent-content accent-primary-content'}"
															>
																<div class="self-center">${index + 1}</div>
															</div>
															<div class="flex p-1">${this._rowColumnDatum(columnIndex, rd)}</div>
														</div>
													`
												})}
											</main>
										</main>
										<footer class="h-[6px] bg-transparent"></footer>
									</div>
								`
							}

							return this._rowColumnDatum(columnIndex, rowdata)
						})()}
					</div>
				</div>
			`
		)
	}

	private _rowColumnDatum(columnIndex: number, datum: any) {
		switch (this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_DATATYPE] as MetadataModel.FieldType) {
			case MetadataModel.FieldType.BOOLEAN:
				if (
					datum === true ||
					(typeof this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] !== 'undefined' && Json.AreValuesEqual(datum, this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]))
				) {
					return html`
						<div class="flex space-x-1 justify-center w-fit h-fit">
							<!--mdi:checkbox-marked source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${this.color}" d="m10 17l-5-5l1.41-1.42L10 14.17l7.59-7.59L19 8m0-5H5c-1.11 0-2 .89-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2" /></svg>
							${(() => {
								if (typeof this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] !== 'undefined') {
									return html`<div class="font-bold">(${this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]})</div>`
								}

								return nothing
							})()}
						</div>
					`
				}

				if (
					datum === false ||
					(typeof this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] !== 'undefined' && Json.AreValuesEqual(datum, this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]))
				) {
					return html`
						<div class="flex space-x-1 justify-center w-fit h-fit">
							<!--mdi:close-box source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${this.color}" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3.4 14L12 13.4L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7L17 8.4L13.4 12l3.6 3.6z" /></svg>
							${(() => {
								if (typeof this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] !== 'undefined') {
									return html`<div class="font-bold">(${this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]})</div>`
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

				if (this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.TIMESTAMP) {
					return html`<div>${this._formatDateTimeValue(this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_DATETIME_FORMAT], datum)}</div>`
				}

				return html`<div class="${typeof datum === 'string' ? (datum.length > 20 ? 'min-w-[500px]' : 'break-words') : 'min-w-fit'}">${datum}</div>`
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

	private _resetSelectedFields() {
		this._selectedrowminindex = -1
		this._selectedrowmaxindex = -1
		this._selectedcolumnminindex = -1
		this._selectedcolumnmaxindex = -1
	}

	private _isSelectedFieldsIndexesValid = () => this._selectedrowminindex > -1 && this._selectedrowmaxindex > -1 && this._selectedcolumnminindex > -1 && this._selectedcolumnmaxindex > -1

	@state() private _totalNoOfColumns = 9

	private _columnStartHtmlTemplate(inHeader: boolean) {
		if (this._unlockedColumnStartIndex === 0) {
			return nothing
		}

		return html`
			<button class="btn btn-md btn-ghost" @click=${this._decreaseColumnUnlockedStartIndex}>
				<!--mdi:rewind source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${inHeader ? Theme.GetColorContent(this.color) : this.color}" d="m11.5 12l8.5 6V6m-9 12V6l-8.5 6z" /></svg>
			</button>
		`
	}

	private _decreaseColumnUnlockedStartIndex() {
		this._unlockedColumnStartIndex = this._unlockedColumnStartIndex - this._totalNoOfColumns >= 0 ? this._unlockedColumnStartIndex - this._totalNoOfColumns : 0
		this._unlockedColumnEndIndex = this._unlockedColumnStartIndex + this._totalNoOfColumns > this._unlockedColumnData2DFieldsIndex.length - 1 ? this._unlockedColumnData2DFieldsIndex.length - 1 : this._unlockedColumnStartIndex + this._totalNoOfColumns
		;(async (newEndIndex: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#unlocked-column-${newEndIndex}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#unlocked-column-${newEndIndex}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#unlocked-column-${newEndIndex}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#unlocked-column-${newEndIndex}`) as Element)
						observer.disconnect()
					}
				})

				observer.observe(this.shadowRoot as ShadowRoot, {
					childList: true,
					subtree: true
				})
			})
				.then((e) => {
					e.scrollIntoView({ behavior: 'smooth', inline: 'center' })
				})
				.catch((err) => {
					console.error(this.localName, 'Column cannot scroll to item at index', newEndIndex, 'failed', err)
				})
		})(this._unlockedColumnEndIndex - 2)
	}

	private _rowStartRenderTrackerHtmlTemplate() {
		if (typeof this._rowStartAddContentTimeout === 'number') {
			return html`
				<div class="flex">
					<span class="loading loading-spinner loading-md"></span>
				</div>
			`
		}

		if (this._rowStartIndex > 0) {
			return html`
				<button
					class="w-fit p-1"
					@click=${() => {
						if (typeof this._rowStartAddContentTimeout === 'number') {
							window.clearTimeout(this._rowStartAddContentTimeout)
							this._rowStartAddContentTimeout = undefined
						}

						if (typeof this._rowEndAddContentTimeout === 'number') {
							window.clearTimeout(this._rowEndAddContentTimeout)
							this._rowEndAddContentTimeout = undefined
						}

						this._rowEndAddContentTimeout = window.setTimeout(() => this._rowAddContentAtStartPosition(this._rowStartIndex), 500)
					}}
				>
					<!--mdi:chevron-double-up source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="black" d="M7.41 18.41L6 17l6-6l6 6l-1.41 1.41L12 13.83zm0-6L6 11l6-6l6 6l-1.41 1.41L12 7.83z" /></svg>
				</button>
			`
		}

		return nothing
	}

	private _columnEndHtmlTemplate(inHeader: boolean) {
		if (this._unlockedColumnEndIndex === this._unlockedColumnData2DFieldsIndex.length - 1) {
			return nothing
		}

		return html`
			<button class="btn btn-md btn-ghost" @click=${this._increaseColumnUnlockedEndIndex}>
				<!--mdi:fast-forward source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${inHeader ? Theme.GetColorContent(this.color) : this.color}" d="M13 6v12l8.5-6M4 18l8.5-6L4 6z" /></svg>
			</button>
		`
	}

	private _increaseColumnUnlockedEndIndex() {
		this._unlockedColumnEndIndex = this._unlockedColumnEndIndex + this._totalNoOfColumns < this._unlockedColumnData2DFieldsIndex.length ? this._unlockedColumnEndIndex + this._totalNoOfColumns : this._unlockedColumnData2DFieldsIndex.length - 1
		this._unlockedColumnStartIndex = this._unlockedColumnEndIndex - this._totalNoOfColumns > 0 ? this._unlockedColumnEndIndex - this._totalNoOfColumns : 0
		;(async (newStartIndex: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#unlocked-column-${newStartIndex}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#unlocked-column-${newStartIndex}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#unlocked-column-${newStartIndex}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#unlocked-column-${newStartIndex}`) as Element)
						observer.disconnect()
					}
				})

				observer.observe(this.shadowRoot as ShadowRoot, {
					childList: true,
					subtree: true
				})
			})
				.then((e) => {
					e.scrollIntoView({ behavior: 'smooth', inline: 'center' })
				})
				.catch((err) => {
					console.error(this.localName, 'Column cannot scroll to item at index', newStartIndex, 'failed', err)
				})
		})(this._unlockedColumnStartIndex + 2)
	}

	private _rowEndRenderTrackerHtmlTemplate() {
		if (this._rowEndIndex === this.data.length - 1) {
			return nothing
		}

		if (typeof this._rowEndAddContentTimeout === 'number') {
			return html`
				<div class="flex">
					<span class="loading loading-spinner loading-md"></span>
				</div>
			`
		}

		return html`
			<button
				class="w-fit p-1"
				@click=${() => {
					if (typeof this._rowEndAddContentTimeout === 'number') {
						window.clearTimeout(this._rowEndAddContentTimeout)
					}

					if (typeof this._rowEndAddContentTimeout === 'number') {
						window.clearTimeout(this._rowEndAddContentTimeout)
						this._rowEndAddContentTimeout = undefined
					}

					this._rowEndAddContentTimeout = window.setTimeout(() => this._rowAddContentAtEndPosition(this._rowEndIndex), 500)
				}}
			>
				<!--mdi:chevron-double-down source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="black" d="M16.59 5.59L18 7l-6 6l-6-6l1.41-1.41L12 10.17zm0 6L18 13l-6 6l-6-6l1.41-1.41L12 16.17z" /></svg>
			</button>
		`
	}

	@state() private _selectedrowminindex: number = -1
	@state() private _selectedrowmaxindex: number = -1
	@state() private _selectedcolumnminindex: number = -1
	@state() private _selectedcolumnmaxindex: number = -1

	@state() private _tableInsideTable: boolean = false

	connectedCallback(): void {
		super.connectedCallback()

		if (typeof this.scrollelement !== 'undefined') {
			this._tableInsideTable = true
		}

		this._rowEndIndex = this.data.length - 1

		try {
			let data2DFields = new MetadataModel.Extract2DFields(this.metadatamodel, false, false, false)
			data2DFields.Extract()
			data2DFields.Reposition()

			this._objectTo2DArray = new MetadataModel.ConvertObjectsTo2DArray(
				MetadataModel.MapFieldGroups(structuredClone(this.metadatamodel), (property) => {
					if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
						property[MetadataModel.FgProperties.FIELD_GROUP_KEY] = (property[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(this.metadatamodel[MetadataModel.FgProperties.FIELD_GROUP_KEY], '$')
					}
					return property
				}),
				structuredClone(data2DFields.Fields).map((d2dField) => {
					if (typeof d2dField[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
						d2dField[MetadataModel.FgProperties.FIELD_GROUP_KEY] = (d2dField[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(this.metadatamodel[MetadataModel.FgProperties.FIELD_GROUP_KEY], '$')
					}

					return d2dField
				}),
				false,
				false
			)
		} catch (e) {
			console.error(this.localName, this.metadatamodel[MetadataModel.FgProperties.FIELD_GROUP_KEY], e)
		}
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()

		if (typeof this._rowEndAddContentTimeout === 'number') {
			window.clearTimeout(this._rowEndAddContentTimeout)
		}

		this._rowStartEndIntersectionobserver.disconnect()
		this._rowContentItemIntersectionObserver.disconnect()

		if (typeof this._rowStartAddContentTimeout === 'number') {
			window.clearTimeout(this._rowStartAddContentTimeout)
		}
		if (typeof this._rowEndAddContentTimeout === 'number') {
			window.clearTimeout(this._rowEndAddContentTimeout)
		}
	}

	@state() private _rowNumberColumnMenuTextSearchFieldsQuery: string = ''
	@state() private _rowNumberColumnMenuShowLockedColumnsOnly: boolean = false
	@state() private _rowNumberColumnMenuShowHiddenColumnsOnly: boolean = false
	private _includeField(fIndex: number) {
		let includeField = true

		if (this._rowNumberColumnMenuTextSearchFieldsQuery.length > 0) {
			includeField =
				(typeof this._dataFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_NAME] === 'string' && (this._dataFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).toLocaleLowerCase().includes(this._rowNumberColumnMenuTextSearchFieldsQuery.toLocaleLowerCase())) ||
				(typeof this._dataFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this._dataFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).toLocaleLowerCase().includes(this._rowNumberColumnMenuTextSearchFieldsQuery.toLocaleLowerCase()))
		}

		if (this._rowNumberColumnMenuShowLockedColumnsOnly) {
			if (this._dataFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]) {
				includeField = true
			} else {
				includeField = false
			}
		}

		if (this._rowNumberColumnMenuShowHiddenColumnsOnly) {
			if (this._dataFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
				includeField = true
			} else {
				includeField = false
			}
		}

		return includeField
	}

	private _rowNumberColumnMenuFieldsHtmlTemplate(columnIndex: number, dfIndex: number) {
		const fieldGroup = this._dataFields[dfIndex]

		return html`
			<div class="flex space-x-1">
				<div class="self-center h-fit w-fit font-bold">${columnIndex + 1} (${dfIndex + 1})</div>
				<div class="self-center h-fit w-fit">${MetadataModel.GetFieldGroupName(fieldGroup)}</div>
				<div class="join">
					<div class="flex flex-col" @mouseover=${() => (this._showHintID = `column-header-menu-freeze-unfreeze-column-${columnIndex}-${dfIndex}`)} @mouseout=${() => (this._showHintID = '')}>
						<button
							class="join-item btn-xs btn-ghost"
							@click=${() => {
								if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]) {
									delete fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]
								} else {
									fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] = true
								}
								this.dispatchEvent(
									new CustomEvent('metadata-model-view-table:updatefieldgroup', {
										detail: {
											value: fieldGroup
										}
									})
								)
								this._columnDataFieldsLockStateChanged = true
							}}
						>
							${(() => {
								if (!fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]) {
									return html`
										<!--mdi:lock-open-variant source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path fill="black" d="M18 1c-2.76 0-5 2.24-5 5v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12c1.11 0 2-.89 2-2V10a2 2 0 0 0-2-2h-1V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2h2V6c0-2.76-2.24-5-5-5m-8 12a2 2 0 0 1 2 2c0 1.11-.89 2-2 2a2 2 0 1 1 0-4" />
										</svg>
									`
								}

								return html`
									<!--mdi:lock source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
										<path fill="black" d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
									</svg>
								`
							})()}
						</button>
						${(() => {
							if (this._showHintID === `column-header-menu-freeze-unfreeze-column-${columnIndex}-${dfIndex}`) {
								return html`<div class="relative">
									<div class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 bg-white">${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] ? 'unfreeze column' : 'freeze column'}</div>
								</div>`
							}

							return nothing
						})()}
					</div>
					<div class="flex flex-col" @mouseover=${() => (this._showHintID = `column-header-menu-show-hide-column-${columnIndex}-${dfIndex}`)} @mouseout=${() => (this._showHintID = '')}>
						<button
							class="join-item btn btn-xs btn-ghost"
							@click=${() => {
								if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
									delete fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]
								} else {
									fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
								}
								this.dispatchEvent(
									new CustomEvent('metadata-model-view-table:updatefieldgroup', {
										detail: {
											value: fieldGroup
										}
									})
								)
								this._columnDataFieldsLockStateChanged = true
							}}
						>
							${(() => {
								if (!fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
									return html`
										<!--mdi:eye source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path fill="${this.color}" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
										</svg>
									`
								}

								return html`
									<!--mdi:eye-off source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
										<path
											fill="${this.color}"
											d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
										/>
									</svg>
								`
							})()}
						</button>
						${(() => {
							if (this._showHintID === `column-header-menu-show-hide-column-${columnIndex}-${dfIndex}`) {
								return html`<div class="relative">
									<div class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 bg-white">${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] ? 'show column' : 'hide column'}</div>
								</div>`
							}

							return nothing
						})()}
					</div>
					${(() => {
						if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] || this._dataFields.length < this._totalNoOfColumns) {
							return nothing
						}

						return html`
							<div class="flex flex-col" @mouseover=${() => (this._showHintID = `column-header-menu-jump-to-column-${columnIndex}-${dfIndex}`)} @mouseout=${() => (this._showHintID = '')}>
								<button
									class="join-item btn btn-xs btn-ghost"
									@click=${() => {
										this._unlockedColumnStartIndex = columnIndex + this._totalNoOfColumns < this._unlockedColumnData2DFieldsIndex.length - 1 ? columnIndex : this._unlockedColumnData2DFieldsIndex.length - this._totalNoOfColumns
										this._unlockedColumnEndIndex = this._unlockedColumnStartIndex + this._totalNoOfColumns < this._unlockedColumnData2DFieldsIndex.length - 1 ? this._unlockedColumnStartIndex + this._totalNoOfColumns : this._unlockedColumnData2DFieldsIndex.length - 1
									}}
								>
									<!--mdi:jump source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
										<path fill="black" d="M12 14a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m11.46-5.14l-1.59 6.89L15 14.16l3.8-2.38A7.97 7.97 0 0 0 12 8c-3.95 0-7.23 2.86-7.88 6.63l-1.97-.35C2.96 9.58 7.06 6 12 6c3.58 0 6.73 1.89 8.5 4.72z" />
									</svg>
								</button>
								${(() => {
									if (this._showHintID === `column-header-menu-jump-to-column-${columnIndex}-${dfIndex}`) {
										return html`<div class="relative">
											<div class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 bg-white">jump to column</div>
										</div>`
									}

									return nothing
								})()}
							</div>
						`
					})()}
				</div>
			</div>
		`
	}

	@state() private _viewJsonOutput: boolean = false

	@state() private _showHintID: string = ''

	protected render(): unknown {
		if (this._tableViewIn2DStateChanged) {
			this._dataFields = []
			if (this.metadatamodel[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]) {
				let data2DFields = new MetadataModel.Extract2DFields(this.metadatamodel, false, false, false)
				data2DFields.Extract()
				data2DFields.Reposition()
				this._dataFields = structuredClone(data2DFields.Fields)
			} else {
				for (const fgKeySuffix of this.metadatamodel[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) {
					this._dataFields.push(this.metadatamodel[MetadataModel.FgProperties.GROUP_FIELDS][0][fgKeySuffix])
				}
			}
			this._unlockedColumnEndIndex = this._dataFields.length > this._totalNoOfColumns ? this._totalNoOfColumns : this._dataFields.length - 1
			this._tableViewIn2DStateChanged = false
			this._columnDataFieldsLockStateChanged = true
		}

		if (this._columnDataFieldsLockStateChanged) {
			this._lockedColumnData2DFieldsIndex = []
			this._unlockedColumnData2DFieldsIndex = []
			for (let dfIndex = 0; dfIndex < this._dataFields.length; dfIndex++) {
				if (this._dataFields[dfIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]) {
					this._lockedColumnData2DFieldsIndex = [...this._lockedColumnData2DFieldsIndex, dfIndex]
					continue
				}
				this._unlockedColumnData2DFieldsIndex = [...this._unlockedColumnData2DFieldsIndex, dfIndex]
			}
			this._columnDataFieldsLockStateChanged = false
		}

		if (this._unlockedColumnEndIndex > this._unlockedColumnData2DFieldsIndex.length - 1) {
			this._unlockedColumnEndIndex = this._unlockedColumnData2DFieldsIndex.length - 1
		}

		if (this._unlockedColumnStartIndex >= this._unlockedColumnEndIndex) {
			this._unlockedColumnStartIndex = this._unlockedColumnEndIndex - this._totalNoOfColumns > 0 ? this._unlockedColumnEndIndex - this._totalNoOfColumns : 0
		}

		return html`
			<div id="scroll-element" class="flex-1 grid ${!this._tableInsideTable ? 'overflow-auto max-h-full max-w-full' : 'min-h-fit min-w-fit'}" style="grid-template-columns: repeat(${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}, minmax(min-content,500px));">
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

					if (typeof this._rowStartEndIntersectionobserver === 'undefined') {
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
												if (typeof this._rowStartAddContentTimeout === 'number') {
													break
												}

												if (this._rowStartIndex > 0) {
													decrementStartIndex = true
													if (typeof this._rowEndAddContentTimeout === 'number') {
														window.clearTimeout(this._rowEndAddContentTimeout)
														this._rowEndAddContentTimeout = undefined
													}
												}
												break
											case 'end':
												if (typeof this._rowEndAddContentTimeout === 'number') {
													break
												}

												if (this._rowEndIndex < this.data.length - 1) {
													incrementEndIndex = true
													if (typeof this._rowStartAddContentTimeout === 'number') {
														window.clearTimeout(this._rowStartAddContentTimeout)
														this._rowStartAddContentTimeout = undefined
													}
												}
												break
										}
									}
								}

								if (decrementStartIndex) {
									if (typeof this._rowStartAddContentTimeout !== 'number') {
										this._rowStartAddContentTimeout = window.setTimeout(() => this._rowAddContentAtStartPosition(this._rowStartIndex), 500)
									}
								}

								if (incrementEndIndex) {
									if (typeof this._rowEndAddContentTimeout !== 'number') {
										this._rowEndAddContentTimeout = window.setTimeout(() => this._rowAddContentAtEndPosition(this._rowEndIndex), 500)
									}
								}

								if (this._rowItemsOutOfView.length > 0) {
									let minStartIndex = this._rowStartIndex
									let maxEndIndex = this._rowEndIndex
									for (const itemID of this._rowItemsOutOfView) {
										if (incrementEndIndex && itemID > minStartIndex && maxEndIndex - itemID >= this.NO_OF_RENDER_CONTENT_TO_ADD) {
											minStartIndex = itemID
											continue
										}

										if (decrementStartIndex && itemID < maxEndIndex && itemID - minStartIndex >= this.NO_OF_RENDER_CONTENT_TO_ADD) {
											maxEndIndex = itemID
											continue
										}
									}

									for (const itemID of structuredClone(this._rowItemsOutOfView) as number[]) {
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
								root: this.scrollelement
							}
						)
					}

					if (typeof this._rowContentItemIntersectionObserver === 'undefined') {
						this._rowContentItemIntersectionObserver = new IntersectionObserver(
							(entries) => {
								for (const entry of entries) {
									const renderItemElementID = /row-render-tracker-content-item-([0-9]+)/.exec(entry.target.id)
									if (renderItemElementID === null) {
										continue
									}

									const itemID = Number(renderItemElementID[1])
									if (typeof this._rowRenderTrackers[itemID] === 'undefined') {
										continue
									}

									this._rowRenderTrackers[itemID].ContentIntersectionRatio = entry.intersectionRatio

									if (this._rowRenderTrackers[itemID].ContentIntersectionRatio > 0) {
										this._rowRenderTrackers[itemID].ContentHasBeenInView = true
										if (this._rowItemsOutOfView.includes(itemID)) {
											this._rowItemsOutOfView = this._rowItemsOutOfView.filter((itemid) => itemid !== itemID)
										}
									} else {
										if (this._rowRenderTrackers[itemID].ContentHasBeenInView && !this._rowItemsOutOfView.includes(itemID)) {
											this._rowItemsOutOfView = [...this._rowItemsOutOfView, itemID]
										}
									}
								}
							},
							{
								root: this.scrollelement,
								rootMargin: '50px',
								threshold: [0.0, 0.25, 0.5, 0.75, 1.0]
							}
						)
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

					if (!this._topHeaderResizeObserved) {
						;(async () => {
							await new Promise((resolve: (e: Element) => void) => {
								if ((this.shadowRoot as ShadowRoot).querySelector('#top-header')) {
									resolve((this.shadowRoot as ShadowRoot).querySelector('#top-header') as Element)
									return
								}

								const observer = new MutationObserver(() => {
									if ((this.shadowRoot as ShadowRoot).querySelector('#top-header')) {
										resolve((this.shadowRoot as ShadowRoot).querySelector('#top-header') as Element)
										observer.disconnect()
									}
								})

								observer.observe(this.shadowRoot as ShadowRoot, {
									childList: true,
									subtree: true
								})
							}).then((e) => {
								this._resizeObserver.observe(e)
								this._topHeaderResizeObserved = true
							})
						})()
					}

					if (!this._columnHeaderLockedResizeObserved) {
						;(async () => {
							await new Promise((resolve: (e: Element) => void) => {
								if ((this.shadowRoot as ShadowRoot).querySelector('#column-header-locked')) {
									resolve((this.shadowRoot as ShadowRoot).querySelector('#column-header-locked') as Element)
									return
								}

								const observer = new MutationObserver(() => {
									if ((this.shadowRoot as ShadowRoot).querySelector('#column-header-locked')) {
										resolve((this.shadowRoot as ShadowRoot).querySelector('#column-header-locked') as Element)
										observer.disconnect()
									}
								})

								observer.observe(this.shadowRoot as ShadowRoot, {
									childList: true,
									subtree: true
								})
							}).then((e) => {
								this._resizeObserver.observe(e)
								this._columnHeaderLockedResizeObserved = true
							})
						})()
					}

					return html`
						<header
							id="top-header"
							class="grid sticky space-y-1 shadow-sm text-sm font-bold z-[3] shadow-gray-800 ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}"
							style="top: ${this.basestickytop}px; grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;"
						>
							<section class="z-[2] p-1 grid w-full h-fit" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3};">
								<div class="w-fit h-fit sticky flex space-x-2" style="left: ${this.basestickyleft}px;">
									<div class="flex">
										<drop-down
											.showdropdowncontent=${this._currentOpenDropdownID === 'header-menu-view-columns'}
											@drop-down:showdropdowncontentupdate=${(e: CustomEvent) => {
												this._currentOpenDropdownID = e.detail.value ? 'header-menu-view-columns' : ''
											}}
										>
											<div slot="header" class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-view-columns')} @mouseout=${() => (this._showHintID = '')}>
												<button
													class="btn btn-ghost self-start w-fit h-fit min-h-fit p-1"
													@click=${() => {
														this._currentOpenDropdownID = this._currentOpenDropdownID === 'header-menu-view-columns' ? '' : 'header-menu-view-columns'
													}}
												>
													<!--mdi:format-columns source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M3 3h8v2H3zm10 0h8v2h-8zM3 7h8v2H3zm10 0h8v2h-8zM3 11h8v2H3zm10 0h8v2h-8zM3 15h8v2H3zm10 0h8v2h-8zM3 19h8v2H3zm10 0h8v2h-8z" /></svg>
												</button>
												${(() => {
													if (this._showHintID === 'header-menu-view-columns') {
														return html`
															<div class="relative">
																<div
																	class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content'
																			: 'bg-accent text-accent-content'}"
																>
																	view column menu
																</div>
															</div>
														`
													}

													return nothing
												})()}
											</div>
											<div slot="content" class="shadow-sm shadow-gray-800 p-1 rounded-md bg-white text-black flex flex-col min-w-[500px] max-w-[800px] max-h-[800px] min-h-[200px] overflow-auto space-y-1">
												<div class="join w-full shadow-inner shadow-gray-800">
													${(() => {
														if (this._unlockedColumnStartIndex === 0) {
															return nothing
														}

														return html`
															<button class="join-item btn btn-md h-full ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}" @click=${this._decreaseColumnUnlockedStartIndex}>
																<!--mdi:rewind source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="m11.5 12l8.5 6V6m-9 12V6l-8.5 6z" /></svg>
															</button>
														`
													})()}
													<div class="join-item flex justify-center w-full min-h-full ">
														<div class="p-1 min-w-[150px]  h-fit self-center text-center">${this._unlockedColumnStartIndex + 1}/${this._unlockedColumnEndIndex + 1} of ${this._unlockedColumnData2DFieldsIndex.length} columns</div>
													</div>
													${(() => {
														if (this._unlockedColumnEndIndex === this._unlockedColumnData2DFieldsIndex.length - 1) {
															return nothing
														}

														return html`
															<button class="join-item btn btn-md h-full ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}" @click=${this._increaseColumnUnlockedEndIndex}>
																<!--mdi:fast-forward source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M7.41 18.41L6 17l6-6l6 6l-1.41 1.41L12 13.83zm0-6L6 11l6-6l6 6l-1.41 1.41L12 7.83z" /></svg>
															</button>
														`
													})()}
												</div>
												<div class="join">
													<input
														class="join-item input w-full min-w-[250px] ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
														type="search"
														placeholder="search columns..."
														@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
															this._rowNumberColumnMenuTextSearchFieldsQuery = e.currentTarget.value
														}}
														.value=${this._rowNumberColumnMenuTextSearchFieldsQuery}
													/>
													<div class="z-50 join-item flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-search-show-frozen-columns-only')} @mouseout=${() => (this._showHintID = '')}>
														<button
															class="join-item btn ${this._rowNumberColumnMenuShowLockedColumnsOnly ? (this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent') : 'btn-ghost'}"
															@click=${() => (this._rowNumberColumnMenuShowLockedColumnsOnly = !this._rowNumberColumnMenuShowLockedColumnsOnly)}
														>
															<!--mdi:lock source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path
																	fill="${this._rowNumberColumnMenuShowLockedColumnsOnly ? Theme.GetColorContent(this.color) : this.color}"
																	d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3"
																/>
															</svg>
														</button>
														${(() => {
															if (this._showHintID === 'header-menu-search-show-frozen-columns-only') {
																return html`
																	<div class="relative">
																		<div class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 bg-white text-black">show only frozen columns</div>
																	</div>
																`
															}

															return nothing
														})()}
													</div>
													<div class="z-50 join-item flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-search-show-hidden-columns-only')} @mouseout=${() => (this._showHintID = '')}>
														<button
															class="join-item btn ${this._rowNumberColumnMenuShowHiddenColumnsOnly ? (this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent') : 'btn-ghost'}"
															@click=${() => (this._rowNumberColumnMenuShowHiddenColumnsOnly = !this._rowNumberColumnMenuShowHiddenColumnsOnly)}
														>
															<!--mdi:eye-off source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path
																	fill="${this._rowNumberColumnMenuShowHiddenColumnsOnly ? Theme.GetColorContent(this.color) : this.color}"
																	d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
																/>
															</svg>
														</button>
														${(() => {
															if (this._showHintID === 'header-menu-search-show-hidden-columns-only') {
																return html`
																	<div class="relative">
																		<div class="z-50 absolute top-0 right-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 bg-white text-black">show only hidden columns</div>
																	</div>
																`
															}

															return nothing
														})()}
													</div>
												</div>
												<virtual-flex-scroll
													class="w-full h-full max-h-[30vh] shadow-inner shadow-gray-800 rounded-md p-1 flex flex-col"
													.data=${[
														...this._lockedColumnData2DFieldsIndex.map((dfIndex, cIndex) => (this._includeField(dfIndex) ? [cIndex, dfIndex] : [])).filter((v) => v.length === 2),
														...this._unlockedColumnData2DFieldsIndex.map((dfIndex, cIndex) => (this._includeField(dfIndex) ? [cIndex, dfIndex] : [])).filter((v) => v.length === 2)
													]}
													.foreachrowrender=${(datum: number[], _: number) => {
														return this._rowNumberColumnMenuFieldsHtmlTemplate(datum[0], datum[1])
													}}
												></virtual-flex-scroll>
											</div>
										</drop-down>
										<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-view-json-output')} @mouseout=${() => (this._showHintID = '')}>
											<button
												class="btn btn-ghost self-start w-fit h-fit min-h-fit p-1"
												@click=${() => {
													this._viewJsonOutput = !this._viewJsonOutput
												}}
											>
												<div class="flex flex-col justify-center">
													<div class="flex self-center">
														<!--mdi:code-json source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
															<path
																fill="${Theme.GetColorContent(this.color)}"
																d="M5 3h2v2H5v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3zm-7 12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1"
															/>
														</svg>
														${(() => {
															if (this._viewJsonOutput) {
																return html`
																	<!--mdi:close-circle source: https://icon-sets.iconify.design-->
																	<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
																		<path fill="${Theme.GetColorContent(this.color)}" d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" />
																	</svg>
																`
															}
															return nothing
														})()}
													</div>
												</div>
											</button>
											${(() => {
												if (this._showHintID === 'header-menu-view-json-output') {
													return html`<div class="relative">
														<div
															class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'}"
														>
															view json data
														</div>
													</div>`
												}

												return nothing
											})()}
										</div>
										<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-switch-view')} @mouseout=${() => (this._showHintID = '')}>
											<button
												class="btn btn-ghost self-start w-fit h-fit min-h-fit p-1"
												@click=${() => {
													if (this.metadatamodel[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]) {
														delete this.metadatamodel[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]
													} else {
														this.metadatamodel[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D] = true
													}
													this.dispatchEvent(
														new CustomEvent('metadata-model-view-table:updatefieldgroup', {
															detail: {
																value: this.metadatamodel
															}
														})
													)
													this._tableViewIn2DStateChanged = true
												}}
											>
												${(() => {
													if (this.metadatamodel[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]) {
														return html`
															<!--mdi:table-large source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path fill="${Theme.GetColorContent(this.color)}" d="M4 3h16a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 4v3h4V7zm6 0v3h4V7zm10 3V7h-4v3zM4 12v3h4v-3zm0 8h4v-3H4zm6-8v3h4v-3zm0 8h4v-3h-4zm10 0v-3h-4v3zm0-8h-4v3h4z" />
															</svg>
														`
													}

													return html`
														<!--mdi:file-table-box-multiple-outline source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
															<path fill="${Theme.GetColorContent(this.color)}" d="M3 5v16h16v2H3c-1.1 0-2-.9-2-2V5zm18-4H7c-1.11 0-2 .89-2 2v14c0 1.1.9 2 2 2h14c1.11 0 2-.89 2-2V3c0-1.1-.9-2-2-2m0 16H7V3h14zm-10-3H8v2h3zm4 0h-3v2h3zm-4-3H8v2h3zm4 0h-3v2h3zm-4-3H8v2h3zm4 0h-3v2h3z" />
														</svg>
													`
												})()}
											</button>
											${(() => {
												if (this._showHintID === 'header-menu-switch-view') {
													return html`<div class="relative">
														<div
															class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'}"
														>
															Switch to ${this.metadatamodel[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D] ? 'nested' : '2D'} view
														</div>
													</div>`
												}

												return nothing
											})()}
										</div>
										<div class="join flex">
											<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-export-selected-data')} @mouseout=${() => (this._showHintID = '')}>
												<button
													class="join-item btn btn-ghost self-start w-fit h-fit min-h-fit p-1"
													@click=${() => {
														try {
															let dataToParse: any[][] = [[]]
															let columnHeaderIndexes: number[] = []
															for (let cIndex = this._selectedcolumnminindex; cIndex <= this._selectedcolumnmaxindex; cIndex++) {
																if (this._dataFields[cIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
																	continue
																}
																columnHeaderIndexes.push(cIndex)
																dataToParse[0].push(MetadataModel.GetFieldGroupName(this._dataFields[cIndex]))
															}

															this._objectTo2DArray.ResetArray2D()
															this._objectTo2DArray.Convert(this.data)

															for (let rIndex = this._selectedrowminindex; rIndex <= this._selectedrowmaxindex; rIndex++) {
																if (rIndex > this.data.length - 1) {
																	break
																}

																let dataRow = []
																for (const chi of columnHeaderIndexes) {
																	dataRow.push(this._objectTo2DArray.Array2D[rIndex][chi])
																}

																dataToParse.push(dataRow)
															}
															const objectUrl = URL.createObjectURL(new Blob([Papa.unparse(dataToParse, { header: true })], { type: 'text/csv' }))
															const downloadLink = document.createElement('a')
															downloadLink.href = objectUrl
															downloadLink.setAttribute('download', `data.csv`)
															document.body.appendChild(downloadLink)
															downloadLink.click()
															document.body.removeChild(downloadLink)
															URL.revokeObjectURL(objectUrl)
														} catch (e) {
															console.error(e)
														} finally {
															this._objectTo2DArray.ResetArray2D()
														}
													}}
													.disabled=${!this._isSelectedFieldsIndexesValid()}
												>
													<div class="flex flex-col justify-center">
														<div class="flex self-center">
															<!--foundation:page-export-csv source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 100 100">
																<path
																	fill="${Theme.GetColorContent(this.color)}"
																	d="M94.284 65.553L75.825 52.411a1.25 1.25 0 0 0-1.312-.093c-.424.218-.684.694-.685 1.173l.009 6.221H57.231c-.706 0-1.391.497-1.391 1.204v11.442c0 .707.685 1.194 1.391 1.194h16.774v6.27c0 .478.184.917.609 1.136s.853.182 1.242-.097l18.432-13.228c.335-.239.477-.626.477-1.038v-.002c0-.414-.144-.8-.481-1.04"
																/>
																<path
																	fill="${Theme.GetColorContent(this.color)}"
																	d="M64.06 78.553h-6.49a1.73 1.73 0 0 0-1.73 1.73h-.007v3.01H15.191V36.16h17.723a1.73 1.73 0 0 0 1.73-1.73V16.707h21.188v36.356h.011a1.73 1.73 0 0 0 1.726 1.691h6.49c.943 0 1.705-.754 1.726-1.691h.004V12.5h-.005V8.48a1.73 1.73 0 0 0-1.73-1.73h-32.87L5.235 32.7v58.819c0 .956.774 1.73 1.73 1.73h57.089a1.73 1.73 0 0 0 1.73-1.73v-2.448h.005v-8.79a1.73 1.73 0 0 0-1.729-1.728"
																/>
																<path
																	fill="${Theme.GetColorContent(this.color)}"
																	d="M26.18 64.173c.831 0 1.55.623 1.786 1.342l2.408-1.121c-.553-1.273-1.771-2.685-4.193-2.685c-2.893 0-5.079 1.924-5.079 4.775c0 2.837 2.187 4.774 5.079 4.774c2.422 0 3.654-1.467 4.193-2.699l-2.408-1.107c-.235.719-.955 1.342-1.786 1.342c-1.342 0-2.242-1.024-2.242-2.311s.899-2.31 2.242-2.31m9.476 4.734a4.3 4.3 0 0 1-2.976-1.19l-1.453 2.076c.982.886 2.325 1.467 4.291 1.467c2.477 0 3.986-1.176 3.986-3.211c0-3.432-5.135-2.685-5.135-3.557c0-.235.152-.415.706-.415c.872 0 1.91.304 2.712.913l1.495-1.979c-1.052-.858-2.408-1.287-3.917-1.287c-2.533 0-3.833 1.495-3.833 3.059c0 3.64 5.148 2.74 5.148 3.626c0 .359-.498.498-1.024.498m7.615-7.045h-3.169l3.404 9.231h3.516l3.404-9.231h-3.169l-1.993 6.214z"
																/>
															</svg>
															<!--mdi:select source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 24 24">
																<path
																	fill="${Theme.GetColorContent(this.color)}"
																	d="M4 3h1v2H3V4a1 1 0 0 1 1-1m16 0a1 1 0 0 1 1 1v1h-2V3zm-5 2V3h2v2zm-4 0V3h2v2zM7 5V3h2v2zm14 15a1 1 0 0 1-1 1h-1v-2h2zm-6 1v-2h2v2zm-4 0v-2h2v2zm-4 0v-2h2v2zm-3 0a1 1 0 0 1-1-1v-1h2v2zm-1-6h2v2H3zm18 0v2h-2v-2zM3 11h2v2H3zm18 0v2h-2v-2zM3 7h2v2H3zm18 0v2h-2V7z"
																/>
															</svg>
														</div>
													</div>
												</button>
												${(() => {
													if (this._showHintID === 'header-menu-export-selected-data') {
														return html`<div class="relative">
															<div
																class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																	? 'bg-primary text-primary-content'
																	: this.color === Theme.Color.SECONDARY
																		? 'bg-secondary text-secondary-content'
																		: 'bg-accent text-accent-content'}"
															>
																export selected data to csv
															</div>
														</div> `
													}

													return nothing
												})()}
											</div>
										</div>
									</div>
								</div>
							</section>
							<section class="z-[1] grid w-full h-fit" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
								<div
									id="column-header-locked"
									style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid; left: ${this.basestickyleft}px;"
									class="z-[2] grid sticky shadow-sm ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content '}"
								>
									<div class="w-full h-full min-h-full p-1 flex justify-evenly space-x-1">
										<div class="h-full flex justify-center text-2xl w-[47px] font-bold">
											<div class="self-center h-fit w-fit">#</div>
										</div>
										${(() => {
											if (this.addselectcolumn) {
												return html`
													<div class="flex flex-col self-center h-fit w-fit" @mouseover=${() => (this._showHintID = 'header-menu-select-unselect-all-rows')} @mouseout=${() => (this._showHintID = '')}>
														<input
															class="self-center checkbox ${this.color === Theme.Color.ACCENT ? 'checkbox-primary' : this.color === Theme.Color.PRIMARY ? 'checkbox-secondary' : 'checkbox-accent'}"
															type="checkbox"
															.checked=${this._selectedrowminindex === 0 && this._selectedrowmaxindex === this.data.length - 1 && this._selectedcolumnminindex === 0 && this._selectedcolumnmaxindex === this._dataFields.length - 1}
															@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																if (e.currentTarget.checked) {
																	this._selectedcolumnminindex = 0
																	this._selectedcolumnmaxindex = this._dataFields.length - 1
																	this._selectedrowminindex = 0
																	this._selectedrowmaxindex = this.data.length - 1
																} else {
																	this._resetSelectedFields()
																}
															}}
														/>
														${(() => {
															if (this._showHintID === 'header-menu-select-unselect-all-rows') {
																return html`
																	<div class="relative">
																		<div
																			class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																				? 'bg-primary text-primary-content'
																				: this.color === Theme.Color.SECONDARY
																					? 'bg-secondary text-secondary-content'
																					: 'bg-accent text-accent-content'}"
																		>
																			select/unselect columns with data
																		</div>
																	</div>
																`
															}

															return nothing
														})()}
													</div>
												`
											}

											return nothing
										})()}
									</div>
									${this._lockedColumnData2DFieldsIndex.map((fIndex, index) => this._columnHeaderHtmlTemplate(index, fIndex))}
								</div>
								<div class="w-fit h-full flex flex-col justify-center">${this._columnStartHtmlTemplate(true)}</div>
								${(() => {
									let templates: TemplateResult<1>[] = []

									for (let index = this._unlockedColumnStartIndex; index <= this._unlockedColumnEndIndex; index++) {
										templates.push(html`${this._columnHeaderHtmlTemplate(index, this._unlockedColumnData2DFieldsIndex[index])}`)
									}

									return templates
								})()}
								<div class="w-fit h-full flex flex-col justify-center pr-1">${this._columnEndHtmlTemplate(true)}</div>
							</section>
						</header>
						<main class="grid z-[1]" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
							${(() => {
								if (this._viewJsonOutput) {
									this._rowRenderTrackerStartObserved = false
									this._topHeaderResizeObserved = false
									this._columnHeaderLockedResizeObserved = false

									return html`
										<pre class="grid bg-gray-700 text-white w-full h-fit shadow-inner shadow-gray-800 p-1" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3};">
												<code class="sticky left-0 w-fit h-fit">${JSON.stringify(this.data, null, 4)}</code>
											</pre>
									`
								}

								return html`
									<div id="row-render-tracker-start" class="grid bg-white shadow-sm shadow-gray-800" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
										<div style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;top: ${this.basestickytop + this._topHeaderHeight}px;left:${this.basestickyleft}px;" class="grid sticky bg-white shadow-sm shadow-gray-800 z-10">
											${(() => {
												let templates: TemplateResult<1>[] = []

												for (let index = 0; index < this._lockedColumnData2DFieldsIndex.length + 1; index++) {
													templates.push(html`
														<div class="w-full min-w-full h-fit">
															<div style="top: ${this.basestickytop + this._topHeaderHeight}px; left: ${this.basestickyleft + this._columnHeaderLockedWidth}px;" class="sticky flex space-x-1 w-fit">${this._rowStartRenderTrackerHtmlTemplate()}</div>
														</div>
													`)
												}

												return templates
											})()}
										</div>
										<div class="w-full h-full"></div>
										${(() => {
											let templates: TemplateResult<1>[] = []

											for (let index = this._unlockedColumnStartIndex; index <= this._unlockedColumnEndIndex; index++) {
												if (typeof this._unlockedColumnData2DFieldsIndex[index] === 'undefined') {
													continue
												}
												if (this._dataFields[this._unlockedColumnData2DFieldsIndex[index]][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
													templates.push(html` <div class="w-fit h-full"></div> `)
												} else {
													templates.push(html`
														<div class="w-full min-w-full h-fit">
															<div style="top: ${this.basestickytop + this._topHeaderHeight}px; left: ${this.basestickyleft + this._columnHeaderLockedWidth}px;" class="sticky flex space-x-1 w-fit">${this._rowStartRenderTrackerHtmlTemplate()}</div>
														</div>
													`)
												}
											}

											return templates
										})()}
										<div class="w-full h-full"></div>
									</div>
									${cache(
										(() => {
											let templatesRow: TemplateResult<1>[] = []

											for (let rowIndex = this._rowStartIndex; rowIndex <= this._rowEndIndex; rowIndex++) {
												if (typeof this._rowRenderTrackers[rowIndex] === 'undefined') {
													this._rowRenderTrackers[rowIndex] = {
														ContentIntersectionObserved: false,
														ContentIntersectionRatio: 0,
														ContentHasBeenInView: false
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
														})
														.catch((err) => {
															console.error('Observed item at index', rowIndex, 'failed', err)
														})
												})()

												let datum2D: any[][] = []
												if (this.metadatamodel[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]) {
													this._objectTo2DArray.ResetArray2D()
													this._objectTo2DArray.Convert([this.data[rowIndex]])
													datum2D = structuredClone(this._objectTo2DArray.Array2D)
												} else {
													datum2D = []
												}

												templatesRow.push(html`
													<div
														id="row-render-tracker-content-item-${rowIndex}"
														class="grid bg-white shadow-sm shadow-gray-800"
														style="${this.metadatamodel[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D] && datum2D.length > 0 ? `grid-row: span ${datum2D.length};` : ''} grid-column:span ${this._lockedColumnData2DFieldsIndex.length +
														(this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) +
														3}; grid-template-columns: subgrid;"
													>
														${(() => {
															if (this.metadatamodel[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]) {
																return html`
																	<div
																		style="grid-row: span ${datum2D.length}; grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;top: ${this.basestickytop + this._topHeaderHeight}px; left: ${this.basestickyleft}px;"
																		class="grid sticky bg-white shadow-sm shadow-gray-800 z-10"
																	>
																		<div class="w-full h-full min-h-full p-1 flex justify-evenly space-x-1" style="grid-row: span ${datum2D.length};">
																			${(() => {
																				if (this.addclickcolumn) {
																					return html`
																						<button
																							class="self-center btn btn-circle glass ${this.color === Theme.Color.PRIMARY
																								? 'btn-primary bg-primary text-primary-content'
																								: this.color === Theme.Color.SECONDARY
																									? 'btn-secondary bg-secondary text-secondary-content'
																									: 'btn-accent bg-accent text-accent-content'}"
																							@click=${() => {
																								this._currentOpenDropdownID = this._currentOpenDropdownID === `row-${rowIndex}` ? '' : `row-${rowIndex}`
																							}}
																							.disabled=${!this.addclickcolumn}
																						>
																							${rowIndex + 1}
																						</button>
																					`
																				}

																				return html` <div class="font-bold text-lg">${rowIndex + 1}</div> `
																			})()}
																			${(() => {
																				if (this.addselectcolumn) {
																					return html`
																						<input
																							class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
																							type="checkbox"
																							.checked=${rowIndex >= this._selectedrowminindex && rowIndex <= this._selectedrowmaxindex && this._selectedcolumnminindex === 0 && this._selectedcolumnmaxindex === this._dataFields.length - 1}
																							@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																								if (e.currentTarget.checked) {
																									this._selectedcolumnminindex = 0
																									this._selectedcolumnmaxindex = this._dataFields.length - 1
																									if (rowIndex < this._selectedrowminindex || this._selectedrowminindex === -1) {
																										this._selectedrowminindex = rowIndex
																									}
																									if (rowIndex > this._selectedrowmaxindex || this._selectedrowmaxindex === -1) {
																										this._selectedrowmaxindex = rowIndex
																									}
																								} else {
																									if (rowIndex === this._selectedrowminindex) {
																										this._selectedrowminindex += 1
																									}

																									if (rowIndex === this._selectedrowmaxindex) {
																										this._selectedrowmaxindex -= 1
																									}
																								}
																							}}
																						/>
																					`
																				}

																				return nothing
																			})()}
																		</div>
																		${(() => {
																			let templates2DRow: TemplateResult<1>[] = []

																			for (let dIndex = 0; dIndex < datum2D.length; dIndex++) {
																				templates2DRow.push(html`
																					${this._lockedColumnData2DFieldsIndex.map((columnIndex) => {
																						if (this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
																							return html` <div class="w-fit h-full"></div> `
																						}

																						return html` ${this._rowColumnDataHtmlTemplate(rowIndex, columnIndex, 0, this._topHeaderHeight, datum2D[dIndex][columnIndex])} `
																					})}
																				`)
																			}

																			return templates2DRow
																		})()}
																	</div>
																	<div class="w-fit h-full flex flex-col" style="grid-row: span ${datum2D.length};">
																		<div style="top: ${this.basestickytop + this._topHeaderHeight}px; left: ${this.basestickyleft + this._columnHeaderLockedWidth}px;" class="sticky w-fit h-fit">${this._columnStartHtmlTemplate(false)}</div>
																	</div>
																	<div class="grid" style="grid-row: span ${datum2D.length}; grid-column:span ${this._unlockedColumnEndIndex - this._unlockedColumnStartIndex + 1}; grid-template-columns: subgrid;">
																		${(() => {
																			let templates2DRow: TemplateResult<1>[] = []

																			for (let dIndex = 0; dIndex < datum2D.length; dIndex++) {
																				templates2DRow.push(html`
																					${(() => {
																						let templates2DRowColumns: TemplateResult<1>[] = []
																						for (let columnIndex = this._unlockedColumnStartIndex; columnIndex <= this._unlockedColumnEndIndex; columnIndex++) {
																							if (typeof this._unlockedColumnData2DFieldsIndex[columnIndex] === 'undefined') {
																								continue
																							}
																							if (this._dataFields[this._unlockedColumnData2DFieldsIndex[columnIndex]][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
																								templates2DRowColumns.push(html` <div class="w-fit h-full"></div> `)
																							} else {
																								templates2DRowColumns.push(html`
																									${this._rowColumnDataHtmlTemplate(rowIndex, this._unlockedColumnData2DFieldsIndex[columnIndex], this._columnHeaderLockedWidth, this._topHeaderHeight, datum2D[dIndex][this._unlockedColumnData2DFieldsIndex[columnIndex]])}
																								`)
																							}
																						}
																						return templates2DRowColumns
																					})()}
																				`)
																			}

																			return templates2DRow
																		})()}
																	</div>
																	<div class="w-fit h-full flex flex-col" style="grid-row: span ${datum2D.length};">
																		<div style="top: ${this.basestickytop + this._topHeaderHeight}px; left: ${this.basestickyleft + this._columnHeaderLockedWidth}px;" class="sticky w-fit h-fit">${this._columnEndHtmlTemplate(false)}</div>
																	</div>
																`
															}

															return html`
																<div style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;top: ${this.basestickytop + this._topHeaderHeight}px;left: ${this.basestickyleft}px;" class="grid sticky bg-white shadow-sm shadow-gray-800 z-10">
																	<div class="w-full h-full min-h-full flex">
																		<div class="w-full sticky left-0 bottom-0 h-fit p-1 flex justify-evenly space-x-1" style="top: ${this.basestickytop + this._topHeaderHeight}px;">
																			${(() => {
																				if (this.addclickcolumn) {
																					return html`
																						<button
																							class="self-center btn btn-circle glass ${this.color === Theme.Color.PRIMARY
																								? 'btn-primary bg-primary text-primary-content'
																								: this.color === Theme.Color.SECONDARY
																									? 'btn-secondary bg-secondary text-secondary-content'
																									: 'btn-accent bg-accent text-accent-content'}"
																							@click=${() => {
																								this._currentOpenDropdownID = this._currentOpenDropdownID === `row-${rowIndex}` ? '' : `row-${rowIndex}`
																							}}
																							.disabled=${!this.addclickcolumn}
																						>
																							${rowIndex + 1}
																						</button>
																					`
																				}

																				return html` <div class="font-bold text-lg">${rowIndex + 1}</div> `
																			})()}
																			${(() => {
																				if (this.addselectcolumn) {
																					return html`
																						<input
																							class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
																							type="checkbox"
																							.checked=${rowIndex >= this._selectedrowminindex && rowIndex <= this._selectedrowmaxindex && this._selectedcolumnminindex === 0 && this._selectedcolumnmaxindex === this._dataFields.length - 1}
																							@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																								if (e.currentTarget.checked) {
																									this._selectedcolumnminindex = 0
																									this._selectedcolumnmaxindex = this._dataFields.length - 1
																									if (rowIndex < this._selectedrowminindex || this._selectedrowminindex === -1) {
																										this._selectedrowminindex = rowIndex
																									}
																									if (rowIndex > this._selectedrowmaxindex || this._selectedrowmaxindex === -1) {
																										this._selectedrowmaxindex = rowIndex
																									}
																								} else {
																									if (rowIndex === this._selectedrowminindex) {
																										this._selectedrowminindex += 1
																									}

																									if (rowIndex === this._selectedrowmaxindex) {
																										this._selectedrowmaxindex -= 1
																									}
																								}
																							}}
																						/>
																					`
																				}

																				return nothing
																			})()}
																		</div>
																	</div>
																	${this._lockedColumnData2DFieldsIndex.map((columnIndex) => {
																		if (this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
																			return html` <div class="w-fit h-full"></div> `
																		}

																		return html`
																			${this._rowColumnDataHtmlTemplate(rowIndex, columnIndex, this.basestickyleft, this.basestickytop + this._topHeaderHeight, this.data[rowIndex][(this._dataFields[columnIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop() as string])}
																		`
																	})}
																</div>
																<div class="w-fit h-full flex flex-col">
																	<div style="top: ${this.basestickytop + this._topHeaderHeight}px; left: ${this.basestickyleft + this._columnHeaderLockedWidth}px;" class="sticky w-fit h-fit">${this._columnStartHtmlTemplate(false)}</div>
																</div>
																${(() => {
																	let templatesRowColumns: TemplateResult<1>[] = []

																	for (let columnIndex = this._unlockedColumnStartIndex; columnIndex <= this._unlockedColumnEndIndex; columnIndex++) {
																		if (typeof this._unlockedColumnData2DFieldsIndex[columnIndex] === 'undefined') {
																			continue
																		}
																		if (this._dataFields[this._unlockedColumnData2DFieldsIndex[columnIndex]][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
																			templatesRowColumns.push(html` <div class="w-fit h-full"></div> `)
																		} else {
																			templatesRowColumns.push(html`
																				${this._rowColumnDataHtmlTemplate(
																					rowIndex,
																					this._unlockedColumnData2DFieldsIndex[columnIndex],
																					this.basestickyleft + this._columnHeaderLockedWidth,
																					this.basestickytop + this._topHeaderHeight,
																					this.data[rowIndex][(this._dataFields[this._unlockedColumnData2DFieldsIndex[columnIndex]][MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop() as string]
																				)}
																			`)
																		}
																	}

																	return templatesRowColumns
																})()}
																<div class="w-fit h-full flex flex-col">
																	<div style="top: ${this.basestickytop + this._topHeaderHeight}px; left: ${this.basestickyleft + this._columnHeaderLockedWidth}px;" class="sticky w-fit h-fit">${this._columnEndHtmlTemplate(false)}</div>
																</div>
															`
														})()}
													</div>
												`)
											}

											return templatesRow
										})()
									)}
									<div id="row-render-tracker-end" class="grid bg-white shadow-sm shadow-gray-800" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
										<div style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;top: ${this.basestickytop + this._topHeaderHeight}px;left: ${this.basestickyleft}px;" class="grid sticky bg-white shadow-sm shadow-gray-800 z-10 rounded-bl-md">
											${(() => {
												let templates: TemplateResult<1>[] = []

												for (let index = 0; index < this._lockedColumnData2DFieldsIndex.length + 1; index++) {
													templates.push(html`
														<div class="w-full min-w-full h-full flex justify-center">
															<div class="sticky w-fit" style="left: ${this.basestickyleft}px;">${this._rowEndRenderTrackerHtmlTemplate()}</div>
														</div>
													`)
												}

												return templates
											})()}
										</div>
										<div class="w-full h-full"></div>
										${(() => {
											let templates: TemplateResult<1>[] = []

											for (let index = this._unlockedColumnStartIndex; index <= this._unlockedColumnEndIndex; index++) {
												if (typeof this._unlockedColumnData2DFieldsIndex[index] === 'undefined') {
													continue
												}
												if (this._dataFields[this._unlockedColumnData2DFieldsIndex[index]][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
													templates.push(html` <div class="w-fit h-full"></div> `)
												} else {
													templates.push(html`
														<div class="w-full min-w-full h-full min-h-full flex justify-center">
															<div style="left: ${this.basestickyleft + this._columnHeaderLockedWidth}px;" class="sticky w-fit">${this._rowEndRenderTrackerHtmlTemplate()}</div>
														</div>
													`)
												}
											}

											return templates
										})()}
										<div class="w-full h-full"></div>
									</div>
								`
							})()}
						</main>
					`
				})()}
				</div>
			</div>
				</div>
		`
	}
}

interface RenderTracker {
	ContentIntersectionObserved: boolean
	ContentHasBeenInView: boolean
	ContentIntersectionRatio: number
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-view-table': Component
	}
}
