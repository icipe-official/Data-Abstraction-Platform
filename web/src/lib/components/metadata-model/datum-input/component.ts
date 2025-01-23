import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import MetadataModel from '$src/lib/metadata_model'
import Json from '$src/lib/json'
import Log from '$src/lib/log'
import './view/form/component'
import './header/component'
import './view/table/component'

@customElement('metadata-model-datum-input')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) metadatamodel: any = {}
	@property({ type: String }) startcolor: Theme.Color = Theme.Color.PRIMARY
	@property({ type: Object }) data: any = {}

	@state() private _copiedcutfieldgroupkey: string = ''
	private _copiedFieldGroupArrayIndexPlaceholders: number[] = []
	@state() private _cutFieldGroupData: { fgkey: string; value: any } | null = null

	@state() private _scrollelement: Element | undefined = undefined

	@state() private _viewjsonoutput: boolean = false

	private _updatemetadatamodel = (fieldGroup: any) => {
		let fieldGroupPath = fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (typeof fieldGroupPath !== 'string') {
			return
		}
		fieldGroupPath = (fieldGroupPath as string).replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
		try {
			this.metadatamodel = Json.SetValueInObject(this.metadatamodel, fieldGroupPath, fieldGroup)
			this.dispatchEvent(
				new CustomEvent('metadata-model-datum-input:updatemetadatamodel', {
					detail: {
						value: this.metadatamodel
					}
				})
			)
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, e, fieldGroup)
		}
	}

	private _deletedata = (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => {
		try {
			const path = MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayPlaceholderIndexes)
			this.data = Json.DeleteValueInObject(this.data, path)
			this.dispatchEvent(
				new CustomEvent(`metadata-model-datum-input:deletedata`, {
					detail: {
						fieldGroupKey,
						arrayPlaceholderIndexes,
						path
					}
				})
			)
			this.dispatchEvent(
				new CustomEvent('metadata-model-datum-input:updatedata', {
					detail: {
						value: this.data
					}
				})
			)
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, e)
		}
	}

	private _getdata = (fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => {
		try {
			return Json.GetValueInObject(this.data, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayPlaceholderIndexes))
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, e)
			return undefined
		}
	}

	private _updatedata = (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => {
		try {
			this.data = Json.SetValueInObject(this.data, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayPlaceholderIndexes), value)
			this.dispatchEvent(
				new CustomEvent('metadata-model-datum-input:updatedata', {
					detail: {
						value: this.data
					}
				})
			)
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, e, fieldGroupKey, arrayPlaceholderIndexes, value)
		}
	}

	protected render(): unknown {
		if (!MetadataModel.isGroupFieldsValid(this.metadatamodel)) {
			return html`<div class="h-fit w-full text-error">metadatamodel is not valid</div>`
		}

		if (typeof this._scrollelement === 'undefined') {
			;(async () => {
				await new Promise((resolve: (e: Element) => void) => {
					if ((this.shadowRoot as ShadowRoot).querySelector('#metadata-model-datum-input-view-scroll')) {
						resolve((this.shadowRoot as ShadowRoot).querySelector('#metadata-model-datum-input-view-scroll') as Element)
						return
					}

					const observer = new MutationObserver(() => {
						if ((this.shadowRoot as ShadowRoot).querySelector('#metadata-model-datum-input-view-scroll')) {
							resolve((this.shadowRoot as ShadowRoot).querySelector('#metadata-model-datum-input-view-scroll') as Element)
							observer.disconnect()
						}
					})

					observer.observe(this.shadowRoot as ShadowRoot, {
						childList: true,
						subtree: true
					})
				}).then((e) => {
					this._scrollelement = e
				})
			})()
		}

		return html`
			${(() => {
				if (this.metadatamodel[MetadataModel.FgProperties.DATUM_INPUT_VIEW] !== MetadataModel.DView.TABLE) {
					return html`
						<metadata-model-datum-input-header
							class="rounded-t-md ${this.startcolor === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.startcolor === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}"
							.group=${this.metadatamodel}
							.viewjsonoutput=${this._viewjsonoutput}
							.updateviewjsonoutput=${(newviewjsonoutput: boolean) => (this._viewjsonoutput = newviewjsonoutput)}
							.updatemetadatamodel=${this._updatemetadatamodel}
							.deletedata=${this._deletedata}
						></metadata-model-datum-input-header>
					`
				}

				return nothing
			})()}
			<main
				id="metadata-model-datum-input-view-scroll"
				class="overflow-auto h-fit ${(!this._viewjsonoutput && !this.metadatamodel[MetadataModel.FgProperties.DATUM_INPUT_VIEW]) || this.metadatamodel[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.FORM ? ' shadow-inner shadow-gray-800 rounded-b-md pl-2 pr-2 pb-2' : ''}"
			>
				${(() => {
					if (typeof this._scrollelement === 'undefined') {
						return html`
							<div class="flex-1 w-full h-full flex justify-center">
								<span class="loading loading-spinner loading-md self-center ${this.startcolor === Theme.Color.PRIMARY ? 'text-primary' : this.startcolor === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}"></span>
							</div>
						`
					}

					if (this._viewjsonoutput) {
						return html` <pre class="flex-1 bg-gray-700 text-white p-1 rounded-b-md shadow-inner shadow-gray-800"><code>${JSON.stringify(this.data, null, 4)}</code></pre> `
					}

					if (this.metadatamodel[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
						return html`
							<metadata-model-datum-input-view-table
								class="h-full w-full"
								.scrollelement=${this._scrollelement}
								.group=${this.metadatamodel}
								.color=${this.startcolor}
								.updatemetadatamodel=${this._updatemetadatamodel}
								.getdata=${this._getdata}
								.deletedata=${this._deletedata}
								.updatedata=${this._updatedata}
							></metadata-model-datum-input-view-table>
						`
					}

					return html`
						<metadata-model-datum-input-view-form
							.scrollelement=${this._scrollelement}
							.group=${this.metadatamodel}
							.color=${this.startcolor}
							.updatemetadatamodel=${this._updatemetadatamodel}
							.copiedcutfieldgroupkey=${this._copiedcutfieldgroupkey}
							.getdata=${this._getdata}
							.updatedata=${this._updatedata}
							.deletedata=${this._deletedata}
							.setcopiedfieldgroupkey=${(fieldGroupKey: string, arrayIndexPlaceholders: number[]) => {
								const fieldGroupData = Json.GetValueInObject(this.data, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayIndexPlaceholders))
								if (fieldGroupData && fieldGroupData !== null) {
									this._copiedcutfieldgroupkey = fieldGroupKey
									this._copiedFieldGroupArrayIndexPlaceholders = arrayIndexPlaceholders
									this._cutFieldGroupData = null
								}
							}}
							.setcutfieldgroupdata=${(fieldGroupKey: string, arrayIndexPlaceholders: number[]) => {
								const fieldGroupData = Json.GetValueInObject(this.data, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayIndexPlaceholders))
								if (fieldGroupData && fieldGroupData !== null) {
									this._copiedcutfieldgroupkey = fieldGroupKey
									this._cutFieldGroupData = fieldGroupData
									this._copiedFieldGroupArrayIndexPlaceholders = []
									this.data = Json.DeleteValueInObject(this.data, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayIndexPlaceholders))
								}
							}}
							.pastefieldgroupdata=${(destFieldGroupKey: string, destArrayIndexPlaceholders: number[]) => {
								try {
									let pastedata: any = undefined
									if (this._cutFieldGroupData !== null) {
										pastedata = JSON.parse(JSON.stringify(this._cutFieldGroupData))
									} else {
										pastedata = Json.GetValueInObject(this.data, MetadataModel.PreparePathToValueInObject(this._copiedcutfieldgroupkey, this._copiedFieldGroupArrayIndexPlaceholders))
									}

									if (typeof pastedata === 'undefined') {
										return
									}

									this.data = Json.SetValueInObject(this.data, MetadataModel.PreparePathToValueInObject(destFieldGroupKey, destArrayIndexPlaceholders), pastedata)
									this.dispatchEvent(
										new CustomEvent('metadata-model-datum-input:updatedata', {
											detail: {
												value: this.data
											}
										})
									)
								} catch (e) {
									Log.Log(Log.Level.ERROR, this.localName, e, destFieldGroupKey, destArrayIndexPlaceholders)
								}
							}}
						></metadata-model-datum-input-view-form>
					`
				})()}
			</main>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input': Component
	}
}
