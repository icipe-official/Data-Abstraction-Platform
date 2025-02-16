import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import Json from '$src/lib/json'
import Misc from '$src/lib/miscellaneous'

@customElement('metadata-model-view-query-panel-field-group')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: String }) color!: Theme.Color
	@property({ type: Object }) fieldgroup!: any
	@property({ type: Boolean }) showgroupfields: boolean = true
	@property({ type: Number }) queryconditionindex!: number
	@property({ attribute: false }) handleselectfieldgroup!: (queryconditionindex: number, fieldGroupKey: string) => void
	@property({ attribute: false }) handlegetfieldgroupquerycondition!: (queryconditionindex: number, fieldGroupKey: string) => any
	@property({ attribute: false }) handledeletefieldgroupquerycondition!: (queryconditionindex: number, fieldGroupKey: string) => any
	@property({ attribute: false }) handleupdatefieldgroupquerycondition!: (queryconditionindex: number, fieldGroupKey: string, querycondition: MetadataModel.IQueryCondition) => void
	@property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
	@property({ attribute: false }) showhidegroupfields?: () => void

	@state() private _searchFieldGroupsQuery: string = ''
	@state() private _showSearchFieldGroupBar: string = ''

	@state() private _fieldsGroupsKeysSearchResults: string[] = []

	@state() private _showHintID: string = ''

	protected render(): unknown {
		const queryCondition = this.handlegetfieldgroupquerycondition(this.queryconditionindex, this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])

		return html`
			${(() => {
				if (MetadataModel.IsGroupReadOrderOfFieldsValid(this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
					return html`
						<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-show-group-field-tree')} @mouseout=${() => (this._showHintID = '')}>
							<button class="btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[38px] h-[38px] w-[38px]" @click=${() => (this.showgroupfields = !this.showgroupfields)}>
								<iconify-icon icon=${this.showgroupfields ? 'mdi:eye' : 'mdi:eye-off'} style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('18')} height=${Misc.IconifySize('18')}></iconify-icon>
							</button>
							${(() => {
								if (this._showHintID === 'header-show-group-field-tree') {
									return html`
										<div class="relative">
											<div
												class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
													? 'bg-primary text-primary-content'
													: this.color === Theme.Color.SECONDARY
														? 'bg-secondary text-secondary-content'
														: 'bg-accent text-accent-content'}"
											>
												${this.showgroupfields ? 'Hide' : 'Show'} Group field tree
											</div>
										</div>
									`
								}

								return nothing
							})()}
						</div>
					`
				}

				return html`<div class="w-fit h-full min-h-full"></div>`
			})()}
			<header class="flex" style=${!MetadataModel.IsGroupReadOrderOfFieldsValid(this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) ? 'grid-column:1/3' : ''}>
				<button class="h-fit self-center text-xl ml-1 link link-hover" @click=${() => this.handleselectfieldgroup(this.queryconditionindex, this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])}>${MetadataModel.GetFieldGroupName(this.fieldgroup)}</button>
				${(() => {
					if (this._showSearchFieldGroupBar === 'header-search-group-bar') {
						return html`
							<span class="join w-fit h-fit self-center pl-1">
								<input
									class="join-item input h-[38px] ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
									type="search"
									placeholder="Search ${(MetadataModel.GetFieldGroupName(this.fieldgroup), 'fields/groups')}..."
									.value=${this._searchFieldGroupsQuery}
									@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
										this._fieldsGroupsKeysSearchResults = []
										this._searchFieldGroupsQuery = e.currentTarget.value
										if (this._searchFieldGroupsQuery.length > 0) {
											MetadataModel.ForEachFieldGroup(this.fieldgroup, (property: any) => {
												if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
													if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_NAME] === 'string') {
														if ((property[MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).toLocaleLowerCase().includes(this._searchFieldGroupsQuery.toLocaleLowerCase())) {
															this._fieldsGroupsKeysSearchResults = [...this._fieldsGroupsKeysSearchResults, property[MetadataModel.FgProperties.FIELD_GROUP_KEY]]
															return
														}
													}

													if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string') {
														if ((property[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).toLocaleLowerCase().includes(this._searchFieldGroupsQuery.toLocaleLowerCase())) {
															this._fieldsGroupsKeysSearchResults = [...this._fieldsGroupsKeysSearchResults, property[MetadataModel.FgProperties.FIELD_GROUP_KEY]]
															return
														}
													}
												}
											})
										}
									}}
								/>
								<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showSearchFieldGroupBar = '')}>
									<div class="flex flex-col justify-center">
										<div class="flex self-center">
											<iconify-icon icon="mdi:search" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
											<iconify-icon icon="mdi:close-circle" style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('15')}></iconify-icon>
										</div>
									</div>
								</button>
							</span>
						`
					}

					return html`
						<div class="flex w-fit h-fit">
							<span class="join w-fit h-fit self-center pl-1">
								${(() => {
									if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS] === 'object' && typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
										return html`
											<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-search-group-fields')} @mouseout=${() => (this._showHintID = '')}>
												<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showSearchFieldGroupBar = 'header-search-group-bar')}>
													<iconify-icon icon="mdi:search" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
												</button>
												${(() => {
													if (this._showHintID === 'header-search-group-fields') {
														return html`
															<div class="relative">
																<div
																	class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content'
																			: 'bg-accent text-accent-content'}"
																>
																	Search group fields
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
								${(() => {
									if ((this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 3 && typeof this.showhidegroupfields === 'function') {
										return html`
											<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-hide-current-field-group')} @mouseout=${() => (this._showHintID = '')}>
												<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${this.showhidegroupfields}>
													<iconify-icon icon="mdi:arrow-collapse-vertical" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
												</button>
												${(() => {
													if (this._showHintID === 'header-hide-current-field-group') {
														return html`
															<div class="relative">
																<div
																	class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content'
																			: 'bg-accent text-accent-content'}"
																>
																	Collapse/hide parent group
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
								<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-show-hide-field-group')} @mouseout=${() => (this._showHintID = '')}>
									<button
										class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[38px] h-[38px] w-[38px]"
										@click=${() => {
											if (this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
												delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]
											} else {
												this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
											}
											this.updatemetadatamodel(this.fieldgroup)
										}}
									>
										<iconify-icon icon=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] ? 'mdi:eye-off' : 'mdi:eye'} style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('18')} height=${Misc.IconifySize('18')}></iconify-icon>
									</button>
									${(() => {
										if (this._showHintID === 'header-show-hide-field-group') {
											return html`
												<div class="relative">
													<div
														class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
															? 'bg-primary text-primary-content'
															: this.color === Theme.Color.SECONDARY
																? 'bg-secondary text-secondary-content'
																: 'bg-accent text-accent-content'}"
													>
														${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] ? 'Show' : 'Hide'} field/group
													</div>
												</div>
											`
										}

										return nothing
									})()}
								</div>
								<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-skip-database-extraction-field-group')} @mouseout=${() => (this._showHintID = '')}>
									<button
										class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[38px] h-[38px] w-[38px]"
										@click=${() => {
											if (this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]) {
												delete this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]
											} else {
												this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION] = true
											}
											this.updatemetadatamodel(this.fieldgroup)
										}}
									>
										<iconify-icon icon=${this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION] ? 'mdi:database-remove' : 'mdi:database-check'} style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('18')} height=${Misc.IconifySize('18')}></iconify-icon>
									</button>
									${(() => {
										if (this._showHintID === 'header-skip-database-extraction-field-group') {
											return html`
												<div class="relative">
													<div
														class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
															? 'bg-primary text-primary-content'
															: this.color === Theme.Color.SECONDARY
																? 'bg-secondary text-secondary-content'
																: 'bg-accent text-accent-content'}"
													>
														${this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION] ? 'Unskip' : 'Skip'} field/group database search extraction
													</div>
												</div>
											`
										}

										return nothing
									})()}
								</div>
								<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-remove-field-group-query-condition')} @mouseout=${() => (this._showHintID = '')}>
									<div class="flex">
										<button
											class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[38px] h-[38px] w-[38px]"
											@click=${() => {
												this.handledeletefieldgroupquerycondition(this.queryconditionindex, this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])
											}}
										>
											<iconify-icon icon="mdi:filter-remove" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('18')} height=${Misc.IconifySize('18')}></iconify-icon>
										</button>
									</div>
									${(() => {
										if (this._showHintID === 'header-remove-field-group-query-condition') {
											return html`
												<div class="relative">
													<div
														class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
															? 'bg-primary text-primary-content'
															: this.color === Theme.Color.SECONDARY
																? 'bg-secondary text-secondary-content'
																: 'bg-accent text-accent-content'}"
													>
														Remove field/group query condtions
													</div>
												</div>
											`
										}

										return nothing
									})()}
								</div>
							</span>
							${(() => {
								if (Object.keys(queryCondition).length > 0) {
									return html`
										<div class="relative h-full">
											<span class="absolute left-[-10px] top-0 badge min-h-fit min-w-fit h-fit w-fit ${this.color === Theme.Color.ACCENT ? 'badge-primary' : this.color === Theme.Color.PRIMARY ? 'badge-secondary' : 'badge-accent'}">
												<div class="flex w-fit h-fit self-center space-x-1">
													<div class="flex h-fit w-fit self-center">
														<iconify-icon icon="mdi:sql-query" style="color:${Theme.GetColorContent(Theme.GetNextColorA(this.color))};" width=${Misc.IconifySize('18')} height=${Misc.IconifySize('18')}></iconify-icon>
													</div>
													<div class="h-fit w-fit self-center flex bold"><span>:</span><span>set</span></div>
												</div>
												${(() => {
													if (Array.isArray(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
														return html`
															<div class="divider divider-horizontal ml-1 mr-1"></div>
															<div class="flex w-fit h-fit self-center space-x-1">
																<div class="flex h-fit w-fit self-center">
																	<iconify-icon icon="mdi:filter-check" style="color:${Theme.GetColorContent(Theme.GetNextColorA(this.color))};" width=${Misc.IconifySize('18')} height=${Misc.IconifySize('18')}></iconify-icon>
																</div>
																<div class="h-fit w-fit self-center flex"><span>:</span><span>${queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION].length}</span></div>
															</div>
														`
													}
												})()}
											</span>
										</div>
									`
								}

								return nothing
							})()}
						</div>
					`
				})()}
			</header>
			${(() => {
				if (!MetadataModel.IsGroupReadOrderOfFieldsValid(this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
					return nothing
				}

				return html`
					<div class="min-h-full flex justify-center">
						<div class="w-[6px] min-h-full h-full ${this.color === Theme.Color.PRIMARY ? 'bg-primary' : this.color === Theme.Color.SECONDARY ? 'bg-secondary' : 'bg-accent'}"></div>
					</div>
					${(() => {
						if (this._showSearchFieldGroupBar === 'header-search-group-bar' && typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
							if (this._fieldsGroupsKeysSearchResults.length > 0) {
								return html`
									<div class="flex flex-col">
										${this._fieldsGroupsKeysSearchResults.map((fgKey) => {
											const fieldgroup = Json.GetValueInObject(this.fieldgroup, fgKey.replace(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], '$').replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))
											if (MetadataModel.IsGroupFieldsValid(fieldgroup)) {
												return html`
													<metadata-model-view-query-panel-field-group
														.scrollelement=${this.scrollelement}
														.color=${Theme.GetNextColorA(this.color)}
														.fieldgroup=${fieldgroup}
														.updatemetadatamodel=${this.updatemetadatamodel}
														.queryconditionindex=${this.queryconditionindex}
														.handleselectfieldgroup=${this.handleselectfieldgroup}
														.handlegetfieldgroupquerycondition=${this.handlegetfieldgroupquerycondition}
														.handledeletefieldgroupquerycondition=${this.handledeletefieldgroupquerycondition}
														.handleupdatefieldgroupquerycondition=${this.handleupdatefieldgroupquerycondition}
														.showgroupfields=${false}
													></metadata-model-view-query-panel-field-group>
												`
											}

											return html` <div class="self-center text-error font-bold w-full">Field/Group<strong>${fgKey}</strong> does not exist</div> `
										})}
									</div>
								`
							}

							return html` <div class="self-center text-lg font-bold ${this.color === Theme.Color.ACCENT ? 'text-primary' : this.color === Theme.Color.PRIMARY ? 'text-secondary' : 'text-accent'}">...no results to show...</div> `
						}

						if (!this.showgroupfields) {
							return nothing
						}

						if (MetadataModel.IsGroupReadOrderOfFieldsValid(this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
							return html`
								<div class="flex flex-col space-y-1">
									${(() => {
										if (this.fieldgroup[MetadataModel.FgProperties.GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX]) {
											return html`
												<textarea
													class="mt-1 textarea h-[38px] ${this.color === Theme.Color.PRIMARY ? 'textarea-primary' : this.color === Theme.Color.SECONDARY ? 'textarea-secondary' : 'textarea-accent'}"
													placeholder="Enter ${MetadataModel.GetFieldGroupName(this.fieldgroup, 'fields/groups')} full text search query..."
													.value=${queryCondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] || ''}
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
														if (e.currentTarget.value.length > 0) {
															queryCondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] = e.currentTarget.value
														} else {
															delete queryCondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]
														}
														this.handleupdatefieldgroupquerycondition(this.queryconditionindex, this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], queryCondition)
													}}
												></textarea>
											`
										}

										return nothing
									})()}
									<virtual-flex-scroll
										.scrollelement=${this.scrollelement}
										.data=${this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]}
										.foreachrowrender=${(datum: string, _: number) => {
											if (MetadataModel.IsGroupFieldsValid(this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS][0][datum])) {
												return html`
													<metadata-model-view-query-panel-field-group
														class="pt-1 pb-1"
														.scrollelement=${this.scrollelement}
														.color=${this.color}
														.fieldgroup=${this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS][0][datum]}
														.updatemetadatamodel=${this.updatemetadatamodel}
														.queryconditionindex=${this.queryconditionindex}
														.handleselectfieldgroup=${this.handleselectfieldgroup}
														.handlegetfieldgroupquerycondition=${this.handlegetfieldgroupquerycondition}
														.handledeletefieldgroupquerycondition=${this.handledeletefieldgroupquerycondition}
														handleupdatefieldgroupquerycondition=${this.handleupdatefieldgroupquerycondition}
														.showhidegroupfields=${() => {
															this.showgroupfields = !this.showgroupfields
														}}
													></metadata-model-view-query-panel-field-group>
												`
											}

											return html`<div class="font-bold text-error self-center text-lg">Field Group is not valid</div>`
										}}
										.enablescrollintoview=${false}
									></virtual-flex-scroll>
								</div>
							`
						}

						return nothing
					})()}
				`
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-view-query-panel-field-group': Component
	}
}
