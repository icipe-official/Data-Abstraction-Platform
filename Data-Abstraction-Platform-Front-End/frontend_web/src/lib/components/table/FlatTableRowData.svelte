<script lang="ts">
	import type { FlatTableArrayValue } from '$lib/interface'
	import { inview, type Options } from 'svelte-inview'

	export let TableRowValue: FlatTableArrayValue[]
	export let HandleClickTableRow: ((index: number) => void) | undefined
	export let DataResultIndex: number
	export let DataResultRowIndex: number
	export let ColumnBegin: number
	export let ColumnEnd: number
	export let RootViewElement: HTMLElement | undefined
	export let IncludeIndividualRowNumber: boolean

	let tableRowHtml = ''
	const getTableRowHtml = () => tableRowHtml
	const setTableRowHtml = (value: string) => (tableRowHtml = value)
	$: {
		tableRowHtml = ''
		let newRow = ''
		if (HandleClickTableRow) {
			newRow += `<td class="sticky left-0 bg-white shadow-md shadow-gray-800">${DataResultIndex + 1}</td>`
		}
		if (IncludeIndividualRowNumber) {
			newRow += `<td>${DataResultRowIndex + 1}</td>`
		}
		for (let i = ColumnBegin; i <= ColumnEnd; i++) {
			let td = `<td>`
			if (typeof TableRowValue[i] === 'string' && (TableRowValue[i] as string).length > 25) {
				td = `<td class="min-w-[250px]">`
			}
			if (typeof TableRowValue[i] === 'string') {
				;(TableRowValue[i] as string).split('\n').forEach((trvd) => {
					td += `<div>${trvd}</div>`
				})
			} else if (TableRowValue[i] === null || typeof TableRowValue[i] === "undefined") {
				td += `<div class="text-error">no data</div>`
			} else {
				td += `${TableRowValue[i]}`
			}
			td += `</td>`
			newRow += td
		}
		setTableRowHtml(getTableRowHtml() + newRow)
	}

	let rowViewTracker = false

	const inViewOptions: Options = {
		root: RootViewElement,
		rootMargin: '400px'
	}
</script>

<tr
	use:inview={inViewOptions}
	class="p-2 max-h-fit"
	class:hover={HandleClickTableRow && rowViewTracker}
	class:cursor-pointer={HandleClickTableRow && rowViewTracker}
	on:inview_change={(e) => {
		rowViewTracker = e.detail.inView
	}}
	on:click={() => {
		if (HandleClickTableRow) {
			HandleClickTableRow(DataResultIndex)
		}
	}}
>
	{#if rowViewTracker}
		{@html tableRowHtml}
	{/if}
</tr>
