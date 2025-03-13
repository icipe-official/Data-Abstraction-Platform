import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '@lib/theme'
import MetadataModel from '@lib/metadata_model'
import Json from '@lib/json'

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
							<button class="btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[38px] h-[38px] w-[38px] p-2" @click=${() => (this.showgroupfields = !this.showgroupfields)}>
								${(() => {
									if (this.showgroupfields) {
										return html`
											<!--mdi:eye source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
												<path fill="${Theme.GetColorContent(this.color)}" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
											</svg>
										`
									}

									return html`
										<!--mdi:eye-off source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
											<path
												fill="${Theme.GetColorContent(this.color)}"
												d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
											/>
										</svg>
									`
								})()}
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
											<!--mdi:search source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
												<path fill="${Theme.GetColorContent(this.color)}" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
											</svg>
											<!--mdi:close-circle source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 24 24">
												<path fill="${Theme.GetColorContent(this.color)}" d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" />
											</svg>
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
													<!--mdi:search source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
														<path fill="${Theme.GetColorContent(this.color)}" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
													</svg>
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
													<!--mdi:arrow-collapse-vertical source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M4 12h16v2H4zm0-3h16v2H4zm12-5l-4 4l-4-4h3V1h2v3zM8 19l4-4l4 4h-3v3h-2v-3z" /></svg>
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
										class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[38px] h-[38px] w-[38px] p-2"
										@click=${() => {
											if (this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
												delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]
											} else {
												this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
											}
											this.updatemetadatamodel(this.fieldgroup)
										}}
									>
										${(() => {
											if (!this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
												return html`
													<!--mdi:eye source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
														<path fill="${Theme.GetColorContent(this.color)}" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
													</svg>
												`
											}

											return html`
												<!--mdi:eye-off source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
													<path
														fill="${Theme.GetColorContent(this.color)}"
														d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
													/>
												</svg>
											`
										})()}
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
										class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[38px] h-[38px] w-[38px] p-2"
										@click=${() => {
											if (this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]) {
												delete this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]
											} else {
												this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION] = true
											}
											this.updatemetadatamodel(this.fieldgroup)
										}}
									>
										${(() => {
											if (!this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]) {
												return html`
													<!--mdi:database-check source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
														<path
															fill="${Theme.GetColorContent(this.color)}"
															d="M12 3c4.42 0 8 1.79 8 4s-3.58 4-8 4s-8-1.79-8-4s3.58-4 8-4M4 9c0 2.21 3.58 4 8 4s8-1.79 8-4v3.08L19 12c-2.59 0-4.8 1.64-5.64 3.94L12 16c-4.42 0-8-1.79-8-4zm0 5c0 2.21 3.58 4 8 4h1c0 1.05.27 2.04.75 2.9L12 21c-4.42 0-8-1.79-8-4zm14 7.08l-2.75-3l1.16-1.16L18 18.5l3.59-3.58l1.16 1.41z"
														/>
													</svg>
												`
											}

											return html`
												<!--mdi:database-remove source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
													<path
														fill="${Theme.GetColorContent(this.color)}"
														d="m15.46 15.88l1.42-1.42L19 16.59l2.12-2.12l1.41 1.41L20.41 18l2.13 2.12l-1.42 1.42L19 19.41l-2.12 2.12l-1.41-1.41L17.59 18zM12 3c4.42 0 8 1.79 8 4s-3.58 4-8 4s-8-1.79-8-4s3.58-4 8-4M4 9c0 2.21 3.58 4 8 4s8-1.79 8-4v3.08L19 12c-2.59 0-4.8 1.64-5.64 3.94L12 16c-4.42 0-8-1.79-8-4zm0 5c0 2.21 3.58 4 8 4h1c0 1.05.27 2.04.75 2.9L12 21c-4.42 0-8-1.79-8-4z"
													/>
												</svg>
											`
										})()}
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
											class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[38px] h-[38px] w-[38px] p-2"
											@click=${() => {
												this.handledeletefieldgroupquerycondition(this.queryconditionindex, this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])
											}}
										>
											<!--mdi:filter-remove source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
												<path
													fill="${Theme.GetColorContent(this.color)}"
													d="M14.76 20.83L17.6 18l-2.84-2.83l1.41-1.41L19 16.57l2.83-2.81l1.41 1.41L20.43 18l2.81 2.83l-1.41 1.41L19 19.4l-2.83 2.84zM12 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L8.29 18.7a.99.99 0 0 1-.29-.83V12h-.03L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L12.03 12z"
												/>
											</svg>
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
												<div class="flex w-fit h-fit self-center gap-x-1">
													<div class="flex h-fit w-fit self-center">
														<!--mdi:sql-query source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
															<path
																fill="${Theme.GetColorContent(Theme.GetNextColorA(this.color))}"
																d="M18.68 12.32a4.49 4.49 0 0 0-6.36.01a4.49 4.49 0 0 0 0 6.36a4.51 4.51 0 0 0 5.57.63L21 22.39L22.39 21l-3.09-3.11c1.13-1.77.87-4.09-.62-5.57m-1.41 4.95c-.98.98-2.56.97-3.54 0c-.97-.98-.97-2.56.01-3.54c.97-.97 2.55-.97 3.53 0c.97.98.97 2.56 0 3.54M10.9 20.1a6.5 6.5 0 0 1-1.48-2.32C6.27 17.25 4 15.76 4 14v3c0 2.21 3.58 4 8 4c-.4-.26-.77-.56-1.1-.9M4 9v3c0 1.68 2.07 3.12 5 3.7v-.2c0-.93.2-1.85.58-2.69C6.34 12.3 4 10.79 4 9m8-6C7.58 3 4 4.79 4 7c0 2 3 3.68 6.85 4h.05c1.2-1.26 2.86-2 4.6-2c.91 0 1.81.19 2.64.56A3.22 3.22 0 0 0 20 7c0-2.21-3.58-4-8-4"
															/>
														</svg>
													</div>
													<div class="h-fit w-fit self-center flex bold"><span>:</span><span>set</span></div>
												</div>
												${(() => {
													if (Array.isArray(queryCondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
														return html`
															<div class="divider divider-horizontal ml-1 mr-1"></div>
															<div class="flex w-fit h-fit self-center gap-x-1">
																<div class="flex h-fit w-fit self-center">
																	<!--mdi:filter-check source: https://icon-sets.iconify.design-->
																	<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
																		<path
																			fill="${Theme.GetColorContent(Theme.GetNextColorA(this.color))}"
																			d="M12 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L8.29 18.7a.99.99 0 0 1-.29-.83V12h-.03L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L12.03 12zm5.75 9L15 18l1.16-1.16l1.59 1.59l3.59-3.59l1.16 1.41z"
																		/>
																	</svg>
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
								<div class="flex flex-col gap-y-1">
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
														.handleupdatefieldgroupquerycondition=${this.handleupdatefieldgroupquerycondition}
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
