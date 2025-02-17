import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import Misc from '$src/lib/miscellaneous'
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
					filterCondition = this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex][MetadataModel.FConditionProperties.FILTER_CONDITION] || ''
				}
			}
		}
		return html`
			<option value="${MetadataModel.FilterCondition.FIELD_TEXT_BEGINS_WITH}" .selected=${filterCondition === MetadataModel.FilterCondition.FIELD_TEXT_BEGINS_WITH}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>text</i>) begins with</option>
			<option value="${MetadataModel.FilterCondition.FIELD_TEXT_CONTAINS}" .selected=${filterCondition === MetadataModel.FilterCondition.FIELD_TEXT_CONTAINS}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>text</i>) contains</option>
			<option value="${MetadataModel.FilterCondition.FIELD_TEXT_ENDS_WITH}" .selected=${filterCondition === MetadataModel.FilterCondition.FIELD_TEXT_ENDS_WITH}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>text</i>) ends with</option>
		`
	}

	private _timestampFilterConditionHtmlTemplate(orIndex: number, andIndex: number) {
		let filterCondition = ''
		if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
			if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex])) {
				if (typeof this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex] === 'object') {
					filterCondition = this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex][MetadataModel.FConditionProperties.FILTER_CONDITION] || ''
				}
			}
		}
		return html`
			<option value="${MetadataModel.FilterCondition.FIELD_TIMESTAMP_GREATER_THAN}" .selected=${filterCondition === MetadataModel.FilterCondition.FIELD_TIMESTAMP_GREATER_THAN}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>timestamp</i>) greater than</option>
			<option value="${MetadataModel.FilterCondition.FIELD_TIMESTAMP_LESS_THAN}" .selected=${filterCondition === MetadataModel.FilterCondition.FIELD_TIMESTAMP_LESS_THAN}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>timestamp</i>) less than</option>
		`
	}

	private _numericFilterConditionsHtmlTemplate(orIndex: number, andIndex: number) {
		let filterCondition = ''
		if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION])) {
			if (Array.isArray(this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex])) {
				if (typeof this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex] === 'object') {
					filterCondition = this.querycondition[MetadataModel.QcProperties.FG_FILTER_CONDITION][orIndex][andIndex][MetadataModel.FConditionProperties.FILTER_CONDITION] || ''
				}
			}
		}
		return html`
			<option value="${MetadataModel.FilterCondition.FIELD_NUMBER_GREATER_THAN}" .selected=${filterCondition === MetadataModel.FilterCondition.FIELD_NUMBER_GREATER_THAN}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>number</i>) greater than</option>
			<option value="${MetadataModel.FilterCondition.FIELD_NUMBER_LESS_THAN}" .selected=${filterCondition === MetadataModel.FilterCondition.FIELD_NUMBER_LESS_THAN}>${MetadataModel.GetFieldGroupName(this.fieldgroup)} (<i>number</i>) less than</option>
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
				<iconify-icon icon="mdi:filter-plus" style="color: ${Theme.GetColorContent(this.color)}};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
						<iconify-icon icon="mdi:dots-vertical" style="color: ${this._currentTab === Tab.QUERY_JSON || this._currentTab === Tab.FIELD_GROUP_JSON ? Theme.GetColorContent(this.color) : 'black'}};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
												<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
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
															<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
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
														<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
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
													<iconify-icon
														icon=${this.querycondition[MetadataModel.QcProperties.D_SORT_BY_ASC] === true ? 'mdi:sort-ascending' : this.querycondition[MetadataModel.QcProperties.D_SORT_BY_ASC] === false ? 'mdi:sort-descending' : 'mdi:do-not-enter'}
														style="color: ${this.color};"
														width=${Misc.IconifySize()}
														height=${Misc.IconifySize()}
													></iconify-icon>
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
												<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
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
												<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
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
												<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
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
															<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
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
														<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
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
															<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
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
															<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
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
															<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
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
														<iconify-icon icon="mdi:filter-remove" style="color: ${Theme.GetColorContent(this.color)}};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
																					andFilterCondition[MetadataModel.FConditionProperties.FILTER_NEGATE] = true
																				} else if (e.currentTarget.value === 'false') {
																					andFilterCondition[MetadataModel.FConditionProperties.FILTER_NEGATE] = false
																				} else {
																					andFilterCondition = {}
																				}
																				this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																			}}
																		>
																			<option value="" .selected=${typeof andFilterCondition[MetadataModel.FConditionProperties.FILTER_NEGATE] !== 'boolean'}>is?/is not?</option>
																			<option value="false" .selected=${!andFilterCondition[MetadataModel.FConditionProperties.FILTER_NEGATE] === false}>is</option>
																			<option value="true" .selected=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_NEGATE] === true}>is not</option>
																		</select>
																		${(() => {
																			if (typeof andFilterCondition[MetadataModel.FConditionProperties.FILTER_NEGATE] !== 'boolean') {
																				return nothing
																			}

																			return html`
																				<select
																					class="rounded-none w-full select ${this.color === Theme.Color.PRIMARY ? 'select-primary' : this.color === Theme.Color.SECONDARY ? 'select-secondary' : 'select-accent'}"
																					@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																						andFilterCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] = e.currentTarget.value as MetadataModel.FilterCondition
																						if (typeof andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE] !== 'undefined') {
																							delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE]
																						}
																						this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																					}}
																				>
																					<option value="" .selected=${typeof andFilterCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] !== 'string'} disabled>pick filter condition...</option>
																					${(() => {
																						if (MetadataModel.IsFieldAField(this.fieldgroup)) {
																							return html`
																								<option value="${MetadataModel.FilterCondition.FIELD_EQUAL_TO}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] === MetadataModel.FilterCondition.FIELD_EQUAL_TO}>
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
																					<option value="${MetadataModel.FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_GREATER_THAN}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] === MetadataModel.FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_GREATER_THAN}>
																						No. of '${MetadataModel.GetFieldGroupName(this.fieldgroup)}' greater than
																					</option>
																					<option value="${MetadataModel.FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_LESS_THAN}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] === MetadataModel.FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_LESS_THAN}>
																						No. of '${MetadataModel.GetFieldGroupName(this.fieldgroup)}' less than
																					</option>
																					<option value="${MetadataModel.FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_EQUAL_TO}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] === MetadataModel.FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_EQUAL_TO}>
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
																					if (typeof andFilterCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] !== 'string') {
																						return nothing
																					}

																					switch (andFilterCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] as MetadataModel.FilterCondition) {
																						case MetadataModel.FilterCondition.FIELD_TEXT_BEGINS_WITH:
																						case MetadataModel.FilterCondition.FIELD_TEXT_CONTAINS:
																						case MetadataModel.FilterCondition.FIELD_TEXT_ENDS_WITH:
																							return html`
																								<textarea
																									class="textarea w-full rounded-none ${this.color === Theme.Color.PRIMARY ? 'textarea-primary' : this.color === Theme.Color.SECONDARY ? 'textarea-secondary' : 'textarea-accent'}"
																									placeholder="Enter text value..."
																									type="text"
																									.value=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE] || ''}
																									@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																										if (e.currentTarget.value.length > 0) {
																											andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE] = e.currentTarget.value
																										} else {
																											delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE]
																										}
																										this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																									}}
																								></textarea>
																							`
																						case MetadataModel.FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_EQUAL_TO:
																						case MetadataModel.FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_GREATER_THAN:
																						case MetadataModel.FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_LESS_THAN:
																						case MetadataModel.FilterCondition.FIELD_NUMBER_GREATER_THAN:
																						case MetadataModel.FilterCondition.FIELD_NUMBER_LESS_THAN:
																							return html`
																								<input
																									class="input w-full rounded-none ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
																									placeholder="Enter numeric value..."
																									type="number"
																									.value=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE] || ''}
																									@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																										if (e.currentTarget.value.length > 0) {
																											andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE] = e.currentTarget.value
																										} else {
																											delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE]
																										}
																										this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																									}}
																									.value=${(() => {
																										if (typeof andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE] === 'number') {
																											return `${andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE]}`
																										}
																										return ''
																									})()}
																									@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																										if (e.currentTarget.value.length > 0) {
																											if (!Number.isNaN(e.currentTarget.value)) {
																												andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE] = Number(e.currentTarget.value)
																											} else {
																												delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE]
																											}
																										} else {
																											delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE]
																										}
																									}}
																								/>
																							`
																						case MetadataModel.FilterCondition.FIELD_TIMESTAMP_GREATER_THAN:
																						case MetadataModel.FilterCondition.FIELD_TIMESTAMP_LESS_THAN:
																							return html`
																								<calendar-time
																									class="min-w-full"
																									.color=${this.color}
																									.roundedborder=${false}
																									.datetimeinputformat=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] || MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}
																									.value=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE] || ''}
																									@calendar-time:datetimeupdate=${(e: CustomEvent) => {
																										if (e.detail.value) {
																											andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE] = e.detail.value
																										} else {
																											delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE]
																										}
																										this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																									}}
																								></calendar-time>
																							`
																						case MetadataModel.FilterCondition.FIELD_EQUAL_TO:
																							if (typeof andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE] === 'undefined') {
																								andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE] = {}
																							}

																							if (typeof andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] === 'undefined') {
																								switch (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] as MetadataModel.FieldType) {
																									case MetadataModel.FieldType.TEXT:
																										andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.TEXT
																										break
																									case MetadataModel.FieldType.NUMBER:
																										andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.NUMBER
																										break
																									case MetadataModel.FieldType.TIMESTAMP:
																										andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.TIMESTAMP
																										break
																									case MetadataModel.FieldType.BOOLEAN:
																										andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] = MetadataModel.FieldType.BOOLEAN
																										break
																								}
																							}

																							return html`
																								<select
																									class="rounded-none w-full select ${this.color === Theme.Color.PRIMARY ? 'select-primary' : this.color === Theme.Color.SECONDARY ? 'select-secondary' : 'select-accent'}"
																									@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																										andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] = e.currentTarget.value
																										if (typeof andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE] !== 'undefined') {
																											delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE]
																										}
																										this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																									}}
																								>
																									<option value="" .selected=${typeof andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE] !== 'string'} disabled>pick filter value type...</option>
																									<option value="${MetadataModel.FieldType.TEXT}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] === MetadataModel.FieldType.TEXT}>Text</option>
																									<option value="${MetadataModel.FieldType.NUMBER}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] === MetadataModel.FieldType.NUMBER}>Number</option>
																									<option value="${MetadataModel.FieldType.TIMESTAMP}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] === MetadataModel.FieldType.TIMESTAMP}>Timestamp/Date time</option>
																									<option value="${MetadataModel.FieldType.BOOLEAN}" .selected=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] === MetadataModel.FieldType.BOOLEAN}>Boolean</option>
																								</select>
																								${(() => {
																									switch (andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] as MetadataModel.FieldType) {
																										case MetadataModel.FieldType.TEXT:
																										case MetadataModel.FieldType.NUMBER:
																										case MetadataModel.FieldType.BOOLEAN:
																											if (this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.SELECT) {
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
																															const fieldDatum = andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE]
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
																																andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE] = (e.detail.value as { label: string; value: any }).value
																															} else {
																																delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE]
																															}
																															this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																														}}
																													></multi-select>
																												`
																											}

																											switch (andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.TYPE] as MetadataModel.FieldType) {
																												case MetadataModel.FieldType.TEXT:
																													return html`
																														<textarea
																															class="textarea w-full rounded-none ${this.color === Theme.Color.PRIMARY ? 'textarea-primary' : this.color === Theme.Color.SECONDARY ? 'textarea-secondary' : 'textarea-accent'}"
																															placeholder="Enter text value..."
																															type="text"
																															.value=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE] || ''}
																															@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																																if (e.currentTarget.value.length > 0) {
																																	andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE] = e.currentTarget.value
																																} else {
																																	delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE]
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
																																if (typeof andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE] === 'number') {
																																	return `${andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE]}`
																																}
																																return ''
																															})()}
																															@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																																if (e.currentTarget.value.length > 0) {
																																	if (!Number.isNaN(e.currentTarget.value)) {
																																		andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE] = Number(e.currentTarget.value)
																																	} else {
																																		delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE]
																																	}
																																} else {
																																	delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE]
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
																																	if (so.value === andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE]) {
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
																																	andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE] = (e.detail.value as { label: string; value: any }).value
																																} else {
																																	delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE]
																																}
																																this._updateAndFilterCondition(orIndex, andIndex, andFilterCondition)
																															}}
																														></multi-select>
																													`
																											}

																											return nothing
																										case MetadataModel.FieldType.TIMESTAMP:
																											return html`
																												<calendar-time
																													class="min-w-full"
																													.color=${this.color}
																													.roundedborder=${false}
																													.datetimeinputformat=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] || MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}
																													.value=${andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE] || ''}
																													@calendar-time:datetimeupdate=${(e: CustomEvent) => {
																														if (e.detail.value) {
																															andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE] = e.detail.value
																														} else {
																															delete andFilterCondition[MetadataModel.FConditionProperties.FILTER_VALUE][MetadataModel.FSelectProperties.VALUE]
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
																			<iconify-icon icon="mdi:delete" style="color: ${Theme.GetColorContent(this.color)}};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
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
