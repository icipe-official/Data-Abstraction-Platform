import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '@lib/theme'
import MetadataModel from '@lib/metadata_model'
import './create/component'
import Json from '@lib/json'
import 'src/lib/components/vertical-flex-scroll/component'

@customElement('metadata-model-build-field-group')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: String }) color!: Theme.Color
	@property({ type: Object }) fieldgroup!: any
	@property({ type: String }) copiedfieldgroupkey: string = ''
	@property({ type: Boolean }) cutfieldgroup: boolean = false
	@property({ type: Number }) indexingroupreadorderoffields: number = -1
	@property({ type: Number }) lengthofgroupreadorderoffields?: number
	@property({ type: String }) groupkey?: string
	@property({ type: Boolean }) showgroupfields: boolean = true
	@property({ attribute: false }) deletefieldgroup?: (fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => void
	@property({ attribute: false }) setcutfieldgroup?: (fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => void
	@property({ attribute: false }) setcopiedfieldgroupkey?: (fieldgroupkey: string) => void
	@property({ attribute: false }) pastefieldgroup?: (destinationGroupKey: string, objectIndexInGroupReadOrderOfFields: number) => void
	@property({ attribute: false }) createfieldgroup?: (groupKey: string, fieldGroupName: string, isField: boolean, objectIndexInGroupReadOrderOfFields: number) => void
	@property({ attribute: false }) handleselectfieldgroup?: (fieldgroupkey: string, color: Theme.Color) => void
	@property({ attribute: false }) reorderfieldgroup?: (groupKey: string, direction: number, fieldGroupIndexInReadOrderOfFields: number) => void
	@property({ attribute: false }) showhidegroupfields?: () => void

	@state() private _showCreateFieldGroup: boolean = false

	@state() private _searchFieldGroupsQuery: string = ''
	@state() private _showSearchFieldGroupBar: boolean = false

	@state() private _fieldsGroupsKeysSearchResults: string[] = []

	@state() private _viewFieldGroupJson: boolean = false

	@state() private _showHintID: string = ''

	@state() private _showGroupName: boolean = false
	@state() private _showGroupKey: boolean = false

	protected render(): unknown {
		return html`
			${(() => {
				if (this._showCreateFieldGroup && typeof this.groupkey === 'string' && typeof this.createfieldgroup === 'function') {
					return html` <metadata-model-build-field-group-create style="grid-column: 1/3;" .color=${this.color} .groupKey=${this.groupkey} .createfieldgroup=${this.createfieldgroup} .indexingroupreadorderoffields=${this.indexingroupreadorderoffields}></metadata-model-build-field-group-create> `
				}

				return nothing
			})()}
			${(() => {
				if (MetadataModel.IsGroupReadOrderOfFieldsValid(this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
					return html`
						<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-show-group-field-tree')} @mouseout=${() => (this._showHintID = '')}>
							<button class="btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[38px] h-[38px] w-[38px] p-1" @click=${() => (this.showgroupfields = !this.showgroupfields)}>
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
				<button
					class="link link-hover h-fit self-center text-xl ml-1"
					@click=${() => {
						if (typeof this.handleselectfieldgroup === 'function') {
							this.handleselectfieldgroup(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.color)
						}
					}}
					.disabled=${typeof this.handleselectfieldgroup !== 'function'}
				>
					${MetadataModel.GetFieldGroupName(this.fieldgroup)}
				</button>
				${(() => {
					if (this._showSearchFieldGroupBar) {
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
								<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showSearchFieldGroupBar = false)}>
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
						<span class="join w-fit h-fit self-center pl-1">
							${(() => {
								if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS] === 'object' && typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
									return html`
										<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-search-group-fields')} @mouseout=${() => (this._showHintID = '')}>
											<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showSearchFieldGroupBar = true)}>
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
							<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-view-json-data')} @mouseout=${() => (this._showHintID = '')}>
								<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._viewFieldGroupJson = !this._viewFieldGroupJson)}>
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
												if (this._viewFieldGroupJson) {
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
									if (this._showHintID === 'header-view-json-data') {
										return html`
											<div class="relative">
												<div
													class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
														? 'bg-primary text-primary-content'
														: this.color === Theme.Color.SECONDARY
															? 'bg-secondary text-secondary-content'
															: 'bg-accent text-accent-content'}"
												>
													View json data
												</div>
											</div>
										`
									}

									return nothing
								})()}
							</div>
							${(() => {
								if (typeof this.indexingroupreadorderoffields === 'number' && typeof this.lengthofgroupreadorderoffields === 'number' && (this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 3 && typeof this.showhidegroupfields === 'function') {
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
							${(() => {
								if (this.copiedfieldgroupkey !== this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] && this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== '$' && typeof this.setcopiedfieldgroupkey === 'function') {
									return html`
										<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-copy-field-group')} @mouseout=${() => (this._showHintID = '')}>
											<button
												class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
												@click=${() => this.setcopiedfieldgroupkey!(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])}
											>
												<!--mdi:content-copy source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z" /></svg>
											</button>
											${(() => {
												if (this._showHintID === 'header-copy-field-group') {
													return html`
														<div class="relative">
															<div
																class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																	? 'bg-primary text-primary-content'
																	: this.color === Theme.Color.SECONDARY
																		? 'bg-secondary text-secondary-content'
																		: 'bg-accent text-accent-content'}"
															>
																Copy field group
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
								if (this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== '$' && typeof this.indexingroupreadorderoffields === 'number' && typeof this.groupkey === 'string' && typeof this.setcutfieldgroup === 'function') {
									return html`
										<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-cut-field-group')} @mouseout=${() => (this._showHintID = '')}>
											<button
												class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
												@click=${() => this.setcutfieldgroup!(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.groupkey!, this.indexingroupreadorderoffields)}
											>
												<!--mdi:content-cut source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
													<path
														fill="${Theme.GetColorContent(this.color)}"
														d="m19 3l-6 6l2 2l7-7V3m-10 9.5a.5.5 0 0 1-.5-.5a.5.5 0 0 1 .5-.5a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5M6 20a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2M6 8a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2m3.64-.36c.23-.5.36-1.05.36-1.64a4 4 0 0 0-4-4a4 4 0 0 0-4 4a4 4 0 0 0 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1z"
													/>
												</svg>
											</button>
											${(() => {
												if (this._showHintID === 'header-cut-field-group') {
													return html`
														<div class="relative">
															<div
																class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																	? 'bg-primary text-primary-content'
																	: this.color === Theme.Color.SECONDARY
																		? 'bg-secondary text-secondary-content'
																		: 'bg-accent text-accent-content'}"
															>
																Cut field group
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
								if (typeof this.indexingroupreadorderoffields === 'number' && typeof this.lengthofgroupreadorderoffields === 'number' && typeof this.groupkey === 'string' && typeof this.deletefieldgroup === 'function') {
									return html`
										<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-delete-field-group')} @mouseout=${() => (this._showHintID = '')}>
											<button
												class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
												@click=${() => this.deletefieldgroup!(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.groupkey!, this.indexingroupreadorderoffields)}
											>
												<!--mdi:delete source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
											</button>
											${(() => {
												if (this._showHintID === 'header-delete-field-group') {
													return html`
														<div class="relative">
															<div
																class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																	? 'bg-primary text-primary-content'
																	: this.color === Theme.Color.SECONDARY
																		? 'bg-secondary text-secondary-content'
																		: 'bg-accent text-accent-content'}"
															>
																Delete field group
															</div>
														</div>
													`
												}

												return nothing
											})()}
										</div>
										${(() => {
											if (typeof this.reorderfieldgroup === 'function') {
												return html`
													${(() => {
														if (this.indexingroupreadorderoffields > 0) {
															return html`
																<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-move-field-group-up')} @mouseout=${() => (this._showHintID = '')}>
																	<button
																		class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
																		@click=${() => this.reorderfieldgroup!(this.groupkey!, -1, this.indexingroupreadorderoffields)}
																	>
																		<!--mdi:chevron-up source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" /></svg>
																	</button>
																	${(() => {
																		if (this._showHintID === 'header-move-field-group-up') {
																			return html`
																				<div class="relative">
																					<div
																						class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																							? 'bg-primary text-primary-content'
																							: this.color === Theme.Color.SECONDARY
																								? 'bg-secondary text-secondary-content'
																								: 'bg-accent text-accent-content'}"
																					>
																						Move field group up
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
														if (this.indexingroupreadorderoffields < this.lengthofgroupreadorderoffields - 1 && typeof this.groupkey === 'string') {
															return html`
																<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-move-field-group-down')} @mouseout=${() => (this._showHintID = '')}>
																	<button
																		class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
																		@click=${() => this.reorderfieldgroup!(this.groupkey!, +1, this.indexingroupreadorderoffields)}
																	>
																		<!--mdi:chevron-down source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z" /></svg>
																	</button>
																	${(() => {
																		if (this._showHintID === 'header-move-field-group-down') {
																			return html`
																				<div class="relative">
																					<div
																						class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																							? 'bg-primary text-primary-content'
																							: this.color === Theme.Color.SECONDARY
																								? 'bg-secondary text-secondary-content'
																								: 'bg-accent text-accent-content'}"
																					>
																						Move field group down
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
												`
											}
											return nothing
										})()}
										<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-add-field-group')} @mouseout=${() => (this._showHintID = '')}>
											<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showCreateFieldGroup = !this._showCreateFieldGroup)}>
												${(() => {
													if (this._showCreateFieldGroup) {
														return html`
															<!--mdi:close-circle source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
																<path fill="${Theme.GetColorContent(this.color)}" d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" />
															</svg>
														`
													}

													return html`
														<!--mdi:plus source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" /></svg>
													`
												})()}
											</button>
											${(() => {
												if (this._showHintID === 'header-add-field-group') {
													return html`
														<div class="relative">
															<div
																class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																	? 'bg-primary text-primary-content'
																	: this.color === Theme.Color.SECONDARY
																		? 'bg-secondary text-secondary-content'
																		: 'bg-accent text-accent-content'}"
															>
																${this._showCreateFieldGroup ? 'Close add field group' : 'Add field group above'}
															</div>
														</div>
													`
												}

												return nothing
											})()}
										</div>
										${(() => {
											if (typeof this.indexingroupreadorderoffields === 'number' && (this.copiedfieldgroupkey.length > 0 || this.cutfieldgroup) && typeof this.groupkey === 'string' && typeof this.pastefieldgroup === 'function') {
												return html`
													<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-paste-field-group')} @mouseout=${() => (this._showHintID = '')}>
														<button
															class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
															@click=${() => this.pastefieldgroup!(this.groupkey as string, this.indexingroupreadorderoffields as number)}
														>
															<!--mdi:content-paste source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
																<path fill="${Theme.GetColorContent(this.color)}" d="M19 20H5V4h2v3h10V4h2m-7-2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m7 0h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2" />
															</svg>
														</button>
														${(() => {
															if (this._showHintID === 'header-paste-field-group') {
																return html`
																	<div class="relative">
																		<div
																			class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																				? 'bg-primary text-primary-content'
																				: this.color === Theme.Color.SECONDARY
																					? 'bg-secondary text-secondary-content'
																					: 'bg-accent text-accent-content'}"
																		>
																			Paste copied/cut field/group
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
									`
								}

								return nothing
							})()}
						</span>
					`
				})()}
			</header>
				${(() => {
					if (!this.showgroupfields) {
						return nothing
					}

					if (this._viewFieldGroupJson) {
						return html`
							<section class="flex-1 w-full h-fit flex overflow-hidden pt-1 pb-1" style="grid-column:1/3">
								<pre class="flex-1 bg-gray-700 text-white lg:max-w-[50vw] w-full h-fit max-h-[80vh] overflow-auto shadow-inner rounded-md shadow-gray-800 p-1"><code>${JSON.stringify(this.fieldgroup, null, 4)}</code></pre>
							</section>
						`
					}

					return html`
						<div class="h-full flex justify-center">
							<div class="w-[6px] min-h-full h-full ${this.color === Theme.Color.PRIMARY ? 'bg-primary' : this.color === Theme.Color.SECONDARY ? 'bg-secondary' : 'bg-accent'}"></div>
						</div>
						${(() => {
							if (this._showSearchFieldGroupBar && typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
								if (this._fieldsGroupsKeysSearchResults.length > 0) {
									return html`
										<div class="flex flex-col">
											${this._fieldsGroupsKeysSearchResults.map((fgKey) => {
												const fieldgroup = Json.GetValueInObject(this.fieldgroup, fgKey.replace(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], '$').replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))
												if (MetadataModel.IsGroupFieldsValid(fieldgroup)) {
													return html`
														<metadata-model-build-field-group
															class="pt-1 pb-1"
															.scrollelement=${this.scrollelement}
															.color=${Theme.GetNextColorA(this.color)}
															.fieldgroup=${fieldgroup}
															.copiedfieldgroupkey=${this.copiedfieldgroupkey}
															.cutfieldgroup=${this.cutfieldgroup}
															.deletefieldgroup=${this.deletefieldgroup}
															.setcutfieldgroup=${this.setcutfieldgroup}
															.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
															.pastefieldgroup=${this.pastefieldgroup}
															.createfieldgroup=${this.createfieldgroup}
															.handleselectfieldgroup=${this.handleselectfieldgroup}
															.reorderfieldgroup=${this.reorderfieldgroup}
															.showgroupfields=${false}
														></metadata-model-build-field-group>
													`
												}

												return html` <div class="self-center text-error font-bold w-full">Field/Group<strong>${fgKey}</strong> does not exist</div> `
											})}
										</div>
									`
								}

								return html` <div class="self-center text-lg font-bold ${this.color === Theme.Color.ACCENT ? 'text-primary' : this.color === Theme.Color.PRIMARY ? 'text-secondary' : 'text-accent'}">...no results to show...</div> `
							}

							return html`
								<div class="flex flex-col">
									${(() => {
										if (MetadataModel.IsGroupReadOrderOfFieldsValid(this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
											return html`
												<virtual-flex-scroll
													.scrollelement=${this.scrollelement}
													.data=${this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]}
													.foreachrowrender=${(datum: string, dIndex: number) => {
														return html`
															<metadata-model-build-field-group
																class="pt-1 pb-1"
																.scrollelement=${this.scrollelement}
																.color=${this.color}
																.fieldgroup=${this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS][0][datum]}
																.copiedfieldgroupkey=${this.copiedfieldgroupkey}
																.cutfieldgroup=${this.cutfieldgroup}
																.indexingroupreadorderoffields=${dIndex}
																.lengthofgroupreadorderoffields=${(this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] as string[]).length}
																.groupkey=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]}
																.deletefieldgroup=${this.deletefieldgroup}
																.setcutfieldgroup=${this.setcutfieldgroup}
																.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
																.pastefieldgroup=${this.pastefieldgroup}
																.createfieldgroup=${this.createfieldgroup}
																.handleselectfieldgroup=${this.handleselectfieldgroup}
																.reorderfieldgroup=${this.reorderfieldgroup}
																.showhidegroupfields=${() => {
																	this.showgroupfields = !this.showgroupfields
																}}
															></metadata-model-build-field-group>
														`
													}}
													.enablescrollintoview=${false}
												></virtual-flex-scroll>
											`
										}

										return nothing
									})()}
									${(() => {
										if (!MetadataModel.IsFieldAField(this.fieldgroup)) {
											return html`
												<div class="flex flex-col pt-1 pb-1 gap-y-1">
													${(() => {
														if (typeof this.createfieldgroup === 'function') {
															return html` <metadata-model-build-field-group-create class="md:max-w-[600px]" .color=${this.color} .groupKey=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]} .createfieldgroup=${this.createfieldgroup}></metadata-model-build-field-group-create> `
														}

														return nothing
													})()}
													${(() => {
														if ((this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 2 || this.copiedfieldgroupkey.length > 0 || this.cutfieldgroup) {
															return html`
																<footer
																	class="flex flex-col min-w-fit h-fit"
																	@mouseenter=${() => (this._showGroupName = true)}
																	@mouseleave=${() => {
																		this._showGroupName = false
																		this._showGroupKey = false
																	}}
																>
																	<div class="relative w-full max-w-[50%]">
																		${(() => {
																			if (this._showGroupName) {
																				return html`
																					<div
																						class="absolute bottom-0 z-10 max-w-fit flex flex-col gap-y-1 ${this.color === Theme.Color.PRIMARY
																							? 'bg-primary text-primary-content'
																							: this.color === Theme.Color.SECONDARY
																								? 'bg-secondary text-secondary-content'
																								: 'bg-accent text-accent-content'} p-1 rounded-md shadow-md shadow-gray-800 text-center w-full"
																					>
																						<div class="flex gap-x-2">
																							<div class="h-fit self-center font-bold text-lg">${MetadataModel.GetFieldGroupName(this.fieldgroup)}</div>
																							<button class="btn btn-ghost w-fit h-fit p-0" @click=${() => (this._showGroupKey = !this._showGroupKey)}>
																								<div class="flex flex-col justify-center">
																									<div class="flex self-center">
																										<!--mdi:transit-connection-horizontal source: https://icon-sets.iconify.design-->
																										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																											<path
																												fill="${Theme.GetColorContent(this.color)}"
																												d="M12 9c-1.3 0-2.4.8-2.8 2H6.8C6.4 9.8 5.3 9 4 9c-1.7 0-3 1.3-3 3s1.3 3 3 3c1.3 0 2.4-.8 2.8-2h2.4c.4 1.2 1.5 2 2.8 2s2.4-.8 2.8-2h2.4c.4 1.2 1.5 2 2.8 2c1.7 0 3-1.3 3-3s-1.3-3-3-3c-1.3 0-2.4.8-2.8 2h-2.4c-.4-1.2-1.5-2-2.8-2m-9 3c0-.6.4-1 1-1s1 .4 1 1s-.4 1-1 1s-1-.4-1-1m18 0c0 .6-.4 1-1 1s-1-.4-1-1s.4-1 1-1s1 .4 1 1"
																											/>
																										</svg>
																										${(() => {
																											if (this._showGroupKey === true) {
																												return html`
																													<!--mdi:close-circle source: https://icon-sets.iconify.design-->
																													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
																														<path fill="${Theme.GetColorContent(this.color)}" d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" />
																													</svg>
																												`
																											} else {
																												return html`
																													<!--mdi:question-mark source: https://icon-sets.iconify.design-->
																													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
																														<path
																															fill="${Theme.GetColorContent(this.color)}"
																															d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6"
																														/>
																													</svg>
																												`
																											}
																										})()}
																									</div>
																								</div>
																							</button>
																						</div>
																						${(() => {
																							if (this._showGroupKey) {
																								return html` <div>${MetadataModel.FieldGroupKeyPath(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string)}</div>`
																							}

																							return nothing
																						})()}
																					</div>
																				`
																			}

																			return nothing
																		})()}
																	</div>
																	<div class="join w-full md:max-w-[400px] h-fit">
																		${(() => {
																			if ((this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 2) {
																				return html`
																					<button class="join-item btn min-h-[24px] h-fit p-1 flex flex-nowrap ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}" @click=${this.showhidegroupfields}>
																						<span class="h-fit self-center">
																							${(() => {
																								if (this.showgroupfields) {
																									return html`
																										<!--mdi:eye source: https://icon-sets.iconify.design-->
																										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																											<path
																												fill="${Theme.GetColorContent(this.color)}"
																												d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"
																											/>
																										</svg>
																									`
																								}

																								return html`
																									<!--mdi:eye-off source: https://icon-sets.iconify.design-->
																									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																										<path
																											fill="${Theme.GetColorContent(this.color)}"
																											d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
																										/>
																									</svg>
																								`
																							})()}
																						</span>
																						<span class="h-fit self-center ${this.color === Theme.Color.PRIMARY ? 'text-primary-content' : this.color === Theme.Color.SECONDARY ? 'text-secondary-content' : 'text-accent-content'} text-nowrap">${this.showgroupfields ? 'hide' : 'show'} content</span>
																					</button>
																				`
																			}

																			return nothing
																		})()}
																		${(() => {
																			if ((this.copiedfieldgroupkey.length > 0 || this.cutfieldgroup) && typeof this.pastefieldgroup === 'function') {
																				return html`
																					<button
																						class="join-item btn w-fit min-h-[24px] h-fit p-1 flex ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}"
																						@click=${() => this.pastefieldgroup!(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], -1)}
																					>
																						<span class="h-fit self-center">
																							<!--mdi:content-paste source: https://icon-sets.iconify.design-->
																							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																								<path fill="${Theme.GetColorContent(this.color)}" d="M19 20H5V4h2v3h10V4h2m-7-2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m7 0h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2" />
																							</svg>
																						</span>
																					</button>
																				`
																			}

																			return nothing
																		})()}
																	</div>
																</footer>
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
							`
						})()}
					`
				})()}
			</main>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-build-field-group': Component
	}
}
