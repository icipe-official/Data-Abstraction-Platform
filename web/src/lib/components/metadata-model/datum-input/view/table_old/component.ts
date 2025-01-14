import { html, LitElement, nothing, PropertyValues, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import Log from '$src/lib/log'
import 'iconify-icon'
import Misc from '$src/lib/miscellaneous'

interface RenderTracker {
	ContentIntersectionObserved: boolean
	ContentHasBeenInView: boolean
	ContentIntersectionRatio: number
}

@customElement('metadata-model-datum-input-view-table')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) scrollelement?: Element
	@property({ type: Object }) group: any = {}
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ type: String }) color!: Theme.Color
	@property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
	@property({ attribute: false }) getdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
	@property({ attribute: false }) updatedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
	@property({ attribute: false }) deletedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ type: Number }) noofgroupfieldstorender: number = 1
	@property({ attribute: false }) updatenoofgroupfieldstorender!: (value: number) => void
	@property({ type: String }) copiedcutfieldgroupkey: string = ''
	@property({ attribute: false }) setcopiedfieldgroupkey!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ attribute: false }) setcutfieldgroupdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ attribute: false }) pastefieldgroupdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void

	private readonly NO_OF_RENDER_CONTENT_TO_ADD: number = 20

	private _columnRenderTrackers: { [type: string]: RenderTracker } = {}
	private _columnRenderTrackerStartObserved: boolean = false
	private _columnRenderTrackerEndObserved: boolean = false
	private _columnHeaderResizeObserved: boolean = false
	private _columnHeaderLockedResizeObserved: boolean = false

	private _rowRenderTrackers: { [type: string]: RenderTracker } = {}
	private _rowRenderTrackerStartObserved: boolean = false
	private _rowRenderTrackerEndObserved: boolean = false

	@state() private _unlockedColumnStartIndex: number = 0
	@state() private _unlockedColumnEndIndex: number = 0
	private _columnItemsOutOfView: number[] = []

	@state() private _rowStartIndex: number = 0
	@state() private _rowEndIndex: number = 0
	private _rowItemsOutOfView: number[] = []

	@state() private _columnStartAddContentTimeout?: number
	private _columnAddContentAtStartPosition(startIndex: number) {
		this._unlockedColumnStartIndex = startIndex - this.NO_OF_RENDER_CONTENT_TO_ADD > 0 ? startIndex - this.NO_OF_RENDER_CONTENT_TO_ADD : 0
		;(async (psi: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${psi - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${psi - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${psi - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${psi - 2}`) as Element)
						observer.disconnect()
					}
				})

				observer.observe(this.shadowRoot as ShadowRoot, {
					childList: true,
					subtree: true
				})
			})
				.then((e) => {
					e.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
				})
				.catch((err) => {
					Log.Log(Log.Level.ERROR, this.localName, 'Cannot scroll to column item at index', psi - 2, 'failed', err)
				})
		})(startIndex)

		this._columnStartAddContentTimeout = undefined
	}

	@state() private _rowStartAddContentTimeout?: number
	private _rowAddContentAtStartPosition(startIndex: number) {
		this._rowStartIndex = startIndex - this.NO_OF_RENDER_CONTENT_TO_ADD > 0 ? startIndex - this.NO_OF_RENDER_CONTENT_TO_ADD : 0
		;(async (psi: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${psi - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${psi - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${psi - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${psi - 2}`) as Element)
						observer.disconnect()
					}
				})

				observer.observe(this.shadowRoot as ShadowRoot, {
					childList: true,
					subtree: true
				})
			})
				.then((e) => {
					e.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
				})
				.catch((err) => {
					Log.Log(Log.Level.ERROR, this.localName, 'Cannot scroll to row item at index', psi - 2, 'failed', err)
				})
		})(startIndex)

		this._rowStartAddContentTimeout = undefined
	}

	@state() private _currentColumnNumberOfUnlockedRenderContent: number = 0

	@state() private _columnEndAddContentTimeout?: number
	private _columnAddContentAtEndPosition(endIndex: number) {
		this._unlockedColumnEndIndex = endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD < this._currentColumnNumberOfUnlockedRenderContent ? endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD : this._currentColumnNumberOfUnlockedRenderContent - 1
		;(async (pei: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${pei - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${pei - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${pei - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${pei - 2}`) as Element)
						observer.disconnect()
					}
				})

				observer.observe(this.shadowRoot as ShadowRoot, {
					childList: true,
					subtree: true
				})
			})
				.then((e) => {
					e.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
				})
				.catch((err) => {
					Log.Log(Log.Level.ERROR, this.localName, 'Cannot scroll to item at index', pei - 2, 'failed', err)
				})
		})(endIndex)

		this._columnEndAddContentTimeout = undefined
	}

	@state() private _currentRowNumberOfRenderContent: number = 0
	private _data2D: any[][] = []

	@state() private _rowEndAddContentTimeout?: number
	private _rowAddContentAtEndPosition(endIndex: number) {
		this._rowEndIndex = endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD < this._currentRowNumberOfRenderContent ? endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD : this._currentRowNumberOfRenderContent - 1
		;(async (pei: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${pei - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${pei - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${pei - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-content-item-${pei - 2}`) as Element)
						observer.disconnect()
					}
				})

				observer.observe(this.shadowRoot as ShadowRoot, {
					childList: true,
					subtree: true
				})
			})
				.then((e) => {
					e.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
				})
				.catch((err) => {
					Log.Log(Log.Level.ERROR, this.localName, 'Cannot scroll to row item at index', pei - 2, 'failed', err)
				})
		})(endIndex)

		this._rowEndAddContentTimeout = undefined
	}

	private _columnStartEndIntersectionobserver!: IntersectionObserver
	private _columnContentItemIntersectionObserver!: IntersectionObserver
	private _rowStartEndIntersectionobserver!: IntersectionObserver
	private _rowContentItemIntersectionObserver!: IntersectionObserver
	private _resizeObserver!: ResizeObserver
	private _thisIntersectionObserver!: IntersectionObserver

	@state() private _thisIntersectionRatio: number = 0
	@state() private _thisHeight: number = 0
	@state() private _thisWidth: number = 0

	@state() private _columnHeaderHeight: number = 0
	@state() private _columnHeaderLockedWidth: number = 0

	protected firstUpdated(_changedProperties: PropertyValues): void {
		this._thisIntersectionObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					this._thisIntersectionRatio = entry.intersectionRatio
				}
			},
			{
				root: this.scrollelement,
				rootMargin: '500px',
				threshold: [0.0, 0.25, 0.5, 0.75, 1.0]
			}
		)
		this._thisIntersectionObserver.observe(this)

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

				this._updateSizeOfThis(entry.contentRect.width, entry.contentRect.height)
			}
		})
		this._resizeObserver.observe(this)
	}

	private _updateSizeOfThis(newWidth: number, newHeight: number) {
		if (newWidth > this._thisWidth) {
			this._thisWidth = newWidth
		}

		if (newHeight > this._thisHeight) {
			this._thisHeight = newHeight
		}
	}

	@state() private _remakeColumnHeaders: boolean = true

	@state() private _currentUnlockedColumnHeaders: MetadataModel.IMetadataModel[] = []

	@state() private _currentLockedColumnHeaders: MetadataModel.IMetadataModel[] = []

	@state() private _currentOpenDropdownID: string = ''

	private _columnHeaderHtmlTemplate(fieldGroup: any, Index: number) {
		let columnId = fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (typeof fieldGroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] === 'number') {
			columnId += `@${fieldGroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX]}`
		}

		return html`
			<div id="column${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] ? '-locked' : ''}-render-tracker-content-item-${Index}" class="flex flex-col self-center h-full w-full">
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
								<iconify-icon
									icon="mdi:dots-vertical"
									style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
									width=${Misc.IconifySize()}
									height=${Misc.IconifySize()}
								></iconify-icon>
							</button>
							<div class="self-center">${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_NAME]}</div>
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
													this._remakeColumnHeaders = true
												}}
											>
												<div class="w-fit h-fit self-center">
													<iconify-icon icon=${fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN] ? 'mdi:lock-open-variant' : 'mdi:lock'} style="color: black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
												</div>
												<div class="w-fit h-fit self-center">column</div>
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
												<div class="w-fit h-fit self-center">column</div>
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

	private _columnNestedDataHtmlTempate(fieldGroup: any, IndexInRow: number) {
		if (typeof fieldGroup === 'object' && !Array.isArray(fieldGroup)) {
			if (Array.isArray(fieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
				fieldGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW_DISABLE] = MetadataModel.DView.TABLE

				return html`
					<metadata-model-datum-input-view
						class="w-fit h-fit"
						.scrollelement=${this.scrollelement}
						.group=${fieldGroup}
						.arrayindexplaceholders=${[...this.arrayindexplaceholders, IndexInRow]}
						.color=${Theme.GetNextColorA(this.color)}
						.updatemetadatamodel=${this.updatemetadatamodel}
						.getdata=${this.getdata}
						.updatedata=${this.updatedata}
						.deletedata=${this.deletedata}
						.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
						.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
						.setcutfieldgroupdata=${this.setcutfieldgroupdata}
						.pastefieldgroupdata=${this.pastefieldgroupdata}
					></metadata-model-datum-input-view>
				`
			} else {
				return html`
					<metadata-model-datum-input-form-field
						class="rounded-md min-w-[400px] max-w-[800px]"
						.field=${fieldGroup}
						.arrayindexplaceholders=${[...this.arrayindexplaceholders, IndexInRow]}
						.color=${this.color}
						.updatemetadatamodel=${this.updatemetadatamodel}
						.getdata=${this.getdata}
						.updatedata=${this.updatedata}
						.deletedata=${this.deletedata}
						.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
						.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
						.setcutfieldgroupdata=${this.setcutfieldgroupdata}
						.pastefieldgroupdata=${this.pastefieldgroupdata}
					></metadata-model-datum-input-form-field>
				`
			}
		} else {
			return html`<div class="font-bold text-error italic">...field/group is invalid...</div>`
		}
	}

	private _columnStartRenderTrackerHtmlTemplate() {
		if (typeof this._columnStartAddContentTimeout === 'number') {
			return html`
				<div class="flex">
					<span class="loading loading-spinner loading-md"></span>
				</div>
			`
		}

		if (this._unlockedColumnStartIndex > 0) {
			return html`
				<button
					class="w-fit p-1"
					@click=${() => {
						if (typeof this._columnStartAddContentTimeout === 'number') {
							window.clearTimeout(this._columnStartAddContentTimeout)
						}

						if (typeof this._columnEndAddContentTimeout === 'number') {
							window.clearTimeout(this._columnEndAddContentTimeout)
							this._columnEndAddContentTimeout = undefined
						}

						this._columnStartAddContentTimeout = window.setTimeout(() => this._columnAddContentAtStartPosition(this._unlockedColumnStartIndex), 500)
					}}
				>
					<iconify-icon
						icon="mdi:rewind"
						style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
						width=${Misc.IconifySize('18')}
						height=${Misc.IconifySize('18')}
					></iconify-icon>
				</button>
			`
		}

		return nothing
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

	private _columnEndRenderTrackerHtmlTemplate() {
		if (typeof this._columnEndAddContentTimeout === 'number') {
			return html`
				<div class="flex">
					<span class="loading loading-spinner loading-md"></span>
				</div>
			`
		}
		if (this._unlockedColumnEndIndex < this._currentColumnNumberOfUnlockedRenderContent - 1) {
			return html`
				<button
					class="w-fit p-1"
					@click=${() => {
						if (typeof this._columnEndAddContentTimeout === 'number') {
							window.clearTimeout(this._columnEndAddContentTimeout)
						}

						if (typeof this._columnStartAddContentTimeout === 'number') {
							window.clearTimeout(this._columnStartAddContentTimeout)
							this._columnStartAddContentTimeout = undefined
						}

						this._columnEndAddContentTimeout = window.setTimeout(() => this._columnAddContentAtEndPosition(this._rowEndIndex), 500)
					}}
				>
					<iconify-icon
						icon="mdi:fast-forward"
						style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
						width=${Misc.IconifySize('18')}
						height=${Misc.IconifySize('18')}
					></iconify-icon>
				</button>
			`
		}

		return nothing
	}

	private _rowEndRenderTrackerHtmlTemplate() {
		if (typeof this._rowEndAddContentTimeout === 'number') {
			return html`
				<div class="flex">
					<span class="loading loading-spinner loading-md"></span>
				</div>
			`
		}

		if (this._rowEndIndex < this._currentRowNumberOfRenderContent - 1) {
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
					<iconify-icon icon="mdi:chevron-double-down" style="color: black;" width=${Misc.IconifySize('18')} height=${Misc.IconifySize('18')}></iconify-icon>
				</button>
			`
		}

		return nothing
	}

	connectedCallback(): void {
		super.connectedCallback()
		if (Array.isArray(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) && Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS]) && typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0] === 'object') {
			this._unlockedColumnEndIndex = this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS].length > this.NO_OF_RENDER_CONTENT_TO_ADD ? this.NO_OF_RENDER_CONTENT_TO_ADD : this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS].length - 1
		}
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()

		if (typeof this._columnStartEndIntersectionobserver !== 'undefined') {
			this._columnStartEndIntersectionobserver.disconnect()
		}
		if (typeof this._columnContentItemIntersectionObserver !== 'undefined') {
			this._columnContentItemIntersectionObserver.disconnect()
		}
		if (typeof this._rowStartEndIntersectionobserver !== 'undefined') {
			this._rowStartEndIntersectionobserver.disconnect()
		}
		if (typeof this._rowContentItemIntersectionObserver !== 'undefined') {
			this._rowContentItemIntersectionObserver.disconnect()
		}
		this._thisIntersectionObserver.disconnect()
		this._resizeObserver.disconnect()

		if (typeof this._columnStartAddContentTimeout === 'number') {
			window.clearTimeout(this._columnStartAddContentTimeout)
		}
		if (typeof this._rowStartAddContentTimeout === 'number') {
			window.clearTimeout(this._rowStartAddContentTimeout)
		}
		if (typeof this._columnEndAddContentTimeout === 'number') {
			window.clearTimeout(this._columnEndAddContentTimeout)
		}
		if (typeof this._rowEndAddContentTimeout === 'number') {
			window.clearTimeout(this._rowEndAddContentTimeout)
		}
	}

	protected render(): unknown {
		if (!Array.isArray(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) || !Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS]) || typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0] !== 'object') {
			return html`<div class="w-full h-fit text-lg text-error font-bold">...group is not valid...</div>`
		}

		if (this._thisIntersectionRatio === 0) {
			this._columnRenderTrackerStartObserved = false
			this._rowRenderTrackerStartObserved = false
			this._columnHeaderResizeObserved = false
			this._columnRenderTrackerEndObserved = false
			this._rowRenderTrackerEndObserved = false
			this._columnRenderTrackers = {}

			if (typeof this._columnStartAddContentTimeout === 'number') {
				window.clearTimeout(this._columnStartAddContentTimeout)
			}
			if (typeof this._rowStartAddContentTimeout === 'number') {
				window.clearTimeout(this._rowStartAddContentTimeout)
			}
			if (typeof this._columnEndAddContentTimeout === 'number') {
				window.clearTimeout(this._columnEndAddContentTimeout)
			}
			if (typeof this._rowEndAddContentTimeout === 'number') {
				window.clearTimeout(this._rowEndAddContentTimeout)
			}

			if (this._thisWidth === 0) {
				this._thisWidth = 200
			}

			if (this._thisHeight === 0) {
				this._thisHeight = 200
			}
		} else {
			const thisBoundingClientRect = this.getBoundingClientRect()
			this._updateSizeOfThis(thisBoundingClientRect.width, thisBoundingClientRect.height)
		}

		if (typeof this.scrollelement === 'undefined') {
			this.scrollelement = this
		}

		return html`
			<div style="width: ${this._thisWidth}px; height: ${this._thisIntersectionRatio === 0 ? this._thisHeight : 0}px;"></div>
			${(() => {
				if (this._thisIntersectionRatio === 0) {
					return nothing
				}

				if (typeof this._columnStartEndIntersectionobserver === 'undefined') {
					this._columnStartEndIntersectionobserver = new IntersectionObserver(
						(entries) => {
							let decrementStartIndex = false
							let incrementEndIndex = false

							for (const entry of entries) {
								const renderStartEnd = /column-render-tracker-(start|end)/.exec(entry.target.id)
								if (renderStartEnd === null) {
									continue
								}
								// // Log.Log(Log.Level.DEBUG, this.localName, 'before', this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], entry.target.id, entry.intersectionRatio, this._startIndex, this._endIndex)
								// // Log.Log(Log.Level.DEBUG, this.localName, 'before', this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], entry.target.id, entry.intersectionRatio, JSON.parse(JSON.stringify(this._renderTrackers)), JSON.parse(JSON.stringify(this._itemsOutOfView)))
								if (entry.intersectionRatio > 0) {
									switch (renderStartEnd[1]) {
										case 'start':
											if (typeof this._columnStartAddContentTimeout === 'number') {
												break
											}

											if (this._unlockedColumnStartIndex > 0) {
												decrementStartIndex = true
												if (typeof this._columnEndAddContentTimeout === 'number') {
													window.clearTimeout(this._columnEndAddContentTimeout)
													this._columnEndAddContentTimeout = undefined
												}
											}
											break
										case 'end':
											if (typeof this._columnEndAddContentTimeout === 'number') {
												break
											}

											if (this._unlockedColumnEndIndex < this._currentColumnNumberOfUnlockedRenderContent - 1) {
												incrementEndIndex = true
												if (typeof this._columnStartAddContentTimeout === 'number') {
													window.clearTimeout(this._columnStartAddContentTimeout)
													this._columnStartAddContentTimeout = undefined
												}
											}
											break
									}
								}
							}

							if (decrementStartIndex) {
								if (typeof this._columnStartAddContentTimeout !== 'number') {
									this._columnStartAddContentTimeout = window.setTimeout(() => this._columnAddContentAtStartPosition(this._unlockedColumnStartIndex), 500)
								}
							}

							if (incrementEndIndex) {
								if (typeof this._columnEndAddContentTimeout !== 'number') {
									this._columnEndAddContentTimeout = window.setTimeout(() => this._columnAddContentAtEndPosition(this._unlockedColumnEndIndex), 500)
								}
							}

							if (this._columnItemsOutOfView.length > 0) {
								let minStartIndex = this._unlockedColumnStartIndex
								let maxEndIndex = this._unlockedColumnEndIndex
								for (const itemID of this._columnItemsOutOfView) {
									if (incrementEndIndex && itemID > minStartIndex && maxEndIndex - itemID >= this.NO_OF_RENDER_CONTENT_TO_ADD) {
										minStartIndex = itemID
										continue
									}

									if (decrementStartIndex && itemID < maxEndIndex && itemID - minStartIndex >= this.NO_OF_RENDER_CONTENT_TO_ADD) {
										maxEndIndex = itemID
										continue
									}
								}

								for (const itemID of JSON.parse(JSON.stringify(this._columnItemsOutOfView)) as number[]) {
									if (itemID <= minStartIndex || itemID >= maxEndIndex) {
										this._columnItemsOutOfView = this._columnItemsOutOfView.filter((ioovid) => itemID !== ioovid)
										delete this._columnRenderTrackers[itemID]
									}
								}

								for (const key of Object.keys(this._columnRenderTrackers)) {
									const keyNumber = Number(key)
									if (keyNumber < minStartIndex || keyNumber > maxEndIndex) {
										delete this._columnRenderTrackers[keyNumber]
									}
								}

								if (this._unlockedColumnStartIndex !== minStartIndex) {
									this._unlockedColumnStartIndex = minStartIndex - 1 > 0 ? minStartIndex - 1 : 0
								}

								if (this._unlockedColumnEndIndex !== maxEndIndex) {
									this._unlockedColumnEndIndex = maxEndIndex - 1
								}
							}
						},
						{
							root: this.scrollelement
						}
					)
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
								// // Log.Log(Log.Level.DEBUG, this.localName, 'before', this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], entry.target.id, entry.intersectionRatio, this._startIndex, this._endIndex)
								// // Log.Log(Log.Level.DEBUG, this.localName, 'before', this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], entry.target.id, entry.intersectionRatio, JSON.parse(JSON.stringify(this._renderTrackers)), JSON.parse(JSON.stringify(this._itemsOutOfView)))
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

											if (this._rowEndIndex < this._currentRowNumberOfRenderContent - 1) {
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

								for (const itemID of JSON.parse(JSON.stringify(this._rowItemsOutOfView)) as number[]) {
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

				;(async () => {
					await new Promise((resolve: (e: Element) => void) => {
						if ((this.shadowRoot as ShadowRoot).querySelector('#column-render-tracker-start')) {
							resolve((this.shadowRoot as ShadowRoot).querySelector('#column-render-tracker-start') as Element)
							return
						}

						const observer = new MutationObserver(() => {
							if ((this.shadowRoot as ShadowRoot).querySelector('#column-render-tracker-start')) {
								resolve((this.shadowRoot as ShadowRoot).querySelector('#column-render-tracker-start') as Element)
								observer.disconnect()
							}
						})

						observer.observe(this.shadowRoot as ShadowRoot, {
							childList: true,
							subtree: true
						})
					}).then((e) => {
						if (!this._columnRenderTrackerStartObserved) {
							this._columnStartEndIntersectionobserver.observe(e)
							this._columnRenderTrackerStartObserved = true
						}
					})
				})()
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
						if ((this.shadowRoot as ShadowRoot).querySelector('#column-render-tracker-end')) {
							resolve((this.shadowRoot as ShadowRoot).querySelector('#column-render-tracker-end') as Element)
							return
						}

						const observer = new MutationObserver(() => {
							if ((this.shadowRoot as ShadowRoot).querySelector('#column-render-tracker-end')) {
								resolve((this.shadowRoot as ShadowRoot).querySelector('#column-render-tracker-end') as Element)
								observer.disconnect()
							}
						})

						observer.observe(this.shadowRoot as ShadowRoot, {
							childList: true,
							subtree: true
						})
					}).then((e) => {
						if (!this._columnRenderTrackerEndObserved) {
							this._columnStartEndIntersectionobserver.observe(e)
							this._columnRenderTrackerEndObserved = true
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

				if (typeof this._columnContentItemIntersectionObserver === 'undefined') {
					this._columnContentItemIntersectionObserver = new IntersectionObserver(
						(entries) => {
							for (const entry of entries) {
								const renderItemElementID = /column-render-tracker-content-item-([0-9]+)/.exec(entry.target.id)
								if (renderItemElementID === null) {
									continue
								}

								const itemID = Number(renderItemElementID[1])
								if (typeof this._columnRenderTrackers[itemID] === 'undefined') {
									continue
								}

								this._columnRenderTrackers[itemID].ContentIntersectionRatio = entry.intersectionRatio

								if (this._columnRenderTrackers[itemID].ContentIntersectionRatio > 0) {
									if (this._columnItemsOutOfView.includes(itemID)) {
										this._columnItemsOutOfView = this._columnItemsOutOfView.filter((itemid) => itemid !== itemID)
									}

									if (this._columnRenderTrackers[itemID].ContentIntersectionRatio === 1) {
										this._columnRenderTrackers[itemID].ContentHasBeenInView = true
									}
								} else {
									if (this._columnRenderTrackers[itemID].ContentHasBeenInView && !this._columnItemsOutOfView.includes(itemID)) {
										this._columnItemsOutOfView = [...this._columnItemsOutOfView, itemID]
									}
								}
							}
						},
						{
							root: this.scrollelement,
							rootMargin: '500px',
							threshold: [0.0, 0.25, 0.5, 0.75, 1.0]
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
									if (this._rowItemsOutOfView.includes(itemID)) {
										this._rowItemsOutOfView = this._rowItemsOutOfView.filter((itemid) => itemid !== itemID)
									}

									if (this._rowRenderTrackers[itemID].ContentIntersectionRatio === 1) {
										this._rowRenderTrackers[itemID].ContentHasBeenInView = true
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
							rootMargin: '500px',
							threshold: [0.0, 0.25, 0.5, 0.75, 1.0]
						}
					)
				}

				if (this._remakeColumnHeaders) {
					this._currentUnlockedColumnHeaders = []
					this._currentLockedColumnHeaders = []
					if (this.group[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]) {
						try {
							const fieldStructures = MetadataModel.ExtractFieldStructuresFromMetadataModel(this.group, false, false)
							for (const field of fieldStructures) {
								if (field[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]) {
									this._currentLockedColumnHeaders = [...this._currentLockedColumnHeaders, structuredClone(field)]
								} else {
									this._currentUnlockedColumnHeaders = [...this._currentUnlockedColumnHeaders, structuredClone(field)]
								}
							}
							// this._data2D = MetadataModel.ConvertArrayOfObjectsTo2DArray()
						} catch (e) {
							Log.Log(Log.Level.ERROR, this.localName, 'get column headers in 2D failed', e)
							window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.ERROR, toastMessage: 'could not switch to 2D view' }, bubbles: true, composed: true }))
							delete this.group[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]
							this.updatemetadatamodel(this.group)
						}
					} else {
						this._data2D = []
						for (const fgKeySuffix of this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] as string[]) {
							const fieldGroup = this.group[MetadataModel.FgProperties.GROUP_FIELDS][0][fgKeySuffix]
							if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_TABLE_LOCK_COLUMN]) {
								this._currentLockedColumnHeaders = [...this._currentLockedColumnHeaders, structuredClone(fieldGroup)]
							} else {
								this._currentUnlockedColumnHeaders = [...this._currentUnlockedColumnHeaders, structuredClone(fieldGroup)]
							}
						}
					}

					this._remakeColumnHeaders = false
				}

				if (this._currentUnlockedColumnHeaders.length !== this._currentColumnNumberOfUnlockedRenderContent) {
					this._currentColumnNumberOfUnlockedRenderContent = this._currentUnlockedColumnHeaders.length
					if (this._unlockedColumnEndIndex > this._currentColumnNumberOfUnlockedRenderContent) {
						if (typeof this._columnStartAddContentTimeout === 'number') {
							window.clearTimeout(this._columnStartAddContentTimeout)
							this._columnStartAddContentTimeout = undefined
						}
						if (typeof this._columnEndAddContentTimeout === 'number') {
							window.clearTimeout(this._columnEndAddContentTimeout)
							this._columnEndAddContentTimeout = undefined
						}

						this._unlockedColumnEndIndex = this._currentColumnNumberOfUnlockedRenderContent - 1
						this._unlockedColumnStartIndex = this._currentColumnNumberOfUnlockedRenderContent - this.NO_OF_RENDER_CONTENT_TO_ADD > 0 ? this._currentColumnNumberOfUnlockedRenderContent - this.NO_OF_RENDER_CONTENT_TO_ADD : 0
						for (let i = this._unlockedColumnStartIndex; i <= this._unlockedColumnEndIndex; i++) {
							this._columnRenderTrackers[i] = {
								ContentIntersectionObserved: false,
								ContentIntersectionRatio: 0,
								ContentHasBeenInView: false
							}
						}
						this._columnItemsOutOfView = []
					}
				}

				// Log.Log(Log.Level.DEBUG, this.localName, 'Column Start Index', this._columnStartIndex, 'Column End Index', this._columnEndIndex)
				// Log.Log(Log.Level.DEBUG, this.localName, 'Locked column headers', this._currentLockedColumnHeaders, 'Unlocked column headers', this._currentUnlockedColumnHeaders)

				return html`
					<div class="relative grid h-fit" style="grid-template-columns: repeat(${this._currentLockedColumnHeaders.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}, minmax(min-content,auto));">
						<header
							id="column-header"
							style="grid-column:span ${this._currentLockedColumnHeaders.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;"
							class="grid h-fit sticky top-0 shadow-sm text-sm font-bold border-t-[1px] z-50 ${this.color === Theme.Color.PRIMARY
								? 'border-primary-content bg-primary text-primary-content shadow-primary-content'
								: this.color === Theme.Color.SECONDARY
									? 'border-secondary-content bg-secondary text-secondary-content shadow-secondary-content'
									: 'border-accent-content bg-accent text-accent-content shadow-accent-content'}"
						>
							<div
								id="column-header-locked"
								style="grid-column:span ${this._currentLockedColumnHeaders.length + 1}; grid-template-columns: subgrid;"
								class="grid sticky left-0 z-10 shadow-md ${this.color === Theme.Color.PRIMARY
									? 'bg-primary text-primary-content shadow-primary-content'
									: this.color === Theme.Color.SECONDARY
										? 'bg-secondary text-secondary-content shadow-secondary-content'
										: 'bg-accent text-accent-content shadow-accent-content'}"
							>
								<div class="flex flex-col self-center">
									<div class="flex space-x-1 p-1 w-full">
										<button
											class="w-fit h-fit p-0 self-center"
											@click=${() => {
												this._currentOpenDropdownID = this._currentOpenDropdownID === '#' ? '' : '#'
											}}
										>
											<iconify-icon
												icon="mdi:dots-vertical"
												style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
												width=${Misc.IconifySize()}
												height=${Misc.IconifySize()}
											></iconify-icon>
										</button>
										<div class="text-lg font-bold">#</div>
									</div>
									<div class="relative h-0">
										${(() => {
											if (this._currentOpenDropdownID === '#') {
												return html`
													<div class="absolute top-0 shadow-md shadow-gray-800 p-1 rounded-md bg-white text-black flex flex-col min-w-[120px]">
														<button
															class="flex w-full space-x-1"
															@click=${() => {
																if (this.group[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]) {
																	delete this.group[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]
																} else {
																	this.group[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D] = true
																}

																if (typeof this._columnStartAddContentTimeout === 'number') {
																	window.clearTimeout(this._columnStartAddContentTimeout)
																	this._columnStartAddContentTimeout = undefined
																}
																if (typeof this._columnEndAddContentTimeout === 'number') {
																	window.clearTimeout(this._columnEndAddContentTimeout)
																	this._columnEndAddContentTimeout = undefined
																}

																this._currentOpenDropdownID = ''
																this.updatemetadatamodel(this.group)
															}}
														>
															<div class="w-fit h-fit self-center">
																<iconify-icon icon=${this.group[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D] ? 'mdi:file-table-box-outline' : 'mdi:file-table-box-multiple-outline'} style="color: black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
															</div>
															<div class="w-fit h-fit self-center">view</div>
														</button>
													</div>
												`
											} else {
												return nothing
											}
										})()}
									</div>
								</div>
								${this._currentLockedColumnHeaders.map((fieldGroup, index) => this._columnHeaderHtmlTemplate(fieldGroup, index))}
							</div>
							<div id="column-render-tracker-start" class="w-fit h-full flex flex-col justify-center">${this._columnStartRenderTrackerHtmlTemplate()}</div>
							${(() => {
								let templates: TemplateResult<1>[] = []

								for (let index = this._unlockedColumnStartIndex; index <= this._unlockedColumnEndIndex; index++) {
									if (typeof this._currentUnlockedColumnHeaders[index] === 'undefined') {
										delete this._columnRenderTrackers[index]
										this._columnItemsOutOfView = this._columnItemsOutOfView.filter((_, i) => index !== i)
										continue
									}

									if (typeof this._columnRenderTrackers[index] === 'undefined') {
										this._columnRenderTrackers[index] = {
											ContentIntersectionObserved: false,
											ContentIntersectionRatio: 0,
											ContentHasBeenInView: false
										}
									}

									;(async (Index: number) => {
										await new Promise((resolve: (e: Element) => void) => {
											if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${Index}`)) {
												resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${Index}`) as Element)
												return
											}

											const observer = new MutationObserver(() => {
												if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${Index}`)) {
													resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-content-item-${Index}`) as Element)
													observer.disconnect()
												}
											})

											observer.observe(this.shadowRoot as ShadowRoot, {
												childList: true,
												subtree: true
											})
										})
											.then((e) => {
												if (typeof this._columnRenderTrackers[Index] === 'undefined') {
													return
												}
												if (!this._columnRenderTrackers[Index].ContentIntersectionObserved) {
													this._columnContentItemIntersectionObserver.observe(e)
													this._columnRenderTrackers[Index].ContentIntersectionObserved = true
												}
											})
											.catch((err) => {
												Log.Log(Log.Level.ERROR, 'Observed item at index', Index, 'failed', err)
											})
									})(index)

									templates.push(this._columnHeaderHtmlTemplate(this._currentUnlockedColumnHeaders[index], index))
								}

								return templates
							})()}
							<div id="column-render-tracker-end" class="w-fit h-full flex flex-col justify-center">${this._columnEndRenderTrackerHtmlTemplate()}</div>
						</header>
						<div id="row-render-tracker-start" class="grid" style="grid-column:span ${this._currentLockedColumnHeaders.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
							<div style="grid-column:span ${this._currentLockedColumnHeaders.length + 1}; grid-template-columns: subgrid;top: ${this._columnHeaderHeight}px;" class="grid sticky left-0 bg-white shadow-md shadow-gray-800 z-40">
								${(() => {
									let templates: TemplateResult<1>[] = []

									for (let i = 0; i < this._currentLockedColumnHeaders.length + 1; i++) {
										templates.push(html`
											<div class="w-full min-w-full h-fit">
												<div style="top: ${this._columnHeaderHeight + 2}px; left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky flex space-x-1 w-fit p-1">${this._rowStartRenderTrackerHtmlTemplate()}</div>
											</div>
										`)
									}

									return templates
								})()}
							</div>
							<div class="w-fit h-full flex flex-col justify-center">${this._columnStartRenderTrackerHtmlTemplate()}</div>
							${(() => {
								let templates: TemplateResult<1>[] = []

								for (let i = this._unlockedColumnStartIndex; i <= this._unlockedColumnEndIndex; i++) {
									if (!this._currentUnlockedColumnHeaders[i]) {
										continue
									}
									if (this._currentUnlockedColumnHeaders[i][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
										templates.push(html` <div class="w-full h-full"></div> `)
									} else {
										templates.push(html`
											<div class="w-full min-w-full h-fit">
												<div style="top: ${this._columnHeaderHeight + 2}px; left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky flex space-x-1 w-fit p-1">${this._rowStartRenderTrackerHtmlTemplate()}</div>
											</div>
										`)
									}
								}

								return templates
							})()}
							<div class="w-fit h-full flex flex-col justify-center">${this._columnEndRenderTrackerHtmlTemplate()}</div>
						</div>
						${(() => {
							let templates: TemplateResult<1>[] = []

							for (let rIndex = this._rowStartIndex; rIndex <= this._rowEndIndex; rIndex++) {
								if (this.group[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]) {
									templates.push(html``)
								} else {
									templates.push(html`
										<div class="grid" style="grid-column:span ${this._currentLockedColumnHeaders.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
											<div style="grid-column:span ${this._currentLockedColumnHeaders.length + 1}; grid-template-columns: subgrid;top: ${this._columnHeaderHeight}px;" class="grid sticky left-0 bg-white shadow-md shadow-gray-800 z-40">
												<div class="w-full h-full min-h-full">
													<div style="top: ${this._columnHeaderHeight + 2}px;" class="sticky left-0 w-fit h-fit flex space-x-1">
														<button
															class="btn btn-circle glass ${this.color === Theme.Color.PRIMARY ? 'btn-primary bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'btn-secondary bg-secondary text-secondary-content' : 'btn-accent bg-accent text-accent-content'}"
															@click=${() => {
																this._currentOpenDropdownID = this._currentOpenDropdownID === `row-${rIndex}` ? '' : `row-${rIndex}`
															}}
														>
															${rIndex}
														</button>
													</div>
												</div>
												${this._currentLockedColumnHeaders.map((clch) => {
													return html`
														<div class="w-full h-full min-h-full">
															<div style="top: ${this._columnHeaderHeight + 2}px;" class="sticky left-0 w-fit h-fit p-1">${this._columnNestedDataHtmlTempate(clch, rIndex)}</div>
														</div>
													`
												})}
											</div>
											<div class="w-fit h-full flex flex-col justify-center">
												<div style="top: ${this._columnHeaderHeight + 2}px; left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky w-fit h-fit">${this._columnStartRenderTrackerHtmlTemplate()}</div>
											</div>
											${(() => {
												let templates: TemplateResult<1>[] = []

												for (let i = this._unlockedColumnStartIndex; i <= this._unlockedColumnEndIndex; i++) {
													if (!this._currentUnlockedColumnHeaders[i]) {
														continue
													}
													if (this._currentUnlockedColumnHeaders[i][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
														templates.push(html` <div class="w-full h-full"></div> `)
													} else {
														templates.push(html`
															<div class="min-w-[500px] h-full">
																<div style="top: ${this._columnHeaderHeight + 2}px; left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky flex w-fit p-1">${this._columnNestedDataHtmlTempate(this._currentUnlockedColumnHeaders[i], rIndex)}</div>
															</div>
														`)
													}
												}

												return templates
											})()}
											<div class="w-fit h-full flex flex-col justify-center">
												<div style="top: ${this._columnHeaderHeight + 2}px; left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky w-fit h-fit">${this._columnEndRenderTrackerHtmlTemplate()}</div>
											</div>
										</div>
									`)
								}
							}

							return templates
						})()}
						<div id="row-render-tracker-end" class="grid" style="grid-column:span ${this._currentLockedColumnHeaders.length + (this._unlockedColumnEndIndex + 1 - this._unlockedColumnStartIndex) + 3}; grid-template-columns: subgrid;">
							<div style="grid-column:span ${this._currentLockedColumnHeaders.length + 1}; grid-template-columns: subgrid;top: ${this._columnHeaderHeight}px;" class="grid sticky left-0 bg-white shadow-md shadow-gray-800 z-40">
								${(() => {
									let templates: TemplateResult<1>[] = []

									for (let i = 0; i < this._currentLockedColumnHeaders.length + 1; i++) {
										templates.push(html`
											<div class="w-full min-w-full h-fit">
												<div style="left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky flex w-fit p-1">${this._rowEndRenderTrackerHtmlTemplate()}</div>
											</div>
										`)
									}

									return templates
								})()}
							</div>
							<div class="w-fit h-full flex flex-col justify-center">${this._columnStartRenderTrackerHtmlTemplate()}</div>
							${(() => {
								let templates: TemplateResult<1>[] = []

								for (let i = this._unlockedColumnStartIndex; i <= this._unlockedColumnEndIndex; i++) {
									if (!this._currentUnlockedColumnHeaders[i]) {
										continue
									}
									if (this._currentUnlockedColumnHeaders[i][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
										templates.push(html` <div class="w-full h-full"></div> `)
									} else {
										templates.push(html`
											<div class="w-full min-w-full h-fit">
												<div style="left: ${this._columnHeaderLockedWidth + 2}px;" class="sticky flex space-x-1 w-fit p-1">${this._rowEndRenderTrackerHtmlTemplate()}</div>
											</div>
										`)
									}
								}

								return templates
							})()}
							<div class="w-fit h-full flex flex-col justify-center">${this._columnEndRenderTrackerHtmlTemplate()}</div>
						</div>
					</div>
				`
			})()}
		`
	}
}

// declare global {
// 	interface HTMLElementTagNameMap {
// 		'metadata-model-datum-input-view-table': Component
// 	}
// }
