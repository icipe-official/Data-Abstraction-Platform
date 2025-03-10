import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '@lib/theme'
import Json from '@lib/json'
import MetadataModel from '@lib/metadata_model'
import './field-group/component'
import './field-group/query-condition/component'
import Log from '@lib/log'
import '@lib/components/drop-down/component'

@customElement('metadata-model-view-query-panel')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) metadatamodel: any = {}
	@property({ type: String }) startcolor: Theme.Color = Theme.Color.PRIMARY
	@property({ type: Array }) queryconditions: MetadataModel.QueryConditions[] = [{}]

	@state() private _currentTabIndex: number = 0
	private _updateCurrentTabIndex(v: number) {
		this._currentTabIndex = v
		if (this._selectedFieldGroupQueryConditionIndex > -1) {
			this._selectedFieldGroupQueryConditionIndex = this._currentTabIndex
		}
	}

	@state() private _expandTabSection: boolean = false

	@state() private _pinTabs: boolean = false

	@state() private _showHintID: string = ''

	@state() private _selectedFieldGroupKey: string = ''
	@state() private _selectedFieldGroupQueryConditionIndex: number = -1

	@state() private _scrollelement: Element | undefined = undefined

	private _updatemetadatamodel = (fieldGroup: any) => {
		let fieldGroupPath = fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (typeof fieldGroupPath !== 'string') {
			return
		}
		fieldGroupPath = (fieldGroupPath as string).replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
		try {
			this.metadatamodel = structuredClone(Json.SetValueInObject(this.metadatamodel, fieldGroupPath, fieldGroup))
			this.dispatchEvent(
				new CustomEvent('metadata-model-view-query-panel:updatemetadatamodel', {
					detail: {
						value: this.metadatamodel
					}
				})
			)
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, e, fieldGroup)
		}
	}

	private _getquerycondition = (queryconditionindex: number, fieldGroupKey?: string) => {
		if (typeof this.queryconditions[queryconditionindex] === 'object') {
			if (typeof fieldGroupKey === 'string' && fieldGroupKey.length > 0) {
				fieldGroupKey = this._getQueryConditionFgKey(fieldGroupKey)
				if (typeof this.queryconditions[queryconditionindex][fieldGroupKey] === 'undefined') {
					return {}
				}
				return structuredClone(this.queryconditions[queryconditionindex][fieldGroupKey])
			}

			return structuredClone(this.queryconditions[queryconditionindex])
		}

		return {}
	}

	private _deletequeryconditions = (queryconditionindex: number, fieldGroupKey?: string) => {
		if (typeof this.queryconditions[queryconditionindex] === 'object') {
			if (typeof fieldGroupKey === 'string' && fieldGroupKey.length > 0) {
				fieldGroupKey = this._getQueryConditionFgKey(fieldGroupKey)
				if (typeof this.queryconditions[queryconditionindex][fieldGroupKey] === 'undefined') {
					return
				}
				delete this.queryconditions[queryconditionindex][fieldGroupKey]
			} else {
				this.queryconditions = Json.DeleteValueInObject(this.queryconditions, `$.${queryconditionindex}`)
			}
			this.queryconditions = structuredClone(this.queryconditions)
			this.dispatchEvent(
				new CustomEvent('metadata-model-view-query-panel:deletequerycondition', {
					detail: {
						queryconditionindex,
						fieldGroupKey
					}
				})
			)
			this.dispatchEvent(
				new CustomEvent('metadata-model-view-query-panel:updatequeryconditions', {
					detail: {
						value: this.queryconditions
					}
				})
			)
			if (this.queryconditions.length === 0) {
				this.queryconditions = [{}]
			}
		}
	}

	private _getQueryConditionFgKey = (fieldGroupKey: string) => fieldGroupKey.replace(MetadataModel.GROUP_FIELDS_PATH_REGEX_SEARCH, '').replace(new RegExp(MetadataModel.GROUP_FIELDS_REGEX_SEARCH, 'g'), '')

	private _isQueryConditionEmpty(querycondition: any) {
		if (Object.keys(querycondition).length === 0) {
			return true
		}

		if (Object.keys(querycondition).length === 2) {
			let keysNotDTableCollectionOnly = false
			for (const key of Object.keys(querycondition)) {
				if (key !== MetadataModel.QcProperties.D_FIELD_COLUMN_NAME && key !== MetadataModel.QcProperties.D_TABLE_COLLECTION_NAME && key !== MetadataModel.QcProperties.D_TABLE_COLLECTION_UID) {
					keysNotDTableCollectionOnly = true
					break
				}
			}

			if (!keysNotDTableCollectionOnly) {
				return true
			}
		}

		return false
	}

	private _addDatabasePropsToQueryCondition(fgKey: string, querycondition: any) {
		const fieldGroup = Json.GetValueInObject(this.metadatamodel, fgKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))
		if (MetadataModel.IsGroupFieldsValid(fieldGroup)) {
			if (typeof fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === 'string') {
				querycondition[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME] = fieldGroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]
			}
			if (typeof fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === 'string') {
				querycondition[MetadataModel.QcProperties.D_TABLE_COLLECTION_NAME] = fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
			}
			if (typeof fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] === 'string') {
				querycondition[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID] = fieldGroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]
			}
		}
	}

	@state() private _viewAllQueryConditionsJson: boolean = false
	@state() private _viewCurrentQueryConditionJson: boolean = false

	protected render(): unknown {
		if (!Array.isArray(this.queryconditions) || this.queryconditions.length === 0) {
			this.queryconditions = [{}]
		}
		
		if (typeof this._scrollelement === 'undefined') {
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
				}).then((e) => {
					this._scrollelement = e
				})
			})()
		}

		return html`
			<header class="z-[2] flex justify-between p-1 shadow-sm shadow-gray-800 ${this.startcolor === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.startcolor === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}">
				<div class="flex flex-col">
					<button
						class="btn ${this.startcolor === Theme.Color.PRIMARY ? 'btn-primary' : this.startcolor === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} h-fit min-h-fit"
						@click=${() => {
							this.queryconditions = [{}]
							this._updateCurrentTabIndex(0)
						}}
						@mouseover=${() => (this._showHintID = 'tabs-remove')}
						@mouseout=${() => (this._showHintID = '')}
					>
						<!--mdi:tab-remove source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="30" viewBox="0 0 24 24">
							<path fill="${Theme.GetColorContent(this.startcolor)}" d="m7.46 11.88l1.42-1.42L11 12.59l2.12-2.13l1.42 1.42L12.41 14l2.13 2.12l-1.42 1.42L11 15.41l-2.12 2.13l-1.42-1.42L9.59 14zM3 3h18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 2v14h18V9h-8V5z" />
						</svg>
					</button>
					${(() => {
						if (this._showHintID === 'tabs-remove') {
							return html`
								<div class="relative">
									<div class="absolute top-0 z-[2] rounded-md shadow-md shadow-gray-800 p-1 ${this.startcolor === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.startcolor === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}">
										Remove all query conditions
									</div>
								</div>
							`
						}

						return nothing
					})()}
				</div>
				<div class="flex-[9] flex">
					<div class="flex-[9] text-center font-bold italic h-fit self-center">
						${this._currentTabIndex + 1} - Query Condition
						${(() => {
							if (typeof this.queryconditions[this._currentTabIndex] === 'object') {
								return nothing
							}

							return html`<span>(${Object.keys(this.queryconditions[this._currentTabIndex])?.length || 0})</span>`
						})()}
					</div>
					<drop-down>
						<button slot="header" class="btn btn-ghost w-fit min-w-fit h-fit min-h-fit p-1 self-center">
							<!--mdi:dots-vertical source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="${Theme.GetColorContent(this.startcolor)}" d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2" />
							</svg>
						</button>
						<div slot="content" class="absolute top-0 right-0 p-1 bg-white rounded-md shadow-md shadow-gray-800 flex flex-col min-w-fit w-full">
							<button
								class="btn btn-ghost w-fit min-w-[200px] h-fit min-h-fit p-1 self-center text-black"
								@click=${() => {
									this._viewAllQueryConditionsJson = false
									this._viewCurrentQueryConditionJson = !this._viewCurrentQueryConditionJson
								}}
							>
								view current query condition as json
							</button>
							<button
								class="btn btn-ghost w-fit min-w-[200px] h-fit min-h-fit p-1 self-center text-black"
								@click=${() => {
									this._viewAllQueryConditionsJson = !this._viewAllQueryConditionsJson
									this._viewCurrentQueryConditionJson = false
								}}
							>
								view all query conditions as json
							</button>
						</div>
					</drop-down>
				</div>
			</header>
			<main class="z-[1] flex-[9.5] flex overflow-hidden">
				${(() => {
					if (this._viewAllQueryConditionsJson) {
						return html` <pre class="flex-1 bg-gray-700 text-white w-full h-full overflow-auto shadow-inner shadow-gray-800 p-1"><code>${JSON.stringify(this.queryconditions, null, 4)}</code></pre> `
					}

					return html`
						<aside class="w-fit h-full flex flex-col overflow-hidden p-[1px] shadow-sm shadow-gray-800" @mouseenter=${() => (this._expandTabSection = true)} @mouseleave=${() => (this._expandTabSection = false)}>
							<button
								class="btn flex justify-start btn-ghost h-fit min-h-fit"
								@click=${() => {
									this._pinTabs = !this._pinTabs
								}}
							>
								${(() => {
									if (this._pinTabs) {
										return html`
											<!--mdi:pin source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z" /></svg>
										`
									}

									return html`
										<!--mdi:pin-off source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24"><path d="M2 5.27L3.28 4L20 20.72L18.73 22l-5.93-5.93V22h-1.6v-6H6v-2l2-2v-.73zM16 12l2 2v2h-.18L8 6.18V4H7V2h10v2h-1z" /></svg>
									`
								})()}
								${(() => {
									if (this._expandTabSection || this._pinTabs) {
										return html`<div>${this._pinTabs ? 'Unpin' : 'Pin'} tab panel</div>`
									}

									return nothing
								})()}
							</button>
							<div class="divider"></div>
							<div class="flex-[9.5] h-fit max-h-fit overflow-x-hidden overflow-y-auto flex flex-col gap-y-1">
								${this.queryconditions.map((_, index) => {
									return html`
										<button
											class="btn flex ${this._expandTabSection || this._pinTabs ? 'justify-start' : 'justify-center'} h-fit min-h-fit p-1 ${this._currentTabIndex === index
												? this.startcolor === Theme.Color.PRIMARY
													? 'btn-primary'
													: this.startcolor === Theme.Color.SECONDARY
														? 'btn-secondary'
														: 'btn-accent'
												: ''}"
											@click=${() => {
												this._updateCurrentTabIndex(index)
											}}
										>
											<div class="flex justify-between ${this._expandTabSection || this._pinTabs ? 'w-full' : 'w-fit'}">
												<div class="flex gap-x-2">
													<div class="text-lg font-bold italic h-fit self-center">${index + 1}</div>
													${(() => {
														if (this._expandTabSection || this._pinTabs) {
															return html` <div class="text-sm h-fit self-center">- Query Condition</div> `
														}

														return nothing
													})()}
												</div>
												${(() => {
													if (this._expandTabSection || this._pinTabs) {
														return html`
															<button
																class="btn btn-ghost h-fit min-h-fit w-fit min-w-fit p-1"
																@click=${(e: Event) => {
																	e.stopPropagation()
																	this._deletequeryconditions(index)
																	if (this._currentTabIndex > this.queryconditions.length - 1) {
																		this._updateCurrentTabIndex(this.queryconditions.length - 1)
																	}
																}}
															>
																<!--mdi:close-thick source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																	<path fill="${this._currentTabIndex === index ? Theme.GetColorContent(this.startcolor) : 'black'}" d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z" />
																</svg>
															</button>
														`
													}

													return nothing
												})()}
											</div>
										</button>
									`
								})}
							</div>
							<div class="divider"></div>
							<button
								class="btn flex justify-start btn-ghost h-fit min-h-fit"
								@click=${() => {
									this.queryconditions = [...this.queryconditions, {}]
									this._updateCurrentTabIndex(this.queryconditions.length - 1)
								}}
							>
								<!--mdi:tab-add source: https://icon-sets.iconify.design-->
								<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24"><path d="M3 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 2h10v4h8v10H3zm7 5v3H7v2h3v3h2v-3h3v-2h-3v-3z" /></svg>
								${(() => {
									if (this._expandTabSection || this._pinTabs) {
										return html`<div>New query condition</div>`
									}

									return nothing
								})()}
							</button>
						</aside>
						<main class="flex-[9.5] flex flex-col overflow-hidden">
							${(() => {
								if (this._viewCurrentQueryConditionJson) {
									return html` <pre class="flex-[9] bg-gray-700 text-white w-full h-full overflow-auto shadow-inner shadow-gray-800 p-1"><code>${JSON.stringify(this.queryconditions[this._selectedFieldGroupQueryConditionIndex], null, 4)}</code></pre> `
								}

								if (this._selectedFieldGroupKey.length > 0 && this._selectedFieldGroupQueryConditionIndex > -1) {
									const fieldGroup = Json.GetValueInObject(this.metadatamodel, this._selectedFieldGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))
									return html`
										<section class="flex flex-[9] flex-col w-full h-fit overflow-hidden shadow-inner shadow-gray-800">
											<header class="flex justify-between p-1 shadow-sm shadow-gray-800 ${this.startcolor === Theme.Color.PRIMARY ? 'text-primary' : this.startcolor === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
												<div class="h-fit self-center">${MetadataModel.GetFieldGroupName(fieldGroup)}</div>
												<button
													class="btn btn-ghost h-fit min-h-fit w-fit min-w-fit p-1"
													@click=${() => {
														this._selectedFieldGroupKey = ''
														this._selectedFieldGroupQueryConditionIndex = -1
													}}
												>
													<!--mdi:close-thick source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path fill="${this.startcolor}" d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z" />
													</svg>
												</button>
											</header>
											<metadata-model-view-query-panel-field-group-query-condition
												class="flex-[9]"
												.color=${this.startcolor}
												.querycondition=${this._getquerycondition(this._selectedFieldGroupQueryConditionIndex, this._selectedFieldGroupKey)}
												.fieldgroup=${fieldGroup}
												.updatemetadatamodel=${this._updatemetadatamodel}
												.handleupdatefieldgroupquerycondition=${(fieldGroupKey: string, querycondition: MetadataModel.IQueryCondition) => {
													if (this._isQueryConditionEmpty(querycondition)) {
														this._deletequeryconditions(this._selectedFieldGroupQueryConditionIndex, this._selectedFieldGroupKey)
													} else {
														this._addDatabasePropsToQueryCondition(fieldGroupKey, querycondition)
														fieldGroupKey = this._getQueryConditionFgKey(fieldGroupKey)
														if (typeof this.queryconditions[this._selectedFieldGroupQueryConditionIndex] === 'undefined') {
															this.queryconditions[this._selectedFieldGroupQueryConditionIndex] = {}
														}
														this.queryconditions[this._selectedFieldGroupQueryConditionIndex][fieldGroupKey] = structuredClone(querycondition)
														this.dispatchEvent(
															new CustomEvent('metadata-model-view-query-panel:updatequeryconditions', {
																detail: {
																	value: this.queryconditions
																}
															})
														)
													}
												}}
											></metadata-model-view-query-panel-field-group-query-condition>
										</section>
									`
								}

								return nothing
							})()}
							<section id="scroll-element" class="flex-1 overflow-auto p-1" style="${this._selectedFieldGroupKey.length > 0 && this._selectedFieldGroupQueryConditionIndex > -1 ? 'opacity: 0.7;background-color: rgba(0, 0, 0, 0.25);' : ''}">
								${(() => {
									if (typeof this._scrollelement === 'undefined') {
										return html`
											<div class="flex-1 w-full h-full flex justify-center">
												<span class="loading loading-spinner loading-md self-center ${this.startcolor === Theme.Color.PRIMARY ? 'text-primary' : this.startcolor === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}"></span>
											</div>
										`
									}

									return html`
										<metadata-model-view-query-panel-field-group
											.scrollelement=${this._scrollelement}
											.color=${this.startcolor}
											.fieldgroup=${this.metadatamodel}
											.queryconditionindex=${this._currentTabIndex}
											.updatemetadatamodel=${this._updatemetadatamodel}
											.handleselectfieldgroup=${(queryconditionindex: number, fieldGroupKey: string) => {
												this._selectedFieldGroupKey = fieldGroupKey
												this._selectedFieldGroupQueryConditionIndex = queryconditionindex
											}}
											.handlegetfieldgroupquerycondition=${this._getquerycondition}
											.handledeletefieldgroupquerycondition=${this._deletequeryconditions}
											.handleupdatefieldgroupquerycondition=${(queryconditionindex: number, fieldGroupKey: string, querycondition: MetadataModel.IQueryCondition) => {
												if (this._isQueryConditionEmpty(querycondition)) {
													this._deletequeryconditions(queryconditionindex, fieldGroupKey)
												} else {
													this._addDatabasePropsToQueryCondition(fieldGroupKey, querycondition)
													fieldGroupKey = this._getQueryConditionFgKey(fieldGroupKey)
													if (typeof this.queryconditions[queryconditionindex] === 'undefined') {
														this.queryconditions[queryconditionindex] = {}
													}
													this.queryconditions[queryconditionindex][fieldGroupKey] = structuredClone(querycondition)
													this.dispatchEvent(
														new CustomEvent('metadata-model-view-query-panel:updatequeryconditions', {
															detail: {
																value: this.queryconditions
															}
														})
													)
												}
											}}
										></metadata-model-view-query-panel-field-group>
									`
								})()}
							</section>
						</main>
					`
				})()}
			</main>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-view-query-panel': Component
	}
}
