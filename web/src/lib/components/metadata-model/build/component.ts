import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import MetadataModel from '@lib/metadata_model'
import Theme from '@lib/theme'
import Lib from '@lib/lib'
import Json from '@lib/json'
import Log from '@lib/log'
import './field-group/component'
import './edit-field-group/component'

@customElement('metadata-model-build')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) metadatamodel: any = MetadataModel.EmptyMetadataModel()
	@property({ type: String }) startcolor: Theme.Color = Theme.Color.PRIMARY
	@property({ type: Number }) noofselectoptionsineachtracker: number = 20

	@state() private _cutfieldgroup: any

	@state() private _copiedfieldgroupkey: string = ''

	private _createUpdateMetadataModel(path: string, value: any) {
		try {
			// Log.Log(Log.Level.DEBUG, this.localName, 'Create Update Metadata Model', path, value)
			this.metadatamodel = structuredClone(Json.SetValueInObject(this.metadatamodel, path, value))
			this.dispatchEvent(
				new CustomEvent('metadata-model-build:updatemetadatamodel', {
					detail: {
						value: this.metadatamodel
					}
				})
			)
			// Log.Log(Log.Level.DEBUG, this.localName, 'After Create update Metadata Model Field/Group', this.metadatamodel)
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, this._createUpdateMetadataModel.name, e)
			throw e
		}
	}

	@state() private _selectedFieldGroupPath: string = ''
	@state() private _selectedFieldGroupColor: Theme.Color = Theme.Color.PRIMARY

	@state() private _scrollelement?: Element

	protected render(): unknown {
		if (typeof this._scrollelement === 'undefined') {
			;(async () => {
				await new Promise((resolve: (e: Element) => void) => {
					if ((this.shadowRoot as ShadowRoot).querySelector('#metadata-model-build-scroll')) {
						return resolve((this.shadowRoot as ShadowRoot).querySelector('#metadata-model-build-scroll') as Element)
					}

					const observer = new MutationObserver(() => {
						if ((this.shadowRoot as ShadowRoot).querySelector('#metadata-model-build-scroll')) {
							resolve((this.shadowRoot as ShadowRoot).querySelector('#metadata-model-build-scroll') as Element)
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
			<main id="metadata-model-build-scroll" class="w-full h-full overflow-auto">
				${(() => {
					if (typeof this._scrollelement !== 'undefined') {
						return html`
							<metadata-model-build-field-group
								.noofselectoptionsineachtracker=${this.noofselectoptionsineachtracker}
								.scrollelement=${this._scrollelement}
								.color=${this.startcolor}
								.fieldgroup=${this.metadatamodel}
								.copiedfieldgroupkey=${this._copiedfieldgroupkey}
								.cutfieldgroup=${typeof this._cutfieldgroup !== 'undefined'}
								.showgroupfields=${true}
								groupkey="$"
								.deletefieldgroup=${(fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => {
									try {
										this.metadatamodel = Json.DeleteValueInObject(this.metadatamodel, fieldgroupkey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))
										this.metadatamodel = Json.DeleteValueInObject(this.metadatamodel, `${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}[${indexingroupreadorderoffields}]`)
										this.dispatchEvent(
											new CustomEvent('metadata-model-build:deletefieldgroup', {
												detail: {
													path: fieldgroupkey
												}
											})
										)
										this.dispatchEvent(
											new CustomEvent('metadata-model-build:updatemetadatamodel', {
												detail: {
													value: this.metadatamodel
												}
											})
										)
										// Log.Log(Log.Level.DEBUG, this.localName, 'After delete Metadata Model Field/Group', this.metadatamodel)
									} catch (e) {
										Log.Log(Log.Level.ERROR, this.localName, e)
									}
								}}
								.setcutfieldgroup=${(fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => {
									try {
										this._cutfieldgroup = Json.GetValueInObject(this.metadatamodel, fieldgroupkey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))
										this.metadatamodel = Json.DeleteValueInObject(this.metadatamodel, fieldgroupkey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))
										this.metadatamodel = Json.DeleteValueInObject(this.metadatamodel, `${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}[${indexingroupreadorderoffields}]`)
										this._copiedfieldgroupkey = ''
										// Log.Log(Log.Level.DEBUG, this.localName, 'Set cut field/group path', this._cutfieldgroup)
									} catch (e) {
										Log.Log(Log.Level.ERROR, this.localName, e)
									}
								}}
								.setcopiedfieldgroupkey=${(fieldgroupkey: string) => {
									this._copiedfieldgroupkey = fieldgroupkey
									this._cutfieldgroup = undefined
									// Log.Log(Log.Level.DEBUG, this.localName, `Set copied field/group path: ${this._copiedfieldgroupkey}`)
								}}
								.pastefieldgroup=${(destinationGroupKey: string, objectIndexInGroupReadOrderOfFields: number) => {
									try {
										let pasteFieldGroup: any
										if (this._copiedfieldgroupkey.length > 0) {
											pasteFieldGroup = Json.GetValueInObject(this.metadatamodel, this._copiedfieldgroupkey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))
										} else {
											pasteFieldGroup = structuredClone(this._cutfieldgroup)
										}
										if (typeof pasteFieldGroup === 'undefined') {
											Log.Log(Log.Level.ERROR, this.localName, 'pasteFieldGroup is undefined')
											return
										}

										let destinationGroupReadOrderOfFields = Json.GetValueInObject(this.metadatamodel, `${destinationGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`)
										if (!Array.isArray(destinationGroupReadOrderOfFields)) {
											Log.Log(Log.Level.ERROR, this.localName, 'destinationGroupReadOrderOfFields is not an array')
											return
										}

										if (Array.isArray(pasteFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
											pasteFieldGroup = MetadataModel.MapFieldGroups(pasteFieldGroup, (property) => {
												if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
													property[MetadataModel.FgProperties.FIELD_GROUP_KEY] = (property[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY], destinationGroupKey)
												}
												return property
											})

											if (!Array.isArray(pasteFieldGroup[MetadataModel.FgProperties.GROUP_FIELDS]) || typeof pasteFieldGroup[MetadataModel.FgProperties.GROUP_FIELDS][0] !== 'object') {
												Log.Log(Log.Level.ERROR, this.localName, 'pasteGroupFields is not an array or pasteGroupFields[0] is not an object')
												return
											}

											if (!Array.isArray(pasteFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
												Log.Log(Log.Level.ERROR, this.localName, 'pasteGroupReadOrderOfFields is not an array')
												return
											}

											const destinationGroupFields = Json.GetValueInObject(this.metadatamodel, `${destinationGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_FIELDS}`)
											if (!Array.isArray(destinationGroupFields) || typeof destinationGroupFields[0] !== 'object') {
												Log.Log(Log.Level.ERROR, this.localName, 'destinationGroupFields is not an array or destinationGroupFields[0] is not an object')
												return
											}

											destinationGroupFields[0] = { ...pasteFieldGroup[MetadataModel.FgProperties.GROUP_FIELDS][0], ...destinationGroupFields[0] }

											let newDestinationGroupReadOrderOfFields: string[] = []
											for (const dgroof of destinationGroupReadOrderOfFields) {
												if (!(pasteFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] as any[]).includes(dgroof)) {
													newDestinationGroupReadOrderOfFields = [...newDestinationGroupReadOrderOfFields, dgroof]
												}
											}
											if (objectIndexInGroupReadOrderOfFields >= 0 && objectIndexInGroupReadOrderOfFields < newDestinationGroupReadOrderOfFields.length) {
												;(newDestinationGroupReadOrderOfFields as any[]).splice(objectIndexInGroupReadOrderOfFields, 0, ...pasteFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])
											} else {
												newDestinationGroupReadOrderOfFields = [...newDestinationGroupReadOrderOfFields, ...pasteFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]]
											}
											destinationGroupReadOrderOfFields = newDestinationGroupReadOrderOfFields

											this._createUpdateMetadataModel(`${destinationGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`, destinationGroupReadOrderOfFields)
											this._createUpdateMetadataModel(`${destinationGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_FIELDS}`, destinationGroupFields)
										} else {
											pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] = `${destinationGroupKey}.${MetadataModel.FgProperties.GROUP_FIELDS}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}.${(pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()}`
											if (!(destinationGroupReadOrderOfFields as string[]).includes((pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop() as string)) {
												if (objectIndexInGroupReadOrderOfFields >= 0) {
													;(destinationGroupReadOrderOfFields as any[]).splice(objectIndexInGroupReadOrderOfFields, 0, (pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop())
												} else {
													destinationGroupReadOrderOfFields = [...destinationGroupReadOrderOfFields, (pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()]
												}
												this._createUpdateMetadataModel(`${destinationGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`, destinationGroupReadOrderOfFields)
											}

											this._createUpdateMetadataModel((pasteFieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'), pasteFieldGroup)
										}
									} catch (e) {
										Log.Log(Log.Level.ERROR, this.localName, e)
									}
								}}
								.createfieldgroup=${(groupKey: string, fieldGroupName: string, isField: boolean, objectIndexInGroupReadOrderOfFields: number) => {
									const newFieldGroupKey = `${groupKey}.${MetadataModel.FgProperties.GROUP_FIELDS}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}.${fieldGroupName.toLocaleLowerCase().replace(new RegExp(MetadataModel.SPECIAL_CHARS_REGEX_SEARCH, 'g'), '_')}`
									let newFieldGroup: any = {
										[MetadataModel.FgProperties.FIELD_GROUP_KEY]: newFieldGroupKey,
										[MetadataModel.FgProperties.FIELD_GROUP_NAME]: fieldGroupName,
										[MetadataModel.FgProperties.FIELD_GROUP_MAX_ENTRIES]: 1
									}
									if (isField) {
										newFieldGroup[MetadataModel.FgProperties.FIELD_DATATYPE] = ''
										newFieldGroup[MetadataModel.FgProperties.FIELD_UI] = ''
									} else {
										newFieldGroup[MetadataModel.FgProperties.GROUP_FIELDS] = [{}]
										newFieldGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] = []
									}

									try {
										let groupReadOrderOfFields = Json.GetValueInObject(this.metadatamodel, `${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`)
										if (!Array.isArray(groupReadOrderOfFields)) {
											throw 'groupReadOrderOfFields is not an array'
										}
										if (!(groupReadOrderOfFields as string[]).includes(newFieldGroupKey.split('.').pop() as string)) {
											if (objectIndexInGroupReadOrderOfFields >= 0) {
												;(groupReadOrderOfFields as any[]).splice(objectIndexInGroupReadOrderOfFields, 0, newFieldGroupKey.split('.').pop())
											} else {
												groupReadOrderOfFields = [...groupReadOrderOfFields, newFieldGroupKey.split('.').pop()]
											}

											this._createUpdateMetadataModel(`${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`, groupReadOrderOfFields)
										}

										this._createUpdateMetadataModel(newFieldGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'), newFieldGroup)
									} catch (e) {
										Log.Log(Log.Level.ERROR, this.localName, e)
									}
								}}
								.handleselectfieldgroup=${(fieldgroupkey: string, color: Theme.Color = Theme.Color.PRIMARY) => {
									this._selectedFieldGroupPath = fieldgroupkey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
									this._selectedFieldGroupColor = color
									;(this.shadowRoot?.querySelector('#edit-field-group-dialog') as HTMLDialogElement).showModal()
								}}
								.reorderfieldgroup=${(groupKey: string, direction: number, fieldGroupIndexInReadOrderOfFields: number) => {
									try {
										let groupReadOrderOfFields = Json.GetValueInObject(this.metadatamodel, `${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`)
										if (!Array.isArray(groupReadOrderOfFields)) {
											Log.Log(Log.Level.ERROR, this.localName, 'groupReadOrderOfFields is not an array')
											return
										}

										let newGroupReadOrderOfFields: string[] = []
										for (let g = 0; g < groupReadOrderOfFields.length; g++) {
											if (direction < 0 && fieldGroupIndexInReadOrderOfFields + direction === g) {
												newGroupReadOrderOfFields = [...newGroupReadOrderOfFields, groupReadOrderOfFields[fieldGroupIndexInReadOrderOfFields]]
											}
											if (g !== fieldGroupIndexInReadOrderOfFields) {
												newGroupReadOrderOfFields = [...newGroupReadOrderOfFields, groupReadOrderOfFields[g]]
											}
											if (direction > 0 && fieldGroupIndexInReadOrderOfFields + direction === g) {
												newGroupReadOrderOfFields = [...newGroupReadOrderOfFields, groupReadOrderOfFields[fieldGroupIndexInReadOrderOfFields]]
											}
										}

										this._createUpdateMetadataModel(`${groupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')}.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}`, newGroupReadOrderOfFields)
									} catch (e) {
										Log.Log(Log.Level.ERROR, this.localName, e)
									}
								}}
							></metadata-model-build-field-group>
						`
					} else {
						return nothing
					}
				})()}
			</main>
			<dialog id="edit-field-group-dialog" class="modal">
				<form method="dialog" class="modal-box p-0 rounded min-w-[500px] w-fit md:max-w-[800px] max-h-[90vh] overflow-hidden">
					<header class="sticky flex justify-between items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
						<div class="h-fit w-fit flex gap-x-1 ${this._selectedFieldGroupColor === Theme.Color.PRIMARY ? 'text-primary' : this._selectedFieldGroupColor === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Edit Field/Group</div>
						<button class="btn btn-circle btn-ghost flex justify-center" @click=${() => (this._selectedFieldGroupPath = '')}>
							<!--mdi:close-circle source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="20" height="15" viewBox="0 0 24 24">
								<path fill="${this._selectedFieldGroupColor}" d="M12 2c5.53 0 10 4.47 10 10s-4.47 10-10 10S2 17.53 2 12S6.47 2 12 2m3.59 5L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41z" />
							</svg>
						</button>
					</header>
					${(() => {
						if (this._selectedFieldGroupPath.length === 0) {
							return nothing
						}

						try {
							const fieldGroup = Json.GetValueInObject(this.metadatamodel, this._selectedFieldGroupPath)

							if (typeof fieldGroup !== 'undefined') {
								return html`
									<metadata-model-build-edit-field-group
										class="flex-1 p-1 overflow-hidden"
										.color=${this._selectedFieldGroupColor}
										.fieldgroup=${fieldGroup}
										.metadatamodel=${this.metadatamodel}
										.updatefieldgroup=${(fieldgroup: any) => {
											if (typeof fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== 'string') {
												return
											}
											this._createUpdateMetadataModel((fieldgroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'), fieldgroup)
											this.dispatchEvent(
												new CustomEvent('metadata-model-build:notification', {
													detail: {
														type: Lib.ToastType.INFO,
														value: 'Field/group updated'
													}
												})
											)
										}}
									></metadata-model-build-edit-field-group>
								`
							} else {
								return html`<div class="text-error">Field/Group is NOT valid.</div>`
							}
						} catch (e) {
							Log.Log(Log.Level.ERROR, this.localName, e)
							return html`<code>${e}</code>`
						}
					})()}
				</form>
			</dialog>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-build': Component
	}
}
