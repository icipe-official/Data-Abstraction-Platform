import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import '$src/lib/components/calendar-time/component'
import '$src/lib/components/multi-select/component'

@customElement('metadata-model-datum-input-form-field-select')
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
			if (Array.isArray(this.field[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS])) {
				return html`
					<multi-select
						class="flex-1 w-full min-w-[200px] border-2 rounded-md ${this.color === Theme.Color.PRIMARY ? 'border-primary' : this.color === Theme.Color.SECONDARY ? 'border-secondary' : 'border-accent'}"
						.placeholder=${this.field[MetadataModel.FgProperties.FIELD_PLACEHOLDER] || `Select ${fieldGroupName}...`}
						.selectoptions=${(this.field[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS] as MetadataModel.ISelectOption[]).map((fss) => {
							return {
								label: fss[MetadataModel.FSelectProperties.LABEL] as string,
								value: fss[MetadataModel.FSelectProperties.VALUE]
							}
						})}
						.selectedoptions=${(() => {
							const fieldDatum = this.getdata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
							const selectOptions = (this.field[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS] as MetadataModel.ISelectOption[]).map((fss) => {
								return {
									label: fss[MetadataModel.FSelectProperties.LABEL] as string,
									value: fss[MetadataModel.FSelectProperties.VALUE]
								}
							})
							if (Array.isArray(fieldDatum)) {
								let selectedOptions: any[] = []
								for (const so of selectOptions) {
									if (fieldDatum.includes(so.value)) {
										selectedOptions = [...selectedOptions, so]
									}
								}
								return selectedOptions
							} else {
								return null
							}
						})()}
						.multiselect=${this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] !== 1}
						.maxselectedoptions=${this.field[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES] || 0}
						.color=${this.color}
						@multi-select:updateselectedoptions=${(e: CustomEvent) => {
							if (typeof e.detail.value === 'object' && e.detail.value !== null) {
								if (Array.isArray(e.detail.value)) {
									this.updatedata(
										this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY],
										this.arrayindexplaceholders,
										(e.detail.value as { label: string; value: any }[]).map((so) => so.value)
									)
								} else {
									this.updatedata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders, [(e.detail.value as { label: string; value: any }).value])
								}
							} else {
								this.deletedata(this.field[MetadataModel.FgProperties.FIELD_GROUP_KEY], this.arrayindexplaceholders)
							}
						}}
					></multi-select>
				`
			}
		}
		return html`<div class="text-error">...field is not valid...</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-form-field-select': Component
	}
}
