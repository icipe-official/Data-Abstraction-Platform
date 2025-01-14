import Interface from '$src/lib/interface'
import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import logoPng from '$src/assets/logo.png'
import Misc from '$src/lib/miscellaneous'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'

enum PageTab {
	LOGIN = 'LOGIN',
	ABOUT_US = 'ABOUT_US'
}

@customElement('login-screen')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: String }) logintitle: string = 'Welcome!'

	@state() private _currentPageTab: PageTab = PageTab.LOGIN

	private _sessionData: Interface.SessionData | null = null

	connectedCallback(): void {
		super.connectedCallback()
		Misc.AddHistoryState(import.meta.env.VITE_LAYOUT_ROUTES, window.location.pathname)
		const sessionData = sessionStorage.getItem(Misc.SharedStorageKey.SESSION_DATA)
		if (sessionData === null) {
			this._sessionData = sessionData
			this._currentPageTab = PageTab.ABOUT_US
		} else {
			this._sessionData = JSON.parse(sessionData)
		}
	}

	protected render(): unknown {
		return html`
			<header class="flex-[0.5] flex">
				<div class="flex justify-center">
					<img src=${logoPng} alt="website logo" class="max-w-[10vw] max-h-[5vh] self-center" />
				</div>
				<section class="flex-[9.5] flex justify-center">
					<div role="tablist" class="tabs tabs-boxed w-fit">
						${this._sessionData !== null ? html`<button role="tab" class="tab btn${this._currentPageTab === PageTab.LOGIN ? ' tab-active btn-primary' : ''}" @click=${() => (this._currentPageTab = PageTab.LOGIN)}>Login/Register</button>` : nothing}
						<button role="tab" class="tab btn${this._currentPageTab === PageTab.ABOUT_US ? ' tab-active btn-primary' : ''}" @click=${() => (this._currentPageTab = PageTab.ABOUT_US)}>About us</button>
					</div>
				</section>
			</header>
			<main class="flex-[9.5] flex flex-col space-y-1 p-2 rounded-lg shadow-inner shadow-gray-800 overflow-auto">
				${(() => {
					switch (this._currentPageTab) {
						case PageTab.LOGIN:
							return html`
								<div class="flex-[0.5] font-bold text-2xl text-center">${this.logintitle}</div>
								<div class="flex-1 join join-horizontal w-full">
									${(() => {
										if (this._sessionData?.openid_endpoints.login_endpoint) {
											return html` <a class="join-item flex-1 btn btn-primary flex self-center md:w-[70%]" href="${this._sessionData?.openid_endpoints.login_endpoint}"> login </a> `
										} else {
											return nothing
										}
									})()}
									${(() => {
										if (this._sessionData?.openid_endpoints.registration_endpoint) {
											return html` <a class="join-item flex-1 btn btn-secondary flex self-center md:w-[70%]" href="${this._sessionData?.openid_endpoints.registration_endpoint}"> register </a> `
										} else {
											return nothing
										}
									})()}
								</div>
							`
						case PageTab.ABOUT_US:
							return html`
								<div class="font-bold text-lg">Background</div>
								<div class="text-sm">
									Data abstraction constitutes a fundamental component of systematic reviews and scientific research, demanding meticulous attention to detail and precision. Nevertheless, conventional data abstraction methods frequently prove laborious, prone to errors, and inadequately equipped to
									facilitate source tracking and the integration of diverse data categories. In response to these persistent challenges, we introduce the Data Abstraction Tool (DAT), an intuitive software application poised to revolutionize the data abstraction process.
								</div>
								<div class="font-bold text-lg">Methods</div>
								<div class="text-sm">
									Historically, data abstraction has been reliant on manual procedures, involving the extraction of information from both published and unpublished sources. However, this manual approach is notorious for its time-intensive and resource-draining nature, impeding the realization of a
									comprehensive, all-encompassing data platform. To confront this challenge head-on, we present DAT—an innovative web-based data-abstraction platform harnessing the capabilities of semantic web technologies to automate data extraction from journal publications. Our methodology's
									effectiveness is empirically demonstrated through an evaluation of its performance in a use case focused on malaria vectors data abstraction, showcasing remarkable reductions in time expenditure and improvements in accuracy compared to manual techniques.
								</div>
								<div class="font-bold text-lg">Conclusions</div>
								<div class="text-sm">
									DAT represents a publicly accessible web tool tailored for the manual abstraction of data, fostering a unified and cohesive environment for data management. It stands as a valuable resource serving both researchers and policymakers alike, promising to expedite progress in the realm
									of data abstraction. This advancement is poised to facilitate the establishment of expansive databases encompassing diverse datasets, marking a significant stride towards data integration and synthesis in research endeavors.
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
		'login-screen': Component
	}
}
