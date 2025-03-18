import { LitElement, unsafeCSS, html, nothing, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import pageCss from './page.css?inline'
import { IAppContextConsumer, IAppContextProvider } from '@dominterfaces/context/app'
import { AppContextConsumer, AppContextProvider } from '@interfaces/context/app'
import { FieldAnyMetadataModel } from '@interfaces/field_any_metadata_model/field_any_metadata_model'
import { Task } from '@lit/task'
import Url from '@lib/url'
import Entities from '@domentities'
import Lib from '@lib/lib'
import Theme from '@lib/theme'
import { IFieldAnyMetadataModelGet } from '@dominterfaces/field_any_metadata_model/field_any_metadata_model'
import { ISpaPageNavigation } from '@dominterfaces/spa_page_navigation/spa_page_navigation'
import { SpaPageNavigation } from '@interfaces/spa_page_navigation/spa_page_navigation'

enum Tab {
	ABOUT = 'ABOUT',
	MENU = 'MENU'
}

@customElement('group-id-home-page')
class Page extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(pageCss)]

	@property({ type: Object }) data: Entities.MetadataModel.IDatum | undefined

	constructor() {
		super()
		this._appContextProvider = new AppContextProvider(undefined)
		this._appContext = new AppContextConsumer(this)
		this._fieldAnyMetadataModels = new FieldAnyMetadataModel()
		this._pageNavigation = new SpaPageNavigation(this._appContextProvider)
	}

	private _appContextProvider: IAppContextProvider

	private _appContext: IAppContextConsumer

	private _pageNavigation: ISpaPageNavigation

	@state() private _windowWidth: number = window.innerWidth
	private _handleWindowResize = (_: UIEvent) => {
		this._windowWidth = window.innerWidth
	}

	private _fieldAnyMetadataModels: IFieldAnyMetadataModelGet

	@state() private _editGroupData: Entities.DirectoryGroups.Interface | undefined
	@state() private _editGroup = false

	private _importMMViewDatumTask = new Task(this, {
		task: async () => {
			await import('@lib/components/metadata-model/view/datum/component')
		},
		args: () => []
	})

	private _groupInfoHtmlTemplate() {
		if (!this.data || typeof this.data.datum !== 'object' || typeof this.data.metadata_model !== 'object') {
			return html`
				<div class="flex-1 flex flex-col justify-center items-center">
					<span class="w-fit text-error font-bold">Error: Group information is not valid.</span>
				</div>
			`
		}

		return html`
			<div class="flex-1 flex flex-col gap-y-1 overflow-hidden">
				<header class="font-bold text-xl text-center">Group Information</header>
				${(() => {
					if (this._editGroup) {
						return html`edit`
					}

					return html`
						<div class="flex-[9] flex flex-col overflow-hidden">
							${this._importMMViewDatumTask.render({
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
									<div class="divider"></div>
									<div class="flex-1 h-fit max-h-full max-w-full flex overflow-hidden">
										<metadata-model-view-datum class="flex-1" .metadatamodel=${this.data!.metadata_model} .data=${this.data!.datum} .getmetadatamodel=${this._fieldAnyMetadataModels}></metadata-model-view-datum>
									</div>
								`,
								error: (e) => {
									console.error(e)
									return html`
										<div class="flex-1 flex flex-col justify-center items-center">
											<span class="w-fit text-error font-bold">Error: Could not get directory group information.</span>
										</div>
									`
								}
							})}
						</div>
						${(() => {
							if (typeof (this.data!.datum as Entities.DirectoryGroups.Interface).data === 'undefined') {
								return nothing
							}

							return html` <button class="btn btn-secondary min-w-full w-full min-h-fit h-fit p-2" @click=${() => (this._editGroup = true)}>Edit Group Information</button> `
						})()}
					`
				})()}
			</div>
		`
	}

	@state() private _currentTab: Tab = Tab.MENU

	private async _handlePageNavigation(path: string, title: string | undefined = undefined) {
		try {
			const targetElement = document.querySelector(`#${import.meta.env.VITE_LAYOUT_ROUTES_GROUPID}`)
			if (targetElement !== null) {
				const dgid = this._appContext.GetCurrentdirectorygroupid()
				if (dgid) {
					let url = new URL(path, window.location.origin)
					url.searchParams.append(Url.SearchParams.DIRECTORY_GROUP_ID, dgid)
					Url.AddBaseUrl(url)
					await this._pageNavigation.Navigate(targetElement, url, title)
				}
			}
		} catch (e) {
			console.error('page navigation failed', e)
			this.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'page navigation failed' }, bubbles: true, composed: true }))
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

	@state() private _showHintID = ''

	@state() private _showHintClicked = false

	@state() private _searchMenuTextQuery = ''
	private _groupNavInfoPassesTextQuery(value: Url.IGroupNavigationInfo) {
		if (this._searchMenuTextQuery.length == 0) {
			return true
		}

		if (value.title && value.title.toLocaleLowerCase().includes(this._searchMenuTextQuery.toLocaleLowerCase())) {
			return true
		}

		if (value.description && value.description.toLocaleLowerCase().includes(this._searchMenuTextQuery.toLocaleLowerCase())) {
			return true
		}

		return false
	}

	private _groupNavigationUrlHtmlTemplate(value: Url.IGroupNavigationInfo[]): TemplateResult<1> {
		return html`
			<div class="flex justify-evenly flex-wrap gap-8">
				${value
					.filter((v) => !v.navinfo || v.navinfo.length == 0)
					.map((v) => {
						if (!v.path) {
							return html`<div class="text-error">path not valid</div>`
						}

						if (!this._groupNavInfoPassesTextQuery(v)) {
							return nothing
						}

						return html`
							<div class="flex flex-col">
								<button
									class="link link-hover min-h-fit h-fit min-w-fit w-fit flex justify-center"
									@click=${() => {
										this._handlePageNavigation(v.path!, v.title)
									}}
								>
									<div class="flex flex-col gap-y-1 w-fit h-fit self-center">
										${(() => {
											if (!v.icon) {
												return nothing
											}

											return v.icon
										})()}
										<div class="h-fit self-center font-bold text-lg">${v.title}</div>
									</div>
									${(() => {
										if (!v.description || v.description.length == 0) {
											return nothing
										}

										return html`
											<button
												class="btn btn-circle min-w-fit w-fit min-h-fit h-fit p-[1px] self-end"
												@click=${(e: Event) => {
													e.stopPropagation()
													if (this._showHintID == v.path) {
														this._showHintID = ''
														this._showHintClicked = false
													} else {
														this._showHintID = v.path!
														this._showHintClicked = true
													}
												}}
												@mouseover=${() => {
													this._showHintID = v.path!
												}}
												@mouseout=${() => {
													if (this._showHintClicked) {
														return
													}
													this._showHintID = ''
												}}
											>
												<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
													<path
														fill="${Theme.Color.PRIMARY}"
														d="m15.07 11.25l-.9.92C13.45 12.89 13 13.5 13 15h-2v-.5c0-1.11.45-2.11 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41a2 2 0 0 0-2-2a2 2 0 0 0-2 2H8a4 4 0 0 1 4-4a4 4 0 0 1 4 4a3.2 3.2 0 0 1-.93 2.25M13 19h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
													/>
												</svg>
											</button>
										`
									})()}
								</button>
								${(() => {
									if (!v.description || v.description.length == 0) {
										return nothing
									}

									if (this._showHintID === v.path) {
										return html`
											<div class="w-full h-0 relative z-[100]">
												<div class="z-[100] absolute top-0 shadow-md shadow-gray-800 rounded-md bg-primary text-primary-content p-1 text-sm font-bold">${v.description}</div>
											</div>
										`
									}

									return nothing
								})()}
							</div>
						`
					})}
			</div>
			${value
				.filter((v) => v.navinfo && v.navinfo.length > 0)
				.map((v) => {
					return html`
						<div class="flex-1 divider min-w-full">${v.title || ''}</div>
						${this._groupNavigationUrlHtmlTemplate(v.navinfo!)}
					`
				})}
		`
	}

	protected render(): unknown {
		return html`
			${(() => {
				if (this._windowWidth <= 1000) {
					return nothing
				}

				return html` <section class="flex-1 flex flex-col bg-white rounded-md p-1 shadow-md shadow-gray-800 overflow-hidden">${this._groupInfoHtmlTemplate()}</section> `
			})()}
			<section class="flex-1 flex flex-col bg-white rounded-md p-1 shadow-md shadow-gray-800 overflow-hidden gap-y-1">
				${(() => {
					if (this._windowWidth > 1000) {
						return nothing
					}

					return html`
						<header role="tablist" class="tabs tabs-bordered">
							<button role="tab" class="tab${this._currentTab === Tab.ABOUT ? ' tab-active' : ''}" @click=${() => (this._currentTab = Tab.ABOUT)}>About</button>
							<button role="tab" class="tab${this._currentTab === Tab.MENU ? ' tab-active' : ''}" @click=${() => (this._currentTab = Tab.MENU)}>Menu</button>
						</header>
					`
				})()}
				${(() => {
					if (this._windowWidth <= 1000) {
						if (this._currentTab === Tab.ABOUT) {
							return this._groupInfoHtmlTemplate()
						}
					}

					if (this._windowWidth > 1000 || this._currentTab === Tab.MENU) {
						return html`
							<input
								class="input input-primary w-full"
								type="search"
								placeholder="Search menu..."
								.value=${this._searchMenuTextQuery}
								@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
									this._searchMenuTextQuery = e.currentTarget.value
								}}
							/>
							<button
								class="link link-hover min-h-fit h-fit min-w-fit w-fit flex justify-center self-center"
								@click=${async () => {
									try {
										const targetElement = document.querySelector(`#${import.meta.env.VITE_LAYOUT_ROUTES}`)
										if (targetElement !== null) {
											const dgid = this._appContext.GetCurrentdirectorygroupid()
											if (dgid) {
												let url = new URL('/', window.location.origin)
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
								<div class="flex flex-col gap-y-1 w-fit h-fit self-center justify-center">
									<!--mdi:home source: https://icon-sets.iconify.design-->
									<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z" /></svg>
									<div class="h-fit self-center font-bold text-lg">Home</div>
								</div>
							</button>
							<div class="overflow-auto shadow-inner shadow-gray-800 flex-1 w-full h-full p-1 rounded-md">
								<div class="flex flex-col justify-center gap-y-4">${this._groupNavigationUrlHtmlTemplate(Url.groupNavigation)}</div>
							</div>
						`
					}
				})()}
			</section>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'group-id-home-page': Page
	}
}
