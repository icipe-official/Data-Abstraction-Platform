import { html, LitElement, nothing, TemplateResult, unsafeCSS } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import layoutCss from './layout.css?inline'
import { IAppContextConsumer, IAppContextProvider } from '@dominterfaces/context/app'
import { AppContextConsumer, AppContextProvider } from '@interfaces/context/app'
import '@lib/components/drop-down/component'
import Theme from '@lib/theme'
import Entities from '@domentities'
import Url from '@lib/url'
import Lib from '@lib/lib'
import { ISpaPageNavigation } from '@dominterfaces/spa_page_navigation/spa_page_navigation'
import { SpaPageNavigation } from '@interfaces/spa_page_navigation/spa_page_navigation'

@customElement('group-id-layout')
class Layout extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(layoutCss)]

	constructor() {
		super()
		this._appContext = new AppContextConsumer(this)
		this._appContextProvider = new AppContextProvider(undefined)
		this._pageNavigation = new SpaPageNavigation(this._appContextProvider)
	}

	private _appContext: IAppContextConsumer

	private _appContextProvider: IAppContextProvider

	private _pageNavigation: ISpaPageNavigation

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
			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'page navigation failed' }, bubbles: true, composed: true }))
		}
	}

	private async _handleLogout() {
		try {
			const fetchResponse = await fetch(Url.ApiUrlPaths.Iam.Logout, {
				credentials: 'include'
			})
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.SUCCESS, toastMessage: `logout by ${(fetchData as Entities.IamCredentials.Interface).id![0]}` }, bubbles: true, composed: true }))
				const targetElement = document.querySelector(`#${import.meta.env.VITE_LAYOUT_ROUTES_GROUPID}`)
				if (targetElement !== null) {
					this._appContextProvider.UpdateIamcredential(undefined)
					this._appContextProvider.UpdateIamdirectorygroupid(undefined)
					await this._pageNavigation.Navigate(targetElement, new URL('/', window.location.origin), undefined)
				}
			} else {
				throw [fetchResponse.status, fetchData]
			}
		} catch (e) {
			console.error('logout failed', e)
			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'logout failed' }, bubbles: true, composed: true }))
		}
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

	@state() private _showMenu = false

	connectedCallback(): void {
		super.connectedCallback()
	}

	disconnectedCallback(): void {
		super.disconnectedCallback()
	}

	protected render(): unknown {
		return html`
			<div class="flex-1 flex flex-col justify-center overflow-hidden gap-y-1">
				${(() => {
					if (typeof this._appContext.GetCurrentdirectorygroupid() == 'undefined' || typeof this._appContext.appcontext?.iamcredential == 'undefined') {
						return nothing
					}

					return html`
						<nav class="flex p-2 z-[2]">
							<div class="flex-1 p-1 flex justify-between rounded-md bg-white shadow-sm shadow-gray-800">
								<div class="flex-[9] flex gap-x-1">
									<div class="flex flex-col">
										<button slot="header" class="btn btn-ghost min-w-fit w-fit min-h-fit h-fit p-1" @click=${() => (this._showMenu = !this._showMenu)}>
											<!--mdi:dots-grid source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
												<path
													fill="black"
													d="M12 16c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2M6 16c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m12 12c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2"
												/>
											</svg>
										</button>
										<!--dropdown-->
										${(() => {
											if (!this._showMenu) {
												return nothing
											}

											return html`
												<div class="relative w-full h-0">
													<div id="drop-down-content" slot="content" class="absolute top-0 flex flex-col gap-y-1 bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black w-fit h-fit overflow-hidden">
														<input
															class="input input-primary w-full"
															type="search"
															placeholder="Search menu..."
															.value=${this._searchMenuTextQuery}
															@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																this._searchMenuTextQuery = e.currentTarget.value
															}}
														/>
														<div class="flex justify-evenly flex-wrap gap-4">
															<button
																class="link link-hover min-h-fit h-fit min-w-fit w-fit flex justify-center"
																@click=${async () => {
																	try {
																		const targetElement = document.querySelector(`#${import.meta.env.VITE_LAYOUT_ROUTES}`)
																		if (targetElement !== null) {
																			const dgid = this._appContext.GetCurrentdirectorygroupid()
																			if (dgid) {
																				let url = new URL('/', window.location.origin)
																				Url.AddBaseUrl(url)
																				await this._pageNavigation.Navigate(targetElement, url, undefined)
																				this._appContextProvider.UpdateCurrentDirectorygroupPath(undefined)
																			}
																		}
																	} catch (e) {
																		console.error('page navigation failed', e)
																		window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'page navigation failed' }, bubbles: true, composed: true }))
																	}
																}}
															>
																<div class="flex flex-col gap-y-1 w-fit h-fit self-center justify-center">
																	<!--mdi:home source: https://icon-sets.iconify.design-->
																	<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
																		<path d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z" />
																	</svg>
																	<div class="h-fit self-center font-bold text-lg">Home</div>
																</div>
															</button>
															<button
																class="link link-hover min-h-fit h-fit min-w-fit w-fit flex justify-center ${this._appContext.appcontext.currentdirectorygroupidpath === Url.GetBaseUrl() ? 'link-primary' : ''}"
																@click=${() => {
																	this._handlePageNavigation('/', 'Home')
																}}
															>
																<div class="flex flex-col gap-y-1 w-fit h-fit self-center justify-center">
																	<div class="flex gap-x-1 self-center">
																		<!--mdi:home source: https://icon-sets.iconify.design-->
																		<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
																			<path fill="${this._appContext.appcontext.currentdirectorygroupidpath === Url.GetBaseUrl() ? Theme.Color.PRIMARY : 'black'}" d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z" />
																		</svg>
																		<!--mdi:account-group source: https://icon-sets.iconify.design-->
																		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
																			<path
																				fill="${this._appContext.appcontext.currentdirectorygroupidpath === Url.GetBaseUrl() ? Theme.Color.PRIMARY : 'black'}"
																				d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
																			/>
																		</svg>
																	</div>
																	<div class="h-fit self-center font-bold text-lg">Home (Group)</div>
																</div>
															</button>
														</div>
														<div class="overflow-scroll shadow-inner shadow-gray-800 flex-1 min-w-[500px] w-[40vh] p-1 rounded-md max-h-[50vh] gap-y-4">${this._groupNavigationUrlHtmlTemplate(Url.groupNavigation)}</div>
													</div>
												</div>
											`
										})()}
									</div>
									<div class="font-bold text-xl h-fit self-center">${this._appContext.appcontext.currentdirectorygroupidpath || ''}</div>
								</div>
								<div class="flex">
									<drop-down class="h-fit self-center">
										<button slot="header" class="btn btn-ghost min-w-fit w-fit min-h-fit h-fit p-1 self-center">
											<div class="flex gap-x-1 w-fit h-fit self-center">
												<div class="flex gap-x-[1px] self-center">
													<!--mdi:search-web source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
														<path
															fill="${Theme.Color.PRIMARY}"
															d="m15.5 14l5 5l-1.5 1.5l-5-5v-.79l-.27-.28A6.47 6.47 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.57 4.23l.28.27zm-6-9.5l-.55.03c-.24.52-.61 1.4-.88 2.47h2.86c-.27-1.07-.64-1.95-.88-2.47c-.18-.03-.36-.03-.55-.03M13.83 7a4.94 4.94 0 0 0-2.68-2.22c.24.53.55 1.3.78 2.22zM5.17 7h1.9c.23-.92.54-1.69.78-2.22A4.94 4.94 0 0 0 5.17 7M4.5 9.5c0 .5.08 1.03.23 1.5h2.14l-.12-1.5l.12-1.5H4.73c-.15.47-.23 1-.23 1.5m9.77 1.5c.15-.47.23-1 .23-1.5s-.08-1.03-.23-1.5h-2.14a9.5 9.5 0 0 1 0 3zm-6.4-3l-.12 1.5l.12 1.5h3.26a9.5 9.5 0 0 0 0-3zm1.63 6.5c.18 0 .36 0 .53-.03c.25-.52.63-1.4.9-2.47H8.07c.27 1.07.65 1.95.9 2.47zm4.33-2.5h-1.9c-.23.92-.54 1.69-.78 2.22A4.94 4.94 0 0 0 13.83 12m-8.66 0a4.94 4.94 0 0 0 2.68 2.22c-.24-.53-.55-1.3-.78-2.22z"
														/>
													</svg>
													<!--mdi:gear source: https://icon-sets.iconify.design-->
													<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
														<path
															fill="${Theme.Color.PRIMARY}"
															d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97s-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1s.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z"
														/>
													</svg>
												</div>
											</div>
										</button>
										<div id="drop-down-content" slot="content" class="flex flex-col justify-center gap-y-2 w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black min-w-[200px] max-h-[90vh] overflow-auto">
											<div class="flex justify-between w-full">
												<div class="h-fit self-center font-bold break-words">use current group as authentication context?</div>
												<input
													class="self-center checkbox checkbox-primary"
													type="checkbox"
													.checked=${this._appContext.appcontext.usecurrentdirectorygroupasauthcontext || false}
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
														if (e.currentTarget.checked) {
															this._appContextProvider.Updateusecurrentdirectorygroupasauthcontext(true)
														} else {
															this._appContextProvider.Updateusecurrentdirectorygroupasauthcontext(true)
														}
													}}
												/>
											</div>
											<div class="join">
												<div class="join-item bg-primary text-primary-content p-1 font-bold flex"><div class="self-center">Target Join Depth</div></div>
												<input
													class="join-item input input-primary"
													type="number"
													.value=${`${this._appContext.appcontext.targetjoindepth || 0}`}
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
														if (!Number.isNaN(e.currentTarget.value)) {
															this._appContextProvider.Updatetargetjoindepth(Number(e.currentTarget.value))
														} else {
															this._appContextProvider.Updatetargetjoindepth(undefined)
														}
													}}
												/>
											</div>
											<div class="flex justify-between w-full">
												<div class="h-fit self-center font-bold break-words">skip field if view disabled?</div>
												<input
													class="self-center checkbox checkbox-primary"
													type="checkbox"
													.checked=${this._appContext.appcontext.skipiffgdisabled || false}
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
														if (e.currentTarget.checked) {
															this._appContextProvider.Updateskipiffgdisabled(true)
														} else {
															this._appContextProvider.Updateskipiffgdisabled(true)
														}
													}}
												/>
											</div>
											<div class="flex justify-between w-full">
												<div class="h-fit self-center font-bold break-words">skip field if data extraction disabled?</div>
												<input
													class="self-center checkbox checkbox-primary"
													type="checkbox"
													.checked=${this._appContext.appcontext.skipifdataextraction || false}
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
														if (e.currentTarget.checked) {
															this._appContextProvider.Updateskipifdataextraction(true)
														} else {
															this._appContextProvider.Updateskipifdataextraction(false)
														}
													}}
												/>
											</div>
											<div class="flex justify-between w-full">
												<div class="h-fit self-center font-bold break-words">where condition after join?</div>
												<input
													class="self-center checkbox checkbox-primary"
													type="checkbox"
													.checked=${this._appContext.appcontext.whereafterjoin || false}
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
														if (e.currentTarget.checked) {
															this._appContextProvider.Updatewhereafterjoin(true)
														} else {
															this._appContextProvider.Updatewhereafterjoin(false)
														}
													}}
												/>
											</div>
										</div>
									</drop-down>
									<div class="divider divider-horizontal ml-1 mr-1"></div>
									<drop-down>
										<button slot="header" class="link link-hover link-primary min-w-fit w-fit min-h-fit h-fit p-1">
											<div class="flex gap-x-1 w-fit h-fit self-center">
												<div class="h-fit self-end text-primary text-lg font-bold">${Entities.IamCredentials.GetOpenidName(this._appContext.appcontext?.iamcredential)}</div>
												<!--mdi:account source: https://icon-sets.iconify.design-->
												<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24"><path fill="${Theme.Color.PRIMARY}" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
											</div>
										</button>
										<div id="drop-down-content" slot="content" class="flex flex-col justify-center gap-y-2 w-fit bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black min-w-[200px] max-h-[70vh] overflow-auto">
											${(() => {
												if (this._appContext.appcontext.openidendpoints?.account_management_endpoint) {
													return html`
														<a class="link link-hover link-primary flex justify-around w-full text-lg" href="${this._appContext.appcontext.openidendpoints?.account_management_endpoint}" target="_blank">
															<div class="font-bold h-fit self-center">manage account</div>
															<div class="w-fit h-fit self-center">
																<!--mdi:open-in-new source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"><path fill="${Theme.Color.PRIMARY}" d="M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z" /></svg>
															</div>
														</a>
													`
												}

												return nothing
											})()}
											<button class="btn btn-ghost w-full min-w-fit h-fit min-h-fit p-1 font-bold text-lg" @click=${this._handleLogout}>Log Out</button>
										</div>
									</drop-down>
								</div>
							</div>
						</nav>
					`
				})()}
				<slot></slot>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'group-id-layout': Layout
	}
}





