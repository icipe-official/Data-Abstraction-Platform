import { html, LitElement, nothing, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import Misc from '$src/lib/miscellaneous'
import Json from '$src/lib/json'
import '$src/lib/components/vertical-flex-scroll/component'

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
								<button class="btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[38px] h-[38px] w-[38px]" @click=${() => (this.showgroupfields = !this.showgroupfields)}>
									<iconify-icon icon=${this.showgroupfields ? 'mdi:eye' : 'mdi:eye-off'} style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('18')} height=${Misc.IconifySize('18')}></iconify-icon>
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
					<div class="h-fit self-center text-xl ml-1">
						${typeof this.getdata === 'function' && typeof this.setcurrentgroupcontext === 'function' ? `(${dIndex + 1}) ` : ''}
						${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] ? this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] : (this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()}
					</div>
					${(() => {
						if (this._showSearchFieldGroupBar === `header-search-group-bar-${dIndex}`) {
							return html`
								<span class="join w-fit h-fit self-center pl-1">
									<input
										class="join-item input h-[38px] ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
										type="search"
										placeholder="Search ${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] ? this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] : (this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()} fields/groups..."
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
							<span class="join w-fit h-fit self-center pl-1">
								${(() => {
									if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS] === 'object' && typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
										return html`
											<div class="flex flex-col" @mouseover=${() => (this._showHintID = `header-search-group-fields-${dIndex}`)} @mouseout=${() => (this._showHintID = '')}>
												<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showSearchFieldGroupBar = `header-search-group-bar-${dIndex}`)}>
													<iconify-icon icon="mdi:search" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
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
								<div class="flex flex-col" @mouseover=${() => (this._showHintID = `header-show-hide-field-group-${dIndex}`)} @mouseout=${() => (this._showHintID = '')}>
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
													<iconify-icon icon="mdi:jump" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
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
