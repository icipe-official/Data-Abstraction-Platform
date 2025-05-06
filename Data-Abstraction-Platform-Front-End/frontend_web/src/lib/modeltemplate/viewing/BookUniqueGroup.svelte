<script lang="ts">
	import { DESC_REGEX_SEARCH, NAME_REGEX_SEARCH, Shared } from '$lib/constants'
	import type { BreadCrumb, FormField, IFormKeyValue } from '$lib/interface'
	import { GetNextColor } from '$lib/utils'

	export let Struct: string
	export let Value: any
	export let UpdateValue: (value: IFormKeyValue, repetitiveIndexes: number[]) => void
	export let Color: Shared.Colors = Shared.Colors.PRIMARY
	export let RepetitiveIndexes: number[] = []
	export let SetCurrentSectionFromGroups: (key: string, repetitiveIndexes: number[]) => void
	export let GetValue: (key: string, repetitiveIndexes: number[]) => FormField
	export let DeleteFieldValue: (key: string, repetitiveIndexes: number[]) => void
	export let BreadCrumb: BreadCrumb[]

	interface UniqueGroup {
		name: string
		key: string
	}
	let uniqueGroups: UniqueGroup[] = []
	const setUniqueGroups = (value: UniqueGroup[]) => (uniqueGroups = value)
	const getUniqueGroups = () => uniqueGroups
	let uniqueGroupContainsFields = false
	$: if (Value && typeof Value !== 'undefined') {
		setUniqueGroups([])
		for (let key of Object.keys(Value)) {
			if (Value[key]['struct'].split(' ')[1] === 'unique' || Value[key]['struct'].split(' ')[1] === 'repetitive') {
				const groupNameExtract = NAME_REGEX_SEARCH.exec(Value[key]['struct'])
				const groupName = groupNameExtract ? groupNameExtract[1] : Value[key]['struct'].split(' ')[0].split('.').at(-1).replaceAll('_', ' ')
				setUniqueGroups([...getUniqueGroups(), { name: groupName, key: Value[key]['struct'].split(' ')[0] }])
			} else if (typeof Value[key]['value'] === 'string' || typeof Value[key]['value'] === 'number' || Value[key]['struct'].split(' ')[2] === 'multiselect' || Value[key]['value'] === null) {
				uniqueGroupContainsFields = true
			}
		}
	}

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
	<header class="flex flex-col">
		<h1 class="text-lg" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
			{groupName}
		</h1>
		{#if DESC_REGEX_SEARCH.test(Struct)}
			<div class="text-md" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
				{groupDescription}
			</div>
		{/if}
	</header>
	{#if BreadCrumb && BreadCrumb.length > 0}
		<div class="flex w-full h-fit pl-1 pr-1 overflow-hidden shadow-inner shadow-gray-800 rounded-md bg-accent bg-accent-text">
			<nav class="self-center text-sm breadcrumbs overflow-y-hidden w-full">
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
	<div class="flex-[9] flex flex-col overflow-x-hidden overflow-y-auto">
		{#if uniqueGroupContainsFields}
			<section class="flex flex-col space-y-1">
				{#if Value && typeof Value !== 'undefined'}
					{#each Object.keys(Value) as key}
						{#if typeof Value[key]['value'] === 'string' || typeof Value[key]['value'] === 'number' || Value[key]['struct'].split(' ')[2] === 'multiselect' || Value[key]['value'] === null}
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
								<Field.default Struct={Value[key]['struct']} Value={Value[key]['value']} {UpdateValue} {Color} {RepetitiveIndexes} {GetValue} {DeleteFieldValue} />
							{:catch}
								<div class="w-full h-fit flex justify-center bg-gray-400">
									<div class="w-fit h-fit self-center flex flex-col">
										<div class="text-lg text-white">Network error...</div>
									</div>
								</div>
							{/await}
						{:else if Value[key]['struct'].split(' ')[1] === 'unique' || Value[key]['struct'].split(' ')[1] === 'repetitive'}
							<span />
						{:else}
							<div>Invalid Field/Group!!!!</div>
						{/if}
					{/each}
				{:else}
					<div>Undefined Field/Group!!!!</div>
				{/if}
			</section>
		{/if}
		{#if uniqueGroups.length > 0}
			<header class="flex-[0.5]">
				<h1 class="text-lg" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>
					{groupName} sections
				</h1>
			</header>
			<div class="w-full h-full rounded-md shadow-inner shadow-gray-800 p-1 flex flex-col" style="background-color: {GetNextColor(Color)};">
				<header class="flex-[0.5] border-b-2 border-gray-800 pb-1">
					<h1 class="text-lg" class:bg-primary-text={GetNextColor(Color) === Shared.Colors.PRIMARY} class:bg-secondary-text={GetNextColor(Color) === Shared.Colors.SECONDARY} class:bg-accent-text={GetNextColor(Color) === Shared.Colors.ACCENT}>
						List of {groupName} sections
					</h1>
				</header>
				<main class="flex-[9] overflow-x-hidden overflow-y-auto">
					{#each uniqueGroups as ug, index}
						<button
							class="link link-hover w-full text-left"
							class:bg-primary-text={GetNextColor(Color) === Shared.Colors.PRIMARY}
							class:bg-secondary-text={GetNextColor(Color) === Shared.Colors.SECONDARY}
							class:bg-accent-text={GetNextColor(Color) === Shared.Colors.ACCENT}
							on:click={() => SetCurrentSectionFromGroups(ug.key, RepetitiveIndexes)}
						>
							{index + 1}-{ug.name}
						</button>
					{/each}
				</main>
			</div>
		{/if}
	</div>
</section>
