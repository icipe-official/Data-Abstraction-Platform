<script lang="ts">
	import { OPT_SPLIT } from '$lib/constants'
	import type { IFormKeyValue, FormField } from '$lib/interface'
	import ListUniqueGroup from './ListUniqueGroup.svelte'
	import type TemplateManager from '../templatemanager'

	export let CurrentTemplate: TemplateManager
	export let NameDescription: string
	export let UpdateValue: (value: IFormKeyValue, repetitiveIndexes: number[]) => void
	export let GetValue: (key: string, repetitiveIndexes: number[]) => FormField
	export let DeleteFieldValue: (key: string, repetitiveIndexes: number[]) => void

	let template = CurrentTemplate.CurrentTemplate()
	function ReloadTemplate() {
		template = CurrentTemplate.CurrentTemplate()
	}

	let ViewAsTable = false
	let tableViewElement: HTMLElement | undefined = undefined
	let listViewElement: HTMLElement | undefined = undefined
	function SetViewAsTable(value: boolean) {
		ViewAsTable = value
	}
</script>

<div class="flex flex-col w-full h-full overflow-hidden">
	{#if ViewAsTable}
		<div class="flex-[0.5] flex">
			<div class="flex-[9.5] h-fit self-center">
				<span class="kbd kbd-xs h-fit">shift</span>
				<span class="h-fit">+ ("scrollwheel") to scroll horizontally</span>
			</div>
		</div>
	{/if}
	<div bind:this={listViewElement} class="flex-[9.5] w-full h-full overflow-auto">
		{#if listViewElement}
			{#if !ViewAsTable}
				<ListUniqueGroup
					{CurrentTemplate}
					Struct={`root.${NameDescription.split(OPT_SPLIT)[1].replaceAll(' ', '_')} unique name=${NameDescription.split(OPT_SPLIT)[0]}&# desc=${NameDescription.split(OPT_SPLIT)[1]}&#`}
					Value={template}
					{UpdateValue}
					{GetValue}
					{DeleteFieldValue}
					{ReloadTemplate}
					{ViewAsTable}
					RepetitiveIndexes={[]}
					{SetViewAsTable}
					RootViewElement={listViewElement}
					ViewTracker={true}
				/>
			{:else if ViewAsTable}
				<ListUniqueGroup
					{CurrentTemplate}
					Struct={`root.${NameDescription.split(OPT_SPLIT)[1].replaceAll(' ', '_')} unique name=${NameDescription.split(OPT_SPLIT)[0]}&# desc=${NameDescription.split(OPT_SPLIT)[1]}&#`}
					Value={template}
					{UpdateValue}
					{GetValue}
					{DeleteFieldValue}
					{ReloadTemplate}
					{ViewAsTable}
					{SetViewAsTable}
					RootViewElement={listViewElement}
					ViewTracker={true}
				/>
			{/if}
		{/if}
	</div>
</div>
