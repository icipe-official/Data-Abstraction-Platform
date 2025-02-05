import Theme from '$src/lib/theme'
import { LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('metadata-model-view-table')
class Component extends LitElement {
	@property({ type: Object }) metadatamodel: any = {}
	@property({ type: String }) startcolor: Theme.Color = Theme.Color.PRIMARY
	@property({ type: Array }) data: any[] = []
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-view-table': Component
	}
}
