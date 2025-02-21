import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import '$src/lib/components/drop-down/component'
import '$src/lib/components/calendar-time/component'
import '$src/lib/components/multi-select/component'
import Json from '$src/lib/json'

enum Tab {
	QUERY_PROPERTIES = 'QUERY_PROPERTIES',
	QUERY_CONDITIONS = 'QUERY_CONDITIONS',
	QUERY_JSON = 'QUERY_JSON',
	FIELD_GROUP_JSON = 'FIELD_GROUP_JSON'
}

@customElement('metadata-model-view-query-panel-field-group-query-condition')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: String }) color!: Theme.Color
	@property({ type: Object }) fieldgroup!: any
	@property({ type: Object }) querycondition!: MetadataModel.IQueryCondition
	@property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
	@property({ attribute: false }) handleupdatefieldgroupquerycondition!: (fieldGroupKey: string, querycondition: any) => any

	@state() private _currentTab: Tab = Tab.QUERY_PROPERTIES

	@state() private _showHintID: string = ''

	private _textFilterConditionsHtmlTemplate(orIndex: number, andIndex: number) {
		let filterCondition = ''
		if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
			if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex])) {
				if (typeof this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex] === 'object') {
					filterCondition = this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex][MetadataModel.FConditionProperties.CONDITION] || ''
				}
			}
		}
		return html`
			<option value="${MetadataModel.FilterCondition.TEXT_BEGINS_WITH}" .selected=${filterCondition === MetadataModel.FilterCondition.TEXT_BEGINS_WITH}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>text</i>) begins with</option>
			<option value="${MetadataModel.FilterCondition.TEXT_CONTAINS}" .selected=${filterCondition === MetadataModel.FilterCondition.TEXT_CONTAINS}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>text</i>) contains</option>
			<option value="${MetadataModel.FilterCondition.TEXT_ENDS_WITH}" .selected=${filterCondition === MetadataModel.FilterCondition.TEXT_ENDS_WITH}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>text</i>) ends with</option>
		`
	}

	private _timestampFilterConditionHtmlTemplate(orIndex: number, andIndex: number) {
		let filterCondition = ''
		if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
			if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex])) {
				if (typeof this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex] === 'object') {
					filterCondition = this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex][MetadataModel.FConditionProperties.CONDITION] || ''
				}
			}
		}
		return html`
			<option value="${MetadataModel.FilterCondition.TIMESTAMP_GREATER_THAN}" .selected=${filterCondition === MetadataModel.FilterCondition.TIMESTAMP_GREATER_THAN}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>timestamp</i>) greater than</option>
			<option value="${MetadataModel.FilterCondition.TIMESTAMP_LESS_THAN}" .selected=${filterCondition === MetadataModel.FilterCondition.TIMESTAMP_LESS_THAN}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>timestamp</i>) less than</option>
		`
	}

	private _numericFilterConditionsHtmlTemplate(orIndex: number, andIndex: number) {
		let filterCondition = ''
		if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
			if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex])) {
				if (typeof this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex] === 'object') {
					filterCondition = this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex][MetadataModel.FConditionProperties.CONDITION] || ''
				}
			}
		}
		return html`
			<option value="${MetadataModel.FilterCondition.NUMBER_GREATER_THAN}" .selected=${filterCondition === MetadataModel.FilterCondition.NUMBER_GREATER_THAN}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>number</i>) greater than</option>
			<option value="${MetadataModel.FilterCondition.NUMBER_LESS_THAN}" .selected=${filterCondition === MetadataModel.FilterCondition.NUMBER_LESS_THAN}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>number</i>) less than</option>
		`
	}

	private _addOrFilterConditionButtonHtmlTemplate() {
		return html`
			<button
				class="flex-1 join-item btn break-words ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}"
				@click=${() => {
					if (!Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
						this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = []
					}
					this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = [...this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION], [{}]]
					this.querycondition = structuredClone(this.querycondition)
				}}
			>
				add new 'or' filter condition
			</button>
		`
	}

	private _addAndFilterConditionButtonHtmlTemplate(orIndex: number) {
		return html`
			<button
				class="btn btn-ghost"
				@click=${() => {
					if (!Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
						this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = []
					}

					if (!Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex])) {
						this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex] = []
					}

					this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex] = [...this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex], {}]
					this.querycondition = structuredClone(this.querycondition)
				}}
			>
				<!--mdi:filter-plus source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
					<path fill="${Theme.GetColorContent(this.color)}" d="M12 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0L8.29 18.7a.99.99 0 0 1-.29-.83V12h-.03L2.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L12.03 12zm3 5h3v-3h2v3h3v2h-3v3h-2v-3h-3z" />
				</svg>
			</button>
		`
	}

	private _updateAndFilterCondition(orIndex: number, andIndex: number, andCondtion: MetadataModel.IFilterCondition) {
		this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]![orIndex][andIndex] = andCondtion
		this.querycondition = structuredClone(this.querycondition)
		this.handleupdatefieldgroupquerycondition(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.querycondition)
	}

	protected render(): unknown {
		return html`
			<header class="flex w-full">
				<section role="tablist" class="flex-[9] tabs tabs-lifted">
					<button role="tab" class="tab break-words ${this._currentTab === Tab.QUERY_PROPERTIES ? 'tab-active' : ''}" @click=${() => (this._currentTab = Tab.QUERY_PROPERTIES)}>Query Properties</button>
					<button role="tab" class="tab break-words ${this._currentTab === Tab.QUERY_CONDITIONS ? 'tab-active' : ''}" @click=${() => (this._currentTab = Tab.QUERY_CONDITIONS)}>Filter Conditions</button>
				</section>
				<drop-down class="h-fit self-end">
					<button
						slot="header"
						class="btn ${this._currentTab === Tab.QUERY_JSON || this._currentTab === Tab.FIELD_GROUP_JSON ? (this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent') : 'btn-ghost'} w-fit min-w-fit h-fit min-h-fit p-1"
					>
						<!--mdi:dots-vertical source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
							<path
								fill="${this._currentTab === Tab.QUERY_JSON || this._currentTab === Tab.FIELD_GROUP_JSON ? Theme.GetColorContent(this.color) : 'black'}"
								d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2"
							/>
						</svg>
					</button>
					<div slot="content" class="shadow-sm shadow-gray-800 p-1 flex flex-col rounded-md bg-white space-y-1">
						<button class="btn ${this._currentTab === Tab.QUERY_JSON ? (this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent') : 'btn-ghost'} break-words" @click=${() => (this._currentTab = Tab.QUERY_JSON)}>Query JSON</button>
						<button class="btn ${this._currentTab === Tab.FIELD_GROUP_JSON ? (this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent') : 'btn-ghost'} break-words" @click=${() => (this._currentTab = Tab.FIELD_GROUP_JSON)}>
							Field/Group JSON
						</button>
					</div>
				</drop-down>
			</header>
			${(() => {
				if (this.fieldgroup[MetadataModel.FgProperties.GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX]) {
					return html`
						<textarea
							class="flex-1 textarea h-[38px] ${this.color === Theme.Color.PRIMARY ? 'textarea-primary' : this.color === Theme.Color.SECONDARY ? 'textarea-secondary' : 'textarea-accent'}"
							placeholder="Enter ${MetadataModel.GetFieldGroupName(this.fieldgroup, 'fields/groups')} full text search query..."
							.value=${this.querycondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] || ''}
							@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
								if (e.currentTarget.value.length > 0) {
									this.querycondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY] = e.currentTarget.value
								} else {
									delete this.querycondition[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]
								}
								this.handleupdatefieldgroupquerycondition(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.querycondition)
							}}
						></textarea>
						<div class="divider mt-1 mb-1"></div>
					`
				}

				return nothing
			})()}
			<main class="flex-[9.5] flex flex-col space-y-1 overflow-auto">
				${(() => {
					switch (this._currentTab) {
						case Tab.QUERY_PROPERTIES:
							return html`
								<div class="grid w-full h-fit min-h-fit min-w-fit" style="grid-template-columns: 1fr 9fr; column-gap: 8px;">
									<header class="grid z-[2] sticky top-0 shadow-sm shadow-gray-800 bg-white" style="grid-column:span 2; grid-template-columns: subgrid;">
										<div class="font-bold italic">Property</div>
										<div class="font-bold">Value</div>
									</header>
									<main class="grid z-[1] gap-1" style="grid-column:span 2; grid-template-columns: subgrid;">
										<div class="italic self-center">Key</div>
										<div class="break-words">${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]}</div>

										<div class="italic self-center">Name</div>
										<input
											class="flex-1 input self-center ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
											type="text"
											placeholder="Enter field/group name..."
											.value=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] || ''}
											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
												if (e.currentTarget.value.length > 0) {
													this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] = e.currentTarget.value
												} else {
													delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME]
												}
												this.updatemetadatamodel(this.fieldgroup)
											}}
										/>

										${(() => {
											if (typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION].length > 0) {
												return html`
													<div class="italic">Description</div>
													<div class="break-words">${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}</div>
												`
											}

											return nothing
										})()}

										<div class="relative w-full h-0" style="grid-column:span 2;">
											${(() => {
												if (this._showHintID === 'fg-view-disable') {
													return html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-sm shadow-gray-800 rounded-md"
														>
															Disable viewing field/group in tables.
														</div>
													`
												}
												return nothing
											})()}
										</div>
										<div class="flex space-x-1">
											<div class="h-fit self-center">View Disabled</div>
											<div class="self-center btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-view-disable')} @mouseout=${() => (this._showHintID = '')}>
												<!--mdi:question-mark source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
												</svg>
											</div>
										</div>
										<input
											class="checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
											type="checkbox"
											.checked=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] || false}
											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
												if (e.currentTarget.checked) {
													this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
												} else {
													delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]
												}
												this.updatemetadatamodel(this.fieldgroup)
											}}
										/>

										${(() => {
											if (MetadataModel.IsGroupReadOrderOfFieldsValid(this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
												return html`
													<div class="relative w-full h-0" style="grid-column:span 2;">
														${(() => {
															if (this._showHintID === 'fg-view-as-table-in-2d') {
																return html`
																	<div
																		class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																			? 'bg-primary text-primary-content'
																			: this.color === Theme.Color.SECONDARY
																				? 'bg-secondary text-secondary-content'
																				: 'bg-accent text-accent-content'} p-1 shadow-sm shadow-gray-800 rounded-md"
																	>
																		View data as row and column with no nesting. Property works best if group has nested groups and not necessary to apply if it does not have nested groups.
																	</div>
																`
															}
															return nothing
														})()}
													</div>
													<span class="flex space-x-1">
														<div class="h-fit self-center">Group default view as table in 2D</div>
														<div class="self-center btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-view-as-table-in-2d')} @mouseout=${() => (this._showHintID = '')}>
															<!--mdi:question-mark source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
															</svg>
														</div>
													</span>
													<input
														class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
														type="checkbox"
														.checked=${this.fieldgroup[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D] || false}
														@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
															if (e.currentTarget.checked) {
																this.fieldgroup[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D] = true
															} else {
																delete this.fieldgroup[MetadataModel.FgProperties.GROUP_VIEW_TABLE_IN_2D]
															}
															this.updatemetadatamodel(this.fieldgroup)
														}}
													/>
												`
											}

											return html`
												<div class="relative w-full h-0" style="grid-column:span 2;">
													${(() => {
														if (this._showHintID === 'fg-sort-order') {
															return html`
																<div
																	class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content'
																			: 'bg-accent text-accent-content'} p-1 shadow-sm shadow-gray-800 rounded-md"
																>
																	Sort order when performing database search. Currently set to: ${this.querycondition[MetadataModel.QcProperties.D_SORT_BY_ASC] === true ? 'ASCENDING ORDER' : this.querycondition[MetadataModel.QcProperties.D_SORT_BY_ASC] === false ? 'DESCENDING ORDER' : 'NONE'}
																</div>
															`
														}
														return nothing
													})()}
												</div>
												<div class="flex space-x-1">
													<div class="h-fit self-center">Sort Order</div>
													<div class="self-center btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-sort-order')} @mouseout=${() => (this._showHintID = '')}>
														<!--mdi:question-mark source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
															<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
														</svg>
													</div>
												</div>
												<button
													class="self-center btn min-h-fit h-fit min-w-fit w-fit p-1"
													@click=${() => {
														if (this.querycondition[MetadataModel.QcProperties.D_SORT_BY_ASC] === true) {
															this.querycondition[MetadataModel.QcProperties.D_SORT_BY_ASC] = false
														} else if (this.querycondition[MetadataModel.QcProperties.D_SORT_BY_ASC] === false) {
															delete this.querycondition[MetadataModel.QcProperties.D_SORT_BY_ASC]
														} else {
															this.querycondition[MetadataModel.QcProperties.D_SORT_BY_ASC] = true
														}
														this.querycondition = structuredClone(this.querycondition)
														this.handleupdatefieldgroupquerycondition(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.querycondition)
													}}
												>
													${(() => {
														if (this.querycondition[MetadataModel.QcProperties.D_SORT_BY_ASC] === true) {
															return html`
																<!--mdi:sort-ascending source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${this.color}" d="M19 17h3l-4 4l-4-4h3V3h2M2 17h10v2H2M6 5v2H2V5m0 6h7v2H2z" /></svg>
															`
														}

														if (this.querycondition[MetadataModel.QcProperties.D_SORT_BY_ASC] === false) {
															return html`
																<!--mdi:sort-descending source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${this.color}" d="M19 7h3l-4-4l-4 4h3v14h2M2 17h10v2H2M6 5v2H2V5m0 6h7v2H2z" /></svg>
															`
														}

														return html`
															<!--mdi:do-not-enter source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${this.color}" d="M17 13H7v-2h10m-5-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2" /></svg>
														`
													})()}
												</button>
											`
										})()}

										<div class="relative w-full h-0" style="grid-column:span 2;">
											${(() => {
												if (this._showHintID === 'd-skip-data-extraction') {
													return html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-sm shadow-gray-800 rounded-md"
														>
															Skip extracting data when fetching it from the database.
														</div>
													`
												}
												return nothing
											})()}
										</div>
										<span class="flex space-x-1">
											<div class="h-fit self-center">Database Skip Data Extraction</div>
											<div class="self-center btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'd-skip-data-extraction')} @mouseout=${() => (this._showHintID = '')}>
												<!--mdi:question-mark source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
												</svg>
											</div>
										</span>
										<input
											class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
											type="checkbox"
											.checked=${this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION] || false}
											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
												if (e.currentTarget.checked) {
													this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION] = true
												} else {
													delete this.fieldgroup[MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]
												}
												this.updatemetadatamodel(this.fieldgroup)
											}}
										/>

										<div class="relative w-full h-0" style="grid-column:span 2;">
											${(() => {
												if (this._showHintID === 'fg-is-primary-key') {
													return html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-sm shadow-gray-800 rounded-md"
														>
															Used for purporses such as converting a 2D array to an array of objects.
														</div>
													`
												}
												return nothing
											})()}
										</div>
										<span class="flex space-x-1">
											<div class="h-fit self-center">Field Group is Primary Key</div>
											<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'fg-is-primary-key')} @mouseout=${() => (this._showHintID = '')}>
												<!--mdi:question-mark source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
												</svg>
											</div>
										</span>
										<input
											class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
											type="checkbox"
											.checked=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_IS_PRIMARY_KEY] || false}
											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
												if (e.currentTarget.checked) {
													this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_IS_PRIMARY_KEY] = true
												} else {
													delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_IS_PRIMARY_KEY]
												}
												this.updatemetadatamodel(this.fieldgroup)
											}}
										/>

										<div class="relative w-full h-0" style="grid-column:span 2;">
											${(() => {
												if (this._showHintID === 'd-table-collection-uid') {
													return html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-sm shadow-gray-800 rounded-md"
														>
															May be relevant in identifying columns/fields that belong to a particular table/collection in a nested join.
														</div>
													`
												}
												return nothing
											})()}
										</div>
										<span class="flex space-x-1">
											<span class="h-fit self-center break-words">Database table/collection unique id</span>
											<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'd-table-collection-uid')} @mouseout=${() => (this._showHintID = '')}>
												<!--mdi:question-mark source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
												</svg>
											</div>
										</span>
										<input
											class="flex-1 input self-center ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
											type="text"
											placeholder="Enter table/collection unique id..."
											.value=${this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] || ''}
											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
												if (e.currentTarget.value.length > 0) {
													this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] = e.currentTarget.value
												} else {
													delete this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]
												}
												this.updatemetadatamodel(this.fieldgroup)
											}}
										/>

										${(() => {
											if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] === 'object') {
												return html`
													<div class="relative w-full h-0" style="grid-column:span 2;">
														${(() => {
															if (this._showHintID === 'd-group-table-collection-name') {
																return html`
																	<div
																		class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																			? 'bg-primary text-primary-content'
																			: this.color === Theme.Color.SECONDARY
																				? 'bg-secondary text-secondary-content'
																				: 'bg-accent text-accent-content'} p-1 shadow-sm shadow-gray-800 rounded-md"
																	>
																		May be relevant in identifying tables/collections while fetching data from the database.
																	</div>
																`
															}
															return nothing
														})()}
													</div>
													<span class="flex space-x-1">
														<span class="h-fit self-center break-words">Database Table/Collection name</span>
														<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'd-group-table-collection-name')} @mouseout=${() => (this._showHintID = '')}>
															<!--mdi:question-mark source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
															</svg>
														</div>
													</span>
													<input
														class="flex-1 input self-center ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
														type="text"
														placeholder="Enter table/collection name..."
														.value=${this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] || ''}
														@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
															if (e.currentTarget.value.length > 0) {
																this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] = e.currentTarget.value
															} else {
																delete this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
															}
															this.updatemetadatamodel(this.fieldgroup)
														}}
													/>
												`
											}
											return html`
												<div class="relative w-full h-0" style="grid-column:span 2;">
													${(() => {
														if (this._showHintID === 'd-field-column-name') {
															return html`
																<div
																	class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content'
																			: 'bg-accent text-accent-content'} p-1 shadow-sm shadow-gray-800 rounded-md"
																>
																	May be relevant in identifying columns/fields while fetching data from the database.
																</div>
															`
														}
														return nothing
													})()}
												</div>
												<span class="flex space-x-1">
													<span class="h-fit self-center break-words">Database column/field name</span>
													<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'd-field-column-name')} @mouseout=${() => (this._showHintID = '')}>
														<!--mdi:question-mark source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
															<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
														</svg>
													</div>
												</span>
												<input
													class="flex-1 input self-center ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
													type="text"
													placeholder="Enter column/field name..."
													.value=${this.fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] || ''}
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
														if (e.currentTarget.value.length > 0) {
															this.fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] = e.currentTarget.value
														} else {
															delete this.fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]
														}
														this.updatemetadatamodel(this.fieldgroup)
													}}
												/>
											`
										})()}

										<div class="relative w-full h-0" style="grid-column:span 2;">
											${(() => {
												if (this._showHintID === 'fg-view-values-in-separate-columns') {
													return html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-sm shadow-gray-800 rounded-md"
														>
															Enable viewing groups/tables or fields/columns with multiple values in one row.
														</div>
													`
												}
												return nothing
											})()}
										</div>
										${(() => {
											if (!MetadataModel.IsGroupReadOrderOfFieldsValid(this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) || MetadataModel.GroupCanBeProcessedAs2D(this.fieldgroup)) {
												return html`
													<span class="flex space-x-1">
														<div class="h-fit self-center">Field Group view values in separate columns</div>
														<div class="self-center btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-view-values-in-separate-columns')} @mouseout=${() => (this._showHintID = '')}>
															<!--mdi:question-mark source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
															</svg>
														</div>
													</span>
													<input
														class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
														type="checkbox"
														.checked=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] || false}
														@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
															if (e.currentTarget.checked) {
																this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] = true
															} else {
																delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS]
															}
															this.updatemetadatamodel(this.fieldgroup)
														}}
													/>

													<div class="relative w-full h-0" style="grid-column:span 2;">
														${(() => {
															if (this._showHintID === 'fg-view-max-values-in-separate-columns') {
																return html`
																	<div
																		class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																			? 'bg-primary text-primary-content'
																			: this.color === Theme.Color.SECONDARY
																				? 'bg-secondary text-secondary-content'
																				: 'bg-accent text-accent-content'} p-1 shadow-sm shadow-gray-800 rounded-md"
																	>
																		Maximum number of columns of values in one row.
																	</div>
																`
															}
															return nothing
														})()}
													</div>
													<span class="flex space-x-1">
														<span class="h-fit self-center break-words">Field Group view max columns in separate columns</span>
														<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'fg-view-max-values-in-separate-columns')} @mouseout=${() => (this._showHintID = '')}>
															<!--mdi:question-mark source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
															</svg>
														</div>
													</span>
													<input
														class="flex-1 input self-center ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
														type="number"
														min="0"
														placeholder="Enter field group max number of values in separate columns..."
														.value=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS] === 'number' ? this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS].toString() : ''}
														@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
															if (e.currentTarget.value.length > 0) {
																if (!Number.isNaN(e.currentTarget.value)) {
																	this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS] = Math.round(Number(e.currentTarget.value))
																} else {
																	delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]
																}
															} else {
																delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]
															}
															this.updatemetadatamodel(this.fieldgroup)
														}}
													/>

													<div class="relative w-full h-0" style="grid-column:span 2;">
														${(() => {
															if (this._showHintID === 'fg-view-values-in-separate-columns-header-format') {
																return html`
																	<div
																		class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																			? 'bg-primary text-primary-content'
																			: this.color === Theme.Color.SECONDARY
																				? 'bg-secondary text-secondary-content'
																				: 'bg-accent text-accent-content'} p-1 shadow-sm shadow-gray-800 rounded-md"
																	>
																		Field view header format (replaces [*] with column/row index)
																	</div>
																`
															}
															return nothing
														})()}
													</div>
													<span class="flex space-x-1">
														<span class="h-fit self-center break-words">Field view header format</span>
														<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'fg-view-values-in-separate-columns-header-format')} @mouseout=${() => (this._showHintID = '')}>
															<!--mdi:question-mark source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
															</svg>
														</div>
													</span>
													<input
														class="flex-1 input self-center ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
														type="text"
														placeholder="Enter view header format..."
														.value=${this.fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT] || ''}
														@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
															if (e.currentTarget.value.length > 0) {
																this.fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT] = e.currentTarget.value
															} else {
																delete this.fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT]
															}
															this.updatemetadatamodel(this.fieldgroup)
														}}
													/>
												`
											}

											return nothing
										})()}
									</main>
								</div>
							`
						case Tab.QUERY_CONDITIONS:
							if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]) && this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION].length > 0) {
								return this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION].map((orFilterCondition, orIndex, orFilterConditions) => {
									return html`
										<div class="rounded-md overflow-hidden min-h-fit min-w-fit flex flex-col ">
											<header class="flex justify-between p-1 ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}">
												<div class="font-bold self-center text-lg">'Or' Filter condition #${orIndex + 1}</div>
												<div class="flex space-x-1">
													<button
														class="btn btn-ghost"
														@click=${() => {
															this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = Json.DeleteValueInObject(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION], `$.${orIndex}`)
															this.querycondition = structuredClone(this.querycondition)
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
													${this._addAndFilterConditionButtonHtmlTemplate(orIndex)}
												</div>
											</header>
											${(() => {
												if (Array.isArray(orFilterCondition) && orFilterCondition.length > 0) {
													return html`
														<div class="grid w-full h-fit" style="grid-template-columns: 1fr 9fr 1fr;">
															${orFilterCondition.map((andFilterCondition, andIndex, andFilterConditions) => {
																return html`
																	<aside class="flex h-full justify-center p-1 ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}">
																		<div class="self-start italic font-bold text-2xl">${andIndex + 1}</div>
																	</aside>
																	<main class="flex flex-col">
																		<select
																			class="rounded-none w-full select ${this.color === Theme.Color.PRIMARY ? 'select-primary' : this.color === Theme.Color.SECONDARY ? 'select-secondary' : 'select-accent'}"
																			@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																				if (e.currentTarget.value === 'true') {
																					andFilterCondition[MetadataModel.FConditionProperties.NEGATE] = true
																				} else if (e.currentTarget.value === 'false') {
																					andFilterCondition[MetadataModel.FConditionProperties.NEGATE] = false
																				} else {
																					andFilterCondition = {}
																				}
																				this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																			}}
																		>
																			<option value="" .selected=${typeof andFilterCondition[MetadataModel.FConditionProperties.NEGATE] !== 'boolean'}>is?/is not?</option>
																			<option value="false" .selected=${andFilterCondition[MetadataModel.FConditionProperties.NEGATE] === false}>is</option>
																			<option value="true" .selected=${andFilterCondition[MetadataModel.FConditionProperties.NEGATE] === true}>is not</option>
																		</select>
																		${(() => {
																			if (typeof andFilterCondition[MetadataModel.FConditionProperties.NEGATE] !== 'boolean') {
																				return nothing
																			}

																			return html`
																				<select
																					class="rounded-none w-full select ${this.color === Theme.Color.PRIMARY ? 'select-primary' : this.color === Theme.Color.SECONDARY ? 'select-secondary' : 'select-accent'}"
																					@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																						andFilterCondition[MetadataModel.FConditionProperties.CONDITION] = e.currentTarget.value as MetadataModel.FilterCondition
																						if (typeof andFilterCondition[MetadataModel.FConditionProperties.VALUE] !== 'undefined') {
																							delete andFilterCondition[MetadataModel.FConditionProperties.VALUE]
																							if (andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT]) {
																								delete andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT]
																							}
																						}
																						this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																					}}
																				>
																					<option value="" .selected=${typeof andFilterCondition[MetadataModel.FConditionProperties.CONDITION] !== 'string'} disabled>pick filter condition...</option>
																					${(() => {
																						if (MetadataModel.IsFieldAField(this.fieldgroup)) {
																							return html`
																								<option value="${MetadataModel.FilterCondition.EQUAL_TO}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.CONDITION] === MetadataModel.FilterCondition.EQUAL_TO}>
																									${MetadataModel.GetFieldGroupName(this.fieldgroup)} value equal to
																								</option>
																							`
																						}

																						return nothing
																					})()}
																					${(() => {
																						switch (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] as MetadataModel.FieldType) {
																							case MetadataModel.FieldType.TEXT:
																								return this._textFilterConditionsHtmlTemplate(orIndex, andIndex)
																							case MetadataModel.FieldType.NUMBER:
																								return this._numericFilterConditionsHtmlTemplate(orIndex, andIndex)
																							case MetadataModel.FieldType.TIMESTAMP:
																								return this._timestampFilterConditionHtmlTemplate(orIndex, andIndex)
																						}
																					})()}
																					<option value="${MetadataModel.FilterCondition.NO_OF_ENTRIES_GREATER_THAN}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.CONDITION] === MetadataModel.FilterCondition.NO_OF_ENTRIES_GREATER_THAN}>
																						No. of '${MetadataModel.GetFieldGroupName(this.fieldgroup)}' greater than
																					</option>
																					<option value="${MetadataModel.FilterCondition.NO_OF_ENTRIES_LESS_THAN}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.CONDITION] === MetadataModel.FilterCondition.NO_OF_ENTRIES_LESS_THAN}>
																						No. of '${MetadataModel.GetFieldGroupName(this.fieldgroup)}' less than
																					</option>
																					<option value="${MetadataModel.FilterCondition.NO_OF_ENTRIES_EQUAL_TO}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.CONDITION] === MetadataModel.FilterCondition.NO_OF_ENTRIES_EQUAL_TO}>
																						No. of '${MetadataModel.GetFieldGroupName(this.fieldgroup)}' equal to
																					</option>
																					<option value="" disabled>
																						<div class="divider w-full">...other field options below...</div>
																					</option>
																					${(() => {
																						if (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] !== MetadataModel.FieldType.TEXT) {
																							return this._textFilterConditionsHtmlTemplate(orIndex, andIndex)
																						}

																						return nothing
																					})()}
																					${(() => {
																						if (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] !== MetadataModel.FieldType.NUMBER) {
																							return this._numericFilterConditionsHtmlTemplate(orIndex, andIndex)
																						}

																						return nothing
																					})()}
																					${(() => {
																						if (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] !== MetadataModel.FieldType.TIMESTAMP) {
																							return this._timestampFilterConditionHtmlTemplate(orIndex, andIndex)
																						}

																						return nothing
																					})()}
																				</select>
																				${(() => {
																					if (typeof andFilterCondition[MetadataModel.FConditionProperties.CONDITION] !== 'string') {
																						return nothing
																					}

																					switch (andFilterCondition[MetadataModel.FConditionProperties.CONDITION] as MetadataModel.FilterCondition) {
																						case MetadataModel.FilterCondition.TEXT_BEGINS_WITH:
																						case MetadataModel.FilterCondition.TEXT_CONTAINS:
																						case MetadataModel.FilterCondition.TEXT_ENDS_WITH:
																							return html`
																								<textarea
																									class="textarea w-full rounded-none ${this.color === Theme.Color.PRIMARY ? 'textarea-primary' : this.color === Theme.Color.SECONDARY ? 'textarea-secondary' : 'textarea-accent'}"
																									placeholder="Enter text value..."
																									type="text"
																									.value=${andFilterCondition[MetadataModel.FConditionProperties.VALUE] || ''}
																									@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																										if (e.currentTarget.value.length > 0) {
																											andFilterCondition[MetadataModel.FConditionProperties.VALUE] = e.currentTarget.value
																										} else {
																											delete andFilterCondition[MetadataModel.FConditionProperties.VALUE]
																										}
																										this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																									}}
																								></textarea>
																							`
																						case MetadataModel.FilterCondition.NO_OF_ENTRIES_EQUAL_TO:
																						case MetadataModel.FilterCondition.NO_OF_ENTRIES_GREATER_THAN:
																						case MetadataModel.FilterCondition.NO_OF_ENTRIES_LESS_THAN:
																						case MetadataModel.FilterCondition.NUMBER_GREATER_THAN:
																						case MetadataModel.FilterCondition.NUMBER_LESS_THAN:
																							return html`
																								<input
																									class="input w-full rounded-none ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
																									placeholder="Enter numeric value..."
																									type="number"
																									.value=${andFilterCondition[MetadataModel.FConditionProperties.VALUE] || ''}
																									@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																										if (e.currentTarget.value.length > 0) {
																											if (!Number.isNaN(e.currentTarget.value)) {
																												andFilterCondition[MetadataModel.FConditionProperties.VALUE] = Number(e.currentTarget.value)
																											} else {
																												delete andFilterCondition[MetadataModel.FConditionProperties.VALUE]
																											}
																										} else {
																											delete andFilterCondition[MetadataModel.FConditionProperties.VALUE]
																										}
																										this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																									}}
																									.value=${(() => {
																										if (typeof andFilterCondition[MetadataModel.FConditionProperties.VALUE] === 'number') {
																											return `${andFilterCondition[MetadataModel.FConditionProperties.VALUE]}`
																										}
																										return ''
																									})()}
																								/>
																							`
																						case MetadataModel.FilterCondition.TIMESTAMP_GREATER_THAN:
																						case MetadataModel.FilterCondition.TIMESTAMP_LESS_THAN:
																							if (typeof andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] !== 'string') {
																								andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] = this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] || MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM
																							}
																							return html`
																								<select
																									class="rounded-none w-full select ${this.color === Theme.Color.PRIMARY ? 'select-primary' : this.color === Theme.Color.SECONDARY ? 'select-secondary' : 'select-accent'}"
																									@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																										andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] = e.currentTarget.value as MetadataModel.FieldDateTimeFormat
																										this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																									}}
																								>
																									<option disabled value="" .selected=${(andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] as string).length === 0}>Choose date time format...</option>
																									<option value="${MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}>yyyy-mm-dd HH:MM</option>
																									<option value="${MetadataModel.FieldDateTimeFormat.YYYYMMDD}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYYMMDD}>yyyy-mm-dd</option>
																									<option value="${MetadataModel.FieldDateTimeFormat.YYYYMM}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYYMM}>yyyy-mm</option>
																									<option value="${MetadataModel.FieldDateTimeFormat.HHMM}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.HHMM}>HH:MM</option>
																									<option value="${MetadataModel.FieldDateTimeFormat.YYYY}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYY}>yyyy</option>
																									<option value="${MetadataModel.FieldDateTimeFormat.MM}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.MM}>mm</option>
																								</select>
																								<calendar-time
																									class="min-w-full"
																									.color=${this.color}
																									.roundedborder=${false}
																									.datetimeinputformat=${andFilterCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT] || MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}
																									.value=${andFilterCondition[MetadataModel.FConditionProperties.VALUE] || ''}
																									@calendar-time:datetimeupdate=${(e: CustomEvent) => {
																										if (e.detail.value) {
																											andFilterCondition[MetadataModel.FConditionProperties.VALUE] = e.detail.value
																										} else {
																											delete andFilterCondition[MetadataModel.FConditionProperties.VALUE]
																										}
																										this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																									}}
																								></calendar-time>
																							`
																						case MetadataModel.FilterCondition.EQUAL_TO:
																							if (typeof andFilterCondition[MetadataModel.FConditionProperties.VALUE] === 'undefined') {
																								andFilterCondition[MetadataModel.FConditionProperties.VALUE] = {}
																							}

																							if (typeof andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] === 'undefined') {
																								if (this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.SELECT) {
																									andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FSelectType.SELECT
																								} else {
																									switch (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] as MetadataModel.FieldType) {
																										case MetadataModel.FieldType.TEXT:
																											andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.TEXT
																											break
																										case MetadataModel.FieldType.NUMBER:
																											andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.NUMBER
																											break
																										case MetadataModel.FieldType.TIMESTAMP:
																											andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.TIMESTAMP
																											break
																										case MetadataModel.FieldType.BOOLEAN:
																											andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.BOOLEAN
																											break
																									}
																								}
																							}

																							return html`
																								<select
																									class="rounded-none w-full select ${this.color === Theme.Color.PRIMARY ? 'select-primary' : this.color === Theme.Color.SECONDARY ? 'select-secondary' : 'select-accent'}"
																									@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																										andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] = e.currentTarget.value
																										if (typeof andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] !== 'undefined') {
																											delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																										}
																										this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																									}}
																								>
																									<option value="" .selected=${typeof andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] !== 'string'} disabled>pick filter value type...</option>
																									<option value="${MetadataModel.FieldType.TEXT}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] === MetadataModel.FieldType.TEXT}>Text</option>
																									<option value="${MetadataModel.FieldType.NUMBER}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] === MetadataModel.FieldType.NUMBER}>Number</option>
																									<option value="${MetadataModel.FieldType.TIMESTAMP}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] === MetadataModel.FieldType.TIMESTAMP}>Timestamp/Date time</option>
																									<option value="${MetadataModel.FieldType.BOOLEAN}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] === MetadataModel.FieldType.BOOLEAN}>Boolean</option>
																									<option value="${MetadataModel.FSelectType.SELECT}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] === MetadataModel.FSelectType.SELECT}>Text select</option>
																								</select>
																								${(() => {
																									switch (andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.TYPE] as MetadataModel.FieldType | MetadataModel.FSelectType) {
																										case MetadataModel.FSelectType.SELECT:
																											return html`
																												<multi-select
																													class="flex-1 w-full min-w-[300px]"
																													.placeholder=${'choose select value...'}
																													.selectoptions=${(this.fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS] as MetadataModel.ISelectOption[]).map((fss) => {
																														return {
																															label: fss[MetadataModel.FSelectProperties.LABEL] as string,
																															value: fss[MetadataModel.FSelectProperties.VALUE]
																														}
																													})}
																													.selectedoptions=${(() => {
																														const fieldDatum = andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																														const selectOptions = (this.fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS] as MetadataModel.ISelectOption[]).map((fss) => {
																															return {
																																label: fss[MetadataModel.FSelectProperties.LABEL] as string,
																																value: fss[MetadataModel.FSelectProperties.VALUE]
																															}
																														})
																														let selectedOptions: any[] = []
																														for (const so of selectOptions) {
																															if ((Array.isArray(fieldDatum) && fieldDatum.includes(so.value)) || so.value === fieldDatum) {
																																selectedOptions = [...selectedOptions, so]
																															}
																														}

																														return selectedOptions.length > 0 ? selectedOptions : null
																													})()}
																													.multiselect=${false}
																													.color=${this.color}
																													.borderrounded=${false}
																													@multi-select:updateselectedoptions=${(e: CustomEvent) => {
																														if (typeof e.detail.value === 'object' && e.detail.value !== null) {
																															andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] = (e.detail.value as { label: string; value: any }).value
																														} else {
																															delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																														}
																														this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																													}}
																												></multi-select>
																											`
																										case MetadataModel.FieldType.TEXT:
																											return html`
																												<textarea
																													class="textarea w-full rounded-none ${this.color === Theme.Color.PRIMARY ? 'textarea-primary' : this.color === Theme.Color.SECONDARY ? 'textarea-secondary' : 'textarea-accent'}"
																													placeholder="Enter text value..."
																													type="text"
																													.value=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] || ''}
																													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																														if (e.currentTarget.value.length > 0) {
																															andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] = e.currentTarget.value
																														} else {
																															delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																														}
																														this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																													}}
																												></textarea>
																											`
																										case MetadataModel.FieldType.NUMBER:
																											return html`
																												<input
																													class="input w-full rounded-none ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
																													placeholder="Enter numeric value..."
																													type="number"
																													.value=${(() => {
																														if (typeof andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] === 'number') {
																															return `${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]}`
																														}
																														return ''
																													})()}
																													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																														if (e.currentTarget.value.length > 0) {
																															if (!Number.isNaN(e.currentTarget.value)) {
																																andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] = Number(e.currentTarget.value)
																															} else {
																																delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																															}
																														} else {
																															delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																														}
																													}}
																												/>
																											`
																										case MetadataModel.FieldType.BOOLEAN:
																											let newSelectOptions = [
																												{
																													label: 'true',
																													value: true
																												},
																												{
																													label: 'false',
																													value: false
																												}
																											]

																											if (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]) {
																												newSelectOptions.push({
																													label: this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE],
																													value: this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]
																												})
																											}

																											if (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]) {
																												newSelectOptions.push({
																													label: this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE],
																													value: this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]
																												})
																											}

																											return html`
																												<multi-select
																													class="flex-1 w-full min-w-[300px]"
																													.placeholder=${'choose select value...'}
																													.selectoptions=${newSelectOptions}
																													.selectedoptions=${(() => {
																														for (const so of newSelectOptions) {
																															if (so.value === andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]) {
																																return so
																															}
																														}

																														return null
																													})()}
																													.multiselect=${false}
																													.color=${this.color}
																													.borderrounded=${false}
																													@multi-select:updateselectedoptions=${(e: CustomEvent) => {
																														if (typeof e.detail.value === 'object' && e.detail.value !== null) {
																															andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] = (e.detail.value as { label: string; value: any }).value
																														} else {
																															delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																														}
																														this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																													}}
																												></multi-select>
																											`
																										case MetadataModel.FieldType.TIMESTAMP:
																											if (typeof andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.DATE_TIME_FORMAT] !== 'string') {
																												andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.DATE_TIME_FORMAT] = this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] || MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM
																											}
																											return html`
																												<select
																													class="rounded-none w-full select ${this.color === Theme.Color.PRIMARY ? 'select-primary' : this.color === Theme.Color.SECONDARY ? 'select-secondary' : 'select-accent'}"
																													@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																														andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.DATE_TIME_FORMAT] = e.currentTarget.value as MetadataModel.FieldDateTimeFormat
																														this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																													}}
																												>
																													<option disabled value="" .selected=${(andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.DATE_TIME_FORMAT] as string).length === 0}>Choose date time format...</option>
																													<option
																														value="${MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}"
																														.selected=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}
																													>
																														yyyy-mm-dd HH:MM
																													</option>
																													<option value="${MetadataModel.FieldDateTimeFormat.YYYYMMDD}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYYMMDD}>
																														yyyy-mm-dd
																													</option>
																													<option value="${MetadataModel.FieldDateTimeFormat.YYYYMM}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYYMM}>
																														yyyy-mm
																													</option>
																													<option value="${MetadataModel.FieldDateTimeFormat.HHMM}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.HHMM}>
																														HH:MM
																													</option>
																													<option value="${MetadataModel.FieldDateTimeFormat.YYYY}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYY}>
																														yyyy
																													</option>
																													<option value="${MetadataModel.FieldDateTimeFormat.MM}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.DATE_TIME_FORMAT] === MetadataModel.FieldDateTimeFormat.MM}>mm</option>
																												</select>
																												<calendar-time
																													class="min-w-full"
																													.color=${this.color}
																													.roundedborder=${false}
																													.datetimeinputformat=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.DATE_TIME_FORMAT] || MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}
																													.value=${andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] || ''}
																													@calendar-time:datetimeupdate=${(e: CustomEvent) => {
																														if (e.detail.value) {
																															andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE] = e.detail.value
																														} else {
																															delete andFilterCondition[MetadataModel.FConditionProperties.VALUE][MetadataModel.FSelectProperties.VALUE]
																														}
																														this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																													}}
																												></calendar-time>
																											`
																									}
																								})()}
																							`
																					}
																				})()}
																			`
																		})()}
																	</main>
																	<aside class="flex justify-center h-full p-1 ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}">
																		<button
																			class="self-start btn btn-ghost w-fit min-w-fit h-fit min-h-fit p-1"
																			@click=${() => {
																				this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = Json.DeleteValueInObject(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION], `$.${orIndex}.${andIndex}`)
																				this.querycondition = structuredClone(this.querycondition)
																			}}
																		>
																			<!--mdi:delete source: https://icon-sets.iconify.design-->
																			<svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
																		</button>
																	</aside>
																	${(() => {
																		if (andIndex !== andFilterConditions.length - 1) {
																			return html`
																				<div class="w-full h-full ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}"></div>
																				<div class="divider ${this.color === Theme.Color.PRIMARY ? 'divider-primary text-primary' : this.color === Theme.Color.SECONDARY ? 'divider-secondary text-secondary' : 'divider-accent text-accent'}">or</div>
																				<div class="w-full h-full ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}"></div>
																			`
																		}

																		return nothing
																	})()}
																`
															})}
														</div>
													`
												}

												return html`
													<div class="w-full h-fit text-center shadow-inner shadow-gray-800 rounded-b-md flex justify-center space-x-1 p-1">
														<div class="h-fit self-center">Click</div>
														<div class="min-w-fit min-h-fit ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}">
															${this._addAndFilterConditionButtonHtmlTemplate(orIndex)}
														</div>
														<div class="h-fit self-center">to add a new 'and' filter condtion</div>
													</div>
												`
											})()}
										</div>
										${(() => {
											if (orIndex !== orFilterConditions.length - 1) {
												return html`<div class="divider ${this.color === Theme.Color.PRIMARY ? 'divider-primary text-primary' : this.color === Theme.Color.SECONDARY ? 'divider-secondary text-secondary' : 'divider-accent text-accent'}">and</div>`
											}

											return nothing
										})()}
									`
								})
							}
							return html`
								<div class="self-center flex justify-center space-x-1 p-1">
									<div class="h-fit self-center">Click</div>
									${this._addOrFilterConditionButtonHtmlTemplate()}
									<div class="h-fit self-center">to add a new 'or' filter condtion</div>
								</div>
							`
						case Tab.QUERY_JSON:
						case Tab.FIELD_GROUP_JSON:
							return html` <pre class="flex-1 bg-gray-700 text-white p-1 w-full h-full min-w-fit min-h-fit"><code>${JSON.stringify(this._currentTab === Tab.QUERY_JSON ? this.querycondition : this.fieldgroup, null, 4)}</code></pre> `
					}
				})()}
			</main>
			<footer class="join shadow-sm shadow-gray-800">
				<button
					class="flex-1 join-item btn break-words ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}"
					@click=${() => {
						if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]) && this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION].length > 0) {
							delete this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]
							this.querycondition = structuredClone(this.querycondition)
							this.handleupdatefieldgroupquerycondition(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.querycondition)
						}
					}}
				>
					reset filter conditions
				</button>
				<button
					class="flex-1 join-item btn break-words ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}"
					@click=${() => {
						if (Object.keys(this.querycondition).length > 0) {
							let filterConditions: any[] = []
							if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION]) && this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION].length > 0) {
								filterConditions = structuredClone(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])
							}
							this.querycondition = {}
							if (filterConditions.length > 0) {
								this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION] = filterConditions
							}
							this.querycondition = structuredClone(this.querycondition)
							this.handleupdatefieldgroupquerycondition(this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.querycondition)
						}
					}}
				>
					reset query conditions properties
				</button>
				${this._addOrFilterConditionButtonHtmlTemplate()}
			</footer>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-view-query-panel-field-group-query-condition': Component
	}
}
