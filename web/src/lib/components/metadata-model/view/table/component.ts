import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('metadata-model-view-table')
class Component extends LitElement {

}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-view-table': Component
	}
}
