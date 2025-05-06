<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DESC_REGEX_SEARCH, DISABLED_REGEX_SEARCH, MAX_EXTRACT, NAME_REGEX_SEARCH, RENDER_HORIZONTALLY_EXTRACT, Shared } from '$lib/constants'
	import { ToastType, ToastMessage } from '$lib/stores'
	import { GetNextColor } from '$lib/utils'
	import TableFilterSetup from './TableFilterSetup.svelte'

	export let TableColumn: any
	export let Color: Shared.Colors
	export let UpdateTablesAndColumnsStruct: (path: string, struct: string) => void
	export let GetCreatedFilterOptions: (key: string) => string[][]
	export let UpdateCreatedFilterOptions: (key: string, value: string[][]) => void
	export let DeleteFilterOption: (key: string) => void
	export let ClearCreatedFilterOptions: boolean

	let ColumnName: string = ''
	const setColumnName = (value: string) => (ColumnName = value)
	let columnDescription: string | null = null
	const setColumnDescription = (value: string) => (columnDescription = value)
	let ColumnType: string
	const setColumnType = (value: string) => (ColumnType = value)
	let IsColumnDropdownType = false
	const setIsColumnDropdownType = (value: boolean) => (IsColumnDropdownType = value)
	let columnDisabled: boolean
	const setColumnDisabled = (value: boolean) => (columnDisabled = value)
	let eligibleForHorizontalRendering = false
	const setEligibleForHorizontalRendering = (value: boolean) => (eligibleForHorizontalRendering = value)
	let expandHorizontalRenderingOptions = false
	$: if (TableColumn) {
		const nameExtract = NAME_REGEX_SEARCH.exec(TableColumn.struct)
		if (nameExtract) setColumnName(nameExtract[1])
		else setColumnName(TableColumn.struct.split(' ')[0].split('.').at(-1) as string)
		const descExtract = DESC_REGEX_SEARCH.exec(TableColumn.struct)
		if (descExtract) setColumnDescription(descExtract[1])
		setColumnType(`${TableColumn.struct.split(' ')[2] === 'multiselect' ? 'Array/List of ' : ''}${TableColumn.struct.split(' ')[1]}`)
		if (TableColumn.struct.split(' ')[2] === 'multiselect' || TableColumn.struct.split(' ')[2] === 'select') setIsColumnDropdownType(true)
		const tableDisabledExtract = DISABLED_REGEX_SEARCH.exec(TableColumn.struct)
		if (tableDisabledExtract) setColumnDisabled(true)
		else setColumnDisabled(false)
		if (TableColumn.struct.split(' ')[2] === 'multiselect') {
			setEligibleForHorizontalRendering(true)
		}
		setGroupMaxLength(-1)
		const groupMaxLengthExtract = MAX_EXTRACT.exec(TableColumn.struct)
		if (groupMaxLengthExtract) setGroupMaxLength(parseInt(groupMaxLengthExtract[1]))
		setRenderGroupHorizontally(false)
		if (RENDER_HORIZONTALLY_EXTRACT.test(TableColumn.struct)) {
			setRenderGroupHorizontally(true)
		} else {
			setRenderGroupHorizontally(false)
		}
	}

	let expandFilterOptions = false

	function enableDisableColumn() {
		if (columnDisabled) {
			let struct = TableColumn.struct.split(' ') as string[]
			struct = struct.filter((value) => value !== 'disabled=true&#')
			TableColumn.struct = struct.join(' ')
			UpdateTablesAndColumnsStruct(TableColumn.struct.split(' ')[0], TableColumn.struct)
		} else {
			TableColumn.struct = `${TableColumn.struct} disabled=true&#`
			UpdateTablesAndColumnsStruct(TableColumn.struct.split(' ')[0], TableColumn.struct)
		}
		columnDisabled = !columnDisabled
	}

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

	$: if (ClearCreatedFilterOptions || !ClearCreatedFilterOptions) {
		setFilterOptions(GetCreatedFilterOptions(TableColumn.struct.split(' ')[0]))
	}

	let groupMaxLength = -1
	const setGroupMaxLength = (value: number) => (groupMaxLength = value)
	let renderGroupHorizontally: boolean
	const setRenderGroupHorizontally = (value: boolean) => (renderGroupHorizontally = value)
	function handleUpdateRepetitiveGroupRendering() {
		const newGroupMaxLength = groupMaxLength > 0 ? `max=${groupMaxLength}&#` : ''
		if (MAX_EXTRACT.test(TableColumn.struct)) {
			let struct = TableColumn.struct.split(' ') as string[]
			struct = struct.filter((value) => !MAX_EXTRACT.test(value))
			TableColumn.struct = struct.join(' ')
		}
		TableColumn.struct = `${TableColumn.struct} ${newGroupMaxLength}`
		if (renderGroupHorizontally) {
			if (!RENDER_HORIZONTALLY_EXTRACT.test(TableColumn.struct)) {
				TableColumn.struct = `${TableColumn.struct} renderhorizontally=true&#`
			}
		} else {
			if (RENDER_HORIZONTALLY_EXTRACT.test(TableColumn.struct)) {
				let struct = TableColumn.struct.split(' ') as string[]
				struct = struct.filter((value) => !RENDER_HORIZONTALLY_EXTRACT.test(value))
				TableColumn.struct = struct.join(' ')
			}
		}
		UpdateTablesAndColumnsStruct(TableColumn.struct.split(' ')[0], TableColumn.struct.trim())
		$ToastType = Shared.ToastType.INFO
		$ToastMessage = 'Column rendering setup updated'
	}
