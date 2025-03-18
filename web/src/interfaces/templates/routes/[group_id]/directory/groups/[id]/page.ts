import { html, LitElement, nothing, unsafeCSS } from 'lit'
import indexCss from '@assets/index.css?inline'
import pageCss from './page.css?inline'
import { customElement, property, state } from 'lit/decorators.js'
import Entities from '@domentities'
import { IAppContextConsumer } from '@dominterfaces/context/app'
import { ISpaPageNavigation } from '@dominterfaces/spa_page_navigation/spa_page_navigation'
import { AppContextConsumer, AppContextProvider } from '@interfaces/context/app'
import { FieldAnyMetadataModel } from '@interfaces/field_any_metadata_model/field_any_metadata_model'
import { SpaPageNavigation } from '@interfaces/spa_page_navigation/spa_page_navigation'
import { IFieldAnyMetadataModelGet } from '@dominterfaces/field_any_metadata_model/field_any_metadata_model'
import MetadataModel from '@lib/metadata_model'
import Log from '@lib/log'
import { Task } from '@lit/task'
import Url from '@lib/url'
import Theme from '@lib/theme'
import Lib from '@lib/lib'
import Json from '@lib/json'

enum Tab {
	INFORMATION = 'INFORMATION',
	GROUP_RULE_AUTHORIZATION = 'GROUP_RULE_AUTHORIZATION',
	IAM_GROUP_AUTHORIZATION = 'IAM_GROUP_AUTHORIZATION'
}

