import { html, LitElement, nothing, PropertyValues, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '@lib/theme'
import MetadataModel from '@lib/metadata_model'
import Json from '@lib/json'
import Log from '@lib/log'
import './view/form/component'
import './header/component'
import './view/table/component'
import './tree/component'
import { keyed } from 'lit/directives/keyed.js'

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

	@state() private _viewGroupTree: boolean = false
	@state() private _viewGroupTreeScrollElement: Element | undefined

	@state() private _currentViewGroupKey: string = '$'
	@state() private _currentgrouparrayindexplaceholders: number[] = []

	private _updatemetadatamodel = (fieldGroup: any) => {
		let fieldGroupPath = fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (typeof fieldGroupPath !== 'string') {
			return
		}
		fieldGroupPath = (fieldGroupPath as string).replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
		try {
			this.metadatamodel = structuredClone(Json.SetValueInObject(this.metadatamodel, fieldGroupPath, fieldGroup))
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
			this.data = structuredClone(Json.DeleteValueInObject(this.data, path))
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
			return structuredClone(Json.GetValueInObject(this.data, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayPlaceholderIndexes)))
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, e)
			return undefined
		}
	}

	private _updatedata = (fieldGroupKey: string, arrayPlaceholderIndexes: number[], value: any) => {
		try {
			this.data = structuredClone(Json.SetValueInObject(this.data, MetadataModel.PreparePathToValueInObject(fieldGroupKey, arrayPlaceholderIndexes), value))
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

	private _resizeObserver!: ResizeObserver

	@state() private _scrollElementHeight: number = 0

	protected firstUpdated(_changedProperties: PropertyValues): void {
		this._resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target.id === 'metadata-model-datum-input-view-scroll') {
					this._scrollElementHeight = entry.contentRect.height
					continue
				}
			}
		})
	}

	protected render(): unknown {
		if (!MetadataModel.IsGroupFieldsValid(this.metadatamodel)) {
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
					this._resizeObserver.observe(e)
				})
			})()
		}

		const currentMetadataModelGroup = structuredClone(Json.GetValueInObject(this.metadatamodel, this._currentViewGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')))

		return html`
			${(() => {
				if (currentMetadataModelGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW] !== MetadataModel.DView.TABLE) {
					return html`
						<metadata-model-datum-input-header
							class="${this.startcolor === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.startcolor === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}"
							.group=${currentMetadataModelGroup}
							.viewjsonoutput=${this._viewjsonoutput}
							.viewgrouptree=${this._viewGroupTree}
							.updateviewjsonoutput=${(newviewjsonoutput: boolean) => (this._viewjsonoutput = newviewjsonoutput)}
							.updatemetadatamodel=${this._updatemetadatamodel}
							.deletedata=${this._deletedata}
							.color=${this.startcolor}
						>
							<button
								slot="header-menu-additional-content"
								class="btn btn-ghost p-1 w-full justify-start"
								@click=${() => {
									this._viewGroupTree = !this._viewGroupTree
								}}
							>
								<div class="flex flex-col justify-center">
									<div class="flex self-center">
										<!--mdi:file-tree source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M3 3h6v4H3zm12 7h6v4h-6zm0 7h6v4h-6zm-2-4H7v5h6v2H5V9h2v2h6z" /></svg>

										${(() => {
											if (this._viewGroupTree) {
												return html`
													<!--mdi:close-circle source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24">
														<path d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" />
													</svg>
												`
											}
											return nothing
										})()}
									</div>
								</div>
								<div class="self-center font-bold">view group tree</div>
							</button>
						</metadata-model-datum-input-header>
					`
				}

				return nothing
			})()}
			${(() => {
				if (this._viewGroupTree) {
					return html`
						<section id="view-group-tree-scroll-element" class="flex flex-[9] flex-col w-full h-fit overflow-auto pt-1 shadow-inner shadow-gray-800">
							${(() => {
								;(async () => {
									await new Promise((resolve: (e: Element) => void) => {
										if ((this.shadowRoot as ShadowRoot).querySelector(`#view-group-tree-scroll-element`)) {
											resolve((this.shadowRoot as ShadowRoot).querySelector(`#view-group-tree-scroll-element`) as Element)
											return
										}

										const observer = new MutationObserver(() => {
											if ((this.shadowRoot as ShadowRoot).querySelector(`#view-group-tree-scroll-element`)) {
												resolve((this.shadowRoot as ShadowRoot).querySelector(`#view-group-tree-scroll-element`) as Element)
												observer.disconnect()
											}
										})

										observer.observe(this.shadowRoot as ShadowRoot, {
											childList: true,
											subtree: true
										})
									})
										.then((e) => {
											this._viewGroupTreeScrollElement = e
										})
										.catch((err) => {
											console.error('Get view-group-tree-scroll-element failed', err)
										})
								})()

								if (typeof this._viewGroupTreeScrollElement === 'undefined') {
									return html`
										<div class="flex-1 w-full h-full flex justify-center">
											<span class="loading loading-spinner loading-md self-center ${this.startcolor === Theme.Color.PRIMARY ? 'text-primary' : this.startcolor === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}"></span>
										</div>
									`
								}

								return html`
									<div class="flex-[9]">
										<metadata-model-datum-input-tree
											class="min-h-fit min-w-fit"
											.scrollelement=${this._viewGroupTreeScrollElement}
											.color=${this.startcolor}
											.fieldgroup=${this.metadatamodel}
											.getdata=${this._getdata}
											.updatemetadatamodel=${this._updatemetadatamodel}
											.setcurrentgroupcontext=${(fieldGroupKey: string, arrayPlaceholderIndexes: number[]) => {
												this._currentViewGroupKey = fieldGroupKey
												this._currentgrouparrayindexplaceholders = structuredClone(arrayPlaceholderIndexes)
											}}
										></metadata-model-datum-input-tree>
									</div>
								`
							})()}

							<button class="btn btn-ghost glass btn-square rounded-none min-w-fit w-full sticky bottom-0 left-0 right-0 self-center" @click=${() => (this._viewGroupTree = false)}>
								<!--mdi:chevron-up source: https://icon-sets.iconify.design-->
								<svg xmlns="http://www.w3.org/2000/svg" width="100" height="20" viewBox="0 0 24 24">
									<path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" />
								</svg>
							</button>
						</section>
					`
				}

				this._viewGroupTreeScrollElement = undefined

				return nothing
			})()}
			${keyed(
				this._currentViewGroupKey,
				html`
					<main
						id="metadata-model-datum-input-view-scroll"
						class="flex-1 overflow-auto h-fit ${(!this._viewjsonoutput && !currentMetadataModelGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW]) || currentMetadataModelGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.FORM
							? ' shadow-inner shadow-gray-800 pl-2 pr-2 pb-2'
							: ''}"
						style="${this._viewGroupTree ? 'opacity: 0.7;background-color: rgba(0, 0, 0, 0.25);' : ''}"
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
								return html` <pre class="flex-1 bg-gray-700 text-white p-1 shadow-inner shadow-gray-800"><code>${JSON.stringify(this._getdata(this._currentViewGroupKey, this._currentgrouparrayindexplaceholders), null, 4)}</code></pre> `
							}

							if (currentMetadataModelGroup[MetadataModel.FgProperties.DATUM_INPUT_VIEW] === MetadataModel.DView.TABLE) {
								return html`
									<metadata-model-datum-input-view-table
										class="h-full w-full"
										.scrollelement=${this._scrollelement}
										.group=${currentMetadataModelGroup}
										.arrayindexplaceholders=${this._currentgrouparrayindexplaceholders}
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
									.group=${currentMetadataModelGroup}
									.arrayindexplaceholders=${this._currentgrouparrayindexplaceholders}
									.color=${this.startcolor}
									.updatemetadatamodel=${this._updatemetadatamodel}
									.copiedcutfieldgroupkey=${this._copiedcutfieldgroupkey}
									.getdata=${this._getdata}
									.updatedata=${this._updatedata}
									.deletedata=${this._deletedata}
									.scrollelementheight=${this._scrollElementHeight}
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
												pastedata = structuredClone(this._cutFieldGroupData)
											} else {
												pastedata = Json.GetValueInObject(this.data, MetadataModel.PreparePathToValueInObject(this._copiedcutfieldgroupkey, this._copiedFieldGroupArrayIndexPlaceholders))
											}

											if (typeof pastedata === 'undefined') {
												return
											}

											this.data = structuredClone(Json.SetValueInObject(this.data, MetadataModel.PreparePathToValueInObject(destFieldGroupKey, destArrayIndexPlaceholders), pastedata))
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
			)}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-datum-input': Component
	}
}
