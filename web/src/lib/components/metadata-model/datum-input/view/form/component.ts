import { html, LitElement, nothing, PropertyValues, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import componentGroupFields from './component.groupfields.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import Log from '$src/lib/log'
import Misc from '$src/lib/miscellaneous'
import './field/component'
import '../../header/component'
import '../table/component'

interface RenderTracker {
	ContentIntersectionObserved: boolean
	ContentHasBeenInView: boolean
	ContentIntersectionRatio: number
}

@customElement('metadata-model-datum-input-view-form')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: Object }) group: any = {}
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

	private readonly NO_OF_ROWS_TO_ADD: number = 20

	@state() private _totalNoOfRows: number = 1

	private _rowRenderTrackers: { [type: string]: RenderTracker } = {}
	private _rowRenderTrackerStartObserved: boolean = false
	private _rowRenderTrackerEndObserved: boolean = false

	@state() private _rowStartIndex: number = 0
	@state() private _rowEndIndex: number = 0
	private _rowItemsOutOfView: number[] = []

	@state() private _rowStartAddContentTimeout?: number
	private _rowAddContentAtStartPosition(startIndex: number) {
		this._rowStartIndex = startIndex - this.NO_OF_ROWS_TO_ADD > 0 ? startIndex - this.NO_OF_ROWS_TO_ADD : 0
		;(async (psi: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${psi - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${psi - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${psi - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${psi - 2}`) as Element)
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
					Log.Log(Log.Level.ERROR, this.localName, 'Cannot scroll to item at index', psi - 2, 'failed', err)
				})
		})(startIndex)

		this._rowStartAddContentTimeout = undefined
	}

	@state() private _rowEndAddContentTimeout?: number
	private _rowAddContentAtEndPosition(endIndex: number) {
		this._rowEndIndex = endIndex + this.NO_OF_ROWS_TO_ADD < this._totalNoOfRows ? endIndex + this.NO_OF_ROWS_TO_ADD : this._totalNoOfRows - 1
		;(async (pei: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${pei - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${pei - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${pei - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${pei - 2}`) as Element)
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

		this._rowEndAddContentTimeout = undefined
	}

	private _rowStartEndIntersectionobserver!: IntersectionObserver
	private _rowItemIntersectionObserver!: IntersectionObserver
	private _thisResizeObserver!: ResizeObserver
	private _thisIntersectionObserver!: IntersectionObserver

	@state() private _showMoreDescription: string = ''

	@state() private _thisIntersectionRatio: number = 0
	@state() private _thisHeight: number = 0
	private _updateHeightOfThis(newHeight: number) {
		if (newHeight > this._thisHeight) {
			this._thisHeight = newHeight
		}
	}

	private _getGroupName() {
		if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).length > 0) {
			return this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME]
		}

		return 'Data Field'
	}

	@state() private _viewJsonOutput: boolean = false

	@state() private _showTopMultipleEntryMenu: boolean = false

	@state() private _showBottomMultipleEntryMenu: boolean = false

	@state() private _showRowMenuID: string = ''

	private _multipleEntryFormMenuHtmlTemplate() {
		return html`
			<button
				class="btn btn-ghost p-1 w-full justify-start"
				@click=${() => {
					if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number') {
						if (this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] < 1) {
							this._totalNoOfRows += 1
						} else {
							if (this._totalNoOfRows < this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]) {
								this._totalNoOfRows += 1
							}
						}
					} else {
						this._totalNoOfRows += 1
					}
				}}
				.disabled=${typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number' && this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] > 1 && this._totalNoOfRows >= this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]}
			>
				<div class="flex self-center">
					<iconify-icon icon="mdi:plus-bold" style="color: black;" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('30')}></iconify-icon>
				</div>
				<div class="self-center font-bold">Add new ${this._getGroupName()}</div>
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
				<div class="self-center font-bold">Data input view</div>
			</button>
			<button
				class="btn btn-ghost p-1 w-full justify-start"
				@click=${() => {
					this.deletedata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
					this._totalNoOfRows = 1
					this._rowEndIndex = 0
				}}
			>
				<div class="flex self-center">
					<iconify-icon icon="mdi:delete-empty" style="color: black;" width=${Misc.IconifySize('28')} height=${Misc.IconifySize('30')}></iconify-icon>
				</div>
				<div class="self-center font-bold">Delete all ${this._getGroupName()}</div>
			</button>
			<button class="btn btn-ghost p-1 w-full justify-start" @click=${() => (this._viewJsonOutput = !this._viewJsonOutput)}>
				<div class="flex flex-col justify-center">
					<div class="flex self-center">
						<iconify-icon icon="mdi:code-json" style="color: black;" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
						${(() => {
							if (this._viewJsonOutput) {
								return html` <iconify-icon icon="mdi:close-circle" style="color: black;" width=${Misc.IconifySize('10')} height=${Misc.IconifySize('10')}></iconify-icon> `
							} else {
								return nothing
							}
						})()}
					</div>
				</div>
				<div class="self-center font-bold">view json data</div>
			</button>
		`
	}

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

		this._thisResizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				this._updateHeightOfThis(entry.contentRect.height)
			}
		})
		this._thisResizeObserver.observe(this)

		const groupData = this.getdata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
		if (Array.isArray(groupData) && (groupData as any[]).length > 1) {
			this._totalNoOfRows = (groupData as any[]).length
		}
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()

		if (typeof this._rowStartEndIntersectionobserver !== 'undefined') {
			this._rowStartEndIntersectionobserver.disconnect()
		}
		if (typeof this._rowItemIntersectionObserver !== 'undefined') {
			this._rowItemIntersectionObserver.disconnect()
		}
		this._thisIntersectionObserver.disconnect()
		this._thisResizeObserver.disconnect()

		if (typeof this._rowStartAddContentTimeout === 'number') {
			window.clearTimeout(this._rowStartAddContentTimeout)
		}
		if (typeof this._rowEndAddContentTimeout === 'number') {
			window.clearTimeout(this._rowEndAddContentTimeout)
		}
	}

	protected render(): unknown {
		if (!Array.isArray(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) || !Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS]) || typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0] !== 'object') {
			return html`<div class="w-full h-fit text-lg text-error font-bold">...group is not valid...</div>`
		}

		return html`
			<div class="w-full" style="height: ${this._thisIntersectionRatio === 0 && this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== '$' ? this._thisHeight : 0}px;"></div>
			${(() => {
				if (this._thisIntersectionRatio === 0 && this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== '$') {
					this._rowRenderTrackers = {}
					this._rowRenderTrackerStartObserved = false
					this._rowRenderTrackerEndObserved = false
					this._rowItemsOutOfView = []

					if (typeof this._rowStartAddContentTimeout === 'number') {
						window.clearTimeout(this._rowStartAddContentTimeout)
					}

					if (typeof this._rowEndAddContentTimeout === 'number') {
						window.clearTimeout(this._rowEndAddContentTimeout)
					}

					if (this._thisHeight === 0) {
						this._thisHeight = 200
					}

					return nothing
				} else {
					this._updateHeightOfThis(this.getBoundingClientRect().height)
				}

				if (this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 1) {
					return html`
						<metadata-model-datum-input-view-form-group-fields
							.scrollelement=${this.scrollelement}
							.group=${this.group}
							.arrayindexplaceholders=${[...this.arrayindexplaceholders, 0]}
							.color=${this.color}
							.updatemetadatamodel=${this.updatemetadatamodel}
							.getdata=${this.getdata}
							.updatedata=${this.updatedata}
							.deletedata=${this.deletedata}
							.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
							.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
							.setcutfieldgroupdata=${this.setcutfieldgroupdata}
							.pastefieldgroupdata=${this.pastefieldgroupdata}
						></metadata-model-datum-input-view-form-group-fields>
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

											if (this._rowEndIndex < this._totalNoOfRows - 1) {
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
									if (incrementEndIndex && itemID > minStartIndex && maxEndIndex - itemID >= this.NO_OF_ROWS_TO_ADD) {
										minStartIndex = itemID
										continue
									}

									if (decrementStartIndex && itemID < maxEndIndex && itemID - minStartIndex >= this.NO_OF_ROWS_TO_ADD) {
										maxEndIndex = itemID
										continue
									}
								}

								for (const itemID of JSON.parse(JSON.stringify(this._rowItemsOutOfView)) as number[]) {
									if (itemID <= minStartIndex || itemID >= maxEndIndex) {
										this._rowItemsOutOfView = this._rowItemsOutOfView.filter((rioov) => itemID !== rioov)
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

				if (typeof this._rowItemIntersectionObserver === 'undefined') {
					this._rowItemIntersectionObserver = new IntersectionObserver(
						(entries) => {
							for (const entry of entries) {
								const renderItemElementID = /row-render-tracker-item-([0-9]+)/.exec(entry.target.id)
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

				return html`
					<header class="divider h-fit text-lg font-bold ${this.color === Theme.Color.PRIMARY ? 'divider-primary' : this.color === Theme.Color.SECONDARY ? 'divider-secondary' : 'divider-accent'}">
						<button
							class="btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'btn-secondary text-secondary-content' : 'btn-accent text-accent-content'}"
							@click=${() => (this._showTopMultipleEntryMenu = !this._showTopMultipleEntryMenu)}
						>
							<div class="self-center">Start of ${this._getGroupName()}</div>
							<div class="self-center rounded-md shadow-inner ${this.color === Theme.Color.PRIMARY ? 'shadow-primary-content' : this.color === Theme.Color.SECONDARY ? 'shadow-secondary-content' : 'shadow-accent-content'} p-2">${this._totalNoOfRows}</div>
							<div class="self-center w-fit h-fit">
								<iconify-icon
									icon=${this._showTopMultipleEntryMenu ? 'mdi:menu-up' : 'mdi:menu-down'}
									style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
									width=${Misc.IconifySize('30')}
									height=${Misc.IconifySize('32')}
								></iconify-icon>
							</div>
						</button>
					</header>
					<section class="relative w-full flex justify-center">
						${(() => {
							if (this._showTopMultipleEntryMenu) {
								return html` <div class="absolute top-0 flex flex-col space-y-1 w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black min-w-[200px]">${this._multipleEntryFormMenuHtmlTemplate()}</div> `
							}

							return nothing
						})()}
					</section>
					<div id="row-render-tracker-start" class="w-full h-fit flex flex-col justify-center">
						${(() => {
							if (typeof this._rowStartAddContentTimeout === 'number') {
								return html`
									<div class="justify-self-end flex flex-col justify-center items-center text-xl space-y-5">
										<div class="flex">
											<span class="loading loading-ball loading-sm text-accent"></span>
											<span class="loading loading-ball loading-md text-secondary"></span>
											<span class="loading loading-ball loading-lg text-primary"></span>
										</div>
									</div>
								`
							} else if (this._rowStartIndex > 0) {
								return html`
									<div class="divider h-fit">
										<button
											class="justify-self-end link link-hover"
											@click=${() => {
												if (typeof this._rowStartAddContentTimeout === 'number') {
													window.clearTimeout(this._rowStartAddContentTimeout)
												}

												if (typeof this._rowEndAddContentTimeout === 'number') {
													window.clearTimeout(this._rowEndAddContentTimeout)
												}

												this._rowStartAddContentTimeout = window.setTimeout(() => this._rowAddContentAtStartPosition(this._rowStartIndex), 500)
											}}
										>
											...load previous...
										</button>
									</div>
								`
							} else {
								return nothing
							}
						})()}
					</div>
					${(() => {
						let templates: TemplateResult<1>[] = []

						for (let rowIndex = this._rowStartIndex; rowIndex <= this._rowEndIndex; rowIndex++) {
							if (typeof this._rowRenderTrackers[rowIndex] === 'undefined') {
								this._rowRenderTrackers[rowIndex] = {
									ContentIntersectionObserved: false,
									ContentIntersectionRatio: 0,
									ContentHasBeenInView: false
								}
							}

							;(async (Index: number) => {
								await new Promise((resolve: (e: Element) => void) => {
									if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${Index}`)) {
										resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${Index}`) as Element)
										return
									}

									const observer = new MutationObserver(() => {
										if ((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${Index}`)) {
											resolve((this.shadowRoot as ShadowRoot).querySelector(`#row-render-tracker-item-${Index}`) as Element)
											observer.disconnect()
										}
									})

									observer.observe(this.shadowRoot as ShadowRoot, {
										childList: true,
										subtree: true
									})
								})
									.then((e) => {
										if (typeof this._rowRenderTrackers[Index] === 'undefined') {
											return
										}
										if (!this._rowRenderTrackers[Index].ContentIntersectionObserved) {
											this._rowItemIntersectionObserver.observe(e)
											this._rowRenderTrackers[Index].ContentIntersectionObserved = true
										}
									})
									.catch((err) => {
										Log.Log(Log.Level.ERROR, 'Observed item at index', Index, 'failed', err)
									})
							})(rowIndex)

							templates.push(html`
								<div id="row-render-tracker-item-${rowIndex}" class="flex flex-col">
									<header class="flex flex-col space-y-1 p-1 rounded-t-md ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}">
										<section class="flex justify-between">
											<section class="flex space-x-1 h-fit self-center">
												<div class="flex flex-col w-fit text-black">
													<button
														class="btn btn-circle btn-sm btn-ghost self-start"
														@click=${() => {
															if (this._showRowMenuID === `${rowIndex}`) {
																this._showRowMenuID = ''
															} else {
																this._showRowMenuID = `${rowIndex}`
															}
														}}
													>
														<iconify-icon
															icon="mdi:dots-vertical"
															style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
															width=${Misc.IconifySize()}
															height=${Misc.IconifySize()}
														></iconify-icon>
													</button>
													<div class="relative w-full">
														${(() => {
															if (this._showRowMenuID === `${rowIndex}`) {
																return html`
																	<div class="absolute top-0 flex flex-col w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 min-w-[200px]">
																		<button
																			class="btn btn-ghost p-1 w-full justify-start"
																			@click=${() => {
																				this.deletedata(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}[${rowIndex}]`, this.arrayindexplaceholders)
																				if (this._totalNoOfRows - 1 >= 0) {
																					this._totalNoOfRows -= 1
																				}
																				if (this._rowEndIndex - 1 >= 0) {
																					this._rowEndIndex -= 1
																				}
																			}}
																		>
																			<div class="flex self-center">
																				<iconify-icon icon="mdi:delete-empty" style="color: black;" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('32')}></iconify-icon>
																			</div>
																			<div class="self-center font-bold break-words">delete data for #${rowIndex + 1}</div>
																		</button>
																		<button
																			class="btn btn-ghost p-1 w-full justify-start"
																			@click=${() => {
																				this.setcopiedfieldgroupkey(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
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
																				this.setcutfieldgroupdata(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
																			}}
																		>
																			<div class="flex self-center">
																				<iconify-icon icon="mdi:content-cut" style="color:black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
																			</div>
																			<div class="self-center font-bold">cut data</div>
																		</button>
																		${this._multipleEntryFormMenuHtmlTemplate()}
																	</div>
																`
															}

															return nothing
														})()}
													</div>
												</div>
												<div class="flex-[9] break-words text-md font-bold h-fit self-center">${this._getGroupName()} #${rowIndex + 1}</div>
											</section>
											<div class="join">
												${(() => {
													const groupKey = `${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`
													if (this.copiedcutfieldgroupkey.length > 0 && this.copiedcutfieldgroupkey === groupKey) {
														return html`
															<button
																class="join-item btn btn-ghost p-1"
																@click=${() => {
																	this.pastefieldgroupdata(groupKey, [...this.arrayindexplaceholders, rowIndex])
																}}
															>
																<iconify-icon
																	icon="mdi:content-paste"
																	style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
																	width=${Misc.IconifySize()}
																	height=${Misc.IconifySize()}
																></iconify-icon>
															</button>
														`
													} else {
														return nothing
													}
												})()}
												<button
													class="join-item btn btn-ghost p-1"
													@click=${() => {
														if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number') {
															if (this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] < 1) {
																this._totalNoOfRows += 1
															} else {
																if (this._totalNoOfRows < this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]) {
																	this._totalNoOfRows += 1
																}
															}
														} else {
															this._totalNoOfRows += 1
														}
													}}
													.disabled=${typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number' && this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] > 1 && this._totalNoOfRows >= this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]}
												>
													<iconify-icon
														icon="mdi:plus-bold"
														style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
														width=${Misc.IconifySize('30')}
														height=${Misc.IconifySize('32')}
													></iconify-icon>
												</button>
											</div>
										</section>
										${(() => {
											if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0) {
												return html`
													<div class="w-full overflow-auto max-h-[100px] flex flex-wrap text-sm">
														<span>
															${(() => {
																if (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION].length > 100) {
																	return (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).slice(0, this._showMoreDescription === `${rowIndex}` ? this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION].length - 1 : 100)
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
																			if (this._showMoreDescription === `${rowIndex}`) {
																				this._showMoreDescription = ''
																			} else {
																				this._showMoreDescription = `${rowIndex}`
																			}
																		}}
																	>
																		${this._showMoreDescription === `${rowIndex}` ? ' less' : ' more'}...
																	</button>
																`
															}

															return nothing
														})()}
													</div>
												`
											}

											return nothing
										})()}
									</header>
									${(() => {
										if (this._viewJsonOutput) {
											const jsonData = this.getdata(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}[${rowIndex}]`, this.arrayindexplaceholders)

											return html`<pre class="flex-1 bg-gray-700 text-white lg:max-w-[50vw] w-full h-fit max-h-[80vh] overflow-auto shadow-inner shadow-gray-800 p-1 rounded-b-md"><code>${JSON.stringify(jsonData, null, 4)}</code></pre>`
										}

										if (this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
											return html`
												<metadata-model-datum-input-view-table
													.scrollelement=${this.scrollelement}
													.group=${this.group}
													.arrayindexplaceholders=${[...this.arrayindexplaceholders, rowIndex]}
													.color=${Theme.GetNextColorA(this.color)}
													.updatemetadatamodel=${this.updatemetadatamodel}
													.getdata=${this.getdata}
													.updatedata=${this.updatedata}
												></metadata-model-datum-input-view-table>
											`
										}

										return html`
											<metadata-model-datum-input-view-form-group-fields
												class="rounded-b-md p-2 shadow-inner shadow-gray-800"
												.scrollelement=${this.scrollelement}
												.group=${this.group}
												.arrayindexplaceholders=${[...this.arrayindexplaceholders, rowIndex]}
												.color=${Theme.GetNextColorA(this.color)}
												.updatemetadatamodel=${this.updatemetadatamodel}
												.getdata=${this.getdata}
												.updatedata=${this.updatedata}
												.deletedata=${this.deletedata}
												.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
												.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
												.setcutfieldgroupdata=${this.setcutfieldgroupdata}
												.pastefieldgroupdata=${this.pastefieldgroupdata}
											></metadata-model-datum-input-view-form-group-fields>
										`
									})()}
								</div>
							`)
						}

						return templates
					})()}
					<div id="row-render-tracker-end" class="w-full h-fit flex flex-col justify-center">
						${(() => {
							if (typeof this._rowEndAddContentTimeout === 'number') {
								return html`
									<div class="justify-self-end flex flex-col justify-center items-center text-xl space-y-5">
										<div class="flex">
											<span class="loading loading-ball loading-sm text-accent"></span>
											<span class="loading loading-ball loading-md text-secondary"></span>
											<span class="loading loading-ball loading-lg text-primary"></span>
										</div>
									</div>
								`
							} else if (this._rowEndIndex < this._totalNoOfRows - 1) {
								return html`
									<div class="divider h-fit">
										<button
											class="justify-self-end link link-hover font-bold"
											@click=${() => {
												if (typeof this._rowEndAddContentTimeout === 'number') {
													window.clearTimeout(this._rowEndAddContentTimeout)
												}

												if (typeof this._rowStartAddContentTimeout === 'number') {
													window.clearTimeout(this._rowStartAddContentTimeout)
												}

												this._rowEndAddContentTimeout = window.setTimeout(() => this._rowAddContentAtEndPosition(this._rowEndIndex), 500)
											}}
										>
											...load next...
										</button>
									</div>
								`
							} else {
								return nothing
							}
						})()}
					</div>
					<section class="relative w-full flex justify-center">
						${(() => {
							if (this._showBottomMultipleEntryMenu) {
								return html` <div class="absolute bottom-0 flex flex-col space-y-1 w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black min-w-[200px]">${this._multipleEntryFormMenuHtmlTemplate()}</div> `
							}

							return nothing
						})()}
					</section>
					<footer class="divider h-fit text-lg font-bold ${this.color === Theme.Color.PRIMARY ? 'divider-primary' : this.color === Theme.Color.SECONDARY ? 'divider-secondary' : 'divider-accent'}">
						<button
							class="btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'btn-secondary text-secondary-content' : 'btn-accent text-accent-content'}"
							@click=${() => (this._showBottomMultipleEntryMenu = !this._showBottomMultipleEntryMenu)}
						>
							<div class="self-center">End of ${this._getGroupName()}</div>
							<div class="self-center rounded-md shadow-inner ${this.color === Theme.Color.PRIMARY ? 'shadow-primary-content' : this.color === Theme.Color.SECONDARY ? 'shadow-secondary-content' : 'shadow-accent-content'} p-2">${this._totalNoOfRows}</div>
							<div class="self-center w-fit h-fit">
								<iconify-icon
									icon=${this._showBottomMultipleEntryMenu ? 'mdi:menu-down' : 'mdi:menu-up'}
									style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
									width=${Misc.IconifySize('30')}
									height=${Misc.IconifySize('32')}
								></iconify-icon>
							</div>
						</button>
					</footer>
				`
			})()}
		`
	}
}

@customElement('metadata-model-datum-input-view-form-group-fields')
class ComponentGroupFields extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentGroupFields)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: Object }) group: any = {}
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

	private readonly NO_OF_COLUMNS_TO_ADD: number = 20

	@state() private _totalNoOfColumns: number = 1

	private _columnRenderTrackers: { [type: string]: RenderTracker } = {}
	private _columnRenderTrackerStartObserved: boolean = false
	private _columnRenderTrackerEndObserved: boolean = false

	@state() private _columnStartIndex: number = 0
	@state() private _columnEndIndex: number = 0
	private _columnItemsOutOfView: number[] = []

	@state() private _columnStartAddContentTimeout?: number
	private _columnAddContentAtStartPosition(startIndex: number) {
		this._columnStartIndex = startIndex - this.NO_OF_COLUMNS_TO_ADD > 0 ? startIndex - this.NO_OF_COLUMNS_TO_ADD : 0
		;(async (psi: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${psi - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${psi - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${psi - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${psi - 2}`) as Element)
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
					Log.Log(Log.Level.ERROR, this.localName, 'Cannot scroll to item at index', psi - 2, 'failed', err)
				})
		})(startIndex)

		this._columnStartAddContentTimeout = undefined
	}

	@state() private _columnEndAddContentTimeout?: number
	private _columnAddContentAtEndPosition(endIndex: number) {
		this._columnEndIndex = endIndex + this.NO_OF_COLUMNS_TO_ADD < this._totalNoOfColumns ? endIndex + this.NO_OF_COLUMNS_TO_ADD : this._totalNoOfColumns - 1
		;(async (pei: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${pei - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${pei - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${pei - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${pei - 2}`) as Element)
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

	private _columnStartEndIntersectionobserver!: IntersectionObserver
	private _columnItemIntersectionObserver!: IntersectionObserver
	private _thisResizeObserver!: ResizeObserver
	private _thisIntersectionObserver!: IntersectionObserver

	@state() private _thisIntersectionRatio: number = 0
	@state() private _thisHeight: number = 0
	private _updateHeightOfThis(newHeight: number) {
		if (newHeight > this._thisHeight) {
			this._thisHeight = newHeight
		}
	}

	@state() private _viewJsonOutput: string = ''

	private _groupFieldHtmlTemplate(groupFieldIndex: number) {
		const fieldGroup = this.group[MetadataModel.FgProperties.GROUP_FIELDS][0][this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS][groupFieldIndex]]

		if (typeof fieldGroup === 'object' && !Array.isArray(fieldGroup)) {
			if (Array.isArray(fieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
				if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 1) {
					return html`
						<div class="flex flex-col">
							<metadata-model-datum-input-header
								class="rounded-t-md ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}"
								.group=${fieldGroup}
								.viewjsonoutput=${this._viewJsonOutput === fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]}
								.updateviewjsonoutput=${(newValue: boolean) => (this._viewJsonOutput = newValue ? fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] : '')}
								.arrayindexplaceholders=${this.arrayindexplaceholders}
								.updatemetadatamodel=${this.updatemetadatamodel}
								.deletedata=${this.deletedata}
							></metadata-model-datum-input-header>
							<main
								class="${(this._viewJsonOutput !== fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] && !fieldGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW]) || fieldGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.FORM
									? 'shadow-inner shadow-gray-800 rounded-b-md pl-2 pr-2 pb-2'
									: ''}"
							>
								${(() => {
									if (this._viewJsonOutput === fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
										const jsonData = this.getdata(fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)

										return html`<pre class="flex-1 bg-gray-700 text-white lg:max-w-[50vw] w-full h-fit max-h-[80vh] overflow-auto shadow-inner shadow-gray-800 p-1 rounded-b-md"><code>${JSON.stringify(jsonData, null, 4)}</code></pre>`
									}

									if (fieldGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
										return html`table`
									}

									return html`
										<metadata-model-datum-input-view-form
											.scrollelement=${this.scrollelement}
											.group=${fieldGroup}
											.color=${Theme.GetNextColorA(this.color)}
											.arrayindexplaceholders=${this.arrayindexplaceholders}
											.updatemetadatamodel=${this.updatemetadatamodel}
											.getdata=${this.getdata}
											.updatedata=${this.updatedata}
											.deletedata=${this.deletedata}
											.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
											.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
											.setcutfieldgroupdata=${this.setcutfieldgroupdata}
											.pastefieldgroupdata=${this.pastefieldgroupdata}
										></metadata-model-datum-input-view-form>
									`
								})()}
							</main>
						</div>
					`
				}
				return html`
					<metadata-model-datum-input-view-form
						.scrollelement=${this.scrollelement}
						.group=${fieldGroup}
						.color=${this.color}
						.arrayindexplaceholders=${this.arrayindexplaceholders}
						.updatemetadatamodel=${this.updatemetadatamodel}
						.getdata=${this.getdata}
						.updatedata=${this.updatedata}
						.deletedata=${this.deletedata}
						.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
						.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
						.setcutfieldgroupdata=${this.setcutfieldgroupdata}
						.pastefieldgroupdata=${this.pastefieldgroupdata}
					></metadata-model-datum-input-view-form>
				`
			}

			return html`
				<metadata-model-datum-input-form-field
					class="rounded-md"
					.field=${fieldGroup}
					.arrayindexplaceholders=${this.arrayindexplaceholders}
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

		return html`<div class="w-full text-center text-error font-bold">...field/group is invalid...</div>`
	}

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

		this._thisResizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				this._updateHeightOfThis(entry.contentRect.height)
			}
		})
		this._thisResizeObserver.observe(this)

		if (Array.isArray(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) && Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS]) && typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0] === 'object') {
			this._totalNoOfColumns = this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS].length
		}
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()

		if (typeof this._columnStartEndIntersectionobserver !== 'undefined') {
			this._columnStartEndIntersectionobserver.disconnect()
		}
		if (typeof this._columnItemIntersectionObserver !== 'undefined') {
			this._columnItemIntersectionObserver.disconnect()
		}
		this._thisIntersectionObserver.disconnect()
		this._thisResizeObserver.disconnect()

		if (typeof this._columnStartAddContentTimeout === 'number') {
			window.clearTimeout(this._columnStartAddContentTimeout)
		}
		if (typeof this._columnEndAddContentTimeout === 'number') {
			window.clearTimeout(this._columnEndAddContentTimeout)
		}
	}

	protected render(): unknown {
		if (!Array.isArray(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) || !Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS]) || typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0] !== 'object') {
			return html`<div class="w-full h-fit text-lg text-error font-bold">...group is not valid...</div>`
		}

		return html`
			<div class="w-full" style="height: ${this._thisIntersectionRatio === 0 && this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== '$' ? this._thisHeight : 0}px;"></div>
			${(() => {
				if (this._thisIntersectionRatio === 0 && this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== '$') {
					this._columnRenderTrackers = {}
					this._columnRenderTrackerStartObserved = false
					this._columnRenderTrackerEndObserved = false
					this._columnItemsOutOfView = []

					if (typeof this._columnStartAddContentTimeout === 'number') {
						window.clearTimeout(this._columnStartAddContentTimeout)
					}

					if (typeof this._columnEndAddContentTimeout === 'number') {
						window.clearTimeout(this._columnEndAddContentTimeout)
					}

					if (this._thisHeight === 0) {
						this._thisHeight = 200
					}

					return nothing
				} else {
					this._updateHeightOfThis(this.getBoundingClientRect().height)
				}

				if (this._totalNoOfColumns < this.NO_OF_COLUMNS_TO_ADD) {
					let templates: TemplateResult<1>[] = []

					for (let columnIndex = 0; columnIndex < this._totalNoOfColumns; columnIndex++) {
						templates.push(this._groupFieldHtmlTemplate(columnIndex))
					}

					return templates
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

											if (this._columnStartIndex > 0) {
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

											if (this._columnEndIndex < this._totalNoOfColumns - 1) {
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
									this._columnStartAddContentTimeout = window.setTimeout(() => this._columnAddContentAtStartPosition(this._columnStartIndex), 500)
								}
							}

							if (incrementEndIndex) {
								if (typeof this._columnEndAddContentTimeout !== 'number') {
									this._columnEndAddContentTimeout = window.setTimeout(() => this._columnAddContentAtEndPosition(this._columnEndIndex), 500)
								}
							}

							if (this._columnItemsOutOfView.length > 0) {
								let minStartIndex = this._columnStartIndex
								let maxEndIndex = this._columnEndIndex
								for (const itemID of this._columnItemsOutOfView) {
									if (incrementEndIndex && itemID > minStartIndex && maxEndIndex - itemID >= this.NO_OF_COLUMNS_TO_ADD) {
										minStartIndex = itemID
										continue
									}

									if (decrementStartIndex && itemID < maxEndIndex && itemID - minStartIndex >= this.NO_OF_COLUMNS_TO_ADD) {
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

								if (this._columnStartIndex !== minStartIndex) {
									this._columnStartIndex = minStartIndex - 1 > 0 ? minStartIndex - 1 : 0
								}

								if (this._columnEndIndex !== maxEndIndex) {
									this._columnEndIndex = maxEndIndex - 1
								}
							}
						},
						{
							root: this.scrollelement
						}
					)
				}

				if (typeof this._columnItemIntersectionObserver === 'undefined') {
					this._columnItemIntersectionObserver = new IntersectionObserver(
						(entries) => {
							for (const entry of entries) {
								const renderItemElementID = /column-render-tracker-item-([0-9]+)/.exec(entry.target.id)
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

				return html`
					<div id="column-render-tracker-start" class="w-full h-fit flex flex-col justify-center">
						${(() => {
							if (typeof this._columnStartAddContentTimeout === 'number') {
								return html`
									<div class="justify-self-end flex flex-col justify-center items-center text-xl space-y-5">
										<div class="flex">
											<span class="loading loading-ball loading-sm text-accent"></span>
											<span class="loading loading-ball loading-md text-secondary"></span>
											<span class="loading loading-ball loading-lg text-primary"></span>
										</div>
									</div>
								`
							} else if (this._columnStartIndex > 0) {
								return html`
									<div class="divider h-fit">
										<button
											class="justify-self-end link link-hover"
											@click=${() => {
												if (typeof this._columnStartAddContentTimeout === 'number') {
													window.clearTimeout(this._columnStartAddContentTimeout)
												}

												if (typeof this._columnEndAddContentTimeout === 'number') {
													window.clearTimeout(this._columnEndAddContentTimeout)
												}

												this._columnStartAddContentTimeout = window.setTimeout(() => this._columnAddContentAtStartPosition(this._columnStartIndex), 500)
											}}
										>
											...load previous...
										</button>
									</div>
								`
							} else {
								return nothing
							}
						})()}
					</div>
					${(() => {
						let templates: TemplateResult<1>[] = []

						for (let columnIndex = this._columnStartIndex; columnIndex <= this._columnEndIndex; columnIndex++) {
							if (typeof this._columnRenderTrackers[columnIndex] === 'undefined') {
								this._columnRenderTrackers[columnIndex] = {
									ContentIntersectionObserved: false,
									ContentIntersectionRatio: 0,
									ContentHasBeenInView: false
								}
							}

							;(async (Index: number) => {
								await new Promise((resolve: (e: Element) => void) => {
									if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${Index}`)) {
										resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${Index}`) as Element)
										return
									}

									const observer = new MutationObserver(() => {
										if ((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${Index}`)) {
											resolve((this.shadowRoot as ShadowRoot).querySelector(`#column-render-tracker-item-${Index}`) as Element)
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
											this._columnItemIntersectionObserver.observe(e)
											this._columnRenderTrackers[Index].ContentIntersectionObserved = true
										}
									})
									.catch((err) => {
										Log.Log(Log.Level.ERROR, 'Observed item at index', Index, 'failed', err)
									})
							})(columnIndex)

							templates.push(html` <div id="column-render-tracker-item-${columnIndex}" class="flex flex-col">${this._groupFieldHtmlTemplate(columnIndex)}</div> `)
						}

						return templates
					})()}
					<div id="column-render-tracker-end" class="w-full h-fit flex flex-col justify-center">
						${(() => {
							if (typeof this._columnEndAddContentTimeout === 'number') {
								return html`
									<div class="justify-self-end flex flex-col justify-center items-center text-xl space-y-5">
										<div class="flex">
											<span class="loading loading-ball loading-sm text-accent"></span>
											<span class="loading loading-ball loading-md text-secondary"></span>
											<span class="loading loading-ball loading-lg text-primary"></span>
										</div>
									</div>
								`
							} else if (this._columnEndIndex < this._totalNoOfColumns - 1) {
								return html`
									<div class="divider h-fit">
										<button
											class="justify-self-end link link-hover"
											@click=${() => {
												if (typeof this._columnEndAddContentTimeout === 'number') {
													window.clearTimeout(this._columnEndAddContentTimeout)
												}

												if (typeof this._columnStartAddContentTimeout === 'number') {
													window.clearTimeout(this._columnStartAddContentTimeout)
												}

												this._columnEndAddContentTimeout = window.setTimeout(() => this._columnAddContentAtEndPosition(this._columnEndIndex), 500)
											}}
										>
											...load next...
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
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-view-form': Component
		'metadata-model-datum-input-view-form-group-fields': ComponentGroupFields
	}
}
