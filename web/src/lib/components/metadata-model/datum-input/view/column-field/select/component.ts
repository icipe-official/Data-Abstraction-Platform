import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '@lib/theme'
import MetadataModel from '@lib/metadata_model'
import '@lib/components/multi-select/component'

@customElement('metadata-model-datum-input-column-field-select')
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
			if (Array.isArray(this.field[MetadataModel.FgProperties.FIELD_SELECT_OPTIONS])) {
				return html`
					<multi-select
						class="flex-1 w-full min-w-[300px]"
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
							let selectedOptions: any[] = []
							for (const so of selectOptions) {
								if ((Array.isArray(fieldDatum) && fieldDatum.includes(so.value)) || so.value === fieldDatum) {
									selectedOptions = [...selectedOptions, so]
								}
							}

							return selectedOptions.length > 0 ? selectedOptions : null
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
		'metadata-model-datum-input-column-field-select': Component
	}
}
