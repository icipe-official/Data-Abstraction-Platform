import { html, LitElement, nothing, PropertyValues, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import Json from '$src/lib/json'
import './column/component'
import { cache } from 'lit/directives/cache.js'
import { keyed } from 'lit/directives/keyed.js'
import '$src/lib/components/vertical-flex-scroll/component'
import '../../tree/component'
import Papa from 'papaparse'

interface RenderTracker {
	ContentIntersectionObserved: boolean
	ContentHasBeenInView: boolean
	ContentIntersectionRatio: number
}

@customElement('metadata-model-datum-input-view-table')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: Object }) group: any = {}
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ type: Number }) grouprowindex: number | undefined
	@property({ type: String }) color!: Theme.Color
	@property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
	@property({ attribute: false }) getdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
	@property({ attribute: false }) updatedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
	@property({ attribute: false }) deletedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ type: Number }) totalnoofrows: number = 100
	@property({ type: Number }) basestickytop: number = 0

	@state() private _data2DArray: any[][] = []
	private _data2DFields: (MetadataModel.IMetadataModel | any)[] = []

	private _2dArrayToObjects!: MetadataModel.Convert2DArrayToObjects

	@state() private _currentOpenDropdownID: string = ''

	@state() private _columnData2DFieldsLockStateChanged: boolean = true
	@state() private _lockedColumnData2DFieldsIndex: number[] = []
	@state() private _unlockedColumnData2DFieldsIndex: number[] = []

	private readonly NO_OF_RENDER_CONTENT_TO_ADD: number = 10

	private _columnHeaderResizeObserved: boolean = false
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
		this._rowEndIndex = endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD < this.totalnoofrows ? endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD : this.totalnoofrows - 1
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
	@state() private _columnHeaderHeight: number = 0
	@state() private _columnHeaderLockedWidth: number = 0

	protected firstUpdated(_changedProperties: PropertyValues): void {
		this._resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target.id === 'top-header') {
					this._topHeaderHeight = entry.contentRect.height
					continue
				}
				if (entry.target.id === 'column-header') {
					this._columnHeaderHeight = entry.contentRect.height
					continue
				}

				if (entry.target.id === 'column-header-locked') {
					this._columnHeaderLockedWidth = entry.contentRect.width
					continue
				}
			}
		})

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

								if (this._rowEndIndex < this.totalnoofrows - 1) {
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

	private _columnHeaderHtmlTemplate(columnIndex: number, dfIndex: number) {
		const fieldGroup = this._data2DFields[dfIndex]
		let columnId = fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (typeof fieldGroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] === 'number') {
			columnId += `@${fieldGroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX]}`
		}

		return html`
			<div id="${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] ? 'locked' : 'unlocked'}-column-${columnIndex}" class="flex flex-col self-center h-full ${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] ? '' : 'w-full min-w-fit'}">
				${(() => {
					if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
						return nothing
					}

					return html`
						<drop-down>
							<div slot="header" class="min-w-[120px] flex space-x-1 p-1 w-fit h-full${!fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] ? ' sticky right-0' : ''}" style="left: ${this._columnHeaderLockedWidth}px;">
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
										this.updatemetadatamodel(fieldGroup)
										this._columnData2DFieldsLockStateChanged = true
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
										this.updatemetadatamodel(fieldGroup)
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
	}

	private _updateData() {
		this._data2DArray = this._data2DArray.map((d2darray) => {
			if (typeof d2darray === 'undefined') {
				d2darray = []
			}

			if (d2darray.length !== this._data2DFields.length) {
				for (let i = d2darray.length; i < this._data2DFields.length; i++) {
					d2darray.push(undefined)
				}
			}

			return d2darray
		})

		this._2dArrayToObjects.Convert(this._data2DArray)
		if (typeof this.grouprowindex === 'number') {
			this.updatedata(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}[${this.grouprowindex}]`, this.arrayindexplaceholders, this._2dArrayToObjects.Objects[0])
		} else if (this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] === '$') {
			this.updatedata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders, this._2dArrayToObjects.Objects[0])
		} else {
			this.updatedata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders, this._2dArrayToObjects.Objects)
		}
		this._2dArrayToObjects.ResetObjects()
	}

	private _rowColumnDataHtmlTemplate(rowIndex: number, columnIndex: number, stickyleft: number, stickytop: number) {
		return keyed(
			`${rowIndex}-${columnIndex}`,
			html`
				<metadata-model-datum-input-table-column
					id="${rowIndex}-${columnIndex}"
					.field=${this._data2DFields[columnIndex]}
					.arrayindexplaceholders=${[rowIndex, columnIndex]}
					.color=${this.color}
					.stickyleft=${stickyleft}
					.stickytop=${stickytop}
					.getdata=${(_: string, arrayPlaceholderIndexes: number[]) => {
						return Json.GetValueInObject(this._data2DArray, arrayPlaceholderIndexes.join('.'))
					}}
					.updatedata=${(_: string, arrayPlaceholderIndexes: number[], value: any) => {
						Json.SetValueInObject(this._data2DArray, arrayPlaceholderIndexes.join('.'), value)
						this._updateData()
					}}
					.deletedata=${(_: string, arrayPlaceholderIndexes: number[]) => {
						if (this._data2DFields[arrayPlaceholderIndexes[1]][MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 1) {
							Json.SetValueInObject(this._data2DArray, arrayPlaceholderIndexes.join('.'), undefined)
						} else {
							Json.DeleteValueInObject(this._data2DArray, arrayPlaceholderIndexes.join('.'))
						}
						this._updateData()
					}}
					.selectedrowminindex=${this._selectedrowminindex}
					.selectedrowmaxindex=${this._selectedrowmaxindex}
					.selectedcolumnminindex=${this._selectedcolumnminindex}
					.selectedcolumnmaxindex=${this._selectedcolumnmaxindex}
					.updateselectedrowcolumnindex=${(row: number, column: number) => {
						if (this._copyModeActive) {
							if (row > this._data2DArray.length) {
								for (let rIndex = this._data2DArray.length; rIndex < row; rIndex++) {
									this._data2DArray.push([])
								}
							}

							if (this._data2DArray.length <= row + this._selectedrowmaxindex - this._selectedrowminindex) {
								for (let rIndex = this._data2DArray.length - 1; rIndex <= row + this._selectedrowmaxindex - this._selectedrowminindex; rIndex++) {
									this._data2DArray.push([])
								}
							}

							let scmi = -1
							for (let rIndex = row; rIndex <= row + this._selectedrowmaxindex - this._selectedrowminindex; rIndex++) {
								scmi += 1
								if (this._selectedcolumnminindex === 0 && this._selectedcolumnmaxindex === this._data2DFields.length - 1) {
									this._data2DArray[rIndex] = structuredClone(this._data2DArray[this._selectedrowminindex + scmi])
									continue
								}

								for (let cIndex = this._selectedcolumnminindex; cIndex <= this._selectedcolumnmaxindex; cIndex++) {
									this._data2DArray = Json.SetValueInObject(this._data2DArray, `$.${rIndex}.${cIndex}`, structuredClone(this._data2DArray[this._selectedrowminindex + scmi][cIndex]))
								}
							}
							this._updateData()
							return
						}

						if (this._selectedRowColumnIndexes.length === 2) {
							if ((this._selectedRowColumnIndexes[0].row === row && this._selectedRowColumnIndexes[0].column === column) || (this._selectedRowColumnIndexes[1].row === row && this._selectedRowColumnIndexes[1].column === column)) {
								this._resetSelectedFields()
								return
							}
							const secondRowColumnIndex = structuredClone(this._selectedRowColumnIndexes[1])
							this._selectedRowColumnIndexes = [{ row, column }, secondRowColumnIndex]
						} else {
							this._selectedRowColumnIndexes.push({ row, column })
						}

						if (this._selectedRowColumnIndexes.length === 1) {
							this._selectedrowminindex = row
							this._selectedrowmaxindex = row
							this._selectedcolumnminindex = 0
							this._selectedcolumnmaxindex = this._data2DFields.length - 1
						}

						if (this._selectedRowColumnIndexes.length === 2) {
							if (this._selectedRowColumnIndexes[0].row < this._selectedRowColumnIndexes[1].row) {
								this._selectedrowminindex = this._selectedRowColumnIndexes[0].row
								this._selectedrowmaxindex = this._selectedRowColumnIndexes[1].row
							} else {
								this._selectedrowminindex = this._selectedRowColumnIndexes[1].row
								this._selectedrowmaxindex = this._selectedRowColumnIndexes[0].row
							}

							if (this._selectedRowColumnIndexes[0].column < this._selectedRowColumnIndexes[1].column) {
								this._selectedcolumnminindex = this._selectedRowColumnIndexes[0].column
								this._selectedcolumnmaxindex = this._selectedRowColumnIndexes[1].column
							} else {
								this._selectedcolumnminindex = this._selectedRowColumnIndexes[1].column
								this._selectedcolumnmaxindex = this._selectedRowColumnIndexes[0].column
							}
						}
					}}
				></metadata-model-datum-input-table-column>
			`
		)
	}

	private _resetSelectedFields() {
		this._selectedRowColumnIndexes = []
		this._selectedrowminindex = -1
		this._selectedrowmaxindex = -1
		this._selectedcolumnminindex = -1
		this._selectedcolumnmaxindex = -1
		this._copyModeActive = false
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

					if (this._rowEndIndex === this.totalnoofrows - 1) {
						this.totalnoofrows += this.totalnoofrows
					}

					this._rowEndAddContentTimeout = window.setTimeout(() => this._rowAddContentAtEndPosition(this._rowEndIndex), 500)
				}}
			>
				<!--mdi:chevron-double-down source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="black" d="M16.59 5.59L18 7l-6 6l-6-6l1.41-1.41L12 10.17zm0 6L18 13l-6 6l-6-6l1.41-1.41L12 16.17z" /></svg>
			</button>
		`
	}

	private _selectedRowColumnIndexes: { row: number; column: number }[] = []
	@state() private _selectedrowminindex: number = -1
	@state() private _selectedrowmaxindex: number = -1
	@state() private _selectedcolumnminindex: number = -1
	@state() private _selectedcolumnmaxindex: number = -1

	@state() private _copyModeActive: boolean = false

	connectedCallback(): void {
		super.connectedCallback()

		const groupData = this.getdata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
		if (Array.isArray(groupData) && (groupData as any[]).length > 1) {
			this.totalnoofrows = (groupData as any[]).length
		}

		try {
			let data2DFields = new MetadataModel.Extract2DFields(this.group, false, false, false)
			data2DFields.Extract()
			data2DFields.Reposition()
			this._data2DFields = structuredClone(data2DFields.Fields)
			this._unlockedColumnEndIndex = this._data2DFields.length > this._totalNoOfColumns ? this._totalNoOfColumns : this._data2DFields.length - 1

			let object: any
			if (typeof this.grouprowindex === 'number') {
				object = this.getdata(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}[${this.grouprowindex}]`, this.arrayindexplaceholders)
			} else {
				object = this.getdata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
			}

			if (typeof object !== 'undefined') {
				if (!Array.isArray(object)) {
					object = [object]
				}

				let objectTo2DArray = new MetadataModel.ConvertObjectsTo2DArray(
					MetadataModel.MapFieldGroups(structuredClone(this.group), (property) => {
						if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
							property[MetadataModel.FgProperties.FIELD_GROUP_KEY] = (property[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], '$')
						}
						return property
					}),
					structuredClone(this._data2DFields).map((d2dField) => {
						if (typeof d2dField[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
							d2dField[MetadataModel.FgProperties.FIELD_GROUP_KEY] = (d2dField[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], '$')
						}

						return d2dField
					}),
					false,
					false
				)
				objectTo2DArray.Convert(object)
				this._data2DArray = objectTo2DArray.Array2D
				if (this._data2DArray.length > this.totalnoofrows) {
					this.totalnoofrows = this._data2DArray.length
				}
			}

			this._2dArrayToObjects = new MetadataModel.Convert2DArrayToObjects(this.group, this._data2DFields, false, false)
		} catch (e) {
			console.error(this.localName, this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], e)
		}
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()

		this._resizeObserver.disconnect()

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
				(typeof this._data2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_NAME] === 'string' && (this._data2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).toLocaleLowerCase().includes(this._rowNumberColumnMenuTextSearchFieldsQuery.toLocaleLowerCase())) ||
				(typeof this._data2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this._data2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).toLocaleLowerCase().includes(this._rowNumberColumnMenuTextSearchFieldsQuery.toLocaleLowerCase()))
		}

		if (this._rowNumberColumnMenuShowLockedColumnsOnly) {
			if (this._data2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]) {
				includeField = true
			} else {
				includeField = false
			}
		}

		if (this._rowNumberColumnMenuShowHiddenColumnsOnly) {
			if (this._data2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
				includeField = true
			} else {
				includeField = false
			}
		}

		return includeField
	}

	private _rowNumberColumnMenuFieldsHtmlTemplate(columnIndex: number, dfIndex: number) {
		const fieldGroup = this._data2DFields[dfIndex]

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
								this.updatemetadatamodel(fieldGroup)
								this._columnData2DFieldsLockStateChanged = true
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
								this.updatemetadatamodel(fieldGroup)
								this._columnData2DFieldsLockStateChanged = true
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
						if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] || this._data2DFields.length < this._totalNoOfColumns) {
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

	@state() private _showDescription: boolean = false

	@state() private _showHintID: string = ''

	protected render(): unknown {
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

		if (!this._columnHeaderResizeObserved) {
			;(async () => {
				await new Promise((resolve: (e: Element) => void) => {
					if ((this.shadowRoot as ShadowRoot).querySelector('#column-header')) {
						resolve((this.shadowRoot as ShadowRoot).querySelector('#column-header') as Element)
						return
					}

					const observer = new MutationObserver(() => {
						if ((this.shadowRoot as ShadowRoot).querySelector('#column-header')) {
							resolve((this.shadowRoot as ShadowRoot).querySelector('#column-header') as Element)
							observer.disconnect()
						}
					})

					observer.observe(this.shadowRoot as ShadowRoot, {
						childList: true,
						subtree: true
					})
				}).then((e) => {
					this._resizeObserver.observe(e)
					this._columnHeaderResizeObserved = true
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

		if (this._columnData2DFieldsLockStateChanged) {
			this._lockedColumnData2DFieldsIndex = []
			this._unlockedColumnData2DFieldsIndex = []
			for (let dfIndex = 0; dfIndex < this._data2DFields.length; dfIndex++) {
				if (this._data2DFields[dfIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]) {
					this._lockedColumnData2DFieldsIndex = [...this._lockedColumnData2DFieldsIndex, dfIndex]
					continue
				}
				this._unlockedColumnData2DFieldsIndex = [...this._unlockedColumnData2DFieldsIndex, dfIndex]
			}
			this._columnData2DFieldsLockStateChanged = false
		}

		if (this._unlockedColumnEndIndex > this._unlockedColumnData2DFieldsIndex.length - 1) {
			this._unlockedColumnEndIndex = this._unlockedColumnData2DFieldsIndex.length - 1
		}

		if (this._unlockedColumnStartIndex >= this._unlockedColumnEndIndex) {
			this._unlockedColumnStartIndex = this._unlockedColumnEndIndex - this._totalNoOfColumns > 0 ? this._unlockedColumnEndIndex - this._totalNoOfColumns : 0
		}

		return html`
			<header
				id="top-header"
				class="h-fit min-w-fit sticky left-0 right-0 text-sm font-bold z-[2] flex flex-col ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content '}"
				style="top: ${this.basestickytop}px;"
			>
				<section class="h-fit w-full flex justify-between p-1">
					<div class="flex sticky left-0 w-fit">
						<span class="self-center sticky"> ${MetadataModel.GetFieldGroupName(this.group)} </span>
						${(() => {
							if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0) {
								return html`
									<drop-down .showdropdowncontent=${this._showDescription} @drop-down:showdropdowncontentupdate=${(e: CustomEvent) => (this._showDescription = e.detail.value)}>
										<button slot="header" class="ml-2 btn btn-circle btn-sm btn-ghost self-start" @click=${() => (this._showDescription = !this._showDescription)}>
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
											class="w-[500px] max-w-[700px] overflow-auto max-h-[200px] flex flex-wrap text-sm shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
												? 'bg-primary text-primary-content'
												: this.color === Theme.Color.SECONDARY
													? 'bg-secondary text-secondary-content'
													: 'bg-accent text-accent-content'}"
										>
											${this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}
										</div>
									</drop-down>
								`
							}

							return nothing
						})()}
					</div>
					<div class="flex sticky right-0 w-fit font-bold text-sm h-fit self-center">
						<span class="italic">rows with data: </span>
						<span>${this._data2DArray.length}</span>
					</div>
				</section>
				<section id="header-menu" class="ml-1 mr-1 shadow-inner shadow-gray-800 rounded-md p-1 flex">
					<div class="sticky left-0 w-fit flex space-x-4 z-50">
						<div class="flex">
							<drop-down>
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
								<div class="shadow-sm shadow-gray-800 p-1 rounded-md bg-white text-black flex flex-col min-w-[500px] max-w-[800px] max-h-[800px] min-h-[200px] overflow-auto space-y-1">
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
							<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-switch-data-input-view')} @mouseout=${() => (this._showHintID = '')}>
								<button
									class="btn btn-ghost self-start w-fit h-fit min-h-fit p-1"
									@click=${() => {
										if (this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
											delete this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW]
										} else {
											this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] = MetadataModel.DView.TABLE
										}
										this.updatemetadatamodel(this.group)
									}}
								>
									${(() => {
										if (this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
											return html`
												<!--mdi:form source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24">
													<path fill="${Theme.GetColorContent(this.color)}" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zm10 2h-6v-2h6zm0-4h-6v-2h6zm0-4h-6V7h6z" />
												</svg>
											`
										}

										return html`
											<!--mdi:table-large source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24">
												<path fill="${Theme.GetColorContent(this.color)}" d="M4 3h16a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 4v3h4V7zm6 0v3h4V7zm10 3V7h-4v3zM4 12v3h4v-3zm0 8h4v-3H4zm6-8v3h4v-3zm0 8h4v-3h-4zm10 0v-3h-4v3zm0-8h-4v3h4z" />
											</svg>
										`
									})()}
								</button>
								${(() => {
									if (this._showHintID === 'header-menu-switch-data-input-view') {
										return html`<div class="relative">
											<div
												class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
													? 'bg-primary text-primary-content'
													: this.color === Theme.Color.SECONDARY
														? 'bg-secondary text-secondary-content'
														: 'bg-accent text-accent-content'}"
											>
												Switch to ${this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE ? 'form' : 'table'} view
											</div>
										</div>`
									}

									return nothing
								})()}
							</div>
							<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-delete-data')} @mouseout=${() => (this._showHintID = '')}>
								<button
									class="btn btn-ghost self-start w-fit h-fit min-h-fit p-1"
									@click=${() => {
										this._data2DArray = []
										this.deletedata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
									}}
								>
									<!--mdi:delete-empty source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="28" height="30" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="m20.37 8.91l-1 1.73l-12.13-7l1-1.73l3.04 1.75l1.36-.37l4.33 2.5l.37 1.37zM6 19V7h5.07L18 11v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2" /></svg>
								</button>
								${(() => {
									if (this._showHintID === 'header-menu-delete-data') {
										return html`<div class="relative">
											<div
												class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
													? 'bg-primary text-primary-content'
													: this.color === Theme.Color.SECONDARY
														? 'bg-secondary text-secondary-content'
														: 'bg-accent text-accent-content'}"
											>
												delete data
											</div>
										</div> `
									}

									return nothing
								})()}
							</div>
						</div>
						<div class="join flex">
							<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-copy-selected-data')} @mouseout=${() => (this._showHintID = '')}>
								<button
									class="join-item btn btn-ghost self-start w-fit h-fit min-h-fit p-1"
									@click=${() => {
										this._copyModeActive = !this._copyModeActive
									}}
									.disabled=${!this._isSelectedFieldsIndexesValid()}
								>
									<div class="flex flex-col justify-center">
										<div class="flex self-center">
											<!--mdi:content-copy source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z" /></svg>
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
									if (this._copyModeActive) {
										return html`<div class="relative">
											<div
												class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.ACCENT
													? 'bg-primary text-primary-content'
													: this.color === Theme.Color.PRIMARY
														? 'bg-secondary text-secondary-content'
														: 'bg-accent text-accent-content'}"
											>
												<span>select any column </span>
												'<!--mdi:square-medium-outline source: https://icon-sets.iconify.design--><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="${this.color}" d="M14 10v4h-4v-4zm2-2H8v8h8z" /></svg>'
												<span> to paste the data</span>
											</div>
										</div> `
									}

									if (this._showHintID === 'header-menu-copy-selected-data') {
										return html`<div class="relative">
											<div
												class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
													? 'bg-primary text-primary-content'
													: this.color === Theme.Color.SECONDARY
														? 'bg-secondary text-secondary-content'
														: 'bg-accent text-accent-content'}"
											>
												copy selected data
											</div>
										</div> `
									}

									return nothing
								})()}
							</div>
							<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-delete-selected-data')} @mouseout=${() => (this._showHintID = '')}>
								<button
									class="join-item btn btn-ghost self-start w-fit h-fit min-h-fit p-1"
									@click=${() => {
										for (let rIndex = this._selectedrowminindex; rIndex <= this._selectedrowmaxindex; rIndex++) {
											if (rIndex > this._data2DArray.length - 1) {
												break
											}

											if (this._selectedcolumnminindex === 0 && this._selectedcolumnmaxindex === this._data2DFields.length - 1) {
												this._data2DArray[rIndex] = []
												continue
											}

											if (!Array.isArray(this._data2DArray[rIndex])) {
												continue
											}

											for (let cIndex = this._selectedcolumnminindex; cIndex <= this._selectedcolumnmaxindex; cIndex++) {
												if (cIndex > this._data2DArray[rIndex].length - 1) {
													continue
												}
												this._data2DArray[rIndex][cIndex] = undefined
											}
										}
										this._updateData()
									}}
									.disabled=${!this._isSelectedFieldsIndexesValid()}
								>
									<div class="flex flex-col justify-center">
										<div class="flex self-center">
											<!--mdi:delete source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
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
									if (this._showHintID === 'header-menu-delete-selected-data') {
										return html`<div class="relative">
											<div
												class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
													? 'bg-primary text-primary-content'
													: this.color === Theme.Color.SECONDARY
														? 'bg-secondary text-secondary-content'
														: 'bg-accent text-accent-content'}"
											>
												delete selected data
											</div>
										</div> `
									}

									return nothing
								})()}
							</div>
							<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-export-selected-data')} @mouseout=${() => (this._showHintID = '')}>
								<button
									class="join-item btn btn-ghost self-start w-fit h-fit min-h-fit p-1"
									@click=${() => {
										try {
											let dataToParse: any[][] = [[]]
											let columnHeaderIndexes: number[] = []
											for (let cIndex = this._selectedcolumnminindex; cIndex <= this._selectedcolumnmaxindex; cIndex++) {
												if (this._data2DFields[cIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
													continue
												}
												columnHeaderIndexes.push(cIndex)
												dataToParse[0].push(MetadataModel.GetFieldGroupName(this._data2DFields[cIndex]))
											}
											for (let rIndex = this._selectedrowminindex; rIndex <= this._selectedrowmaxindex; rIndex++) {
												if (rIndex > this._data2DArray.length - 1) {
													break
												}

												let dataRow = []
												for (const chi of columnHeaderIndexes) {
													dataRow.push(this._data2DArray[rIndex][chi])
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
				</section>
			</header>
			${(() => {
				if (this._viewJsonOutput) {
					const jsonData = this.getdata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)

					return html` <pre class="bg-gray-700 text-white w-full h-fit shadow-inner shadow-gray-800 p-1"><code>${JSON.stringify(jsonData, null, 4)}</code></pre> `
				}

				return html`
					<main class="z-[1] relative grid w-full h-full min-h-fit min-w-fit rounded-md" style="grid-template-columns: repeat(${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}, minmax(min-content,500px));">
						<header
							id="column-header"
							style="top: ${this._topHeaderHeight + this.basestickytop}px; grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;"
							class="grid h-fit min-w-fit sticky left-0 right-0 shadow-sm text-sm font-bold z-[2] shadow-gray-800 ${this.color === Theme.Color.PRIMARY
								? 'bg-primary text-primary-content'
								: this.color === Theme.Color.SECONDARY
									? 'bg-secondary text-secondary-content'
									: 'bg-accent text-accent-content '}"
						>
							<div
								id="column-header-locked"
								style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;"
								class="grid sticky left-0 z-[2] shadow-sm ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content '}"
							>
								<div class="w-full h-full min-h-full p-1 flex justify-evenly space-x-1">
									<div class="h-full flex justify-center text-2xl w-[47px] font-bold">
										<div class="self-center h-fit w-fit">#</div>
									</div>
									<div class="flex flex-col self-center h-fit w-fit" @mouseover=${() => (this._showHintID = 'header-menu-select-unselect-all-rows')} @mouseout=${() => (this._showHintID = '')}>
										<input
											class="self-center checkbox ${this.color === Theme.Color.ACCENT ? 'checkbox-primary' : this.color === Theme.Color.PRIMARY ? 'checkbox-secondary' : 'checkbox-accent'}"
											type="checkbox"
											.checked=${this._selectedrowminindex === 0 && this._selectedrowmaxindex === this._data2DArray.length - 1 && this._selectedcolumnminindex === 0 && this._selectedcolumnmaxindex === this._data2DFields.length - 1}
											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
												if (e.currentTarget.checked) {
													this._selectedcolumnminindex = 0
													this._selectedcolumnmaxindex = this._data2DFields.length - 1
													this._selectedrowminindex = 0
													this._selectedrowmaxindex = this._data2DArray.length - 1
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
									<div class="flex flex-col self-center h-fit w-fit" @mouseover=${() => (this._showHintID = 'header-menu-unselect-rows')} @mouseout=${() => (this._showHintID = '')}>
										<button
											class="w-fit h-full flex justify-center content-center"
											@click=${() => {
												this._resetSelectedFields()
											}}
										>
											${(() => {
												if (this._selectedrowminindex > -1 && this._selectedrowmaxindex > -1) {
													return html`
														<!--mdi:selection-remove source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
															<path
																fill="${Theme.GetNextColorA(this.color)}"
																d="M20 20v-3h2v3a2 2 0 0 1-2 2h-3v-2zM2 20v-3h2v3h3v2H4c-1.1 0-2-.9-2-2m8 0h4v2h-4zm4.59-12L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41zM20 10h2v4h-2zM2 10h2v4H2zm0-6a2 2 0 0 1 2-2h3v2H4v3H2zm20 0v3h-2V4h-3V2h3c1.1 0 2 .9 2 2M10 2h4v2h-4z"
															/>
														</svg>
													`
												}

												return html`
													<!--mdi:square-outline source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="${Theme.GetNextColorA(this.color)}" d="M3 3h18v18H3zm2 2v14h14V5z" /></svg>
												`
											})()}
										</button>
										${(() => {
											if (this._showHintID === 'header-menu-unselect-rows') {
												return html`
													<div class="relative">
														<div
															class="z-50 absolute top-0 self-center font-bold text-sm min-w-[100px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'}"
														>
															unselect all columns and rows
														</div>
													</div>
												`
											}

											return nothing
										})()}
									</div>
								</div>
								${this._lockedColumnData2DFieldsIndex.map((fIndex, index) => this._columnHeaderHtmlTemplate(index, fIndex))}
							</div>
							<div class="w-fit h-full flex flex-col justify-center">${this._columnStartHtmlTemplate(true)}</div>
							${(() => {
								let templates: TemplateResult<1>[] = []

								for (let index = this._unlockedColumnStartIndex; index <= this._unlockedColumnEndIndex; index++) {
									templates.push(this._columnHeaderHtmlTemplate(index, this._unlockedColumnData2DFieldsIndex[index]))
								}

								return templates
							})()}
							<div class="w-fit h-full flex flex-col justify-center pr-1">${this._columnEndHtmlTemplate(true)}</div>
						</header>
						<main class="z-[1] grid bg-white shadow-sm shadow-gray-800" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
							<div id="row-render-tracker-start" class="grid bg-white shadow-sm shadow-gray-800" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
								<div style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;top: ${this._columnHeaderHeight + this._topHeaderHeight + this.basestickytop}px;" class="grid sticky left-0 bg-white shadow-sm shadow-gray-800 z-[2]">
									${(() => {
										let templates: TemplateResult<1>[] = []

										for (let index = 0; index < this._lockedColumnData2DFieldsIndex.length + 1; index++) {
											templates.push(html`
												<div class="w-full min-w-full h-fit">
													<div style="top: ${this._columnHeaderHeight + this._topHeaderHeight + this.basestickytop}px; left: ${this._columnHeaderLockedWidth}px;" class="sticky flex space-x-1 w-fit">${this._rowStartRenderTrackerHtmlTemplate()}</div>
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
										if (this._data2DFields[this._unlockedColumnData2DFieldsIndex[index]][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
											templates.push(html` <div class="w-fit h-full"></div> `)
										} else {
											templates.push(html`
												<div class="w-full min-w-full h-fit">
													<div style="top: ${this._columnHeaderHeight + this._topHeaderHeight + this.basestickytop}px; left: ${this._columnHeaderLockedWidth}px;" class="sticky flex space-x-1 w-fit">${this._rowStartRenderTrackerHtmlTemplate()}</div>
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
									let templates: TemplateResult<1>[] = []

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

										templates.push(html`
											<div
												id="row-render-tracker-content-item-${rowIndex}"
												class="grid bg-white shadow-sm shadow-gray-800"
												style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;"
											>
												<div style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;top: ${this._columnHeaderHeight + this._topHeaderHeight + this.basestickytop}px;" class="grid sticky left-0 bg-white shadow-sm shadow-gray-800 z-[2]">
													<div class="w-full h-full min-h-full p-1 flex justify-evenly space-x-1">
														<button
															class="self-center btn btn-circle glass ${this.color === Theme.Color.PRIMARY ? 'btn-primary bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'btn-secondary bg-secondary text-secondary-content' : 'btn-accent bg-accent text-accent-content'}"
															@click=${() => {
																this._currentOpenDropdownID = this._currentOpenDropdownID === `row-${rowIndex}` ? '' : `row-${rowIndex}`
															}}
														>
															${rowIndex + 1}
														</button>
														<input
															class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
															type="checkbox"
															.checked=${rowIndex >= this._selectedrowminindex && rowIndex <= this._selectedrowmaxindex && this._selectedcolumnminindex === 0 && this._selectedcolumnmaxindex === this._data2DFields.length - 1}
															@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																if (e.currentTarget.checked) {
																	this._selectedcolumnminindex = 0
																	this._selectedcolumnmaxindex = this._data2DFields.length - 1
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
														<div class="min-h-full flex flex-col justify-center">
															<div class="self-center w-fit h-fit">
																${(() => {
																	if (rowIndex >= this._selectedrowminindex && rowIndex <= this._selectedrowmaxindex) {
																		return html`
																			<!--mdi:square-medium source: https://icon-sets.iconify.design-->
																			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${this.color}" d="M16 8H8v8h8z" /></svg>
																		`
																	}

																	return html`
																		<!--mdi:square-medium-outline source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${this.color}" d="M14 10v4h-4v-4zm2-2H8v8h8z" /></svg>
																	`
																})()}
															</div>
														</div>
													</div>
													${this._lockedColumnData2DFieldsIndex.map((columnIndex) => {
														if (this._data2DFields[columnIndex][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
															return html` <div class="w-fit h-full"></div> `
														}

														return html` ${this._rowColumnDataHtmlTemplate(rowIndex, columnIndex, 0, this._columnHeaderHeight + 2)} `
													})}
												</div>
												<div class="w-fit h-full flex flex-col">
													<div style="top: ${this._columnHeaderHeight + this._topHeaderHeight + this.basestickytop}px; left: ${this._columnHeaderLockedWidth}px;" class="sticky w-fit h-fit">${this._columnStartHtmlTemplate(false)}</div>
												</div>
												${(() => {
													let templates: TemplateResult<1>[] = []

													for (let columnIndex = this._unlockedColumnStartIndex; columnIndex <= this._unlockedColumnEndIndex; columnIndex++) {
														if (typeof this._unlockedColumnData2DFieldsIndex[columnIndex] === 'undefined') {
															continue
														}
														if (this._data2DFields[this._unlockedColumnData2DFieldsIndex[columnIndex]][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
															templates.push(html` <div class="w-fit h-full"></div> `)
														} else {
															templates.push(html` ${this._rowColumnDataHtmlTemplate(rowIndex, this._unlockedColumnData2DFieldsIndex[columnIndex], this._columnHeaderLockedWidth + 2, this._columnHeaderHeight + 2)} `)
														}
													}

													return templates
												})()}
												<div class="w-fit h-full flex flex-col">
													<div style="top: ${this._columnHeaderHeight + this._topHeaderHeight + this.basestickytop}px; left: ${this._columnHeaderLockedWidth}px;" class="sticky w-fit h-fit">${this._columnEndHtmlTemplate(false)}</div>
												</div>
											</div>
										`)
									}

									return templates
								})()
							)}
							<div id="row-render-tracker-end" class="grid bg-white shadow-sm shadow-gray-800" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
								<div style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;top: ${this._columnHeaderHeight + this._topHeaderHeight + this.basestickytop}px;" class="grid sticky left-0 bg-white shadow-sm shadow-gray-800 z-[2]">
									${(() => {
										let templates: TemplateResult<1>[] = []

										for (let index = 0; index < this._lockedColumnData2DFieldsIndex.length + 1; index++) {
											templates.push(html`
												<div class="w-full min-w-full h-full flex justify-center">
													<div class="sticky left-0 w-fit">${this._rowEndRenderTrackerHtmlTemplate()}</div>
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
										if (this._data2DFields[this._unlockedColumnData2DFieldsIndex[index]][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
											templates.push(html` <div class="w-fit h-full"></div> `)
										} else {
											templates.push(html`
												<div class="w-full min-w-full h-full min-h-full flex justify-center">
													<div style="left: ${this._columnHeaderLockedWidth}px;" class="sticky w-fit">${this._rowEndRenderTrackerHtmlTemplate()}</div>
												</div>
											`)
										}
									}

									return templates
								})()}
								<div class="w-full h-full"></div>
							</div>
						</main>
					</main>
				`
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-view-table': Component
	}
}
