import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import componentGroupFields from './component.groupfields.css?inline'
import Theme from '@lib/theme'
import MetadataModel from '@lib/metadata_model'
import './field/component'
import '../../header/component'
import '../table/component'
import '@lib/components/vertical-flex-scroll/component'
import '@lib/components/drop-down/component'
import Json from '@lib/json'

@customElement('metadata-model-datum-input-view-form')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: Object }) group: any = {}
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ type: String }) color!: Theme.Color
	@property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
	@property({ attribute: false }) getdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
	@property({ attribute: false }) updatedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
	@property({ attribute: false }) deletedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ type: String }) copiedcutfieldgroupkey: string = ''
	@property({ attribute: false }) setcopiedfieldgroupkey!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ attribute: false }) setcutfieldgroupdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ attribute: false }) pastefieldgroupdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ type: Number }) scrollelementheight!: number
	@property({ type: Number }) basestickytop: number = 0

	@state() private _totalNoOfRows: number = 1

	@state() private _viewJsonOutput: boolean = false

	@state() private _showMultipleEntryTopMenu: boolean = false
	@state() private _showMultipleEntryBottomMenu: boolean = false

	private _multipleEntryFormMenuHtmlTemplate() {
		return html`
			<button
				class="btn btn-ghost p-1 w-full justify-start"
				@click=${() => {
					if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number') {
						if (this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] < 1) {
							this._totalNoOfRows += 1
						} else {
							if (this._totalNoOfRows < this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]) {
								this._totalNoOfRows += 1
							}
						}
					} else {
						this._totalNoOfRows += 1
					}
				}}
				.disabled=${typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number' && this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] > 1 && this._totalNoOfRows >= this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]}
			>
				<div class="flex">
					<div class="flex self-center">
						<!--mdi:plus-bold source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="black" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
					<div class="self-center font-bold">Add new ${MetadataModel.GetFieldGroupName(this.group)}</div>
				</div>
			</button>
			<button
				class="btn btn-ghost p-1 w-full justify-start"
				@click=${() => {
					if (this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
						delete this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW]
					} else {
						this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] = MetadataModel.DView.TABLE
					}
					this.updatemetadatamodel(this.group)
				}}
			>
				<div class="flex">
					<div class="flex self-center">
						${(() => {
							if (this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
								return html`
									<!--mdi:form source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24"><path fill="black" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M7 7h2v2H7zm0 4h2v2H7zm0 4h2v2H7zm10 2h-6v-2h6zm0-4h-6v-2h6zm0-4h-6V7h6z" /></svg>
								`
							}

							return html`
								<!--mdi:table-large source: https://icon-sets.iconify.design-->
								<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24">
									<path fill="black" d="M4 3h16a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m0 4v3h4V7zm6 0v3h4V7zm10 3V7h-4v3zM4 12v3h4v-3zm0 8h4v-3H4zm6-8v3h4v-3zm0 8h4v-3h-4zm10 0v-3h-4v3zm0-8h-4v3h4z" />
								</svg>
							`
						})()}
					</div>
					<div class="self-center font-bold">Switch to ${this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE ? 'form' : 'table'} view</div>
				</div>
			</button>
			<button
				class="btn btn-ghost p-1 w-full justify-start"
				@click=${() => {
					this.deletedata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
					this._totalNoOfRows = 1
				}}
			>
				<div class="flex">
					<div class="flex self-center">
						<!--mdi:delete-empty source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="28" height="30" viewBox="0 0 24 24"><path fill="black" d="m20.37 8.91l-1 1.73l-12.13-7l1-1.73l3.04 1.75l1.36-.37l4.33 2.5l.37 1.37zM6 19V7h5.07L18 11v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2" /></svg>
					</div>
					<div class="self-center font-bold">Delete all ${MetadataModel.GetFieldGroupName(this.group)}</div>
				</div>
			</button>
			<button class="btn btn-ghost p-1 w-full justify-start" @click=${() => (this._viewJsonOutput = !this._viewJsonOutput)}>
				<div class="flex">
					<div class="flex flex-col justify-center">
						<div class="flex self-center">
							<!--mdi:code-json source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
								<path
									fill="black"
									d="M5 3h2v2H5v5a2 2 0 0 1-2 2a2 2 0 0 1 2 2v5h2v2H5c-1.07-.27-2-.9-2-2v-4a2 2 0 0 0-2-2H0v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 1 2-2m14 0a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h1v2h-1a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2v-2h2v-5a2 2 0 0 1 2-2a2 2 0 0 1-2-2V5h-2V3zm-7 12a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m-4 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m8 0a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1"
								/>
							</svg>
							${(() => {
								if (this._viewJsonOutput) {
									return html`
										<!--mdi:close-circle source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
											<path fill="black" d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" />
										</svg>
									`
								}
								return nothing
							})()}
						</div>
					</div>
					<div class="self-center font-bold">view json data</div>
				</div>
			</button>
		`
	}

	@state() private _formHeaderHeightTracker: number[] = []

	connectedCallback(): void {
		super.connectedCallback()
		const groupData = this.getdata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
		if (Array.isArray(groupData) && (groupData as any[]).length > 1) {
			this._totalNoOfRows = (groupData as any[]).length
		}
	}

	protected render(): unknown {
		if (!Array.isArray(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) || !Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS]) || typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0] !== 'object') {
			return html`<div class="w-full h-fit text-lg text-error font-bold">...group is not valid...</div>`
		}

		if (this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 1) {
			return html`
				<metadata-model-datum-input-view-form-group-fields
					class="z-[1]"
					.scrollelement=${this.scrollelement}
					.group=${this.group}
					.arrayindexplaceholders=${[...this.arrayindexplaceholders, 0]}
					.color=${this.color}
					.updatemetadatamodel=${this.updatemetadatamodel}
					.getdata=${this.getdata}
					.updatedata=${this.updatedata}
					.deletedata=${this.deletedata}
					.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
					.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
					.setcutfieldgroupdata=${this.setcutfieldgroupdata}
					.pastefieldgroupdata=${this.pastefieldgroupdata}
					.scrollelementheight=${this.scrollelementheight}
					.basestickytop=${this.basestickytop}
				></metadata-model-datum-input-view-form-group-fields>
			`
		}

		return html`
			<header class="divider h-fit text-lg font-bold ${this.color === Theme.Color.PRIMARY ? 'divider-primary' : this.color === Theme.Color.SECONDARY ? 'divider-secondary' : 'divider-accent'}">
				<drop-down
					.showdropdowncontent=${this._showMultipleEntryTopMenu}
					@drop-down:showdropdowncontentupdate=${(e: CustomEvent) => {
						this._showMultipleEntryTopMenu = e.detail.value
					}}
				>
					<button
						slot="header"
						class="btn h-fit min-h-fit w-fit min-w-fit flex ${this.color === Theme.Color.PRIMARY ? 'btn-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'btn-secondary text-secondary-content' : 'btn-accent text-accent-content'}"
						@click=${() => (this._showMultipleEntryTopMenu = !this._showMultipleEntryTopMenu)}
					>
						<div class="self-center">Start of ${MetadataModel.GetFieldGroupName(this.group)}</div>
						<div class="self-center rounded-md shadow-inner ${this.color === Theme.Color.PRIMARY ? 'shadow-primary-content' : this.color === Theme.Color.SECONDARY ? 'shadow-secondary-content' : 'shadow-accent-content'} p-2">${this._totalNoOfRows}</div>
						<div class="self-center w-fit h-fit">
							<!--mdi:arrow-down source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M11 4h2v12l5.5-5.5l1.42 1.42L12 19.84l-7.92-7.92L5.5 10.5L11 16z" /></svg>
						</div>
					</button>
					<div slot="content" class="flex flex-col space-y-1 w-fit bg-white p-1 rounded-md shadow-sm shadow-gray-800 text-black min-w-[200px]">${this._multipleEntryFormMenuHtmlTemplate()}</div>
				</drop-down>
			</header>
			<virtual-flex-scroll
				id="virtual-flex-scroll"
				.data=${(() => {
					let data: number[] = []

					for (let dIndex = 0; dIndex < this._totalNoOfRows; dIndex++) {
						data.push(dIndex)
					}

					return data
				})()}
				.foreachrowrender=${(datum: number, _: number) => {
					return html`
						<div class="mt-2 mb-2">
							<metadata-model-datum-input-header
								class="sticky z-[2] ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}"
								style="top: ${this.basestickytop}px;"
								.group=${(() => {
									const newGroup = structuredClone(this.group)
									newGroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] = `${MetadataModel.GetFieldGroupName(newGroup)} #${datum + 1}`
									return structuredClone(newGroup)
								})()}
								.viewjsonoutput=${this._viewJsonOutput}
								.updateviewjsonoutput=${(newviewjsonoutput: boolean) => (this._viewJsonOutput = newviewjsonoutput)}
								.updatemetadatamodel=${(fieldGroup: any) => {
									fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_NAME] = this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME]
									this.updatemetadatamodel(fieldGroup)
								}}
								.deletedata=${() => {
									this.deletedata(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, datum])
									this._totalNoOfRows = this._totalNoOfRows - 1 > 1 ? this._totalNoOfRows - 1 : 1
								}}
								.color=${this.color}
								.headerheightupdate=${(newheight: number) => {
									this._formHeaderHeightTracker = structuredClone(Json.SetValueInObject(this._formHeaderHeightTracker, `$.${datum}`, newheight))
								}}
							>
								<div slot="header-sticky-right-content">
									${(() => {
										const groupKey = `${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`
										if (this.copiedcutfieldgroupkey.length > 0 && this.copiedcutfieldgroupkey === groupKey) {
											return html`
												<button
													class="join-item btn btn-ghost p-1"
													@click=${() => {
														this.pastefieldgroupdata(groupKey, [...this.arrayindexplaceholders, datum])
													}}
												>
													<!--mdi:content-paste source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
														<path fill="${Theme.GetColorContent(this.color)}" d="M19 20H5V4h2v3h10V4h2m-7-2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m7 0h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2" />
													</svg>
												</button>
											`
										} else {
											return nothing
										}
									})()}
									<button
										class="join-item btn btn-ghost p-1"
										@click=${() => {
											if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number') {
												if (this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] < 1) {
													this._totalNoOfRows += 1
												} else {
													if (this._totalNoOfRows < this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]) {
														this._totalNoOfRows += 1
													}
												}
											} else {
												this._totalNoOfRows += 1
											}
										}}
										.disabled=${typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number' && this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] > 1 && this._totalNoOfRows >= this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]}
									>
										<!--mdi:plus-bold source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
									</button>
								</div>
							</metadata-model-datum-input-header>
							${(() => {
								if (typeof this._formHeaderHeightTracker[datum] === 'undefined') {
									return nothing
								}

								if (this._viewJsonOutput) {
									const jsonData = this.getdata(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}[${datum}]`, this.arrayindexplaceholders)

									return html`<pre class="z-[1] flex-1 bg-gray-700 text-white w-full h-fit max-h-[80vh] overflow-auto shadow-inner shadow-gray-800 p-1"><code>${JSON.stringify(jsonData, null, 4)}</code></pre>`
								}

								return html`
									<metadata-model-datum-input-view-form-group-fields
										class="z-[1] p-2 shadow-inner shadow-gray-800"
										.scrollelement=${this.scrollelement}
										.group=${this.group}
										.arrayindexplaceholders=${[...this.arrayindexplaceholders, datum]}
										.color=${this.color}
										.updatemetadatamodel=${this.updatemetadatamodel}
										.getdata=${this.getdata}
										.updatedata=${this.updatedata}
										.deletedata=${this.deletedata}
										.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
										.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
										.setcutfieldgroupdata=${this.setcutfieldgroupdata}
										.pastefieldgroupdata=${this.pastefieldgroupdata}
										.scrollelementheight=${this.scrollelementheight}
										.basestickytop=${this.basestickytop + this._formHeaderHeightTracker[datum] ? this._formHeaderHeightTracker[datum] : 0}
									></metadata-model-datum-input-view-form-group-fields>
								`
							})()}
						</div>
					`
				}}
				.scrollelement=${this.scrollelement}
				.enablescrollintoview=${false}
				.disableremoveitemsoutofview=${false}
			></virtual-flex-scroll>
			<footer class="divider h-fit text-lg font-bold ${this.color === Theme.Color.PRIMARY ? 'divider-primary' : this.color === Theme.Color.SECONDARY ? 'divider-secondary' : 'divider-accent'}">
				<drop-down
					.showdropdowncontent=${this._showMultipleEntryBottomMenu}
					@drop-down:showdropdowncontentupdate=${(e: CustomEvent) => {
						this._showMultipleEntryBottomMenu = e.detail.value
					}}
				>
					<button
						slot="header"
						class="btn h-fit min-h-fit w-fit min-w-fit flex ${this.color === Theme.Color.PRIMARY ? 'btn-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'btn-secondary text-secondary-content' : 'btn-accent text-accent-content'}"
						@click=${() => (this._showMultipleEntryBottomMenu = !this._showMultipleEntryBottomMenu)}
					>
						<div class="self-center">End of ${MetadataModel.GetFieldGroupName(this.group)}</div>
						<div class="self-center rounded-md shadow-inner ${this.color === Theme.Color.PRIMARY ? 'shadow-primary-content' : this.color === Theme.Color.SECONDARY ? 'shadow-secondary-content' : 'shadow-accent-content'} p-2">${this._totalNoOfRows}</div>
						<div class="self-center w-fit h-fit">
							<!--mdi:arrow-up source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24"><path fill="${Theme.GetColorContent(this.color)}" d="M13 20h-2V8l-5.5 5.5l-1.42-1.42L12 4.16l7.92 7.92l-1.42 1.42L13 8z" /></svg>
						</div>
					</button>
					<div slot="content" class="flex flex-col space-y-1 w-fit bg-white p-1 rounded-md shadow-sm shadow-gray-800 text-black min-w-[200px]">${this._multipleEntryFormMenuHtmlTemplate()}</div>
				</drop-down>
			</footer>
		`
	}
}

@customElement('metadata-model-datum-input-view-form-group-fields')
class ComponentGroupFields extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentGroupFields)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: Object }) group: any = {}
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ type: String }) color!: Theme.Color
	@property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
	@property({ attribute: false }) getdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
	@property({ attribute: false }) updatedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
	@property({ attribute: false }) deletedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ type: String }) copiedcutfieldgroupkey: string = ''
	@property({ attribute: false }) setcopiedfieldgroupkey!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ attribute: false }) setcutfieldgroupdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ attribute: false }) pastefieldgroupdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void
	@property({ type: Number }) scrollelementheight!: number
	@property({ type: Number }) basestickytop: number = 0

	@state() private _totalNoOfColumns: number = 1

	@state() private _viewJsonOutput: string = ''

	@state() private _groupFieldHeaderHeight: number[] = []

	private _groupFieldHtmlTemplate(groupFieldIndex: number) {
		const fieldGroup = this.group[MetadataModel.FgProperties.GROUP_FIELDS][0][this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS][groupFieldIndex]]

		if (!MetadataModel.IsGroupFieldsValid(fieldGroup)) {
			return html`<div class="h-fit w-full text-error mt-4 mb-4">fieldGroup not valid</div>`
		}

		if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
			return html`<div class="h-fit w-full"></div>`
		}

		if (typeof fieldGroup === 'object' && !Array.isArray(fieldGroup)) {
			if (Array.isArray(fieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
				if (fieldGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
					return html`
						<div class="z-[1] min-w-fit min-h-fit mt-4 mb-4">
							<metadata-model-datum-input-view-table
								class="w-full h-fit"
								.scrollelement=${this.scrollelement}
								.group=${fieldGroup}
								.color=${this.color}
								.arrayindexplaceholders=${this.arrayindexplaceholders}
								.updatemetadatamodel=${this.updatemetadatamodel}
								.getdata=${this.getdata}
								.updatedata=${this.updatedata}
								.deletedata=${this.deletedata}
								.totalnoofrows=${1}
								.basestickytop=${this.basestickytop}
							></metadata-model-datum-input-view-table>
						</div>
					`
				}

				if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 1) {
					return html`
						<div class="flex flex-col min-w-fit min-h-fit mt-4 mb-4">
							<metadata-model-datum-input-header
								class="sticky z-[2] w-full ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}"
								style="top: ${this.basestickytop}px;"
								.group=${fieldGroup}
								.color=${this.color}
								.viewjsonoutput=${this._viewJsonOutput === fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]}
								.updateviewjsonoutput=${(newValue: boolean) => (this._viewJsonOutput = newValue ? fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] : '')}
								.arrayindexplaceholders=${this.arrayindexplaceholders}
								.updatemetadatamodel=${this.updatemetadatamodel}
								.deletedata=${this.deletedata}
								.headerheightupdate=${(newheight: number) => {
									this._groupFieldHeaderHeight = structuredClone(Json.SetValueInObject(this._groupFieldHeaderHeight, `$.${groupFieldIndex}`, newheight))
								}}
							></metadata-model-datum-input-header>
							<main
								class="z-[1] ${(this._viewJsonOutput !== fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] && !fieldGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW]) || fieldGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.FORM
									? 'shadow-inner shadow-gray-800 pl-2 pr-2 pb-2'
									: ''}"
							>
								${(() => {
									if (this._viewJsonOutput === fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
										const jsonData = this.getdata(fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)

										return html`<pre class="flex-1 bg-gray-700 text-white w-full h-fit max-h-[80vh] overflow-auto shadow-inner shadow-gray-800 p-1"><code>${JSON.stringify(jsonData, null, 4)}</code></pre>`
									}

									return html`
										<metadata-model-datum-input-view-form
											.scrollelement=${this.scrollelement}
											.group=${fieldGroup}
											.color=${this.color}
											.arrayindexplaceholders=${this.arrayindexplaceholders}
											.updatemetadatamodel=${this.updatemetadatamodel}
											.getdata=${this.getdata}
											.updatedata=${this.updatedata}
											.deletedata=${this.deletedata}
											.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
											.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
											.setcutfieldgroupdata=${this.setcutfieldgroupdata}
											.pastefieldgroupdata=${this.pastefieldgroupdata}
											.scrollelementheight=${this.scrollelementheight}
											.basestickytop=${this.basestickytop + (this._groupFieldHeaderHeight[groupFieldIndex] ? this._groupFieldHeaderHeight[groupFieldIndex] : 0)}
										></metadata-model-datum-input-view-form>
									`
								})()}
							</main>
						</div>
					`
				}

				return html`
					<metadata-model-datum-input-view-form
						class="mt-4 mb-4"
						.scrollelement=${this.scrollelement}
						.group=${fieldGroup}
						.color=${this.color}
						.arrayindexplaceholders=${this.arrayindexplaceholders}
						.updatemetadatamodel=${this.updatemetadatamodel}
						.getdata=${this.getdata}
						.updatedata=${this.updatedata}
						.deletedata=${this.deletedata}
						.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
						.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
						.setcutfieldgroupdata=${this.setcutfieldgroupdata}
						.pastefieldgroupdata=${this.pastefieldgroupdata}
						.scrollelementheight=${this.scrollelementheight}
						.basestickytop=${this.basestickytop}
					></metadata-model-datum-input-view-form>
				`
			}

			return html`
				<metadata-model-datum-input-column-field
					class="rounded-md"
					.field=${fieldGroup}
					.arrayindexplaceholders=${this.arrayindexplaceholders}
					.color=${this.color}
					.updatemetadatamodel=${this.updatemetadatamodel}
					.getdata=${this.getdata}
					.updatedata=${this.updatedata}
					.deletedata=${this.deletedata}
					.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
					.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
					.setcutfieldgroupdata=${this.setcutfieldgroupdata}
					.pastefieldgroupdata=${this.pastefieldgroupdata}
				></metadata-model-datum-input-column-field>
			`
		}

		return html`<div class="w-full text-center text-error font-bold">...field/group is invalid...</div>`
	}

	connectedCallback(): void {
		super.connectedCallback()
		if (Array.isArray(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) && Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS]) && typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0] === 'object') {
			this._totalNoOfColumns = this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS].length
		}
	}

	protected render(): unknown {
		if (!Array.isArray(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) || !Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS]) || typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0] !== 'object') {
			return html`<div class="w-full h-fit text-lg text-error font-bold">...group is not valid...</div>`
		}

		return html`
			<virtual-flex-scroll
				.scrollelement=${this.scrollelement}
				.data=${(() => {
					let data: number[] = []

					for (let dIndex = 0; dIndex < this._totalNoOfColumns; dIndex++) {
						data.push(dIndex)
					}

					return data
				})()}
				.foreachrowrender=${(datum: number, _: number) => {
					return this._groupFieldHtmlTemplate(datum)
				}}
				.enablescrollintoview=${false}
			></virtual-flex-scroll>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-view-form': Component
		'metadata-model-datum-input-view-form-group-fields': ComponentGroupFields
	}
}
