import { html, LitElement, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import Misc from '$src/lib/miscellaneous'
import '../field-group/component'
import 'iconify-icon'
import MetadataModel from '$src/lib/metadata_model'
import '$src/lib/components/vertical-flex-scroll/component'

@customElement('metadata-model-build-group-fields')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	@property({ type: Object }) scrollelement!: Element
	@property({ type: String }) color!: Theme.Color
	@property({ type: Object }) group!: any
	@property() copiedfieldgroupkey: string = ''
	@property({ type: Boolean }) cutfieldgroup: boolean = false
	@property({ type: Boolean }) showgroupfields: boolean = true
	@property({ attribute: false }) deletefieldgroup?: (fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => void
	@property({ attribute: false }) setcutfieldgroup?: (fieldgroupkey: string, groupKey: string, indexingroupreadorderoffields: number) => void
	@property({ attribute: false }) setcopiedfieldgroupkey?: (fieldgroupkey: string) => void
	@property({ attribute: false }) pastefieldgroup?: (destinationGroupKey: string, objectIndexInGroupReadOrderOfFields: number) => void
	@property({ attribute: false }) createfieldgroup?: (groupKey: string, fieldGroupName: string, isField: boolean, objectIndexInGroupReadOrderOfFields: number) => void
	@property({ attribute: false }) handleselectfieldgroup?: (fieldgroupkey: string, color: Theme.Color) => void
	@property({ attribute: false }) reorderfieldgroup?: (groupKey: string, direction: number, fieldGroupIndexInReadOrderOfFields: number) => void
	@property({ attribute: false }) showhidegroupfields?: () => void

	@state() private _showGroupName: boolean = false
	@state() private _showGroupKey: boolean = false

	protected render(): unknown {
		if (!this.showgroupfields) {
			return nothing
		}

		if (
			!Array.isArray(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]) ||
			!Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS]) ||
			typeof this.group[MetadataModel.FgProperties.GROUP_FIELDS][0] !== 'object' ||
			Array.isArray(this.group[MetadataModel.FgProperties.GROUP_FIELDS][0]) ||
			typeof this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] !== 'string'
		) {
			return html` <div class="font-bold text-error self-center w-full">Group is not valid</div> `
		}

		return html`
			<virtual-flex-scroll
				.scrollelement=${this.scrollelement}
				.data=${this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]}
				.foreachrowrender=${(datum: string, index: number) => {
					if (MetadataModel.IsGroupFieldsValid(this.group[MetadataModel.FgProperties.GROUP_FIELDS][0][datum])) {
						return html`
							<metadata-model-build-field-group
								class="pt-1 pb-1"
								.scrollelement=${this.scrollelement}
								.color=${this.color}
								.fieldgroup=${this.group[MetadataModel.FgProperties.GROUP_FIELDS][0][datum]}
								.copiedfieldgroupkey=${this.copiedfieldgroupkey}
								.cutfieldgroup=${this.cutfieldgroup}
								.indexingroupreadorderoffields=${index}
								.lengthofgroupreadorderoffields=${(this.group[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS] as string[]).length}
								.groupkey=${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]}
								.deletefieldgroup=${this.deletefieldgroup}
								.setcutfieldgroup=${this.setcutfieldgroup}
								.setcopiedfieldgroupkey=${this.setcopiedfieldgroupkey}
								.pastefieldgroup=${this.pastefieldgroup}
								.createfieldgroup=${this.createfieldgroup}
								.handleselectfieldgroup=${this.handleselectfieldgroup}
								.reorderfieldgroup=${this.reorderfieldgroup}
								.showhidegroupfields=${this.showhidegroupfields}
							></metadata-model-build-field-group>
						`
					}

					return html`<div class="font-bold text-error self-center text-lg">Field Group is not valid</div>`
				}}
				.enablescrollintoview=${false}
			></virtual-flex-scroll>
			${(() => {
				if (typeof this.createfieldgroup === 'function') {
					return html` <metadata-model-build-field-group-create class="mb-1 md:max-w-[600px]" .color=${this.color} .groupKey=${this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY]} .createfieldgroup=${this.createfieldgroup}></metadata-model-build-field-group-create> `
				}

				return nothing
			})()}
			${(() => {
				if ((this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 2 || this.copiedfieldgroupkey.length > 0 || this.cutfieldgroup) {
					return html`
						<footer
							class="flex flex-col min-w-fit h-fit"
							@mouseenter=${() => (this._showGroupName = true)}
							@mouseleave=${() => {
								this._showGroupName = false
								this._showGroupKey = false
							}}
						>
							<div class="relative w-full max-w-[50%]">
								${(() => {
									if (this._showGroupName) {
										return html`
											<div
												class="absolute bottom-0 z-10 max-w-fit flex flex-col space-y-1 ${this.color === Theme.Color.PRIMARY
													? 'bg-primary text-primary-content'
													: this.color === Theme.Color.SECONDARY
														? 'bg-secondary text-secondary-content'
														: 'bg-accent text-accent-content'} p-1 rounded-md shadow-md shadow-gray-800 text-center w-full"
											>
												<div class="flex space-x-2">
													<div class="h-fit self-center font-bold text-lg">${this.group[MetadataModel.FgProperties.FIELD_GROUP_NAME] || (this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').pop()}</div>
													<button class="btn btn-ghost w-fit h-fit p-0" @click=${() => (this._showGroupKey = !this._showGroupKey)}>
														<div class="flex flex-col justify-center">
															<div class="flex self-center">
																<iconify-icon icon="mdi:transit-connection-horizontal" style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
																${(() => {
																	if (this._showGroupKey === true) {
																		return html`<iconify-icon icon="mdi:close-circle" style="color: ${Theme.Color.ERROR};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('15')}></iconify-icon>`
																	} else {
																		return html` <iconify-icon icon="mdi:question-mark" style="color: ${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize('20')} height=${Misc.IconifySize('15')}></iconify-icon> `
																	}
																})()}
															</div>
														</div>
													</button>
												</div>
												${(() => {
													if (this._showGroupKey) {
														return html` <div>${MetadataModel.FieldGroupKeyPath(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string)}</div>`
													}

													return nothing
												})()}
											</div>
										`
									}

									return nothing
								})()}
							</div>
							<div class="join w-full md:max-w-[400px] h-fit">
								${(() => {
									if ((this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').length > 2) {
										return html`
											<button class="join-item btn min-h-[24px] h-fit p-1 flex flex-nowrap ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}" @click=${this.showhidegroupfields}>
												<span class="h-fit self-center">
													<iconify-icon icon=${this.showgroupfields ? 'mdi:eye' : 'mdi:eye-off'} style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
												</span>
												<span class="h-fit self-center ${this.color === Theme.Color.PRIMARY ? 'text-primary-content' : this.color === Theme.Color.SECONDARY ? 'text-secondary-content' : 'text-accent-content'} text-nowrap">${this.showgroupfields ? 'hide' : 'show'} content</span>
											</button>
										`
									}

									return nothing
								})()}
								${(() => {
									if ((this.copiedfieldgroupkey.length > 0 || this.cutfieldgroup) && typeof this.pastefieldgroup === 'function') {
										return html`
											<button
												class="join-item btn w-fit min-h-[24px] h-fit p-1 flex ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : 'btn-accent'}"
												@click=${() => this.pastefieldgroup!(this.group[MetadataModel.FgProperties.FIELD_GROUP_KEY], -1)}
											>
												<span class="h-fit self-center"><iconify-icon icon="mdi:content-paste" style="color:${Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon></span>
											</button>
										`
									}

									return nothing
								})()}
							</div>
						</footer>
					`
				}

				return nothing
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'metadata-model-build-group-fields': Component
	}
}
