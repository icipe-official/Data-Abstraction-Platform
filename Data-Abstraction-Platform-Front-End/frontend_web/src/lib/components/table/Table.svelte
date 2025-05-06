<script lang="ts">
	import { PUBLIC_LOG_LEVEL } from '$env/static/public'
	import { Shared } from '$lib/constants'
	import { AppendColumnsToTemplate, GenAbstractionValueFromTemplate, GetColumnHeadersForTwoDimensionArray, Log } from '$lib/utils'
	import { fade } from 'svelte/transition'
	import Icon from '../Icon.svelte'
	import { BeginFiltering } from './tablefilter/tablefilter'
	import { Loading, ToastType, ToastMessage } from '$lib/stores'
	import Select from 'svelte-select/Select.svelte'

	const CURRENT_SECTION = 'Table'

	export let FilterModelTemplate: string
	export let HandleUpdateFilterModelTemplate: ((value: string) => void) | undefined = undefined
	export let Data: any[]
	export let HandleClickTableRow: ((index: number) => void) | undefined = undefined
	export let DisableConditionalRendering: boolean = false
	export let DataName: string | null = null
	export let CreatedFilterOptions: any | undefined = undefined
	export let HandleUpdateCreatedFilterOptions: ((value: any) => void) | undefined = undefined
	export let HandleBeginDatabaseFiltering: (() => void) | undefined = undefined
	export let HandleGenerateFileFromData: (() => void) | undefined = undefined
	export let IncludeIndividualRowNumber: boolean = true
	export let IncludeIndividualDataRowCounter: boolean = true

	let ModelTemplateData = {}
	$: if (FilterModelTemplate) {
		ModelTemplateData = GenAbstractionValueFromTemplate(JSON.parse(FilterModelTemplate))
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, ModelTemplateData, 'Updated Template')
	}

	function UpdateModelTemplate(value: string) {
		if (HandleUpdateFilterModelTemplate) {
			HandleUpdateFilterModelTemplate(value)
			if (parseInt(PUBLIC_LOG_LEVEL) >= Shared.LogLevel.DEBUG) {
				Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, AppendColumnsToTemplate({ struct: 'root', value: JSON.parse(value) }), 'Add field columns array to modeltemplate')
			}
		}
	}
	let FilterAllowIndexes: number[] = []
	$: if (FilterAllowIndexes && FilterAllowIndexes.length > 0) {
		SetDataRowBegin(0)
		if (FilterAllowIndexes.length > getNoOfDataRowsToRender()) {
			SetDataRowEnd(getNoOfDataRowsToRender())
		} else {
			SetDataRowEnd(FilterAllowIndexes.length - 1)
		}
	}
	function GetCreatedFilterOptions(key: string) {
		return CreatedFilterOptions[key] ? CreatedFilterOptions[key] : []
	}
	function DeleteFilterOption(key: string) {
		if (HandleUpdateCreatedFilterOptions) {
			delete CreatedFilterOptions[key]
			HandleUpdateCreatedFilterOptions(JSON.parse(JSON.stringify(CreatedFilterOptions)))
			Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, CreatedFilterOptions, 'Updated Filter options')
		}
	}
	function UpdateCreatedFilterOptions(key: string, value: string[][]) {
		if (HandleUpdateCreatedFilterOptions) {
			if (key === 'RES$T') {
				HandleUpdateCreatedFilterOptions({})
			} else {
				CreatedFilterOptions[key] = value
				HandleUpdateCreatedFilterOptions(JSON.parse(JSON.stringify(CreatedFilterOptions)))
			}
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, CreatedFilterOptions, 'Updated Filter options')
	}
	function BeginLocalFiltering() {
		if (CreatedFilterOptions) {
			FilterAllowIndexes = BeginFiltering(Data, CreatedFilterOptions)
			Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, FilterAllowIndexes, 'Filte indexes to retain')
			ToastTypeFilterDialog = Shared.ToastType.SUCCESS
			ToastMessageFilterDialog = `${FilterAllowIndexes.length} local results found...`
		}
	}
	function BeginDatabaseFiltering() {
		if (HandleBeginDatabaseFiltering) {
			HandleBeginDatabaseFiltering()
		} else {
			ToastTypeFilterDialog = Shared.ToastType.INFO
			ToastMessageFilterDialog = 'Filtering From database not available...'
		}
	}

	function BeginGenerateFileFromData() {
		if (HandleGenerateFileFromData) {
			HandleGenerateFileFromData()
		} else {
			ToastTypeFilterDialog = Shared.ToastType.INFO
			ToastMessageFilterDialog = 'Generating file from data not available...'
		}
	}

	let SwitchTableViewToTwoDimension = true
	const setSwitchTableViewToTwoDimension = (value: boolean) => (SwitchTableViewToTwoDimension = value)

	$: if (Data) {
		setSwitchTableViewToTwoDimension(!SwitchTableViewToTwoDimension)
		setSwitchTableViewToTwoDimension(!SwitchTableViewToTwoDimension)
	}

	let ToastMessageFilterDialog: string | string[] | null = null
	let ToastTypeFilterDialog: string | null = null
	let closeFilterToastTimeout: NodeJS.Timeout
	$: if (ToastMessageFilterDialog && ToastTypeFilterDialog) {
		const timeout = typeof ToastTypeFilterDialog === 'string' ? 3000 : 10000
		closeFilterToastTimeout = setTimeout(closeFilterToast, timeout)
	}
	function closeFilterToast() {
		ToastMessageFilterDialog = null
		ToastTypeFilterDialog = null
	}
	function closeFilterToastViaButton() {
		clearTimeout(closeFilterToastTimeout)
		closeFilterToast()
	}

	let ClearCreatedFilterOptions: boolean

	let filterAbstractionsComponent: any = null

	let TableColumnHeaders: string[] = []
	const getTableColumnHeaders = () => TableColumnHeaders
	const setTableColumnHeaders = (value: string[]) => (TableColumnHeaders = value)
	const tableColumnHeaders = () => TableColumnHeaders
	let ModelTemplate: any
	const setModelTemplate = (value: any) => (ModelTemplate = value)
	const modelTemplate = () => ModelTemplate
	$: if (FilterModelTemplate && SwitchTableViewToTwoDimension) {
		setModelTemplate(AppendColumnsToTemplate({ struct: 'root', value: JSON.parse(FilterModelTemplate) }))
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, modelTemplate(), 'Model Template for flat table')
		setTableColumnHeaders(GetColumnHeadersForTwoDimensionArray(modelTemplate()))
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, tableColumnHeaders(), 'Column Headers 2D array')
		SetColumnEnd(getTableColumnHeaders().length > 25 ? 25 : getTableColumnHeaders().length - 1)
		SetNoOfColumnsToRender(getTableColumnHeaders().length > 25 ? 25 : getTableColumnHeaders().length - 1)
	} else {
		setTableColumnHeaders([])
		setModelTemplate({})
	}
	let ColumnEnd = 50
	const SetColumnEnd = (value: number) => (ColumnEnd = value)
	let NoOfColumnsToRender = 50
	const SetNoOfColumnsToRender = (value: number) => (NoOfColumnsToRender = value)
	function HandleSelectNoOfColumnsToRender(value: string) {
		switch (value) {
			case '25':
				NoOfColumnsToRender = 25
				break
			case '50':
				NoOfColumnsToRender = 50
				break
			case '75':
				NoOfColumnsToRender = 75
				break
			case '100':
				NoOfColumnsToRender = 100
				break
			default:
				NoOfColumnsToRender = 25
		}
		if (ColumnBegin + NoOfColumnsToRender < TableColumnHeaders.length - 1) {
			SetColumnEnd(ColumnBegin + NoOfColumnsToRender)
		} else {
			SetColumnEnd(TableColumnHeaders.length - 1)
			if (ColumnBegin - NoOfColumnsToRender >= 0) {
				SetColumnBegin(ColumnBegin - NoOfColumnsToRender)
			} else {
				SetColumnBegin(0)
			}
		}
	}
	let ColumnBegin = 0
	const SetColumnBegin = (value: number) => (ColumnBegin = value)
	interface SelectItem {
		value: number
		label: string
	}
	function HandleSelectColumnBegin(value: SelectItem) {
		ColumnBegin = value.value
		if (ColumnEnd + NoOfColumnsToRender < TableColumnHeaders.length - 1) {
			SetColumnEnd(ColumnBegin + NoOfColumnsToRender)
		} else {
			SetColumnEnd(TableColumnHeaders.length - 1)
		}
	}
	function updateColumnBeginEnd(value: number) {
		if (value > 0) {
			if (ColumnBegin + NoOfColumnsToRender < TableColumnHeaders.length) {
				SetColumnBegin(ColumnBegin + NoOfColumnsToRender)
			} else {
				SetColumnBegin(TableColumnHeaders.length - NoOfColumnsToRender)
			}
			if (ColumnEnd + NoOfColumnsToRender < TableColumnHeaders.length) {
				SetColumnEnd(ColumnEnd + NoOfColumnsToRender)
			} else {
				SetColumnEnd(TableColumnHeaders.length - 1)
			}
		} else {
			if (ColumnBegin - NoOfColumnsToRender >= 0) {
				SetColumnBegin(ColumnBegin - NoOfColumnsToRender)
			} else {
				SetColumnBegin(0)
			}
			if (ColumnEnd - NoOfColumnsToRender >= NoOfColumnsToRender) {
				SetColumnEnd(ColumnEnd - NoOfColumnsToRender)
			} else {
				SetColumnEnd(NoOfColumnsToRender)
			}
		}
	}

	let showColumnNavigationDropdown = false

	function getTableColumnHeadersSelectOptions() {
		if (TableColumnHeaders.length > 0) {
			return TableColumnHeaders.map((v, i) => {
				return { value: i, label: v } as SelectItem
			})
		} else {
			return []
		}
	}

	let showRowNavigationDropdown = false

	let DataRowEnd = 0
	const SetDataRowEnd = (value: number) => (DataRowEnd = value)
	let NoOfDataRowsToRender = Data.length > 25 ? 25 : Data.length - 1
	const SetNoOfDataRowsToRender = (value: number) => (NoOfDataRowsToRender = value)
	const getNoOfDataRowsToRender = () => NoOfDataRowsToRender
	$: if (Data) {
		if (Data.length > 25) {
			SetDataRowEnd(25)
			SetNoOfDataRowsToRender(25)
		} else {
			SetDataRowEnd(Data.length - 1)
			SetNoOfDataRowsToRender(Data.length - 1)
		}
	}
	function HandleSelectNoOfDataRowsToRender(value: string) {
		switch (value) {
			case '25':
				NoOfDataRowsToRender = 25
				break
			case '50':
				NoOfDataRowsToRender = 50
				break
			case '75':
				NoOfDataRowsToRender = 75
				break
			case '100':
				NoOfDataRowsToRender = 100
				break
			default:
				NoOfDataRowsToRender = 25
		}
		if (FilterAllowIndexes.length > 0) {
			if (DataRowBegin + NoOfDataRowsToRender < FilterAllowIndexes.length - 1) {
				SetDataRowEnd(DataRowBegin + NoOfDataRowsToRender)
			} else {
				SetDataRowEnd(FilterAllowIndexes.length - 1)
				if (DataRowBegin - NoOfDataRowsToRender >= 0) {
					SetDataRowBegin(DataRowBegin - NoOfDataRowsToRender)
				} else {
					SetDataRowBegin(0)
				}
			}
		} else {
			if (DataRowBegin + NoOfDataRowsToRender < Data.length - 1) {
				SetDataRowEnd(DataRowBegin + NoOfDataRowsToRender)
			} else {
				SetDataRowEnd(Data.length - 1)
				if (DataRowBegin - NoOfDataRowsToRender >= 0) {
					SetDataRowBegin(DataRowBegin - NoOfDataRowsToRender)
				} else {
					SetDataRowBegin(0)
				}
			}
		}
	}
	let DataRowBegin = 0
	const SetDataRowBegin = (value: number) => (DataRowBegin = value)
	function updateDataRowBeginEnd(value: number) {
		if (value > 0) {
			if (FilterAllowIndexes.length > 0) {
				if (DataRowBegin + NoOfDataRowsToRender < FilterAllowIndexes.length) {
					SetDataRowBegin(DataRowBegin + NoOfDataRowsToRender)
				} else {
					SetDataRowBegin(FilterAllowIndexes.length - NoOfDataRowsToRender)
				}
				if (DataRowEnd + NoOfDataRowsToRender < FilterAllowIndexes.length) {
					SetDataRowEnd(DataRowEnd + NoOfDataRowsToRender)
				} else {
					SetDataRowEnd(FilterAllowIndexes.length - 1)
				}
			} else {
				if (DataRowBegin + NoOfDataRowsToRender < Data.length) {
					SetDataRowBegin(DataRowBegin + NoOfDataRowsToRender)
				} else {
					SetDataRowBegin(Data.length - NoOfDataRowsToRender)
				}
				if (DataRowEnd + NoOfDataRowsToRender < Data.length) {
					SetDataRowEnd(DataRowEnd + NoOfDataRowsToRender)
				} else {
					SetDataRowEnd(Data.length - 1)
				}
			}
		} else {
			if (DataRowBegin - NoOfDataRowsToRender >= 0) {
				SetDataRowBegin(DataRowBegin - NoOfDataRowsToRender)
			} else {
				SetDataRowBegin(0)
			}
			if (DataRowEnd - NoOfDataRowsToRender >= NoOfDataRowsToRender) {
				SetDataRowEnd(DataRowEnd - NoOfDataRowsToRender)
			} else {
				SetDataRowEnd(NoOfDataRowsToRender)
			}
		}
	}
