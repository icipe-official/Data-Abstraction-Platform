import { IAppContextConsumer } from '@dominterfaces/context/app'
import { IFieldAnyMetadataModelGet } from '@dominterfaces/field_any_metadata_model/field_any_metadata_model'
import { AppContextConsumer } from '@interfaces/context/app'
import { FieldAnyMetadataModel } from '@interfaces/field_any_metadata_model/field_any_metadata_model'
import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import pageCss from './page.css?inline'
import { IMetadataModelSearchController } from '@dominterfaces/controllers/metadata_model'
import { MetadataModelSearchController } from '@interfaces/controllers/metadata_model'
import Url from '@lib/url'
import Theme from '@lib/theme'
import '@lib/components/calendar-time/component'
import { Task } from '@lit/task'
import MetadataModel from '@lib/metadata_model'
import Lib from '@lib/lib'

@customElement('directory-groups-page')
class Page extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(pageCss)]

	private _metadataModelsSearch: IMetadataModelSearchController
	private _appContext: IAppContextConsumer
	private _fieldAnyMetadataModels: IFieldAnyMetadataModelGet

	@state() private queryConditions: MetadataModel.QueryConditions[] = []

	@state() private filterExcludeIndexes: number[] = []

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

	constructor() {
		super()
		this._appContext = new AppContextConsumer(this)
		this._fieldAnyMetadataModels = new FieldAnyMetadataModel()
		this._metadataModelsSearch = new MetadataModelSearchController(this, `${Url.ApiUrlPaths.Directory.Groups}${Url.MetadataModelSearchGetMMPath}`, `${Url.ApiUrlPaths.Directory.Groups}${Url.MetadataModelSearchPath}`)
	}

	private _getMetatadaModelsMmTask = new Task(this, {
		task: async () => {
			if (Object.keys(this._metadataModelsSearch.searchmetadatamodel).length === 0 || !this._metadataModelsSearch.searchmetadatamodel) {
				await this._metadataModelsSearch.FetchMetadataModel(this._appContext.appcontext?.iamdirectorygroupid, this._appContext.appcontext?.targetjoindepth || 1, undefined)
				await import('@lib/components/metadata-model/view/query-panel/component')
			}
		},
		args: () => [this._showQueryPanel]
	})

	private async _handleDatabaseSearch() {
		try {
			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: 'Searching...' }, bubbles: true, composed: true }))
			await this._metadataModelsSearch.Search(
				this.queryConditions,
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

	private _importMMTableTask = new Task(this, {
		task: async () => {
			await import('@lib/components/metadata-model/view/table/component')
		},
		args: () => []
	})

	@state() private _fullTextSearchQuery: string = ''
	@state() private _showFilterMenu: boolean = false
	@state() private _showQueryPanel: boolean = false

	protected render(): unknown {
		return html`
			<div class="flex-1 flex flex-col rounded-md bg-white shadow-md shadow-gray-800 overflow-hidden p-2 gap-y-1">
				<header class="flex-[0.5] flex flex-col space-y-1 z-[2]">
					<section class="join w-[50%] min-w-[600px] rounded-md self-center border-[1px] border-primary p-1">
						<input
							class="join-item input input-ghost flex-[9]"
							type="search"
							placeholder="Search directory-groups..."
							.value=${this._fullTextSearchQuery}
							@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
								this._fullTextSearchQuery = e.currentTarget.value
							}}
						/>
						<button class="join-item btn btn-ghost" @click=${() => (this._showFilterMenu = !this._showFilterMenu)}>
							<!--mdi:filter-menu source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="${Theme.Color.PRIMARY}" d="m11 11l5.76-7.38a1 1 0 0 0-.17-1.4A1 1 0 0 0 16 2H2a1 1 0 0 0-.62.22a1 1 0 0 0-.17 1.4L7 11v5.87a1 1 0 0 0 .29.83l2 2a1 1 0 0 0 1.41 0a1 1 0 0 0 .3-.83zm2 5l5 5l5-5Z" />
							</svg>
						</button>
						<button class="join-item btn btn-ghost" @click=${this._handleDatabaseSearch}>
							<!--mdi:search source: https://icon-sets.iconify.design-->
							<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
								<path fill="${Theme.Color.PRIMARY}" d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
							</svg>
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
										<calendar-time class="join-item flex-1" .roundedborder=${false}></calendar-time>
										<calendar-time class="join-item flex-1" .roundedborder=${false}></calendar-time>
										<div class="join-item h-[5px] bg-primary"></div>
									</div>
									<div class="join join-vertical">
										<div class="join-item bg-primary text-primary-content p-1 font-bold">Last Updated On (from/to)</div>
										<calendar-time class="join-item flex-1" .roundedborder=${false}></calendar-time>
										<calendar-time class="join-item flex-1" .roundedborder=${false}></calendar-time>
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
										</div>
										<div class="join">
											${(() => {
												if (this._metadataModelsSearch.searchmetadatamodel && this._metadataModelsSearch.searchresults.data && this._metadataModelsSearch.searchresults.data.length > 0) {
													return html`
														<button
															class="flex-1 join-item btn btn-secondary min-h-fit h-fit min-w-fit w-fit flex flex-col gap-y-1"
															@click=${() => {
																this.filterExcludeIndexes = structuredClone(MetadataModel.FilterData(this.queryConditions, this._metadataModelsSearch.searchresults.data!))
																window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.INFO, toastMessage: `${this.filterExcludeIndexes.length} filtered out` }, bubbles: true, composed: true }))
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
														.filterexcludeindexes=${this.filterExcludeIndexes}
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
									<div class="self-center flex flex-col max-w-[80%] gap-y-10">
										${(() => {
											if (this._metadataModelsSearch.searchmetadatamodel && this._metadataModelsSearch.searchresults.data && this._metadataModelsSearch.searchresults.data.length > 0) {
												return nothing
											}
											return html` <div class="text-xl font-bold break-words text-center">Create and manage groups. Groups put together related resources thereby making it easier to manage them as well as who has access to what.</div> `
										})()}
										<div class="flex justify-evenly flex-wrap gap-8">
											<button class="link link-hover min-h-fit h-fit min-w-fit w-fit flex flex-col justify-center">
												<div class="flex gap-x-1 self-center">
													<!--mdi:account-group source: https://icon-sets.iconify.design-->
													<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
														<path
															fill="${Theme.Color.SECONDARY_CONTENT}"
															d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
														/>
													</svg>
													<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
												</div>
												${(() => {
													if (this._metadataModelsSearch.searchmetadatamodel && this._metadataModelsSearch.searchresults.data && this._metadataModelsSearch.searchresults.data.length > 0 && this._windowWidth < 800) {
														return nothing
													}
													return html`<div>Create New Group</div>`
												})()}
											</button>
											<button class="link link-hover min-h-fit h-fit min-w-fit w-fit flex flex-col justify-center" @click=${() => (this._showQueryPanel = true)}>
												<div class="flex gap-x-1 self-center">
													<!--mdi:account-group source: https://icon-sets.iconify.design-->
													<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
														<path
															fill="${Theme.Color.SECONDARY_CONTENT}"
															d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
														/>
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
													return html`<div>Search Groups</div>`
												})()}
											</button>
											<button class="link link-hover min-h-fit h-fit min-w-fit w-fit flex flex-col justify-center" @click=${() => (this._showQueryPanel = true)}>
												<div class="flex gap-x-1 self-center">
													<!--mdi:account-group source: https://icon-sets.iconify.design-->
													<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
														<path
															fill="${Theme.Color.SECONDARY_CONTENT}"
															d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
														/>
													</svg>
													<!--mdi:edit source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
												</div>
												${(() => {
													if (this._metadataModelsSearch.searchmetadatamodel && this._metadataModelsSearch.searchresults.data && this._metadataModelsSearch.searchresults.data.length > 0 && this._windowWidth < 800) {
														return nothing
													}
													return html`<div>Update Groups</div>`
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
													<!--mdi:delete source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
												</div>
												${(() => {
													if (this._metadataModelsSearch.searchmetadatamodel && this._metadataModelsSearch.searchresults.data && this._metadataModelsSearch.searchresults.data.length > 0 && this._windowWidth < 800) {
														return nothing
													}
													return html`<div>Delete Groups</div>`
												})()}
											</button>
										</div>
									</div>
								</section>
							</div>
						`
					})()}
				</main>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'directory-groups-page': Page
	}
}
