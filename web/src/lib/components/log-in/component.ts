import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import logoPng from '@assets/logo.png'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import { IAppContextConsumer } from '@dominterfaces/context/app'
import { AppContextConsumer, AppContextProvider } from '@interfaces/context/app'
import { IMetadataModelSearchController } from '@dominterfaces/controllers/metadata_model'
import { Task } from '@lit/task'
import { MetadataModelSearchController } from '@interfaces/controllers/metadata_model'
import Url from '@lib/url'
import MetadataModel from '@lib/metadata_model'
import { FieldAnyMetadataModel } from '@interfaces/field_any_metadata_model/field_any_metadata_model'
import Lib from '@lib/lib'
import Entities from '@domentities'
import { ISpaPageNavigation } from '@dominterfaces/spa_page_navigation/spa_page_navigation'
import { SpaPageNavigation } from '@interfaces/spa_page_navigation/spa_page_navigation'
import { IFieldAnyMetadataModelGet } from '@dominterfaces/field_any_metadata_model/field_any_metadata_model'

enum PageTab {
	LOGIN = 'LOGIN',
	ABOUT_US = 'ABOUT_US'
}

@customElement('log-in')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: String }) title: string = 'Welcome!'

	@state() private _currentPageTab: PageTab = PageTab.LOGIN

	constructor() {
		super()
		this._pageNavigation = new SpaPageNavigation(new AppContextProvider(undefined))
		this._appContext = new AppContextConsumer(this)
	}

	private _appContext: IAppContextConsumer

	private _directoryGroupsSearchController?: IMetadataModelSearchController

	private _fieldAnyMetadataModels: IFieldAnyMetadataModelGet = new FieldAnyMetadataModel()

	private _getDirectoryGroupsTask = new Task(this, {
		task: async () => {
			if (!this._appContext.appcontext?.iamcredential) {
				return
			}

			if (typeof this._directoryGroupsSearchController === 'undefined') {
				this._directoryGroupsSearchController = new MetadataModelSearchController(this, `${Url.ApiUrlPaths.Directory.Groups}${Url.MetadataModelSearchGetMMPath}`, `${Url.ApiUrlPaths.Directory.Groups}${Url.MetadataModelSearchPath}`)
				await this._directoryGroupsSearchController.FetchMetadataModel(this._appContext.appcontext?.iamdirectorygroupid, 0, undefined)
				if (typeof this._directoryGroupsSearchController.searchmetadatamodel === 'object') {
					this._directoryGroupsSearchController.searchmetadatamodel[MetadataModel.FgProperties.DATABASE_LIMIT] = 50
				}
				await this._directoryGroupsSearchController.Search(undefined, this._appContext.appcontext?.iamdirectorygroupid, this._appContext.appcontext?.iamdirectorygroupid, 0, true, true, undefined)
			}
			await import('@lib/components/metadata-model/view/table/component')
		},
		args: () => [this._appContext.appcontext?.iamcredential]
	})

	private async _handleLogout() {
		try {
			const fetchResponse = await fetch(Url.ApiUrlPaths.Iam.Logout, {
				credentials: 'include'
			})
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: `logout by ${(fetchData as Entities.IamCredentials.Interface).id![0]}` }, bubbles: true, composed: true }))
				window.location.reload()
			} else {
				throw [fetchResponse.status, fetchData]
			}
		} catch (e) {
			console.error('logout failed', e)
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'logout failed' }, bubbles: true, composed: true }))
		}
	}

	private _pageNavigation: ISpaPageNavigation

	private async _handlePageNavigationToGroup(directoryGroupID: string) {
		const url = new URL(Url.WebsitePaths.Home, window.location.origin)
		url.searchParams.append(Url.SearchParams.DIRECTORY_GROUP_ID, directoryGroupID)
		const targetElement = document.querySelector(`#${import.meta.env.VITE_LAYOUT_ROUTES}`)
		if (targetElement !== null) {
			try {
				await this._pageNavigation.Navigate(targetElement, url, 'Home')
			} catch (e) {
				console.error('page navigation failed', e)
				this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'page navigation failed' }, bubbles: true, composed: true }))
			}
		}
	}

	@state() private _pickDirectoryGroup: boolean = false

	protected render(): unknown {
		return html`
			<header class="flex-[0.5] flex">
				<div class="flex justify-center">
					<img src=${logoPng} alt="website logo" class="max-w-[10vw] max-h-[5vh] self-center" />
				</div>
				<section class="flex-[9.5] flex justify-center">
					<div role="tablist" class="tabs tabs-boxed w-fit">
						${this._appContext.appcontext?.openidendpoints?.login_endpoint
							? html`
									<button role="tab" class="h-full tab btn${this._currentPageTab === PageTab.LOGIN ? ' tab-active btn-primary' : ''}" @click=${() => (this._currentPageTab = PageTab.LOGIN)}>
										Login ${this._appContext.appcontext?.openidendpoints?.registration_endpoint && !this._appContext.appcontext?.iamcredential ? '/Register' : ''}
									</button>
								`
							: nothing}
						<button role="tab" class="h-full tab btn${this._currentPageTab === PageTab.ABOUT_US ? ' tab-active btn-primary' : ''}" @click=${() => (this._currentPageTab = PageTab.ABOUT_US)}>About us</button>
					</div>
				</section>
			</header>
			<main class="flex-[9.5] flex flex-col gap-y-1 p-2 rounded-lg shadow-inner shadow-gray-800 overflow-hidden">
				${(() => {
					switch (this._currentPageTab) {
						case PageTab.LOGIN:
							if (this._appContext.appcontext?.iamcredential) {
								return html`
									<header class="flex justify-between">
										<div>Welcome <span class="font-bold">${Entities.IamCredentials.GetOpenidName(this._appContext.appcontext?.iamcredential)}</span></div>
										<button class="btn btn-ghost min-w-fit w-fit min-h-fit h-fit p-1" @click=${this._handleLogout}>
											<!--mdi:logout source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="m17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5M4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z" /></svg>
										</button>
									</header>
									${(() => {
										if (this._pickDirectoryGroup) {
											return html`
												${this._getDirectoryGroupsTask.render({
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
														<div class="flex flex-col">
															<header class="sticky top-0 z-[2] italic text-sm">Choose a directory group to launch...</header>
															<div class="border-[1px] border-gray-400 h-fit max-h-full max-w-full flex overflow-hidden rounded-md">
																<metadata-model-view-table
																	.metadatamodel=${this._directoryGroupsSearchController?.searchmetadatamodel}
																	.data=${this._directoryGroupsSearchController?.searchresults.data!}
																	.getmetadatamodel=${this._fieldAnyMetadataModels}
																	@metadata-model-view-table:rowclick=${async (e: CustomEvent) => {
																		const directoryGroup = e.detail.value as Entities.DirectoryGroups.Interface
																		if (Array.isArray(directoryGroup.id) && directoryGroup.id.length == 1) {
																			await this._handlePageNavigationToGroup(directoryGroup.id![0])
																		}
																	}}
																></metadata-model-view-table>
															</div>
														</div>
													`,
													error: (e) => {
														console.error(e)
														return html`
															<div class="flex-1 flex flex-col justify-center items-center">
																<span class="w-fit text-error font-bold">Error: Could not get directory groups that could be launched. Please contact your administrator.</span>
															</div>
														`
													}
												})}
											`
										}

										return html`
											<main class="join flex-1">
												${(() => {
													if (this._appContext.appcontext.iamdirectorygroupid) {
														return html`
															<button
																class="flex-1 join-item btn btn-primary"
																@click=${() => {
																	this._handlePageNavigationToGroup(this._appContext.appcontext!.iamdirectorygroupid!)
																}}
															>
																Launch Default Group
															</button>
														`
													}

													return nothing
												})()}
												<button
													class="flex-1 join-item btn btn-primary"
													@click=${() => {
														this._pickDirectoryGroup = true
													}}
												>
													Pick Group To Launch
												</button>
											</main>
										`
									})()}
								`
							}
							return html`
								<div class="flex-[0.5] font-bold text-2xl text-center">${this.title}</div>
								<div class="flex-1 join join-horizontal w-full">
									${(() => {
										if (this._appContext.appcontext?.openidendpoints?.login_endpoint) {
											return html` <a class="join-item flex-1 btn btn-primary flex self-center md:w-[70%]" href="${this._appContext.appcontext?.openidendpoints.login_endpoint}"> login </a> `
										} else {
											return nothing
										}
									})()}
									${(() => {
										if (this._appContext.appcontext?.openidendpoints?.registration_endpoint) {
											return html` <a class="join-item flex-1 btn btn-secondary flex self-center md:w-[70%]" href="${this._appContext.appcontext?.openidendpoints.registration_endpoint}"> register </a> `
										} else {
											return nothing
										}
									})()}
								</div>
							`
						case PageTab.ABOUT_US:
							return html`
								<div class="flex flex-col gap-y-1 overflow-auto">
									<div class="font-bold text-lg">Background</div>
									<div class="text-sm">
										Data abstraction constitutes a fundamental component of systematic reviews and scientific research, demanding meticulous attention to detail and precision. Nevertheless, conventional data abstraction methods frequently prove laborious, prone to errors, and inadequately equipped
										to facilitate source tracking and the integration of diverse data categories. In response to these persistent challenges, we introduce the Data Abstraction Tool (DAT), an intuitive software application poised to revolutionize the data abstraction process.
									</div>
									<div class="font-bold text-lg">Methods</div>
									<div class="text-sm">
										Historically, data abstraction has been reliant on manual procedures, involving the extraction of information from both published and unpublished sources. However, this manual approach is notorious for its time-intensive and resource-draining nature, impeding the realization of a
										comprehensive, all-encompassing data platform. To confront this challenge head-on, we present DAT—an innovative web-based data-abstraction platform harnessing the capabilities of semantic web technologies to automate data extraction from journal publications. Our methodology's
										effectiveness is empirically demonstrated through an evaluation of its performance in a use case focused on malaria vectors data abstraction, showcasing remarkable reductions in time expenditure and improvements in accuracy compared to manual techniques.
									</div>
									<div class="font-bold text-lg">Conclusions</div>
									<div class="text-sm">
										DAT represents a publicly accessible web tool tailored for the manual abstraction of data, fostering a unified and cohesive environment for data management. It stands as a valuable resource serving both researchers and policymakers alike, promising to expedite progress in the
										realm of data abstraction. This advancement is poised to facilitate the establishment of expansive databases encompassing diverse datasets, marking a significant stride towards data integration and synthesis in research endeavors.
									</div>
								</div>
							`
						default:
							return html`Tab not implemented`
					}
				})()}
			</main>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'log-in': Component
	}
}
