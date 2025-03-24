import Entities from '@domentities'
import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import pageCss from './page.css?inline'
import { IAppContextConsumer } from '@dominterfaces/context/app'
import { IFieldAnyMetadataModelGet } from '@dominterfaces/field_any_metadata_model/field_any_metadata_model'
import { ISpaPageNavigation } from '@dominterfaces/spa_page_navigation/spa_page_navigation'
import { AppContextConsumer, AppContextProvider } from '@interfaces/context/app'
import { FieldAnyMetadataModel } from '@interfaces/field_any_metadata_model/field_any_metadata_model'
import { SpaPageNavigation } from '@interfaces/spa_page_navigation/spa_page_navigation'
import MetadataModel from '@lib/metadata_model'
import { Task } from '@lit/task'
import Log from '@lib/log'
import Theme from '@lib/theme'
import Lib from '@lib/lib'
import Url from '@lib/url'
import { IMetadataModelSearchController } from '@dominterfaces/controllers/metadata_model'
import { MetadataModelSearchController } from '@interfaces/controllers/metadata_model'
import Json from '@lib/json'

@customElement('abstractions-directory-group')
class Page extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(pageCss)]

	@property({ type: Object }) data: Entities.MetadataModel.IDatum | undefined = undefined

	private _pageNavigation: ISpaPageNavigation
	private _appContext: IAppContextConsumer
	private _fieldAnyMetadataModels: IFieldAnyMetadataModelGet

	constructor() {
		super()
		this._appContext = new AppContextConsumer(this)
		this._fieldAnyMetadataModels = new FieldAnyMetadataModel()
		this._pageNavigation = new SpaPageNavigation(new AppContextProvider(undefined))
	}

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth
	}

	@state() private _showCreateEdit = false

	private _importedMMViewDatum = false
	private _importMMViewDatumTask = new Task(this, {
		task: async ([data, _showCreateEdit]) => {
			if (this._importedMMViewDatum || (_showCreateEdit && (!(data as Entities.MetadataModel.IDatum) || !(data as Entities.MetadataModel.IDatum).metadata_model || !(data as Entities.MetadataModel.IDatum).datum))) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importMMViewDatumTask')
			this._importedMMViewDatum = true
			await import('@lib/components/metadata-model/view/datum/component')
		},
		args: () => [this.data, this._showCreateEdit]
	})

	private _importedIntroPoster = false
	private _importIntroPosterTask = new Task(this, {
		task: async ([_windowWidth]) => {
			if (this._importedIntroPoster || _windowWidth < 1000) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importIntroPosterTask')
			this._importedIntroPoster = true
			await import('@lib/components/intro-poster/component')
		},
		args: () => [this._windowWidth]
	})

	@state() private _editMetadataModelID: boolean = false

	@state() private _metadataModelsID: string = ''
	@state() private _description: string = ''
	@state() private _abstractionsReviewQuorum: number = 0
	@state() private _viewAuthorized: boolean = true
	@state() private _viewUnauthorized: boolean = false

	private _resetFields() {
		this._metadataModelsID = ''
		this._description = ''
		this._abstractionsReviewQuorum = 0
		this._viewAuthorized = true
		this._viewUnauthorized = false
	}

	connectedCallback(): void {
		super.connectedCallback()
		window.addEventListener('resize', this._handleWindowResize)
		if (this.data && this.data.metadata_model && this.data.datum) {
			let value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.AbstractionsDirectoryGroups.FieldColumn.MetadataModelsID, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._metadataModelsID = structuredClone(value[0])
			}

			value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.AbstractionsDirectoryGroups.FieldColumn.Description, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._description = structuredClone(value[0])
			}

			value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.AbstractionsDirectoryGroups.FieldColumn.AbstractionReviewQuorum, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._abstractionsReviewQuorum = structuredClone(value[0])
			}

			value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.AbstractionsDirectoryGroups.FieldColumn.ViewAuthorized, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._viewAuthorized = structuredClone(value[0])
			}

			value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.AbstractionsDirectoryGroups.FieldColumn.ViewUnauthorized, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._viewUnauthorized = structuredClone(value[0])
			}
		} else {
			this._showCreateEdit = true
		}
	}

	disconnectedCallback(): void {
		window.removeEventListener('resize', this._handleWindowResize)
		super.disconnectedCallback()
	}

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

	private async _handleDeleteAbstractionsDirectoryGroups() {
		if (!this.data || !this.data.datum) {
			return
		}

		this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: `Deleting ${Entities.AbstractionsDirectoryGroups.RepositoryName}` }, bubbles: true, composed: true }))
		try {
			if (!this._appContext.GetCurrentdirectorygroupid()) {
				return
			}
			const fetchUrl = new URL(`${Url.ApiUrlPaths.Abstractions.DirectoryGroups}/${Url.Action.DELETE}`)
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
								let url = new URL(Url.WebsitePaths.Abstractions.DirectoryGroups, window.location.origin)
								url.searchParams.append(Url.SearchParams.DIRECTORY_GROUP_ID, dgid)
								Url.AddBaseUrl(url)
								await this._pageNavigation.Navigate(targetElement, url, 'Abstractions Directory Groups')
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

	private async _handleUpdateAbstractionsDirectoryGroups() {
		if (!this.data || !this.data.datum) {
			return
		}

		let data: Entities.AbstractionsDirectoryGroups.Interface = {
			directory_groups_id: (this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).directory_groups_id
		}

		if (this._metadataModelsID.length > 0) {
			if (!Json.AreValuesEqual([this._metadataModelsID], (this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).metadata_models_id)) {
				data.metadata_models_id = [this._metadataModelsID]
			}
		}

		if (!Json.AreValuesEqual([this._description], (this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).description)) {
			data.description = [this._description]
		}

		if (!Json.AreValuesEqual([this._abstractionsReviewQuorum], (this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).abstraction_review_quorum)) {
			data.abstraction_review_quorum = [this._abstractionsReviewQuorum]
		}

		if (!Json.AreValuesEqual([this._viewAuthorized], (this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).view_authorized)) {
			data.view_authorized = [this._viewAuthorized]
		}

		if (!Json.AreValuesEqual([this._viewUnauthorized], (this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).view_unauthorized)) {
			data.view_unauthorized = [this._viewUnauthorized]
		}

		this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: `Updating ${Entities.AbstractionsDirectoryGroups.RepositoryName}` }, bubbles: true, composed: true }))
		try {
			if (!this._appContext.GetCurrentdirectorygroupid()) {
				return
			}
			const fetchUrl = new URL(`${Url.ApiUrlPaths.Abstractions.DirectoryGroups}/${Url.Action.UPDATE}`)
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
					if (!Json.AreValuesEqual([this._metadataModelsID], (this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).metadata_models_id)) {
						;(this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).metadata_models_id = [this._metadataModelsID]
					}

					if (!Json.AreValuesEqual([this._description], (this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).description)) {
						;(this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).description = [this._description]
					}

					if (!Json.AreValuesEqual([this._abstractionsReviewQuorum], (this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).abstraction_review_quorum)) {
						;(this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).abstraction_review_quorum = [this._abstractionsReviewQuorum]
					}

					if (!Json.AreValuesEqual([this._viewAuthorized], (this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).view_authorized)) {
						;(this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).view_authorized = [this._viewAuthorized]
					}

					if (!Json.AreValuesEqual([this._viewUnauthorized], (this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).view_unauthorized)) {
						;(this.data.datum as Entities.AbstractionsDirectoryGroups.Interface).view_unauthorized = [this._viewUnauthorized]
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

	private async _handleCreateAbstractionsDirectoryGroups() {
		if (!this._appContext.GetCurrentdirectorygroupid()) {
			return 
		}
		let data: Entities.AbstractionsDirectoryGroups.Interface = {
			directory_groups_id: [this._appContext.GetCurrentdirectorygroupid()!]
		}

		if (this._metadataModelsID.length > 0) {
			data.metadata_models_id = [this._metadataModelsID]
		} else {
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: `${Entities.AbstractionsDirectoryGroups.FieldColumn.MetadataModelsID} is not valid` }, bubbles: true, composed: true }))
			return
		}

		if (this._description.length > 0) {
			data.description = [this._description]
		}

		data.abstraction_review_quorum = [this._abstractionsReviewQuorum]
		data.view_authorized = [this._viewAuthorized]
		data.view_unauthorized = [this._viewUnauthorized]

		this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: `Creating new ${Entities.Directory.RepositoryName}` }, bubbles: true, composed: true }))
		try {
			if (!this._appContext.GetCurrentdirectorygroupid()) {
				return
			}
			const fetchUrl = new URL(`${Url.ApiUrlPaths.Abstractions.DirectoryGroups}/${Url.Action.CREATE}`)
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

	@state() private _metadataModelsShowQueryPanel = false
	private _metadataModelsSearch?: IMetadataModelSearchController
	@state() _metadataModelsQueryConditions: MetadataModel.QueryConditions[] = []
	@state() private _metadataModelsFilterExcludeIndexes: number[] = []

	private _setupDirectoryGroupsSearchTask = new Task(this, {
		task: async ([_editMetadataModelID, _targetJoinDepth, _metadataModelsShowQueryPanel], { signal }) => {
			if (!_editMetadataModelID) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, 'this._setupDirectoryGroupsSearchTask')

			if (!this._metadataModelsSearch) {
				this._metadataModelsSearch = new MetadataModelSearchController(this, `${Url.ApiUrlPaths.MetadataModels.Url}${Url.MetadataModelSearchGetMMPath}`, `${Url.ApiUrlPaths.MetadataModels.Url}${Url.MetadataModelSearchPath}`)
			}

			if (_metadataModelsShowQueryPanel && (!this._metadataModelsSearch?.searchmetadatamodel || Object.keys(this._metadataModelsSearch?.searchmetadatamodel).length == 0)) {
				await this._metadataModelsSearch.FetchMetadataModel(this._appContext.appcontext?.iamdirectorygroupid, (_targetJoinDepth as number | undefined) || 1, signal)
			}
		},
		args: () => [this._editMetadataModelID, this._appContext.appcontext?.targetjoindepth, this._metadataModelsShowQueryPanel]
	})

	private _mmQueryPanelImported = false
	private _importMMQueryPanel = new Task(this, {
		task: async ([metadataModelsShowQueryPanel]) => {
			if (this._mmQueryPanelImported || metadataModelsShowQueryPanel) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importMMQueryPanel')

			await import('@lib/components/metadata-model/view/query-panel/component')
			this._mmQueryPanelImported = true
		},
		args: () => [this._metadataModelsShowQueryPanel]
	})

	private _mmTableImported = false
	private _importMMTableTask = new Task(this, {
		task: async ([directoryGRoupSearchResultsData]) => {
			if (this._mmTableImported || !directoryGRoupSearchResultsData || directoryGRoupSearchResultsData.length === 0) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importMMTableTask')

			await import('@lib/components/metadata-model/view/table/component')
			this._mmQueryPanelImported = true
		},
		args: () => [this._metadataModelsSearch?.searchresults.data]
	})

	protected render(): unknown {
		return html`
			<section id="left-section" class="flex-1 flex flex-col rounded-md shadow-md shadow-gray-800 bg-white p-1 gap-y-1 overflow-hidden">
				${(() => {
					if (this._showCreateEdit) {
						const edit = this.data && this.data.metadata_model && this.data.datum

						if (this._editMetadataModelID) {
							return html`
								<header class="flex-[0.5] flex gap-x-1 z-[2]">
									<button class="btn btn-circle btn-ghost flex justify-center" @click=${() => (this._editMetadataModelID = false)}>
										<!--mdi:arrow-back source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.Color.PRIMARY}" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" /></svg>
									</button>
									<div class="h-fit w-fit flex gap-x-1 text-primary self-center">Pick Metadata Model ID</div>
								</header>
								<div class="divider"></div>
								<main class="flex-[9] flex flex-col gap-y-1 overflow-hidden">
									${this._setupDirectoryGroupsSearchTask.render({
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
													if (!this._metadataModelsShowQueryPanel) {
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
																		.metadatamodel=${this._metadataModelsSearch!.searchmetadatamodel}
																		.queryconditions=${this._metadataModelsQueryConditions}
																		@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
																			this._metadataModelsSearch!.UpdateMetadatamodel(e.detail.value)
																		}}
																		@metadata-model-view-query-panel:updatequeryconditions=${(e: CustomEvent) => {
																			this._metadataModelsQueryConditions = structuredClone(e.detail.value)
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
													if (this._windowWidth < 1000 && this._metadataModelsShowQueryPanel) {
														return nothing
													}

													return html`
														<div class="flex-[3] flex flex-col gap-y-2 overflow-hidden">
															${(() => {
																if (this._metadataModelsSearch!.searchmetadatamodel && this._metadataModelsSearch!.searchresults.data && this._metadataModelsSearch!.searchresults.data.length > 0) {
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
																					.metadatamodel=${this._metadataModelsSearch!.searchmetadatamodel}
																					.data=${this._metadataModelsSearch!.searchresults.data!}
																					.getmetadatamodel=${this._fieldAnyMetadataModels}
																					.filterexcludeindexes=${this._metadataModelsFilterExcludeIndexes}
																					.addclickcolumn=${true}
																					@metadata-model-view-table:rowclick=${async (e: CustomEvent) => {
																						const datum = e.detail.value as Entities.MetadataModels.Interface
																						if (Array.isArray(datum.id) && datum.id.length == 1) {
																							this._metadataModelsID = datum.id[0]
																							this._editMetadataModelID = false
																							this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: `${Entities.AbstractionsDirectoryGroups.FieldColumn.MetadataModelsID} updated` }, bubbles: true, composed: true }))
																						}
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
																	<div class="text-xl font-bold break-words text-center">Pick metadata model.</div>
																</div>
															</section>
														</div>
													`
												})()}
											</section>
											<div class="join md:min-w-[30%] max-md:w-full self-center">
												${(() => {
													if (this._metadataModelsSearch!.searchmetadatamodel && this._metadataModelsSearch!.searchresults.data && this._metadataModelsSearch!.searchresults.data.length > 0) {
														return html`
															<button
																class="flex-1 join-item btn btn-secondary min-h-fit h-fit min-w-fit w-fit flex flex-col gap-y-1"
																@click=${(e: Event) => {
																	e.preventDefault()
																	this._metadataModelsFilterExcludeIndexes = structuredClone(MetadataModel.FilterData(this._metadataModelsQueryConditions, this._metadataModelsSearch!.searchresults.data!))
																	this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.INFO, toastMessage: `${this._metadataModelsFilterExcludeIndexes.length} filtered out` }, bubbles: true, composed: true }))
																}}
															>
																<div class="flex gap-x-1 self-center">
																	<!--mdi:search source: https://icon-sets.iconify.design-->
																	<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
																		<path
																			fill="${Theme.Color.SECONDARY_CONTENT}"
																			d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5"
																		/>
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
														try {
															this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: 'Searching...' }, bubbles: true, composed: true }))
															await this._metadataModelsSearch!.Search(
																this._metadataModelsQueryConditions,
																this._appContext.appcontext?.iamdirectorygroupid,
																this._appContext.GetCurrentdirectorygroupid(),
																this._appContext.appcontext?.targetjoindepth || 1,
																this._appContext.appcontext?.skipiffgdisabled || true,
																this._appContext.appcontext?.skipifdataextraction || true,
																undefined
															)

															window.dispatchEvent(
																new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, {
																	detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: `${Array.isArray(this._metadataModelsSearch!.searchresults.data) ? this._metadataModelsSearch!.searchresults.data.length : 0} results found` },
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
														this._metadataModelsShowQueryPanel = !this._metadataModelsShowQueryPanel
													}}
												>
													<div class="flex gap-x-1 self-center">
														<!--mdi:filter source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
															<path fill="${Theme.Color.SECONDARY_CONTENT}" d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z" />
														</svg>
														${(() => {
															if (this._metadataModelsShowQueryPanel) {
																return html`
																	<!--mdi:eye source: https://icon-sets.iconify.design-->
																	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																		<path
																			fill="${Theme.Color.SECONDARY_CONTENT}"
																			d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"
																		/>
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
														return html`<div class="text-center text-sm font-bold text-secondary-content break-words">${this._metadataModelsShowQueryPanel ? 'Hide' : 'Show'} Filter Query Panel</div>`
													})()}
												</button>
											</div>
										`,
										error: (e) => {
											console.error(e)
											return html`
												<div class="flex-[2] flex flex-col justify-center items-center shadow-inner shadow-gray-800 rounded-md p-1">
													<span class="w-fit text-error font-bold">Error: Could not get directory-groups metadata-model.</span>
												</div>
											`
										}
									})}
								</main>
							`
						}
						return html`
							<div class="flex-[9] flex flex-col gap-y-1">
								<div class="join join-vertical">
									<div class="join-item join-label-primary flex justify-between">
										<span class="join-item join-label-primary p-2">MetadaModel ID</span>
										<button class="btn btn-ghost min-h-fit h-fit min-w-fit w-fit p-1" @click=${() => (this._editMetadataModelID = true)}>
											<!--mdi:edit source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
												<path fill="${Theme.Color.PRIMARY_CONTENT}" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" />
											</svg>
										</button>
									</div>
									<div class="join-item border-2 border-primary p-1 text-lg">${this._metadataModelsID || 'pick metadata model...'}</div>
								</div>
								<div class="join join-vertical">
									<span class="join-item join-label-primary p-1">Description</span>
									<textarea class="join-item textarea textarea-primary max-h-[40vh]" placeholder="Enter description..." .value=${this._description || ''} @input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => (this._description = e.currentTarget.value)}></textarea>
								</div>
								<div class="join join-vertical">
									<span class="join-item join-label-primary p-1">Abstraction Review Quorum</span>
									<input
										class="join-item input input-primary"
										type="number"
										.value=${`${this._abstractionsReviewQuorum}`}
										@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
											if (!Number.isNaN(this._abstractionsReviewQuorum)) {
												this._abstractionsReviewQuorum = Number(e.currentTarget.value)
											}
										}}
									/>
								</div>
								<section class="flex justify-between">
									<span class="h-fit self-center font-bold">view authorized?</span>
									<input class="checkbox checkbox-primary" type="checkbox" .checked=${this._viewAuthorized} @input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => (this._viewAuthorized = e.currentTarget.checked)} />
								</section>
								<section class="flex justify-between">
									<span class="h-fit self-center font-bold">view unauthorized?</span>
									<input class="checkbox checkbox-primary" type="checkbox" .checked=${this._viewUnauthorized} @input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => (this._viewUnauthorized = e.currentTarget.checked)} />
								</section>
							</div>
							<div class="join w-full">
								<button
									class="flex-[2] join-item btn btn-secondary flex flex-col justify-center"
									@click=${() => {
										if (edit) {
											this._handleUpdateAbstractionsDirectoryGroups()
										} else {
											this._handleCreateAbstractionsDirectoryGroups()
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
										return html`<div>${edit ? 'Edit' : 'Create'} Abstractions Directory Groups</div>`
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
										return html`<div>Reset Abstractions Directory Groups</div>`
									})()}
								</button>
								${(() => {
									if (!this.data || !this.data.metadata_model || !this.data.datum) {
										return nothing
									}

									return html`
										<button class="flex-1 join-item btn btn-accent flex flex-col justify-center" @click=${() => (this._showCreateEdit = false)}>
											<div class="flex gap-x-1 self-center w-fit">
												<!--mdi:edit source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<path fill="${Theme.Color.ACCENT_CONTENT}" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" />
												</svg>
												<!--mdi:close-circle-outline source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24">
													<path fill="${Theme.Color.ACCENT_CONTENT}" d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8s8 3.59 8 8s-3.59 8-8 8m0-18C6.47 2 2 6.47 2 12s4.47 10 10 10s10-4.47 10-10S17.53 2 12 2m2.59 6L12 10.59L9.41 8L8 9.41L10.59 12L8 14.59L9.41 16L12 13.41L14.59 16L16 14.59L13.41 12L16 9.41z" />
												</svg>
											</div>
											${(() => {
												if (this._windowWidth < 800) {
													return nothing
												}
												return html`<div>Close ${edit ? 'Edit' : 'Create'} Abstractions Directory Groups</div>`
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
									<metadata-model-view-datum class="flex-1" .metadatamodel=${this.data!.metadata_model} .data=${this.data!.datum} .getmetadatamodel=${this._fieldAnyMetadataModels}></metadata-model-view-datum>
								</div>
								<div class="join w-full">
									<button class="flex-1 join-item btn btn-secondary flex flex-col justify-center" @click=${() => (this._showCreateEdit = true)}>
										<!--mdi:edit source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="${Theme.Color.SECONDARY_CONTENT}" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
										${(() => {
											if (this._windowWidth < 800) {
												return nothing
											}
											return html`<div>Edit Abstractions Directory Groups</div>`
										})()}
									</button>
									<button class="flex-1 join-item btn btn-secondary flex flex-col justify-center" @click=${this._handleDeleteAbstractionsDirectoryGroups}>
										<!--mdi:delete source: https://icon-sets.iconify.design-->
										<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="${Theme.Color.SECONDARY_CONTENT}" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
										${(() => {
											if (this._windowWidth < 800) {
												return nothing
											}
											return html`<div>Delete Abstractions Directory Groups</div>`
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
				})()}
			</section>
			${(() => {
				if (this._windowWidth > 1000) {
					return html`
						<section id="right-section" class="flex-1 flex flex-col rounded-md shadow-md shadow-gray-800 bg-white p-1 gap-y-1 overflow-hidden">
							${this._importIntroPosterTask.render({
								pending: () => this._pendingTaskHtmlTemplate(),
								complete: () => html` <intro-poster></intro-poster> `,
								error: (e) => {
									console.error(e)
									return this._errorTaskHtmlTemplate()
								}
							})}
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
		'abstractions-directory-group': Page
	}
}
