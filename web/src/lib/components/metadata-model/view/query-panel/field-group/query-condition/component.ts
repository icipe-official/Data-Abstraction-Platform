import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'

@customElement('metadata-model-view-query-panel-field-group-query-condition')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: String }) color!: Theme.Color
	@property({ type: Object }) fieldgroup!: any
    @property({ type: Object }) querycondition!: MetadataModel.IQueryCondition
    @property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
    @property({ attribute: false }) handleupdatefieldgroupqueryconditions!: (fieldGroupKey: string, querycondition: any) => any
    @property({ attribute: false }) handledeletefieldgroupqueryconditions!: (fieldGroupKey: string) => any

	protected render(): unknown {
		return html`<div>query condition</div>`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-view-query-panel-field-group-query-condition': Component
	}
}