</script>

<div class="w-full h-full flex flex-col space-y-1 overflow-hidden pt-1 pb-1">
	<header class="flex-[0.5] flex flex-col w-fit self-center z-[11]">
		<section class="flex-1 join w-full">
			<button
				class="join-item btn btn-secondary h-full tooltip tooltip-neutral tooltip-bottom"
				data-tip={SwitchTableViewToTwoDimension ? 'Switch to nested table' : 'Switch to flat (2D) table'}
				on:click={(e) => {
					e.preventDefault()
					SwitchTableViewToTwoDimension = !SwitchTableViewToTwoDimension
				}}
			>
				<Icon type={SwitchTableViewToTwoDimension ? 'mdi:table' : 'mdi:file-table-box-multiple'} />
			</button>
			{#if CreatedFilterOptions && HandleUpdateCreatedFilterOptions}
				<button
					class="join-item btn btn-secondary h-full tooltip tooltip-neutral tooltip-bottom"
					data-tip="filter"
					on:click={async (e) => {
						e.preventDefault()
						if (filterAbstractionsComponent === null) {
							$Loading = true
							await import('$lib/components/table/tablefilter/TableFilter.svelte')
								.then((c) => {
									filterAbstractionsComponent = c.default
								})
								.catch(() => {
									$ToastType = Shared.ToastType.ERROR
									$ToastMessage = 'Network error'
								})
								.finally(() => {
									$Loading = false
								})
						}
						if (filterAbstractionsComponent !== null) {
							//@ts-expect-error
							document.getElementById('filter-abstractions-dialog').showModal()
						}
					}}
				>
					<Icon type="mdi:filter" />
				</button>
			{/if}
			{#if HandleGenerateFileFromData}
				<button
					class="join-item btn btn-secondary h-full tooltip tooltip-neutral tooltip-bottom"
					data-tip="Generate file from data"
					on:click={(e) => {
						e.preventDefault()
						BeginGenerateFileFromData()
					}}
				>
					<Icon type="mdi:microsoft-excel" />
				</button>
			{/if}
			{#if SwitchTableViewToTwoDimension}
				<div class="reltative join-item join w-fit flex tooltip tooltip-neutral tooltip-right" data-tip="Column navigation">
					<button
						class="flex-1 join-item btn btn-primary h-full shadow-none"
						disabled={ColumnBegin === 0}
						on:click={(e) => {
							e.preventDefault()
							ColumnBegin = 0
							ColumnEnd = NoOfColumnsToRender
						}}
					>
						<Icon type="mdi:chevron-triple-left" />
					</button>
					<button
						class="flex-1 join-item btn btn-primary h-full shadow-none"
						disabled={ColumnBegin === 0}
						on:click={(e) => {
							e.preventDefault()
							updateColumnBeginEnd(-1)
						}}
					>
						<Icon type="mdi:chevron-double-left" />
					</button>
					<button class="flex-2 join-item btn btn-primary h-full" on:click={(e) => {e.preventDefault();showColumnNavigationDropdown = !showColumnNavigationDropdown}} disabled={TableColumnHeaders.length <= 25}>
						<div class="self-center">{ColumnBegin + 1}-{ColumnEnd + 1}/{TableColumnHeaders.length}</div>
					</button>
					<button
						class="flex-1 join-item shadow-none btn btn-primary h-full"
						disabled={ColumnEnd === TableColumnHeaders.length - 1}
						on:click={(e) => {
							e.preventDefault()
							updateColumnBeginEnd(1)
						}}
					>
						<Icon type="mdi:chevron-double-right" />
					</button>
					<button
						class="flex-1 join-item shadow-none btn btn-primary h-full"
						disabled={ColumnEnd === TableColumnHeaders.length - 1}
						on:click={(e) => {
							e.preventDefault()
							ColumnEnd = TableColumnHeaders.length - 1
							ColumnBegin = TableColumnHeaders.length - NoOfColumnsToRender
						}}
					>
						<Icon type="mdi:chevron-triple-right" />
					</button>
				</div>
			{/if}
		</section>
		<section class="flex-1 relative w-full">
			{#if showColumnNavigationDropdown}
				<section class="mt-1 flex-1 absolute top-0 p-2 shadow-md shadow-gray-800 bg-white rounded-md w-full flex flex-col space-y-1">
					<div class="join join-vertical">
						<span class="join-item join-label-content join-label-primary">No of Columns to show</span>
						<select class="join-item select select-primary" on:change={(e) => {e.preventDefault();HandleSelectNoOfColumnsToRender(e.currentTarget.value)}}>
							<option selected={NoOfColumnsToRender === 25} value="25">25</option>
							<option selected={NoOfColumnsToRender === 50} value="50">50</option>
							<option selected={NoOfColumnsToRender === 75} value="75">75</option>
							<option selected={NoOfColumnsToRender === 100} value="100">100</option>
						</select>
					</div>
					{#if TableColumnHeaders.length > 0}
						<div class="join join-vertical">
							<span class="join-item join-label-content join-label-primary">Current start column</span>
							<div class="join-item bg-accent w-full min-h-[48px] h-full rounded-b-md">
								<Select
									items={getTableColumnHeadersSelectOptions()}
									value={{ value: ColumnBegin, label: TableColumnHeaders[ColumnBegin] }}
									placeholder="Choose column to begin with..."
									on:change={(e) => {e.preventDefault();HandleSelectColumnBegin(e.detail)}}
									--background="transparent"
									--border="1px {Shared.Colors.PRIMARY} solid"
									--border-radius={'0px 0px 0px 0px'}
									--border-hover="1px {Shared.Colors.PRIMARY} solid"
									--list-background={Shared.Colors.ACCENT}
									--height="48px"
									--item-padding="8px"
									--multi-item-bg={Shared.Colors.PRIMARY}
									--multi-item-color={Shared.Colors.SECONDARY}
									--multi-item-clear-icon-color={Shared.Colors.SECONDARY}
									--multi-item-outline={Shared.Colors.PRIMARY}
								/>
							</div>
						</div>
					{/if}
				</section>
			{/if}
		</section>
	</header>
	<main class="flex-[9] overflow-hidden">
		{#if !SwitchTableViewToTwoDimension}
			{#await import('./NestedTable.svelte')}
				<div class="w-full h-full flex justify-center bg-gray-400">
					<div class="w-fit h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
						<div class="text-lg text-white">Loading...</div>
					</div>
				</div>
			{:then NestedTable}
				<NestedTable.default {ModelTemplateData} {Data} Color={Shared.Colors.PRIMARY} {FilterAllowIndexes} IncludeRowNumber={true} {HandleClickTableRow} {DisableConditionalRendering} {DataRowBegin} DataRowEnd={DataRowEnd + 1} />
			{:catch}
				<div class="w-full h-full flex justify-center bg-gray-400">
					<div class="w-fit h-fit self-center flex flex-col">
						<div class="text-lg text-white">Network error...</div>
					</div>
				</div>
			{/await}
		{:else if ModelTemplate}
			{#await import('./FlatTable.svelte')}
				<div class="w-full h-full flex justify-center bg-gray-400">
					<div class="w-fit h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
						<div class="text-lg text-white">Loading...</div>
					</div>
				</div>
			{:then FlatTable}
				<FlatTable.default {Data} {FilterAllowIndexes} {HandleClickTableRow} {DataName} {ColumnBegin} {ModelTemplate} {ColumnEnd} {TableColumnHeaders} {IncludeIndividualDataRowCounter} {IncludeIndividualRowNumber} {DataRowBegin} DataRowEnd={DataRowEnd + 1} />
			{:catch}
				<div class="w-full h-full flex justify-center bg-gray-400">
					<div class="w-fit h-fit self-center flex flex-col">
						<div class="text-lg text-white">Network error...</div>
					</div>
				</div>
			{/await}
		{/if}
	</main>
	<footer class="flex-[0.5] flex flex-col w-fit self-center z-[100]">
		<section class="flex-1 relative w-full">
			{#if showRowNavigationDropdown}
				<section class="mt-1 flex-1 absolute bottom-0 p-2 shadow-md shadow-gray-800 bg-white rounded-md w-full flex flex-col space-y-1">
					<div class="join join-vertical">
						<span class="join-item join-label-content join-label-primary">No of Rows to show</span>
						<select class="join-item select select-primary" on:change={(e) => {e.preventDefault();HandleSelectNoOfDataRowsToRender(e.currentTarget.value)}}>
							<option selected={NoOfDataRowsToRender === 25} value="25">25</option>
							<option selected={NoOfDataRowsToRender === 50} value="50">50</option>
							<option selected={NoOfDataRowsToRender === 75} value="75">75</option>
							<option selected={NoOfDataRowsToRender === 100} value="100">100</option>
						</select>
					</div>
				</section>
			{/if}
		</section>
		<section class="reltative join-item join w-fit flex tooltip tooltip-neutral tooltip-right" data-tip="Row navigation">
			<button
				class="flex-1 join-item btn btn-primary h-full shadow-none"
				disabled={DataRowBegin === 0}
				on:click={(e) => {
					e.preventDefault()
					DataRowBegin = 0
					DataRowEnd = NoOfDataRowsToRender
				}}
			>
				<Icon type="mdi:chevron-triple-left" />
			</button>
			<button
				class="flex-1 join-item btn btn-primary h-full shadow-none"
				disabled={DataRowBegin === 0}
				on:click={(e) => {
					e.preventDefault()
					updateDataRowBeginEnd(-1)
				}}
			>
				<Icon type="mdi:chevron-double-left" />
			</button>
			<button class="flex-2 join-item btn btn-primary h-full" on:click={() => (showRowNavigationDropdown = !showRowNavigationDropdown)} disabled={Data.length <= 25 || (FilterAllowIndexes.length > 0 && FilterAllowIndexes.length <= 25)}>
				<div class="self-center">{DataRowBegin + 1}-{DataRowEnd}/{FilterAllowIndexes.length > 0 ? FilterAllowIndexes.length : Data.length}</div>
			</button>
			<button
				class="flex-1 join-item shadow-none btn btn-primary h-full"
				disabled={DataRowEnd === Data.length - 1 || (FilterAllowIndexes.length > 0 && DataRowEnd === FilterAllowIndexes.length - 1)}
				on:click={(e) => {
					e.preventDefault()
					updateDataRowBeginEnd(1)
				}}
			>
				<Icon type="mdi:chevron-double-right" />
			</button>
			<button
				class="flex-1 join-item shadow-none btn btn-primary h-full"
				disabled={DataRowEnd === Data.length - 1 || (FilterAllowIndexes.length > 0 && DataRowEnd === FilterAllowIndexes.length - 1)}
				on:click={(e) => {
					e.preventDefault()
					if (FilterAllowIndexes.length > 0) {
						DataRowEnd = FilterAllowIndexes.length - 1
						DataRowBegin = FilterAllowIndexes.length - NoOfDataRowsToRender
					} else {
						DataRowEnd = Data.length - 1
						DataRowBegin = Data.length - NoOfDataRowsToRender
					}
				}}
			>
				<Icon type="mdi:chevron-triple-right" />
			</button>
		</section>
	</footer>
</div>

<!--Filter abstractions dialog-->
<dialog id="filter-abstractions-dialog" class="modal">
	<form method="dialog" class="modal-box p-0 rounded w-full max-w-[95vw] h-full max-h-[95vh] flex flex-col justify-center">
		<header class="sticky flex justify-between bg-accent items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
			<span class="text-lg text-primary max-md:hidden">{DataName ? DataName : 'Data'} Filtering</span>
			<div class="join z-[100]">
				<button
					class="join-item btn btn-regular btn-secondary tooltip tooltip-primary tooltip-left"
					data-tip="Clear set filter options"
					on:click={(e) => {
						e.preventDefault()
						UpdateCreatedFilterOptions('RES$T', [])
						ClearCreatedFilterOptions = !ClearCreatedFilterOptions
						FilterAllowIndexes = []
						ToastTypeFilterDialog = Shared.ToastType.INFO
						ToastMessageFilterDialog = 'Filter options cleared...'
					}}
				>
					<span>clear</span>
					<Icon type="mdi:delete-empty" />
				</button>
				<button
					class="join-item btn btn-regular btn-secondary tooltip tooltip-primary tooltip-right"
					data-tip="Filter from local data"
					on:click={(e) => {
						e.preventDefault()
						BeginLocalFiltering()
					}}
				>
					<span>Filter</span>
					<Icon type="mdi:tablet-cellphone" />
				</button>
				{#if HandleBeginDatabaseFiltering}
					<button
						class="join-item btn btn-regular btn-secondary tooltip tooltip-primary tooltip-right"
						data-tip="Filter from database"
						on:click={(e) => {
							e.preventDefault()
							BeginDatabaseFiltering()
						}}
					>
						<span>Filter</span>
						<Icon type="mdi:web" />
					</button>
				{/if}
			</div>
			<button class="btn btn-circle btn-ghost flex justify-center">
				<Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} />
			</button>
		</header>
		<form
			class="flex-[9.5] overflow-hidden p-2 space-y-1 w-full flex flex-col"
			on:submit={(e) => {
				e.preventDefault()
			}}
		>
			{#if filterAbstractionsComponent}
				<svelte:component this={filterAbstractionsComponent} {FilterModelTemplate} {UpdateModelTemplate} {GetCreatedFilterOptions} {UpdateCreatedFilterOptions} {DeleteFilterOption} {ClearCreatedFilterOptions} {DataName} />
			{:else}
				<div class="w-full h-full bg-gray-300 flex justify-center">
					<span class="self-center">Cannot render filter component...</span>
				</div>
			{/if}
		</form>
	</form>
	<div class="toast max-sm:toast-center max-sm:w-full fixed">
		{#if ToastMessageFilterDialog && ToastTypeFilterDialog}
			<div in:fade out:fade class="alert shadow-sm shadow-slate-600 {ToastTypeFilterDialog} flex">
				{#if typeof ToastMessageFilterDialog === 'string'}
					<div class="break-words flex-[9.5]">{ToastMessageFilterDialog}</div>
				{:else}
					<div class="flex flex-row w-full justify-between h-fit self-center">
						<div class="flex flex-col">
							{#each ToastMessageFilterDialog as tm, index}
								<div class="break-words flex-[0.5]">{index + 1}-{tm}</div>
							{/each}
						</div>
					</div>
				{/if}
				<button class="btn btn-circle btn-ghost p-0 w-fit h-fit" on:click={(e) => {e.preventDefault();closeFilterToastViaButton()}}><Icon type="mdi:close" color="bg-slate-200" /> </button>
			</div>
		{/if}
	</div>
</dialog>
