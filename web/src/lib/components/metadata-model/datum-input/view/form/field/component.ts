import { html, LitElement, nothing, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '@lib/theme'
import MetadataModel from '@lib/metadata_model'
import '../../column-field/text/component'
import '../../column-field/number/component'
import '../../column-field/checkbox/component'
import '../../column-field/date-time/component'
import '../../column-field/select/component'
import '@lib/components/drop-down/component'

@customElement('metadata-model-datum-input-column-field')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) field: any = {}
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

	@state() private _viewJsonOutput: boolean = false

	@state() private _showDescription: boolean = false

	@state() private _showMenuContent: boolean = false

	@state() private _showIndividualFieldMenuContentID: string = ''

	private _inputFieldHtmlTemplate(rowIndex: number) {
		switch (this.field[MetadataModel.FgProperties.FIELD_UI] as MetadataModel.FieldUi) {
			case MetadataModel.FieldUi.TEXT:
			case MetadataModel.FieldUi.TEXTAREA:
				return html`
					<metadata-model-datum-input-column-field-text
						.color=${this.color}
						.field=${this.field}
						.arrayindexplaceholders=${[...this.arrayindexplaceholders, rowIndex]}
						.getdata=${this.getdata}
						.deletedata=${this.deletedata}
						.updatedata=${this.updatedata}
					></metadata-model-datum-input-column-field-text>
				`
			case MetadataModel.FieldUi.NUMBER:
				return html`
					<metadata-model-datum-input-column-field-number
						.color=${this.color}
						.field=${this.field}
						.arrayindexplaceholders=${[...this.arrayindexplaceholders, rowIndex]}
						.getdata=${this.getdata}
						.deletedata=${this.deletedata}
						.updatedata=${this.updatedata}
					></metadata-model-datum-input-column-field-number>
				`
			case MetadataModel.FieldUi.CHECKBOX:
				return html`
					<metadata-model-datum-input-column-field-checkbox
						.color=${this.color}
						.field=${this.field}
						.arrayindexplaceholders=${[...this.arrayindexplaceholders, rowIndex]}
						.getdata=${this.getdata}
						.deletedata=${this.deletedata}
						.updatedata=${this.updatedata}
					></metadata-model-datum-input-column-field-checkbox>
				`
			case MetadataModel.FieldUi.DATETIME:
				return html`
					<metadata-model-datum-input-column-field-date-time
						.color=${this.color}
						.field=${this.field}
						.arrayindexplaceholders=${[...this.arrayindexplaceholders, rowIndex]}
						.getdata=${this.getdata}
						.deletedata=${this.deletedata}
						.updatedata=${this.updatedata}
					></metadata-model-datum-input-column-field-date-time>
				`
			default:
				return html`<div class="text-error">...field ui is not valid/supported...</div>`
		}
	}

	connectedCallback(): void {
		super.connectedCallback()
		const fieldData = this.getdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
		if (Array.isArray(fieldData) && (fieldData as any[]).length > 1) {
			this._totalNoOfRows = (fieldData as any[]).length
		}
	}

	protected render(): unknown {
		return html`
			<drop-down
				.showdropdowncontent=${this._showMenuContent}
				@drop-down:showdropdowncontentupdate=${(e: CustomEvent) => {
					this._showMenuContent = e.detail.value
				}}
			>
				<button slot="header" class="btn btn-circle btn-sm btn-ghost self-start" @click=${() => (this._showMenuContent = !this._showMenuContent)}>
					<!--mdi:dots-vertical source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path fill="black" d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2" />
					</svg>
				</button>
				<div slot="content" class="flex flex-col w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 min-w-[200px]">
					<button
						class="btn btn-ghost p-1 w-full justify-start"
						@click=${() => {
							this.deletedata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
							this._totalNoOfRows = 1
						}}
					>
						<div class="flex self-center">
							<!--mdi:delete-empty source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="30" height="32" viewBox="0 0 24 24"><path fill="black" d="m20.37 8.91l-1 1.73l-12.13-7l1-1.73l3.04 1.75l1.36-.37l4.33 2.5l.37 1.37zM6 19V7h5.07L18 11v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2" /></svg>
						</div>
						<div class="self-center font-bold">delete data</div>
					</button>
					<button class="btn btn-ghost p-1 w-full justify-start" @click=${() => (this._viewJsonOutput = !this._viewJsonOutput)}>
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
					</button>
					${(() => {
						if (this.copiedcutfieldgroupkey !== this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
							return html`
								<button
									class="btn btn-ghost p-1 w-full justify-start"
									@click=${() => {
										this.setcopiedfieldgroupkey(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
									}}
								>
									<div class="flex self-center">
										<!--mdi:content-copy source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="black" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z" /></svg>
									</div>
									<div class="self-center font-bold">copy data</div>
								</button>
								<button
									class="btn btn-ghost p-1 w-full justify-start"
									@click=${() => {
										this.setcutfieldgroupdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
									}}
								>
									<div class="flex self-center">
										<!--mdi:content-cut source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path
												fill="black"
												d="m19 3l-6 6l2 2l7-7V3m-10 9.5a.5.5 0 0 1-.5-.5a.5.5 0 0 1 .5-.5a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5M6 20a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2M6 8a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2m3.64-.36c.23-.5.36-1.05.36-1.64a4 4 0 0 0-4-4a4 4 0 0 0-4 4a4 4 0 0 0 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1z"
											/>
										</svg>
									</div>
									<div class="self-center font-bold">cut data</div>
								</button>
							`
						} else {
							return nothing
						}
					})()}
				</div>
			</drop-down>
			<header class="flex flex-col">
				<div class="flex space-x-1 h-full">
					<div class="w-full flex h-fit self-center">${MetadataModel.GetFieldGroupName(this.field)}</div>
					${(() => {
						if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] === 'string' && (this.field[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION] as string).length > 0) {
							return html`
								<button
									class="btn btn-circle btn-sm btn-ghost self-start"
									@click=${() => {
										this._showDescription = !this._showDescription
									}}
								>
									<!--mdi:question-mark-circle source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
										<path
											fill="black"
											d="m15.07 11.25l-.9.92C13.45 12.89 13 13.5 13 15h-2v-.5c0-1.11.45-2.11 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41a2 2 0 0 0-2-2a2 2 0 0 0-2 2H8a4 4 0 0 1 4-4a4 4 0 0 1 4 4a3.2 3.2 0 0 1-.93 2.25M13 19h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
										/>
									</svg>
								</button>
							`
						}

						return nothing
					})()}
					${(() => {
						if (this.copiedcutfieldgroupkey.length > 0 && this.copiedcutfieldgroupkey === this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
							return html`
								<button
									class="btn btn-circle btn-sm btn-ghost self-start"
									@click=${() => {
										this.pastefieldgroupdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
									}}
								>
									<!--mdi:content-paste source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
										<path fill="black" d="M19 20H5V4h2v3h10V4h2m-7-2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m7 0h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2" />
									</svg>
								</button>
							`
						} else {
							return nothing
						}
					})()}
					${(() => {
						if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number' && this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] !== 1 && this.field[MetadataModel.FgProperties.FIELD_UI] !== MetadataModel.FieldUi.SELECT) {
							return html`
								<button
									class="btn btn-circle btn-sm btn-ghost self-start"
									@click=${() => {
										if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number') {
											if (this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] < 1) {
												this._totalNoOfRows += 1
											} else {
												if (this._totalNoOfRows < this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]) {
													this._totalNoOfRows += 1
												}
											}
										} else {
											this._totalNoOfRows += 1
										}
									}}
									.disabled=${typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 'number' && this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] > 1 && this._totalNoOfRows >= this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]}
								>
									<!--mdi:plus-circle source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="black" d="M17 13h-4v4h-2v-4H7v-2h4V7h2v4h4m-5-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2" /></svg>
								</button>
							`
						} else {
							return nothing
						}
					})()}
				</div>
				<div class="relative w-full">
					${(() => {
						if (this._showDescription) {
							return html` <div class="absolute top-0 flex flex-col w-full bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black text-sm max-h-[80vh] overflow-auto">${this.field[MetadataModel.FgProperties.FIELD_GROUP_DESCRIPTION]}</div> `
						}

						return nothing
					})()}
				</div>
			</header>
			${(() => {
				if (this._viewJsonOutput) {
					const jsonData = this.getdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)

					return html`
						<div class="w-full h-full"></div>
						<pre class="flex-1 bg-gray-700 text-white lg:max-w-[50vw] w-full h-fit max-h-[80vh] overflow-auto shadow-inner shadow-gray-800 p-1 rounded-md"><code>${JSON.stringify(jsonData, null, 4)}</code></pre>
					`
				}

				if (this.field[MetadataModel.FgProperties.FIELD_UI] === MetadataModel.FieldUi.SELECT) {
					return html`
						<div class="w-full h-full"></div>
						<metadata-model-datum-input-column-field-select .color=${this.color} .field=${this.field} .arrayindexplaceholders=${this.arrayindexplaceholders} .getdata=${this.getdata} .deletedata=${this.deletedata} .updatedata=${this.updatedata}></metadata-model-datum-input-column-field-select>
					`
				}

				if (this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] === 1) {
					return html`
						<div class="w-full h-full"></div>
						${this._inputFieldHtmlTemplate(0)}
					`
				}

				let templates: TemplateResult<1>[] = []

				for (let rowIndex = 0; rowIndex < this._totalNoOfRows; rowIndex++) {
					if (typeof this.field[MetadataModel.FgProperties.FIELD_UI] === 'string' && (this.field[MetadataModel.FgProperties.FIELD_UI] as string).length > 0) {
						templates.push(html`
							<div class="w-full h-full"></div>
							<div class="flex space-x-1 mb-1">
								<div class="font-bold text-lg h-full self-start">${rowIndex + 1}</div>
								${this._inputFieldHtmlTemplate(rowIndex)}
								${(() => {
									if (this.copiedcutfieldgroupkey.length > 0 && this.copiedcutfieldgroupkey === `${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`) {
										return html`
											<button
												class="self-end btn rounded-none ${this.color === Theme.Color.ACCENT ? 'btn-primary' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : 'btn-accent'} p-1"
												@click=${() => {
													this.pastefieldgroupdata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
												}}
											>
												<!--mdi:content-paste source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path
														fill="${this.color === Theme.Color.ACCENT ? Theme.Color.PRIMARY_CONTENT : this.color === Theme.Color.PRIMARY ? Theme.Color.SECONDARY_CONTENT : Theme.Color.ACCENT_CONTENT}"
														d="M19 20H5V4h2v3h10V4h2m-7-2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1m7 0h-4.18C14.4.84 13.3 0 12 0S9.6.84 9.18 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2"
													/>
												</svg>
											</button>
										`
									} else {
										return nothing
									}
								})()}
								<drop-down
									.showdropdowncontent=${this._showIndividualFieldMenuContentID === `${rowIndex}`}
									@drop-down:showdropdowncontentupdate=${(e: CustomEvent) => {
										this._showIndividualFieldMenuContentID = e.detail.value ? `${rowIndex}` : ''
									}}
								>
									<button
										slot="header"
										class="btn btn-circle btn-xs btn-ghost self-start"
										@click=${() => {
											this._showIndividualFieldMenuContentID = this._showIndividualFieldMenuContentID === `${rowIndex}` ? '' : `${rowIndex}`
										}}
									>
										<!--mdi:dots-vertical source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
											<path fill="black" d="M12 16a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m0-6a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2" />
										</svg>
									</button>
									<div slot="content" class="flex flex-col w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 min-w-[200px]">
										<button
											class="btn btn-ghost p-1 w-full justify-end"
											@click=${() => {
												this.setcopiedfieldgroupkey(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
											}}
										>
											<div class="self-center font-bold">Copy field data</div>
											<div class="flex self-center">
												<!--mdi:content-copy source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="black" d="M19 21H8V7h11m0-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2m-3-4H4a2 2 0 0 0-2 2v14h2V3h12z" /></svg>
											</div>
										</button>
										<button
											class="btn btn-ghost p-1 w-full justify-end"
											@click=${() => {
												this.setcutfieldgroupdata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
											}}
										>
											<div class="self-center font-bold">Cut field data</div>
											<div class="flex self-center">
												<!--mdi:content-cut source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path
														fill="black"
														d="m19 3l-6 6l2 2l7-7V3m-10 9.5a.5.5 0 0 1-.5-.5a.5.5 0 0 1 .5-.5a.5.5 0 0 1 .5.5a.5.5 0 0 1-.5.5M6 20a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2M6 8a2 2 0 0 1-2-2a2 2 0 0 1 2-2a2 2 0 0 1 2 2a2 2 0 0 1-2 2m3.64-.36c.23-.5.36-1.05.36-1.64a4 4 0 0 0-4-4a4 4 0 0 0-4 4a4 4 0 0 0 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14a4 4 0 0 0-4 4a4 4 0 0 0 4 4a4 4 0 0 0 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1z"
													/>
												</svg>
											</div>
										</button>
										<button
											class="btn btn-ghost p-1 w-full justify-end"
											@click=${() => {
												this.deletedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, [...this.arrayindexplaceholders, rowIndex])
												if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
													const fieldData = this.getdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
													if (Array.isArray(fieldData)) {
														if ((fieldData as any[]).length !== 0) {
															this._totalNoOfRows = (fieldData as any[]).length
															for (const fd of fieldData) {
																if (fd) {
																	return
																}
															}
														}
														this.deletedata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
													} else {
														if (this._totalNoOfRows - 1 !== 0) {
															this._totalNoOfRows -= 1
														}
													}
												}
											}}
										>
											<div class="self-center font-bold">Delete field data</div>
											<div class="flex self-center">
												<!--mdi:delete source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="black" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
											</div>
										</button>
									</div>
								</drop-down>
							</div>
						`)

						continue
					}

					templates.push(html`<div class="text-error">...field ui is not valid...</div>`)
				}

				return templates
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-column-field': Component
	}
}
