import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'

@customElement('metadata-model-datum-input-form-field-checkbox')
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
			const fieldGroupName = this.field[MetadataModel.FgProperties.FIELD_GROUP_NAME] || this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY].split('.').pop()
			return html`
				<div class="h-fit self-start text-lg font-bold">${this.field[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || `Check if ${fieldGroupName}`}</div>
				<i class="h-fit self-start text-lg font-bold">
					(${(() => {
						const fieldDatum = this.getdata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders)

						if (typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] === 'object' && typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined') {
							if (fieldDatum === this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]) {
								return fieldDatum
							}
						}

						if (typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] === 'object' && typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined') {
							if (fieldDatum === this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]) {
								return fieldDatum
							}
						}

						if (typeof fieldDatum === 'boolean') {
							return fieldDatum
						}

						return 'not set'
					})()})
				</i>
				<div class="h-fit self-start">:</div>
				<input
					class="self-start checkbox ${this.color === Theme.Color.PRIMARY ? 'checkbox-primary' : this.color === Theme.Color.SECONDARY ? 'checkbox-secondary' : 'checkbox-accent'}"
					type="checkbox"
					.checked=${(() => {
						const fieldDatum = this.getdata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders)
						if (typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] === 'object' && typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined') {
							if (fieldDatum === this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]) {
								return true
							}
						}

						if (typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] === 'object' && typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined') {
							if (fieldDatum === this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]) {
								return false
							}
						}

						if (typeof fieldDatum === 'boolean') {
							return fieldDatum
						}

						return false
					})()}
					@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
						let valueToSet = e.currentTarget.checked
						if (typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUES_USE_IN_STORAGE] === 'boolean' && this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUES_USE_IN_STORAGE]) {
							if (e.currentTarget.checked) {
								if (typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE] === 'object' && typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined') {
									valueToSet = this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_TRUE][MetadataModel.FieldCheckboxValueProperties.VALUE]
								}
							} else {
								if (typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE] === 'object' && typeof this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE] !== 'undefined') {
									valueToSet = this.field[MetadataModel.FgProperties.FIELD_CHECKBOX_VALUE_IF_FALSE][MetadataModel.FieldCheckboxValueProperties.VALUE]
								}
							}
						}
						this.updatedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders, valueToSet)
					}}
				/>
			`
		} else {
			return html`<div class="text-error">...field key is not valid...</div>`
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-form-field-checkbox': Component
	}
}
