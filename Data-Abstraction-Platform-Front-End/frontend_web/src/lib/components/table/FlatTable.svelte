<script lang="ts">
	import { fade } from 'svelte/transition'
	import FlatTableRow from './FlatTableRow.svelte'

	export let Data: any[]
	export let FilterAllowIndexes: number[] = []
	export let HandleClickTableRow: ((index: number) => void) | undefined
	export let TableColumnHeaders: string[]
	export let ModelTemplate: any
	export let DataName: string | null = null
	export let ColumnBegin: number
	export let ColumnEnd: number
	export let DataRowBegin: number
	export let DataRowEnd: number
	export let IncludeIndividualRowNumber: boolean
	export let IncludeIndividualDataRowCounter: boolean

	let tableHeadersHtml = ''
	const getTableHeadersHtml = () => tableHeadersHtml
	const setTableHeadersHtml = (value: string) => (tableHeadersHtml = value)
	$: if (TableColumnHeaders.length > 0) {
		tableHeadersHtml = ''
		for (let i = ColumnBegin; i <= ColumnEnd; i++) {
			setTableHeadersHtml(getTableHeadersHtml() + `<th>${TableColumnHeaders[i]}</th>`)
		}
	}

	let RootViewElement: HTMLElement
</script>

<div
	class="flex w-full h-full overflow-hidden"
	in:fade={{
		delay: 300,
		duration: 350
	}}
>
	<div class="flex-1 w-full h-full overflow-auto rounded-md" bind:this={RootViewElement}>
		<table class="table table-xs w-full shadow-inner shadow-gray-800 rounded-md">
			<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0 z-10">
				<tr>
					{#if HandleClickTableRow}
						<th class="sticky left-0 bg-secondary z-[11] shadow-sm shadow-gray-800">#</th>
					{/if}
					{#if IncludeIndividualRowNumber}
						<th>#</th>
					{/if}
					{@html tableHeadersHtml}
				</tr>
			</thead>
			{#if RootViewElement}
				{#each Data as dr, index}
					{#if (FilterAllowIndexes.length === 0 || FilterAllowIndexes.includes(index)) && ((index >= DataRowBegin && index <= DataRowEnd) || (FilterAllowIndexes.indexOf(index) >= DataRowBegin && FilterAllowIndexes.indexOf(index) <= DataRowEnd))}
						<FlatTableRow DataResult={dr} {HandleClickTableRow} {RootViewElement} {ModelTemplate} DataResultIndex={index} {DataName} {ColumnEnd} {ColumnBegin} {IncludeIndividualDataRowCounter} {IncludeIndividualRowNumber} />
					{/if}
				{/each}
			{/if}
		</table>
	</div>
</div>
