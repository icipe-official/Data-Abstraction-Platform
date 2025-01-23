import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import componentGroupFields from './component.groupfields.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import Misc from '$src/lib/miscellaneous'
import './field/component'
import '../../header/component'
import '../table/component'
import '$src/lib/components/vertical-flex-scroll/component'

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

	@state() private _totalNoOfRows: number = 1

	@state() private _showDescription: string = ''

	private _getGroupName() {
		if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME] as string).length > 0) {
			return this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME]
		}

		return 'Data Field'
	}

	@state() private _viewJsonOutput: boolean = false

	@state() private _showTopMultipleEntryMenu: boolean = false

	@state() private _showBottomMultipleEntryMenu: boolean = false

	@state() private _showRowMenuID: string = ''

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
				<div class="flex self-center">
					<iconify-icon icon="mdi:plus-bold" style="color: black;" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('30')}></iconify-icon>
				</div>
				<div class="self-center font-bold">Add new ${this._getGroupName()}</div>
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
				<div class="flex self-center">
					<iconify-icon icon=${this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE ? 'mdi:table-large' : 'mdi:form'} style="color: black;" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('32')}></iconify-icon>
				</div>
				<div class="self-center font-bold">Data input view</div>
			</button>
			<button
				class="btn btn-ghost p-1 w-full justify-start"
				@click=${() => {
					this.deletedata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
					this._totalNoOfRows = 1
				}}
			>
				<div class="flex self-center">
					<iconify-icon icon="mdi:delete-empty" style="color: black;" width=${Misc.IconifySize('28')} height=${Misc.IconifySize('30')}></iconify-icon>
				</div>
				<div class="self-center font-bold">Delete all ${this._getGroupName()}</div>
			</button>
			<button class="btn btn-ghost p-1 w-full justify-start" @click=${() => (this._viewJsonOutput = !this._viewJsonOutput)}>
				<div class="flex flex-col justify-center">
					<div class="flex self-center">
						<iconify-icon icon="mdi:code-json" style="color: black;" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('20')}></iconify-icon>
						${(() => {
							if (this._viewJsonOutput) {
								return html` <iconify-icon icon="mdi:close-circle" style="color: black;" width=${Misc.IconifySize('10')} height=${Misc.IconifySize('10')}></iconify-icon> `
							} else {
								return nothing
							}
						})()}
					</div>
				</div>
				<div class="self-center font-bold">view json data</div>
			</button>
		`
	}

	connectedCallback(): void {
		super.connectedCallback()
		const groupData = this.getdata(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
		if (Array.isArray(groupData) && (groupData as any[]).length > 1) {
			this._totalNoOfRows = (groupData as any[]).length
		}
	}

	private _headerHtmlTemplate(rowIndex: number) {
		return html`
			<header class="sticky top-0 z-[200] flex flex-col space-y-1 p-1 w-full rounded-t-md ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}">
				<section class="flex justify-between">
					<section class="flex space-x-1 h-fit self-center sticky left-0">
						<button
							class="btn btn-circle btn-sm btn-ghost self-start"
							@click=${() => {
								if (this._showRowMenuID === `${rowIndex}`) {
									this._showRowMenuID = ''
								} else {
									this._showRowMenuID = `${rowIndex}`
								}
							}}
						>
							<iconify-icon
								icon="mdi:dots-vertical"
								style="color:${Theme.GetColorContent(this.color)};"
								width=${Misc.IconifySize()}
								height=${Misc.IconifySize()}
							></iconify-icon>
						</button>
						<div class="flex-[9] break-words text-md font-bold h-fit self-center">${this._getGroupName()} #${rowIndex + 1}</div>
						${(() => {
							if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0) {
								return html`
									<button
										class="ml-2 btn btn-circle btn-sm btn-ghost self-start"
										@click=${() => {
											if (this._showDescription === `${rowIndex}`) {
												this._showDescription = ''
												return
											}
											this._showDescription = `${rowIndex}`
										}}
									>
										<iconify-icon
											icon="mdi:question-mark-circle"
											style="color:${Theme.GetColorContent(this.color)};"
											width=${Misc.IconifySize()}
											height=${Misc.IconifySize()}
										></iconify-icon>
									</button>
								`
							}

							return nothing
						})()}
					</section>
					<div class="join sticky right-0">
						${(() => {
							const groupKey = `${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`
							if (this.copiedcutfieldgroupkey.length > 0 && this.copiedcutfieldgroupkey === groupKey) {
								return html`
									<button
										class="join-item btn btn-ghost p-1"
										@click=${() => {
											this.pastefieldgroupdata(groupKey, [...this.arrayindexplaceholders, rowIndex])
										}}
									>
										<iconify-icon
											icon="mdi:content-paste"
											style="color:${Theme.GetColorContent(this.color)};"
											width=${Misc.IconifySize()}
											height=${Misc.IconifySize()}
										></iconify-icon>
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
							<iconify-icon
								icon="mdi:plus-bold"
								style="color:${Theme.GetColorContent(this.color)};"
								width=${Misc.IconifySize('30')}
								height=${Misc.IconifySize('32')}
							></iconify-icon>
						</button>
					</div>
				</section>
				${(() => {
					if (typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0 && this._showDescription) {
						return html` <div class="w-full overflow-auto max-h-[100px] flex flex-wrap text-sm">${this.group[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}</div> `
					}

					return nothing
				})()}
			</header>
			<div class="sticky top-[48px] z-[1000]">
				<div class="relative w-fit">
					${(() => {
						if (this._showRowMenuID === `${rowIndex}`) {
							return html`
								<div class="absolute top-0 flex flex-col w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 min-w-[200px]">
									<button
										class="btn btn-ghost p-1 w-full justify-start"
										@click=${() => {
											this.deletedata(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}[${rowIndex}]`, this.arrayindexplaceholders)
											if (this._totalNoOfRows - 1 >= 0) {
												this._totalNoOfRows -= 1
											}
										}}
									>
										<div class="flex self-center">
											<iconify-icon icon="mdi:delete-empty" style="color: black;" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('32')}></iconify-icon>
										</div>
										<div class="self-center font-bold break-words">delete data for #${rowIndex + 1}</div>
									</button>
									<button
										class="btn btn-ghost p-1 w-full justify-start"
										@click=${() => {
											this.setcopiedfieldgroupkey(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
										}}
									>
										<div class="flex self-center">
											<iconify-icon icon="mdi:content-copy" style="color:black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
										</div>
										<div class="self-center font-bold">copy data</div>
									</button>
									<button
										class="btn btn-ghost p-1 w-full justify-start"
										@click=${() => {
											this.setcutfieldgroupdata(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
										}}
									>
										<div class="flex self-center">
											<iconify-icon icon="mdi:content-cut" style="color:black;" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
										</div>
										<div class="self-center font-bold">cut data</div>
									</button>
									${this._multipleEntryFormMenuHtmlTemplate()}
								</div>
							`
						}

						return nothing
					})()}
				</div>
			</div>
		`
	}

	protected render(): unknown {
		if (!Array.isArray(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) || !Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS]) || typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0] !== 'object') {
			return html`<div class="w-full h-fit text-lg text-error font-bold">...group is not valid...</div>`
		}

		if (this.group[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 1) {
			return html`
				<metadata-model-datum-input-view-form-group-fields
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
				></metadata-model-datum-input-view-form-group-fields>
			`
		}

		return html`
			<header class="divider h-fit text-lg font-bold ${this.color === Theme.Color.PRIMARY ? 'divider-primary' : this.color === Theme.Color.SECONDARY ? 'divider-secondary' : 'divider-accent'}">
				<button
					class="btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'btn-secondary text-secondary-content' : 'btn-accent text-accent-content'}"
					@click=${() => (this._showTopMultipleEntryMenu = !this._showTopMultipleEntryMenu)}
				>
					<div class="self-center">Start of ${this._getGroupName()}</div>
					<div class="self-center rounded-md shadow-inner ${this.color === Theme.Color.PRIMARY ? 'shadow-primary-content' : this.color === Theme.Color.SECONDARY ? 'shadow-secondary-content' : 'shadow-accent-content'} p-2">${this._totalNoOfRows}</div>
					<div class="self-center w-fit h-fit">
						<iconify-icon
							icon=${this._showTopMultipleEntryMenu ? 'mdi:menu-up' : 'mdi:menu-down'}
							style="color:${Theme.GetColorContent(this.color)};"
							width=${Misc.IconifySize('30')}
							height=${Misc.IconifySize('32')}
						></iconify-icon>
					</div>
				</button>
			</header>
			<section class="relative w-full flex justify-center">
				${(() => {
					if (this._showTopMultipleEntryMenu) {
						return html` <div class="absolute top-0 flex flex-col space-y-1 w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black min-w-[200px] z-[500]">${this._multipleEntryFormMenuHtmlTemplate()}</div> `
					}

					return nothing
				})()}
			</section>
			<virtual-flex-scroll
				.totalnoofrows=${this._totalNoOfRows}
				.foreachrowrender=${(rowIndex: number) => {
					if (this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
						if (this._viewJsonOutput) {
							const jsonData = this.getdata(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}[${rowIndex}]`, this.arrayindexplaceholders)

							return html`
								<div class="flex flex-col min-w-fit min-h-fit mt-2 mb-2">
									${this._headerHtmlTemplate(rowIndex)}
									<pre class="flex-1 bg-gray-700 text-white w-full h-fit max-h-[80vh] overflow-auto shadow-inner shadow-gray-800 p-1 rounded-b-md"><code>${JSON.stringify(jsonData, null, 4)}</code></pre>
								</div>
							`
						}

						return html`
							<div class="min-w-fit min-h-fit mt-2 mb-2">
								<metadata-model-datum-input-view-table
									class="w-full h-fit"
									.scrollelement=${this.scrollelement}
									.group=${this.group}
									.color=${Theme.GetNextColorA(this.color)}
									.arrayindexplaceholders=${this.arrayindexplaceholders}
									.updatemetadatamodel=${this.updatemetadatamodel}
									.getdata=${this.getdata}
									.updatedata=${this.updatedata}
									.deletedata=${this.deletedata}
									.totalnoofrows=${20}
									.headerhtmltemplate=${() => {
										return this._headerHtmlTemplate(rowIndex)
									}}
								></metadata-model-datum-input-view-table>
							</div>
						`
					}

					return html`
						<div class="mt-2 mb-2">
							${this._headerHtmlTemplate(rowIndex)}
							${(() => {
								if (this._viewJsonOutput) {
									const jsonData = this.getdata(`${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}[${rowIndex}]`, this.arrayindexplaceholders)

									return html`<pre class="flex-1 bg-gray-700 text-white w-full h-fit max-h-[80vh] overflow-auto shadow-inner shadow-gray-800 p-1 rounded-b-md"><code>${JSON.stringify(jsonData, null, 4)}</code></pre>`
								}

								if (this.group[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
									return html`
										<metadata-model-datum-input-view-table
											class="w-fit h-fit"
											.scrollelement=${this.scrollelement}
											.group=${this.group}
											.arrayindexplaceholders=${this.arrayindexplaceholders}
											.grouprowindex=${rowIndex}
											.color=${Theme.GetNextColorA(this.color)}
											.updatemetadatamodel=${this.updatemetadatamodel}
											.getdata=${this.getdata}
											.updatedata=${this.updatedata}
											.deletedata=${this.deletedata}
										></metadata-model-datum-input-view-table>
									`
								}

								return html`
									<metadata-model-datum-input-view-form-group-fields
										class="rounded-b-md p-2 shadow-inner shadow-gray-800"
										.scrollelement=${this.scrollelement}
										.group=${this.group}
										.arrayindexplaceholders=${[...this.arrayindexplaceholders, rowIndex]}
										.color=${Theme.GetNextColorA(this.color)}
										.updatemetadatamodel=${this.updatemetadatamodel}
										.getdata=${this.getdata}
										.updatedata=${this.updatedata}
										.deletedata=${this.deletedata}
										.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
										.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
										.setcutfieldgroupdata=${this.setcutfieldgroupdata}
										.pastefieldgroupdata=${this.pastefieldgroupdata}
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
			<section class="relative w-full flex justify-center">
				${(() => {
					if (this._showBottomMultipleEntryMenu) {
						return html` <div class="absolute bottom-0 flex flex-col space-y-1 w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black min-w-[200px]">${this._multipleEntryFormMenuHtmlTemplate()}</div> `
					}

					return nothing
				})()}
			</section>
			<footer class="divider h-fit text-lg font-bold ${this.color === Theme.Color.PRIMARY ? 'divider-primary' : this.color === Theme.Color.SECONDARY ? 'divider-secondary' : 'divider-accent'}">
				<button
					class="btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'btn-secondary text-secondary-content' : 'btn-accent text-accent-content'}"
					@click=${() => (this._showBottomMultipleEntryMenu = !this._showBottomMultipleEntryMenu)}
				>
					<div class="self-center">End of ${this._getGroupName()}</div>
					<div class="self-center rounded-md shadow-inner ${this.color === Theme.Color.PRIMARY ? 'shadow-primary-content' : this.color === Theme.Color.SECONDARY ? 'shadow-secondary-content' : 'shadow-accent-content'} p-2">${this._totalNoOfRows}</div>
					<div class="self-center w-fit h-fit">
						<iconify-icon
							icon=${this._showBottomMultipleEntryMenu ? 'mdi:menu-down' : 'mdi:menu-up'}
							style="color:${Theme.GetColorContent(this.color)};"
							width=${Misc.IconifySize('30')}
							height=${Misc.IconifySize('32')}
						></iconify-icon>
					</div>
				</button>
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

	@state() private _totalNoOfColumns: number = 1

	@state() private _viewJsonOutput: string = ''

	private _groupFieldHtmlTemplate(groupFieldIndex: number) {
		const fieldGroup = this.group[MetadataModel.FgProperties.GROUP_FIELDS][0][this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS][groupFieldIndex]]

		if (!MetadataModel.isGroupFieldsValid(fieldGroup)) {
			return html`<div class="h-fit w-full text-error mt-4 mb-4">fieldGroup not valid</div>`
		}

		if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE]) {
			return html`<div class="h-fit w-full"></div>`
		}

		if (typeof fieldGroup === 'object' && !Array.isArray(fieldGroup)) {
			if (Array.isArray(fieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
				if (fieldGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
					if (this._viewJsonOutput === fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
						const jsonData = this.getdata(fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)

						return html`
							<div class="flex flex-col min-w-fit min-h-fit mt-4 mb-4">
								<metadata-model-datum-input-header
									class="sticky top-0 z-[200] rounded-t-md w-full ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}"
									.color=${this.color}
									.group=${fieldGroup}
									.viewjsonoutput=${this._viewJsonOutput === fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]}
									.updateviewjsonoutput=${(newValue: boolean) => (this._viewJsonOutput = newValue ? fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] : '')}
									.arrayindexplaceholders=${this.arrayindexplaceholders}
									.updatemetadatamodel=${this.updatemetadatamodel}
									.deletedata=${this.deletedata}
								></metadata-model-datum-input-header>
								<pre class="flex-1 bg-gray-700 text-white w-full h-fit max-h-[80vh] overflow-auto shadow-inner shadow-gray-800 p-1 rounded-b-md"><code>${JSON.stringify(jsonData, null, 4)}</code></pre>
							</div>
						`
					}

					return html`
						<div class="min-w-fit min-h-fit mt-4 mb-4">
							<metadata-model-datum-input-view-table
								class="w-full h-fit"
								.scrollelement=${this.scrollelement}
								.group=${fieldGroup}
								.color=${Theme.GetNextColorA(this.color)}
								.arrayindexplaceholders=${this.arrayindexplaceholders}
								.updatemetadatamodel=${this.updatemetadatamodel}
								.getdata=${this.getdata}
								.updatedata=${this.updatedata}
								.deletedata=${this.deletedata}
								.totalnoofrows=${20}
								.headerhtmltemplate=${() => {
									return html`
										<metadata-model-datum-input-header
											class="sticky top-0 z-[200] rounded-t-md w-full ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}"
											.group=${fieldGroup}
											.color=${this.color}
											.viewjsonoutput=${this._viewJsonOutput === fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]}
											.updateviewjsonoutput=${(newValue: boolean) => (this._viewJsonOutput = newValue ? fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] : '')}
											.arrayindexplaceholders=${this.arrayindexplaceholders}
											.updatemetadatamodel=${this.updatemetadatamodel}
											.deletedata=${this.deletedata}
										></metadata-model-datum-input-header>
									`
								}}
							></metadata-model-datum-input-view-table>
						</div>
					`
				}

				if (fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 1) {
					return html`
						<div class="flex flex-col min-w-fit min-h-fit mt-4 mb-4">
							<metadata-model-datum-input-header
								class="sticky top-0 z-[200] rounded-t-md w-full ${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}"
								.group=${fieldGroup}
								.color=${this.color}
								.viewjsonoutput=${this._viewJsonOutput === fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]}
								.updateviewjsonoutput=${(newValue: boolean) => (this._viewJsonOutput = newValue ? fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] : '')}
								.arrayindexplaceholders=${this.arrayindexplaceholders}
								.updatemetadatamodel=${this.updatemetadatamodel}
								.deletedata=${this.deletedata}
							></metadata-model-datum-input-header>
							<main
								class="${(this._viewJsonOutput !== fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] && !fieldGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW]) || fieldGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.FORM
									? 'shadow-inner shadow-gray-800 rounded-b-md pl-2 pr-2 pb-2'
									: ''}"
							>
								${(() => {
									if (this._viewJsonOutput === fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
										const jsonData = this.getdata(fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)

										return html`<pre class="flex-1 bg-gray-700 text-white w-full h-fit max-h-[80vh] overflow-auto shadow-inner shadow-gray-800 p-1 rounded-b-md"><code>${JSON.stringify(jsonData, null, 4)}</code></pre>`
									}

									return html`
										<metadata-model-datum-input-view-form
											.scrollelement=${this.scrollelement}
											.group=${fieldGroup}
											.color=${Theme.GetNextColorA(this.color)}
											.arrayindexplaceholders=${this.arrayindexplaceholders}
											.updatemetadatamodel=${this.updatemetadatamodel}
											.getdata=${this.getdata}
											.updatedata=${this.updatedata}
											.deletedata=${this.deletedata}
											.copiedcutfieldgroupkey=${this.copiedcutfieldgroupkey}
											.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
											.setcutfieldgroupdata=${this.setcutfieldgroupdata}
											.pastefieldgroupdata=${this.pastefieldgroupdata}
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
				.totalnoofrows=${this._totalNoOfColumns}
				.foreachrowrender=${(columnIndex: number) => {
					return this._groupFieldHtmlTemplate(columnIndex)
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
