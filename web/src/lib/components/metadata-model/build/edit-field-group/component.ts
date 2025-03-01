import Json from '@lib/json'
import MetadataModel from '@lib/metadata_model'
import Theme from '@lib/theme'
import { LitElement, unsafeCSS, html, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Log from '@lib/log'
import Papa from 'papaparse'
import '@lib/components/vertical-flex-scroll/component'

@customElement('metadata-model-build-edit-field-group')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) fieldgroup: any
	@property({ type: Object }) metadatamodel: any
	@property({ type: String }) color: Theme.Color = Theme.Color.PRIMARY
	@property({ attribute: false }) updatefieldgroup!: (fieldgroup: any) => void

	@state() private _showFieldGroupGeneralProperties: boolean = true

	@state() private _showFieldGroupInputFilterView: boolean = false

	@state() private _showDatabaseProperties: boolean = false

	@state() private _showFieldProperties: boolean = false

	@state() private _show2DRepositionFields: boolean = false

	@state() private _cycleFieldGroupKeyViews = 0

	private readonly FIELD_GROUP_NAME_ERROR = 'Field Group Name must be at least 1 character in length'
	@state() private _fieldGroupNameError: string | null = null

	private readonly FIELD_GROUP_MAX_ENTRIES_ERROR = 'Max entry is not valid'
	@state() private _fieldGroupMaxEntriesError: string | null = null

	@state() private _showHintID: string = ''

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
							${(() => {
								if (this._showFieldGroupGeneralProperties) {
									return html`
										<!--mdi:eye source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path fill="${this.color}" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
										</svg>
									`
								}

								return html`
									<!--mdi:eye-off source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
										<path
											fill="${this.color}"
											d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
										/>
									</svg>
								`
							})()}
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
																${(() => {
																	if (this._cycleFieldGroupKeyViews === 0) {
																		return html`
																			<!--mdi:code-array source: https://icon-sets.iconify.design-->
																			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${this.color}" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm3 1v12h4v-2H8V8h2V6zm10 10h-2v2h4V6h-4v2h2z" /></svg>
																		`
																	}

																	if (this._cycleFieldGroupKeyViews === 1) {
																		return html`
																			<!--mdi:code-json source: https://icon-sets.iconify.design-->
																			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																				<path
																					fill="${this.color}"
																					d="M5 3h2v2H5v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3zm-7 12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1"
																				/>
																			</svg>
																		`
																	}

																	return html`
																		<!--mdi:transit-connection-horizontal source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																			<path
																				fill="${this.color}"
																				d="M12 9c-1.3 0-2.4.8-2.8 2H6.8C6.4 9.8 5.3 9 4 9c-1.7 0-3 1.3-3 3s1.3 3 3 3c1.3 0 2.4-.8 2.8-2h2.4c.4 1.2 1.5 2 2.8 2s2.4-.8 2.8-2h2.4c.4 1.2 1.5 2 2.8 2c1.7 0 3-1.3 3-3s-1.3-3-3-3c-1.3 0-2.4.8-2.8 2h-2.4c-.4-1.2-1.5-2-2.8-2m-9 3c0-.6.4-1 1-1s1 .4 1 1s-.4 1-1 1s-1-.4-1-1m18 0c0 .6-.4 1-1 1s-1-.4-1-1s.4-1 1-1s1 .4 1 1"
																			/>
																		</svg>
																	`
																})()}
															</button>
															<span class="text-wrap break-words self-center">
																${(() => {
																	if (this._cycleFieldGroupKeyViews === 0) {
																		return fieldGroupKey
																	}
																	if (this._cycleFieldGroupKeyViews === 1) {
																		return MetadataModel.FieldGroupDataJsonPath(fieldGroupKey)
																	}
																	return MetadataModel.FieldGroupKeyPath(fieldGroupKey)
																})()}
															</span>
														`
													}
													return html`<span class="text-error">Not Valid</span>`
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
											}
											return nothing
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
														if (!Number.isNaN(Number(e.currentTarget.value))) {
															this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] = Math.round(Number(e.currentTarget.value))
															this._fieldGroupMaxEntriesError = null
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
											}
											return nothing
										})()}
									</section>
									<div class="join max-md:join-vertical">
										<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
											<span class="h-fit self-center break-words">Join symbol for field with multiple values</span>
											<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'fg-join-symbol')} @mouseout=${() => (this._showHintID = '')}>
												<!--mdi:question-mark source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
												</svg>
											</div>
										</span>
										<input
											class="flex-1 join-item input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
											type="text"
											placeholder="Enter join symbol..."
											.value=${this.fieldgroup[MetadataModel.FgProperties.FIELD_MULTIPLE_VALUES_JOIN_SYMBOL] || ''}
											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
												if (e.currentTarget.value.length > 0) {
													this.fieldgroup[MetadataModel.FgProperties.FIELD_MULTIPLE_VALUES_JOIN_SYMBOL] = e.currentTarget.value
												} else {
													delete this.fieldgroup[MetadataModel.FgProperties.FIELD_MULTIPLE_VALUES_JOIN_SYMBOL]
												}
											}}
										/>
									</div>
									<section class="flex flex-col space-y-1">
										<div class="relative w-full h-0">
											${(() => {
												if (this._showHintID === 'fg-is-primary-key') {
													return html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
														>
															Used for purporses such as converting a 2D array to an array of objects.
														</div>
													`
												}
												return nothing
											})()}
										</div>
										<div class="flex space-x-1">
											<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
												<div class="h-fit self-center">Field Group is Primary Key</div>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-is-primary-key')} @mouseout=${() => (this._showHintID = '')}>
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
												}}
											/>
										</div>
									</section>
								</main>
							`
						}
						return nothing
					})()}
				</section>
				${(() => {
					if (MetadataModel.IsFieldAField(this.fieldgroup)) {
						return html`
							<section class="rounded-md shadow-inner shadow-gray-800 p-1">
								<header class="flex justify-between">
									<div class="h-fit self-center font-bold ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">2D Field Reposition Properties</div>
									<button class="btn btn-ghost w-fit h-fit min-h-fit p-0" @click=${() => (this._show2DRepositionFields = !this._show2DRepositionFields)}>
										${(() => {
											if (this._show2DRepositionFields) {
												return html`
													<!--mdi:eye source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path fill="${this.color}" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
													</svg>
												`
											}

											return html`
												<!--mdi:eye-off source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path
														fill="${this.color}"
														d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
													/>
												</svg>
											`
										})()}
									</button>
								</header>
								${(() => {
									let fields2d = new MetadataModel.Extract2DFields(this.metadatamodel, false, false, false)
									fields2d.Extract()

									let originalPosition = -1
									for (let fIndex = 0; fIndex < fields2d.Fields.length; fIndex++) {
										if (fields2d.Fields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY] === this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
											originalPosition = fIndex
										}
									}

									if (this._show2DRepositionFields) {
										return html`
											<div class="divider h-fit"></div>
											<main class="flex flex-col space-y-1">
												<div class="italic font-bold text-center">Pick target position for field</div>
												<div><span class="font-bold italic">Original Position: </span><span>${originalPosition > -1 ? originalPosition + 1 : 'Not found'}</span></div>
												<virtual-flex-scroll
													class="overflow-auto max-w-[700px]"
													.data=${fields2d.Fields}
													.foreachrowrender=${(datum: any, index: number) => {
														if (datum[MetadataModel.FgProperties.FIELD_GROUP_KEY] === this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
															return html`
																<div
																	class="p-2 rounded-md h-full ${datum[MetadataModel.FgProperties.FIELD_GROUP_KEY] === this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
																		? this.color === Theme.Color.PRIMARY
																			? 'bg-primary text-primary-content'
																			: this.color === Theme.Color.SECONDARY
																				? 'bg-secondary text-secondary-content'
																				: 'bg-accent text-accent-content'
																		: ''}"
																>
																	${index + 1}-${MetadataModel.GetFieldGroupName(datum)}
																</div>
															`
														}

														return html`
															<button
																class="btn btn-ghost"
																@click=${() => {
																	this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `${MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION}.${MetadataModel.Field2dPositionProperties.FIELD_GROUP_KEY}`, datum[MetadataModel.FgProperties.FIELD_GROUP_KEY])
																	if (typeof datum[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] === 'number') {
																		this.fieldgroup = Json.SetValueInObject(
																			this.fieldgroup,
																			`${MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION}.${MetadataModel.Field2dPositionProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX}`,
																			datum[MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX]
																		)
																	}
																}}
															>
																${index + 1}-${MetadataModel.GetFieldGroupName(datum)}
															</button>
														`
													}}
													.flexcolumn=${false}
												></virtual-flex-scroll>
												<div class="divider h-fit"></div>
												${(() => {
													return html`
														<div class="italic font-bold text-center">Repositioned Fields</div>
														${(() => {
															if (MetadataModel.Is2DFieldViewPositionValid(this.fieldgroup)) {
																for (let fIndex = 0; fIndex < fields2d.FieldsRepositioned.length; fIndex++) {
																	if (fields2d.FieldsRepositioned[fIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY] === this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
																		return html`
																			<div class="flex flex-col space-y-1">
																				<div><span class="font-bold italic">Repositioned Position: </span><span>${fIndex + 1}</span></div>
																				<div class="flex space-x-1">
																					<span class="font-bold">Position field before?</span>
																					<input
																						class="checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
																						type="checkbox"
																						.checked=${this.fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION][MetadataModel.Field2dPositionProperties.FIELD_POSITION_BEFORE] || false}
																						@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																							if (e.currentTarget.checked) {
																								this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `${MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION}.${MetadataModel.Field2dPositionProperties.FIELD_POSITION_BEFORE}`, true)
																							} else {
																								this.fieldgroup = Json.DeleteValueInObject(this.fieldgroup, `${MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION}.${MetadataModel.Field2dPositionProperties.FIELD_POSITION_BEFORE}`)
																							}
																						}}
																					/>
																				</div>
																				<button
																					class="btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} min-w-fit w-fit min-h-fit h-fit p-2"
																					@click=${() => {
																						delete this.fieldgroup[MetadataModel.FgProperties.FIELD_2D_VIEW_POSITION]
																					}}
																				>
																					reset
																				</button>
																			</div>
																		`
																	}
																}
															}

															return nothing
														})()}
														<virtual-flex-scroll
															class="overflow-auto max-w-[700px]"
															.data=${fields2d.FieldsRepositioned}
															.foreachrowrender=${(datum: any, index: number) => {
																return html`
																	<div
																		class="p-2 rounded-md ${datum[MetadataModel.FgProperties.FIELD_GROUP_KEY] === this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
																			? this.color === Theme.Color.PRIMARY
																				? 'bg-primary text-primary-content'
																				: this.color === Theme.Color.SECONDARY
																					? 'bg-secondary text-secondary-content'
																					: 'bg-accent text-accent-content'
																			: ''}"
																	>
																		${index + 1}-${MetadataModel.GetFieldGroupName(datum)}
																	</div>
																`
															}}
															.flexcolumn=${false}
														></virtual-flex-scroll>
													`
												})()}
											</main>
										`
									}
									return nothing
								})()}
							</section>
						`
					}
					return nothing
				})()}
				<section class="rounded-md shadow-inner shadow-gray-800 p-1">
					<header class="flex justify-between">
						<div class="h-fit self-center font-bold ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Input, View, and Filter Properties</div>
						<button class="btn btn-ghost w-fit h-fit min-h-fit p-0" @click=${() => (this._showFieldGroupInputFilterView = !this._showFieldGroupInputFilterView)}>
							${(() => {
								if (this._showFieldGroupInputFilterView) {
									return html`
										<!--mdi:eye source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path fill="${this.color}" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
										</svg>
									`
								}

								return html`
									<!--mdi:eye-off source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
										<path
											fill="${this.color}"
											d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
										/>
									</svg>
								`
							})()}
						</button>
					</header>
					${(() => {
						if (this._showFieldGroupInputFilterView) {
							return html`
								<div class="divider h-fit"></div>
								<main class="flex flex-col space-y-1">
									<section class="flex flex-col space-y-1">
										<div class="relative w-full h-0">
											${(() => {
												if (this._showHintID === 'fg-input-disable') {
													return html`
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
												}
												return nothing
											})()}
										</div>
										<div class="flex space-x-1">
											<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
												<div class="h-fit self-center">Field Group Disable User Input</div>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-input-disable')} @mouseout=${() => (this._showHintID = '')}>
													<!--mdi:question-mark source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
													</svg>
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
											${(() => {
												if (this._showHintID === 'fg-view-disable') {
													return html`
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
												}
												return nothing
											})()}
										</div>
										<div class="flex space-x-1">
											<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
												<div class="h-fit self-center">Field Group Disable View</div>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-view-disable')} @mouseout=${() => (this._showHintID = '')}>
													<!--mdi:question-mark source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
													</svg>
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
											${(() => {
												if (this._showHintID === 'fg-view-values-in-separate-columns') {
													return html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
														>
															Enable viewing groups/tables or fields/columns with multiple values in one row.
														</div>
													`
												}
												return nothing
											})()}
										</div>
										<div class="flex space-x-1">
											<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
												<div class="h-fit self-center">Field Group view values in separate columns</div>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-view-values-in-separate-columns')} @mouseout=${() => (this._showHintID = '')}>
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
												}}
											/>
										</div>
									</section>
									<section class="flex flex-col space-y-1">
										<div class="relative w-full h-0">
											${(() => {
												if (this._showHintID === 'fg-view-max-values-in-separate-columns') {
													return html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
														>
															Maximum number of columns of values in one row.
														</div>
													`
												}
												return nothing
											})()}
										</div>
										<div class="join max-md:join-vertical">
											<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
												<span class="h-fit self-center break-words">Field Group view max columns in separate columns</span>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'fg-view-max-values-in-separate-columns')} @mouseout=${() => (this._showHintID = '')}>
													<!--mdi:question-mark source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
													</svg>
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
									<section class="flex flex-col space-y-1">
										<div class="relative w-full h-0">
											${(() => {
												if (this._showHintID === 'fg-view-values-in-separate-columns-header-format') {
													return html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
														>
															Field view header format (replaces [*] with column/row index)
														</div>
													`
												}
												return nothing
											})()}
										</div>
										<div class="join max-md:join-vertical">
											<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
												<span class="h-fit self-center break-words">Field view header format</span>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'fg-view-values-in-separate-columns-header-format')} @mouseout=${() => (this._showHintID = '')}>
													<!--mdi:question-mark source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
													</svg>
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
									<div class="divider h-fit"></div>
									${(() => {
										if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] === 'object') {
											return html`
												<section class="flex flex-col space-y-1">
													<div class="relative w-full h-0">
														${(() => {
															if (this._showHintID === 'fg-view-as-table-in-2d') {
																return html`
																	<div
																		class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																			? 'bg-primary text-primary-content'
																			: this.color === Theme.Color.SECONDARY
																				? 'bg-secondary text-secondary-content'
																				: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																	>
																		View data as row and column with no nesting. Property works best if group has nested groups and not necessary to apply if it does not have nested groups.
																	</div>
																`
															}
															return nothing
														})()}
													</div>
													<div class="flex space-x-1">
														<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
															<div class="h-fit self-center">Group default view as table in 2D</div>
															<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-view-as-table-in-2d')} @mouseout=${() => (this._showHintID = '')}>
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
															}}
														/>
													</div>
												</section>
												<section class="flex flex-col space-y-1">
													<div class="relative w-full h-0">
														${(() => {
															if (this._showHintID === 'fg-filter-add-full-text-search-box') {
																return html`
																	<div
																		class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																			? 'bg-primary text-primary-content'
																			: this.color === Theme.Color.SECONDARY
																				? 'bg-secondary text-secondary-content'
																				: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																	>
																		Add full text search box for group in the filter panel. Enable if backend supports full text search for group.
																	</div>
																`
															}
															return nothing
														})()}
													</div>
													<div class="flex space-x-1">
														<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
															<div class="h-fit self-center">Group filter add full text search box</div>
															<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-filter-add-full-text-search-box')} @mouseout=${() => (this._showHintID = '')}>
																<!--mdi:question-mark source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																	<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
																</svg>
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
										}
										return nothing
									})()}
									<section class="flex flex-col space-y-1">
										<div class="relative w-full h-0">
											${(() => {
												if (this._showHintID === 'fg-filter-disable') {
													return html`
														<div
															class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																? 'bg-primary text-primary-content'
																: this.color === Theme.Color.SECONDARY
																	? 'bg-secondary text-secondary-content'
																	: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
														>
															Disable some query conditions options such as database collection name, field/group primary key status etc. when displaying the query condition panel.
														</div>
													`
												}
												return nothing
											})()}
										</div>
										<div class="flex space-x-1">
											<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
												<div class="h-fit self-center">Field Group Disable Filter</div>
												<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-filter-disable')} @mouseout=${() => (this._showHintID = '')}>
													<!--mdi:question-mark source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
													</svg>
												</div>
											</span>
											<input
												class="self-center checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
												type="checkbox"
												.checked=${this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_QUERY_CONDITIONS_EDIT_DISABLE] || false}
												@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
													if (e.currentTarget.checked) {
														this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_QUERY_CONDITIONS_EDIT_DISABLE] = true
													} else {
														delete this.fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_QUERY_CONDITIONS_EDIT_DISABLE]
													}
												}}
											/>
										</div>
									</section>
								</main>
							`
						}
						return nothing
					})()}
				</section>
				<section class="rounded-md shadow-inner shadow-gray-800 p-1">
					<header class="flex justify-between">
						<div class="h-fit self-center font-bold ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Database Properties</div>
						<button class="btn btn-ghost w-fit h-fit min-h-fit p-0" @click=${() => (this._showDatabaseProperties = !this._showDatabaseProperties)}>
							${(() => {
								if (this._showDatabaseProperties) {
									return html`
										<!--mdi:eye source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path fill="${this.color}" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
										</svg>
									`
								}

								return html`
									<!--mdi:eye-off source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
										<path
											fill="${this.color}"
											d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
										/>
									</svg>
								`
							})()}
						</button>
					</header>
					${(() => {
						if (this._showDatabaseProperties) {
							return html`
								<section class="flex flex-col space-y-1">
									<div class="relative w-full h-0">
										${(() => {
											if (this._showHintID === 'd-table-collection-uid') {
												return html`
													<div
														class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
															? 'bg-primary text-primary-content'
															: this.color === Theme.Color.SECONDARY
																? 'bg-secondary text-secondary-content'
																: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
													>
														May be relevant in identifying columns/fields that belong to a particular table/collection in a nested join.
													</div>
												`
											}
											return nothing
										})()}
									</div>
									<div class="join max-md:join-vertical">
										<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
											<span class="h-fit self-center break-words">Database table/collection unique id</span>
											<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'd-table-collection-uid')} @mouseout=${() => (this._showHintID = '')}>
												<!--mdi:question-mark source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
												</svg>
											</div>
										</span>
										<input
											class="flex-1 join-item input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'} w-full min-h-[48px]"
											type="text"
											placeholder="Enter table/collection unique id..."
											.value=${this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] || ''}
											@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
												if (e.currentTarget.value.length > 0) {
													this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] = e.currentTarget.value
												} else {
													delete this.fieldgroup[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID]
												}
											}}
										/>
									</div>
								</section>
								${(() => {
									if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] === 'object') {
										return html`
											<section class="flex flex-col space-y-1">
												<div class="relative w-full h-0">
													${(() => {
														if (this._showHintID === 'd-group-table-collection-name') {
															return html`
																<div
																	class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																		? 'bg-primary text-primary-content'
																		: this.color === Theme.Color.SECONDARY
																			? 'bg-secondary text-secondary-content'
																			: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																>
																	May be relevant in identifying tables/collections while fetching data from the database.
																</div>
															`
														}
														return nothing
													})()}
												</div>
												<div class="join max-md:join-vertical">
													<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
														<span class="h-fit self-center break-words">Database Table/Collection name</span>
														<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'd-group-table-collection-name')} @mouseout=${() => (this._showHintID = '')}>
															<!--mdi:question-mark source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
															</svg>
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
									}
									return html`
										<section class="flex flex-col space-y-1">
											<div class="relative w-full h-0">
												${(() => {
													if (this._showHintID === 'd-field-column-name') {
														return html`
															<div
																class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																	? 'bg-primary text-primary-content'
																	: this.color === Theme.Color.SECONDARY
																		? 'bg-secondary text-secondary-content'
																		: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
															>
																May be relevant in identifying columns/fields while fetching data from the database.
															</div>
														`
													}
													return nothing
												})()}
											</div>
											<div class="join max-md:join-vertical">
												<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
													<span class="h-fit self-center break-words">Database column/field name</span>
													<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'd-field-column-name')} @mouseout=${() => (this._showHintID = '')}>
														<!--mdi:question-mark source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
															<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
														</svg>
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
								})()}
								<section class="flex flex-col space-y-1">
									<div class="relative w-full h-0">
										${(() => {
											if (this._showHintID === 'd-skip-data-extraction') {
												return html`
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
											}
											return nothing
										})()}
									</div>
									<div class="flex space-x-1">
										<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
											<div class="h-fit self-center">Database Skip Data Extraction</div>
											<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'd-skip-data-extraction')} @mouseout=${() => (this._showHintID = '')}>
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
											}}
										/>
									</div>
								</section>
							`
						}
						return nothing
					})()}
				</section>
				${(() => {
					if (typeof this.fieldgroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] === 'undefined') {
						return html`
							<section class="rounded-md shadow-inner shadow-gray-800 p-1 space-y-1">
								<header class="flex justify-between">
									<div class="h-fit self-center font-bold ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Field Properties</div>
									<button class="btn btn-ghost w-fit h-fit min-h-fit p-0" @click=${() => (this._showFieldProperties = !this._showFieldProperties)}>
										${(() => {
											if (this._showFieldProperties) {
												return html`
													<!--mdi:eye source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path fill="${this.color}" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
													</svg>
												`
											}

											return html`
												<!--mdi:eye-off source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path
														fill="${this.color}"
														d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
													/>
												</svg>
											`
										})()}
									</button>
								</header>
								${(() => {
									if (this._showFieldProperties) {
										return html`
											<div class="divider h-fit"></div>
											<section class="flex flex-col space-y-1">
												<div class="relative w-full h-0">
													${(() => {
														if (this._showHintID === 'f-input-placeholder') {
															return html`
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
														}
														return nothing
													})()}
												</div>
												<div class="join max-md:join-vertical">
													<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
														<span class="h-fit self-center break-words">Field input placeholder</span>
														<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'f-input-placeholder')} @mouseout=${() => (this._showHintID = '')}>
															<!--mdi:question-mark source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
															</svg>
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
															this.fieldgroup = structuredClone(Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_UI}`, ''))
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
															this.fieldgroup = structuredClone(this.fieldgroup)
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
												}
												return nothing
											})()}
											${(() => {
												if (this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.SELECT) {
													return html`
														<section class="join join-vertical w-full">
															<div class="join-item h-fit ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex justify-between">
																<span class="h-fit self-center">Select Options (REQUIRED)</span>
																<span class="flex space-x-1">
																	<button
																		class="btn btn-circle btn-ghost"
																		@click=${(e: Event) => {
																			try {
																				const dataToParse: any[][] = (this.fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS] as MetadataModel.ISelectOption[]).map((so) => {
																					let selOpt: any[] = []
																					if (typeof so[MetadataModel.FSelectProperties.LABEL] === 'string') {
																						selOpt.push(so[MetadataModel.FSelectProperties.LABEL])
																					}
																					if (typeof so[MetadataModel.FSelectProperties.VALUE] !== 'undefined') {
																						selOpt.push(so[MetadataModel.FSelectProperties.VALUE])
																					}
																					return selOpt
																				})

																				const objectUrl = URL.createObjectURL(new Blob([Papa.unparse(dataToParse, { header: true })], { type: 'text/csv' }))
																				const downloadLink = document.createElement('a')
																				downloadLink.href = objectUrl
																				downloadLink.setAttribute('download', `data.csv`)
																				document.body.appendChild(downloadLink)
																				downloadLink.click()
																				document.body.removeChild(downloadLink)
																				URL.revokeObjectURL(objectUrl)
																			} catch (err) {
																				Log.Log(Log.Level.ERROR, this.localName, e, err)
																			}
																		}}
																		.disabled=${!Array.isArray(this.fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS]) || this.fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS].length === 0}
																	>
																		<!--mdi:download-circle source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																			<path fill="${Theme.GetColorContent(this.color)}" d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12S6.5 2 12 2M8 17h8v-2H8zm8-7h-2.5V6h-3v4H8l4 4z" />
																		</svg>
																	</button>
																	<button
																		class="btn btn-circle btn-ghost"
																		@click=${(e: Event) => {
																			try {
																				if (Array.isArray(this.fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS])) {
																					this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}`, [{}, ...this.fieldgroup[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS]])
																				} else {
																					this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}[0]`, {})
																				}
																				this.fieldgroup = structuredClone(this.fieldgroup)
																			} catch (err) {
																				Log.Log(Log.Level.ERROR, this.localName, e, err)
																			}
																		}}
																	>
																		<!--mdi:plus-circle source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																			<path fill="${Theme.GetColorContent(this.color)}" d="M17 13h-4v4h-2v-4H7v-2h4V7h2v4h4m-5-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2" />
																		</svg>
																	</button>
																</span>
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
																						this.fieldgroup = structuredClone(Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_SELECT_OPTIONS}`, newSelectOptions))
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
																			<!--mdi:plus-circle source: https://icon-sets.iconify.design-->
																			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																				<path fill="${this.color}" d="M17 13h-4v4h-2v-4H7v-2h4V7h2v4h4m-5-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2" />
																			</svg>
																			<span class="self-center">to add a new select option</span>
																		</div>
																	`
																}

																return html`
																	<virtual-flex-scroll
																		class="join-item border-2 ${this.color === Theme.Color.PRIMARY ? 'border-primary' : this.color === Theme.Color.SECONDARY ? 'border-secondary' : 'border-accent'} max-h-[500px] overflow-auto"
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
																								this.fieldgroup = structuredClone(this.fieldgroup)
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
																								this.fieldgroup = structuredClone(this.fieldgroup)
																							}}
																							.disabled=${this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] !== MetadataModel.FieldType.ANY}
																						>
																							<option disabled value="" .selected=${typeof datum[MetadataModel.FSelectProperties.TYPE] !== 'string' || (datum[MetadataModel.FSelectProperties.TYPE] as string).length === 0}>Choose value data type...</option>
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
																											.value=${typeof datum[MetadataModel.FSelectProperties.VALUE] === 'number' ? datum[MetadataModel.FSelectProperties.VALUE].toString() : ''}
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
																												this.fieldgroup = structuredClone(this.fieldgroup)
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
																												this.fieldgroup = structuredClone(this.fieldgroup)
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
																												this.fieldgroup = structuredClone(this.fieldgroup)
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
																							<!--mdi:delete source: https://icon-sets.iconify.design-->
																							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.Color.ERROR}" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
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
												}
												return nothing
											})()}
											${(() => {
												if (this.fieldgroup[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.CHECKBOX) {
													return html`
														<div class="divider h-fit">Field UI Checkbox options</div>
														<section class="flex flex-col space-y-1">
															<div class="relative w-full h-0">
																${(() => {
																	if (this._showHintID === 'f-checkbox-value-if-true') {
																		return html`
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
																	}
																	return nothing
																})()}
															</div>
															<div class="join join-vertical">
																<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
																	<span class="h-fit self-center break-words">Field checkbox value if true</span>
																	<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'f-checkbox-value-if-true')} @mouseout=${() => (this._showHintID = '')}>
																		<!--mdi:question-mark source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																			<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
																		</svg>
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
																		this.fieldgroup = structuredClone(this.fieldgroup)
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
																		value="${MetadataModel.FieldType.NUMBER}"
																		.selected=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] === 'object' &&
																		this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FieldType.NUMBER}
																	>
																		Number
																	</option>
																	<option
																		value="${MetadataModel.FieldType.TEXT}"
																		.selected=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] === 'object' && this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FieldType.TEXT}
																	>
																		Text
																	</option>
																</select>
																${(() => {
																	if (typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] === 'object' && (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.TYPE] as string).length > 0) {
																		return html`
																			<input
																				class="flex-[2] join-item input min-h-[48px] ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
																				type=${this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FieldType.NUMBER ? 'number' : 'text'}
																				placeholder="Enter value..."
																				.value=${this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE] || ''}
																				@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																					if (e.currentTarget.value.length > 0) {
																						if (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FieldType.NUMBER) {
																							if (!Number.isNaN(e.currentTarget)) {
																								this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE}.${MetadataModel.FieldCheckboxValueProperties.VALUE}`, Number(e.currentTarget.value))
																							} else {
																								delete this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]
																							}
																						} else {
																							this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE}.${MetadataModel.FieldCheckboxValueProperties.VALUE}`, e.currentTarget.value)
																							this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE] = e.currentTarget.value
																						}
																						this.fieldgroup = structuredClone(this.fieldgroup)
																					} else {
																						delete this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]
																					}
																				}}
																			/>
																		`
																	}
																	return nothing
																})()}
															</div>
														</section>
														<section class="flex flex-col space-y-1">
															<div class="relative w-full h-0">
																${(() => {
																	if (this._showHintID === 'f-checkbox-value-if-false') {
																		return html`
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
																	}
																	return nothing
																})()}
															</div>
															<div class="join join-vertical">
																<span class="join-item h-[48px] space-x-1 ${this.color === Theme.Color.PRIMARY ? 'join-label-primary' : this.color === Theme.Color.SECONDARY ? 'join-label-secondary' : 'join-label-accent'} p-1 flex ">
																	<span class="h-fit self-center break-words">Field checkbox value if false</span>
																	<div class="btn btn-circle w-fit h-fit min-h-fit p-0 self-center" @mouseover=${() => (this._showHintID = 'f-checkbox-value-if-false')} @mouseout=${() => (this._showHintID = '')}>
																		<!--mdi:question-mark source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																			<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
																		</svg>
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
																		this.fieldgroup = structuredClone(this.fieldgroup)
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
																		value="${MetadataModel.FieldType.NUMBER}"
																		.selected=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] === 'object' &&
																		this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FieldType.NUMBER}
																	>
																		Number
																	</option>
																	<option
																		value="${MetadataModel.FieldType.TEXT}"
																		.selected=${typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] === 'object' &&
																		this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FieldType.TEXT}
																	>
																		Text
																	</option>
																</select>
																${(() => {
																	if (typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] === 'object' && (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.TYPE] as string).length > 0) {
																		return html`
																			<input
																				class="flex-[2] join-item input min-h-[48px] ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
																				type=${this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FieldType.NUMBER ? 'number' : 'text'}
																				placeholder="Enter value..."
																				.value=${this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE] || ''}
																				@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																					if (e.currentTarget.value.length > 0) {
																						if (this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.TYPE] === MetadataModel.FieldType.NUMBER) {
																							if (!Number.isNaN(e.currentTarget)) {
																								this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE}.${MetadataModel.FieldCheckboxValueProperties.VALUE}`, Number(e.currentTarget.value))
																							} else {
																								delete this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]
																							}
																						} else {
																							this.fieldgroup = Json.SetValueInObject(this.fieldgroup, `$.${MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE}.${MetadataModel.FieldCheckboxValueProperties.VALUE}`, e.currentTarget.value)
																							this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE] = e.currentTarget.value
																						}
																						this.fieldgroup = structuredClone(this.fieldgroup)
																					} else {
																						delete this.fieldgroup[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]
																					}
																				}}
																			/>
																		`
																	}
																	return nothing
																})()}
															</div>
														</section>
														<section class="flex flex-col space-y-1">
															<div class="relative w-full h-0">
																${(() => {
																	if (this._showHintID === 'fg-use-checkbox-values-in-storage') {
																		return html`
																			<div
																				class="z-20 absolute bottom-0 w-full min-w-[250px] h-fit ${this.color === Theme.Color.PRIMARY
																					? 'bg-primary text-primary-content'
																					: this.color === Theme.Color.SECONDARY
																						? 'bg-secondary text-secondary-content'
																						: 'bg-accent text-accent-content'} p-1 shadow-md shadow-gray-800 rounded-md"
																			>
																				Use checkbox value when setting the value during input.
																			</div>
																		`
																	}
																	return nothing
																})()}
															</div>
															<div class="flex space-x-1">
																<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
																	<div class="h-fit self-center">Field Checkbox value is in storage</div>
																	<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'fg-use-checkbox-values-in-storage')} @mouseout=${() => (this._showHintID = '')}>
																		<!--mdi:question-mark source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																			<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
																		</svg>
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
												}
												return nothing
											})()}
											${(() => {
												if (typeof this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] === 'string' && (this.fieldgroup[MetadataModel.FgProperties.FIELD_DATATYPE] as string).length > 0) {
													return html`
														<section class="flex flex-col space-y-1">
															<div class="relative w-full h-0">
																${(() => {
																	if (this._showHintID === 'd-field-add-data-to-full-text-search-index') {
																		return html`
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
																	}
																	return nothing
																})()}
															</div>
															<div class="flex space-x-1">
																<span class="flex space-x-1 ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
																	<div class="h-fit self-center">Database add data to full text search index</div>
																	<div class="btn btn-circle w-fit h-fit min-h-fit p-0" @mouseover=${() => (this._showHintID = 'd-field-add-data-to-full-text-search-index')} @mouseout=${() => (this._showHintID = '')}>
																		<!--mdi:question-mark source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																			<path fill="${this.color}" d="M10 19h3v3h-3zm2-17c5.35.22 7.68 5.62 4.5 9.67c-.83 1-2.17 1.66-2.83 2.5C13 15 13 16 13 17h-3c0-1.67 0-3.08.67-4.08c.66-1 2-1.59 2.83-2.25C15.92 8.43 15.32 5.26 12 5a3 3 0 0 0-3 3H6a6 6 0 0 1 6-6" />
																		</svg>
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
												}
												return nothing
											})()}
										`
									}
									return nothing
								})()}
							</section>
						`
					}
					return nothing
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
