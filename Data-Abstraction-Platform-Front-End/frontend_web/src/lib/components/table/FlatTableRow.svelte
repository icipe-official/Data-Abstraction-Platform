<script lang="ts">
	import { Shared } from '$lib/constants'
	import type { FlatTableArrayValue } from '$lib/interface'
	import { ConvertObjectToTwoDimensionArray, Log } from '$lib/utils'
	import { inview, type Options } from 'svelte-inview'
	import { fade, type TransitionConfig } from 'svelte/transition'
	import FlatTableRowData from './FlatTableRowData.svelte'

	const CURRENT_SECTION = 'Flat Table Row'

	export let DataResult: any
	export let HandleClickTableRow: ((index: number) => void) | undefined
	export let RootViewElement: HTMLElement | undefined
	export let ModelTemplate: any
	export let DataResultIndex: number
	export let DataName: string | null = null
	export let ColumnEnd: number
	export let ColumnBegin: number	
	export let IncludeIndividualRowNumber: boolean
	export let IncludeIndividualDataRowCounter: boolean

	let tableRowsValue: FlatTableArrayValue[][] = []
	const setTableRows = (value: FlatTableArrayValue[][]) => (tableRowsValue = value)
	async function initializeFlatTableRow() {
		setTableRows([])
		if (DataResult) {
			setTableRows(ConvertObjectToTwoDimensionArray(ModelTemplate, DataResult))
			Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, tableRowsValue, 'Data conversion to 2D array')
		}
	}

	let rowViewTracker = false

	const inViewOptions: Options = {
		root: RootViewElement,
		rootMargin: '400px'
	}

	const transitionConfig: TransitionConfig = {
		delay: 150,
		duration: 200
	}

	$: if (rowViewTracker && ModelTemplate) {
		initializeFlatTableRow()
	}
</script>

<tbody
	use:inview={inViewOptions}
	on:inview_change={(e) => {
		rowViewTracker = e.detail.inView
		if (!rowViewTracker) {
			tableRowsValue = []
		}
	}}
>
	{#if rowViewTracker}
		{#if HandleClickTableRow && IncludeIndividualDataRowCounter}
			<tr in:fade={transitionConfig} class="max-h-fit">
				<td class="font-bold bg-white shadow-sm shadow-gray-800" colspan={ColumnEnd - ColumnBegin + 3}>{DataName ? DataName : 'Item'} #{DataResultIndex + 1} ({tableRowsValue.length} {tableRowsValue.length === 1 ? 'row' : 'rows'})</td>
			</tr>
		{/if}
		{#each tableRowsValue as trv, trsvIndex}
			<FlatTableRowData TableRowValue={trv} {HandleClickTableRow} {DataResultIndex} DataResultRowIndex={trsvIndex} {ColumnBegin} {ColumnEnd} {RootViewElement} {IncludeIndividualRowNumber} />
		{/each}
	{:else}
		<tr>
			<td class="h-[100px]" colspan={ColumnEnd - ColumnBegin + 3}>
				<div class="text-sm font-bold text-gray-600">Loading...</div>
			</td>
		</tr>
	{/if}
</tbody>
