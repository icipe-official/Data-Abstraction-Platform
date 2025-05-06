<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DESC_REGEX_SEARCH, NAME_REGEX_SEARCH, OPTS_REGEX_SEARCH, OPTS_SPLIT, OPT_SPLIT, Shared } from '$lib/constants'
	import type { IFormKeyValue, FormField } from '$lib/interface'
	import { GetNextColor } from '$lib/utils'
	import Select from 'svelte-select'

	interface SelectItem {
		value: string | number
		label: string
	}

	export let Struct: string
	// export let Value: FormField
	export let UpdateValue: (value: IFormKeyValue, repetitiveIndexes: number[]) => void
	export let GetValue: (key: string, repetitiveIndexes: number[]) => FormField
	export let DeleteFieldValue: (key: string, repetitiveIndexes: number[]) => void
	export let Color: Shared.Colors
	export let RepetitiveIndexes: number[]
	export let ViewingAsList = false

	let multipleSelect: boolean = false
	const setMultipleSelect = (value: boolean) => (multipleSelect = value)
	let selectOptions: SelectItem[] = []
	const setSelectOptions = (value: SelectItem[]) => (selectOptions = value)
	let fieldName: string | undefined = undefined
	const setFieldName = (value: string | undefined) => (fieldName = value)
	let fieldType: string | undefined = undefined
	const setFieldType = (value: string) => (fieldType = value)
	let selectedValues: SelectItem | SelectItem[] | null = null
	const setSelectedValues = (value: SelectItem | SelectItem[] | null) => (selectedValues = value)
	const getSelectedValues = () => selectedValues
	let fieldDescription: string = ''
	const setFieldDescription = (value: string) => (fieldDescription = value)
	$: if (Struct) {
		const nameExtraction = NAME_REGEX_SEARCH.exec(Struct)
		if (nameExtraction) setFieldName(nameExtraction[1])
		else setFieldName(Struct.split(' ')[0].replaceAll('_', ' ').split('.').at(-1))
		setMultipleSelect(Struct.split(' ')[2] === 'multiselect')
		setFieldType(Struct.split(' ')[1])
		setSelectOptions([])
		setSelectedValues(null)
		setFieldDescription('')
		if (OPTS_REGEX_SEARCH.test(Struct)) {
			const optsExtract = OPTS_REGEX_SEARCH.exec(Struct)
			if (optsExtract) {
				const extractedOptions = optsExtract[1].split(OPTS_SPLIT)
				setSelectOptions(
					extractedOptions.map((opts) => {
						const newOptions = { value: opts.split(OPT_SPLIT)[1], label: opts.split(OPT_SPLIT)[0] }
						const selectedOptions = GetValue(Struct.split(' ')[0], RepetitiveIndexes)
						if (selectedOptions !== null) {
							if (Array.isArray(selectedOptions)) {
								for (let v of selectedOptions) {
									if (newOptions.value === v.toString()) {
										//@ts-expect-error
										setSelectedValues(getSelectedValues() !== null && getSelectedValues().length > 0 ? [...getSelectedValues(), newOptions] : [newOptions])
										break
									}
								}
							} else if (newOptions.value === selectedOptions.toString()) setSelectedValues(newOptions)
						}
						return newOptions
					})
				)
			}
		}
		const descriptionExtraction = DESC_REGEX_SEARCH.exec(Struct)
		if (descriptionExtraction) {
			setFieldDescription(descriptionExtraction[1])
		}
	}
	function handleInputSelectOption(value: SelectItem | SelectItem[]) {
		let newValue: FormField
		if (Array.isArray(value)) {
			//@ts-expect-error
			newValue = value === null ? null : value.map((v) => (fieldType === 'text' ? v.value : Number(v.value)))
		} else {
			newValue = value === null ? null : fieldType === 'text' ? value.value : Number(value.value)
		}
		UpdateValue({ key: Struct.split(' ')[0], value: newValue }, RepetitiveIndexes)
	}

	function handleDeleteSelectOptions(value: SelectItem | SelectItem[]) {
		if (multipleSelect && selectedValues) {
			if (Array.isArray(selectedValues)) {
				if (Array.isArray(value)) {
					for (let so of value) {
						for (let sv of selectedValues) {
							if (so.value === sv.value) {
								selectedValues = selectedValues.filter((sv) => sv.value !== so.value)
								break
							}
						}
					}
				} else {
					selectedValues = selectedValues.filter((sv) => sv.value !== value.value)
				}
				if (selectedValues.length < 1) {
					handleResetField()
				} else {
					UpdateValue({ key: Struct.split(' ')[0], value: selectedValues.map((sv) => sv.value) as FormField }, RepetitiveIndexes)
				}
			}
		} else {
			handleResetField()
		}
	}

	let showFieldGroupDescription: boolean = false

	function handleResetField() {
		DeleteFieldValue(Struct.split(' ')[0], RepetitiveIndexes)
		selectedValues = null
	}
</script>

<div class="form-control">
	{#if selectOptions.length > 0}
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
			<div class="join-item bg-accent w-full min-h-[48px] h-full" class:rounded-b-md={ViewingAsList}>
				<Select
					items={selectOptions}
					bind:value={selectedValues}
					placeholder={`Choose ${Struct.split(' ')[0].split('.').at(-1)?.replaceAll('_', ' ')}...`}
					on:change={(e) => handleInputSelectOption(e.detail)}
					on:clear={(e) => handleDeleteSelectOptions(e.detail)}
					floatingConfig={{
						strategy: 'fixed'
					}}
					multiple={multipleSelect}
					--background="transparent"
					--border="1px {GetNextColor(Color)} solid"
					--border-radius={'0px 0px 0px 0px'}
					--border-hover="1px {GetNextColor(Color)} solid"
					--list-background={Shared.Colors.ACCENT}
					--height="48px"
					--item-padding="8px"
					--multi-item-bg={GetNextColor(Color)}
					--multi-item-color={GetNextColor(GetNextColor(Color))}
					--multi-item-clear-icon-color={GetNextColor(GetNextColor(Color))}
					--multi-item-outline={GetNextColor(Color)}
				/>
			</div>
			{#if !ViewingAsList}
				<button class="join-item btn-regular h-full" class:btn-primary={Color === Shared.Colors.ACCENT} class:btn-secondary={Color === Shared.Colors.PRIMARY} class:btn-accent={Color === Shared.Colors.SECONDARY} on:click={handleResetField}>
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
		<div>Invalid field!!!</div>
	{/if}
</div>
