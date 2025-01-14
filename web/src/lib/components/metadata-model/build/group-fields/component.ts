import { html, LitElement, nothing, PropertyValues, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import Misc from '$src/lib/miscellaneous'
import '../field-group/component'
import 'iconify-icon'
import MetadataModel from '$src/lib/metadata_model'
import Log from '$src/lib/log'

interface RenderTracker {
	ContentIntersectionObserved: boolean
	ContentHasBeenInView: boolean
	ContentIntersectionRatio: number
}

@customElement('metadata-model-build-group-fields')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: Number }) noofselectoptionsineachtracker: number = 20
	@property({ type: String }) color!: Theme.Color
	@property({ type: Object }) group!: any
	@property() copiedfieldgroupkey: string = ''
	@property({ type: Boolean }) cutfieldgroup: boolean = false
	@property({ type: Boolean }) showgroupfields: boolean = false
	@property({ attribute: false }) deletefieldgroup?: (fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => void
	@property({ attribute: false }) setcutfieldgroup?: (fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => void
	@property({ attribute: false }) setcopiedfieldgroupkey?: (fieldgroupkey: string) => void
	@property({ attribute: false }) pastefieldgroup?: (destinationGroupKey: string, objectIndexInGroupReadOrderOfFields: number) => void
	@property({ attribute: false }) createfieldgroup?: (groupKey: string, fieldGroupName: string, isField: boolean, objectIndexInGroupReadOrderOfFields: number) => void
	@property({ attribute: false }) handleselectfieldgroup?: (fieldgroupkey: string, color: Theme.Color) => void
	@property({ attribute: false }) reorderfieldgroup?: (groupKey: string, direction: number, fieldGroupIndexInReadOrderOfFields: number) => void
	@property({ attribute: false }) showhidegroupfields?: () => void

	@state() private _showGroupName: boolean = false
	@state() private _showGroupKey: boolean = false

	private readonly NO_OF_RENDER_CONTENT_TO_ADD: number = 20

	private _renderTrackers: { [type: string]: RenderTracker } = {}
	private _renderTrackerStartObserved: boolean = false
	private _rendertrackerEndObserved: boolean = false

	@state() private _startIndex: number = 0
	@state() private _endIndex: number = 0
	private _itemsOutOfView: number[] = []

	@state() private _startAddContentTimeout?: number
	private _addContentAtStartPosition(startIndex: number) {
		this._startIndex = startIndex - this.NO_OF_RENDER_CONTENT_TO_ADD > 0 ? startIndex - this.NO_OF_RENDER_CONTENT_TO_ADD : 0
		;(async (psi: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${psi - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${psi - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${psi - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${psi - 2}`) as Element)
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

		this._startAddContentTimeout = undefined
	}

	@state() private _currentNumberOfRenderContent: number = 0

	@state() private _endAddContentTimeout?: number
	private _addContentAtEndPosition(endIndex: number) {
		this._endIndex = endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD < this._currentNumberOfRenderContent ? endIndex + this.NO_OF_RENDER_CONTENT_TO_ADD : this._currentNumberOfRenderContent - 1
		;(async (pei: number) => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${pei - 2}`)) {
					resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${pei - 2}`) as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${pei - 2}`)) {
						resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${pei - 2}`) as Element)
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

		this._endAddContentTimeout = undefined
	}

	private _startEndIntersectionobserver!: IntersectionObserver
	private _contentItemIntersectionObserver!: IntersectionObserver
	private _thisResizeObserver!: ResizeObserver
	private _thisIntersectionObserver!: IntersectionObserver

	private readonly RENDER_CONTENT_ITEM_ELEMENT_ID_REGEX = /render-tracker-content-item-([0-9]+)/

	@state() private _thisIntersectionRatio: number = 0
	@state() private _thisHeight: number = 0

	protected firstUpdated(_changedProperties: PropertyValues): void {
		this._startEndIntersectionobserver = new IntersectionObserver(
			(entries) => {
				let decrementStartIndex = false
				let incrementEndIndex = false

				for (const entry of entries) {
					const renderStartEnd = /render-tracker-(start|end)/.exec(entry.target.id)
					if (renderStartEnd === null) {
						continue
					}
					// // Log.Log(Log.Level.DEBUG, this.localName, 'before', this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], entry.target.id, entry.intersectionRatio, this._startIndex, this._endIndex)
					// // Log.Log(Log.Level.DEBUG, this.localName, 'before', this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], entry.target.id, entry.intersectionRatio, JSON.parse(JSON.stringify(this._renderTrackers)), JSON.parse(JSON.stringify(this._itemsOutOfView)))
					if (entry.intersectionRatio > 0) {
						switch (renderStartEnd[1]) {
							case 'start':
								if (typeof this._startAddContentTimeout === 'number') {
									break
								}

								if (this._startIndex > 0) {
									decrementStartIndex = true
									if (typeof this._endAddContentTimeout === 'number') {
										window.clearTimeout(this._endAddContentTimeout)
										this._endAddContentTimeout = undefined
									}
								}
								break
							case 'end':
								if (typeof this._endAddContentTimeout === 'number') {
									break
								}

								if (this._endIndex < this._currentNumberOfRenderContent - 1) {
									incrementEndIndex = true
									if (typeof this._startAddContentTimeout === 'number') {
										window.clearTimeout(this._startAddContentTimeout)
										this._startAddContentTimeout = undefined
									}
								}
								break
						}
					}
				}

				if (decrementStartIndex) {
					if (typeof this._startAddContentTimeout !== 'number') {
						this._startAddContentTimeout = window.setTimeout(() => this._addContentAtStartPosition(this._startIndex), 500)
					}
				}

				if (incrementEndIndex) {
					if (typeof this._endAddContentTimeout !== 'number') {
						this._endAddContentTimeout = window.setTimeout(() => this._addContentAtEndPosition(this._endIndex), 500)
					}
				}

				if (this._itemsOutOfView.length > 0) {
					let minStartIndex = this._startIndex
					let maxEndIndex = this._endIndex
					for (const itemID of this._itemsOutOfView) {
						if (incrementEndIndex && itemID > minStartIndex && maxEndIndex - itemID >= this.NO_OF_RENDER_CONTENT_TO_ADD) {
							minStartIndex = itemID
							continue
						}

						if (decrementStartIndex && itemID < maxEndIndex && itemID - minStartIndex >= this.NO_OF_RENDER_CONTENT_TO_ADD) {
							maxEndIndex = itemID
							continue
						}
					}

					for (const itemID of JSON.parse(JSON.stringify(this._itemsOutOfView)) as number[]) {
						if (itemID <= minStartIndex || itemID >= maxEndIndex) {
							this._itemsOutOfView = this._itemsOutOfView.filter((ioovid) => itemID !== ioovid)
							delete this._renderTrackers[itemID]
						}
					}

					for (const key of Object.keys(this._renderTrackers)) {
						const keyNumber = Number(key)
						if (keyNumber < minStartIndex || keyNumber > maxEndIndex) {
							delete this._renderTrackers[keyNumber]
						}
					}

					if (this._startIndex !== minStartIndex) {
						this._startIndex = minStartIndex - 1 > 0 ? minStartIndex - 1 : 0
					}

					if (this._endIndex !== maxEndIndex) {
						this._endIndex = maxEndIndex - 1
					}
				}
			},
			{
				root: this.scrollelement
			}
		)

		this._contentItemIntersectionObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const renderItemElementID = this.RENDER_CONTENT_ITEM_ELEMENT_ID_REGEX.exec(entry.target.id)
					if (renderItemElementID === null) {
						continue
					}

					const itemID = Number(renderItemElementID[1])
					if (typeof this._renderTrackers[itemID] === 'undefined') {
						continue
					}

					this._renderTrackers[itemID].ContentIntersectionRatio = entry.intersectionRatio

					if (this._renderTrackers[itemID].ContentIntersectionRatio > 0) {
						if (this._itemsOutOfView.includes(itemID)) {
							this._itemsOutOfView = this._itemsOutOfView.filter((itemid) => itemid !== itemID)
						}

						if (this._renderTrackers[itemID].ContentIntersectionRatio === 1) {
							this._renderTrackers[itemID].ContentHasBeenInView = true
						}
					} else {
						if (this._renderTrackers[itemID].ContentHasBeenInView && !this._itemsOutOfView.includes(itemID)) {
							this._itemsOutOfView = [...this._itemsOutOfView, itemID]
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
				if (entry.contentRect.height > 0 && this._thisIntersectionRatio > 0) {
					this._thisHeight = entry.contentRect.height
				}
			}
		})
		this._thisResizeObserver.observe(this)
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()

		this._startEndIntersectionobserver.disconnect()
		this._contentItemIntersectionObserver.disconnect()
		this._thisIntersectionObserver.disconnect()
		this._thisResizeObserver.disconnect()

		if (typeof this._startAddContentTimeout === 'number') {
			window.clearTimeout(this._startAddContentTimeout)
		}
		if (typeof this._endAddContentTimeout === 'number') {
			window.clearTimeout(this._endAddContentTimeout)
		}
	}

	protected render(): unknown {
		if (!this.showgroupfields) {
			return nothing
		}

		if (this._thisIntersectionRatio === 0) {
			this._renderTrackerStartObserved = false
			this._rendertrackerEndObserved = false

			if (typeof this._startAddContentTimeout === 'number') {
				window.clearTimeout(this._startAddContentTimeout)
			}
			if (typeof this._endAddContentTimeout === 'number') {
				window.clearTimeout(this._endAddContentTimeout)
			}

			return html` <div class="w-full" style="min-height: ${this._thisHeight}px; height: ${this._thisHeight}px;"></div> `
		}

		;(async () => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector('#render-tracker-start')) {
					resolve((this.shadowRoot as ShadowRoot).querySelector('#render-tracker-start') as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector('#render-tracker-start')) {
						resolve((this.shadowRoot as ShadowRoot).querySelector('#render-tracker-start') as Element)
						observer.disconnect()
					}
				})

				observer.observe(this.shadowRoot as ShadowRoot, {
					childList: true,
					subtree: true
				})
			}).then((e) => {
				if (!this._renderTrackerStartObserved) {
					this._startEndIntersectionobserver.observe(e)
					this._renderTrackerStartObserved = true
				}
			})
		})()
		;(async () => {
			await new Promise((resolve: (e: Element) => void) => {
				if ((this.shadowRoot as ShadowRoot).querySelector('#render-tracker-end')) {
					resolve((this.shadowRoot as ShadowRoot).querySelector('#render-tracker-end') as Element)
					return
				}

				const observer = new MutationObserver(() => {
					if ((this.shadowRoot as ShadowRoot).querySelector('#render-tracker-end')) {
						resolve((this.shadowRoot as ShadowRoot).querySelector('#render-tracker-end') as Element)
						observer.disconnect()
					}
				})

				observer.observe(this.shadowRoot as ShadowRoot, {
					childList: true,
					subtree: true
				})
			}).then((e) => {
				if (!this._rendertrackerEndObserved) {
					this._startEndIntersectionobserver.observe(e)
					this._rendertrackerEndObserved = true
				}
			})
		})()

		return html`
			<div id="render-tracker-start" class="w-full h-fit flex flex-col justify-center">
				${(() => {
					if (typeof this._startAddContentTimeout === 'number') {
						return html`
							<div class="justify-self-end flex flex-col justify-center items-center text-xl space-y-5">
								<div class="flex">
									<span class="loading loading-ball loading-sm text-accent"></span>
									<span class="loading loading-ball loading-md text-secondary"></span>
									<span class="loading loading-ball loading-lg text-primary"></span>
								</div>
							</div>
						`
					} else if (this._startIndex > 0) {
						return html`
							<div class="divider h-fit">
								<button
									class="justify-self-end link link-hover"
									@click=${() => {
										if (typeof this._startAddContentTimeout === 'number') {
											window.clearTimeout(this._startAddContentTimeout)
										}

										if (typeof this._endAddContentTimeout === 'number') {
											window.clearTimeout(this._endAddContentTimeout)
										}

										this._startAddContentTimeout = window.setTimeout(() => this._addContentAtStartPosition(this._startIndex), 500)
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
				if (
					Array.isArray(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) &&
					Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS]) &&
					typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0] === 'object' &&
					!Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS][0]) &&
					typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string'
				) {
					if (this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS].length !== this._currentNumberOfRenderContent) {
						this._currentNumberOfRenderContent = this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS].length

						this._startIndex = 0
						if (typeof this._startAddContentTimeout === 'number') {
							window.clearTimeout(this._startAddContentTimeout)
							this._startAddContentTimeout = undefined
						}
						if (typeof this._endAddContentTimeout === 'number') {
							window.clearTimeout(this._endAddContentTimeout)
							this._endAddContentTimeout = undefined
						}

						this._endIndex = this._currentNumberOfRenderContent < this.NO_OF_RENDER_CONTENT_TO_ADD ? this._currentNumberOfRenderContent - 1 : this.NO_OF_RENDER_CONTENT_TO_ADD
						for (let i = 0; i <= this._endIndex; i++) {
							this._renderTrackers[i] = {
								ContentIntersectionObserved: false,
								ContentIntersectionRatio: 0,
								ContentHasBeenInView: false
							}
						}
						this._itemsOutOfView = []
					}

					let templates: TemplateResult<1>[] = []

					for (let index = this._startIndex; index <= this._endIndex; index++) {
						if (typeof this._renderTrackers[index] === 'undefined') {
							this._renderTrackers[index] = {
								ContentIntersectionObserved: false,
								ContentIntersectionRatio: 0,
								ContentHasBeenInView: false
							}
						}

						;(async (Index: number) => {
							await new Promise((resolve: (e: Element) => void) => {
								if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${Index}`)) {
									resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${Index}`) as Element)
									return
								}

								const observer = new MutationObserver(() => {
									if ((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${Index}`)) {
										resolve((this.shadowRoot as ShadowRoot).querySelector(`#render-tracker-content-item-${Index}`) as Element)
										observer.disconnect()
									}
								})

								observer.observe(this.shadowRoot as ShadowRoot, {
									childList: true,
									subtree: true
								})
							})
								.then((e) => {
									if (typeof this._renderTrackers[Index] === 'undefined') {
										return
									}
									if (!this._renderTrackers[Index].ContentIntersectionObserved) {
										this._contentItemIntersectionObserver.observe(e)
										this._renderTrackers[Index].ContentIntersectionObserved = true
									}
								})
								.catch((err) => {
									Log.Log(Log.Level.ERROR, 'Observe item at index', Index, 'failed', err)
								})
						})(index)

						templates.push(html`
							<section id="render-tracker-content-item-${index}" class="w-full flex space-x-1">
								<div class="flex pt-[2px] pb-[2px]">
									<div class="h-[38px] flex">
										<span class="h-[6px] w-[10px] self-center ${this.color === Theme.Color.PRIMARY ? 'bg-primary' : this.color === Theme.Color.SECONDARY ? 'bg-secondary' : 'bg-accent'}"></span>
									</div>
								</div>
								${(() => {
									if (
										typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0][this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS][index]] === 'object' &&
										!Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS][0][this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS][index]])
									) {
										return html`
											<metadata-model-build-field-group
												class="pt-1 pb-1"
												.scrollelement=${this.scrollelement}
												.noofselectoptionsineachtracker=${this.noofselectoptionsineachtracker}
												.color=${this.color}
												.fieldgroup=${this.group[MetadataModel.FgProperties.GROUP_FIELDS][0][this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS][index]]}
												.copiedfieldgroupkey=${this.copiedfieldgroupkey}
												.cutfieldgroup=${this.cutfieldgroup}
												.indexingroupreadorderoffields=${index}
												.lengthofgroupreadorderoffields=${(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] as string[]).length}
												.groupkey=${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}
												.deletefieldgroup=${this.deletefieldgroup}
												.setcutfieldgroup=${this.setcutfieldgroup}
												.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
												.pastefieldgroup=${this.pastefieldgroup}
												.createfieldgroup=${this.createfieldgroup}
												.handleselectfieldgroup=${this.handleselectfieldgroup}
												.reorderfieldgroup=${this.reorderfieldgroup}
												.showhidegroupfields=${this.showhidegroupfields}
											></metadata-model-build-field-group>
										`
									} else {
										return html`<div class="font-bold text-error self-center text-lg">Field Group is not valid</div>`
									}
								})()}
							</section>
						`)
					}

					return templates
				} else {
					return html`
						<section class="w-full flex space-x-1">
							<div class="flex pt-[2px] pb-[2px]">
								<div class="h-[38px] flex">
									<span class="h-[6px] w-[10px] self-center ${this.color === Theme.Color.PRIMARY ? 'bg-primary' : this.color === Theme.Color.SECONDARY ? 'bg-secondary' : 'bg-accent'}"></span>
								</div>
							</div>
							<div class="font-bold text-error self-center">Group is not valid</div>
						</section>
					`
				}
			})()}
			<div id="render-tracker-end" class="w-full h-fit flex flex-col justify-center">
				${(() => {
					if (typeof this._endAddContentTimeout === 'number') {
						return html`
							<div class="justify-self-end flex flex-col justify-center items-center text-xl space-y-5">
								<div class="flex">
									<span class="loading loading-ball loading-sm text-accent"></span>
									<span class="loading loading-ball loading-md text-secondary"></span>
									<span class="loading loading-ball loading-lg text-primary"></span>
								</div>
							</div>
						`
					} else if (this._endIndex < this._currentNumberOfRenderContent - 1) {
						return html`
							<div class="divider h-fit">
								<button
									class="justify-self-end link link-hover"
									@click=${() => {
										if (typeof this._endAddContentTimeout === 'number') {
											window.clearTimeout(this._endAddContentTimeout)
										}

										if (typeof this._startAddContentTimeout === 'number') {
											window.clearTimeout(this._startAddContentTimeout)
										}

										this._endAddContentTimeout = window.setTimeout(() => this._addContentAtEndPosition(this._endIndex), 500)
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
			${(() => {
				if (typeof this.createfieldgroup === 'function') {
					return html`
						<section class="w-full flex space-x-1">
							<div class="flex pt-[2px] pb-[2px]">
								<div class="h-[38px] flex">
									<span class="h-[6px] w-[10px] self-center ${this.color === Theme.Color.PRIMARY ? 'bg-primary' : this.color === Theme.Color.SECONDARY ? 'bg-secondary' : 'bg-accent'}"></span>
								</div>
							</div>
							<metadata-model-build-field-group-create class="mb-1 md:max-w-[600px]" .color=${this.color} .groupKey=${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]} .createfieldgroup=${this.createfieldgroup}></metadata-model-build-field-group-create>
						</section>
					`
				} else {
					return nothing
				}
			})()}
			${(() => {
				if ((this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 2 || this.copiedfieldgroupkey.length > 0 || this.cutfieldgroup) {
					return html`
						<footer
							class="w-full flex"
							@mouseenter=${() => (this._showGroupName = true)}
							@mouseleave=${() => {
								this._showGroupName = false
								this._showGroupKey = false
							}}
						>
							<div class="h-[38px] flex self-center">
								<span class="h-[6px] w-[10px] self-center ${this.color === Theme.Color.PRIMARY ? 'bg-primary' : this.color === Theme.Color.SECONDARY ? 'bg-secondary' : 'bg-accent'}"></span>
							</div>
							<div class="flex flex-col w-full h-fit self-center">
								<div class="relative w-full max-w-[50%]">
									${(() => {
										if (this._showGroupName) {
											return html`
												<div
													class="absolute bottom-0 z-10 max-w-fit flex flex-col space-y-1 ${this.color === Theme.Color.PRIMARY
														? 'bg-primary text-primary-content'
														: this.color === Theme.Color.SECONDARY
															? 'bg-secondary text-secondary-content'
															: 'bg-accent text-accent-content'} p-1 rounded-md shadow-md shadow-gray-800 text-center w-full"
												>
													<div class="flex space-x-2">
														<div class="h-fit self-center font-bold text-lg">${this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME] || (this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()}</div>
														<button class="btn btn-ghost w-fit h-fit p-0" @click=${() => (this._showGroupKey = !this._showGroupKey)}>
															<div class="flex flex-col justify-center">
																<div class="flex self-center">
																	<iconify-icon
																		icon="mdi:transit-connection-horizontal"
																		style="color: ${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
																		width=${Misc.IconifySize()}
																		height=${Misc.IconifySize()}
																	></iconify-icon>
																	${(() => {
																		if (this._showGroupKey === true) {
																			return html`<iconify-icon icon="mdi:close-circle" style="color: ${Theme.Color.ERROR};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('15')}></iconify-icon>`
																		} else {
																			return html`
																				<iconify-icon
																					icon="mdi:question-mark"
																					style="color: ${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
																					width=${Misc.IconifySize('20')}
																					height=${Misc.IconifySize('15')}
																				></iconify-icon>
																			`
																		}
																	})()}
																</div>
															</div>
														</button>
													</div>
													${(() => {
														if (this._showGroupKey) {
															return html` <div>${MetadataModel.FieldGroupKeyPath(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string)}</div>`
														} else {
															return nothing
														}
													})()}
												</div>
											`
										} else {
											return nothing
										}
									})()}
								</div>
								<div class="join w-full md:max-w-[400px] h-fit">
									${(() => {
										if ((this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 2) {
											return html`
												<button class="join-item btn min-h-[24px] h-fit p-1 flex flex-nowrap ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}" @click=${this.showhidegroupfields}>
													<span class="h-fit self-center">
														<iconify-icon
															icon=${this.showgroupfields ? 'mdi:eye' : 'mdi:eye-off'}
															style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
															width=${Misc.IconifySize()}
															height=${Misc.IconifySize()}
														></iconify-icon>
													</span>
													<span class="h-fit self-center ${this.color === Theme.Color.PRIMARY ? 'text-primary-content' : this.color === Theme.Color.SECONDARY ? 'text-secondary-content' : 'text-accent-content'} text-nowrap">${this.showgroupfields ? 'hide' : 'show'} content</span>
												</button>
											`
										} else {
											return nothing
										}
									})()}
									${(() => {
										if ((this.copiedfieldgroupkey.length > 0 || this.cutfieldgroup) && typeof this.pastefieldgroup === 'function') {
											return html`
												<button
													class="join-item btn w-fit min-h-[24px] h-fit p-1 flex ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}"
													@click=${() => this.pastefieldgroup!(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], -1)}
												>
													<span class="h-fit self-center"
														><iconify-icon
															icon="mdi:content-paste"
															style="color:${this.color === Theme.Color.PRIMARY ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
															width=${Misc.IconifySize()}
															height=${Misc.IconifySize()}
														></iconify-icon
													></span>
												</button>
											`
										} else {
											return nothing
										}
									})()}
								</div>
							</div>
						</footer>
					`
				} else {
					return nothing
				}
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-build-group-fields': Component
	}
}
