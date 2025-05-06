import { html, LitElement, nothing, TemplateResult, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import indexCss from '@assets/index.css?inline'
import componentCss from './component.css?inline'
import { Task } from '@lit/task'
import { IFieldAnyMetadataModelGet } from '@dominterfaces/field_any_metadata_model/field_any_metadata_model'
import { FieldAnyMetadataModel } from '@interfaces/field_any_metadata_model/field_any_metadata_model'
import Theme from '@lib/theme'
import Entities from '@domentities'
import Lib from '@lib/lib'
import MetadataModel from '@lib/metadata_model'

@customElement('view-directory-group-data')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	private readonly NO_OF_CONTENT_PER_PAGE: number = 20

	@property({ type: Object }) metadatamodel: any | undefined = {}
	@property({ type: Array }) data: any[] | undefined = []
	@property({ type: Boolean }) detailedview: boolean = false
	@property({ type: Boolean }) listview: boolean = false
	@property({ type: String }) color: Theme.Color = Theme.Color.PRIMARY
	@property({ type: Number }) offset: number = 0
	@property({ type: Number }) limit: number = this.NO_OF_CONTENT_PER_PAGE
	@property({ type: Boolean }) requestnewdataiflimithit: boolean = true
	@property({ type: Boolean }) addselectcolumn: boolean = true
	@property({ type: Boolean }) addclickcolumn: boolean = true
	@property({ type: Boolean }) multiselectcolumns: boolean = true
	@property({ type: Array }) selecteddataindexes: number[] = []
	@property({ type: Array }) filterexcludeindexes: number[] = []

	private _fieldAnyMetadataModels: IFieldAnyMetadataModelGet

	constructor() {
		super()

		this._fieldAnyMetadataModels = new FieldAnyMetadataModel()
	}

	private _getDatumDisplayName(dIndex: number, tcuid: Lib.TableCollectionUID) {
		let fieldGroup: any

		MetadataModel.ForEachFieldGroup(this.metadatamodel, (property: any) => {
			const tcuid = Lib.StringToTableCollectionUid(property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID])
			if (tcuid) {
				if (tcuid.join_depth === 0 && tcuid.table_name === Entities.DirectoryGroups.RepositoryName && property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Entities.DirectoryGroups.FieldColumn.DisplayName) {
					fieldGroup = structuredClone(property)
				}
			}
		})

		if (!fieldGroup) {
			return nothing
		}

		const datum = MetadataModel.DatabaseGetColumnFieldValue(this.metadatamodel, Entities.DirectoryGroups.FieldColumn.DisplayName, Lib.TableCollectionUIDToString(tcuid), this.data![dIndex])

		return html`
			<div class="font-bold text-lg">
				${(() => {
					if (Array.isArray(datum) && datum.length > 0) {
						return datum[0]
					}

					return '#unnamed'
				})()}
			</div>
		`
	}

	private _getDatumID(dIndex: number, tcuid: Lib.TableCollectionUID) {
		let fieldGroup: any

		MetadataModel.ForEachFieldGroup(this.metadatamodel, (property: any) => {
			const tcuid = Lib.StringToTableCollectionUid(property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID])
			if (tcuid) {
				if (tcuid.join_depth === 0 && tcuid.table_name === Entities.DirectoryGroups.RepositoryName && property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Entities.DirectoryGroups.FieldColumn.ID) {
					fieldGroup = structuredClone(property)
				}
			}
		})

		if (!fieldGroup) {
			return nothing
		}

		const datum = MetadataModel.DatabaseGetColumnFieldValue(this.metadatamodel, Entities.DirectoryGroups.FieldColumn.ID, Lib.TableCollectionUIDToString(tcuid), this.data![dIndex])

		return html`
			<div class="text-xs text-gray-600">
				${(() => {
					if (Array.isArray(datum) && datum.length > 0) {
						return datum[0]
					}

					return '#no id'
				})()}
			</div>
		`
	}

	private _datumHtmlTemplate(dIndex: number, tcuid: Lib.TableCollectionUID) {
		return html`
			<div class="flex gap-x-1">
				<div class="btn-circle bg-gray-300 flex justify-center self-center">
					<!--mdi:account-group source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
						<path
							fill="black"
							d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
						/>
					</svg>
				</div>
				<div class="flex flex-col gap-y-1 text-left">${this._getDatumDisplayName(dIndex, tcuid)} ${this._getDatumID(dIndex, tcuid)}</div>
			</div>
		`
	}

	@state() private _viewMoreDatumIndex: number | undefined

	private _viewMoreDatumHtmlTemplate(dIndex: number, tcuid: Lib.TableCollectionUID) {
		return html`
			${(() => {
				let fieldGroup: any

				MetadataModel.ForEachFieldGroup(this.metadatamodel, (property: any) => {
					const tcuid = Lib.StringToTableCollectionUid(property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID])
					if (tcuid) {
						if (tcuid.join_depth === 0 && tcuid.table_name === Entities.DirectoryGroups.RepositoryName && property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Entities.DirectoryGroups.FieldColumn.CreatedOn) {
							fieldGroup = structuredClone(property)
						}
					}
				})

				if (!fieldGroup) {
					return nothing
				}

				const datum = MetadataModel.DatabaseGetColumnFieldValue(this.metadatamodel, Entities.DirectoryGroups.FieldColumn.CreatedOn, Lib.TableCollectionUIDToString(tcuid), this.data![dIndex])

				return html`
					<div class="flex gap-x-1 text-lg">
						<div class="font-bold">Created On</div>
						:
						${(() => {
							if (Array.isArray(datum) && datum.length > 0) {
								return `${Lib.LocalDateFromString(datum[0])} at ${Lib.LocalTimeFromString(datum[0])}`
							}

							return '#undated'
						})()}
					</div>
				`
			})()}
			${(() => {
				let fieldGroup: any

				MetadataModel.ForEachFieldGroup(this.metadatamodel, (property: any) => {
					const tcuid = Lib.StringToTableCollectionUid(property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID])
					if (tcuid) {
						if (tcuid.join_depth === 0 && tcuid.table_name === Entities.DirectoryGroups.RepositoryName && property[MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === Entities.DirectoryGroups.FieldColumn.LastUpdatedOn) {
							fieldGroup = structuredClone(property)
						}
					}
				})

				if (!fieldGroup) {
					return nothing
				}

				const datum = MetadataModel.DatabaseGetColumnFieldValue(this.metadatamodel, Entities.DirectoryGroups.FieldColumn.CreatedOn, Lib.TableCollectionUIDToString(tcuid), this.data![dIndex])

				return html`
					<div class="flex gap-x-1 text-lg">
						<div class="font-bold">Last Updated On</div>
						:
						${(() => {
							if (Array.isArray(datum) && datum.length > 0) {
								return `${Lib.LocalDateFromString(datum[0])} at ${Lib.LocalTimeFromString(datum[0])}`
							}

							return '#undated'
						})()}
					</div>
				`
			})()}
		`
	}

	protected render(): unknown {
		if (this.detailedview) {
			return html`<slot></slot>`
		}

		const tcuid = Lib.StringToTableCollectionUid(this.metadatamodel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID])
		if (!tcuid) {
			return html`
				<div class="flex-1 flex flex-col justify-center items-center">
					<span class="w-fit text-error font-bold">${MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID} not valid.</span>
				</div>
			`
		}

		const startIndex = this.offset
		const endIndex = this.limit
		return html`
			${(() => {
				if (this.listview) {
					return html`
						<div class="border-[1px] border-gray-400 h-fit max-h-full max-w-full flex flex-col overflow-auto rounded-md">
							${(() => {
								let template: TemplateResult<1>[] = []

								for (let dIndex = startIndex; dIndex <= endIndex; dIndex++) {
									template.push(html`
										<section class="flex flex-col gap-y-1">
											<div class="w-full h-fit flex justify-between gap-x-1">
												${(() => {
													if (this.addclickcolumn) {
														return html`
															<button
																class="flex-1 btn rounded-none btn-ghost min-h-fit h-fit min-w-fit p-1 justify-start"
																@click=${(_: Event) => {
																	this.dispatchEvent(
																		new CustomEvent('view-directory-group-data:rowclick', {
																			detail: {
																				value: this.data![dIndex],
																				index: dIndex
																			}
																		})
																	)
																}}
															>
																${this._datumHtmlTemplate(dIndex, tcuid)}
															</button>
														`
													}

													return html` <div class="flex-1 flex p-1">${this._datumHtmlTemplate(dIndex, tcuid)}</div> `
												})()}
												<div class="flex gap-x-2 pr-2">
													<button
														class="self-center btn btn-circle min-w-fit w-fit min-h-fit h-fit p-1"
														@click=${() => {
															if (this._viewMoreDatumIndex === dIndex) {
																this._viewMoreDatumIndex = undefined
															} else {
																this._viewMoreDatumIndex = dIndex
															}
														}}
													>
														${(() => {
															if (this._viewMoreDatumIndex === dIndex) {
																return html`
																	<!--mdi:expand-less source: https://icon-sets.iconify.design-->
																	<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="black" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6l-6 6z" /></svg>
																`
															}

															return html`
																<!--mdi:expand-more source: https://icon-sets.iconify.design-->
																<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="black" d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6l-6-6z" /></svg>
															`
														})()}
													</button>
													${(() => {
														if (this.addselectcolumn) {
															return html`
																<input
																	class="self-center checkbox ${(() => {
																		switch (this.color) {
																			case Theme.Color.PRIMARY:
																				return 'checkbox-primary'
																			case Theme.Color.SECONDARY:
																				return 'checkbox-secondary'
																			default:
																				return 'checkbox-accent'
																		}
																	})()}"
																	type="checkbox"
																	@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
																		e.stopPropagation()
																		console.log(e.currentTarget.checked)
																	}}
																/>
															`
														}

														return nothing
													})()}
												</div>
											</div>
											${(() => {
												if (this._viewMoreDatumIndex === dIndex) {
													return html` <div class="flex flex-col gap-y-1 shadow-inner shadow-gray-800 rounded-md p-1 m-1">${this._viewMoreDatumHtmlTemplate(dIndex, tcuid)}</div> `
												}

												return nothing
											})()}
										</section>
										${(() => {
											if (dIndex !== endIndex) {
												return html` <div class="divider"></div> `
											}

											return nothing
										})()}
									`)
								}

								return template
							})()}
						</div>
					`
				}

				return html`<div>simple table view</div>`
			})()}
			${(() => {
				if (this.data && this.data.length > this.NO_OF_CONTENT_PER_PAGE) {
					return html`
						<section class="flex justify-center w-full">
							<div class="self-center join max-w-fit">
								<button class="join-item btn btn-primary min-w-fit w-fit min-h-fit h-fit">
									<!--mdi:chevron-double-left source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.Color.PRIMARY_CONTENT}" d="M18.41 7.41L17 6l-6 6l6 6l1.41-1.41L13.83 12zm-6 0L11 6l-6 6l6 6l1.41-1.41L7.83 12z" /></svg>
								</button>
								<button class="join-item btn btn-primary min-w-fit w-fit min-h-fit h-fit">
									<!--mdi:chevron-left source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.Color.PRIMARY_CONTENT}" d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6z" /></svg>
								</button>
								<div class="flex-1 join-item bg-primary text-primary-content w-full h-full min-h-[26px] flex justify-center">
									<div class="flex-1 self-center w-fit h-fit font-bold text-md">${Math.floor(endIndex / this.NO_OF_CONTENT_PER_PAGE)}</div>
								</div>
								<button class="join-item btn btn-primary min-w-fit w-fit min-h-fit h-fit">
									<!--mdi:chevron-right source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.Color.PRIMARY_CONTENT}" d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z" /></svg>
								</button>
								<button class="join-item btn btn-primary min-w-fit w-fit min-h-fit h-fit">
									<!--mdi:chevron-double-right source: https://icon-sets.iconify.design-->
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="${Theme.Color.PRIMARY_CONTENT}" d="M5.59 7.41L7 6l6 6l-6 6l-1.41-1.41L10.17 12zm6 0L13 6l6 6l-6 6l-1.41-1.41L16.17 12z" /></svg>
								</button>
							</div>
						</section>
					`
				}

				return nothing
			})()}
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'view-directory-group-data': Component
	}
}
