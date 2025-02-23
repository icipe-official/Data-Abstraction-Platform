import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import pageCss from './page.css?inline'
import MetadataModel from '$src/lib/metadata_model'
import Misc from '$src/lib/miscellaneous'
import Log from '$src/lib/log'
import Theme from '$src/lib/theme'
import Papa from 'papaparse'
import { Task } from '@lit/task'

enum Tab {
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

	@property({ type: Object }) data: MetadataModel.ISearchResults | null = null

	private _currentDirectoryGroupID: string | null = null

	@state() private _currentTab: Tab = Tab.PROPERTIES

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

	private _importMMDatumInputTask = new Task(this, {
		task: async () => {
			await import('$src/lib/components/metadata-model/datum-input/component')
		},
		args: () => []
	})

	private _importMMTableTask = new Task(this, {
		task: async () => {
			await import('$src/lib/components/metadata-model/view/table/component')
		},
		args: () => []
	})

	private _importMMQueryPanelTask = new Task(this, {
		task: async () => {
			await import('$src/lib/components/metadata-model/view/query-panel/component')
		},
		args: () => []
	})

	private _importMMBuildTask = new Task(this, {
		task: async () => {
			await import('$src/lib/components/metadata-model/build/component')
		},
		args: () => []
	})

	private _importMMViewDatumTask = new Task(this, {
		task: async () => {
			await import('$src/lib/components/metadata-model/view/datum/component')
		},
		args: () => []
	})

	private _pendingTaskHtmlTemplate = () => html`
		<div class="flex-1 flex flex-col justify-center items-center text-xl space-y-5">
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
			<div class="flex justify-between space-x-1 z-[2]">
				<div class="flex-[9] h-fit self-center w-fit flex space-x-1">
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
				<div class="flex space-x-1">
					<div class="flex flex-col">
						<button
							class="btn btn-ghost min-h-fit min-w-fit h-fit w-fit p-1"
							@click=${() => {
								this._showSampleDataExportButton = !this._showSampleDataExportButton
							}}
						>
							<!--mdi:file-export source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m-1 1.5L18.5 9H13m-4.07 3.22H16v7.07l-2.12-2.12L11.05 20l-2.83-2.83l2.83-2.82" /></svg>
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
														window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.SUCCESS, toastMessage: ['create csv file failed', JSON.stringify(e)] }, bubbles: true, composed: true }))
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
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6m-1 1.5L18.5 9H13m-2.95 2.22l2.83 2.83L15 11.93V19H7.93l2.12-2.12l-2.83-2.83" /></svg>
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
																window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.SUCCESS, toastMessage: 'upload json data as sample input data successful' }, bubbles: true, composed: true }))
																this._showSampleDataImportButton = false
															} catch (e) {
																window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.ERROR, toastMessage: 'Failed to parse json file content' }, bubbles: true, composed: true }))
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
																window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.SUCCESS, toastMessage: ['read csv data failed', JSON.stringify(e)] }, bubbles: true, composed: true }))
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
										<metadata-model-view-table .color=${this._colorTheme} .metadatamodel=${this._datuminputsamplemetadatamodel} .data=${this._datuminputsampledata}></metadata-model-view-table>
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
										<metadata-model-view-datum class="flex-1" .color=${this._colorTheme} .metadatamodel=${this._datuminputsamplemetadatamodel} .data=${this._datuminputsampledata[this._currentDatumInputSampleDataIndex]}></metadata-model-view-datum>
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

	connectedCallback(): void {
		super.connectedCallback()
		window.addEventListener('resize', this._handleWindowResize)
		this._currentDirectoryGroupID = Misc.CurrentDirectoryGroupID(window.location.toString())
	}

	disconnectedCallback(): void {
		window.removeEventListener('resize', this._handleWindowResize)
		super.disconnectedCallback()
	}

	protected render(): unknown {
		return html`
			${(() => {
				if (!this._expandRightSection || this._windowWidth <= 1000) {
					return html`
						<section id="left-section" class="flex-1 flex flex-col rounded-md shadow-md shadow-gray-800 bg-white p-1 space-y-1 overflow-hidden">
							<header role="tablist" class="tabs tabs-bordered">
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
							<main class="flex-[9.5] flex flex-col space-y-1 overflow-hidden">
								${(() => {
									switch (this._currentTab) {
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
																window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.SUCCESS, toastMessage: 'metadata model successfully uploaded' }, bubbles: true, composed: true }))
															} catch (e) {
																window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.ERROR, toastMessage: 'Failed to parse json file content' }, bubbles: true, composed: true }))
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
															window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: e.detail.type, toastMessage: e.detail.value }, bubbles: true, composed: true }))
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
						<section id="right-section" class="flex-1 flex flex-col rounded-md shadow-md shadow-gray-800 bg-white p-1 space-y-1 overflow-hidden">
							<header class="flex justify-between">
								<div class="font-bold text-lg h-fit self-center">View metadata-model</div>
								<button class="btn btn-circle btn-ghost self-center" @click=${() => (this._expandRightSection = !this._expandRightSection)}>
									${(() => {
										if (this._expandRightSection) {
											return html`
												<!--mdi:expand-vertical source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="black" d="M18.17 12L15 8.83l1.41-1.42L21 12l-4.59 4.58L15 15.17zM5.83 12L9 15.17l-1.41 1.42L3 12l4.59-4.58L9 8.83z" /></svg>
											`
										}

										return html`
											<!--mdi:collapse-vertical source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="black" d="M5.41 7.41L10 12l-4.59 4.59L4 15.17L7.17 12L4 8.83zm13.18 9.18L14 12l4.59-4.58L20 8.83L16.83 12L20 15.17z" /></svg>
										`
									})()}
								</button>
							</header>
							${this._viewHtmlTemplate()}
						</section>
					`
				} else {
					return nothing
				}
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-page': Page
	}
}
