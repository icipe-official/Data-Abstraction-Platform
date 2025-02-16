import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import 'iconify-icon'
import Misc from '$src/lib/miscellaneous'
import Json from '$src/lib/json'
import MetadataModel from '$src/lib/metadata_model'
import './field-group/component'
import './field-group/query-condition/component'
import Log from '$src/lib/log'

@customElement('metadata-model-view-query-panel')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) metadatamodel: any = {}
	@property({ type: String }) startcolor: Theme.Color = Theme.Color.PRIMARY
	@property({ type: Array }) queryconditions: any[] = [{}]

	@state() private _currentTabIndex: number = 0

	@state() private _expandTabSection: boolean = false

	@state() private _pinTabs: boolean = false

	@state() private _showHintID: string = ''

	@state() private _selectedFieldGroupKey: string = ''
	@state() private _selectedFieldGroupQueryConditionIndex: number = -1

	@state() private _scrollelement: Element | undefined = undefined

	private _updatemetadatamodel = (fieldGroup: any) => {
		let fieldGroupPath = fieldGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]
		if (typeof fieldGroupPath !== 'string') {
			return
		}
		fieldGroupPath = (fieldGroupPath as string).replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]')
		try {
			this.metadatamodel = structuredClone(Json.SetValueInObject(this.metadatamodel, fieldGroupPath, fieldGroup))
			this.dispatchEvent(
				new CustomEvent('metadata-model-view-query-panel:updatemetadatamodel', {
					detail: {
						value: this.metadatamodel
					}
				})
			)
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, e, fieldGroup)
		}
	}

	protected render(): unknown {
		if (typeof this._scrollelement === 'undefined') {
			;(async () => {
				await new Promise((resolve: (e: Element) => void) => {
					if ((this.shadowRoot as ShadowRoot).querySelector('#scroll-element')) {
						resolve((this.shadowRoot as ShadowRoot).querySelector('#scroll-element') as Element)
						return
					}

					const observer = new MutationObserver(() => {
						if ((this.shadowRoot as ShadowRoot).querySelector('#scroll-element')) {
							resolve((this.shadowRoot as ShadowRoot).querySelector('#scroll-element') as Element)
							observer.disconnect()
						}
					})

					observer.observe(this.shadowRoot as ShadowRoot, {
						childList: true,
						subtree: true
					})
				}).then((e) => {
					this._scrollelement = e
				})
			})()
		}

		return html`
			<header class="z-[2] flex justify-between p-1 shadow-sm shadow-gray-800 ${this.startcolor === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.startcolor === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}">
				<div class="flex flex-col">
					<button
						class="btn ${this.startcolor === Theme.Color.PRIMARY ? 'btn-primary' : this.startcolor === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'} h-fit min-h-fit"
						@click=${() => {
							this.queryconditions = [{}]
							this._currentTabIndex = 0
						}}
						@mouseover=${() => (this._showHintID = 'tabs-remove')}
						@mouseout=${() => (this._showHintID = '')}
					>
						<iconify-icon icon="mdi:tab-remove" style="color: ${Theme.GetColorContent(this.startcolor)};" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('32')}></iconify-icon>
					</button>
					${(() => {
						if (this._showHintID === 'tabs-remove') {
							return html`
								<div class="relative">
									<div class="absolute top-0 z-[2] rounded-md shadow-md shadow-gray-800 p-1 ${this.startcolor === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.startcolor === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : 'bg-accent text-accent-content'}">
										Remove all query conditions
									</div>
								</div>
							`
						}

						return nothing
					})()}
				</div>
				<div class="flex-[9] text-center h-fit self-center text-lg font-bold italic">${this._currentTabIndex + 1} - Query Condition</div>
			</header>
			<main class="z-[1] flex-[9.5] flex overflow-hidden">
				<aside class="w-fit h-full flex flex-col overflow-hidden p-[1px] shadow-sm shadow-gray-800" @mouseenter=${() => (this._expandTabSection = true)} @mouseleave=${() => (this._expandTabSection = false)}>
					<button
						class="btn flex justify-start btn-ghost h-fit min-h-fit"
						@click=${() => {
							this._pinTabs = !this._pinTabs
						}}
					>
						<iconify-icon icon=${this._pinTabs ? 'mdi:pin' : 'mdi:pin-off'} style="color: black;" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('32')}></iconify-icon>
						${(() => {
							if (this._expandTabSection || this._pinTabs) {
								return html`<div>${this._pinTabs ? 'Unpin' : 'Pin'} tab panel</div>`
							}

							return nothing
						})()}
					</button>
					<div class="divider"></div>
					<div class="flex-[9.5] h-fit max-h-fit overflow-x-hidden overflow-y-auto flex flex-col space-y-1">
						${this.queryconditions.map((_, index) => {
							return html`
								<button
									class="btn flex ${this._expandTabSection || this._pinTabs ? 'justify-start' : 'justify-center'} h-fit min-h-fit p-1 ${this._currentTabIndex === index
										? this.startcolor === Theme.Color.PRIMARY
											? 'btn-primary'
											: this.startcolor === Theme.Color.SECONDARY
												? 'btn-secondary'
												: 'btn-accent'
										: ''}"
									@click=${() => (this._currentTabIndex = index)}
								>
									<div class="flex justify-between ${this._expandTabSection || this._pinTabs ? 'w-full' : 'w-fit'}">
										<div class="flex space-x-2">
											<div class="text-lg font-bold italic h-fit self-center">${index + 1}</div>
											${(() => {
												if (this._expandTabSection || this._pinTabs) {
													return html` <div class="text-sm h-fit self-center">- Query Condition</div> `
												}

												return nothing
											})()}
										</div>
										${(() => {
											if (this._expandTabSection || this._pinTabs) {
												return html`
													<button
														class="btn btn-ghost h-fit min-h-fit w-fit min-w-fit p-1"
														@click=${(e: Event) => {
															e.stopPropagation()
															this.queryconditions = structuredClone(Json.DeleteValueInObject(this.queryconditions, `$.${index}`))
															if (this.queryconditions.length === 0) {
																this.queryconditions = [{}]
															}

															if (this._currentTabIndex > this.queryconditions.length - 1) {
																this._currentTabIndex = this.queryconditions.length - 1
															}
														}}
													>
														<iconify-icon icon="mdi:close-thick" style="color: ${this._currentTabIndex === index ? Theme.GetColorContent(this.startcolor) : 'black'};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
													</button>
												`
											}

											return nothing
										})()}
									</div>
								</button>
							`
						})}
					</div>
					<div class="divider"></div>
					<button
						class="btn flex justify-start btn-ghost h-fit min-h-fit"
						@click=${() => {
							this.queryconditions = [...this.queryconditions, {}]
							this._currentTabIndex = this.queryconditions.length - 1
						}}
					>
						<iconify-icon icon="mdi:tab-add" style="color: black;" width=${Misc.IconifySize('30')} height=${Misc.IconifySize('32')}></iconify-icon>
						${(() => {
							if (this._expandTabSection || this._pinTabs) {
								return html`<div>New query condition</div>`
							}

							return nothing
						})()}
					</button>
				</aside>
				<main class="flex-[9.5] flex flex-col overflow-hidden">
					${(() => {
						if (this._selectedFieldGroupKey.length > 0 && this._selectedFieldGroupQueryConditionIndex > -1) {
							const fieldGroup = Json.GetValueInObject(this.metadatamodel, this._selectedFieldGroupKey.replace(new RegExp(MetadataModel.ARRAY_INDEX_PLACEHOLDER_REGEX_SEARCH, 'g'), '[0]'))

							return html`
								<section class="flex flex-[9] flex-col w-full h-fit overflow-hidden">
									<header class="flex justify-between p-1 ${this.startcolor === Theme.Color.PRIMARY ? 'text-primary' : this.startcolor === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">
										<div class="h-fit self-center">${MetadataModel.GetFieldGroupName(fieldGroup)}</div>
										<button
											class="btn btn-ghost h-fit min-h-fit w-fit min-w-fit p-1"
											@click=${() => {
												this._selectedFieldGroupKey = ''
												this._selectedFieldGroupQueryConditionIndex = -1
											}}
										>
											<iconify-icon icon="mdi:close-thick" style="color: ${this.startcolor};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
										</button>
									</header>
									<metadata-model-view-query-panel-field-group-query-condition
										class="flex-[9]"
										.color=${this.startcolor}
										.fieldgroup=${fieldGroup}
										.updatemetadatamodel=${this._updatemetadatamodel}
										></metadata-model-view-query-panel-field-group-query-condition>
								</section>
							`
						}

						return nothing
					})()}
					<section id="scroll-element" class="flex-1 overflow-auto p-1">
						${(() => {
							if (typeof this._scrollelement === 'undefined') {
								return html`
									<div class="flex-1 w-full h-full flex justify-center">
										<span class="loading loading-spinner loading-md self-center ${this.startcolor === Theme.Color.PRIMARY ? 'text-primary' : this.startcolor === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}"></span>
									</div>
								`
							}

							return html`
								<metadata-model-view-query-panel-field-group
									.scrollelement=${this._scrollelement}
									.color=${this.startcolor}
									.fieldgroup=${this.metadatamodel}
									.queryconditionindex=${this._currentTabIndex}
									.updatemetadatamodel=${this._updatemetadatamodel}
									.handleselectfieldgroup=${(fieldGroupKey: string, queryconditionindex: number) => {
										this._selectedFieldGroupKey = fieldGroupKey
										this._selectedFieldGroupQueryConditionIndex = queryconditionindex
									}}
									.handlegetfieldgroupqueryconditions=${(fieldGroupKey: string, queryconditionindex: number) => {}}
									.handledeletefieldgroupqueryconditions=${(fieldGroupKey: string, queryconditionindex: number) => {}}
								></metadata-model-view-query-panel-field-group>
							`
						})()}
					</section>
				</main>
			</main>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-view-query-panel': Component
	}
}
