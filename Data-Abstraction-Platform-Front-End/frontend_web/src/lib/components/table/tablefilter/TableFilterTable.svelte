<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DESC_REGEX_SEARCH, DISABLED_REGEX_SEARCH, MAX_EXTRACT, NAME_REGEX_SEARCH, OPTS_SPLIT, OPT_SPLIT, RENDER_HORIZONTALLY_EXTRACT, Shared } from '$lib/constants'
	import { CheckIfGroupIsEligibleForHorizontalRendering, GetNextColor } from '$lib/utils'
	import { inview, type Options } from 'svelte-inview'
	import { fade, type TransitionConfig } from 'svelte/transition'
	import TableFilterSetup from './TableFilterSetup.svelte'
	import { ToastType, ToastMessage } from '$lib/stores'

	export let TableStructure: any
	export let Color: Shared.Colors = Shared.Colors.PRIMARY
	export let RootViewElement: HTMLElement | undefined
	export let UpdateTablesAndColumnsStruct: (path: string, struct: string) => void
	export let GetCreatedFilterOptions: (key: string) => string[][]
	export let UpdateCreatedFilterOptions: (key: string, value: string[][]) => void
	export let DeleteFilterOption: (key: string) => void
	export let ClearCreatedFilterOptions: boolean

	let tableName: string = ''
	const setTableName = (value: string) => (tableName = value)
	let tableDescription: string | null = null
	const setTableDescription = (value: string) => (tableDescription = value)
	let tableColumns: any
	const setTableColumns = (value: any) => (tableColumns = value)
	let tableDisabled: boolean
	const setTableDisabled = (value: boolean) => (tableDisabled = value)
	let eligibleForHorizontalRendering = false
	const setEligibleForHorizontalRendering = (value: boolean) => (eligibleForHorizontalRendering = value)
	let expandHorizontalRenderingOptions = false
	let isTableStructSetup = false
	const setIsTableStructSetup = (value: boolean) => (isTableStructSetup = value)
	$: if (!isTableStructSetup) {
		const nameExtract = NAME_REGEX_SEARCH.exec(TableStructure.struct)
		if (nameExtract) setTableName(nameExtract[1])
		else setTableName(TableStructure.struct.split(' ')[0].split('.').at(-1) as string)
		const descExtract = DESC_REGEX_SEARCH.exec(TableStructure.struct)
		if (descExtract) setTableDescription(descExtract[1])
		function getDropdownForColumnOptions(subFieldColumn: any) {
			return Object.keys(subFieldColumn).map((value) => {
				let nameExtract = NAME_REGEX_SEARCH.exec(subFieldColumn[value].struct)
				if (nameExtract) {
					return `${nameExtract[1]}${OPT_SPLIT}${value}`
				} else {
					return `${value}${OPT_SPLIT}${value}`
				}
			})
		}
		if (TableStructure.struct.split(' ')[1] === 'unique') {
			TableStructure.struct = `${TableStructure.struct} opts=${getDropdownForColumnOptions(TableStructure.value).join(OPTS_SPLIT)}&#`
			setTableColumns(TableStructure.value)
		} else if (TableStructure.struct.split(' ')[1] === 'repetitive') {
			TableStructure.struct = `${TableStructure.struct} opts=${getDropdownForColumnOptions(TableStructure.value[0]).join(OPTS_SPLIT)}&#`
			setTableColumns(TableStructure.value[0])
		}
		const tableDisabledExtract = DISABLED_REGEX_SEARCH.exec(TableStructure.struct)
		if (tableDisabledExtract) setTableDisabled(true)
		else setTableDisabled(false)
		if (TableStructure.struct.split(' ')[1] === 'repetitive') {
			setEligibleForHorizontalRendering(CheckIfGroupIsEligibleForHorizontalRendering(TableStructure.value[0]))
		}
		setGroupMaxLength(-1)
		const groupMaxLengthExtract = MAX_EXTRACT.exec(TableStructure.struct)
		if (groupMaxLengthExtract) setGroupMaxLength(parseInt(groupMaxLengthExtract[1]))
		setRenderGroupHorizontally(false)
		if (RENDER_HORIZONTALLY_EXTRACT.test(TableStructure.struct)) {
			setRenderGroupHorizontally(true)
		} else {
			setRenderGroupHorizontally(false)
		}
		setIsTableStructSetup(true)
	}

	let ViewTracker: boolean
	const options: Options = {
		root: RootViewElement,
		rootMargin: '900px'
	}
	const transitionConfig: TransitionConfig = {
		delay: 150,
		duration: 200
	}

	let expandFilterOptions = false

	let FilterOptions: string[][]
	const setFilterOptions = (value: string[][]) => (FilterOptions = value)
	function HandleUpdateFilterOptions(key: string, value: string[][]) {
		UpdateCreatedFilterOptions(key, value)
		FilterOptions = value
	}
	function handleDeleteFilterOptions(key: string) {
		DeleteFilterOption(key)
		FilterOptions = []
	}

	function enableDisableTable() {
		if (tableDisabled) {
			let struct = TableStructure.struct.split(' ') as string[]
			struct = struct.filter((value) => !DISABLED_REGEX_SEARCH.test(value))
			TableStructure.struct = struct.join(' ')
		} else {
			TableStructure.struct = `${TableStructure.struct} disabled=true&#`
		}
		UpdateTablesAndColumnsStruct(TableStructure.struct.split(' ')[0], TableStructure.struct)
		tableDisabled = !tableDisabled
	}

	$: if (ClearCreatedFilterOptions || !ClearCreatedFilterOptions) {
		setFilterOptions(GetCreatedFilterOptions(TableStructure.struct.split(' ')[0]))
	}

	let groupMaxLength = -1
	const setGroupMaxLength = (value: number) => (groupMaxLength = value)
	let renderGroupHorizontally: boolean
	const setRenderGroupHorizontally = (value: boolean) => (renderGroupHorizontally = value)
	function handleUpdateRepetitiveGroupRendering() {
		const newGroupMaxLength = groupMaxLength > 0 ? `max=${groupMaxLength}&#` : ''
		if (MAX_EXTRACT.test(TableStructure.struct)) {
			let struct = TableStructure.struct.split(' ') as string[]
			struct = struct.filter((value) => !MAX_EXTRACT.test(value))
			TableStructure.struct = struct.join(' ')
		}
		TableStructure.struct = `${TableStructure.struct} ${newGroupMaxLength}`
		if (renderGroupHorizontally) {
			if (!RENDER_HORIZONTALLY_EXTRACT.test(TableStructure.struct)) {
				TableStructure.struct = `${TableStructure.struct} renderhorizontally=true&#`
			}
		} else {
			if (RENDER_HORIZONTALLY_EXTRACT.test(TableStructure.struct)) {
				let struct = TableStructure.struct.split(' ') as string[]
				struct = struct.filter((value) => !RENDER_HORIZONTALLY_EXTRACT.test(value))
				TableStructure.struct = struct.join(' ')
			}
		}
		UpdateTablesAndColumnsStruct(TableStructure.struct.split(' ')[0], TableStructure.struct.trim())
		$ToastType = Shared.ToastType.INFO
		$ToastMessage = 'Section rendering setup updated'
	}

	let expandSection = true
