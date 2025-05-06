<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DESC_REGEX_SEARCH, NAME_REGEX_SEARCH, Shared } from '$lib/constants'
	import type { IFormKeyValue, FormField } from '$lib/interface'
	import { GetNextColor } from '$lib/utils'

	export let Struct: string
	export let Value: FormField
	export let UpdateValue: (value: IFormKeyValue, repetitiveIndexes: number[]) => void
	export let Color: Shared.Colors
	export let RepetitiveIndexes: number[]
	export let GetValue: (key: string, repetitiveIndexes: number[]) => FormField
	export let DeleteFieldValue: (key: string, repetitiveIndexes: number[]) => void
	export let ViewingAsList = false

	function handNumberInput(value: string) {
		UpdateValue({ key: Struct.split(' ')[0], value: Number(value) }, RepetitiveIndexes)
	}

	let fieldName: string | undefined = undefined
	const setFieldName = (value: string | undefined) => (fieldName = value)
	let fieldDescription: string = ''
	const setFieldDescription = (value: string) => (fieldDescription = value)
	let currentValue = GetValue(Struct.split(' ')[0], RepetitiveIndexes)
	$: if (Struct) {
		const nameExtraction = NAME_REGEX_SEARCH.exec(Struct)
		if (nameExtraction) setFieldName(nameExtraction[1])
		else setFieldName(Struct.split(' ')[0].replaceAll('_', ' ').split('.').at(-1))
		const descriptionExtraction = DESC_REGEX_SEARCH.exec(Struct)
		if (descriptionExtraction) {
			setFieldDescription(descriptionExtraction[1])
		}
	}
	let showFieldGroupDescription: boolean = false

	function handleResetField() {
		DeleteFieldValue(Struct.split(' ')[0], RepetitiveIndexes)
		currentValue = null
	}
</script>

<div class="form-control relative">
	{#if typeof Value === 'number'}
		<div class="join" class:join-vertical={ViewingAsList}>
			<span class="join-item flex space-x-1" class:join-label-primary={Color === Shared.Colors.ACCENT} class:join-label-secondary={Color === Shared.Colors.PRIMARY} class:join-label-accent={Color === Shared.Colors.SECONDARY}>
				<div class="flex-[9] flex">
					<span class="h-fit self-center">{fieldName}</span>
					{#if fieldDescription.length > 0}
						<button class="btn btn-circle btn-ghost w-fit h-fit p-0 self-center" on:click={() => (showFieldGroupDescription = !showFieldGroupDescription)} on:focusout={() => (showFieldGroupDescription = false)}>
							<Icon type="mdi:help-circle" color={Color} />
						</button>
					{/if}
				</div>
				{#if ViewingAsList}
					<button class="join-item btn btn-ghost h-full" class:btn-primary={Color === Shared.Colors.ACCENT} class:btn-secondary={Color === Shared.Colors.PRIMARY} class:btn-accent={Color === Shared.Colors.SECONDARY} on:click={handleResetField}>
						<Icon type="mdi:delete-empty" color={Color} />
					</button>
				{/if}
			</span>
			<input
				class="join-item input w-full h-full"
				class:input-primary={Color === Shared.Colors.ACCENT}
				class:input-secondary={Color === Shared.Colors.PRIMARY}
				class:input-accent={Color === Shared.Colors.SECONDARY}
				type="number"
				step="any"
				placeholder="Enter {fieldName}..."
				bind:value={currentValue}
				on:input={(e) => handNumberInput(e.currentTarget.value)}
			/>
			{#if !ViewingAsList}
				<button class="join-item btn btn-regular h-full" class:btn-primary={Color === Shared.Colors.ACCENT} class:btn-secondary={Color === Shared.Colors.PRIMARY} class:btn-accent={Color === Shared.Colors.SECONDARY} on:click={handleResetField}>
					<Icon type="mdi:delete-empty" color={Color} />
				</button>
			{/if}
		</div>
		{#if fieldDescription.length > 0}
			<div class="relative flex h-0">
				{#if showFieldGroupDescription}
					<div
						class="flex-1 w-fit flex flex-col shadow-md rounded-md shadow-gray-900 p-1 space-y-1 absolute top-0 left-0 z-[1] text-xs"
						style="background-color: {GetNextColor(GetNextColor(Color))};"
						class:bg-primary-text={GetNextColor(GetNextColor(Color)) === Shared.Colors.PRIMARY}
						class:bg-secondary-text={GetNextColor(GetNextColor(Color)) === Shared.Colors.SECONDARY}
						class:bg-accent-text={GetNextColor(GetNextColor(Color)) === Shared.Colors.ACCENT}
					>
						{#each fieldDescription.split('\n') as fd}
							<div>{fd}</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	{:else}
		<span>Invalid field!!!!</span>
	{/if}
</div>
