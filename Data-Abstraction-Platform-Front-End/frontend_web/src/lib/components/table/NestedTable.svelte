<script lang="ts">
	import { Shared } from '$lib/constants'
	import { Log } from '$lib/utils'
	import { fade } from 'svelte/transition'
	import NestedTableRow from './NestedTableRow.svelte'

	const CURRENT_SECTION = 'Nested Table'

	export let ModelTemplateData: any
	export let Data: any[]
	export let FilterAllowIndexes: number[] = []
	export let Color: Shared.Colors = Shared.Colors.PRIMARY
	export let IncludeRowNumber: boolean = false
	export let HandleClickTableRow: ((index: number) => void) | undefined = undefined
	export let DataRowBegin: number = 0
	export let DataRowEnd: number = 0
	export let DisableConditionalRendering: boolean = false

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

	let RootViewElement: HTMLElement
</script>

<div
	class="flex h-full w-full overflow-hidden"
	in:fade={{
		delay: 300,
		duration: 350
	}}
>
	<div class="flex-1 overflow-auto p-1 rounded-md bg-primary" bind:this={RootViewElement}>
		<div class="w-full h-fit">
			<table class="w-full table table-xs rounded-md bg-primary">
				<thead class="bg-primary">
					<tr>
						{#if IncludeRowNumber}
							<th class="bg-primary bg-primary-text sticky left-0 shadow-sm shadow-gray-800"> # </th>
						{/if}
						{#each TableHeaders as th}
							<th class="bg-primary-text">
								{th.replaceAll('_', ' ')}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#if RootViewElement}
						{#each Data as TableRowData, index}
							{#if (FilterAllowIndexes.length === 0 || FilterAllowIndexes.includes(index)) && ((index >= DataRowBegin && index <= DataRowEnd) || FilterAllowIndexes.indexOf(index) >= DataRowBegin && FilterAllowIndexes.indexOf(index) <= DataRowEnd)}
								<NestedTableRow DataTemplate={ModelTemplateData} {Color} {IncludeRowNumber} {HandleClickTableRow} RowIndex={index} {TableHeaders} {TableRowData} {RootViewElement} {DisableConditionalRendering} />
							{/if}
						{/each}
					{/if}
				</tbody>
				<tfoot class="sticky bottom-0" style="background-color: {Color};">
					<tr>
						{#if IncludeRowNumber}
							<th style="background-color: {Color};" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}> # </th>
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
	</div>
</div>
