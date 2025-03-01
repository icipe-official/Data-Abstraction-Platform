import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '@lib/theme'
import MetadataModel from '@lib/metadata_model'

@customElement('metadata-model-datum-input-column-field-text')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) field: any = {}
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ type: String }) color!: Theme.Color
	@property({ attribute: false }) getdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
	@property({ attribute: false }) updatedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void
	@property({ attribute: false }) deletedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => void

	private _handleInputValue(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		if (e.currentTarget.value.length > 0) {
			this.updatedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders, e.currentTarget.value)
		} else {
			this.deletedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders)
		}
	}

	protected render(): unknown {
		if (typeof this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
			const fieldGroupName = MetadataModel.GetFieldGroupName(this.field)
			switch (this.field[MetadataModel.FgProperties.FIELD_UI] as MetadataModel.FieldUi) {
				case MetadataModel.FieldUi.TEXT:
					return html`
						<input
							class="flex-1 w-full min-w-[200px] input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : 'input-accent'}"
							type="text"
							.placeholder=${this.field[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || `Enter ${fieldGroupName}...`}
							.value=${this.getdata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders) || ''}
							@input=${this._handleInputValue}
						/>
					`
				case MetadataModel.FieldUi.TEXTAREA:
					return html`
						<textarea
							class="flex-1 w-full min-w-[250px] textarea ${this.color === Theme.Color.PRIMARY ? 'textarea-primary' : this.color === Theme.Color.SECONDARY ? 'textarea-secondary' : 'textarea-accent'}"
							.placeholder=${this.field[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || `Enter ${fieldGroupName}...`}
							.value=${this.getdata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders) || ''}
							@input=${this._handleInputValue}
						></textarea>
					`
				default:
					return html`<div class="text-error">...field ui is not supported...</div>`
			}
		}

		return html`<div class="text-error">...field key is not valid...</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-column-field-text': Component
	}
}