</script>

{#if tableColumns}
	<div
		class="min-w-fit w-full h-fit flex flex-col space-y-1 rounded-md p-1 shadow-inner shadow-gray-800"
		style="background-color: {Color};"
		use:inview={options}
		on:inview_change={(e) => {
			ViewTracker = e.detail.inView
		}}
	>
		{#if ViewTracker}
			<div in:fade={transitionConfig} class="w-full" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
				<div class="flex">
					<div class="flex-[7]">
						<div class="text-lg">{tableName}</div>
						{#if tableDescription}
							<div class="tex-md">{tableDescription}</div>
						{/if}
						{#if TableStructure.struct.split(' ')[0] !== 'root'}
							<div class="flex space-x-1">
								<span class="tex-sm flex">
									<span class="self-center">{TableStructure.struct.split(' ')[1]}</span>
								</span>
								<span
									class="tooltip tooltip-primary tooltip-right h-fit self-center"
									class:tooltip-primary={Color === Shared.Colors.ACCENT}
									class:tooltip-secondary={Color === Shared.Colors.PRIMARY}
									class:tooltip-accent={Color === Shared.Colors.SECONDARY}
									data-tip={TableStructure.struct.split(' ')[1] === 'unique' ? 'Section can have 0 to 1 rows of data' : 'Section can have 0 to many rows of data'}
								>
									<Icon type="mdi:help-circle" color={GetNextColor(Color)} />
								</span>
							</div>
						{/if}
					</div>
					{#if TableStructure.struct.split(' ')[0] !== 'root'}
						<div class="flex-[3] flex justify-center">
							<div class="join h-fit self-center">
								<button
									class="join-item btn btn-regular tooltip tooltip-left"
									class:btn-primary={Color === Shared.Colors.ACCENT}
									class:btn-secondary={Color === Shared.Colors.PRIMARY}
									class:btn-accent={Color === Shared.Colors.SECONDARY}
									class:tooltip-primary={Color === Shared.Colors.ACCENT}
									class:tooltip-secondary={Color === Shared.Colors.PRIMARY}
									class:tooltip-accent={Color === Shared.Colors.SECONDARY}
									data-tip="Clear filter options"
									on:click={() => handleDeleteFilterOptions(TableStructure.struct.split(' ')[0])}
								>
									<Icon type="mdi:backspace" color={Color} />
								</button>
								<button
									class="join-item btn btn-regular tooltip tooltip-left"
									class:btn-primary={Color === Shared.Colors.ACCENT}
									class:btn-secondary={Color === Shared.Colors.PRIMARY}
									class:btn-accent={Color === Shared.Colors.SECONDARY}
									class:tooltip-primary={Color === Shared.Colors.ACCENT}
									class:tooltip-secondary={Color === Shared.Colors.PRIMARY}
									class:tooltip-accent={Color === Shared.Colors.SECONDARY}
									data-tip={tableDisabled ? 'Enable section/table' : 'Disable section/table'}
									on:click={enableDisableTable}
								>
									<Icon type={tableDisabled ? 'mdi:eye-off' : 'mdi:eye'} color={Color} />
								</button>
								<div class="indicator">
									{#if FilterOptions.length > 0}
										<span class="indicator-item badge indicator-center" class:badge-primary={GetNextColor(Color) === Shared.Colors.ACCENT} class:badge-secondary={GetNextColor(Color) === Shared.Colors.PRIMARY} class:badge-accent={GetNextColor(Color) === Shared.Colors.SECONDARY}>
											{FilterOptions.length}
										</span>
									{/if}
									<button
										class="join-item btn btn-regular tooltip tooltip-left"
										class:btn-primary={Color === Shared.Colors.ACCENT}
										class:btn-secondary={Color === Shared.Colors.PRIMARY}
										class:btn-accent={Color === Shared.Colors.SECONDARY}
										class:tooltip-primary={Color === Shared.Colors.ACCENT}
										class:tooltip-secondary={Color === Shared.Colors.PRIMARY}
										class:tooltip-accent={Color === Shared.Colors.SECONDARY}
										data-tip={expandFilterOptions ? 'Hide filter options' : 'Show filter options'}
										on:click={() => {
											expandFilterOptions = !expandFilterOptions
										}}
									>
										<Icon type={expandFilterOptions ? 'mdi:filter-off' : 'mdi:filter'} color={Color} />
									</button>
									<button
										class="join-item btn btn-regular tooltip tooltip-left"
										class:btn-primary={Color === Shared.Colors.ACCENT}
										class:btn-secondary={Color === Shared.Colors.PRIMARY}
										class:btn-accent={Color === Shared.Colors.SECONDARY}
										class:tooltip-primary={Color === Shared.Colors.ACCENT}
										class:tooltip-secondary={Color === Shared.Colors.PRIMARY}
										class:tooltip-accent={Color === Shared.Colors.SECONDARY}
										data-tip={expandSection ? 'Hide section' : 'Show section'}
										on:click={() => {
											expandSection = !expandSection
										}}
									>
										<Icon type={expandSection ? 'mdi:arrow-collapse' : 'mdi:arrow-expand'} color={Color} />
									</button>
								</div>
								{#if eligibleForHorizontalRendering}
									<button
										class="join-item btn btn-regular tooltip tooltip-left"
										class:btn-primary={Color === Shared.Colors.ACCENT}
										class:btn-secondary={Color === Shared.Colors.PRIMARY}
										class:btn-accent={Color === Shared.Colors.SECONDARY}
										class:tooltip-primary={Color === Shared.Colors.ACCENT}
										class:tooltip-secondary={Color === Shared.Colors.PRIMARY}
										class:tooltip-accent={Color === Shared.Colors.SECONDARY}
										data-tip={expandHorizontalRenderingOptions ? 'Hide horizontal rendering options' : 'Show horizontal rendering options'}
										on:click={() => (expandHorizontalRenderingOptions = !expandHorizontalRenderingOptions)}
									>
										<Icon type="mdi:format-columns" color={Color} />
									</button>
								{/if}
							</div>
						</div>
					{/if}
				</div>
				<div class="w-full flex flex-col space-y-1">
					{#if expandFilterOptions}
						<div class="w-full rounded-md p-1" style="background-color: {GetNextColor(Color)};">
							<TableFilterSetup TableColumnStruct={TableStructure.struct} Color={GetNextColor(Color)} ColumnName={tableName} {FilterOptions} UpdateCreatedFilterOptions={HandleUpdateFilterOptions} ColumnType={TableStructure.struct.split(' ')[1]} IsColumnDropdownType={false} />
						</div>
					{/if}
					{#if expandHorizontalRenderingOptions}
						<div class="w-full rounded-md p-1" style="background-color: {GetNextColor(Color)};">
							<header class="flex justify-between">
								<span class="font-bold text-sm h-fit self-center">{tableName} horizontal rendering options</span>
							</header>
							<div class="divider" />
							<main class="flex flex-col overflow-x-hidden overflow-y-auto space-y-1 max-h-[65vh]">
								<div class="join join-vertical w-full">
									<span class="join-item join-label-primary">Expected maximum no. of {tableName}</span>
									<input class="join-item input input-primary w-full" placeholder="Enter field name/group..." type="number" bind:value={groupMaxLength} />
								</div>
								<div
									class="flex justify-between tooltip tooltip-top"
									class:tooltip={!eligibleForHorizontalRendering}
									class:tooltip-top={!eligibleForHorizontalRendering}
									class:tooltip-error={!eligibleForHorizontalRendering}
									data-tip={eligibleForHorizontalRendering ? '' : 'Group has nested groups! Cannot render horizontally'}
								>
									<div class="flex justify-between flex-[9]">
										<span class="label-text text-primary text-lg">Render group horizontally?</span>
										{#if !eligibleForHorizontalRendering}
											<div class="flex">
												<Icon type="mdi:exclamation-thick" color={Shared.Colors.ERROR} />
												<Icon type="mdi:exclamation-thick" color={Shared.Colors.ERROR} />
											</div>
										{/if}
									</div>
									<input type="checkbox" class="checkbox checkbox-primary" bind:checked={renderGroupHorizontally} />
								</div>
								<button
									class="btn w-full max-w-[500px] self-center h-fit p-0"
									class:btn-primary={GetNextColor(Color) === Shared.Colors.ACCENT}
									class:btn-secondary={GetNextColor(Color) === Shared.Colors.PRIMARY}
									class:btn-accent={GetNextColor(Color) === Shared.Colors.SECONDARY}
									on:click={(e) => {
										e.preventDefault()
										handleUpdateRepetitiveGroupRendering()
									}}
								>
									save render settings
								</button>
							</main>
						</div>
					{/if}
				</div>
			</div>
			{#if expandSection}
				<div class="divider" />
				<table class="w-full table table-xs rounded-md">
					<thead style="background-color: {Color};" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
						<tr>
							<th class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}> Column/Field Name </th>
							<th class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}> Column/Field Description </th>
							<th class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}> Column/Field Data Type </th>
							<th class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}> Column/Field Actions </th>
						</tr>
					</thead>
					<tbody>
						{#each Object.keys(tableColumns) as key}
							{#if tableColumns[key].struct.split(' ')[1] === 'unique' || tableColumns[key].struct.split(' ')[1] === 'repetitive'}
								<tr>
									<td colspan="4">
										<svelte:self TableStructure={tableColumns[key]} Color={GetNextColor(Color)} {UpdateTablesAndColumnsStruct} {RootViewElement} {UpdateCreatedFilterOptions} {GetCreatedFilterOptions} {DeleteFilterOption} {ClearCreatedFilterOptions} />
									</td>
								</tr>
							{:else}
								{#await import('./TableFilterColumn.svelte')}
									<div class="w-full h-fit self-center flex flex-col">
										<div class="w-fit h-fit self-center">
											<span class="loading loading-ball loading-sm text-accent" />
											<span class="loading loading-ball loading-md text-secondary" />
											<span class="loading loading-ball loading-lg text-primary" />
										</div>
									</div>
								{:then TableFilterColumn}
									<TableFilterColumn.default TableColumn={tableColumns[key]} {Color} {UpdateTablesAndColumnsStruct} {UpdateCreatedFilterOptions} {GetCreatedFilterOptions} {DeleteFilterOption} {ClearCreatedFilterOptions} />
								{/await}								
							{/if}
						{/each}
					</tbody>
					<tfoot class="sticky bottom-0" style="background-color: {Color};">
						<tr>
							<th class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}> Column/Field Name </th>
							<th class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}> Column/Field Description </th>
							<th class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}> Column/Field Data Type </th>
							<th class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}> Column/Field Actions </th>
						</tr>
					</tfoot>
				</table>
			{/if}
		{:else}
			<div class="h-[20px] min-w-[200px] w-full" />
		{/if}
	</div>
{:else}
	<div>Invalid table column/template!!!</div>
{/if}
