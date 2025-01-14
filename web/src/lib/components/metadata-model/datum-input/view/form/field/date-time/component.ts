import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import '$src/lib/components/calendar-time/component'

@customElement('metadata-model-datum-input-form-field-date-time')
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
					<div class="flex flex-col w-full rounded-md ${this.color === Theme.Color.PRIMARY ? 'bg-primary' : this.color === Theme.Color.SECONDARY ? 'bg-secondary' : 'bg-accent'}">
						<calendar-time
							class="flex-1 min-w-[200px]"
							.color=${this.color}
							.datetimeinputformat=${this.field[MetadataModel.FgProperties.FIELD_DATETIME_FORMAT] || MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM}
							.value=${this.getdata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders) || ''}
							@calendar-time:datetimeupdate=${(e: CustomEvent) => {
								if (e.detail.value.length > 0) {
									this.updatedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders, e.detail.value)
								} else {
									this.deletedata(`${this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY]}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}`, this.arrayindexplaceholders)
								}
							}}
						></calendar-time>
					</div>
				`
			}
		}
		return html`<div class="text-error">...field is not valid...</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-form-field-date-time': Component
	}
}
