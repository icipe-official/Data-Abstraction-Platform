<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DESC_REGEX_SEARCH, NAME_REGEX_SEARCH, Shared } from '$lib/constants'
	import type { FormField, IFormKeyValue } from '$lib/interface'
	import { inview, type Options } from 'svelte-inview'
	import { fade, type TransitionConfig } from 'svelte/transition'
	import type TemplateManager from '../templatemanager'
	import { GetNextColor } from '$lib/utils'

	export let CurrentTemplate: TemplateManager
	export let Struct: string
	export let Value: any
	export let UpdateValue: (value: IFormKeyValue, repetitiveIndexes: number[]) => void
	export let Color: Shared.Colors = Shared.Colors.PRIMARY
	export let RepetitiveIndexes: number[] = []
	export let GetValue: (key: string, repetitiveIndexes: number[]) => FormField
	export let DeleteFieldValue: (key: string, repetitiveIndexes: number[]) => void
	export let ViewAsTable: boolean
	export let SetViewAsTable: (value: boolean) => void
	export let ItemIndexInRepetitiveGroup: number | null = null
	export let DeleteItemInRepetitiveGroup: ((key: string, repetitiveIndexes: number[], deleteIndex: number) => void) | undefined = undefined
	export let RootViewElement: HTMLElement | undefined
	export let ViewTracker: boolean = false
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

	const ViewingAsList = true

	const options: Options = {
		root: RootViewElement,
		rootMargin: '900px'
	}

	const transitionConfig: TransitionConfig = {
		delay: 300,
		duration: 350
	}
</script>

<div
	class="min-w-max flex-1 h-fit space-y-1 rounded-md p-1 shadow-inner shadow-gray-800"
	class:w-full={!ViewAsTable}
	style="background-color: {Color};"
	use:inview={options}
	on:inview_leave={() => {
		ViewTracker = false
	}}
>
	<header class="flex space-x-1" in:fade={transitionConfig}>
		<section class="flex-[9.5] flex space-x-1">
			<section class="flex flex-col h-fit self-center">
				<h1 class="text-lg h-fit" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
					{groupName}
				</h1>
				{#if DESC_REGEX_SEARCH.test(Struct)}
					<div class="text-md h-fit" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
						{groupDescription}
					</div>
				{/if}
			</section>
			{#if ItemIndexInRepetitiveGroup !== null}
				<button
					class="btn btn-ghost h-fit w-fit p-0 self-center tooltip"
					class:tooltip-primary={Color === Shared.Colors.PRIMARY}
					class:tooltip-secondary={Color === Shared.Colors.SECONDARY}
					class:tooltip-accent={Color === Shared.Colors.ACCENT}
					on:click={() => {
						if (DeleteItemInRepetitiveGroup) DeleteItemInRepetitiveGroup(`${Struct.split(' ')[0]}.value[x]`, RepetitiveIndexes, ItemIndexInRepetitiveGroup !== null ? ItemIndexInRepetitiveGroup : -1)
					}}
					data-tip="Delete {groupName}"
				>
					<Icon type="mdi:delete" color={GetNextColor(Color)} />
				</button>
			{/if}
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
					ViewTracker = !ViewTracker
				}}
				data-tip={ViewTracker ? `Hide section(${groupName})` : `View section(${groupName})`}
			>
				<Icon type={ViewTracker ? 'mdi:arrow-collapse' : 'mdi:arrow-expand'} color={GetNextColor(GetNextColor(Color))} iconSize="36" />
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
	{#if ViewTracker}
		<main class="w-full h-fit flex justify-evenly" class:flex-row={ViewAsTable} class:space-x-1={ViewAsTable} class:flex-col={!ViewAsTable} class:space-y-1={!ViewAsTable} in:fade={transitionConfig}>
			{#if Value && typeof Value !== 'undefined'}
				{#each Object.keys(Value) as key}
					{#if typeof Value[key]['value'] === 'string' || typeof Value[key]['value'] === 'number' || Value[key]['struct'].split(' ')[2] === 'multiselect' || Value[key]['value'] === null}
						<div class="min-w-[400px] h-fit" class:w-full={!ViewAsTable} class:w-max={ViewAsTable}>
							{#await import('./Field.svelte')}
								<div class="w-full h-fit flex justify-center bg-gray-400">
									<div class="w-fit h-fit self-center flex flex-col">
										<div class="w-fit h-fit self-center">
											<span class="loading loading-ball loading-sm text-accent" />
											<span class="loading loading-ball loading-md text-secondary" />
											<span class="loading loading-ball loading-lg text-primary" />
										</div>
										<div class="text-lg text-white">Loading...</div>
									</div>
								</div>
							{:then Field}
								<Field.default Struct={Value[key]['struct']} Value={Value[key]['value']} {UpdateValue} {Color} RepetitiveIndexes={ItemIndexInRepetitiveGroup !== null ? [...RepetitiveIndexes, ItemIndexInRepetitiveGroup] : RepetitiveIndexes} {GetValue} {DeleteFieldValue} {ViewingAsList} />
							{:catch}
								<div class="w-full h-fit flex justify-center bg-gray-400">
									<div class="w-fit h-fit self-center flex flex-col">
										<div class="text-lg text-white">Network error...</div>
									</div>
								</div>
							{/await}
						</div>
					{:else if Value[key]['struct'].split(' ')[1] === 'unique' && RootViewElement}
						<svelte:self
							{CurrentTemplate}
							Struct={Value[key]['struct']}
							Value={Value[key]['value']}
							{UpdateValue}
							{GetValue}
							{DeleteFieldValue}
							Color={GetNextColor(Color)}
							{ViewAsTable}
							RepetitiveIndexes={ItemIndexInRepetitiveGroup !== null ? [...RepetitiveIndexes, ItemIndexInRepetitiveGroup] : RepetitiveIndexes}
							{SetViewAsTable}
							{RootViewElement}
							{ReloadTemplate}
						/>
					{:else if Value[key]['struct'].split(' ')[1] === 'repetitive' && RootViewElement}
						{#await import('./ListRepetitiveGroup.svelte')}
							<div class="w-full h-fit flex justify-center bg-gray-400">
								<div class="w-fit h-fit self-center flex flex-col">
									<div class="w-fit h-fit self-center">
										<span class="loading loading-ball loading-sm text-accent" />
										<span class="loading loading-ball loading-md text-secondary" />
										<span class="loading loading-ball loading-lg text-primary" />
									</div>
									<div class="text-lg text-white">Loading...</div>
								</div>
							</div>
						{:then ListRepetitiveGroup}
							<ListRepetitiveGroup.default
								{CurrentTemplate}
								Struct={Value[key]['struct']}
								Value={Value[key]['value']}
								{UpdateValue}
								{GetValue}
								{DeleteFieldValue}
								Color={GetNextColor(Color)}
								{ViewAsTable}
								RepetitiveIndexes={ItemIndexInRepetitiveGroup !== null ? [...RepetitiveIndexes, ItemIndexInRepetitiveGroup] : RepetitiveIndexes}
								{SetViewAsTable}
								{RootViewElement}
								{ReloadTemplate}
							/>
						{:catch}
							<div class="w-full h-fit flex justify-center bg-gray-400">
								<div class="w-fit h-fit self-center flex flex-col">
									<div class="text-lg text-white">Network error...</div>
								</div>
							</div>
						{/await}
					{:else}
						<div>Invalid Field/Group!!!!</div>
					{/if}
				{/each}
			{:else}
				<div>Undefined Field/Group!!!!</div>
			{/if}
		</main>
	{/if}
</div>
