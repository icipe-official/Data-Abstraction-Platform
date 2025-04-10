import { html, LitElement, nothing, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '@lib/theme'
import MetadataModel from '@lib/metadata_model'
import Json from '@lib/json'
import '@lib/components/vertical-flex-scroll/component'

@customElement('metadata-model-datum-input-tree')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: String }) color!: Theme.Color
	@property({ type: Object }) fieldgroup!: any
	@property({ type: Boolean }) showgroupfields: boolean = true
	@property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
	@property({ attribute: false }) showhidegroupfields?: () => void
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ attribute: false }) getdata: ((fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any) | undefined
	@property({ attribute: false }) setcurrentgroupcontext: ((fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void) | undefined

	@state() private _searchFieldGroupsQuery: string = ''
	@state() private _showSearchFieldGroupBar: string = ''

	@state() private _fieldsGroupsKeysSearchResults: string[] = []

	@state() private _showHintID: string = ''

	protected render(): unknown {
		let lengthOfData = 1
		;(() => {
			if (typeof this.getdata === 'function') {
				const data = this.getdata(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
				if (Array.isArray(data) && data.length > 0) {
					lengthOfData = data.length
				}
			}
		})()

		let templates = new Array<TemplateResult<1>>(lengthOfData)

		for (let dIndex = 0; dIndex < lengthOfData; dIndex++) {
			templates[dIndex] = html`
				${(() => {
					if (MetadataModel.IsGroupReadOrderOfFieldsValid(this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
						return html`
							<div class="flex flex-col" @mouseover=${() => (this._showHintID = `header-show-group-field-tree-${dIndex}`)} @mouseout=${() => (this._showHintID = '')}>
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
									if (this._showHintID === `header-show-group-field-tree-${dIndex}`) {
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
					<div class="h-fit self-center text-xl ml-1">${typeof this.getdata === 'function' && typeof this.setcurrentgroupcontext === 'function' ? `(${dIndex + 1}) ` : ''} ${MetadataModel.GetFieldGroupName(this.fieldgroup)}</div>
					${(() => {
						if (this._showSearchFieldGroupBar === `header-search-group-bar-${dIndex}`) {
							return html`
								<span class="join w-fit h-fit self-center pl-1">
									<input
										class="join-item input h-[38px] ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
										type="search"
										placeholder="Search ${MetadataModel.GetFieldGroupName(this.fieldgroup, 'fields/groups')}..."
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
							<span class="join w-fit h-fit self-center pl-1">
								${(() => {
									if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS] === 'object' && typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
										return html`
											<div class="flex flex-col" @mouseover=${() => (this._showHintID = `header-search-group-fields-${dIndex}`)} @mouseout=${() => (this._showHintID = '')}>
												<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showSearchFieldGroupBar = `header-search-group-bar-${dIndex}`)}>
													<!--mdi:search source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
														<path fill="${Theme.GetColorContent(this.color)}" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
													</svg>
												</button>
												${(() => {
													if (this._showHintID === `header-search-group-fields-${dIndex}`) {
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
								<div class="flex flex-col" @mouseover=${() => (this._showHintID = `header-show-hide-field-group-${dIndex}`)} @mouseout=${() => (this._showHintID = '')}>
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
										if (this._showHintID === `header-show-hide-field-group-${dIndex}`) {
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
								${(() => {
									if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS] === 'object' && typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string' && typeof this.getdata === 'function' && typeof this.setcurrentgroupcontext === 'function') {
										return html`
											<div class="flex flex-col" @mouseover=${() => (this._showHintID = `header-set-as-start-form-context-${dIndex}`)} @mouseout=${() => (this._showHintID = '')}>
												<button
													class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
													@click=${() => {
														this.setcurrentgroupcontext!(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
													}}
												>
													<!--mdi:jump source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
														<path fill="${Theme.GetColorContent(this.color)}" d="M12 14a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m11.46-5.14l-1.59 6.89L15 14.16l3.8-2.38A7.97 7.97 0 0 0 12 8c-3.95 0-7.23 2.86-7.88 6.63l-1.97-.35C2.96 9.58 7.06 6 12 6c3.58 0 6.73 1.89 8.5 4.72z" />
													</svg>
												</button>
												${(() => {
													if (this._showHintID === `header-set-as-start-form-context-${dIndex}`) {
														return html`
															<div class="relative">
																<div
																	class="z-50 absolute top-0 self-center font-bold text-sm min-w-[150px] shadow-lg shadow-gray-800 rounded-md p-1 ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content'
																			: 'bg-accent text-accent-content'}"
																>
																	Set as start form context
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
							</span>
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
							if (this._showSearchFieldGroupBar === `header-search-group-bar-${dIndex}` && typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
								if (this._fieldsGroupsKeysSearchResults.length > 0) {
									return html`
										<div class="flex flex-col">
											${this._fieldsGroupsKeysSearchResults.map((fgKey) => {
												const fieldgroup = Json.GetValueInObject(this.fieldgroup, fgKey.replace(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], '$').replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))
												if (MetadataModel.IsGroupFieldsValid(fieldgroup)) {
													return html`
														<metadata-model-datum-input-tree class="pt-1 pb-1" .scrollelement=${this.scrollelement} .color=${Theme.GetNextColorA(this.color)} .fieldgroup=${fieldgroup} .updatemetadatamodel=${this.updatemetadatamodel} .showgroupfields=${false}></metadata-model-datum-input-tree>
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
									<virtual-flex-scroll
										.scrollelement=${this.scrollelement}
										.data=${this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]}
										.foreachrowrender=${(datum: string, _: number) => {
											if (MetadataModel.IsGroupFieldsValid(this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS][0][datum])) {
												return html`
													<metadata-model-datum-input-tree
														class="pt-1 pb-1"
														.scrollelement=${this.scrollelement}
														.color=${this.color}
														.fieldgroup=${this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS][0][datum]}
														.updatemetadatamodel=${this.updatemetadatamodel}
														.arrayindexplaceholders=${[...this.arrayindexplaceholders, dIndex]}
														.getdata=${this.getdata}
														.setcurrentgroupcontext=${this.setcurrentgroupcontext}
														.showhidegroupfields=${() => {
															this.showgroupfields = !this.showgroupfields
														}}
													></metadata-model-datum-input-tree>
												`
											}

											return html`<div class="font-bold text-error self-center text-lg">Field Group is not valid</div>`
										}}
										.enablescrollintoview=${false}
									></virtual-flex-scroll>
								`
							}

							return nothing
						})()}
					`
				})()}
			`
		}

		return templates
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-tree': Component
	}
}
