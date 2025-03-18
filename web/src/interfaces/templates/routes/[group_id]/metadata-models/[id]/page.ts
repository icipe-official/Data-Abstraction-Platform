import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import pageCss from './page.css?inline'
import MetadataModel from '@lib/metadata_model'
import Lib from '@lib/lib'
import Log from '@lib/log'
import Theme from '@lib/theme'
import Papa from 'papaparse'
import { Task } from '@lit/task'
import { FieldAnyMetadataModel } from '@interfaces/field_any_metadata_model/field_any_metadata_model'
import { AppContextConsumer, AppContextProvider } from '@interfaces/context/app'
import { IAppContextConsumer } from '@dominterfaces/context/app'
import Entities from '@domentities'
import { IFieldAnyMetadataModelGet } from '@dominterfaces/field_any_metadata_model/field_any_metadata_model'
import Url from '@lib/url'
import Json from '@lib/json'
import { ISpaPageNavigation } from '@dominterfaces/spa_page_navigation/spa_page_navigation'
import { SpaPageNavigation } from '@interfaces/spa_page_navigation/spa_page_navigation'

enum Tab {
	INFORMATION = 'INFORMATION',
	PROPERTIES = 'PROPERTIES',
	BUILD = 'BUILD',
	VIEW = 'VIEW'
}

enum ViewTab {
	DATUM_INPUT = 'DATUM_INPUT',
	TABLE = 'TABLE',
	QUERY_PANEL = 'QUERY_PANEL',
	DATUM_VIEW = 'DATUM_VIEW'
}

