import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '@lib/theme'
import MetadataModel from '@lib/metadata_model'
import '@lib/components/calendar-time/component'

@customElement('metadata-model-datum-input-column-field-date-time')
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
			if (typeof this.field[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] === 'string') {
				return html`
					<calendar-time
						class="min-w-[300px]"
						.color=${this.color}
						.datetimeinputformat=${this.field[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] || MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}
						.value=${this.getdata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders) || ''}
						@calendar-time:datetimeupdate=${(e: CustomEvent) => {
							if (e.detail.value) {
								this.updatedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders, e.detail.value)
							} else {
								this.deletedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders)
							}
						}}
					></calendar-time>
				`
			}
		}
		return html`<div class="text-error">...field is not valid...</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-column-field-date-time': Component
	}
}
