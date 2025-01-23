import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import 'iconify-icon'
import Misc from '$src/lib/miscellaneous'
import MetadataModel from '$src/lib/metadata_model'
import '../group-fields/component'
import './create/component'
import Json from '$src/lib/json'

@customElement('metadata-model-build-field-group')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: Number }) noofselectoptionsineachtracker: number = 20
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

	protected render(): unknown {
		return html`
			${(() => {
				if (this._showCreateFieldGroup && typeof this.groupkey === 'string' && typeof this.createfieldgroup === 'function') {
					return html` <metadata-model-build-field-group-create class="mb-1" .color=${this.color} .groupKey=${this.groupkey} .createfieldgroup=${this.createfieldgroup} .indexingroupreadorderoffields=${this.indexingroupreadorderoffields}></metadata-model-build-field-group-create> `
				} else {
					return nothing
				}
			})()}
			<header class="flex">
				${(() => {
					if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS] === 'object') {
						return html`
							<button class="btn ${this.color === Theme.Color.ACCENT ? 'btn-primary' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : 'btn-accent'} min-h-[38px] h-[38px] w-[38px]" @click=${() => (this.showgroupfields = !this.showgroupfields)}>
								<iconify-icon
									icon=${this.showgroupfields ? 'mdi:eye' : 'mdi:eye-off'}
									style="color:${this.color === Theme.Color.ACCENT ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.PRIMARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
									width=${Misc.IconifySize('18')}
									height=${Misc.IconifySize('18')}
								></iconify-icon>
							</button>
						`
					} else {
						return nothing
					}
				})()}
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
									class="join-item input h-[38px] ${this.color === Theme.Color.ACCENT ? 'input-primary' : this.color === Theme.Color.PRIMARY ? 'input-secondary' : 'input-accent'}"
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
								<button class="join-item btn ${this.color === Theme.Color.ACCENT ? 'btn-primary' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showSearchFieldGroupBar = false)}>
									<div class="flex flex-col justify-center">
										<div class="flex self-center">
											<iconify-icon
												icon="mdi:search"
												style="color:${Theme.GetColorContent(this.color)};"
												width=${Misc.IconifySize('20')}
												height=${Misc.IconifySize('20')}
											></iconify-icon>
											<iconify-icon icon="mdi:close-circle" style="color: ${Theme.Color.ERROR};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('15')}></iconify-icon>
										</div>
									</div>
								</button>
							</span>
						`
					} else {
						return html`
							<span class="join w-fit h-fit self-center pl-1">
								${(() => {
									if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS] === 'object' && typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
										return html`
											<button class="join-item btn ${this.color === Theme.Color.ACCENT ? 'btn-primary' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showSearchFieldGroupBar = true)}>
												<iconify-icon
													icon="mdi:search"
													style="color:${this.color === Theme.Color.ACCENT ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.PRIMARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
													width=${Misc.IconifySize('20')}
													height=${Misc.IconifySize('20')}
												></iconify-icon>
											</button>
										`
									} else {
										return nothing
									}
								})()}
								<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._viewFieldGroupJson = !this._viewFieldGroupJson)}>
									<div class="flex flex-col justify-center">
										<div class="flex self-center">
											<iconify-icon
												icon="mdi:code-json"
												style="color:${Theme.GetColorContent(this.color)};"
												width=${Misc.IconifySize('20')}
												height=${Misc.IconifySize('20')}
											></iconify-icon>
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
									if (typeof this.indexingroupreadorderoffields === 'number' && typeof this.lengthofgroupreadorderoffields === 'number' && (this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 3 && typeof this.showhidegroupfields === 'function') {
										return html`
											<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${this.showhidegroupfields}>
												<iconify-icon
													icon="mdi:arrow-collapse-vertical"
													style="color:${Theme.GetColorContent(this.color)};"
													width=${Misc.IconifySize('20')}
													height=${Misc.IconifySize('20')}
												></iconify-icon>
											</button>
										`
									} else {
										return nothing
									}
								})()}
								${(() => {
									if (this.copiedfieldgroupkey !== this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] && this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== '$' && typeof this.setcopiedfieldgroupkey === 'function') {
										return html`
											<button
												class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
												@click=${() => this.setcopiedfieldgroupkey!(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])}
											>
												<iconify-icon
													icon="mdi:content-copy"
													style="color:${Theme.GetColorContent(this.color)};"
													width=${Misc.IconifySize('20')}
													height=${Misc.IconifySize('20')}
												></iconify-icon>
											</button>
										`
									} else {
										return nothing
									}
								})()}
								${(() => {
									if (this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== '$' && typeof this.indexingroupreadorderoffields === 'number' && typeof this.groupkey === 'string' && typeof this.setcutfieldgroup === 'function') {
										return html`
											<button
												class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
												@click=${() => this.setcutfieldgroup!(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.groupkey!, this.indexingroupreadorderoffields)}
											>
												<iconify-icon
													icon="mdi:content-cut"
													style="color:${Theme.GetColorContent(this.color)};"
													width=${Misc.IconifySize('20')}
													height=${Misc.IconifySize('20')}
												></iconify-icon>
											</button>
										`
									} else {
										return nothing
									}
								})()}
								${(() => {
									if (typeof this.indexingroupreadorderoffields === 'number' && typeof this.lengthofgroupreadorderoffields === 'number' && typeof this.groupkey === 'string' && typeof this.deletefieldgroup === 'function') {
										return html`
											<button
												class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
												@click=${() => this.deletefieldgroup!(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.groupkey!, this.indexingroupreadorderoffields)}
											>
												<iconify-icon
													icon="mdi:delete"
													style="color:${Theme.GetColorContent(this.color)};"
													width=${Misc.IconifySize('20')}
													height=${Misc.IconifySize('20')}
												></iconify-icon>
											</button>
											${(() => {
												if (typeof this.reorderfieldgroup === 'function') {
													return html`
														${(() => {
															if (this.indexingroupreadorderoffields > 0) {
																return html`
																	<button
																		class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
																		@click=${() => this.reorderfieldgroup!(this.groupkey!, -1, this.indexingroupreadorderoffields)}
																	>
																		<iconify-icon
																			icon="mdi:chevron-up"
																			style="color:${Theme.GetColorContent(this.color)};"
																			width=${Misc.IconifySize('20')}
																			height=${Misc.IconifySize('20')}
																		></iconify-icon>
																	</button>
																`
															} else {
																return nothing
															}
														})()}
														${(() => {
															if (this.indexingroupreadorderoffields < this.lengthofgroupreadorderoffields - 1 && typeof this.groupkey === 'string') {
																return html`
																	<button
																		class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
																		@click=${() => this.reorderfieldgroup!(this.groupkey!, +1, this.indexingroupreadorderoffields)}
																	>
																		<iconify-icon
																			icon="mdi:chevron-down"
																			style="color:${Theme.GetColorContent(this.color)};"
																			width=${Misc.IconifySize('20')}
																			height=${Misc.IconifySize('20')}
																		></iconify-icon>
																	</button>
																`
															} else {
																return nothing
															}
														})()}
													`
												} else {
													return nothing
												}
											})()}
											<button class="join-item btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2" @click=${() => (this._showCreateFieldGroup = !this._showCreateFieldGroup)}>
												<iconify-icon
													icon=${this._showCreateFieldGroup ? 'mdi:close-circle' : 'mdi:plus'}
													style="color:${Theme.GetColorContent(this.color)};"
													width=${Misc.IconifySize('20')}
													height=${Misc.IconifySize('20')}
												></iconify-icon>
											</button>
											${(() => {
												if (typeof this.indexingroupreadorderoffields === 'number' && (this.copiedfieldgroupkey.length > 0 || this.cutfieldgroup) && typeof this.groupkey === 'string' && typeof this.pastefieldgroup === 'function') {
													return html`
														<button
															class="join-item btn ${this.color === Theme.Color.ACCENT ? 'btn-primary' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : 'btn-accent'} min-h-[24px] h-fit w-fit p-2"
															@click=${() => this.pastefieldgroup!(this.groupkey as string, this.indexingroupreadorderoffields as number)}
														>
															<iconify-icon
																icon="mdi:content-paste"
																style="color:${this.color === Theme.Color.ACCENT ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.PRIMARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT};"
																width=${Misc.IconifySize('20')}
																height=${Misc.IconifySize('20')}
															></iconify-icon>
														</button>
													`
												} else {
													return nothing
												}
											})()}
										`
									} else {
										return nothing
									}
								})()}
							</span>
						`
					}
				})()}
			</header>
				${(() => {
					if (this._showSearchFieldGroupBar && typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
						return html`
							<main class="flex pl-[16px]">
								<div class="w-[6px] min-h-full ${this.color === Theme.Color.ACCENT ? 'bg-primary' : this.color === Theme.Color.PRIMARY ? 'bg-secondary' : 'bg-accent'}"></div>
								<div class="w-full h-full flex flex-col">
									${(() => {
										if (this._fieldsGroupsKeysSearchResults.length > 0) {
											return this._fieldsGroupsKeysSearchResults.map((fgKey) => {
												const fieldgroup = Json.GetValueInObject(this.fieldgroup, fgKey.replace(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], '$').replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))
												if (typeof fieldgroup === 'object') {
													return html`
														<section class="w-full flex space-x-1">
															<div class="flex pt-[2px] pb-[2px]">
																<div class="h-[38px] flex">
																	<span class="h-[6px] w-[10px] self-center ${this.color === Theme.Color.ACCENT ? 'bg-primary' : this.color === Theme.Color.PRIMARY ? 'bg-secondary' : 'bg-accent'}"></span>
																</div>
															</div>
															<metadata-model-build-field-group
																class="pt-1 pb-1"
																.scrollelement=${this.scrollelement}
																.noofselectoptionsineachtracker=${this.noofselectoptionsineachtracker}
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
														</section>
													`
												} else {
													return html`
														<section class="w-full flex space-x-1">
															<div class="flex pt-[2px] pb-[2px]">
																<div class="h-[38px] flex">
																	<span class="h-[6px] w-[10px] self-center ${this.color === Theme.Color.ACCENT ? 'bg-primary' : this.color === Theme.Color.PRIMARY ? 'bg-secondary' : 'bg-accent'}"></span>
																</div>
															</div>
															<div class="self-center text-error font-bold w-full">Field/Group<strong>${fgKey}</strong> does not exist</div>
														</section>
													`
												}
											})
										} else {
											return html`
												<section class="w-full flex space-x-1">
													<div class="flex pt-[2px] pb-[2px]">
														<div class="h-[38px] flex">
															<span class="h-[6px] w-[10px] self-center ${this.color === Theme.Color.ACCENT ? 'bg-primary' : this.color === Theme.Color.PRIMARY ? 'bg-secondary' : 'bg-accent'}"></span>
														</div>
													</div>
													<div class="self-center text-lg font-bold ${this.color === Theme.Color.ACCENT ? 'text-primary' : this.color === Theme.Color.PRIMARY ? 'text-secondary' : 'text-accent'}">...no results to show...</div>
												</section>
											`
										}
									})()}
								</div>
							</main>
						`
					} else if (this._viewFieldGroupJson && typeof this.fieldgroup === 'object') {
						return html`
							<section class="flex-1 w-full h-fit flex overflow-hidden pt-1 pb-1">
								<pre class="flex-1 bg-gray-700 text-white lg:max-w-[50vw] w-full h-fit max-h-[80vh] overflow-auto shadow-inner rounded-md shadow-gray-800 p-1"><code>${JSON.stringify(this.fieldgroup, null, 4)}</code></pre>
							</section>
						`
					} else {
						if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_FIELDS] === 'object') {
							return html`
								<main class="flex pl-[16px]">
									<div class="w-[6px] min-h-full ${this.color === Theme.Color.ACCENT ? 'bg-primary' : this.color === Theme.Color.PRIMARY ? 'bg-secondary' : 'bg-accent'}"></div>
									<metadata-model-build-group-fields
										class="pt-1 pb-1"
										.scrollelement=${this.scrollelement}
										.noofselectoptionsineachtracker=${this.noofselectoptionsineachtracker}
										.color=${Theme.GetNextColorA(this.color)}
										.group=${this.fieldgroup}
										.copiedfieldgroupkey=${this.copiedfieldgroupkey}
										.cutfieldgroup=${this.cutfieldgroup}
										.showgroupfields=${this.showgroupfields}
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
									></metadata-model-build-group-fields>
								</main>
							`
						} else {
							return nothing
						}
					}
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
