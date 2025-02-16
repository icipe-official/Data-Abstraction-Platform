import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'

@customElement('metadata-model-datum-input-column-field-number')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) field: any = {}
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ type: String }) color!: Theme.Color
	@property({ attribute: false }) getdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
	@property({ attribute: false }) updatedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
	@property({ attribute: false }) deletedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void

	protected render(): unknown {
		if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
			const fieldGroupName = MetadataModel.GetFieldGroupName(this.field)
			return html`
				<input
					class="flex-1 w-full min-w-[200px] input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
					type="number"
					.placeholder=${this.field[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || `Enter ${fieldGroupName}...`}
					.value=${(() => {
						const fielddata = this.getdata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders)
						if (typeof fielddata === 'number') {
							return `${fielddata}`
						}
						return ''
					})()}
					@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						if (e.currentTarget.value.length > 0) {
							if (!Number.isNaN(e.currentTarget.value)) {
								this.updatedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders, Number(e.currentTarget.value))
							} else {
								this.deletedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders)
							}
						} else {
							this.deletedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders)
						}
					}}
				/>
			`
		}
		return html`<div class="text-error">...field key is not valid...</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-column-field-number': Component
	}
}
