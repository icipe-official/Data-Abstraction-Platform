import Json from '$src/lib/json'
import MetadataModel from '$src/lib/metadata_model'
import Misc from '$src/lib/miscellaneous'
import Theme from '$src/lib/theme'
import { LitElement, unsafeCSS, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Log from '$src/lib/log'
import Papa from 'papaparse'
import '$src/lib/components/vertical-flex-scroll/component'

@customElement('metadata-model-build-edit-field-group')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) fieldgroup: any
	@property({ type: String }) color: Theme.Color = Theme.Color.PRIMARY
	@property({ attribute: false }) updatefieldgroup!: (fieldgroup: any) => void

	@state() private _showFieldGroupGeneralProperties: boolean = true

	@state() private _showFieldGroupInputFilterView: boolean = false

	@state() private _showDatabaseProperties: boolean = false

	@state() private _showFieldProperties: boolean = false

	@state() private _cycleFieldGroupKeyViews = 0

	private readonly FIELD_GROUP_NAME_ERROR = 'Field Group Name must be at least 1 character in length'
	@state() private _fieldGroupNameError: string | null = null

	private readonly FIELD_GROUP_MAX_ENTRIES_ERROR = 'Max entry is not valid'
	@state() private _fieldGroupMaxEntriesError: string | null = null

	@state() private _tooltipsTracker: any = {}
	private _updateTooltipsTracker(id: string, value: boolean) {
		this._tooltipsTracker[id] = value
		this._tooltipsTracker = JSON.parse(JSON.stringify(this._tooltipsTracker))
	}

	connectedCallback(): void {
		super.connectedCallback()
		if (typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] !== 'string' || (this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).length == 0) {
			this._fieldGroupNameError = this.FIELD_GROUP_NAME_ERROR
		}

		if (typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] !== 'number') {
			this._fieldGroupMaxEntriesError = this.FIELD_GROUP_MAX_ENTRIES_ERROR
		}
	}

	protected render(): unknown {
		return html`
			<main class="flex-1 overflow-auto max-h-[70vh] space-y-2 p-1">
				<section class="rounded-md shadow-inner shadow-gray-800 p-1">
					<header class="flex justify-between">
						<div class="h-fit self-center font-bold ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">General Properties</div>
						<button class="btn btn-ghost w-fit h-fit min-h-fit p-0" @click=${() => (this._showFieldGroupGeneralProperties = !this._showFieldGroupGeneralProperties)}>
							<iconify-icon icon=${this._showFieldGroupGeneralProperties ? 'mdi:eye' : 'mdi:eye-off'} style="color:${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
						</button>
					</header>
					${(() => {
						if (this._showFieldGroupGeneralProperties) {
							return html`
								<div class="divider h-fit"></div>
								<main class="flex flex-col space-y-1">
									${(() => {
										const fieldGroupKey = this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
										return html`
											<div class="flex space-x-1">
												<span class="self-center font-bold ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Field Group Key:</span>
												${(() => {
													if (typeof fieldGroupKey === 'string') {
														return html`
															<button
																class="btn btn-ghost w-fit h-fit min-h-fit p-0"
																@click=${() => {
																	if (this._cycleFieldGroupKeyViews === 2) {
																		this._cycleFieldGroupKeyViews = 0
																	} else {
																		this._cycleFieldGroupKeyViews += 1
																	}
																}}
															>
																<iconify-icon
																	icon=${this._cycleFieldGroupKeyViews === 0 ? 'mdi:code-array' : this._cycleFieldGroupKeyViews === 1 ? 'mdi:code-json' : 'mdi:transit-connection-horizontal'}
																	style="color:${this.color};"
																	width=${Misc.IconifySize()}
																	height=${Misc.IconifySize()}
																></iconify-icon>
															</button>
															<span class="text-wrap break-words self-center">
																${(() => {
																	if (this._cycleFieldGroupKeyViews === 0) {
																		return fieldGroupKey
																	} else if (this._cycleFieldGroupKeyViews === 1) {
																		return MetadataModel.FieldGroupDataJsonPath(fieldGroupKey)
																	} else {
																		return MetadataModel.FieldGroupKeyPath(fieldGroupKey)
																	}
																})()}
															</span>
														`
													} else {
														return html`<span class="text-error">Not Valid</span>`
													}
												})()}
											</div>
										`
									})()}
									<section class="flex flex-col space-y-1">
										<div class="join max-md:join-vertical">
											<span class="join-item h-[48px] ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex "><span class="h-fit self-center">Field Group Name</span></span>
											<input
												class="flex-1 join-item input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
												type="text"
												placeholder="Enter field group name..."
												.value=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] || ''}
												@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
													if (e.currentTarget.value.length > 0) {
														this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] = e.currentTarget.value
													} else {
														this._fieldGroupNameError = this.FIELD_GROUP_NAME_ERROR
													}
												}}
											/>
										</div>
										${(() => {
											if (this._fieldGroupNameError !== null) {
												return html`
													<div class="label">
														<span class="label-text text-error">${this._fieldGroupNameError}</span>
													</div>
													<div class="divider h-fit"></div>
												`
											} else {
												return nothing
											}
										})()}
									</section>
									<div class="join join-vertical">
										<span class="join-item h-[48px] ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex "><span class="h-fit self-center">Field Group Description</span></span>
										<textarea
											class="flex-1 join-item textarea ${this.color === Theme.Color.PRIMARY ? 'textarea-primary' : this.color === Theme.Color.SECONDARY ? 'textarea-secondary' : 'textarea-accent'} w-full min-h-[48px]"
											placeholder="Enter field group description..."
											.value=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] || ''}
											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
												if (e.currentTarget.value.length > 3) {
													this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] = e.currentTarget.value
												} else {
													delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]
												}
											}}
										></textarea>
									</div>
									<section class="flex flex-col space-y-1">
										<div class="join max-md:join-vertical">
											<span class="join-item h-[48px] ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex "><span class="h-fit self-center">Field Group Max Entries</span></span>
											<input
												class="flex-1 join-item input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
												type="number"
												placeholder="Enter field group max entries..."
												.value=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number' ? this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES].toString() : ''}
												@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
													if (e.currentTarget.value.length > 0) {
														if (!Number.isNaN(e.currentTarget.value)) {
															this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] = Math.round(Number(e.currentTarget.value))
														} else {
															this._fieldGroupMaxEntriesError = this.FIELD_GROUP_MAX_ENTRIES_ERROR
														}
													} else {
														this._fieldGroupMaxEntriesError = this.FIELD_GROUP_MAX_ENTRIES_ERROR
													}
												}}
											/>
										</div>
										${(() => {
											if (this._fieldGroupMaxEntriesError !== null) {
												return html`
													<div class="label">
														<span class="label-text text-error">${this._fieldGroupMaxEntriesError}</span>
													</div>
													<div class="divider h-fit"></div>
												`
											} else {
												return nothing
											}
										})()}
									</section>
									<section class="flex flex-col space-y-1">
										<div class="relative w-full h-0">
											${this._tooltipsTracker['fg-is-primary-key']
												? html`<div
														class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
															? 'bg-primary text-primary-content'
															: this.color === Theme.Color.SECONDARY
																? 'bg-secondary text-secondary-content'
																: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
													>
														Used for purporses such as converting a 2D array to an array of objects.
													</div>`
												: nothing}
										</div>
										<div class="flex space-x-1">
											<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
												<div class="h-fit self-center">Field Group is Primary Key</div>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => this._updateTooltipsTracker('fg-is-primary-key', true)} @mouseleave=${() => this._updateTooltipsTracker('fg-is-primary-key', false)}>
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
												}}
											/>
										</div>
									</section>
								</main>
							`
						} else {
							return nothing
						}
					})()}
				</section>
				<section class="rounded-md shadow-inner shadow-gray-800 p-1">
					<header class="flex justify-between">
						<div class="h-fit self-center font-bold ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Input, View, and Filter Properties</div>
						<button class="btn btn-ghost w-fit h-fit min-h-fit p-0" @click=${() => (this._showFieldGroupInputFilterView = !this._showFieldGroupInputFilterView)}>
							<iconify-icon icon=${this._showFieldGroupInputFilterView ? 'mdi:eye' : 'mdi:eye-off'} style="color:${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
						</button>
					</header>
					${(() => {
						if (this._showFieldGroupInputFilterView) {
							return html`
								<div class="divider h-fit"></div>
								<main class="flex flex-col space-y-1">
									<section class="flex flex-col space-y-1">
										<div class="relative w-full h-0">
											${this._tooltipsTracker['fg-input-disable']
												? html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
														>
															Disable user input on forms.
														</div>
													`
												: nothing}
										</div>
										<div class="flex space-x-1">
											<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
												<div class="h-fit self-center">Field Group Disable User Input</div>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => this._updateTooltipsTracker('fg-input-disable', true)} @mouseleave=${() => this._updateTooltipsTracker('fg-input-disable', false)}>
													<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
												</div>
											</span>
											<input
												class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
												type="checkbox"
												.checked=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE] || false}
												@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
													if (e.currentTarget.checked) {
														this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE] = true
													} else {
														delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_INPUT_DISABLE]
													}
												}}
											/>
										</div>
									</section>
									<section class="flex flex-col space-y-1">
										<div class="relative w-full h-0">
											${this._tooltipsTracker['fg-view-disable']
												? html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
														>
															Disable viewing field/group in tables.
														</div>
													`
												: nothing}
										</div>
										<div class="flex space-x-1">
											<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
												<div class="h-fit self-center">Field Group Disable View</div>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => this._updateTooltipsTracker('fg-view-disable', true)} @mouseleave=${() => this._updateTooltipsTracker('fg-view-disable', false)}>
													<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
												</div>
											</span>
											<input
												class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
												type="checkbox"
												.checked=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] || false}
												@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
													if (e.currentTarget.checked) {
														this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE] = true
													} else {
														delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]
													}
												}}
											/>
										</div>
									</section>
									<div class="divider h-fit ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">View Multiple groups/tables or fields/columns values in one row</div>
									<section class="flex flex-col space-y-1">
										<div class="relative w-full h-0">
											${this._tooltipsTracker['fg-view-values-in-separate-columns']
												? html`<div
														class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
															? 'bg-primary text-primary-content'
															: this.color === Theme.Color.SECONDARY
																? 'bg-secondary text-secondary-content'
																: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
													>
														Enable viewing groups/tables or fields/columns with multiple values in one row.
													</div>`
												: nothing}
										</div>
										<div class="flex space-x-1">
											<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
												<div class="h-fit self-center">Field Group view values in separate columns</div>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => this._updateTooltipsTracker('fg-view-values-in-separate-columns', true)} @mouseleave=${() => this._updateTooltipsTracker('fg-view-values-in-separate-columns', false)}>
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
												}}
											/>
										</div>
									</section>
									<section class="flex flex-col space-y-1">
										<div class="relative w-full h-0">
											${this._tooltipsTracker['fg-view-max-values-in-separate-columns']
												? html`<div
														class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
															? 'bg-primary text-primary-content'
															: this.color === Theme.Color.SECONDARY
																? 'bg-secondary text-secondary-content'
																: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
													>
														Maximum number of columns of values in one row.
													</div>`
												: nothing}
										</div>
										<div class="join max-md:join-vertical">
											<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
												<span class="h-fit self-center break-words word-wrap">Field Group view max columns in separate columns</span>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => this._updateTooltipsTracker('fg-view-max-values-in-separate-columns', true)} @mouseleave=${() => this._updateTooltipsTracker('fg-view-max-values-in-separate-columns', false)}>
													<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
												</div>
											</span>
											<input
												class="flex-1 join-item input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
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
												}}
											/>
										</div>
									</section>
									${(() => {
										if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] === 'undefined') {
											return html`
												<section class="flex flex-col space-y-1">
													<div class="relative w-full h-0">
														${this._tooltipsTracker['fg-view-values-in-separate-columns-header-format']
															? html`<div
																	class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content'
																			: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																>
																	Field view header format (replaces [*] with column/row index)
																</div>`
															: nothing}
													</div>
													<div class="join max-md:join-vertical">
														<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
															<span class="h-fit self-center break-words word-wrap">Field view header format</span>
															<div
																class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center"
																@mouseover=${() => this._updateTooltipsTracker('fg-view-values-in-separate-columns-header-format', true)}
																@mouseleave=${() => this._updateTooltipsTracker('fg-view-values-in-separate-columns-header-format', false)}
															>
																<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
															</div>
														</span>
														<input
															class="flex-1 join-item input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
															type="text"
															placeholder="Enter view header format..."
															.value=${this.fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT] || ''}
															@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																if (e.currentTarget.value.length > 0) {
																	this.fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT] = e.currentTarget.value
																} else {
																	delete this.fieldgroup[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT]
																}
															}}
														/>
													</div>
												</section>
											`
										} else {
											return nothing
										}
									})()}
									<div class="divider h-fit"></div>
									${(() => {
										if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] === 'object') {
											return html`
												<section class="flex flex-col space-y-1">
													<div class="relative w-full h-0">
														${this._tooltipsTracker['fg-view-as-table-in-2d']
															? html`<div
																	class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content'
																			: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																>
																	View data as row and column with no nesting. Property works best if group has nested groups and not necessary to apply if it does not have nested groups.
																</div>`
															: nothing}
													</div>
													<div class="flex space-x-1">
														<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
															<div class="h-fit self-center">Group default view as table in 2D</div>
															<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => this._updateTooltipsTracker('fg-view-as-table-in-2d', true)} @mouseleave=${() => this._updateTooltipsTracker('fg-view-as-table-in-2d', false)}>
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
															}}
														/>
													</div>
												</section>
												<section class="flex flex-col space-y-1">
													<div class="relative w-full h-0">
														${this._tooltipsTracker['fg-filter-add-full-text-search-box']
															? html`<div
																	class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content'
																			: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																>
																	Add full text search box for group in the filter panel. Enable if backend supports full text search for group.
																</div>`
															: nothing}
													</div>
													<div class="flex space-x-1">
														<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
															<div class="h-fit self-center">Group filter add full text search box</div>
															<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => this._updateTooltipsTracker('fg-filter-add-full-text-search-box', true)} @mouseleave=${() => this._updateTooltipsTracker('fg-filter-add-full-text-search-box', false)}>
																<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
															</div>
														</span>
														<input
															class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
															type="checkbox"
															.checked=${this.fieldgroup[MetadataModel.FgProperties.GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX] || false}
															@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																if (e.currentTarget.checked) {
																	this.fieldgroup[MetadataModel.FgProperties.GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX] = true
																} else {
																	delete this.fieldgroup[MetadataModel.FgProperties.GROUP_QUERY_ADD_FULL_TEXT_SEARCH_BOX]
																}
															}}
														/>
													</div>
												</section>
											`
										} else {
											return nothing
										}
									})()}
									<section class="flex flex-col space-y-1">
										<div class="relative w-full h-0">
											${this._tooltipsTracker['fg-filter-disable']
												? html`<div
														class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
															? 'bg-primary text-primary-content'
															: this.color === Theme.Color.SECONDARY
																? 'bg-secondary text-secondary-content'
																: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
													>
														Disable filter options when displaying the filter panel.
													</div>`
												: nothing}
										</div>
										<div class="flex space-x-1">
											<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
												<div class="h-fit self-center">Field Group Disable Filter</div>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => this._updateTooltipsTracker('fg-filter-disable', true)} @mouseleave=${() => this._updateTooltipsTracker('fg-filter-disable', false)}>
													<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
												</div>
											</span>
											<input
												class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
												type="checkbox"
												.checked=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_FILTER_DISABLE] || false}
												@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
													if (e.currentTarget.checked) {
														this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_FILTER_DISABLE] = true
													} else {
														delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_FILTER_DISABLE]
													}
												}}
											/>
										</div>
									</section>
								</main>
							`
						} else {
							return nothing
						}
					})()}
				</section>
				<section class="rounded-md shadow-inner shadow-gray-800 p-1">
					<header class="flex justify-between">
						<div class="h-fit self-center font-bold ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Database Properties</div>
						<button class="btn btn-ghost w-fit h-fit min-h-fit p-0" @click=${() => (this._showDatabaseProperties = !this._showDatabaseProperties)}>
							<iconify-icon icon=${this._showDatabaseProperties ? 'mdi:eye' : 'mdi:eye-off'} style="color:${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
						</button>
					</header>
					${(() => {
						if (this._showDatabaseProperties) {
							return html`
								${(() => {
									if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] === 'object') {
										return html`
											<section class="flex flex-col space-y-1">
												<div class="relative w-full h-0">
													${this._tooltipsTracker['d-group-table-collection-name']
														? html`<div
																class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																	? 'bg-primary text-primary-content'
																	: this.color === Theme.Color.SECONDARY
																		? 'bg-secondary text-secondary-content'
																		: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
															>
																May be relevant in identifying tables/collections while fetching data from the database.
															</div>`
														: nothing}
												</div>
												<div class="join max-md:join-vertical">
													<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
														<span class="h-fit self-center break-words word-wrap">Database Table/Collection name</span>
														<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => this._updateTooltipsTracker('d-group-table-collection-name', true)} @mouseleave=${() => this._updateTooltipsTracker('d-group-table-collection-name', false)}>
															<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
														</div>
													</span>
													<input
														class="flex-1 join-item input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
														type="text"
														placeholder="Enter table/collection name..."
														.value=${this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] || ''}
														@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
															if (e.currentTarget.value.length > 0) {
																this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] = e.currentTarget.value
															} else {
																delete this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME]
															}
														}}
													/>
												</div>
											</section>
										`
									} else {
										return html`
											<section class="flex flex-col space-y-1">
												<div class="relative w-full h-0">
													${this._tooltipsTracker['d-field-column-name']
														? html`<div
																class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																	? 'bg-primary text-primary-content'
																	: this.color === Theme.Color.SECONDARY
																		? 'bg-secondary text-secondary-content'
																		: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
															>
																May be relevant in identifying columns/fields while fetching data from the database.
															</div>`
														: nothing}
												</div>
												<div class="join max-md:join-vertical">
													<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
														<span class="h-fit self-center break-words word-wrap">Database column/field name</span>
														<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => this._updateTooltipsTracker('d-field-column-name', true)} @mouseleave=${() => this._updateTooltipsTracker('d-field-column-name', false)}>
															<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
														</div>
													</span>
													<input
														class="flex-1 join-item input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
														type="text"
														placeholder="Enter column/field name..."
														.value=${this.fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] || ''}
														@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
															if (e.currentTarget.value.length > 0) {
																this.fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] = e.currentTarget.value
															} else {
																delete this.fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]
															}
														}}
													/>
												</div>
											</section>
										`
									}
								})()}
								<section class="flex flex-col space-y-1">
									<div class="relative w-full h-0">
										${this._tooltipsTracker['d-skip-data-extraction']
											? html`
													<div
														class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
															? 'bg-primary text-primary-content'
															: this.color === Theme.Color.SECONDARY
																? 'bg-secondary text-secondary-content'
																: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
													>
														Skip extracting data when fetching it from the database.
													</div>
												`
											: nothing}
									</div>
									<div class="flex space-x-1">
										<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
											<div class="h-fit self-center">Database Skip Data Extraction</div>
											<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => this._updateTooltipsTracker('d-skip-data-extraction', true)} @mouseleave=${() => this._updateTooltipsTracker('d-skip-data-extraction', false)}>
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
											}}
										/>
									</div>
								</section>
							`
						} else {
							return nothing
						}
					})()}
				</section>
				${(() => {
					if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] === 'undefined') {
						return html`
							<section class="rounded-md shadow-inner shadow-gray-800 p-1 space-y-1">
								<header class="flex justify-between">
									<div class="h-fit self-center font-bold ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Field Properties</div>
									<button class="btn btn-ghost w-fit h-fit min-h-fit p-0" @click=${() => (this._showFieldProperties = !this._showFieldProperties)}>
										<iconify-icon icon=${this._showFieldProperties ? 'mdi:eye' : 'mdi:eye-off'} style="color:${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
									</button>
								</header>
								${(() => {
									if (this._showFieldProperties) {
										return html`
											<div class="divider h-fit"></div>
											<section class="flex flex-col space-y-1">
												<div class="relative w-full h-0">
													${this._tooltipsTracker['f-input-placeholder']
														? html`
																<div
																	class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content'
																			: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																>
																	Placeholder text for input.
																</div>
															`
														: nothing}
												</div>
												<div class="join max-md:join-vertical">
													<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
														<span class="h-fit self-center break-words word-wrap">Field input placeholder</span>
														<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => this._updateTooltipsTracker('f-input-placeholder', true)} @mouseleave=${() => this._updateTooltipsTracker('f-input-placeholder', false)}>
															<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
														</div>
													</span>
													<input
														class="flex-1 join-item input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
														type="text"
														placeholder="Enter value..."
														.value=${this.fieldgroup[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || ''}
														@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
															if (e.currentTarget.value.length > 0) {
																this.fieldgroup[MetadataModel.FgProperties.FIELD_PLACEHOLDER] = e.currentTarget.value
															} else {
																delete this.fieldgroup[MetadataModel.FgProperties.FIELD_PLACEHOLDER]
															}
														}}
													/>
												</div>
											</section>
											<section class="join join-vertical w-full">
												<span class="join-item h-[48px] ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex "><span class="h-fit self-center">Field Data Type</span></span>
												<select
													class="join-item select select-primary w-full"
													@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
														try {
															if (e.currentTarget.value.length > 0) {
																this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_DATATYPE}`, e.currentTarget.value)
															} else {
																this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_DATATYPE}`, '')
															}
															this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_UI}`, '')
														} catch (err) {
															Log.Log(Log.Level.ERROR, this.localName, e, err)
														}
													}}
												>
													<option value="" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] !== 'string' || (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] as string).length === 0}>None</option>
													<option value="${MetadataModel.FieldType.TEXT}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.TEXT}>Text</option>
													<option value="${MetadataModel.FieldType.NUMBER}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.NUMBER}>Number</option>
													<option value="${MetadataModel.FieldType.BOOLEAN}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.BOOLEAN}>Boolean</option>
													<option value="${MetadataModel.FieldType.TIMESTAMP}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.TIMESTAMP}>Date Time</option>
													<option value="${MetadataModel.FieldType.ANY}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.ANY}>Any</option>
												</select>
											</section>
											<section class="join join-vertical w-full">
												<span class="join-item h-[48px] ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex "><span class="h-fit self-center">Field UI</span></span>
												<select
													class="join-item select select-primary w-full"
													@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
														try {
															if (e.currentTarget.value.length > 0) {
																this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_UI}`, e.currentTarget.value)
															} else {
																this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_UI}`, '')
															}
														} catch (err) {
															Log.Log(Log.Level.ERROR, this.localName, e, err)
														}
													}}
												>
													<option value="" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] !== 'string' || (this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] as string).length === 0}>None</option>
													${(() => {
														if (typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] !== 'string') {
															return nothing
														}
														switch (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] as MetadataModel.FieldType) {
															case MetadataModel.FieldType.BOOLEAN:
																return html` <option value="${MetadataModel.FieldUi.CHECKBOX}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.CHECKBOX}>Checkbox</option> `
															case MetadataModel.FieldType.TIMESTAMP:
																return html` <option value="${MetadataModel.FieldUi.DATETIME}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.DATETIME}>Date Time</option> `
															case MetadataModel.FieldType.TEXT:
																return html`
																	<option value="${MetadataModel.FieldUi.TEXT}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.TEXT}>Text</option>
																	<option value="${MetadataModel.FieldUi.TEXTAREA}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.DATETIME}>Textarea</option>
																`
															case MetadataModel.FieldType.NUMBER:
																return html`<option value="${MetadataModel.FieldUi.NUMBER}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.NUMBER}>Number</option>`
															default:
																return nothing
														}
													})()}
													${(() => {
														switch (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] as MetadataModel.FieldType) {
															case MetadataModel.FieldType.BOOLEAN:
															case MetadataModel.FieldType.TEXT:
															case MetadataModel.FieldType.NUMBER:
															case MetadataModel.FieldType.ANY:
																return html`<option value="${MetadataModel.FieldUi.SELECT}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.SELECT}>Select</option>`
															default:
																return nothing
														}
													})()}
												</select>
											</section>
											${(() => {
												if (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.TIMESTAMP) {
													return html`
														<section class="join join-vertical w-full">
															<span class="join-item h-[48px] ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex "><span class="h-fit self-center">Date Time Format (REQUIRED)</span></span>
															<select
																class="join-item select select-primary w-full"
																@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																	try {
																		if (e.currentTarget.value.length > 0) {
																			this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_DATETIME_FORMAT}`, e.currentTarget.value)
																		} else {
																			this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_DATETIME_FORMAT}`)
																		}
																	} catch (err) {
																		Log.Log(Log.Level.ERROR, this.localName, e, err)
																	}
																}}
															>
																<option disabled value="" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] !== 'string' || (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] as string).length === 0}>Choose date time format...</option>
																<option value="${MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}>yyyy-mm-dd HH:MM</option>
																<option value="${MetadataModel.FieldDateTimeFormat.YYYYMMDD}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYYMMDD}>yyyy-mm-dd</option>
																<option value="${MetadataModel.FieldDateTimeFormat.YYYYMM}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYYMM}>yyyy-mm</option>
																<option value="${MetadataModel.FieldDateTimeFormat.HHMM}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] === MetadataModel.FieldDateTimeFormat.HHMM}>HH:MM</option>
																<option value="${MetadataModel.FieldDateTimeFormat.YYYY}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] === MetadataModel.FieldDateTimeFormat.YYYY}>yyyy</option>
																<option value="${MetadataModel.FieldDateTimeFormat.MM}" .selected=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] === MetadataModel.FieldDateTimeFormat.MM}>mm</option>
															</select>
														</section>
													`
												} else {
													return nothing
												}
											})()}
											${(() => {
												if (this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.SELECT) {
													return html`
														<section class="join join-vertical w-full">
															<div class="join-item h-fit ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex justify-between">
																<span class="h-fit self-center">Select Options (REQUIRED)</span>
																<button
																	class="btn btn-circle btn-ghost"
																	@click=${(e: Event) => {
																		try {
																			if (Array.isArray(this.fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS])) {
																				this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}`, [{}, ...this.fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS]])
																			} else {
																				this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[0]`, {})
																			}
																		} catch (err) {
																			Log.Log(Log.Level.ERROR, this.localName, e, err)
																		}
																	}}
																>
																	<iconify-icon icon="mdi:plus-circle" style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
																</button>
															</div>
															${(() => {
																if (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.ANY || this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] === MetadataModel.FieldType.TEXT) {
																	return html`
																		<div class="join-item w-full h-fit">
																			<input
																				class="file-input rounded-none ${this.color === Theme.Color.PRIMARY ? 'file-input-primary' : this.color === Theme.Color.SECONDARY ? 'file-input-secondary' : 'file-input-accent'} w-full"
																				type="file"
																				accept="text/csv"
																				@change=${async (e: any) => {
																					if (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] !== MetadataModel.FieldType.ANY && this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] !== MetadataModel.FieldType.TEXT) {
																						return
																					}

																					if (e.target.files === null) {
																						return
																					}
																					const fileList = e.target.files as FileList
																					if (fileList.item(0)?.type !== 'text/csv') {
																						return
																					}
																					const fileText = await fileList.item(0)?.text()
																					if (typeof fileText === 'undefined') {
																						return
																					}
																					const results = Papa.parse(fileText)
																					if (results.data.length === 0) {
																						return
																					}

																					let newSelectOptions: MetadataModel.ISelectOption[] = []
																					for (const datum of results.data) {
																						if (Array.isArray(datum) && datum.length > 0) {
																							if (typeof datum[0] === 'string' && datum[0].length > 0) {
																								let so: MetadataModel.ISelectOption = {
																									[MetadataModel.FSelectProperties.LABEL]: datum[0],
																									[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FSelectType.TEXT
																								}

																								if (typeof datum[1] === 'string' && datum[1].length > 0) {
																									so[MetadataModel.FSelectProperties.VALUE] = datum[1]
																								} else {
																									so[MetadataModel.FSelectProperties.VALUE] = datum[0]
																								}

																								newSelectOptions = [...newSelectOptions, so]
																							}
																						}
																					}

																					if (newSelectOptions.length > 0) {
																						this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}`, newSelectOptions)
																					}
																				}}
																			/>
																		</div>
																	`
																} else {
																	return nothing
																}
															})()}
															${(() => {
																if (!Array.isArray(this.fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS])) {
																	return html`
																		<div class="flex self-center w-fit">
																			<span class="self-center">Click the</span>
																			<iconify-icon icon="mdi:plus-circle" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon><span class="self-center">to add a new select option</span>
																		</div>
																	`
																}

																return html`
																	<virtual-flex-scroll
																		class="join-item border-2 ${this.color === Theme.Color.PRIMARY ? 'border-primary' : this.color === Theme.Color.SECONDARY ? 'border-secondary' : 'border-accent'}"
																		.data=${this.fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS]}
																		.foreachrowrender=${(datum: any, index: number) => {
																			try {
																				if (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] !== MetadataModel.FieldType.ANY) {
																					switch (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] as MetadataModel.FieldType) {
																						case MetadataModel.FieldType.TEXT:
																							if (datum[MetadataModel.FSelectProperties.TYPE] !== MetadataModel.FSelectType.TEXT) {
																								this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.TYPE}`, MetadataModel.FSelectType.TEXT)
																								datum[MetadataModel.FSelectProperties.TYPE] = MetadataModel.FSelectType.TEXT
																							}
																							if (typeof datum[MetadataModel.FSelectProperties.VALUE] !== 'string') {
																								this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.VALUE}`)
																								delete datum[MetadataModel.FSelectProperties.VALUE]
																							}
																							break
																						case MetadataModel.FieldType.NUMBER:
																							if (datum[MetadataModel.FSelectProperties.TYPE] !== MetadataModel.FSelectType.NUMBER) {
																								this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.TYPE}`, MetadataModel.FSelectType.NUMBER)
																								datum[MetadataModel.FSelectProperties.TYPE] = MetadataModel.FSelectType.NUMBER
																							}
																							if (typeof datum[MetadataModel.FSelectProperties.VALUE] !== 'number') {
																								this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.VALUE}`)
																								delete datum[MetadataModel.FSelectProperties.VALUE]
																							}
																							break
																						case MetadataModel.FieldType.BOOLEAN:
																							if (datum[MetadataModel.FSelectProperties.TYPE] !== MetadataModel.FSelectType.BOOLEAN) {
																								this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.TYPE}`, MetadataModel.FSelectType.BOOLEAN)
																								datum[MetadataModel.FSelectProperties.TYPE] = MetadataModel.FSelectType.BOOLEAN
																							}
																							if (typeof datum[MetadataModel.FSelectProperties.VALUE] !== 'boolean') {
																								this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.VALUE}`)
																								delete datum[MetadataModel.FSelectProperties.VALUE]
																							}
																							break
																					}
																				}

																				return html`
																					<div class="join-item flex">
																						<input
																							class="input h-[48px] rounded-none ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
																							type="text"
																							placeholder="label..."
																							.value=${datum[MetadataModel.FSelectProperties.LABEL] || ''}
																							@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																								if (e.currentTarget.value.length > 0) {
																									this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.LABEL}`, e.currentTarget.value)
																								} else {
																									this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.LABEL}`)
																								}
																								this.updatefieldgroup(this.fieldgroup)
																							}}
																						/>
																						<select
																							class="select h-[48px] rounded-none ${this.color === Theme.Color.PRIMARY ? 'select-primary' : this.color === Theme.Color.SECONDARY ? 'select-secondary' : 'select-accent'} w-full"
																							@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																								if (e.currentTarget.value.length > 0) {
																									this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.TYPE}`, e.currentTarget.value)
																								} else {
																									this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.TYPE}`)
																								}
																								this.updatefieldgroup(this.fieldgroup)
																							}}
																							.disabled=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] !== MetadataModel.FieldType.ANY}
																						>
																							<option
																								disabled
																								value=""
																								.selected=${typeof datum[MetadataModel.FSelectProperties.TYPE] !== 'string' ||
																								(datum[MetadataModel.FSelectProperties.TYPE] as string).length === 0}
																							>
																								Choose value data type...
																							</option>
																							<option value="${MetadataModel.FSelectType.NUMBER}" .selected=${datum[MetadataModel.FSelectProperties.TYPE] === MetadataModel.FSelectType.NUMBER}>Number</option>
																							<option value="${MetadataModel.FSelectType.TEXT}" .selected=${datum[MetadataModel.FSelectProperties.TYPE] === MetadataModel.FSelectType.TEXT}>Text</option>
																							<option value="${MetadataModel.FSelectType.BOOLEAN}" .selected=${datum[MetadataModel.FSelectProperties.TYPE] === MetadataModel.FSelectType.BOOLEAN}>Boolean</option>
																						</select>
																						${(() => {
																							switch (datum[MetadataModel.FSelectProperties.TYPE] as MetadataModel.FSelectType) {
																								case MetadataModel.FSelectType.NUMBER:
																									return html`
																										<input
																											class="input h-[48px] rounded-none ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
																											type="number"
																											placeholder="value..."
																											.value=${typeof datum[MetadataModel.FSelectProperties.VALUE] === 'number'
																												? datum[MetadataModel.FSelectProperties.VALUE].toString()
																												: ''}
																											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																												if (e.currentTarget.value.length > 0) {
																													if (!Number.isNaN(e.currentTarget.value)) {
																														this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.VALUE}`, Number(e.currentTarget.value))
																													} else {
																														this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.VALUE}`)
																													}
																												} else {
																													this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.VALUE}`)
																												}
																												this.updatefieldgroup(this.fieldgroup)
																											}}
																										/>
																									`
																								case MetadataModel.FSelectType.TEXT:
																									return html`
																										<input
																											class="input h-[48px] rounded-none  ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
																											type="text"
																											placeholder="value..."
																											.value=${datum[MetadataModel.FSelectProperties.VALUE] || ''}
																											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																												if (e.currentTarget.value.length > 0) {
																													this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.VALUE}`, e.currentTarget.value)
																												} else {
																													this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.VALUE}`)
																												}
																												this.updatefieldgroup(this.fieldgroup)
																											}}
																										/>
																									`
																								case MetadataModel.FSelectType.BOOLEAN:
																									return html`
																										<input
																											class="checkbox h-[48px] w-[48px] rounded-none ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
																											type="checkbox"
																											.checked=${datum[MetadataModel.FSelectProperties.VALUE] || false}
																											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																												this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}].${MetadataModel.FSelectProperties.VALUE}`, e.currentTarget.checked)
																												this.updatefieldgroup(this.fieldgroup)
																											}}
																										/>
																									`
																								default:
																									return nothing
																							}
																						})()}
																						<button
																							class="btn h-[48px] min-h-[48px] btn-ghost rounded-none"
																							@click=${() => {
																								this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[${index}]`)
																								this.updatefieldgroup(this.fieldgroup)
																							}}
																						>
																							<iconify-icon icon="mdi:delete" style="color: ${Theme.Color.ERROR};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
																						</button>
																					</div>
																				`
																			} catch (err) {
																				Log.Log(Log.Level.ERROR, this.localName, err)
																				return html`<code>${err}</code>`
																			}
																		}}
																	></virtual-flex-scroll>
																`
															})()}
															<metadata-model-build-edit-field-group-select-options
																class="join-item border-2 ${this.color === Theme.Color.PRIMARY ? 'border-primary' : this.color === Theme.Color.SECONDARY ? 'border-secondary' : 'border-accent'}"
																.color=${this.color}
																.fieldgroup=${this.fieldgroup}
																.updatefieldgroup=${(fieldgroup: any) => (this.fieldgroup = fieldgroup)}
															></metadata-model-build-edit-field-group-select-options>
														</section>
													`
												} else {
													return nothing
												}
											})()}
											${(() => {
												if (this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.CHECKBOX) {
													return html`
														<div class="divider h-fit">Field UI Checkbox options</div>
														<section class="flex flex-col space-y-1">
															<div class="relative w-full h-0">
																${this._tooltipsTracker['f-checkbox-value-if-true']
																	? html`
																			<div
																				class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																					? 'bg-primary text-primary-content'
																					: this.color === Theme.Color.SECONDARY
																						? 'bg-secondary text-secondary-content'
																						: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																			>
																				Value to use in place of 'true' for checkbox input.
																			</div>
																		`
																	: nothing}
															</div>
															<div class="join join-vertical">
																<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
																	<span class="h-fit self-center break-words word-wrap">Field checkbox value if true</span>
																	<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => this._updateTooltipsTracker('f-checkbox-value-if-true', true)} @mouseleave=${() => this._updateTooltipsTracker('f-checkbox-value-if-true', false)}>
																		<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
																	</div>
																</span>
																<select
																	class="join-item select h-[48px] rounded-none ${this.color === Theme.Color.PRIMARY ? 'select-primary' : this.color === Theme.Color.SECONDARY ? 'select-secondary' : 'select-accent'} w-full"
																	@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																		if (e.currentTarget.value.length > 0) {
																			this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE}.${MetadataModel.FieldCheckboxValueProperties.TYPE}`, e.currentTarget.value)
																		} else {
																			this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE}.${MetadataModel.FieldCheckboxValueProperties.TYPE}`)
																		}
																	}}
																>
																	<option
																		disabled
																		value=""
																		.selected=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] !== 'object' || (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.TYPE] as string).length === 0}
																	>
																		Choose value data type...
																	</option>
																	<option
																		value="${MetadataModel.FCheckboxValueType.NUMBER}"
																		.selected=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] === 'object' &&
																		this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FCheckboxValueType.NUMBER}
																	>
																		Number
																	</option>
																	<option
																		value="${MetadataModel.FCheckboxValueType.TEXT}"
																		.selected=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] === 'object' &&
																		this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FCheckboxValueType.TEXT}
																	>
																		Text
																	</option>
																</select>
																${(() => {
																	if (typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] === 'object' && (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.TYPE] as string).length > 0) {
																		return html`
																			<input
																				class="flex-[2] join-item input min-h-[48px] ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
																				type=${this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FCheckboxValueType.NUMBER ? 'number' : 'text'}
																				placeholder="Enter value..."
																				.value=${this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE] || ''}
																				@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																					if (e.currentTarget.value.length > 0) {
																						if (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FCheckboxValueType.NUMBER) {
																							if (!Number.isNaN(e.currentTarget)) {
																								this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE}.${MetadataModel.FieldCheckboxValueProperties.VALUE}`, Number(e.currentTarget.value))
																							} else {
																								delete this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]
																							}
																						} else {
																							this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE}.${MetadataModel.FieldCheckboxValueProperties.VALUE}`, e.currentTarget.value)
																							this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE] = e.currentTarget.value
																						}
																					} else {
																						delete this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]
																					}
																				}}
																			/>
																		`
																	} else {
																		return nothing
																	}
																})()}
															</div>
														</section>
														<section class="flex flex-col space-y-1">
															<div class="relative w-full h-0">
																${this._tooltipsTracker['f-checkbox-value-if-false']
																	? html`
																			<div
																				class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																					? 'bg-primary text-primary-content'
																					: this.color === Theme.Color.SECONDARY
																						? 'bg-secondary text-secondary-content'
																						: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																			>
																				Value to use in place of 'false' for checkbox input.
																			</div>
																		`
																	: nothing}
															</div>
															<div class="join join-vertical">
																<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
																	<span class="h-fit self-center break-words word-wrap">Field checkbox value if false</span>
																	<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => this._updateTooltipsTracker('f-checkbox-value-if-false', true)} @mouseleave=${() => this._updateTooltipsTracker('f-checkbox-value-if-false', false)}>
																		<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
																	</div>
																</span>
																<select
																	class="join-item select h-[48px] rounded-none ${this.color === Theme.Color.PRIMARY ? 'select-primary' : this.color === Theme.Color.SECONDARY ? 'select-secondary' : 'select-accent'} w-full"
																	@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
																		if (e.currentTarget.value.length > 0) {
																			this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE}.${MetadataModel.FieldCheckboxValueProperties.TYPE}`, e.currentTarget.value)
																		} else {
																			this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE}.${MetadataModel.FieldCheckboxValueProperties.TYPE}`)
																		}
																	}}
																>
																	<option
																		disabled
																		value=""
																		.selected=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] !== 'object' || (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.TYPE] as string).length === 0}
																	>
																		Choose value data type...
																	</option>
																	<option
																		value="${MetadataModel.FCheckboxValueType.NUMBER}"
																		.selected=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] === 'object' &&
																		this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FCheckboxValueType.NUMBER}
																	>
																		Number
																	</option>
																	<option
																		value="${MetadataModel.FCheckboxValueType.TEXT}"
																		.selected=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] === 'object' &&
																		this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FCheckboxValueType.TEXT}
																	>
																		Text
																	</option>
																</select>
																${(() => {
																	if (typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] === 'object' && (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.TYPE] as string).length > 0) {
																		return html`
																			<input
																				class="flex-[2] join-item input min-h-[48px] ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
																				type=${this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FCheckboxValueType.NUMBER ? 'number' : 'text'}
																				placeholder="Enter value..."
																				.value=${this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE] || ''}
																				@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																					if (e.currentTarget.value.length > 0) {
																						if (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FCheckboxValueType.NUMBER) {
																							if (!Number.isNaN(e.currentTarget)) {
																								this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE}.${MetadataModel.FieldCheckboxValueProperties.VALUE}`, Number(e.currentTarget.value))
																							} else {
																								delete this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]
																							}
																						} else {
																							this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE}.${MetadataModel.FieldCheckboxValueProperties.VALUE}`, e.currentTarget.value)
																							this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE] = e.currentTarget.value
																						}
																					} else {
																						delete this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]
																					}
																				}}
																			/>
																		`
																	} else {
																		return nothing
																	}
																})()}
															</div>
														</section>
														<section class="flex flex-col space-y-1">
															<div class="relative w-full h-0">
																${this._tooltipsTracker['fg-use-checkbox-values-in-storage']
																	? html`<div
																			class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																				? 'bg-primary text-primary-content'
																				: this.color === Theme.Color.SECONDARY
																					? 'bg-secondary text-secondary-content'
																					: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																		>
																			Use checkbox value when setting the value during input.
																		</div>`
																	: nothing}
															</div>
															<div class="flex space-x-1">
																<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
																	<div class="h-fit self-center">Field Checkbox value is in storage</div>
																	<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => this._updateTooltipsTracker('fg-use-checkbox-values-in-storage', true)} @mouseleave=${() => this._updateTooltipsTracker('fg-use-checkbox-values-in-storage', false)}>
																		<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
																	</div>
																</span>
																<input
																	class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
																	type="checkbox"
																	.checked=${this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUES_USE_IN_STORAGE] || false}
																	@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																		if (e.currentTarget.checked) {
																			this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUES_USE_IN_STORAGE] = true
																		} else {
																			delete this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUES_USE_IN_STORAGE]
																		}
																	}}
																/>
															</div>
														</section>
														<div class="divider h-fit"></div>
													`
												} else {
													return nothing
												}
											})()}
											${(() => {
												if (typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] === 'string' && (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] as string).length > 0) {
													return html`
														<section class="flex flex-col space-y-1">
															<div class="relative w-full h-0">
																${this._tooltipsTracker['d-field-add-data-to-full-text-search-index']
																	? html`
																			<div
																				class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																					? 'bg-primary text-primary-content'
																					: this.color === Theme.Color.SECONDARY
																						? 'bg-secondary text-secondary-content'
																						: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																			>
																				Add field text data to full text search index during database insert or update of data.
																			</div>
																		`
																	: nothing}
															</div>
															<div class="flex space-x-1">
																<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
																	<div class="h-fit self-center">Database add data to full text search index</div>
																	<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => this._updateTooltipsTracker('d-field-add-data-to-full-text-search-index', true)} @mouseleave=${() => this._updateTooltipsTracker('d-field-add-data-to-full-text-search-index', false)}>
																		<iconify-icon icon="mdi:question-mark" style="color: ${this.color};" width=${Misc.IconifySize()} height=${Misc.IconifySize('18')}></iconify-icon>
																	</div>
																</span>
																<input
																	class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
																	type="checkbox"
																	.checked=${this.fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_ADD_DATA_TO_FULL_TEXT_SEARCH_INDEX] || false}
																	@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																		if (e.currentTarget.checked) {
																			this.fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_ADD_DATA_TO_FULL_TEXT_SEARCH_INDEX] = true
																		} else {
																			delete this.fieldgroup[MetadataModel.FgProperties.DATABASE_FIELD_ADD_DATA_TO_FULL_TEXT_SEARCH_INDEX]
																		}
																	}}
																/>
															</div>
														</section>
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
							</section>
						`
					} else {
						return nothing
					}
				})()}
			</main>
			<footer class="flex justify-center w-full">
				<button class="btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}" @click=${() => this.updatefieldgroup(this.fieldgroup)}>update field/group</button>
			</footer>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-build-edit-field-group': Component
	}
}
