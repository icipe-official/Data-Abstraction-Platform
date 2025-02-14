import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import 'iconify-icon'
import Misc from '$src/lib/miscellaneous'
import MetadataModel from '$src/lib/metadata_model'
import './create/component'
import Json from '$src/lib/json'
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
				<button
					class="link link-hover h-fit self-center text-xl ml-1"
					@click=${() => {
						if (typeof this.handleselectfieldgroup === 'function') {
							this.handleselectfieldgroup(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.color)
						}
					}}
					.disabled=${typeof this.handleselectfieldgroup !== 'function'}
				>
					${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] ? this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] : (this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()}
				</button>
				${(() => {
					if (this._showSearchFieldGroupBar) {
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
								<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showSearchFieldGroupBar = false)}>
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
										<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-search-group-fields')} @mouseout=${() => (this._showHintID = '')}>
											<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showSearchFieldGroupBar = true)}>
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
							<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-view-json-data')} @mouseout=${() => (this._showHintID = '')}>
								<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._viewFieldGroupJson = !this._viewFieldGroupJson)}>
									<div class="flex flex-col justify-center">
										<div class="flex self-center">
											<iconify-icon icon="mdi:code-json" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
											${(() => {
												if (this._viewFieldGroupJson) {
													return html` <iconify-icon icon="mdi:close-circle" style="color: ${Theme.Color.ERROR};" width=${Misc.IconifySize('10')} height=${Misc.IconifySize('10')}></iconify-icon> `
												} else {
													return nothing
												}
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
							${(() => {
								if (this.copiedfieldgroupkey !== this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] && this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== '$' && typeof this.setcopiedfieldgroupkey === 'function') {
									return html`
										<div class="flex flex-col" @mouseover=${() => (this._showHintID = 'header-copy-field-group')} @mouseout=${() => (this._showHintID = '')}>
											<button
												class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
												@click=${() => this.setcopiedfieldgroupkey!(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])}
											>
												<iconify-icon icon="mdi:content-copy" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
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
												<iconify-icon icon="mdi:content-cut" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
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
												<iconify-icon icon="mdi:delete" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
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
																		<iconify-icon icon="mdi:chevron-up" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
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
																		<iconify-icon icon="mdi:chevron-down" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
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
												<iconify-icon icon=${this._showCreateFieldGroup ? 'mdi:close-circle' : 'mdi:plus'} style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
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
															<iconify-icon icon="mdi:content-paste" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
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
												<div class="flex flex-col pt-1 pb-1 space-y-1">
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
																						class="absolute bottom-0 z-10 max-w-fit flex flex-col space-y-1 ${this.color === Theme.Color.PRIMARY
																							? 'bg-primary text-primary-content'
																							: this.color === Theme.Color.SECONDARY
																								? 'bg-secondary text-secondary-content'
																								: 'bg-accent text-accent-content'} p-1 rounded-md shadow-md shadow-gray-800 text-center w-full"
																					>
																						<div class="flex space-x-2">
																							<div class="h-fit self-center font-bold text-lg">${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] || (this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()}</div>
																							<button class="btn btn-ghost w-fit h-fit p-0" @click=${() => (this._showGroupKey = !this._showGroupKey)}>
																								<div class="flex flex-col justify-center">
																									<div class="flex self-center">
																										<iconify-icon icon="mdi:transit-connection-horizontal" style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
																										${(() => {
																											if (this._showGroupKey === true) {
																												return html`<iconify-icon icon="mdi:close-circle" style="color: ${Theme.Color.ERROR};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('15')}></iconify-icon>`
																											} else {
																												return html` <iconify-icon icon="mdi:question-mark" style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('15')}></iconify-icon> `
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
																							<iconify-icon icon=${this.showgroupfields ? 'mdi:eye' : 'mdi:eye-off'} style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
																						<span class="h-fit self-center"><iconify-icon icon="mdi:content-paste" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon></span>
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
