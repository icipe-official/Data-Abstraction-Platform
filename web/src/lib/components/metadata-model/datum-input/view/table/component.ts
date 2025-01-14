import { html, LitElement, unsafeCSS } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import Json from '$src/lib/json'

@customElement('metadata-model-datum-input-view-table')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: Object }) group: any = {}
	@property({ type: Array }) arrayindexplaceholders: number[] = []
	@property({ type: String }) color!: Theme.Color
	@property({ attribute: false }) updatemetadatamodel!: (fieldGroup: any) => void
	@property({ attribute: false }) getdata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => any
	@property({ attribute: false }) updatedata!: (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => void

	protected render(): unknown {
		try {
			let extract2DFields = new MetadataModel.Extract2DFields(this.group)
			extract2DFields.Extract()

			let data = []
			for (let r = 0; r < 10; r++) {
				data.push([])
				for (let c = 0; c < extract2DFields.Fields.length; c++) {
					;(data[r] as any[]).push([`${r % 2 === 0 ? 2 : 0}-${c % 3 === 0 ? `3` : 0}${c}`])
				}
			}

			console.log('Original 2D Fields', extract2DFields.Fields)
			let reorder2Dfields = new MetadataModel.Reorder2DFields(extract2DFields.Fields, extract2DFields.FieldsRepositioned)
			reorder2Dfields.Reorder(data)
			console.log('Original 2D', data)
			let array2DtoObjects = new MetadataModel.Convert2DArrayToObjects(this.group, extract2DFields.FieldsRepositioned)
			array2DtoObjects.Convert(data)
			console.log('ND', array2DtoObjects.Objects)
			let objectsToArray2D = new MetadataModel.ConvertObjectsTo2DArray(this.group, extract2DFields.FieldsRepositioned)
			objectsToArray2D.Convert(array2DtoObjects.Objects)
			console.log('2D', objectsToArray2D.Array2D)
			console.log('2D equal to original 2D', Json.AreValuesEqual(data, objectsToArray2D.Array2D))
		} catch (e) {
			console.error(e)
		}

		return html`table`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input-view-table': Component
	}
}
