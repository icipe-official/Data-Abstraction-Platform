<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DESC_REGEX_SEARCH, NAME_REGEX_SEARCH, Shared } from '$lib/constants'
	import type { IFormKeyValue, FormField } from '$lib/interface'
	import { fade, type TransitionConfig } from 'svelte/transition'
	import ListUniqueGroup from './ListUniqueGroup.svelte'
	import { inview, type Options } from 'svelte-inview'
	import type TemplateManager from '../templatemanager'
	import { GetNextColor } from '$lib/utils'

	export let CurrentTemplate: TemplateManager
	export let Struct: string
	export let Value: any[]
	export let UpdateValue: (value: IFormKeyValue, repetitiveIndexes: number[]) => void
	export let Color: Shared.Colors = Shared.Colors.PRIMARY
	export let RepetitiveIndexes: number[] = []
	export let GetValue: (key: string, repetitiveIndexes: number[]) => FormField
	export let DeleteFieldValue: (key: string, repetitiveIndexes: number[]) => void
	export let ViewAsTable: boolean
	export let SetViewAsTable: (value: boolean) => void
	export let RootViewElement: HTMLElement | undefined
	export let ReloadTemplate: () => void

	let groupName: string | undefined = undefined
	const setGroupName = (value: string | undefined) => (groupName = value)
	let groupDescription: string | null = null
	const setGroupDescription = (value: string) => (groupDescription = value)
	$: if (Struct && typeof Struct !== 'undefined') {
		const nameExtract = NAME_REGEX_SEARCH.exec(Struct)
		if (nameExtract) setGroupName(nameExtract[1])
		else setGroupName(Struct.split(' ')[0].replaceAll('_', ' ').split('.').at(-1))
		if (DESC_REGEX_SEARCH.test(Struct)) {
			const descExtract = DESC_REGEX_SEARCH.exec(Struct)
			if (descExtract) {
				setGroupDescription(descExtract[1])
			}
		}
	}

	const options: Options = {
		root: RootViewElement,
		rootMargin: '900px'
	}

	const transitionConfig: TransitionConfig = {
		delay: 100,
		duration: 150
	}
	let viewTracker = false

	function DeleteItemInRepetitiveGroup(key: string, repetitiveIndexes: number[], deleteIndex: number) {
		DeleteFieldValue(key, [...repetitiveIndexes, deleteIndex])
		CurrentTemplate.deleteRepetitiveGroupItem(key, [...repetitiveIndexes, deleteIndex])
		ReloadTemplate()
		viewTracker = false
		window.setTimeout(() => {
			viewTracker = true
		}, 300)
	}
</script>

<div
	class="min-w-max flex-1 h-fit space-y-1 rounded-md p-1 shadow-inner shadow-gray-800"
	class:w-full={!ViewAsTable}
	style="background-color: {Color};"
	use:inview={options}
	on:inview_leave={() => {
		viewTracker = false
	}}
>
	<header class="flex space-x-1" in:fade={transitionConfig}>
		<section class="flex-[9.5] flex space-x-1 h-fit self-center">
			<section class="flex flex-col h-fit">
				<h1 class="text-lg" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
					{groupName}
				</h1>
				{#if DESC_REGEX_SEARCH.test(Struct)}
					<div class="text-md" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
						{groupDescription}
					</div>
				{/if}
			</section>
			<button
				class="btn btn-regular h-fit w-fit p-0 tooltip"
				class:btn-primary={Color === Shared.Colors.ACCENT}
				class:btn-secondary={Color === Shared.Colors.PRIMARY}
				class:btn-accent={Color === Shared.Colors.SECONDARY}
				class:tooltip-primary={Color === Shared.Colors.ACCENT}
				class:tooltip-secondary={Color === Shared.Colors.PRIMARY}
				class:tooltip-accent={Color === Shared.Colors.SECONDARY}
				on:click={() => {
					CurrentTemplate.addRepetitiveGroupItem(`${Struct.split(' ')[0]}.value[x]`, JSON.parse(CurrentTemplate.GetRepetitiveGroupDefaultValue(Struct.split(' ')[0])), [...RepetitiveIndexes, Value.length])
					ReloadTemplate()
				}}
				data-tip="Add new {groupName}"
			>
				<Icon type="mdi:plus" color={Color} />
			</button>
		</section>
		<section class="flex-[0.5] join h-fit self-center">
			<button
				class="join-item btn btn-regular w-fit h-fit p-0 tooltip tooltip-secondary tooltip-left space-x-1"
				class:btn-primary={Color === Shared.Colors.ACCENT}
				class:btn-secondary={Color === Shared.Colors.PRIMARY}
				class:btn-accent={Color === Shared.Colors.SECONDARY}
				class:tooltip-primary={Color === Shared.Colors.ACCENT}
				class:tooltip-secondary={Color === Shared.Colors.PRIMARY}
				class:tooltip-accent={Color === Shared.Colors.SECONDARY}
				on:click={() => {
					viewTracker = !viewTracker
				}}
				data-tip={viewTracker ? `Hide section(${groupName})` : `View section(${groupName})`}
			>
				<Icon type={viewTracker ? 'mdi:arrow-collapse' : 'mdi:arrow-expand'} color={GetNextColor(GetNextColor(Color))} iconSize="36" />
			</button>
			<button
				class="join-item btn btn-regular w-fit h-fit p-0 tooltip tooltip-left space-x-1"
				class:btn-primary={Color === Shared.Colors.ACCENT}
				class:btn-secondary={Color === Shared.Colors.PRIMARY}
				class:btn-accent={Color === Shared.Colors.SECONDARY}
				class:tooltip-primary={Color === Shared.Colors.ACCENT}
				class:tooltip-secondary={Color === Shared.Colors.PRIMARY}
				class:tooltip-accent={Color === Shared.Colors.SECONDARY}
				on:click={() => SetViewAsTable(!ViewAsTable)}
				data-tip={ViewAsTable ? 'View data as a list' : 'View data as table'}
			>
				<Icon type={ViewAsTable ? 'mdi:list-box-outline' : 'mdi:file-table-box'} color={GetNextColor(GetNextColor(Color))} iconSize="36" />
			</button>
		</section>
	</header>
	{#if viewTracker}
		<main class="w-full h-fit flex flex-col space-y-1" in:fade={transitionConfig} out:fade={{ delay: 100, duration: 150 }}>
			{#each Value as v, index}
				<ListUniqueGroup
					{CurrentTemplate}
					Struct={`${Struct.split(' ')[0]} unique name=${groupName} #${index + 1}&#`}
					Value={v}
					{UpdateValue}
					{GetValue}
					{DeleteFieldValue}
					Color={GetNextColor(Color)}
					{ViewAsTable}
					{RepetitiveIndexes}
					{SetViewAsTable}
					ItemIndexInRepetitiveGroup={index}
					{RootViewElement}
					ViewTracker={true}
					{DeleteItemInRepetitiveGroup}
					{ReloadTemplate}
				/>
			{/each}
		</main>
	{/if}
</div>
