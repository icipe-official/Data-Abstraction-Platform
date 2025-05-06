<script lang="ts">
	import { Shared } from '$lib/constants'
	import { Log } from '$lib/utils'
	import { fade } from 'svelte/transition'
	import NestedTableRow from './NestedTableRow.svelte'

	export let ModelTemplateData: any
	export let Data: any[]
	export let RootViewElement: HTMLElement
	export let DisableConditionalRendering: boolean
	export let IncludeRowNumber: boolean = false
	export let Color: Shared.Colors = Shared.Colors.PRIMARY

	const CURRENT_SECTION = 'Nested Table Table'

	let TableHeaders: string[] = []
	const setTableHeaders = (value: string[]) => (TableHeaders = value)
	const getTableHeaders = () => TableHeaders
	const dataResults = () => Data
	$: if (ModelTemplateData) {
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, ModelTemplateData, 'Data template')
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, dataResults(), 'Data results')
		Object.keys(ModelTemplateData).forEach((dt) => {
			setTableHeaders([...getTableHeaders(), dt])
		})
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, getTableHeaders(), 'Table Headers')
	}
</script>

<div class="w-full h-fit rounded-md p-1" style="background-color: {Color};">
	<table
		class="table table-xs"
		style="background-color: {Color};"
		in:fade={{
			delay: 300,
			duration: 350
		}}
	>
		<thead style="background-color: {Color};">
			<tr>
				{#if IncludeRowNumber}
					<th style="background-color: {Color};" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}> # </th>
				{/if}
				{#each TableHeaders as th}
					<th class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
						{th.replaceAll('_', ' ')}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#if RootViewElement || !IncludeRowNumber}
				{#each Data as TableRowData, RowIndex}
					<NestedTableRow DataTemplate={ModelTemplateData} {Color} {IncludeRowNumber} HandleClickTableRow={undefined} {RowIndex} {TableHeaders} {TableRowData} {RootViewElement} {DisableConditionalRendering} />
				{/each}
			{/if}
		</tbody>
		<tfoot class="sticky bottom-0" style="background-color: {Color};">
			<tr>
				{#if IncludeRowNumber}
					<td style="background-color: {Color};" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}> # </td>
				{/if}
				{#each TableHeaders as th}
					<td style="background-color: {Color};" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
						{th.replaceAll('_', ' ')}
					</td>
				{/each}
			</tr>
		</tfoot>
	</table>
</div>
