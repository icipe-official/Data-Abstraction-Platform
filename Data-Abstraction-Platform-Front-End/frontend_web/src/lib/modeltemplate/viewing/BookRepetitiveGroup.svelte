<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DESC_REGEX_SEARCH, NAME_REGEX_SEARCH, Shared } from '$lib/constants'
	import type { BreadCrumb } from '$lib/interface'
	import { GetNextColor } from '$lib/utils'
	import type TemplateManager from '../templatemanager'

	export let CurrentTemplate: TemplateManager
	export let Struct: string
	export let Value: any[]
	export let Color: Shared.Colors
	export let RepetitiveIndexes: number[]
	export let SetCurrentSectionFromGroups: (key: string, repetitiveIndexes: number[]) => void
	export let BreadCrumb: BreadCrumb[]
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
</script>

<section class="w-full h-full flex flex-col rounded-md shadow-inner shadow-gray-800 overflow-hidden p-2 space-y-1" style="background-color: {Color};">
	<header class="flex">
		<section class="flex-[9]">
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
			class="btn btn-regular h-fit w-fit"
			class:btn-primary={Color === Shared.Colors.ACCENT}
			class:btn-secondary={Color === Shared.Colors.PRIMARY}
			class:btn-accent={Color === Shared.Colors.SECONDARY}
			on:click={() => {
				CurrentTemplate.addRepetitiveGroupItem(`${Struct.split(' ')[0]}.value[x]`, JSON.parse(CurrentTemplate.GetRepetitiveGroupDefaultValue(Struct.split(' ')[0])), [...RepetitiveIndexes, Value.length])
				ReloadTemplate()
			}}
		>
			<Icon type="mdi:plus" />
		</button>
	</header>
	{#if BreadCrumb}
		<div class="flex first-line:w-full h-fit pl-1 pr-1 overflow-hidden shadow-inner shadow-gray-800 rounded-md bg-accent bg-accent-text">
			<nav class="text-sm breadcrumbs overflow-y-hidden w-full self-center overflow-x-auto">
				<ul>
					{#each BreadCrumb as bc, index}
						<li>
							{#if index !== BreadCrumb.length - 1}
								<button class="link link-hover" on:click={() => SetCurrentSectionFromGroups(bc.path, [])}>
									{bc.crumb}
								</button>
							{:else}
								{bc.crumb}
							{/if}
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	{:else}
		<div class="divider" />
	{/if}
	<main class="overflow-auto h-full space-y-1 rounded-md shadow-inner shadow-gray-800 p-1" style="background-color: {GetNextColor(Color)};">
		<header class="flex-[0.5] border-b-2 border-gray-800 pb-1">
			<h1 class="text-base text-md">List of {groupName} sections</h1>
		</header>
		{#each Value as _, index}
			<section class="flex space-x-1">
				<button class="flex-[0.5] link link-hover w-full text-left whitespace-nowrap" class:text-black={Color === Shared.Colors.PRIMARY} on:click={() => SetCurrentSectionFromGroups(`${Struct.split(' ')[0]}.value[x]`, [...RepetitiveIndexes, index])}>
					{index + 1}-{`${groupName?.replaceAll('_', ' ')} #${index + 1}`}
				</button>
				<span class="flex-[9] border-b-2 border-dotted w-full h-fit self-center" />
				<button
					class="flex-[0.5] btn btn-regular btn-ghost h-fit w-fit p-0"
					on:click={() => {
						CurrentTemplate.deleteRepetitiveGroupItem(`${Struct.split(' ')[0]}.value[x]`, [...RepetitiveIndexes, index])
						ReloadTemplate()
					}}
				>
					<Icon type="mdi:delete" color={Color} />
				</button>
			</section>
		{/each}
	</main>
</section>
