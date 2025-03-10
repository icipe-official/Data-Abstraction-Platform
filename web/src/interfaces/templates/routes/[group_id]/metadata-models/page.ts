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
import Log from '@lib/log'

@customElement('metadata-models-page')
class Page extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(pageCss)]

	private _metadataModelsSearch: IMetadataModelSearchController
	private _appContext: IAppContextConsumer
	private _fieldAnyMetadataModels: IFieldAnyMetadataModelGet

	@state() private queryConditions: MetadataModel.QueryConditions[] = []

	constructor() {
		super()
		this._appContext = new AppContextConsumer(this)
		this._fieldAnyMetadataModels = new FieldAnyMetadataModel()
		this._metadataModelsSearch = new MetadataModelSearchController(this, `${Url.ApiUrlPaths.MetadataModels}${Url.MetadataModelSearchGetMMPath}`, `${Url.ApiUrlPaths.MetadataModels}${Url.MetadataModelSearchPath}`)
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

	@state() private _fullTextSearchQuery: string = ''
	@state() private _showFilterMenu: boolean = false
	@state() private _showQueryPanel: boolean = false

	protected render(): unknown {
		return html`
			<div class="flex-1 flex flex-col rounded-md bg-white shadow-md shadow-gray-800 overflow-hidden p-1">
				<header class="flex-[0.5] flex flex-col space-y-1 z-[2]">
					<section class="join w-[50%] min-w-[600px] rounded-md self-center border-[1px] border-primary p-1">
						<input
							class="join-item input input-ghost flex-[9]"
							type="search"
							placeholder="Search metadata-models..."
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
						<button class="join-item btn btn-ghost" @click=${() => (this._showFilterMenu = !this._showFilterMenu)}>
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
				<div class="divider z-[1]"></div>
				<main class="flex-[9] overflow-hidden flex space-x-1 z-[1]">
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
									<section class="flex-[2] flex flex-col overflow-hidden">
										<div class="flex-[9] flex overflow-hidden shadow-inner shadow-gray-800 rounded-md">
											<metadata-model-view-query-panel
												.metadatamodel=${this._metadataModelsSearch.searchmetadatamodel}
												.queryconditions=${this.queryConditions}
												@metadata-model-datum-input:updatemetadatamodel=${(e: CustomEvent) => {
													this._metadataModelsSearch.searchmetadatamodel = structuredClone(e.detail.value)
												}}
												@metadata-model-view-query-panel:updatequeryconditions=${(e: CustomEvent) => {
													this.queryConditions = structuredClone(e.detail.value)
												}}
											></metadata-model-view-query-panel>
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
					<section class="flex-[3] overflow-hidden"></section>
				</main>
			</div>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-models-page': Page
	}
}