/*
									<drop-down>
										<button slot="header" class="btn btn-ghost min-w-fit w-fit min-h-fit h-fit p-1">
											<!--mdi:dots-grid source: https://icon-sets.iconify.design-->
											<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
												<path
													fill="black"
													d="M12 16c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2M6 16c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m12 12c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2"
												/>
											</svg>
										</button>
										<div id="drop-down-content" slot="content" class="flex flex-col gap-y-1 bg-white p-1 rounded-md shadow-md shadow-gray-800 text-black w-fit min-h-fit overflow-hidden">
											<input
												class="input input-primary w-full"
												type="search"
												placeholder="Search menu..."
												.value=${this._searchMenuTextQuery}
												@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
													this._searchMenuTextQuery = e.currentTarget.value
												}}
											/>
											<div class="flex justify-evenly flex-wrap gap-4">
												<button
													class="link link-hover min-h-fit h-fit min-w-fit w-fit flex justify-center"
													@click=${async () => {
														try {
															const targetElement = document.querySelector(`#${import.meta.env.VITE_LAYOUT_ROUTES}`)
															if (targetElement !== null) {
																const dgid = this._appContext.GetCurrentdirectorygroupid()
																if (dgid) {
																	let url = new URL('/', window.location.origin)
																	Url.AddBaseUrl(url)
																	await this._pageNavigation.Navigate(targetElement, url, undefined)
																	this._appContextProvider.UpdateCurrentDirectorygroupPath(undefined)
																}
															}
														} catch (e) {
															console.error('page navigation failed', e)
															window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'page navigation failed' }, bubbles: true, composed: true }))
														}
													}}
												>
													<div class="flex flex-col gap-y-1 w-fit h-fit self-center justify-center">
														<!--mdi:home source: https://icon-sets.iconify.design-->
														<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
															<path d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z" />
														</svg>
														<div class="h-fit self-center font-bold text-lg">Home</div>
													</div>
												</button>
												<button
													class="link link-hover min-h-fit h-fit min-w-fit w-fit flex justify-center ${this._appContext.appcontext.currentdirectorygroupidpath === Url.GetBaseUrl() ? 'link-primary' : ''}"
													@click=${() => {
														this._handlePageNavigation('/', 'Home')
													}}
												>
													<div class="flex flex-col gap-y-1 w-fit h-fit self-center justify-center">
														<div class="flex gap-x-1 self-center">
															<!--mdi:home source: https://icon-sets.iconify.design-->
															<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
																<path fill="${this._appContext.appcontext.currentdirectorygroupidpath === Url.GetBaseUrl() ? Theme.Color.PRIMARY : 'black'}" d="M10 20v-6h4v6h5v-8h3L12 3L2 12h3v8z" />
															</svg>
															<!--mdi:account-group source: https://icon-sets.iconify.design-->
															<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
																<path
																	fill="${this._appContext.appcontext.currentdirectorygroupidpath === Url.GetBaseUrl() ? Theme.Color.PRIMARY : 'black'}"
																	d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
																/>
															</svg>
														</div>
														<div class="h-fit self-center font-bold text-lg">Home (Group)</div>
													</div>
												</button>
											</div>
											<div class="overflow-scroll shadow-inner shadow-gray-800 flex-1 max-w-[500px] min-h-fit p-1 rounded-md max-h-[70vh] gap-y-4">${this._groupNavigationUrlHtmlTemplate(Url.groupNavigation)}</div>
										</div>
									</drop-down>
*/
