<script lang="ts">
	import { Shared } from '$lib/constants'
	import { GetNextColor } from '$lib/utils'
	import { fade, type TransitionConfig } from 'svelte/transition'
	import { inview } from 'svelte-inview'
	import type { Options } from 'svelte-inview'

	export let DataTemplate: any
	export let Color: Shared.Colors = Shared.Colors.PRIMARY
	export let IncludeRowNumber: boolean = false
	export let HandleClickTableRow: ((index: number) => void) | undefined = undefined
	export let RowIndex: number
	export let TableHeaders: string[]
	export let TableRowData: any
	export let RootViewElement: HTMLElement
	export let DisableConditionalRendering: boolean = false

	const inViewOptions: Options = {
		root: RootViewElement,
		rootMargin: '400px'
	}

	const transitionConfig: TransitionConfig = {
		delay: 300,
		duration: 350
	}

	let rowTrViewTracker: boolean
	let skipHiddingRow = 0
</script>

<tr
	class="p-2"
	use:inview={inViewOptions}
	on:inview_change={(e) => {
		if (!e.detail.inView) {
			if (skipHiddingRow !== 1) {
				skipHiddingRow += 1
			} else {
				rowTrViewTracker = e.detail.inView
				skipHiddingRow = 0
			}
		} else {
			rowTrViewTracker = e.detail.inView
		}
	}}
>
	{#if IncludeRowNumber}
		{#if typeof HandleClickTableRow !== 'undefined'}
			<td class="sticky left-0 shadow-sm shadow-gray-800 z-[1]" style="background-color: {Color};">
				<button
					class="btn btn-circle glass"
					class:bg-primary={Color === Shared.Colors.ACCENT}
					class:bg-secondary={Color === Shared.Colors.PRIMARY}
					class:bg-accent={Color === Shared.Colors.SECONDARY}
					class:bg-primary-text={Color === Shared.Colors.ACCENT}
					class:bg-secondary-text={Color === Shared.Colors.PRIMARY}
					class:bg-accent-text={Color === Shared.Colors.SECONDARY}
					on:click={() => {
						if (typeof HandleClickTableRow !== 'undefined') HandleClickTableRow(RowIndex)
					}}
				>
					{RowIndex + 1}
				</button>
			</td>
		{:else}
			<td class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
				{RowIndex + 1}
			</td>
		{/if}
	{/if}
	{#if rowTrViewTracker || DisableConditionalRendering}
		{#each TableHeaders as th}
			{#if TableRowData !== null && typeof TableRowData !== "undefined"}
				{#if typeof TableRowData[th] === 'string' || typeof TableRowData[th] === 'number'}
					<td
						class:bg-primary-text={Color === Shared.Colors.PRIMARY}
						class:bg-secondary-text={Color === Shared.Colors.SECONDARY}
						class:bg-accent-text={Color === Shared.Colors.ACCENT}
						class:min-w-[250px]={typeof TableRowData[th] === 'string' && TableRowData[th].length >= 25}
						in:fade={transitionConfig}
					>
						{#if typeof TableRowData[th] === 'string'}
							{#each TableRowData[th].split('\n') as drth}
								<div>{drth}</div>
							{/each}
						{:else}
							{TableRowData[th]}
						{/if}
					</td>
				{:else if typeof TableRowData[th] === 'object'}
					{#if Array.isArray(TableRowData[th])}
						{#if typeof TableRowData[th][0] === 'object'}
							<td in:fade={transitionConfig}>
								{#await import('./NestedTableTable.svelte')}
									<div class="w-full h-full flex justify-center p-2">
										<progress class="progress w-ful max-w-[250px] self-center" class:progress-primary={Color === Shared.Colors.PRIMARY} class:progress-secondary={Color === Shared.Colors.SECONDARY} class:progress-accent={Color === Shared.Colors.ACCENT} />
									</div>
								{:then NestedTableTable}
									<NestedTableTable.default ModelTemplateData={DataTemplate[th][0]} Data={TableRowData[th]} Color={GetNextColor(Color)} IncludeRowNumber={true} {DisableConditionalRendering} {RootViewElement} />
								{:catch}
									<div class="w-full h-full flex justify-center p-2" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
										<span>Network error!</span>
									</div>
								{/await}
							</td>
						{:else}
							<td class:text-black={Color === Shared.Colors.SECONDARY} class:text-white={Color === Shared.Colors.ACCENT} class:min-w-[250px]={typeof TableRowData[th] === 'string' && TableRowData[th].length >= 25} in:fade={transitionConfig}>
								{TableRowData[th].join(',')}
							</td>
						{/if}
					{:else}
						<td in:fade={transitionConfig}>
							{#await import('./NestedTableTable.svelte')}
								<div class="w-full h-full flex justify-center p-2">
									<progress class="progress w-ful max-w-[250px] self-center" class:progress-primary={Color === Shared.Colors.PRIMARY} class:progress-secondary={Color === Shared.Colors.SECONDARY} class:progress-accent={Color === Shared.Colors.ACCENT} />
								</div>
							{:then NestedTableTable}
								<NestedTableTable.default ModelTemplateData={DataTemplate[th]} Data={[TableRowData[th]]} Color={GetNextColor(Color)} {DisableConditionalRendering} {RootViewElement} />
							{:catch}
								<div class="w-full h-full flex justify-center p-2" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
									<span>Network error!</span>
								</div>
							{/await}
						</td>
					{/if}
				{:else}
					<td class:table-no-data-primary={Color === Shared.Colors.PRIMARY} class:table-no-data-secondary={Color === Shared.Colors.SECONDARY} class:table-no-data-accent={Color === Shared.Colors.ACCENT} in:fade={transitionConfig}> no data </td>
				{/if}
			{:else}
				<td class:table-no-data-primary={Color === Shared.Colors.PRIMARY} class:table-no-data-secondary={Color === Shared.Colors.SECONDARY} class:table-no-data-accent={Color === Shared.Colors.ACCENT} in:fade={transitionConfig}> no data </td>
			{/if}
		{/each}
	{:else}
		<td class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT} class="min-w-[200px] min-h-[15px]" in:fade={transitionConfig} />
	{/if}
</tr>

<style>
	button:hover {
		--tw-bg-opacity: 1;
		background-color: hsl(var(--p) / var(--tw-bg-opacity));
	}
</style>