@customElement('metadata-model-page')
class Page extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(pageCss)]

	@property({ type: Object }) data: Entities.MetadataModel.IDatum | undefined = undefined

	private _pageNavigation: ISpaPageNavigation

	constructor() {
		super()
		this._appContext = new AppContextConsumer(this)
		this._fieldAnyMetadataModels = new FieldAnyMetadataModel()
		this._pageNavigation = new SpaPageNavigation(new AppContextProvider(undefined))
	}

	private _appContext: IAppContextConsumer

	@state() private _currentTab: Tab = Tab.INFORMATION

	@state() private _expandRightSection: boolean = false

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth
		if (this._windowWidth > 1000) {
			if (this._currentTab === Tab.VIEW) this._currentTab = Tab.PROPERTIES
			if (this._expandRightSection) this._expandRightSection = false
		}
	}

	@state() private _data: any = MetadataModel.EmptyMetadataModel()

	@state() private _currentViewTab: ViewTab = ViewTab.DATUM_INPUT

	@state() private _datuminputsamplemetadatamodel: any = structuredClone(this._data)
	@state() private _currentDatumInputSampleDataIndex: number = 0
	@state() private _datuminputsampledata: any[] = [{}]
	@state() private _datumeinputqueryconditions: any[] = []

	@state() private _colorTheme: Theme.Color = Theme.Color.PRIMARY

	private _importedMMDatumInput = false
	private _importMMDatumInputTask = new Task(this, {
		task: async ([_windowWidth, _currentViewTab]) => {
			if (this._importedMMDatumInput || ((_windowWidth as number) <= 1000 && _currentViewTab !== ViewTab.DATUM_INPUT)) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importMMDatumInputTask')
			this._importedMMDatumInput = true
			await import('@lib/components/metadata-model/datum-input/component')
		},
		args: () => [this._windowWidth, this._currentViewTab]
	})

	private _importedMMTable = false
	private _importMMTableTask = new Task(this, {
		task: async ([_windowWidth, _currentViewTab]) => {
			if (this._importedMMTable || ((_windowWidth as number) <= 1000 && _currentViewTab !== ViewTab.TABLE)) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importMMTableTask')
			this._importedMMTable = true
			await import('@lib/components/metadata-model/view/table/component')
		},
		args: () => [this._windowWidth, this._currentViewTab]
	})

	private _importedMMQueryPanel = false
	private _importMMQueryPanelTask = new Task(this, {
		task: async ([_windowWidth, _currentViewTab]) => {
			if (this._importedMMQueryPanel || ((_windowWidth as number) <= 1000 && _currentViewTab !== ViewTab.QUERY_PANEL)) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importMMQueryPanelTask')
			this._importedMMQueryPanel = true
			await import('@lib/components/metadata-model/view/query-panel/component')
		},
		args: () => [this._windowWidth, this._currentViewTab]
	})

	private _importedMMBuild = false
	private _importMMBuildTask = new Task(this, {
		task: async ([_currentTab]) => {
			if (this._importedMMBuild || _currentTab !== Tab.BUILD) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importMMBuildTask')
			this._importedMMBuild = true
			await import('@lib/components/metadata-model/build/component')
		},
		args: () => [this._currentTab]
	})

	private _importedMMViewDatum = false
	private _importMMViewDatumTask = new Task(this, {
		task: async ([_currentTab, data, _showCreateEdit]) => {
			if (this._importedMMViewDatum || (_currentTab !== Tab.INFORMATION && _showCreateEdit && (!(data as Entities.MetadataModel.IDatum) || !(data as Entities.MetadataModel.IDatum).metadata_model || !(data as Entities.MetadataModel.IDatum).datum))) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importMMViewDatumTask')
			this._importedMMViewDatum = true
			await import('@lib/components/metadata-model/view/datum/component')
		},
		args: () => [this._currentTab, this.data, this._showCreateEditMetadataModelInfo]
	})

	private _pendingTaskHtmlTemplate = () => html`
		<div class="flex-1 flex flex-col justify-center items-center text-xl gap-y-5">
			<div class="flex">
				<span class="loading loading-ball loading-sm text-accent"></span>
				<span class="loading loading-ball loading-md text-secondary"></span>
				<span class="loading loading-ball loading-lg text-primary"></span>
			</div>
		</div>
	`

	private _errorTaskHtmlTemplate = () => html`
		<div class="flex-1 flex flex-col justify-center items-center">
			<span class="w-fit text-error font-bold">Error: Could not download section content.</span>
		</div>
	`

	@state() private _showSampleDataImportButton = false
	@state() private _showSampleDataExportButton = false

	private _viewHtmlTemplate() {
		return html`
			<div class="flex justify-between gap-x-1 z-[2]">
				<div class="flex-[9] h-fit self-center w-fit flex gap-x-1">
					<div class="font-bold h-fit self-center">current datum index:</div>
					<input
						class="w-[70px] input input-bordered h-[36px] rounded-none"
						type="number"
						min="0"
						max="${this._datuminputsampledata.length}"
						value="${this._currentDatumInputSampleDataIndex}"
						@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
							if (e.currentTarget.value.length > 0) {
								if (!Number.isNaN(e.currentTarget.value)) {
									const currentValueNum = Math.round(Number(e.currentTarget.value))
									if (currentValueNum >= 0 && currentValueNum < this._datuminputsampledata.length) {
										this._currentDatumInputSampleDataIndex = currentValueNum
									}
								}
							}
						}}
					/>
					<div class="font-bold h-fit self-center">/${this._datuminputsampledata.length - 1}</div>
				</div>
				<div class="flex gap-x-1">
					<div class="flex flex-col">
						<button
							class="btn btn-ghost min-h-fit min-w-fit h-fit w-fit p-1"
							@click=${() => {
								this._showSampleDataExportButton = !this._showSampleDataExportButton
							}}
						>
							<!--mdi:file-export source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m-1 1.5L18.5 9H13m-4.07 3.22H16v7.07l-2.12-2.12L11.05 20l-2.83-2.83l2.83-2.82" /></svg>
						</button>
						${(() => {
							if (this._showSampleDataExportButton) {
								return html`
									<div class="relative z-50">
										<div class="absolute top-0 right-0 w-fit shadow-md shadow-gray-800 bg-white p-1 flex flex-col rounded-md min-w-[200px]">
											<div class="font-bold pb-1">Export Sample data to:</div>
											<button
												class="btn btn-ghost min-h-fit min-w-fit h-fit w-full p-1"
												@click=${() => {
													const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(this._datuminputsampledata)], { type: 'application/json' }))
													const downloadLink = document.createElement('a')
													downloadLink.href = objectUrl
													downloadLink.setAttribute('download', `sampledata.json`)
													document.body.appendChild(downloadLink)
													downloadLink.click()
													document.body.removeChild(downloadLink)
													URL.revokeObjectURL(objectUrl)
													this._showSampleDataExportButton = false
												}}
											>
												json (Nested)
											</button>
											<button
												class="btn btn-ghost min-h-fit min-w-fit h-fit w-full p-1"
												@click=${() => {
													let objectTo2DArray = new MetadataModel.ConvertObjectsTo2DArray(this._datuminputsamplemetadatamodel)
													objectTo2DArray.Convert(this._datuminputsampledata)

													const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(objectTo2DArray.Array2D)], { type: 'application/json' }))
													const downloadLink = document.createElement('a')
													downloadLink.href = objectUrl
													downloadLink.setAttribute('download', `sampledata2darray.json`)
													document.body.appendChild(downloadLink)
													downloadLink.click()
													document.body.removeChild(downloadLink)
													URL.revokeObjectURL(objectUrl)
													this._showSampleDataExportButton = false
												}}
											>
												json (2D Array)
											</button>
											<button
												class="btn btn-ghost min-h-fit min-w-fit h-fit w-full p-1"
												@click=${() => {
													try {
														let objectTo2DArray = new MetadataModel.ConvertObjectsTo2DArray(this._datuminputsamplemetadatamodel)
														objectTo2DArray.Convert(this._datuminputsampledata)
														let dataToParse = objectTo2DArray.Array2D

														let data2DFields = new MetadataModel.Extract2DFields(this._datuminputsamplemetadatamodel, true, true, true)
														data2DFields.Extract()
														data2DFields.Reposition()
														dataToParse = [data2DFields.Fields.map((f) => MetadataModel.GetFieldGroupName(f)), ...dataToParse]

														Log.Log(Log.Level.DEBUG, this.localName, 'sample data csv', dataToParse)

														const objectUrl = URL.createObjectURL(new Blob([Papa.unparse(dataToParse, { header: true })], { type: 'text/csv' }))
														const downloadLink = document.createElement('a')
														downloadLink.href = objectUrl
														downloadLink.setAttribute('download', `sampledata.csv`)
														document.body.appendChild(downloadLink)
														downloadLink.click()
														document.body.removeChild(downloadLink)
														URL.revokeObjectURL(objectUrl)
														this._showSampleDataExportButton = false
													} catch (e) {
														console.error(e)
														this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: ['create csv file failed', JSON.stringify(e)] }, bubbles: true, composed: true }))
													}
												}}
											>
												csv
											</button>
										</div>
									</div>
								`
							}

							return nothing
						})()}
					</div>
					<div class="flex flex-col">
						<button
							class="btn btn-ghost min-h-fit min-w-fit h-fit w-fit p-1"
							@click=${() => {
								this._showSampleDataImportButton = !this._showSampleDataImportButton
							}}
						>
							<!--mdi:file-import source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m-1 1.5L18.5 9H13m-2.95 2.22l2.83 2.83L15 11.93V19H7.93l2.12-2.12l-2.83-2.83" /></svg>
						</button>
						${(() => {
							if (this._showSampleDataImportButton) {
								return html`
									<div class="relative z-50">
										<div class="absolute top-0 right-0 w-fit shadow-md shadow-gray-800 bg-white p-1 flex flex-col rounded-md">
											<input
												class="join-item file-input file-input-bordered"
												type="file"
												accept=".json, .csv"
												@change=${async (e: any) => {
													if (e.target.files === null) {
														return
													}

													const fileList = e.target.files as FileList
													if (fileList.item(0)?.type !== 'application/json' && fileList.item(0)?.type !== 'text/csv') {
														return
													}

													const fileData = await fileList.item(0)?.text()
													if (typeof fileData === 'undefined') {
														return
													}

													switch (fileList.item(0)?.type) {
														case 'application/json':
															try {
																const data = JSON.parse(fileData)
																this._datuminputsampledata = Array.isArray(data) ? data : [data]
																this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: 'upload json data as sample input data successful' }, bubbles: true, composed: true }))
																this._showSampleDataImportButton = false
															} catch (e) {
																this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'Failed to parse json file content' }, bubbles: true, composed: true }))
																Log.Log(Log.Level.ERROR, this.localName, 'parse json failed', e)
															}
															break
														case 'text/csv':
															let data2DFields = new MetadataModel.Extract2DFields(this._datuminputsamplemetadatamodel, false, false, false)
															data2DFields.Extract()
															data2DFields.Reposition()

															try {
																const results = Papa.parse(fileData, { dynamicTyping: true })
																if (results.data.length === 0) {
																	return
																}

																Log.Log(Log.Level.DEBUG, this.localName, 'import sample data csv', results.data)

																let array2DToObjects = new MetadataModel.Convert2DArrayToObjects(this._datuminputsamplemetadatamodel)
																array2DToObjects.Convert(results.data.slice(1) as any[][])
																this._datuminputsampledata = array2DToObjects.Objects
																this._showSampleDataImportButton = false
															} catch (e) {
																console.error(e)
																this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: ['read csv data failed', JSON.stringify(e)] }, bubbles: true, composed: true }))
															}
															break
													}
												}}
											/>
										</div>
									</div>
								`
							}

							return nothing
						})()}
					</div>
				</div>
			</div>
			<div class="divider mt-1 mb-1"></div>
			<header role="tablist" class="tabs tabs-bordered">
				<button role="tab" class="tab${this._currentViewTab === ViewTab.DATUM_INPUT ? ' tab-active' : ''}" @click=${() => (this._currentViewTab = ViewTab.DATUM_INPUT)}>Datum Input</button>
				<button role="tab" class="tab${this._currentViewTab === ViewTab.TABLE ? ' tab-active' : ''}" @click=${() => (this._currentViewTab = ViewTab.TABLE)}>Table</button>
				<button role="tab" class="tab${this._currentViewTab === ViewTab.QUERY_PANEL ? ' tab-active' : ''}" @click=${() => (this._currentViewTab = ViewTab.QUERY_PANEL)}>Query Panel</button>
				<button role="tab" class="tab${this._currentViewTab === ViewTab.DATUM_VIEW ? ' tab-active' : ''}" @click=${() => (this._currentViewTab = ViewTab.DATUM_VIEW)}>Datum View</button>
			</header>
			<main class="z-[1] flex-[9] h-full w-full overflow-hidden flex flex-col">
				${(() => {
					switch (this._currentViewTab) {
						case ViewTab.DATUM_INPUT:
							return this._importMMDatumInputTask.render({
								pending: () => this._pendingTaskHtmlTemplate(),
								complete: () => html`
									<metadata-model-datum-input
										class="flex-1"
										.metadatamodel=${this._datuminputsamplemetadatamodel}
										.data=${this._datuminputsampledata[this._currentDatumInputSampleDataIndex]}
										.startcolor=${this._colorTheme}
										@metadata-model-datum-input:updatedata=${(e: CustomEvent) => {
											this._datuminputsampledata[this._currentDatumInputSampleDataIndex] = structuredClone(e.detail.value)
										}}
										@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
											this._datuminputsamplemetadatamodel = structuredClone(e.detail.value)
										}}
									></metadata-model-datum-input>
								`,
								error: (e) => {
									console.error(e)
									return this._errorTaskHtmlTemplate()
								}
							})
						case ViewTab.TABLE:
							return this._importMMTableTask.render({
								pending: () => this._pendingTaskHtmlTemplate(),
								complete: () => html`
									<div class="border-[1px] border-gray-400 h-fit max-h-full max-w-full flex overflow-hidden">
										<metadata-model-view-table .color=${this._colorTheme} .metadatamodel=${this._datuminputsamplemetadatamodel} .data=${this._datuminputsampledata} .getmetadatamodel=${this._fieldAnyMetadataModels}></metadata-model-view-table>
									</div>
								`,
								error: (e) => {
									console.error(e)
									return this._errorTaskHtmlTemplate()
								}
							})
						case ViewTab.QUERY_PANEL:
							return this._importMMQueryPanelTask.render({
								pending: () => this._pendingTaskHtmlTemplate(),
								complete: () => html`
									<metadata-model-view-query-panel
										.metadatamodel=${this._datuminputsamplemetadatamodel}
										.queryconditions=${this._datumeinputqueryconditions}
										.startcolor=${this._colorTheme}
										@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
											this._datuminputsamplemetadatamodel = structuredClone(e.detail.value)
										}}
										@metadata-model-view-query-panel:updatequeryconditions=${(e: CustomEvent) => {
											this._datumeinputqueryconditions = structuredClone(e.detail.value)
										}}
									></metadata-model-view-query-panel>
									<button
										class="flex-1 btn ${this._colorTheme === Theme.Color.PRIMARY ? 'btn-primary' : this._colorTheme === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}"
										@click=${() => {
											console.log(this._datumeinputqueryconditions)
											console.log(MetadataModel.FilterData(this._datumeinputqueryconditions, this._datuminputsampledata))
										}}
									>
										check is sample data passes query condtion
									</button>
								`,
								error: (e) => {
									console.error(e)
									return this._errorTaskHtmlTemplate()
								}
							})
						case ViewTab.DATUM_VIEW:
							return this._importMMViewDatumTask.render({
								pending: () => this._pendingTaskHtmlTemplate(),
								complete: () => html`
									<div class="border-[1px] border-gray-400 flex-1 h-fit max-h-full max-w-full flex overflow-hidden">
										<metadata-model-view-datum class="flex-1" .color=${this._colorTheme} .metadatamodel=${this._datuminputsamplemetadatamodel} .data=${this._datuminputsampledata[this._currentDatumInputSampleDataIndex]} .getmetadatamodel=${this._fieldAnyMetadataModels}></metadata-model-view-datum>
									</div>
								`,
								error: (e) => {
									console.error(e)
									return this._errorTaskHtmlTemplate()
								}
							})
						default:
							return html`<div class="text-error font-bold">Tab not implemented</div>`
					}
				})()}
			</main>
		`
	}

	private _fieldAnyMetadataModels: IFieldAnyMetadataModelGet

	connectedCallback(): void {
		super.connectedCallback()
		window.addEventListener('resize', this._handleWindowResize)
		if (this.data && this.data.metadata_model && this.data.datum) {
			let value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.MetadataModels.FieldColumn.Name, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._name = value[0]
			}

			value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.MetadataModels.FieldColumn.Description, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._description = value[0]
			}

			value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.MetadataModels.FieldColumn.Data, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._data = structuredClone(value[0])
				this._datuminputsamplemetadatamodel = structuredClone(value[0])
			}

			value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.MetadataModels.FieldColumn.EditAuthorized, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._editAuthorized = value[0]
			}

			value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.MetadataModels.FieldColumn.EditUnauthorized, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._editUnauthorized = value[0]
			}

			value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.MetadataModels.FieldColumn.ViewAuthorized, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._viewAuthorized = value[0]
			}

			value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.MetadataModels.FieldColumn.ViewUnauthorized, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._viewUnauthorized = value[0]
			}

			value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.MetadataModels.FieldColumn.Tags, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._tags = structuredClone(value)
			}
		} else {
			this._showCreateEditMetadataModelInfo = true
		}
	}

	disconnectedCallback(): void {
		window.removeEventListener('resize', this._handleWindowResize)
		super.disconnectedCallback()
	}

	@state() private _showCreateEditMetadataModelInfo = false

	private _name: string = ''
	@state() _nameError: string | null = null
	private readonly DEFAULT_NAME_ERROR = 'Name this metadata-model...'
	private _isNameValid = () => this._name.length > 3
	private _handleInputName(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		this._name = e.currentTarget.value
		if (this._isNameValid()) {
			this._nameError = null
		} else {
			this._nameError = this.DEFAULT_NAME_ERROR
		}
	}

	private _description: string = ''
	@state() _descriptionError: string | null = null
	private readonly DEFAULT_CURRENT_DESCRIPTION_ERROR = 'Describe this metadata-model...'
	private _isDescriptionValid = () => this._description.length > 3
	private _handleInputDescription(e: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		this._description = e.currentTarget.value
		if (this._isDescriptionValid()) {
			this._descriptionError = null
		} else {
			this._descriptionError = this.DEFAULT_CURRENT_DESCRIPTION_ERROR
		}
	}

	@state() private _tags: string[] = []

	@state() private _editAuthorized: boolean = true

	@state() private _editUnauthorized: boolean = false

	@state() private _viewAuthorized: boolean = true

	@state() private _viewUnauthorized: boolean = false

	private _resetFields() {
		this._name = ''
		this._nameError = null
		this._description = ''
		this._descriptionError = null
		this._data = MetadataModel.EmptyMetadataModel()
		this._datuminputsamplemetadatamodel = MetadataModel.EmptyMetadataModel()
		this._tags = []
		this._editAuthorized = true
		this._editUnauthorized = false
		this._viewAuthorized = true
		this._viewUnauthorized = false
	}

	private async _handleUpdateMetadataModel() {
		if (!this.data || !this.data.datum) {
			return
		}

		let data: Entities.MetadataModels.Interface = {
			id: (this.data.datum as Entities.MetadataModels.Interface).id
		}

		if (this._isNameValid()) {
			if (!Json.AreValuesEqual([this._name], (this.data.datum as Entities.MetadataModels.Interface).name)) {
				data.name = [this._name]
			}
		}

		if (this._isDescriptionValid()) {
			if (!Json.AreValuesEqual([this._description], (this.data.datum as Entities.MetadataModels.Interface).description)) {
				data.description = [this._description]
			}
		}

		if (!Json.AreValuesEqual([this._data], (this.data.datum as Entities.MetadataModels.Interface).data)) {
			data.data = [this._data]
		}

		if (!Json.AreValuesEqual([this._editAuthorized], (this.data.datum as Entities.MetadataModels.Interface).edit_authorized)) {
			data.edit_authorized = [this._editAuthorized]
		}

		if (!Json.AreValuesEqual([this._editUnauthorized], (this.data.datum as Entities.MetadataModels.Interface).edit_unauthorized)) {
			data.edit_unauthorized = [this._editUnauthorized]
		}

		if (!Json.AreValuesEqual([this._viewAuthorized], (this.data.datum as Entities.MetadataModels.Interface).view_authorized)) {
			data.view_authorized = [this._viewAuthorized]
		}

		if (!Json.AreValuesEqual([this._viewUnauthorized], (this.data.datum as Entities.MetadataModels.Interface).view_unauthorized)) {
			data.view_unauthorized = [this._viewUnauthorized]
		}

		if (!Json.AreValuesEqual(this._tags, (this.data.datum as Entities.MetadataModels.Interface).tags)) {
			data.tags = this._tags
		}

		this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: `Updating ${Entities.MetadataModels.RepositoryName}` }, bubbles: true, composed: true }))
		try {
			if (!this._appContext.GetCurrentdirectorygroupid()) {
				return
			}
			const fetchUrl = new URL(`${Url.ApiUrlPaths.MetadataModels.Url}/${Url.Action.UPDATE}`)
			fetchUrl.searchParams.append(Url.SearchParams.DIRECTORY_GROUP_ID, this._appContext.GetCurrentdirectorygroupid()!)
			fetchUrl.searchParams.append(Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this._appContext.Getauthcontextdirectorygroupid())
			if (this._appContext.appcontext?.verboseresponse) {
				fetchUrl.searchParams.append(Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
			}

			Log.Log(Log.Level.DEBUG, this.localName, fetchUrl, data)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify([data])
			})

			const fetchData: Entities.MetadataModel.IVerboseResponse = await fetchResponse.json()
			if (fetchResponse.ok) {
				this.dispatchEvent(
					new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, {
						detail: { toastType: !fetchData.failed ? Lib.ToastType.SUCCESS : fetchData.successful && fetchData.successful > 0 ? Lib.ToastType.INFO : Lib.ToastType.ERROR, ...Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData) },
						bubbles: true,
						composed: true
					})
				)
				if (fetchData.successful && fetchData.successful > 0 && !fetchData.failed) {
					if (!Json.AreValuesEqual([this._name], (this.data.datum as Entities.MetadataModels.Interface).name)) {
						;(this.data.datum as Entities.MetadataModels.Interface).name = [this._name]
					}

					if (!Json.AreValuesEqual([this._description], (this.data.datum as Entities.MetadataModels.Interface).description)) {
						;(this.data.datum as Entities.MetadataModels.Interface).description = [this._description]
					}

					if (!Json.AreValuesEqual([this._data], (this.data.datum as Entities.MetadataModels.Interface).data)) {
						;(this.data.datum as Entities.MetadataModels.Interface).data = [this._data]
					}

					if (!Json.AreValuesEqual([this._editAuthorized], (this.data.datum as Entities.MetadataModels.Interface).edit_authorized)) {
						;(this.data.datum as Entities.MetadataModels.Interface).edit_authorized = [this._editAuthorized]
					}

					if (!Json.AreValuesEqual([this._editUnauthorized], (this.data.datum as Entities.MetadataModels.Interface).edit_unauthorized)) {
						;(this.data.datum as Entities.MetadataModels.Interface).edit_unauthorized = [this._editUnauthorized]
					}

					if (!Json.AreValuesEqual([this._viewAuthorized], (this.data.datum as Entities.MetadataModels.Interface).view_authorized)) {
						;(this.data.datum as Entities.MetadataModels.Interface).view_authorized = [this._viewAuthorized]
					}

					if (!Json.AreValuesEqual([this._viewUnauthorized], (this.data.datum as Entities.MetadataModels.Interface).view_unauthorized)) {
						;(this.data.datum as Entities.MetadataModels.Interface).view_unauthorized = [this._viewUnauthorized]
					}

					if (!Json.AreValuesEqual(this._tags, (this.data.datum as Entities.MetadataModels.Interface).tags)) {
						;(this.data.datum as Entities.MetadataModels.Interface).tags = this._tags
					}
				}
			} else {
				this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: `${fetchResponse.status}-${fetchData.message}` }, bubbles: true, composed: true }))
			}
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, e)
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: Lib.DEFAULT_FETCH_ERROR }, bubbles: true, composed: true }))
		} finally {
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: false, loadingMessage: null }, bubbles: true, composed: true }))
		}
	}

	private async _handleCreateMetadataModel() {
		let data: Entities.MetadataModels.Interface = {}

		if (this._isNameValid()) {
			data.name = [this._name]
		} else {
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: `${Entities.MetadataModels.FieldColumn.Name} is not valid` }, bubbles: true, composed: true }))
			return
		}

		if (this._isDescriptionValid()) {
			data.description = [this._description]
		} else {
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: `${Entities.MetadataModels.FieldColumn.Description} is not valid` }, bubbles: true, composed: true }))
			return
		}

		data.data = [this._data]
		data.edit_authorized = [this._editAuthorized]
		data.edit_unauthorized = [this._editUnauthorized]
		data.view_authorized = [this._viewAuthorized]
		data.view_unauthorized = [this._viewUnauthorized]
		if (this._tags.length > 0) {
			data.tags = this._tags
		}

		this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: `Creating new ${Entities.MetadataModels.RepositoryName}` }, bubbles: true, composed: true }))
		try {
			if (!this._appContext.GetCurrentdirectorygroupid()) {
				return
			}
			const fetchUrl = new URL(`${Url.ApiUrlPaths.MetadataModels.Url}/${Url.Action.CREATE}`)
			fetchUrl.searchParams.append(Url.SearchParams.DIRECTORY_GROUP_ID, this._appContext.GetCurrentdirectorygroupid()!)
			fetchUrl.searchParams.append(Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this._appContext.Getauthcontextdirectorygroupid())
			if (this._appContext.appcontext?.verboseresponse) {
				fetchUrl.searchParams.append(Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
			}

			Log.Log(Log.Level.DEBUG, this.localName, fetchUrl, data)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify([data])
			})

			const fetchData: Entities.MetadataModel.IVerboseResponse = await fetchResponse.json()
			if (fetchResponse.ok) {
				this.dispatchEvent(
					new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, {
						detail: { toastType: !fetchData.failed ? Lib.ToastType.SUCCESS : fetchData.successful && fetchData.successful > 0 ? Lib.ToastType.INFO : Lib.ToastType.ERROR, ...Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData) },
						bubbles: true,
						composed: true
					})
				)
			} else {
				this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: `${fetchResponse.status}-${fetchData.message}` }, bubbles: true, composed: true }))
			}
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, e)
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: Lib.DEFAULT_FETCH_ERROR }, bubbles: true, composed: true }))
		} finally {
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: false, loadingMessage: null }, bubbles: true, composed: true }))
		}
	}

	private async _handleDeleteMetadataModel() {
		if (!this.data || !this.data.datum) {
			return
		}

		this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: `Deleting ${Entities.MetadataModels.RepositoryName}` }, bubbles: true, composed: true }))
		try {
			if (!this._appContext.GetCurrentdirectorygroupid()) {
				return
			}
			const fetchUrl = new URL(`${Url.ApiUrlPaths.MetadataModels.Url}/${Url.Action.DELETE}`)
			fetchUrl.searchParams.append(Url.SearchParams.DIRECTORY_GROUP_ID, this._appContext.GetCurrentdirectorygroupid()!)
			fetchUrl.searchParams.append(Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this._appContext.Getauthcontextdirectorygroupid())
			if (this._appContext.appcontext?.verboseresponse) {
				fetchUrl.searchParams.append(Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
			}

			Log.Log(Log.Level.DEBUG, this.localName, fetchUrl, this.data.datum)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify([this.data.datum])
			})

			const fetchData: Entities.MetadataModel.IVerboseResponse = await fetchResponse.json()
			if (fetchResponse.ok) {
				this.dispatchEvent(
					new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, {
						detail: { toastType: !fetchData.failed ? Lib.ToastType.SUCCESS : fetchData.successful && fetchData.successful > 0 ? Lib.ToastType.INFO : Lib.ToastType.ERROR, ...Entities.MetadataModel.GetToastFromJsonVerboseResponse(fetchData) },
						bubbles: true,
						composed: true
					})
				)

				if (fetchData.successful && fetchData.successful > 0 && !fetchData.failed) {
					try {
						const targetElement = document.querySelector(`#${import.meta.env.VITE_LAYOUT_ROUTES_GROUPID}`)
						if (targetElement !== null) {
							const dgid = this._appContext.GetCurrentdirectorygroupid()
							if (dgid) {
								let url = new URL(Url.WebsitePaths.MetadataModels, window.location.origin)
								url.searchParams.append(Url.SearchParams.DIRECTORY_GROUP_ID, dgid)
								Url.AddBaseUrl(url)
								await this._pageNavigation.Navigate(targetElement, url, 'Metadata Models')
							}
						}
					} catch (e) {
						console.error('page navigation failed', e)
						this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'page navigation failed' }, bubbles: true, composed: true }))
					}
				}
			} else {
				this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: `${fetchResponse.status}-${fetchData.message}` }, bubbles: true, composed: true }))
			}
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, e)
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: Lib.DEFAULT_FETCH_ERROR }, bubbles: true, composed: true }))
		} finally {
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: false, loadingMessage: null }, bubbles: true, composed: true }))
		}
	}

	protected render(): unknown {
		return html`
			${(() => {
				if (!this._expandRightSection || this._windowWidth <= 1000) {
					return html`
						<section id="left-section" class="flex-1 flex flex-col rounded-md shadow-md shadow-gray-800 bg-white p-1 gap-y-1 overflow-hidden">
							<header role="tablist" class="tabs tabs-bordered">
								<button role="tab" class="tab${this._currentTab === Tab.INFORMATION ? ' tab-active' : ''}" @click=${() => (this._currentTab = Tab.INFORMATION)}>Metadata-Model Information</button>
								<button role="tab" class="tab${this._currentTab === Tab.PROPERTIES ? ' tab-active' : ''}" @click=${() => (this._currentTab = Tab.PROPERTIES)}>Properties</button>
								<button role="tab" class="tab${this._currentTab === Tab.BUILD ? ' tab-active' : ''}" @click=${() => (this._currentTab = Tab.BUILD)}>Building</button>
								${(() => {
									if (this._windowWidth <= 1000) {
										return html`<button role="tab" class="tab${this._currentTab === Tab.VIEW ? ' tab-active' : ''}" @click=${() => (this._currentTab = Tab.VIEW)}>Viewing</button>`
									} else {
										return nothing
									}
								})()}
							</header>
							<main class="flex-[9.5] flex flex-col gap-y-1 overflow-hidden">
								${(() => {
									switch (this._currentTab) {
										case Tab.INFORMATION:
											if (this._showCreateEditMetadataModelInfo) {
												const edit = this.data && this.data.metadata_model && this.data.datum
												return html`
													<div class="flex-[9] flex flex-col gap-y-1 overflow-auto">
														<section class="form-control">
															<div class="join join-vertical">
																<span class="join-item join-label-primary p-1">Name</span>
																<input class="join-item input input-primary w-full" type="text" placeholder="Enter metadata-model name..." .value=${this._name || ''} @input=${this._handleInputName} />
															</div>
															${this._nameError
																? html`
																		<div class="label">
																			<span class="label-text text-error">${this._nameError}</span>
																		</div>
																		<div class="divider"></div>
																	`
																: nothing}
														</section>
														<section class="form-control">
															<div class="join join-vertical">
																<span class="join-item join-label-primary p-1">Description</span>
																<textarea class="join-item textarea textarea-primary max-h-[40vh]" placeholder="Enter metadata-model description..." .value=${this._description || ''} @input=${this._handleInputDescription}></textarea>
															</div>
															${this._descriptionError
																? html`
																		<div class="label">
																			<span class="label-text text-error">${this._descriptionError}</span>
																		</div>
																		<div class="divider"></div>
																	`
																: nothing}
														</section>
														<section class="flex justify-between">
															<span class="h-fit self-center font-bold">edit authorized?</span>
															<input class="checkbox checkbox-primary" type="checkbox" .checked=${this._editAuthorized} @input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => (this._editAuthorized = e.currentTarget.checked)} />
														</section>
														<section class="flex justify-between">
															<span class="h-fit self-center font-bold">edit unauthorized?</span>
															<input class="checkbox checkbox-primary" type="checkbox" .checked=${this._editUnauthorized} @input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => (this._editUnauthorized = e.currentTarget.checked)} />
														</section>
														<section class="flex justify-between">
															<span class="h-fit self-center font-bold">view authorized?</span>
															<input class="checkbox checkbox-primary" type="checkbox" .checked=${this._viewAuthorized} @input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => (this._viewAuthorized = e.currentTarget.checked)} />
														</section>
														<section class="flex justify-between">
															<span class="h-fit self-center font-bold">view unauthorized?</span>
															<input class="checkbox checkbox-primary" type="checkbox" .checked=${this._viewUnauthorized} @input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => (this._viewUnauthorized = e.currentTarget.checked)} />
														</section>
														<div class="divider">tags</div>
														<section class="flex flex-col gap-y-1">
															${this._tags.length > 0
																? html`
																		${this._tags.map((cmtt, index) => {
																			return html`
																				<div class="join">
																					<span class="join-item p-2 bg-primary text-primary-content flex justify-center content-center"><span>${index + 1}</span></span>
																					<input class="join-item flex-[9] input input-primary w-full" type="text" placeholder="Enter tag..." .value=${cmtt} @input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => (this._tags[index] = e.currentTarget.value)} />
																					<button class="join-item btn btn-primary w-fit" @click=${() => (this._tags = this._tags.filter((_, i) => i !== index))}>
																						<!--mdi:delete source: https://icon-sets.iconify.design-->
																						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="${Theme.Color.PRIMARY_CONTENT}" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
																					</button>
																				</div>
																			`
																		})}
																	`
																: nothing}
															<button class="btn btn-primary w-full" @click=${() => (this._tags = [...this._tags, ''])}>add tag</button>
														</section>
													</div>
													<div class="join w-full">
														<button
															class="flex-[2] join-item btn btn-secondary flex flex-col justify-center"
															@click=${() => {
																if (edit) {
																	this._handleUpdateMetadataModel()
																} else {
																	this._handleCreateMetadataModel()
																}
															}}
														>
															<!--mdi:edit source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path fill="${Theme.Color.SECONDARY_CONTENT}" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" />
															</svg>
															${(() => {
																if (this._windowWidth < 800) {
																	return nothing
																}
																return html`<div>${edit ? 'Edit' : 'Create'} Metadata-Model</div>`
															})()}
														</button>
														<button class="flex-1 join-item btn btn-secondary flex flex-col justify-center" @click=${this._resetFields}>
															<div class="flex gap-x-1 self-center w-fit">
																<!--mdi:edit source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																	<path fill="${Theme.Color.SECONDARY_CONTENT}" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" />
																</svg>
																<!--mdi:erase source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
																	<path fill="${Theme.Color.SECONDARY_CONTENT}" d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m-3 12.59L17.59 17L14 13.41L10.41 17L9 15.59L12.59 12L9 8.41L10.41 7L14 10.59L17.59 7L19 8.41L15.41 12" />
																</svg>
															</div>
															${(() => {
																if (this._windowWidth < 800) {
																	return nothing
																}
																return html`<div>Reset Metadata-Model</div>`
															})()}
														</button>
														${(() => {
															if (!this.data || !this.data.metadata_model || !this.data.datum) {
																return nothing
															}

															return html`
																<button class="flex-1 join-item btn btn-accent flex flex-col justify-center" @click=${() => (this._showCreateEditMetadataModelInfo = false)}>
																	<div class="flex gap-x-1 self-center w-fit">
																		<!--mdi:edit source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																			<path fill="${Theme.Color.ACCENT_CONTENT}" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" />
																		</svg>
																		<!--mdi:close-circle-outline source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
																			<path
																				fill="${Theme.Color.ACCENT_CONTENT}"
																				d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m2.59 6L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41z"
																			/>
																		</svg>
																	</div>
																	${(() => {
																		if (this._windowWidth < 800) {
																			return nothing
																		}
																		return html`<div>Close ${edit ? 'Edit' : 'Create'} Metadata-Model</div>`
																	})()}
																</button>
															`
														})()}
													</div>
												`
											}

											if (this.data && this.data.metadata_model && this.data.datum) {
												return this._importMMViewDatumTask.render({
													pending: () => this._pendingTaskHtmlTemplate(),
													complete: () => html`
														<div class="border-[1px] border-gray-400 flex-1 h-fit max-h-full max-w-full flex overflow-hidden rounded-md">
															<metadata-model-view-datum class="flex-1" .color=${this._colorTheme} .metadatamodel=${this.data!.metadata_model} .data=${this.data!.datum} .getmetadatamodel=${this._fieldAnyMetadataModels}></metadata-model-view-datum>
														</div>
														<div class="join w-full">
															<button class="flex-1 join-item btn btn-secondary flex flex-col justify-center" @click=${() => (this._showCreateEditMetadataModelInfo = true)}>
																<!--mdi:edit source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
																${(() => {
																	if (this._windowWidth < 800) {
																		return nothing
																	}
																	return html`<div>Edit Metadata-Model</div>`
																})()}
															</button>
															<button class="flex-1 join-item btn btn-secondary flex flex-col justify-center" @click=${this._handleDeleteMetadataModel}>
																<!--mdi:delete source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
																${(() => {
																	if (this._windowWidth < 800) {
																		return nothing
																	}
																	return html`<div>Delete Metadata-Model</div>`
																})()}
															</button>
														</div>
													`,
													error: (e) => {
														console.error(e)
														return this._errorTaskHtmlTemplate()
													}
												})
											}

											return nothing
										case Tab.PROPERTIES:
											return html`
												<div class="join join-vertical">
													<div class="join-item join-label-primary p-1">Upload metadata model (JSON)</div>
													<input
														class="join-item file-input file-input-primary"
														type="file"
														accept="application/json"
														@change=${async (e: any) => {
															if (e.target.files === null) {
																return
															}

															const fileList = e.target.files as FileList
															if (fileList.item(0)?.type !== 'application/json') {
																return
															}

															const fileText = await fileList.item(0)?.text()
															if (typeof fileText === 'undefined') {
																return
															}

															try {
																this._data = JSON.parse(fileText)
																this._datuminputsamplemetadatamodel = JSON.parse(fileText)
																this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: 'metadata model successfully uploaded' }, bubbles: true, composed: true }))
															} catch (e) {
																this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'Failed to parse json file content' }, bubbles: true, composed: true }))
																Log.Log(Log.Level.ERROR, this.localName, 'parse json failed', e)
															}
														}}
													/>
												</div>
												<button
													class="btn btn-primary"
													@click=${() => {
														const objectUrl = URL.createObjectURL(new Blob([JSON.stringify(this._data)], { type: 'application/json' }))
														const downloadLink = document.createElement('a')
														downloadLink.href = objectUrl
														downloadLink.setAttribute('download', `metadatamodel.json`)
														document.body.appendChild(downloadLink)
														downloadLink.click()
														document.body.removeChild(downloadLink)
														URL.revokeObjectURL(objectUrl)
													}}
												>
													Download metadata model
												</button>
												<div class="join join-vertical">
													<div class="join-item p-1 bg-primary text-primary-content">Color Theme</div>
													<select
														class="join-item select select-primary w-full"
														@change=${(e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
															this._colorTheme = e.currentTarget.value as Theme.Color
														}}
													>
														<option value="${Theme.Color.PRIMARY}" .selected=${this._colorTheme === Theme.Color.PRIMARY}>Primary</option>
														<option value="${Theme.Color.SECONDARY}" .selected=${this._colorTheme === Theme.Color.SECONDARY}>Secondary</option>
														<option value="${Theme.Color.ACCENT}" .selected=${this._colorTheme === Theme.Color.ACCENT}>Accent</option>
													</select>
												</div>
											`
										case Tab.BUILD:
											return this._importMMBuildTask.render({
												pending: () => this._pendingTaskHtmlTemplate(),
												complete: () => html`
													<metadata-model-build
														class="flex-[9] flex flex-col rounded-md bg-gray-100 shadow-inner shadow-gray-800 p-1"
														.metadatamodel=${this._data}
														.startcolor=${this._colorTheme}
														@metadata-model-build:updatemetadatamodel=${(e: CustomEvent) => {
															this._data = structuredClone(e.detail.value)
															this._datuminputsamplemetadatamodel = structuredClone(e.detail.value)
														}}
														@metadata-model-build:notification=${(e: CustomEvent) => {
															this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: e.detail.type, toastMessage: e.detail.value }, bubbles: true, composed: true }))
														}}
													></metadata-model-build>
												`,
												error: (e) => {
													console.error(e)
													return this._errorTaskHtmlTemplate()
												}
											})
										case Tab.VIEW:
											return this._viewHtmlTemplate()
										default:
											return html`tab not implemented`
									}
								})()}
							</main>
						</section>
					`
				} else {
					return nothing
				}
			})()}
			${(() => {
				if (this._windowWidth > 1000) {
					return html`
						<section id="right-section" class="flex-1 flex flex-col rounded-md shadow-md shadow-gray-800 bg-white p-1 gap-y-1 overflow-hidden">
							<header class="flex justify-between">
								<div class="font-bold text-lg h-fit self-center">View metadata-model</div>
								<button class="btn btn-circle btn-ghost self-center" @click=${() => (this._expandRightSection = !this._expandRightSection)}>
									${(() => {
										if (this._expandRightSection) {
											return html`
												<!--mdi:expand-vertical source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M18.17 12L15 8.83l1.41-1.42L21 12l-4.59 4.58L15 15.17zM5.83 12L9 15.17l-1.41 1.42L3 12l4.59-4.58L9 8.83z" /></svg>
											`
										}

										return html`
											<!--mdi:collapse-vertical source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M5.41 7.41L10 12l-4.59 4.59L4 15.17L7.17 12L4 8.83zm13.18 9.18L14 12l4.59-4.58L20 8.83L16.83 12L20 15.17z" /></svg>
										`
									})()}
								</button>
							</header>
							${this._viewHtmlTemplate()}
						</section>
					`
				}
				return nothing
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-page': Page
	}
}
