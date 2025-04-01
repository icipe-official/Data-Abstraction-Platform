import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import Entities from '@domentities'
import Lib from '@lib/lib'
import Log from '@lib/log'
import Url from '@lib/url'
import { IMetadataModelSearchController } from '@dominterfaces/controllers/metadata_model'
import { MetadataModelSearchController } from '@interfaces/controllers/metadata_model'
import { Task } from '@lit/task'
import { IAppContextConsumer } from '@dominterfaces/context/app'
import { AppContextConsumer } from '@interfaces/context/app'
import MetadataModel from '@lib/metadata_model'
import MetadataModelUtils from '@lib/metadata_model_utils'
import Theme from '@lib/theme'
import { IFieldAnyMetadataModelGet } from '@dominterfaces/field_any_metadata_model/field_any_metadata_model'
import { FieldAnyMetadataModel } from '@interfaces/field_any_metadata_model/field_any_metadata_model'

@customElement('create-storage-files')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	private _appContext: IAppContextConsumer
	private _fieldAnyMetadataModels: IFieldAnyMetadataModelGet

	constructor() {
		super()
		this._appContext = new AppContextConsumer(this)
		this._fieldAnyMetadataModels = new FieldAnyMetadataModel()
	}

	@state() private _tags: string[] = []
	private _files: FileList | null = null

	@state() private _createStorageFliesStep: number = 0

	@state() private _storageDrivesGroupsShowQueryPanel = false
	private _storageDrivesGroupsSearch?: IMetadataModelSearchController
	@state() _storageDrivesGroupsQueryConditions: MetadataModel.QueryConditions[] = []
	@state() private _storageDrivesGroupsFilterExcludeIndexes: number[] = []
	@state() private _selectedStorageDrivesGroupsIndexes: number[] = []
	private _setupStorageDrivesGroupsSearchTask = new Task(this, {
		task: async ([step], { signal }) => {
			if (step !== 0) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, 'this._setupStorageDrivesGroupsSearchTask')

			if (!this._storageDrivesGroupsSearch) {
				this._storageDrivesGroupsSearch = new MetadataModelSearchController(this, `${Url.ApiUrlPaths.Storage.Drives.Groups}${Url.MetadataModelSearchGetMMPath}`, `${Url.ApiUrlPaths.Storage.Drives.Groups}${Url.MetadataModelSearchPath}`)
			}

			if (Object.keys(this._storageDrivesGroupsSearch.searchmetadatamodel).length === 0) {
				await this._storageDrivesGroupsSearch.FetchMetadataModel(this._appContext.appcontext?.iamdirectorygroupid, this._appContext.appcontext?.targetjoindepth || 1, signal)
			}
		},
		args: () => [this._createStorageFliesStep]
	})

	private async _handleUploadStorageFiles() {
		if (!this._appContext.GetCurrentdirectorygroupid()) {
			return
		}

		if (this._files === null || this._selectedStorageDrivesGroupsIndexes.length === 0) {
			return
		}

		this._tags = this._tags.filter((t) => t.length > 0)
		let noOfFilesProcessed = 1
		let noOfFilesUploadedSuccessfully = 0
		let fileUploadErrors: string[] = []
		let uploadedStorageFiles: Entities.StorageFiles.Interface[] = []
		for (const f of this._files) {
			const storageDriveGroup: Entities.StorageDrivesGroups.Interface = this._storageDrivesGroupsSearch!.searchresults!.data![this._selectedStorageDrivesGroupsIndexes[0]]
			let formData = new FormData()
			formData.append(Entities.StorageFiles.FieldColumn.StorageDrivesID, storageDriveGroup.storage_drives_id![0])
			formData.append(Entities.StorageFiles.FieldColumn.DirectoryGroupsID, storageDriveGroup.directory_groups_id![0])
			formData.append(Entities.StorageFiles.RepositoryName, f)
			if (this._tags.length > 0) {
				formData.append(Entities.StorageFiles.FieldColumn.Tags, this._tags.join(','))
			}

			const fetchUrl = new URL(`${Url.ApiUrlPaths.Storage.Files}/${Url.Action.CREATE}`)
			fetchUrl.searchParams.append(Url.SearchParams.DIRECTORY_GROUP_ID, this._appContext.GetCurrentdirectorygroupid()!)
			fetchUrl.searchParams.append(Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this._appContext.Getauthcontextdirectorygroupid())

			Log.Log(Log.Level.DEBUG, this.localName, fetchUrl, formData)

			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: `uploading ${noOfFilesProcessed}/${this._files.length} files..` }, bubbles: true, composed: true }))
			try {
				const fetchResponse = await fetch(fetchUrl, {
					method: 'POST',
					credentials: 'include',
					body: formData
				})

				const fetchData = await fetchResponse.json()
				if (fetchResponse.ok) {
					noOfFilesUploadedSuccessfully += 1
					uploadedStorageFiles.push(fetchData)
				} else {
					fileUploadErrors = [...fileUploadErrors, `${noOfFilesProcessed} (${f.name}): ${fetchResponse.status}-${fetchData.message}`]
				}
			} catch (e) {
				Log.Log(Log.Level.ERROR, this.localName, 'upload file failed', e)
			} finally {
				noOfFilesProcessed += 1
			}
		}
		this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: false, loadingMessage: null }, bubbles: true, composed: true }))
		if (fileUploadErrors.length > 0) {
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: [`uploaded ${noOfFilesUploadedSuccessfully}/${noOfFilesProcessed - 1} successfuly`, ...fileUploadErrors] }, bubbles: true, composed: true }))
		} else {
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.INFO, toastMessage: `uploaded ${noOfFilesUploadedSuccessfully}/${noOfFilesProcessed - 1} successfuly` }, bubbles: true, composed: true }))
			this._resetFields()
		}
		this.dispatchEvent(
			new CustomEvent('create-storage-files:uploadedfiles', {
				detail: {
					value: uploadedStorageFiles
				}
			})
		)
	}

	private _resetFields() {
		this._tags = []
		this._files = null
	}

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth
	}

	connectedCallback(): void {
		super.connectedCallback()
		window.addEventListener('resize', this._handleWindowResize)
	}

	disconnectedCallback(): void {
		window.removeEventListener('resize', this._handleWindowResize)
		super.disconnectedCallback()
	}

	private _mmQueryPanelImported = false
	private _importMMQueryPanel = new Task(this, {
		task: async ([showQueryPanel]) => {
			if (this._mmQueryPanelImported || !showQueryPanel) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importMMQueryPanel')

			await import('@lib/components/metadata-model/view/query-panel/component')
			this._mmQueryPanelImported = true
		},
		args: () => [this._storageDrivesGroupsShowQueryPanel]
	})

	private _mmTableImported = false
	private _importMMTableTask = new Task(this, {
		task: async ([mmsearchResultsData]) => {
			if (this._mmTableImported || !mmsearchResultsData || mmsearchResultsData.length === 0) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importMMTableTask')

			await import('@lib/components/metadata-model/view/table/component')
			this._mmTableImported = true
		},
		args: () => [this._storageDrivesGroupsSearch?.searchresults.data]
	})

	protected render(): unknown {
		return html`
			<nav class="w-fit steps self-center h-fit z-[1]">
				<button
					class="step ${this._createStorageFliesStep >= 0 ? 'step-secondary' : ''}"
					@click=${(e: Event) => {
						e.preventDefault()
						this._createStorageFliesStep = 0
					}}
				>
					<div class="break-words pl-4 pr-4">Pick Storage Drive</div>
				</button>
				<button
					class="step ${this._createStorageFliesStep >= 1 ? 'step-secondary' : ''}"
					@click=${(e: Event) => {
						e.preventDefault()
						this._createStorageFliesStep = 1
					}}
				>
					<div class="break-words pl-4 pr-4">Choose File(s)</div>
				</button>
				<button
					class="step ${this._createStorageFliesStep >= 2 ? 'step-secondary' : ''}"
					@click=${(e: Event) => {
						e.preventDefault()
						this._createStorageFliesStep = 2
					}}
				>
					<div class="break-words pl-4 pr-4">Upload Files</div>
				</button>
			</nav>
			<main class="flex-[9] flex flex-col gap-y-1 overflow-hidden rounded-md">
				${(() => {
					switch (this._createStorageFliesStep) {
						case 0:
							return this._setupStorageDrivesGroupsSearchTask.render({
								pending: () => html`
									<div class="flex-1 flex flex-col justify-center items-center text-xl gap-y-5">
										<div class="flex">
											<span class="loading loading-ball loading-sm text-accent"></span>
											<span class="loading loading-ball loading-md text-secondary"></span>
											<span class="loading loading-ball loading-lg text-primary"></span>
										</div>
									</div>
								`,
								complete: () => html`
									<section class="flex-[9] flex gap-x-1 overflow-hidden">
										${(() => {
											if (!this._storageDrivesGroupsShowQueryPanel) {
												return nothing
											}

											return html`
												<div class="flex-[2] flex overflow-hidden shadow-inner shadow-gray-800 rounded-md">
													${this._importMMQueryPanel.render({
														pending: () => html`
															<div class="flex-1 flex flex-col justify-center items-center text-xl gap-y-5">
																<div class="flex">
																	<span class="loading loading-ball loading-sm text-accent"></span>
																	<span class="loading loading-ball loading-md text-secondary"></span>
																	<span class="loading loading-ball loading-lg text-primary"></span>
																</div>
															</div>
														`,
														complete: () => html`
															<metadata-model-view-query-panel
																.metadatamodel=${this._storageDrivesGroupsSearch!.searchmetadatamodel}
																.queryconditions=${this._storageDrivesGroupsQueryConditions}
																@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
																	this._storageDrivesGroupsSearch!.UpdateMetadatamodel(e.detail.value)
																}}
																@metadata-model-view-query-panel:updatequeryconditions=${(e: CustomEvent) => {
																	this._storageDrivesGroupsQueryConditions = structuredClone(e.detail.value)
																}}
															></metadata-model-view-query-panel>
														`,
														error: (e) => {
															console.error(e)
															return html`
																<div class="flex-[2] flex flex-col justify-center items-center shadow-inner shadow-gray-800 rounded-md p-1">
																	<span class="w-fit text-error font-bold">Error: Could not get metadata-model query panel component.</span>
																</div>
															`
														}
													})}
												</div>
											`
										})()}
										${(() => {
											if (this._windowWidth < 1000 && this._storageDrivesGroupsShowQueryPanel) {
												return nothing
											}

											return html`
												<div class="flex-[3] flex flex-col gap-y-2 overflow-hidden">
													${(() => {
														if (this._storageDrivesGroupsSearch!.searchmetadatamodel && this._storageDrivesGroupsSearch!.searchresults.data && this._storageDrivesGroupsSearch!.searchresults.data.length > 0) {
															return this._importMMTableTask.render({
																pending: () => html`
																	<div class="flex-1 flex flex-col justify-center items-center text-xl gap-y-5">
																		<div class="flex">
																			<span class="loading loading-ball loading-sm text-accent"></span>
																			<span class="loading loading-ball loading-md text-secondary"></span>
																			<span class="loading loading-ball loading-lg text-primary"></span>
																		</div>
																	</div>
																`,
																complete: () => html`
																	<div class="grow-[9] border-[1px] border-gray-400 rounded-md h-fit max-h-full max-w-full flex overflow-hidden">
																		<metadata-model-view-table
																			.metadatamodel=${this._storageDrivesGroupsSearch!.searchmetadatamodel}
																			.data=${this._storageDrivesGroupsSearch!.searchresults.data!}
																			.getmetadatamodel=${this._fieldAnyMetadataModels}
																			.filterexcludeindexes=${this._storageDrivesGroupsFilterExcludeIndexes}
																			.addselectcolumn=${true}
																			.addclickcolumn=${false}
																			.selecteddataindexes=${this._selectedStorageDrivesGroupsIndexes}
																			.multiselectcolumns=${false}
																			@metadata-model-view-table:selecteddataindexesupdate=${(e: CustomEvent) => {
																				this._selectedStorageDrivesGroupsIndexes = structuredClone(e.detail.value)
																			}}
																		></metadata-model-view-table>
																	</div>
																`,
																error: (e) => {
																	console.error(e)
																	return html`
																		<div class="flex-[2] flex flex-col justify-center items-center shadow-inner shadow-gray-800 rounded-md p-1">
																			<span class="w-fit text-error font-bold">Error: Could not get table component.</span>
																		</div>
																	`
																}
															})
														}
													})()}
													<section class="shrink-[9] overflow-auto flex justify-center bg-gray-300 rounded-md w-full h-full min-h-[100px]">
														<div class="self-center flex-1 flex flex-col max-md:max-w-[80%] min-w-fit min-h-fit gap-y-10">
															<div class="text-xl font-bold break-words text-center">Step 1: Pick the storage drive you'd like to store files in.</div>
														</div>
													</section>
												</div>
											`
										})()}
									</section>
									<div class="join md:min-w-[30%] max-md:w-full self-center">
										${(() => {
											if (this._storageDrivesGroupsSearch!.searchmetadatamodel && this._storageDrivesGroupsSearch!.searchresults.data && this._storageDrivesGroupsSearch!.searchresults.data.length > 0) {
												return html`
													<button
														class="flex-1 join-item btn btn-secondary min-h-fit h-fit min-w-fit w-fit flex flex-col gap-y-1"
														@click=${(e: Event) => {
															e.preventDefault()
															this._storageDrivesGroupsFilterExcludeIndexes = structuredClone(MetadataModel.FilterData(this._storageDrivesGroupsQueryConditions, this._storageDrivesGroupsSearch!.searchresults.data!))
															this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.INFO, toastMessage: `${this._storageDrivesGroupsFilterExcludeIndexes.length} filtered out` }, bubbles: true, composed: true }))
														}}
													>
														<div class="flex gap-x-1 self-center">
															<!--mdi:search source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
																<path fill="${Theme.Color.SECONDARY_CONTENT}" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
															</svg>
															<!--mdi:devices source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
																<path
																	fill="${Theme.Color.SECONDARY_CONTENT}"
																	d="M3 6h18V4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3zm10 6H9v1.78c-.61.55-1 1.33-1 2.22s.39 1.67 1 2.22V20h4v-1.78c.61-.55 1-1.34 1-2.22s-.39-1.67-1-2.22zm-2 5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5M22 8h-6c-.5 0-1 .5-1 1v10c0 .5.5 1 1 1h6c.5 0 1-.5 1-1V9c0-.5-.5-1-1-1m-1 10h-4v-8h4z"
																/>
															</svg>
														</div>
														${(() => {
															if (this._windowWidth < 700) {
																return nothing
															}
															return html`<div class="text-center text-sm font-bold text-secondary-content break-words">Search local results</div>`
														})()}
													</button>
												`
											}

											return nothing
										})()}
										<button
											class="flex-1 join-item btn btn-secondary min-h-fit h-fit min-w-fit w-fit flex flex-col gap-y-1"
											@click=${async () => {
												let newQc: MetadataModel.QueryConditions = {}
												newQc['$.directory_groups_id'] = {
													[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: Entities.StorageDrivesGroups.FieldColumn.DirectoryGroupsID,
													[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: this._storageDrivesGroupsSearch!.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
													[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
														[
															{
																[MetadataModel.FConditionProperties.NEGATE]: false,
																[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.EQUAL_TO,
																[MetadataModel.FConditionProperties.VALUE]: {
																	[MetadataModel.FSelectProperties.TYPE]: MetadataModel.FSelectType.TEXT,
																	[MetadataModel.FSelectProperties.VALUE]: this._appContext.GetCurrentdirectorygroupid()
																}
															}
														]
													]
												}

												try {
													this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: 'Searching...' }, bubbles: true, composed: true }))
													await this._storageDrivesGroupsSearch!.Search(
														Object.keys(newQc).length > 0 ? MetadataModelUtils.InsertNewQueryConditionToQueryConditions(newQc, this._storageDrivesGroupsQueryConditions) : this._storageDrivesGroupsQueryConditions,
														this._appContext.appcontext?.iamdirectorygroupid,
														this._appContext.GetCurrentdirectorygroupid(),
														this._appContext.appcontext?.targetjoindepth || 1,
														this._appContext.appcontext?.skipiffgdisabled || true,
														this._appContext.appcontext?.skipifdataextraction || true,
														undefined
													)

													window.dispatchEvent(
														new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, {
															detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: `${Array.isArray(this._storageDrivesGroupsSearch!.searchresults.data) ? this._storageDrivesGroupsSearch!.searchresults.data.length : 0} results found` },
															bubbles: true,
															composed: true
														})
													)
												} catch (e) {
													console.error(e)
													if (Array.isArray(e)) {
														if (e[1] && typeof e[1] == 'object' && e[1].message) {
															this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: `${e[0]}: ${e[1].message}` }, bubbles: true, composed: true }))
														}
													}
													this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: Lib.DEFAULT_FETCH_ERROR }, bubbles: true, composed: true }))
												} finally {
													this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: null, loadingMessage: null }, bubbles: true, composed: true }))
												}
											}}
										>
											<!--mdi:search-web source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
												<path
													fill="${Theme.Color.SECONDARY_CONTENT}"
													d="m15.5 14l5 5l-1.5 1.5l-5-5v-.79l-.27-.28A6.47 6.47 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.57 4.23l.28.27zm-6-9.5l-.55.03c-.24.52-.61 1.4-.88 2.47h2.86c-.27-1.07-.64-1.95-.88-2.47c-.18-.03-.36-.03-.55-.03M13.83 7a4.94 4.94 0 0 0-2.68-2.22c.24.53.55 1.3.78 2.22zM5.17 7h1.9c.23-.92.54-1.69.78-2.22A4.94 4.94 0 0 0 5.17 7M4.5 9.5c0 .5.08 1.03.23 1.5h2.14l-.12-1.5l.12-1.5H4.73c-.15.47-.23 1-.23 1.5m9.77 1.5c.15-.47.23-1 .23-1.5s-.08-1.03-.23-1.5h-2.14a9.5 9.5 0 0 1 0 3zm-6.4-3l-.12 1.5l.12 1.5h3.26a9.5 9.5 0 0 0 0-3zm1.63 6.5c.18 0 .36 0 .53-.03c.25-.52.63-1.4.9-2.47H8.07c.27 1.07.65 1.95.9 2.47zm4.33-2.5h-1.9c-.23.92-.54 1.69-.78 2.22A4.94 4.94 0 0 0 13.83 12m-8.66 0a4.94 4.94 0 0 0 2.68 2.22c-.24-.53-.55-1.3-.78-2.22z"
												/>
											</svg>
											${(() => {
												if (this._windowWidth < 700) {
													return nothing
												}
												return html`<div class="text-center text-sm font-bold text-secondary-content break-words">Search database</div>`
											})()}
										</button>
										<button
											class="flex-1 join-item btn btn-secondary min-h-fit h-fit min-w-fit w-fit flex flex-col gap-y-1"
											@click=${(e: Event) => {
												e.preventDefault()
												this._storageDrivesGroupsShowQueryPanel = !this._storageDrivesGroupsShowQueryPanel
											}}
										>
											<div class="flex gap-x-1 self-center">
												<!--mdi:filter source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
													<path fill="${Theme.Color.SECONDARY_CONTENT}" d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z" />
												</svg>
												${(() => {
													if (this._storageDrivesGroupsShowQueryPanel) {
														return html`
															<!--mdi:eye source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path fill="${Theme.Color.SECONDARY_CONTENT}" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
															</svg>
														`
													}

													return html`
														<!--mdi:eye-off source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
															<path
																fill="${Theme.Color.SECONDARY_CONTENT}"
																d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
															/>
														</svg>
													`
												})()}
											</div>
											${(() => {
												if (this._windowWidth < 700) {
													return nothing
												}
												return html`<div class="text-center text-sm font-bold text-secondary-content break-words">${this._storageDrivesGroupsShowQueryPanel ? 'Hide' : 'Show'} Filter Query Panel</div>`
											})()}
										</button>
									</div>
								`,
								error: (e) => {
									console.error(e)
									return html`
										<div class="flex-[2] flex flex-col justify-center items-center shadow-inner shadow-gray-800 rounded-md p-1">
											<span class="w-fit text-error font-bold">Error: Could not get storage drives groups metadata-model.</span>
										</div>
									`
								}
							})
						case 1:
							return html`
								<section class="md:max-w-[50%] w-full flex-1 overflow-hidden self-center flex flex-col gap-y-1">
									<section>
										<input id="file-upload-input-field" class="file-input file-input-primary w-full" type="file" .files=${this._files} multiple @change=${(e: any) => (this._files = e.target.files)} />
									</section>
									<div class="divider">tags</div>
									<section class="flex flex-col gap-y-1 overflow-auto">
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
									</section>
									<button class="btn btn-primary w-full" @click=${() => (this._tags = [...this._tags, ''])}>add tag</button>
								</section>
							`
						case 2:
							return html`
								<section class="flex-1 flex justify-center bg-gray-300 rounded-md w-full h-full min-h-[100px]">
									<div class="flex flex-col gap-y-4 h-fit self-center">
										<button
											class="btn btn-secondary self-center md:min-w-[30%] max-md:w-full p-2 min-h-fit h-fit"
											@click=${() => {
												this._handleUploadStorageFiles()
											}}
											.disabled=${this._selectedStorageDrivesGroupsIndexes.length === 0 || this._files === null}
										>
											Upload Storage Files
										</button>
									</div>
								</section>
							`
					}
				})()}
			</main>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'create-storage-files': Component
	}
}
