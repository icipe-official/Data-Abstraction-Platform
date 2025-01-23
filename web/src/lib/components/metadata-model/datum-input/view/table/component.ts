import { html, LitElement, nothing, PropertyValues, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import Json from '$src/lib/json'
import Misc from '$src/lib/miscellaneous'
import './column/component'
import { cache } from 'lit/directives/cache.js'
import '$src/lib/components/vertical-flex-scroll/component'

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

	@state() private _data2DArray: any[][] = []
	private _data2DFields: (MetadataModel.IMetadataModel | any)[] = []

	private _2dArrayToObjects!: MetadataModel.Convert2DArrayToObjects

	@state() private _currentOpenDropdownID: string = ''

	@state() private _columnData2DFieldsLockStateChanged: boolean = true
	@state() private _lockedColumnData2DFieldsIndex: number[] = []
	@state() private _unlockedColumnData2DFieldsIndex: number[] = []

	private readonly NO_OF_RENDER_CONTENT_TO_ADD: number = 10

	private _columnHeaderResizeObserved: boolean = false
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

	@state() private _columnHeaderHeight: number = 0
	@state() private _columnHeaderLockedWidth: number = 0

	protected firstUpdated(_changedProperties: PropertyValues): void {
		this._resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
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
						<div class="flex space-x-1 p-1 w-fit h-full${!fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] ? ' sticky right-0' : ''}" style="left: ${this._columnHeaderLockedWidth + 2}px;">
							<button
								class="w-fit h-fit p-0 self-center"
								@click=${() => {
									this._currentOpenDropdownID = this._currentOpenDropdownID === columnId ? '' : columnId
								}}
							>
								<iconify-icon icon="mdi:dots-vertical" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
							</button>
							<div class="self-center">${columnIndex + 1} - ${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_NAME]}</div>
						</div>
						<div class="relative h-0 min-w-[120px]">
							${(() => {
								if (this._currentOpenDropdownID === columnId) {
									return html`
										<div class="absolute top-0 shadow-md shadow-gray-800 p-1 rounded-md bg-white text-black w-full flex flex-col">
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
													<iconify-icon icon=${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] ? 'mdi:lock-open-variant' : 'mdi:lock'} style="color: black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
													<iconify-icon icon="mdi:eye-off" style="color: black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
												</div>
												<div class="w-fit h-fit self-center">hide column</div>
											</button>
										</div>
									`
								} else {
									return nothing
								}
							})()}
						</div>
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
		return html`
			<metadata-model-datum-input-table-column
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
	}

	private _resetSelectedFields() {
		this._selectedRowColumnIndexes = []
		this._selectedrowminindex = -1
		this._selectedrowmaxindex = -1
		this._selectedcolumnminindex = -1
		this._selectedcolumnmaxindex = -1
	}

	@state() private _totalNoOfColumns = 9

	private _columnStartHtmlTemplate(inHeader: boolean) {
		if (this._unlockedColumnStartIndex === 0) {
			return nothing
		}

		return html`
			<button class="btn btn-md btn-ghost" @click=${this._decreaseColumnUnlockedStartIndex}>
				<iconify-icon
					icon="mdi:rewind"
					style="color:${(() => {
						if (inHeader) {
							return Theme.GetColorContent(this.color)
						}

						return this.color
					})()};"
					width=${Misc.IconifySize()}
					height=${Misc.IconifySize()}
				></iconify-icon>
			</button>
		`
	}

	private _decreaseColumnUnlockedStartIndex() {
		this._unlockedColumnStartIndex = this._unlockedColumnStartIndex - this._totalNoOfColumns >= 0 ? this._unlockedColumnStartIndex - this._totalNoOfColumns : 0
		this._unlockedColumnEndIndex = this._unlockedColumnStartIndex + this._totalNoOfColumns
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
						}

						if (typeof this._rowEndAddContentTimeout === 'number') {
							window.clearTimeout(this._rowEndAddContentTimeout)
							this._rowEndAddContentTimeout = undefined
						}

						this._rowEndAddContentTimeout = window.setTimeout(() => this._rowAddContentAtStartPosition(this._rowStartIndex), 500)
					}}
				>
					<iconify-icon icon="mdi:chevron-double-up" style="color: black;" width=${Misc.IconifySize('18')} height=${Misc.IconifySize('18')}></iconify-icon>
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
				<iconify-icon
					icon="mdi:fast-forward"
					style="color:${(() => {
						if (inHeader) {
							return Theme.GetColorContent(this.color)
						}

						return this.color
					})()};"
					width=${Misc.IconifySize()}
					height=${Misc.IconifySize()}
				></iconify-icon>
			</button>
		`
	}

	private _increaseColumnUnlockedEndIndex() {
		this._unlockedColumnEndIndex = this._unlockedColumnEndIndex + this._totalNoOfColumns < this._unlockedColumnData2DFieldsIndex.length ? this._unlockedColumnEndIndex + this._totalNoOfColumns : this._unlockedColumnData2DFieldsIndex.length - 1
		this._unlockedColumnStartIndex = this._unlockedColumnEndIndex - this._totalNoOfColumns
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
				<iconify-icon icon="mdi:chevron-double-down" style="color: black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
			</button>
		`
	}

	private _selectedRowColumnIndexes: { row: number; column: number }[] = []
	@state() private _selectedrowminindex: number = -1
	@state() private _selectedrowmaxindex: number = -1
	@state() private _selectedcolumnminindex: number = -1
	@state() private _selectedcolumnmaxindex: number = -1

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
	private _includeField(fIndex: number) {
		if (this._rowNumberColumnMenuTextSearchFieldsQuery.length === 0) {
			return true
		}

		if (typeof this._data2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_NAME] === 'string' && (this._data2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).includes(this._rowNumberColumnMenuTextSearchFieldsQuery)) {
			return true
		}

		if (typeof this._data2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this._data2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).includes(this._rowNumberColumnMenuTextSearchFieldsQuery)) {
			return true
		}

		return false
	}
	@state() private _rowNumberColumnMenuShowLockedFields: boolean = false
	@state() private _rowNumberColumnMenuShowUnlockedFields: boolean = false
	private _rowNumberColumnMenuFieldsHtmlTemplate(columnIndex: number, dfIndex: number) {
		const fieldGroup = this._data2DFields[dfIndex]

		return html`
			<div class="flex space-x-1">
				<div class="self-center h-fit w-fit font-bold">${columnIndex + 1} (${dfIndex + 1})</div>
				<div class="self-center h-fit w-fit">${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_NAME]}</div>
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
							<iconify-icon icon=${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] ? 'mdi:lock' : 'mdi:lock-open-variant'} style="color: black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
							<iconify-icon icon=${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] ? 'mdi:eye-off' : 'mdi:eye'} style="color: black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
									<iconify-icon icon="mdi:jump" style="color: black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
				if (!this._rowRenderTrackerStartObserved) {
					this._rowStartEndIntersectionobserver.observe(e)
					this._rowRenderTrackerStartObserved = true
				}
			})
		})()
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
				if (!this._rowRenderTrackerEndObserved) {
					this._rowStartEndIntersectionobserver.observe(e)
					this._rowRenderTrackerEndObserved = true
				}
			})
		})()
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
				if (!this._columnHeaderResizeObserved) {
					this._resizeObserver.observe(e)
					this._columnHeaderResizeObserved = true
				}
			})
		})()
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
				if (!this._columnHeaderLockedResizeObserved) {
					this._resizeObserver.observe(e)
					this._columnHeaderLockedResizeObserved = true
				}
			})
		})()

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

		if (this._unlockedColumnEndIndex > this._unlockedColumnData2DFieldsIndex.length) {
			this._unlockedColumnEndIndex = this._unlockedColumnData2DFieldsIndex.length - 1
			this._unlockedColumnStartIndex = this._unlockedColumnData2DFieldsIndex.length - this.NO_OF_RENDER_CONTENT_TO_ADD > 0 ? this._unlockedColumnData2DFieldsIndex.length - this.NO_OF_RENDER_CONTENT_TO_ADD : 0
		}

		return html`
			<div class="relative grid w-full h-full min-h-fit min-w-fit rounded-md overflow-visible" style="grid-template-columns: repeat(${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}, minmax(min-content,500px));">
				<header
					id="column-header"
					style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;"
					class="rounded-t-md grid h-fit min-w-fit sticky top-0 left-0 right-0 shadow-sm text-sm font-bold z-50 shadow-gray-800 ${this.color === Theme.Color.PRIMARY
						? 'bg-primary text-primary-content'
						: this.color === Theme.Color.SECONDARY
							? 'bg-secondary text-secondary-content'
							: 'bg-accent text-accent-content '}"
				>
					<section class="h-fit w-full flex flex-col justify-between p-1" style="grid-column: 1/${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 4};">
						<section class="w-full flex justify-between">
							<div class="flex sticky left-0 w-fit">
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
												<iconify-icon icon="mdi:question-mark-circle" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
											</button>
										`
									}

									return nothing
								})()}
							</div>
							<div class="flex sticky right-1 w-fit font-bold text-sm h-fit self-center">
								<span class="italic">rows with data: </span>
								<span>${this._data2DArray.length}</span>
							</div>
						</section>
						<section class="sticky left-0 z-[60] w-fit">
							<div class="flex relative w-fit">
								${(() => {
									if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0 && this._showDescription) {
										return html`
											<div
												class="absolute top-0 left-0 w-[500px] max-w-[700px] overflow-auto max-h-[200px] flex flex-wrap text-sm shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
													? 'bg-primary text-primary-content'
													: this.color === Theme.Color.SECONDARY
														? 'bg-secondary text-secondary-content'
														: 'bg-accent text-accent-content'}"
											>
												${this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}
											</div>
										`
									}

									return nothing
								})()}
							</div>
						</section>
					</section>
					<section id="header-menu" style="grid-column: 1/${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 4};" class="ml-1 mr-1 shadow-inner shadow-gray-800 rounded-md p-1 flex">
						<div class="sticky left-0 w-fit flex z-50">
							<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-view-columns')} @mouseout=${() => (this._showHintID = '')}>
								<button
									class="btn btn-ghost self-start w-fit h-fit min-h-fit p-1"
									@click=${() => {
										this._currentOpenDropdownID = this._currentOpenDropdownID === 'header-menu-view-columns' ? '' : 'header-menu-view-columns'
									}}
								>
									<iconify-icon icon="mdi:format-columns" style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
								${(() => {
									if (this._currentOpenDropdownID === 'header-menu-view-columns') {
										return html`
											<div class="relative h-0">
												<div class="z-50 absolute top-0 shadow-md shadow-gray-800 p-1 rounded-md bg-white text-black flex flex-col min-w-[500px] max-w-[800px] max-h-[800px] overflow-auto space-y-1">
													<div class="join w-full shadow-inner shadow-gray-800">
														${(() => {
															if (this._unlockedColumnStartIndex === 0) {
																return nothing
															}

															return html`
																<button class="join-item btn btn-md h-full ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}" @click=${this._decreaseColumnUnlockedStartIndex}>
																	<iconify-icon icon="mdi:rewind" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
																	<iconify-icon icon="mdi:fast-forward" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
																</button>
															`
														})()}
													</div>
													<input
														class="input w-full min-w-[250px] ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
														type="search"
														placeholder="search columns..."
														@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
															this._rowNumberColumnMenuTextSearchFieldsQuery = e.currentTarget.value
														}}
													/>
													<virtual-flex-scroll
														class="w-full max-h-[30vh] shadow-inner shadow-gray-800 rounded-md p-1 flex flex-col"
														.totalnoofrows=${this._data2DFields.length}
														.foreachrowrender=${(rowIndex: number) => {
															return html`
																${(() => {
																	if (!this._includeField(rowIndex)) {
																		return nothing
																	}

																	return this._rowNumberColumnMenuFieldsHtmlTemplate(rowIndex, rowIndex)
																})()}
															`
														}}
													></virtual-flex-scroll>
												</div>
											</div>
										`
									}

									return nothing
								})()}
							</div>
							<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-menu-view-json-output')} @mouseout=${() => (this._showHintID = '')}>
								<button
									class="btn btn-ghost self-start w-fit h-fit min-h-fit p-1"
									@click=${() => {
										this._viewJsonOutput = !this._viewJsonOutput
									}}
								>
									<div class="flex flex-col justify-center">
										<div class="flex self-center">
											<iconify-icon icon="mdi:code-json" style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
											${(() => {
												if (this._viewJsonOutput) {
													return html` <iconify-icon icon="mdi:close-circle" style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('10')} height=${Misc.IconifySize('10')}></iconify-icon> `
												} else {
													return nothing
												}
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
									<iconify-icon icon=${this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE ? 'mdi:table-large' : 'mdi:form'} style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
												switch data input view
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
									<iconify-icon icon="mdi:delete-empty" style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
					</section>
					<section class="grid h-fit" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
						<div
							id="column-header-locked"
							style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;"
							class="grid sticky left-0 z-10 shadow-md ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content '}"
						>
							<div class="flex flex-col self-center">
								<div class="flex justify-evenly space-x-1 p-1 w-full">
									<div class="h-full flex justify-center w-[47px] text-2xl font-bold">
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
											<iconify-icon icon=${this._selectedrowminindex > -1 && this._selectedrowmaxindex > -1 ? 'mdi:selection-remove' : 'mdi:square-outline'} style="color:${Theme.GetNextColorA(this.color)};" width=${Misc.IconifySize('32')} height=${Misc.IconifySize('32')}></iconify-icon>
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
					</section>
				</header>
				${(() => {
					if (this._viewJsonOutput) {
						const jsonData = this.getdata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)

						return html`
							<pre style="grid-column: 1/${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 4};" class="bg-gray-700 text-white w-full h-fit shadow-inner shadow-gray-800 p-1 rounded-b-md"><code>${JSON.stringify(
								jsonData,
								null,
								4
							)}</code></pre>
						`
					}

					return html`
						<div id="row-render-tracker-start" class="grid bg-white shadow-md shadow-gray-800" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
							<div style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;top: ${this._columnHeaderHeight}px;" class="grid sticky left-0 bg-white shadow-md shadow-gray-800 z-10">
								${(() => {
									let templates: TemplateResult<1>[] = []

									for (let index = 0; index < this._lockedColumnData2DFieldsIndex.length + 1; index++) {
										templates.push(html`
											<div class="w-full min-w-full h-fit">
												<div style="top: ${this._columnHeaderHeight + 2}px; left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky flex space-x-1 w-fit">${this._rowStartRenderTrackerHtmlTemplate()}</div>
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
												<div style="top: ${this._columnHeaderHeight + 2}px; left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky flex space-x-1 w-fit">${this._rowStartRenderTrackerHtmlTemplate()}</div>
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
										<div id="row-render-tracker-content-item-${rowIndex}" class="grid bg-white shadow-md shadow-gray-800" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
											<div style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;top: ${this._columnHeaderHeight}px;" class="grid sticky left-0 bg-white shadow-md shadow-gray-800 z-10">
												<div class="w-full h-full min-h-full p-1">
													<div style="top: ${this._columnHeaderHeight + 2}px;" class="sticky left-0 w-fit h-fit flex space-x-1">
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
														<div class="w-full min-h-full flex flex-col justify-center">
															<div class="self-center w-fit h-fit">
																<iconify-icon icon=${rowIndex >= this._selectedrowminindex && rowIndex <= this._selectedrowmaxindex ? 'mdi:square-medium' : 'mdi:square-medium-outline'} style="color:${this.color};" width=${Misc.IconifySize('32')} height=${Misc.IconifySize('32')}></iconify-icon>
															</div>
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
												<div style="top: ${this._columnHeaderHeight + 2}px; left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky w-fit h-fit">${this._columnStartHtmlTemplate(false)}</div>
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
												<div style="top: ${this._columnHeaderHeight + 2}px; left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky w-fit h-fit">${this._columnEndHtmlTemplate(false)}</div>
											</div>
										</div>
									`)
								}

								return templates
							})()
						)}
						<div id="row-render-tracker-end" class="grid rounded-b-md bg-white shadow-md shadow-gray-800" style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
							<div style="grid-column:span ${this._lockedColumnData2DFieldsIndex.length + 1}; grid-template-columns: subgrid;top: ${this._columnHeaderHeight}px;" class="grid sticky left-0 bg-white shadow-md shadow-gray-800 z-10 rounded-bl-md">
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
												<div style="left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky w-fit">${this._rowEndRenderTrackerHtmlTemplate()}</div>
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
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-view-table': Component
	}
}