</script>

<tr>
	<td>{ColumnName}</td>
	{#if columnDescription}
		<td class="break-words">{columnDescription}</td>
	{:else}
		<td class:table-no-data-primary={Color === Shared.Colors.PRIMARY} class:table-no-data-secondary={Color === Shared.Colors.SECONDARY} class:table-no-data-accent={Color === Shared.Colors.ACCENT}> no description </td>
	{/if}
	<td>
		<div class="flex">
			<span class="h-fit self-center">{ColumnType}{IsColumnDropdownType ? ' (dropdown)' : ''}</span>
			{#if IsColumnDropdownType}
				<div class="tooltip tooltip-bottom h-fit self-center" class:tooltip-primary={Color === Shared.Colors.ACCENT} class:tooltip-secondary={Color === Shared.Colors.PRIMARY} class:tooltip-accent={Color === Shared.Colors.SECONDARY} data-tip="Data entered is restricted to a list of options">
					<Icon type="mdi:help-circle" color={GetNextColor(Color)} />
				</div>
			{/if}
		</div>
	</td>
	<td>
		<div class="join">
			<button
				class="join-item btn btn-regular tooltip tooltip-left"
				class:btn-primary={Color === Shared.Colors.ACCENT}
				class:btn-secondary={Color === Shared.Colors.PRIMARY}
				class:btn-accent={Color === Shared.Colors.SECONDARY}
				class:tooltip-primary={Color === Shared.Colors.ACCENT}
				class:tooltip-secondary={Color === Shared.Colors.PRIMARY}
				class:tooltip-accent={Color === Shared.Colors.SECONDARY}
				data-tip="Clear filter options"
				on:click={() => handleDeleteFilterOptions(TableColumn.struct.split(' ')[0])}
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
				data-tip={columnDisabled ? 'Enable field/column' : 'Disable field/column'}
				on:click={enableDisableColumn}
			>
				<Icon type={columnDisabled ? 'mdi:eye-off' : 'mdi:eye'} color={Color} />
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
	</td>
</tr>
{#if expandHorizontalRenderingOptions}
	<tr>
		<td colspan="4" class="w-full rounded-md p-1" style="background-color: {GetNextColor(Color)};">
			<header class="flex justify-between">
				<span class="font-bold text-sm h-fit self-center">{ColumnName} horizontal rendering options</span>
			</header>
			<div class="divider" />
			<main class="flex flex-col overflow-x-hidden overflow-y-auto space-y-1 max-h-[65vh]">
				<div class="join join-vertical w-full">
					<span class="join-item join-label-primary">Expected maximum no. of {ColumnName}</span>
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
		</td>
	</tr>
{/if}
{#if expandFilterOptions}
	<tr>
		<td colspan="4" class="w-full rounded-md p-1" style="background-color: {GetNextColor(Color)};">
			<TableFilterSetup TableColumnStruct={TableColumn.struct} Color={GetNextColor(Color)} {ColumnName} {FilterOptions} UpdateCreatedFilterOptions={HandleUpdateFilterOptions} {ColumnType} {IsColumnDropdownType} />
		</td>
	</tr>
{/if}
