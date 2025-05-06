<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DESC_REGEX_SEARCH, NAME_REGEX_SEARCH, Shared } from '$lib/constants'
	import type { IFormKeyValue, FormField } from '$lib/interface'
	import { GetNextColor } from '$lib/utils'

	export let Struct: string
	export let Value: FormField
	export let UpdateValue: (value: IFormKeyValue, repetitiveIndexes: number[]) => void
	export let GetValue: (key: string, repetitiveIndexes: number[]) => any
	export let Color: Shared.Colors
	export let RepetitiveIndexes: number[]
	export let DeleteFieldValue: (key: string, repetitiveIndexes: number[]) => void
	export let ViewingAsList = false

	function handleTextInput(value: string) {
		UpdateValue({ key: Struct.split(' ')[0], value }, RepetitiveIndexes)
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

<div class="form-control">
	{#if (Struct.split(' ')[2] == 'text' || Struct.split(' ')[2] == 'textarea') && typeof Value === 'string'}
		<div class="join" class:join-vertical={Struct.split(' ')[2] == 'textarea' || ViewingAsList}>
			<span class="join-item flex space-x-1" class:join-label-primary={Color === Shared.Colors.ACCENT} class:join-label-secondary={Color === Shared.Colors.PRIMARY} class:join-label-accent={Color === Shared.Colors.SECONDARY}>
				<span class="self-center">{fieldName}</span>
				{#if fieldDescription.length > 0}
					<button class="btn btn-circle btn-ghost w-fit h-fit p-0 self-center" on:click={() => (showFieldGroupDescription = !showFieldGroupDescription)} on:focusout={() => (showFieldGroupDescription = false)}>
						<Icon type="mdi:help-circle" color={Color} />
					</button>
				{/if}
				{#if Struct.split(' ')[2] == 'textarea' || ViewingAsList}
					<span class="flex-[9] flex justify-end">
						<button class="btn btn-ghost h-fit w-fit" on:click={handleResetField}>
							<Icon type="mdi:delete-empty" color={Color} />
						</button>
					</span>
				{/if}
			</span>
			{#if Struct.split(' ')[2] == 'text'}
				<input
					class="join-item input w-full h-full"
					class:input-primary={Color === Shared.Colors.ACCENT}
					class:input-secondary={Color === Shared.Colors.PRIMARY}
					class:input-accent={Color === Shared.Colors.SECONDARY}
					type="text"
					placeholder="Enter {fieldName}..."
					bind:value={currentValue}
					on:input={(e) => handleTextInput(e.currentTarget.value)}
				/>
				{#if !ViewingAsList}
					<button class="join-item btn btn-regular h-full" class:btn-primary={Color === Shared.Colors.ACCENT} class:btn-secondary={Color === Shared.Colors.PRIMARY} class:btn-accent={Color === Shared.Colors.SECONDARY} on:click={handleResetField}>
						<Icon type="mdi:delete-empty" color={Color} />
					</button>
				{/if}
			{:else}
				<textarea
					class="join-item textarea w-full"
					class:textarea-primary={Color === Shared.Colors.ACCENT}
					class:textarea-secondary={Color === Shared.Colors.PRIMARY}
					class:textarea-accent={Color === Shared.Colors.SECONDARY}
					placeholder="Describe {fieldName}..."
					bind:value={currentValue}
					on:input={(e) => handleTextInput(e.currentTarget.value)}
				/>
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
