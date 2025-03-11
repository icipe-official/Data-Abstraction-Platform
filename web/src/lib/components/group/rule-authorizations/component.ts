import { html, LitElement, nothing, PropertyValues, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import { IAppContextConsumer } from '@dominterfaces/context/app'
import { IMetadataModelSearchController } from '@dominterfaces/controllers/metadata_model'
import { AppContextConsumer } from '@interfaces/context/app'
import { MetadataModelSearchController } from '@interfaces/controllers/metadata_model'
import { FieldAnyMetadataModel } from '@interfaces/field_any_metadata_model/field_any_metadata_model'
import Lib from '@lib/lib'
import { IFieldAnyMetadataModelGet } from '@lib/metadata_model/_export'
import Theme from '@lib/theme'
import Url from '@lib/url'
import { Task } from '@lit/task'
import MetadataModel from '@lib/metadata_model'
import Entities from '@domentities'
import Log from '@lib/log'

@customElement('group-rule-authorizations')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: String }) directorygroupsid: string | undefined

	private _metadataModelsSearch: IMetadataModelSearchController
	private _appContext: IAppContextConsumer
	private _fieldAnyMetadataModels: IFieldAnyMetadataModelGet

	@state() private queryConditions: MetadataModel.QueryConditions[] = []

	@state() private _filterExcludeIndexes: number[] = []

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth
	}

	protected firstUpdated(_changedProperties: PropertyValues): void {
		const url = new URL(window.location.toString())
		const action = url.searchParams.get(Url.SearchParams.ACTION)
		if (action) {
			switch (action) {
				case Url.Action.CREATE:
					this._showCreateNewGroupRuleAuthorizations = true
					break
				case Url.Action.RETRIEVE:
					this._showFilterMenu = true
					break
				case Url.Action.UPDATE:
				case Url.Action.DELETE:
					this._showQueryPanel = true
					break
			}
		}
	}

	connectedCallback(): void {
		super.connectedCallback()
		window.addEventListener('resize', this._handleWindowResize)
	}

	disconnectedCallback(): void {
		window.removeEventListener('resize', this._handleWindowResize)
		super.disconnectedCallback()
	}

	constructor() {
		super()
		this._appContext = new AppContextConsumer(this)
		this._fieldAnyMetadataModels = new FieldAnyMetadataModel()
		this._metadataModelsSearch = new MetadataModelSearchController(this, `${Url.ApiUrlPaths.Group.RuleAuthorizations}${Url.MetadataModelSearchGetMMPath}`, `${Url.ApiUrlPaths.Group.RuleAuthorizations}${Url.MetadataModelSearchPath}`)
	}

	private _getMetatadaModelsMmTask = new Task(this, {
		task: async () => {
			if (Object.keys(this._metadataModelsSearch.searchmetadatamodel).length === 0 || !this._metadataModelsSearch.searchmetadatamodel) {
				await this._metadataModelsSearch.FetchMetadataModel(this._appContext.appcontext?.iamdirectorygroupid, this._appContext.appcontext?.targetjoindepth || 1, undefined)
			}
		},
		args: () => [this._showQueryPanel, this._fullTextSearchQuery, this._dateOfCreationFrom, this._dateOfCreationTo, this._dateOfLastUpdatedOnFrom, this._dateOfLastUpdatedOnTo]
	})

	private async _handleDatabaseSearch() {
		let newQc: MetadataModel.QueryConditions = {}
		if (this._metadataModelsSearch.searchmetadatamodel) {
			if (this._fullTextSearchQuery.length > 0) {
				newQc['$'] = {
					[MetadataModel.QcProperties.D_TABLE_COLLECTION_NAME]: this._metadataModelsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME],
					[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: this._metadataModelsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					[MetadataModel.QcProperties.D_FULL_TEXT_SEARCH_QUERY]: this._fullTextSearchQuery
				}
			}

			if (this._dateOfCreationFrom.length > 0) {
				newQc['$.created_on'] = {
					[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: Entities.GroupAuthorizationRules.FieldColumn.CreatedOn,
					[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: this._metadataModelsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
						[
							{
								[MetadataModel.FConditionProperties.NEGATE]: false,
								[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.TIMESTAMP_GREATER_THAN,
								[MetadataModel.FConditionProperties.DATE_TIME_FORMAT]: MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM,
								[MetadataModel.FConditionProperties.VALUE]: this._dateOfCreationFrom
							}
						]
					]
				}
			}
			if (this._dateOfCreationTo.length > 0) {
				newQc['$.created_on'] = {
					[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: Entities.GroupAuthorizationRules.FieldColumn.CreatedOn,
					[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: this._metadataModelsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
						[
							{
								[MetadataModel.FConditionProperties.NEGATE]: false,
								[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.TIMESTAMP_LESS_THAN,
								[MetadataModel.FConditionProperties.DATE_TIME_FORMAT]: MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM,
								[MetadataModel.FConditionProperties.VALUE]: this._dateOfCreationTo
							}
						]
					]
				}
			}

			if (this._dateOfLastUpdatedOnFrom.length > 0) {
				newQc['$.last_updated_on'] = {
					[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: Entities.GroupAuthorizationRules.FieldColumn.LastUpdatedOn,
					[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: this._metadataModelsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
						[
							{
								[MetadataModel.FConditionProperties.NEGATE]: false,
								[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.TIMESTAMP_GREATER_THAN,
								[MetadataModel.FConditionProperties.DATE_TIME_FORMAT]: MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM,
								[MetadataModel.FConditionProperties.VALUE]: this._dateOfLastUpdatedOnFrom
							}
						]
					]
				}
			}
			if (this._dateOfLastUpdatedOnTo.length > 0) {
				newQc['$.last_updated_on'] = {
					[MetadataModel.QcProperties.D_FIELD_COLUMN_NAME]: Entities.GroupAuthorizationRules.FieldColumn.LastUpdatedOn,
					[MetadataModel.QcProperties.D_TABLE_COLLECTION_UID]: this._metadataModelsSearch.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID],
					[MetadataModel.QcProperties.FG_FILTER_CONDITION]: [
						[
							{
								[MetadataModel.FConditionProperties.NEGATE]: false,
								[MetadataModel.FConditionProperties.CONDITION]: MetadataModel.FilterCondition.TIMESTAMP_LESS_THAN,
								[MetadataModel.FConditionProperties.DATE_TIME_FORMAT]: MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM,
								[MetadataModel.FConditionProperties.VALUE]: this._dateOfLastUpdatedOnTo
							}
						]
					]
				}
			}
		}
		try {
			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: 'Searching...' }, bubbles: true, composed: true }))
			await this._metadataModelsSearch.Search(
				Object.keys(newQc).length > 0 ? [...this.queryConditions, newQc] : this.queryConditions,
				this._appContext.appcontext?.iamdirectorygroupid,
				this._appContext.GetCurrentdirectorygroupid(),
				this._appContext.appcontext?.targetjoindepth || 1,
				this._appContext.appcontext?.skipiffgdisabled || true,
				this._appContext.appcontext?.skipifdataextraction || true,
				undefined
			)

			window.dispatchEvent(
				new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: `${Array.isArray(this._metadataModelsSearch.searchresults.data) ? this._metadataModelsSearch.searchresults.data.length : 0} results found` }, bubbles: true, composed: true })
			)
		} catch (e) {
			console.error(e)
			if (Array.isArray(e)) {
				if (e[1] && typeof e[1] == 'object' && e[1].message) {
					window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: `${e[0]}: ${e[1].message}` }, bubbles: true, composed: true }))
				}
			}
			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: Lib.DEFAULT_FETCH_ERROR }, bubbles: true, composed: true }))
		} finally {
			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: null, loadingMessage: null }, bubbles: true, composed: true }))
		}
	}

	private _mmQueryPanelImported = false
	private _importMMQueryPanel = new Task(this, {
		task: async () => {
			if (this._mmQueryPanelImported) {
				return
			}
			await import('@lib/components/metadata-model/view/query-panel/component')
			this._mmQueryPanelImported = true
		},
		args: () => [this._showQueryPanel, this._directoryGroupsShowQueryPanel, this._groupAuthorizationRulesShowQueryPanel]
	})

	private _mmTableImported = false
	private _importMMTableTask = new Task(this, {
		task: async () => {
			if (
				this._mmTableImported ||
				((!this._metadataModelsSearch.searchresults.data || this._metadataModelsSearch.searchresults.data.length === 0) &&
					(!this._directoryGroupsSearch?.searchresults.data || this._directoryGroupsSearch.searchresults.data.length === 0) &&
					(!this._groupAuthorizationRulesSearch?.searchresults.data || this._groupAuthorizationRulesSearch.searchresults.data.length === 0))
			) {
				return
			}
			await import('@lib/components/metadata-model/view/table/component')
			this._mmQueryPanelImported = true
		},
		args: () => [this._metadataModelsSearch.searchresults.data, this._directoryGroupsSearch?.searchresults.data, this._groupAuthorizationRulesSearch?.searchresults.data]
	})

	@state() private _fullTextSearchQuery: string = ''
	@state() private _dateOfCreationFrom: string = ''
	@state() private _dateOfCreationTo: string = ''
	@state() private _dateOfLastUpdatedOnFrom: string = ''
	@state() private _dateOfLastUpdatedOnTo: string = ''
	@state() private _showFilterMenu: boolean = false
	@state() private _showQueryPanel: boolean = false

	@state() private _createGroupRuleAuthorizationsStep: number = 0

	@state() private _showCreateNewGroupRuleAuthorizations = false

	@state() private _directoryGroupsShowQueryPanel = false
	private _directoryGroupsSearch?: IMetadataModelSearchController
	@state() _directoryGroupsQueryConditions: MetadataModel.QueryConditions[] = []
	@state() private _directoryGroupsFilterExcludeIndexes: number[] = []
	@state() private _selectedDirectoryGroupsIndexes: number[] = []
	private _setupDirectoryGroupsSearchTask = new Task(this, {
		task: async () => {
			if (this._createGroupRuleAuthorizationsStep < 0 || this.directorygroupsid) {
				return
			}
			if (!this._directoryGroupsSearch) {
				this._directoryGroupsSearch = new MetadataModelSearchController(this, `${Url.ApiUrlPaths.Directory.Groups}${Url.MetadataModelSearchGetMMPath}`, `${Url.ApiUrlPaths.Directory.Groups}${Url.MetadataModelSearchPath}`)
			}
			if (Object.keys(this._directoryGroupsSearch.searchmetadatamodel).length === 0 || !this._directoryGroupsSearch.searchmetadatamodel) {
				await this._directoryGroupsSearch.FetchMetadataModel(this._appContext.appcontext?.iamdirectorygroupid, this._appContext.appcontext?.targetjoindepth || 1, undefined)
			}
		},
		args: () => [this._createGroupRuleAuthorizationsStep]
	})

	@state() private _groupAuthorizationRulesShowQueryPanel = false
	private _groupAuthorizationRulesSearch?: IMetadataModelSearchController
	@state() _groupAuthorizationRulesQueryConditions: MetadataModel.QueryConditions[] = []
	@state() private _groupAuthorizationRulesFilterExcludeIndexes: number[] = []
	@state() private _selectedGroupAuthorizationRulesIndexes: number[] = []
	private _setupGroupAuthorizationRulesSearchTask = new Task(this, {
		task: async () => {
			if (this._createGroupRuleAuthorizationsStep < 1 || this.directorygroupsid) {
				return
			}
			if (!this._groupAuthorizationRulesSearch) {
				this._groupAuthorizationRulesSearch = new MetadataModelSearchController(this, `${Url.ApiUrlPaths.Group.AuthorizationRules}${Url.MetadataModelSearchGetMMPath}`, `${Url.ApiUrlPaths.Group.AuthorizationRules}${Url.MetadataModelSearchPath}`)
			}
			if (Object.keys(this._groupAuthorizationRulesSearch.searchmetadatamodel).length === 0 || !this._groupAuthorizationRulesSearch.searchmetadatamodel) {
				await this._groupAuthorizationRulesSearch.FetchMetadataModel(this._appContext.appcontext?.iamdirectorygroupid, this._appContext.appcontext?.targetjoindepth || 1, undefined)
			}
		},
		args: () => [this._createGroupRuleAuthorizationsStep]
	})

	private async _handleCreateGroupRuleAuthorizations() {
		if (!this._directoryGroupsSearch?.searchresults.data || !this._groupAuthorizationRulesSearch?.searchresults.data) {
			return
		}

		let directoryGroups: Entities.DirectoryGroups.Interface[] = []
		if (this.directorygroupsid) {
			directoryGroups.push({
				id: [this.directorygroupsid]
			})
		} else {
			for (const dIndex of this._selectedDirectoryGroupsIndexes) {
				const dg: Entities.DirectoryGroups.Interface = this._directoryGroupsSearch.searchresults.data[dIndex]
				if (Array.isArray(dg.id) && typeof dg.id[0] === 'string') {
					directoryGroups.push({
						id: [dg.id[0]]
					})
				}
			}
		}

		let newGroupRuleAuthorizations: Entities.GroupRuleAuthorizations.Interface[] = []
		for (const dg of directoryGroups) {
			for (const gdIndex of this._selectedGroupAuthorizationRulesIndexes) {
				const gar: Entities.GroupAuthorizationRules.Interface = this._groupAuthorizationRulesSearch.searchresults.data[gdIndex]
				if (Array.isArray(gar.group_authorization_rules_id) && gar.group_authorization_rules_id.length === 1) {
					if (Array.isArray(gar.group_authorization_rules_id[0].id) && typeof gar.group_authorization_rules_id[0].id[0] === 'string' && Array.isArray(gar.group_authorization_rules_id[0].rule_group) && typeof gar.group_authorization_rules_id[0].rule_group[0] === 'string') {
						newGroupRuleAuthorizations.push({
							directory_groups_id: dg.id,
							group_authorization_rules_id: [
								{
									group_authorization_rules_id: gar.group_authorization_rules_id[0].id,
									group_authorization_rules_group: gar.group_authorization_rules_id[0].rule_group
								}
							]
						})
					}
				}
			}
		}

		if (newGroupRuleAuthorizations.length === 0) {
			return
		}

		try {
			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: `Creating new ${Entities.GroupRuleAuthorizations.RepositoryName}...` }, bubbles: true, composed: true }))
			if (!this._appContext.GetCurrentdirectorygroupid()) {
				return
			}
			const fetchUrl = new URL(`${Url.ApiUrlPaths.Group.RuleAuthorizations}/${Url.Action.CREATE}`)
			fetchUrl.searchParams.append(Url.SearchParams.DIRECTORY_GROUP_ID, this._appContext.GetCurrentdirectorygroupid()!)
			fetchUrl.searchParams.append(Url.SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, this._appContext.Getauthcontextdirectorygroupid())
			if (this._appContext.appcontext?.verboseresponse) {
				fetchUrl.searchParams.append(Url.SearchParams.VERBOSE_RESPONSE, `${true}`)
			}
			
			Log.Log(Log.Level.DEBUG, this.localName, fetchUrl, newGroupRuleAuthorizations)

			const fetchResponse = await fetch(fetchUrl, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify(newGroupRuleAuthorizations)
			})

			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				window.dispatchEvent(
					new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: {toastType: Lib.ToastType.INFO, ...Entities.MetadataModel.GetToastFromJsonVerboseResponse(data)}, bubbles: true, composed: true })
				)
			} else {
				window.dispatchEvent(
					new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: data.message }, bubbles: true, composed: true })
				)
			}
		} catch (e) {
			console.error(e)
			if (Array.isArray(e)) {
				if (e[1] && typeof e[1] == 'object' && e[1].message) {
					window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: `${e[0]}: ${e[1].message}` }, bubbles: true, composed: true }))
				}
			}
			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: Lib.DEFAULT_FETCH_ERROR }, bubbles: true, composed: true }))
		} finally {
			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: null, loadingMessage: null }, bubbles: true, composed: true }))
		}
	}

	protected render(): unknown {
		return html`
			<div class="flex-1 flex flex-col rounded-md bg-white shadow-md shadow-gray-800 overflow-hidden p-2 gap-y-1">
				${(() => {
					if (this._showCreateNewGroupRuleAuthorizations) {
						return html`
							<header class="flex-[0.5] flex gap-x-1 z-[2]">
								<button class="btn btn-circle btn-ghost flex justify-center" @click=${() => (this._showCreateNewGroupRuleAuthorizations = false)}>
									<!--mdi:arrow-back source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.Color.PRIMARY}" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z" /></svg>
								</button>
								<div class="h-fit w-fit flex gap-x-1 text-primary self-center">Create New Group Rule Authorizations</div>
							</header>
							<div class="divider"></div>
							<nav class="w-fit steps self-center h-fit z-[1]">
								<button
									class="step ${this._createGroupRuleAuthorizationsStep >= 0 ? 'step-secondary' : ''}"
									@click=${(e: Event) => {
										e.preventDefault()
										this._createGroupRuleAuthorizationsStep = 0
									}}
									.disabled=${typeof this.directorygroupsid === 'string'}
								>
									<div class="break-words pl-4 pr-4">Pick Directory Group(s)</div>
								</button>
								<button
									class="step ${this._createGroupRuleAuthorizationsStep >= 1 ? 'step-secondary' : ''}"
									@click=${(e: Event) => {
										e.preventDefault()
										this._createGroupRuleAuthorizationsStep = 1
									}}
								>
									<div class="break-words pl-4 pr-4">Pick Group Authorization Rule(s)</div>
								</button>
								<button
									class="step ${this._createGroupRuleAuthorizationsStep >= 2 ? 'step-secondary' : ''}"
									@click=${(e: Event) => {
										e.preventDefault()
										this._createGroupRuleAuthorizationsStep = 2
									}}
								>
									<div class="break-words pl-4 pr-4">Create Group Rule Authorizations</div>
								</button>
							</nav>
							<main class="flex-[9] flex flex-col gap-y-1 overflow-hidden z-[1]">
								${(() => {
									switch (this._createGroupRuleAuthorizationsStep) {
										case 0:
											return this._setupDirectoryGroupsSearchTask.render({
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
															if (!this._directoryGroupsShowQueryPanel) {
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
																				.metadatamodel=${this._directoryGroupsSearch!.searchmetadatamodel}
																				.queryconditions=${this._directoryGroupsQueryConditions}
																				@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
																					this._directoryGroupsSearch!.UpdateMetadatamodel(e.detail.value)
																				}}
																				@metadata-model-view-query-panel:updatequeryconditions=${(e: CustomEvent) => {
																					this._directoryGroupsQueryConditions = structuredClone(e.detail.value)
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
															if (this._windowWidth < 1000 && this._directoryGroupsShowQueryPanel) {
																return nothing
															}

															return html`
																<div class="flex-[3] flex flex-col gap-y-2 overflow-hidden">
																	${(() => {
																		if (this._directoryGroupsSearch!.searchmetadatamodel && this._directoryGroupsSearch!.searchresults.data && this._directoryGroupsSearch!.searchresults.data.length > 0) {
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
																							.metadatamodel=${this._directoryGroupsSearch!.searchmetadatamodel}
																							.data=${this._directoryGroupsSearch!.searchresults.data!}
																							.getmetadatamodel=${this._fieldAnyMetadataModels}
																							.filterexcludeindexes=${this._directoryGroupsFilterExcludeIndexes}
																							.addselectcolumn=${true}
																							.addclickcolumn=${false}
																							@metadata-model-view-table:selecteddataindexesupdate=${(e: CustomEvent) => {
																								this._selectedDirectoryGroupsIndexes = structuredClone(e.detail.value)
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
																			<div class="text-xl font-bold break-words text-center">Step 1: Pick the directory group(s) you'd like to assign particular roles.</div>
																		</div>
																	</section>
																</div>
															`
														})()}
													</section>
													<div class="join md:min-w-[30%] max-md:w-full self-center">
														${(() => {
															if (this._directoryGroupsSearch!.searchmetadatamodel && this._directoryGroupsSearch!.searchresults.data && this._directoryGroupsSearch!.searchresults.data.length > 0) {
																return html`
																	<button
																		class="flex-1 join-item btn btn-secondary min-h-fit h-fit min-w-fit w-fit flex flex-col gap-y-1"
																		@click=${(e: Event) => {
																			e.preventDefault()
																			this._directoryGroupsFilterExcludeIndexes = structuredClone(MetadataModel.FilterData(this.queryConditions, this._directoryGroupsSearch!.searchresults.data!))
																			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.INFO, toastMessage: `${this._directoryGroupsFilterExcludeIndexes.length} filtered out` }, bubbles: true, composed: true }))
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
																	window.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: 'Searching...' }, bubbles: true, composed: true }))
																	await this._directoryGroupsSearch!.Search(
																		this._directoryGroupsQueryConditions,
																		this._appContext.appcontext?.iamdirectorygroupid,
																		this._appContext.GetCurrentdirectorygroupid(),
																		this._appContext.appcontext?.targetjoindepth || 1,
																		this._appContext.appcontext?.skipiffgdisabled || true,
																		this._appContext.appcontext?.skipifdataextraction || true,
																		undefined
																	)

																	window.dispatchEvent(
																		new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, {
																			detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: `${Array.isArray(this._directoryGroupsSearch!.searchresults.data) ? this._directoryGroupsSearch!.searchresults.data.length : 0} results found` },
																			bubbles: true,
																			composed: true
																		})
																	)
																} catch (e) {
																	console.error(e)
																	if (Array.isArray(e)) {
																		if (e[1] && typeof e[1] == 'object' && e[1].message) {
																			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: `${e[0]}: ${e[1].message}` }, bubbles: true, composed: true }))
																		}
																	}
																	window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: Lib.DEFAULT_FETCH_ERROR }, bubbles: true, composed: true }))
																} finally {
																	window.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: null, loadingMessage: null }, bubbles: true, composed: true }))
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
																this._directoryGroupsShowQueryPanel = !this._directoryGroupsShowQueryPanel
															}}
														>
															<div class="flex gap-x-1 self-center">
																<!--mdi:filter source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
																	<path fill="${Theme.Color.SECONDARY_CONTENT}" d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z" />
																</svg>
																${(() => {
																	if (this._directoryGroupsShowQueryPanel) {
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
																return html`<div class="text-center text-sm font-bold text-secondary-content break-words">${this._directoryGroupsShowQueryPanel ? 'Hide' : 'Show'} Filter Query Panel</div>`
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
											})
										case 1:
											return this._setupGroupAuthorizationRulesSearchTask.render({
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
															if (!this._groupAuthorizationRulesShowQueryPanel) {
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
																				.metadatamodel=${this._groupAuthorizationRulesSearch!.searchmetadatamodel}
																				.queryconditions=${this._groupAuthorizationRulesQueryConditions}
																				@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
																					this._groupAuthorizationRulesSearch!.UpdateMetadatamodel(e.detail.value)
																				}}
																				@metadata-model-view-query-panel:updatequeryconditions=${(e: CustomEvent) => {
																					this._groupAuthorizationRulesQueryConditions = structuredClone(e.detail.value)
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
															if (this._windowWidth < 1000 && this._groupAuthorizationRulesShowQueryPanel) {
																return nothing
															}

															return html`
																<div class="flex-[3] flex flex-col gap-y-2 overflow-hidden">
																	${(() => {
																		if (this._groupAuthorizationRulesSearch!.searchmetadatamodel && this._groupAuthorizationRulesSearch!.searchresults.data && this._groupAuthorizationRulesSearch!.searchresults.data.length > 0) {
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
																							.metadatamodel=${this._groupAuthorizationRulesSearch!.searchmetadatamodel}
																							.data=${this._groupAuthorizationRulesSearch!.searchresults.data!}
																							.getmetadatamodel=${this._fieldAnyMetadataModels}
																							.filterexcludeindexes=${this._groupAuthorizationRulesFilterExcludeIndexes}
																							.addselectcolumn=${true}
																							.addclickcolumn=${false}
																							@metadata-model-view-table:selecteddataindexesupdate=${(e: CustomEvent) => {
																								this._selectedGroupAuthorizationRulesIndexes = structuredClone(e.detail.value)
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
																			<div class="text-xl font-bold break-words text-center">Step 2: Pick the rule(s) you'd like to assign to the selected directory groups.</div>
																		</div>
																	</section>
																</div>
															`
														})()}
													</section>
													<div class="join md:min-w-[30%] max-md:w-full self-center">
														${(() => {
															if (this._groupAuthorizationRulesSearch!.searchmetadatamodel && this._groupAuthorizationRulesSearch!.searchresults.data && this._groupAuthorizationRulesSearch!.searchresults.data.length > 0) {
																return html`
																	<button
																		class="flex-1 join-item btn btn-secondary min-h-fit h-fit min-w-fit w-fit flex flex-col gap-y-1"
																		@click=${(e: Event) => {
																			e.preventDefault()
																			this._groupAuthorizationRulesFilterExcludeIndexes = structuredClone(MetadataModel.FilterData(this.queryConditions, this._groupAuthorizationRulesSearch!.searchresults.data!))
																			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.INFO, toastMessage: `${this._groupAuthorizationRulesFilterExcludeIndexes.length} filtered out` }, bubbles: true, composed: true }))
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
																	window.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: 'Searching...' }, bubbles: true, composed: true }))
																	await this._groupAuthorizationRulesSearch!.Search(
																		this._groupAuthorizationRulesQueryConditions,
																		this._appContext.appcontext?.iamdirectorygroupid,
																		this._appContext.GetCurrentdirectorygroupid(),
																		this._appContext.appcontext?.targetjoindepth || 1,
																		this._appContext.appcontext?.skipiffgdisabled || true,
																		this._appContext.appcontext?.skipifdataextraction || true,
																		undefined
																	)

																	window.dispatchEvent(
																		new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, {
																			detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: `${Array.isArray(this._groupAuthorizationRulesSearch!.searchresults.data) ? this._groupAuthorizationRulesSearch!.searchresults.data.length : 0} results found` },
																			bubbles: true,
																			composed: true
																		})
																	)
																} catch (e) {
																	console.error(e)
																	if (Array.isArray(e)) {
																		if (e[1] && typeof e[1] == 'object' && e[1].message) {
																			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: `${e[0]}: ${e[1].message}` }, bubbles: true, composed: true }))
																		}
																	}
																	window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: Lib.DEFAULT_FETCH_ERROR }, bubbles: true, composed: true }))
																} finally {
																	window.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: null, loadingMessage: null }, bubbles: true, composed: true }))
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
																this._groupAuthorizationRulesShowQueryPanel = !this._groupAuthorizationRulesShowQueryPanel
															}}
														>
															<div class="flex gap-x-1 self-center">
																<!--mdi:filter source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
																	<path fill="${Theme.Color.SECONDARY_CONTENT}" d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z" />
																</svg>
																${(() => {
																	if (this._groupAuthorizationRulesShowQueryPanel) {
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
																return html`<div class="text-center text-sm font-bold text-secondary-content break-words">${this._groupAuthorizationRulesShowQueryPanel ? 'Hide' : 'Show'} Filter Query Panel</div>`
															})()}
														</button>
													</div>
												`,
												error: (e) => {
													console.error(e)
													return html`
														<div class="flex-[2] flex flex-col justify-center items-center shadow-inner shadow-gray-800 rounded-md p-1">
															<span class="w-fit text-error font-bold">Error: Could not get group authorization rules metadata-model.</span>
														</div>
													`
												}
											})
										case 2:
											return html`
												<button
													class="btn btn-secondary self-center md:min-w-[30%] max-md:w-full p-2 min-h-fit h-fit"
													@click=${() => {
														this._handleCreateGroupRuleAuthorizations()
													}}
													.disabled=${(!this.directorygroupsid && this._selectedDirectoryGroupsIndexes.length === 0) || this._selectedGroupAuthorizationRulesIndexes.length === 0}
												>
													Create Group Rule Authorizations
												</button>
											`
									}
								})()}
							</main>
						`
					}

					return html`
						<header class="flex-[0.5] flex flex-col gap-y-1 z-[2]">
							<section class="join ${this._appContext.appcontext?.targetjoindepth && this._appContext.appcontext?.targetjoindepth > 0 ? 'w-[50%]' : 'w-fit'} rounded-md self-center border-[1px] border-primary p-1">
								${(() => {
									if (this._appContext.appcontext?.targetjoindepth && this._appContext.appcontext?.targetjoindepth > 0) {
										return html`
											<input
												class="join-item input input-ghost flex-[9]"
												type="search"
												placeholder="Search group rule authorizations..."
												.value=${this._fullTextSearchQuery}
												@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
													this._fullTextSearchQuery = e.currentTarget.value
												}}
											/>
										`
									}

									return nothing
								})()}
								<button class="join-item btn btn-ghost flex flex-col gap-y-1" @click=${() => (this._showFilterMenu = !this._showFilterMenu)}>
									<!--mdi:filter-menu source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
										<path fill="${Theme.Color.PRIMARY}" d="m11 11l5.76-7.38a1 1 0 0 0-.17-1.4A1 1 0 0 0 16 2H2a1 1 0 0 0-.62.22a1 1 0 0 0-.17 1.4L7 11v5.87a1 1 0 0 0 .29.83l2 2a1 1 0 0 0 1.41 0a1 1 0 0 0 .3-.83zm2 5l5 5l5-5Z" />
									</svg>
									${(() => {
										if (this._appContext.appcontext?.targetjoindepth && this._appContext.appcontext?.targetjoindepth > 0) {
											return nothing
										}

										return html`<div>Filter/Query Menu</div>`
									})()}
								</button>
								<button class="join-item btn btn-ghost flex flex-col gap-y-1" @click=${this._handleDatabaseSearch}>
									<!--mdi:search source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
										<path fill="${Theme.Color.PRIMARY}" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
									</svg>
									${(() => {
										if (this._appContext.appcontext?.targetjoindepth && this._appContext.appcontext?.targetjoindepth > 0) {
											return nothing
										}

										return html`<div>Search</div>`
									})()}
								</button>
							</section>
							${(() => {
								if (!this._showFilterMenu) {
									return nothing
								}

								return html`
									<div class="relative w-[50%] min-w-[600px] h-0 self-center flex">
										<div class="absolute top-0 flex-1 w-full flex flex-col gap-y-2 self-center p-1 rounded-md bg-white shadow-md shadow-gray-800">
											<div class="join join-vertical">
												<div class="join-item bg-primary text-primary-content p-1 font-bold">Date of creation (from/to)</div>
												<calendar-time
													class="join-item flex-1"
													.roundedborder=${false}
													.value=${this._dateOfCreationFrom}
													@calendar-time:datetimeupdate=${(e: CustomEvent) => {
														if (e.detail.value) {
															this._dateOfCreationFrom = e.detail.value
														} else {
															this._dateOfCreationFrom = ''
														}
													}}
												></calendar-time>
												<calendar-time
													class="join-item flex-1"
													.roundedborder=${false}
													.value=${this._dateOfCreationTo}
													@calendar-time:datetimeupdate=${(e: CustomEvent) => {
														if (e.detail.value) {
															this._dateOfCreationTo = e.detail.value
														} else {
															this._dateOfCreationTo = ''
														}
													}}
												></calendar-time>
												<div class="join-item h-[5px] bg-primary"></div>
											</div>
											<div class="join join-vertical">
												<div class="join-item bg-primary text-primary-content p-1 font-bold">Last updated on (from/to)</div>
												<calendar-time
													class="join-item flex-1"
													.roundedborder=${false}
													.value=${this._dateOfLastUpdatedOnFrom}
													@calendar-time:datetimeupdate=${(e: CustomEvent) => {
														if (e.detail.value) {
															this._dateOfLastUpdatedOnFrom = e.detail.value
														} else {
															this._dateOfLastUpdatedOnFrom = ''
														}
													}}
												></calendar-time>
												<calendar-time
													class="join-item flex-1"
													.roundedborder=${false}
													.value=${this._dateOfLastUpdatedOnTo}
													@calendar-time:datetimeupdate=${(e: CustomEvent) => {
														if (e.detail.value) {
															this._dateOfLastUpdatedOnTo = e.detail.value
														} else {
															this._dateOfLastUpdatedOnTo = ''
														}
													}}
												></calendar-time>
												<div class="join-item h-[5px] bg-primary"></div>
											</div>
											<button
												class="link link-hover"
												@click=${() => {
													this._showQueryPanel = !this._showQueryPanel
													this._showFilterMenu = false
												}}
											>
												...${this._showQueryPanel === true ? 'less' : 'more'} filter options...
											</button>
										</div>
									</div>
								`
							})()}
						</header>
						<main class="flex-[9] overflow-hidden flex gap-x-2 z-[1]">
							${(() => {
								if (!this._showQueryPanel) {
									return nothing
								}

								return this._getMetatadaModelsMmTask.render({
									pending: () => html`
										<div class="flex-1 flex flex-col justify-center items-center text-xl gap-y-5">
											<div class="flex">
												<span class="loading loading-ball loading-sm text-accent"></span>
												<span class="loading loading-ball loading-md text-secondary"></span>
												<span class="loading loading-ball loading-lg text-primary"></span>
											</div>
										</div>
									`,
									complete: () => {
										return html`
											<section class="flex-[2] flex flex-col overflow-hidden gap-y-2">
												<div class="flex-[9] flex overflow-hidden shadow-inner shadow-gray-800 rounded-md">
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
																.metadatamodel=${this._metadataModelsSearch.searchmetadatamodel}
																.queryconditions=${this.queryConditions}
																@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
																	this._metadataModelsSearch.UpdateMetadatamodel(e.detail.value)
																}}
																@metadata-model-view-query-panel:updatequeryconditions=${(e: CustomEvent) => {
																	this.queryConditions = structuredClone(e.detail.value)
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
												<div class="join">
													${(() => {
														if (this._metadataModelsSearch.searchmetadatamodel && this._metadataModelsSearch.searchresults.data && this._metadataModelsSearch.searchresults.data.length > 0) {
															return html`
																<button
																	class="flex-1 join-item btn btn-secondary min-h-fit h-fit min-w-fit w-fit flex flex-col gap-y-1"
																	@click=${() => {
																		this._filterExcludeIndexes = structuredClone(MetadataModel.FilterData(this.queryConditions, this._metadataModelsSearch.searchresults.data!))
																		window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.INFO, toastMessage: `${this._filterExcludeIndexes.length} filtered out` }, bubbles: true, composed: true }))
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
													<button class="flex-1 join-item btn btn-secondary min-h-fit h-fit min-w-fit w-fit flex flex-col gap-y-1" @click=${this._handleDatabaseSearch}>
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
														@click=${() => {
															this._showQueryPanel = false
														}}
													>
														<div class="flex gap-x-1 self-center">
															<!--mdi:filter source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
																<path fill="${Theme.Color.SECONDARY_CONTENT}" d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z" />
															</svg>
															<!--mdi:eye-off source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
																<path
																	fill="${Theme.Color.SECONDARY_CONTENT}"
																	d="M11.83 9L15 12.16V12a3 3 0 0 0-3-3zm-4.3.8l1.55 1.55c-.05.21-.08.42-.08.65a3 3 0 0 0 3 3c.22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53a5 5 0 0 1-5-5c0-.79.2-1.53.53-2.2M2 4.27l2.28 2.28l.45.45C3.08 8.3 1.78 10 1 12c1.73 4.39 6 7.5 11 7.5c1.55 0 3.03-.3 4.38-.84l.43.42L19.73 22L21 20.73L3.27 3M12 7a5 5 0 0 1 5 5c0 .64-.13 1.26-.36 1.82l2.93 2.93c1.5-1.25 2.7-2.89 3.43-4.75c-1.73-4.39-6-7.5-11-7.5c-1.4 0-2.74.25-4 .7l2.17 2.15C10.74 7.13 11.35 7 12 7"
																/>
															</svg>
														</div>
														${(() => {
															if (this._windowWidth < 700) {
																return nothing
															}
															return html`<div class="text-center text-sm font-bold text-secondary-content break-words">Hide Filter Query Panel</div>`
														})()}
													</button>
												</div>
											</section>
										`
									},
									error: (e) => {
										console.error(e)
										return html`
											<div class="flex-[2] flex flex-col justify-center items-center shadow-inner shadow-gray-800 rounded-md p-1">
												<span class="w-fit text-error font-bold">Error: Could not get search metadata-model.</span>
											</div>
										`
									}
								})
							})()}
							${(() => {
								if (this._windowWidth < 1000 && this._showQueryPanel) {
									return nothing
								}

								return html`
									<div class="flex-[3] flex flex-col gap-y-2 overflow-hidden">
										${(() => {
											if (this._metadataModelsSearch.searchmetadatamodel && this._metadataModelsSearch.searchresults.data && this._metadataModelsSearch.searchresults.data.length > 0) {
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
																.metadatamodel=${this._metadataModelsSearch.searchmetadatamodel}
																.data=${this._metadataModelsSearch.searchresults.data!}
																.getmetadatamodel=${this._fieldAnyMetadataModels}
																.filterexcludeindexes=${this._filterExcludeIndexes}
																.addselectcolumn=${true}
																.selecteddataindexesactions=${[
																	{
																		actionName: 'Deactivate selected group rule authorizations',
																		action: (selectedDataIndexes: number[]) => {
																			console.log(selectedDataIndexes)
																		}
																	}
																]}
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
												${(() => {
													if (this._metadataModelsSearch.searchmetadatamodel && this._metadataModelsSearch.searchresults.data && this._metadataModelsSearch.searchresults.data.length > 0) {
														return nothing
													}
													return html` <div class="text-xl font-bold break-words text-center">Create and manage authorizations rules that can be assigned to users with credentials within a group.</div> `
												})()}
												<div class="flex justify-evenly flex-wrap gap-8">
													<button class="link link-hover min-h-fit h-fit min-w-fit w-fit flex flex-col justify-center" @click=${() => (this._showCreateNewGroupRuleAuthorizations = true)}>
														<div class="flex gap-x-1 self-center">
															<!--mdi:account-group source: https://icon-sets.iconify.design-->
															<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
																<path
																	d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
																/>
															</svg>
															<!--mdi:secure source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
																<path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
															</svg>
															<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
														</div>
														${(() => {
															if (this._metadataModelsSearch.searchmetadatamodel && this._metadataModelsSearch.searchresults.data && this._metadataModelsSearch.searchresults.data.length > 0 && this._windowWidth < 800) {
																return nothing
															}
															return html`<div>Create New Group Rule Authorizations</div>`
														})()}
													</button>
													<button class="link link-hover min-h-fit h-fit min-w-fit w-fit flex flex-col justify-center" @click=${() => (this._showQueryPanel = true)}>
														<div class="flex gap-x-1 self-center">
															<!--mdi:account-group source: https://icon-sets.iconify.design-->
															<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
																<path
																	d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
																/>
															</svg>
															<!--mdi:secure source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
																<path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
															</svg>
															<!--mdi:search source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
																<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
															</svg>
														</div>
														${(() => {
															if (this._metadataModelsSearch.searchmetadatamodel && this._metadataModelsSearch.searchresults.data && this._metadataModelsSearch.searchresults.data.length > 0 && this._windowWidth < 800) {
																return nothing
															}
															return html`<div>Search Group Rule Authorizations</div>`
														})()}
													</button>
													<button class="link link-hover min-h-fit h-fit min-w-fit w-fit flex flex-col justify-center" @click=${() => (this._showQueryPanel = true)}>
														<div class="flex gap-x-1 self-center">
															<!--mdi:account-group source: https://icon-sets.iconify.design-->
															<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
																<path
																	d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
																/>
															</svg>
															<!--mdi:secure source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
																<path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
															</svg>
															<!--mdi:delete source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
														</div>
														${(() => {
															if (this._metadataModelsSearch.searchmetadatamodel && this._metadataModelsSearch.searchresults.data && this._metadataModelsSearch.searchresults.data.length > 0 && this._windowWidth < 800) {
																return nothing
															}
															return html`<div>Delete Group Rule Authorizations</div>`
														})()}
													</button>
												</div>
											</div>
										</section>
									</div>
								`
							})()}
						</main>
					`
				})()}
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'group-rule-authorizations': Component
	}
}