@customElement('directory-group-page')
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

	@state() private _currentTab: Tab = Tab.INFORMATION

	@state() private _data: any = {}

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth
	}

	connectedCallback(): void {
		super.connectedCallback()
		window.addEventListener('resize', this._handleWindowResize)
		if (this.data && this.data.metadata_model && this.data.datum) {
			let value = MetadataModel.DatabaseGetColumnFieldValue(this.data.metadata_model, Entities.DirectoryGroups.FieldColumn.Data, this.data.metadata_model[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID], this.data.datum)
			if (Array.isArray(value)) {
				this._data = structuredClone(value[0])
			} else {
				this._data = null
			}
		} else {
			this._showCreateEdit = true
		}
	}

	disconnectedCallback(): void {
		window.removeEventListener('resize', this._handleWindowResize)
		super.disconnectedCallback()
	}

	@state() private _showCreateEdit = false

	private _resetFields() {
		this._data = {}
	}

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
		args: () => [this._currentTab, this.data, this._showCreateEdit]
	})

	@state() private _datametadatamodel?: any
	private _importedMMDatumInput = false
	private _importMMDatumInputTask = new Task(this, {
		task: async ([directoryGroupID]) => {
			if (!this._importedMMDatumInput) {
				await import('@lib/components/metadata-model/datum-input/component')
				this._importedMMDatumInput = true
			}
			this._datametadatamodel = await this._fieldAnyMetadataModels.GetMetadataModel(Entities.MetadataModelsDirectoryGroups.RepositoryName, '$', Entities.MetadataModelsDirectoryGroups.RepositoryName, [directoryGroupID])
		},
		args: () => [this._appContext?.GetCurrentdirectorygroupid()]
	})

	private _importedIntroPoster = false
	private _importIntroPosterTask = new Task(this, {
		task: async ([_windowWidth]) => {
			if (this._importedIntroPoster || _windowWidth < 1000) {
				return
			}
			Log.Log(Log.Level.DEBUG, this.localName, '_importIntroPosterTask')
			this._importedMMViewDatum = true
			await import('@lib/components/intro-poster/component')
		},
		args: () => [this._windowWidth]
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

	private async _handleUpdateDirectoryGroup() {
		if (!this.data || !this.data.datum) {
			return
		}

		let data: Entities.DirectoryGroups.Interface = {
			id: (this.data.datum as Entities.DirectoryGroups.Interface).id
		}

		if (!Json.AreValuesEqual([this._data], (this.data.datum as Entities.DirectoryGroups.Interface).data)) {
			data.data = [this._data]
		}

		this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: `Updating ${Entities.DirectoryGroups.RepositoryName}` }, bubbles: true, composed: true }))
		try {
			if (!this._appContext.GetCurrentdirectorygroupid()) {
				return
			}
			const fetchUrl = new URL(`${Url.ApiUrlPaths.Directory.Groups}/${Url.Action.UPDATE}`)
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
					if (!Json.AreValuesEqual([this._data], (this.data.datum as Entities.DirectoryGroups.Interface).data)) {
						;(this.data.datum as Entities.DirectoryGroups.Interface).data = [this._data]
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

	private async _handleCreateDirectoryGroups() {
		if (!this._data) {
			return
		}
		let data: Entities.DirectoryGroups.Interface = {
			data: [this._data]
		}

		this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: `Creating new ${Entities.DirectoryGroups.RepositoryName}` }, bubbles: true, composed: true }))
		try {
			if (!this._appContext.GetCurrentdirectorygroupid()) {
				return
			}
			const fetchUrl = new URL(`${Url.ApiUrlPaths.Directory.Groups}/${Url.Action.CREATE}`)
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

		this.dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true, loadingMessage: `Deleting ${Entities.DirectoryGroups.RepositoryName}` }, bubbles: true, composed: true }))
		try {
			if (!this._appContext.GetCurrentdirectorygroupid()) {
				return
			}
			const fetchUrl = new URL(`${Url.ApiUrlPaths.Directory.Groups}/${Url.Action.DELETE}`)
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
								let url = new URL(Url.WebsitePaths.Directory.Groups, window.location.origin)
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
		switch (this._currentTab) {
			case Tab.INFORMATION:
				return html`
					<section id="left-section" class="flex-1 flex flex-col rounded-md shadow-md shadow-gray-800 bg-white p-1 gap-y-1 overflow-hidden">
						${(() => {
							if (this._showCreateEdit) {
								const edit = this.data && this.data.metadata_model && this.data.datum
								return this._importMMDatumInputTask.render({
									pending: () => this._pendingTaskHtmlTemplate(),
									complete: () => html`
										<metadata-model-datum-input
											class="flex-[9]"
											.metadatamodel=${this._datametadatamodel}
											.data=${this._data}
											@metadata-model-datum-input:updatedata=${(e: CustomEvent) => {
												this._data = structuredClone(e.detail.value)
											}}
											@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
												this._datametadatamodel = structuredClone(e.detail.value)
											}}
										></metadata-model-datum-input>
										<div class="join w-full">
											<button
												class="flex-[2] join-item btn btn-secondary flex flex-col justify-center"
												@click=${() => {
													if (edit) {
														this._handleUpdateDirectoryGroup()
													} else {
														this._handleCreateDirectoryGroups()
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
													return html`<div>${edit ? 'Edit' : 'Create'} Group Info</div>`
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
													return html`<div>Reset Group Info</div>`
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
															return html`<div>Close ${edit ? 'Edit' : 'Create'} Group Info</div>`
														})()}
													</button>
												`
											})()}
										</div>
									`,
									error: (e) => {
										console.error(e)
										return this._errorTaskHtmlTemplate()
									}
								})
							}

							if (this.data && this.data.metadata_model && this.data.datum) {
								return this._importMMViewDatumTask.render({
									pending: () => this._pendingTaskHtmlTemplate(),
									complete: () => html`
										<div class="border-[1px] border-gray-400 flex-1 h-fit max-h-full max-w-full flex overflow-hidden rounded-md">
											<metadata-model-view-datum class="flex-1" .metadatamodel=${this.data!.metadata_model} .data=${this.data!.datum} .getmetadatamodel=${this._fieldAnyMetadataModels}></metadata-model-view-datum>
										</div>
										<div class="join w-full">
											${(() => {
												if (this._data === null) {
													return
												}

												return html`
													<button class="flex-1 join-item btn btn-secondary flex flex-col justify-center" @click=${() => (this._showCreateEdit = true)}>
														<!--mdi:edit source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="${Theme.Color.SECONDARY_CONTENT}" d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
														${(() => {
															if (this._windowWidth < 800) {
																return nothing
															}
															return html`<div>Edit Group Info</div>`
														})()}
													</button>
													<button class="flex-1 join-item btn btn-secondary flex flex-col justify-center" @click=${this._handleDeleteMetadataModel}>
														<!--mdi:delete source: https://icon-sets.iconify.design-->
														<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="${Theme.Color.SECONDARY_CONTENT}" d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
														${(() => {
															if (this._windowWidth < 800) {
																return nothing
															}
															return html`<div>Delete Group</div>`
														})()}
													</button>
												`
											})()}
											<button
												class="flex-1 join-item btn btn-secondary flex flex-col justify-center"
												@click=${async () => {
													try {
														const targetElement = document.querySelector(`#${import.meta.env.VITE_LAYOUT_ROUTES_GROUPID}`)
														if (targetElement !== null) {
															const dgid = (this.data!.datum as Entities.DirectoryGroups.Interface).id![0]
															if (dgid) {
																let url = new URL('/', window.location.origin)
																url.searchParams.append(Url.SearchParams.DIRECTORY_GROUP_ID, dgid)
																Url.AddBaseUrl(url)
																await this._pageNavigation.Navigate(targetElement, url, 'Home')
															}
														}
													} catch (e) {
														console.error('page navigation failed', e)
														this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'page navigation failed' }, bubbles: true, composed: true }))
													}
												}}
											>
												<!--majesticons:door-enter source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
													<g fill="none">
														<path
															fill="${Theme.Color.SECONDARY_CONTENT}"
															fill-rule="evenodd"
															d="M10.138 1.815A3 3 0 0 1 14 4.688v14.624a3 3 0 0 1-3.862 2.873l-6-1.8A3 3 0 0 1 2 17.512V6.488a3 3 0 0 1 2.138-2.873zM15 4a1 1 0 0 1 1-1h3a3 3 0 0 1 3 3v1a1 1 0 1 1-2 0V6a1 1 0 0 0-1-1h-3a1 1 0 0 1-1-1m6 12a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3h-3a1 1 0 1 1 0-2h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1M9 11a1 1 0 1 0 0 2h.001a1 1 0 1 0 0-2z"
															clip-rule="evenodd"
														/>
														<path stroke="${Theme.Color.SECONDARY_CONTENT}" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12h-5m0 0l2-2m-2 2l2 2" />
													</g>
												</svg>
												${(() => {
													if (this._windowWidth < 800) {
														return nothing
													}
													return html`<div>Enter Group</div>`
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
			case Tab.GROUP_RULE_AUTHORIZATION:
				return html`gra`
			case Tab.IAM_GROUP_AUTHORIZATION:
				return html`iga`
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'directory-group-page': Page
	}
}
