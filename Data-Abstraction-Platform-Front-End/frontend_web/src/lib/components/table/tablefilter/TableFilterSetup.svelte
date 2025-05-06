<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { NOT_REGEX_EXTRACT, FILTER_TYPE_EXTRACT, Shared, VALUE_EXTRACT, OPTS_REGEX_SEARCH, OPTS_SPLIT, OPT_SPLIT } from '$lib/constants'
	import { GetNextColor } from '$lib/utils'
	import Select from 'svelte-select'

	export let ColumnName: string
	export let ColumnType: string
	export let IsColumnDropdownType: boolean
	export let TableColumnStruct: string
	export let Color: Shared.Colors
	export let UpdateCreatedFilterOptions: (key: string, value: string[][]) => void
	export let FilterOptions: string[][]

	enum FilterParam {
		NOT = 'not',
		FILTER_TYPE = 'filterType',
		VALUE = 'value'
	}

	function extractFilterParameter(paramType: FilterParam, filterOption: string) {
		switch (paramType) {
			case FilterParam.NOT:
				return NOT_REGEX_EXTRACT.exec(filterOption)
			case FilterParam.FILTER_TYPE:
				const filterTypeParam = FILTER_TYPE_EXTRACT.exec(filterOption)
				if (filterTypeParam) {
					return filterTypeParam[1]
				} else {
					return null
				}
			case FilterParam.VALUE:
				const valueParam = VALUE_EXTRACT.exec(filterOption)
				if (valueParam) {
					return valueParam[1]
				} else {
					return null
				}
			default:
				return null
		}
	}

	function handleFilterOptionChange(orIndex: number, andIndex: number, not: string | undefined, filterType: string | undefined, value: string | undefined, selectValue: SelectItem | SelectItem[] | undefined, deleteSelectedValues: SelectItem | SelectItem[] | undefined) {
		if (not) {
			if (NOT_REGEX_EXTRACT.exec(FilterOptions[orIndex][andIndex])) {
				if (not === 'is') {
					FilterOptions[orIndex][andIndex] = FilterOptions[orIndex][andIndex].replace(NOT_REGEX_EXTRACT, '').trim()
				}
			} else {
				if (not === 'not') {
					FilterOptions[orIndex][andIndex] = `${FilterOptions[orIndex][andIndex]} not=true&#`
				}
			}
		}
		if (filterType) {
			if (FILTER_TYPE_EXTRACT.exec(FilterOptions[orIndex][andIndex])) {
				FilterOptions[orIndex][andIndex] = FilterOptions[orIndex][andIndex].replace(FILTER_TYPE_EXTRACT, `filtertype=${filterType}&#`).trim()
			} else {
				FilterOptions[orIndex][andIndex] = `${FilterOptions[orIndex][andIndex]} filtertype=${filterType}&#`
			}
		}
		if (value) {
			if (VALUE_EXTRACT.exec(FilterOptions[orIndex][andIndex])) {
				FilterOptions[orIndex][andIndex] = FilterOptions[orIndex][andIndex].replace(VALUE_EXTRACT, `value=${value}&#`).trim()
			} else {
				FilterOptions[orIndex][andIndex] = `${FilterOptions[orIndex][andIndex]} value=${value}&#`
			}
		}
		if (selectValue) {
			let newValue: string | number | null = null
			if (Array.isArray(selectValue)) {
				newValue = selectValue.map((v) => v.value).join(OPT_SPLIT)
			} else {
				newValue = selectValue.value
			}
			if (VALUE_EXTRACT.exec(FilterOptions[orIndex][andIndex])) {
				FilterOptions[orIndex][andIndex] = FilterOptions[orIndex][andIndex].replace(VALUE_EXTRACT, `value=${newValue}&#`).trim()
			} else {
				FilterOptions[orIndex][andIndex] = `${FilterOptions[orIndex][andIndex]} value=${newValue}&#`
			}
		}
		if (deleteSelectedValues) {
			if (extractFilterParameter(FilterParam.FILTER_TYPE, FilterOptions[orIndex][andIndex]) === Shared.TextFilterType.CONTAINING) {
				const value = extractFilterParameter(FilterParam.VALUE, FilterOptions[orIndex][andIndex])
				if (value === null || Array.isArray(value)) {
					return
				}
				let selectedValues = (value as string).split(OPT_SPLIT)
				if (Array.isArray(deleteSelectedValues)) {
					for (let so of deleteSelectedValues) {
						if (selectedValues.includes(`${so.value}`)) {
							selectedValues = selectedValues.filter((v) => v !== so.value)
						}
					}
				} else {
					selectedValues = selectedValues.filter((v) => v !== deleteSelectedValues.value)
				}
				if (selectedValues.length > 0) {
					FilterOptions[orIndex][andIndex] = FilterOptions[orIndex][andIndex].replace(VALUE_EXTRACT, `value=${selectedValues}&#`).trim()
				} else {
					FilterOptions[orIndex][andIndex] = FilterOptions[orIndex][andIndex].replace(VALUE_EXTRACT, '').trim()
				}
			} else {
				FilterOptions[orIndex][andIndex] = FilterOptions[orIndex][andIndex].replace(VALUE_EXTRACT, '').trim()
			}
		}
		UpdateCreatedFilterOptions(TableColumnStruct.split(' ')[0], FilterOptions)
	}

	interface SelectItem {
		value: string | number
		label: string
	}
	let selectOptions: SelectItem[] = []
	if (OPTS_REGEX_SEARCH.test(TableColumnStruct)) {
		const optsExtract = OPTS_REGEX_SEARCH.exec(TableColumnStruct)
		if (optsExtract) {
			const extractedOptions = optsExtract[1].split(OPTS_SPLIT)
			selectOptions = extractedOptions.map((opts) => {
				return { value: opts.split(OPT_SPLIT)[1], label: opts.split(OPT_SPLIT)[0] }
			})
		}
	}
	function getSelectedValues(filterOption: string) {
		const value = extractFilterParameter(FilterParam.VALUE, filterOption)
		if (value === null || Array.isArray(value)) {
			return null
		}
		let selectedValues = (value as string).split(OPT_SPLIT)
		let selectedOptions: SelectItem | SelectItem[] | null = null
		for (let so of selectOptions) {
			if (selectedValues.includes(`${so.value}`)) {
				if (extractFilterParameter(FilterParam.FILTER_TYPE, filterOption) === Shared.MultiSelectFilterType.CONTAINING) {
					//@ts-expect-error
					selectedOptions = selectedOptions === null ? [so] : [...selectedOptions, so]
				} else {
					selectedOptions = so
				}
				if (selectedValues.length === 1) {
					break
				} else {
					selectedValues = selectedValues.filter((v) => v !== so.value)
				}
			}
		}
		return selectedOptions
	}
</script>

<div class="flex flex-col">
	<header class="flex justify-between">
		<span class="font-bold text-sm h-fit self-center">{ColumnName} filter options</span>
		<button
			class="join-item btn btn-ghost w-fit h-fit p-0 tooltip tooltip-left"
			class:tooltip-primary={Color === Shared.Colors.ACCENT}
			class:tooltip-secondary={Color === Shared.Colors.PRIMARY}
			class:tooltip-accent={Color === Shared.Colors.SECONDARY}
			data-tip="Add new column filter option (or)"
			on:click={() => {
				UpdateCreatedFilterOptions(TableColumnStruct.split(' ')[0], [...FilterOptions, [`${ColumnType}`]])
			}}
		>
			<Icon type="mdi:plus" color={GetNextColor(Color)} />
		</button>
	</header>
	<div class="divider" />
	<main class="flex flex-col overflow-x-hidden overflow-y-auto space-y-1 max-h-[65vh]">
		{#if FilterOptions && FilterOptions.length > 0}
			{#each FilterOptions as orFo, orIndex}
				<div class="join join-vertical">
					<header class="join-item flex justify-between" class:bg-primary={Color === Shared.Colors.ACCENT} class:bg-secondary={Color === Shared.Colors.PRIMARY} class:bg-accent={Color === Shared.Colors.SECONDARY}>
						<span class="join-item w-fit pl-5 pr-5 flex justify-center" class:bg-primary-text={Color === Shared.Colors.ACCENT} class:bg-secondary-text={Color === Shared.Colors.PRIMARY} class:bg-accent-text={Color === Shared.Colors.SECONDARY}>
							<span class="self-center">#{orIndex + 1}</span>
						</span>
						<span class="join join-horizontal">
							<button
								class="w-fit join-item btn btn-ghost"
								on:click={() => {
									UpdateCreatedFilterOptions(
										TableColumnStruct.split(' ')[0],
										FilterOptions.filter((_, i) => i !== orIndex)
									)
								}}
							>
								<Icon type="mdi:delete" color={GetNextColor(GetNextColor(Color))} />
							</button>
							<button
								class="w-fit join-item btn btn-ghost tooltip tooltip-left"
								on:click={() => {
									UpdateCreatedFilterOptions(
										TableColumnStruct.split(' ')[0],
										FilterOptions.map((value, index) => {
											let newValue = value
											if (index === orIndex) {
												newValue = [...newValue, '']
											}
											return newValue
										})
									)
								}}
								class:tooltip-primary={GetNextColor(Color) === Shared.Colors.ACCENT}
								class:tooltip-secondary={GetNextColor(Color) === Shared.Colors.PRIMARY}
								class:tooltip-accent={GetNextColor(Color) === Shared.Colors.SECONDARY}
								data-tip="Add new column filter option (and)"
							>
								<Icon type="mdi:plus" color={GetNextColor(GetNextColor(Color))} />
							</button>
						</span>
					</header>
					{#each orFo as andFo, andIndex}
						<div class="join-item join join-horizontal flex w-full">
							<span
								class="join-item w-fit pl-5 pr-5 flex justify-center"
								class:bg-primary={Color === Shared.Colors.ACCENT}
								class:bg-secondary={Color === Shared.Colors.PRIMARY}
								class:bg-accent={Color === Shared.Colors.SECONDARY}
								class:text-primary={GetNextColor(Color) === Shared.Colors.ACCENT}
								class:text-secondary={GetNextColor(Color) === Shared.Colors.PRIMARY}
								class:text-accent={GetNextColor(Color) === Shared.Colors.SECONDARY}
							>
								<span class="self-center">{andIndex + 1}</span>
							</span>
							<div class="flex-[0.5] border-[1px] rounded-none flex justify-center bg-white" class:border-primary={Color === Shared.Colors.ACCENT} class:border-secondary={Color === Shared.Colors.PRIMARY} class:border-accent={Color === Shared.Colors.SECONDARY}>
								<select
									class="select rounded-none self-center border-none w-full"
									class:select-primary={Color === Shared.Colors.ACCENT}
									class:select-secondary={Color === Shared.Colors.PRIMARY}
									class:select-accent={Color === Shared.Colors.SECONDARY}
									on:change={(e) => handleFilterOptionChange(orIndex, andIndex, e.currentTarget.value, undefined, undefined, undefined, undefined)}
								>
									<option selected={extractFilterParameter(FilterParam.NOT, andFo) === null} value="is">Is</option>
									<option selected={extractFilterParameter(FilterParam.NOT, andFo) !== null} value="not">Is not</option>
								</select>
							</div>
							<div class="flex-[0.5] border-[1px] rounded-none flex justify-center bg-white" class:border-primary={Color === Shared.Colors.ACCENT} class:border-secondary={Color === Shared.Colors.PRIMARY} class:border-accent={Color === Shared.Colors.SECONDARY}>
								<select
									class="rounded-none select self-center border-none w-full"
									class:select-primary={Color === Shared.Colors.ACCENT}
									class:select-secondary={Color === Shared.Colors.PRIMARY}
									class:select-accent={Color === Shared.Colors.SECONDARY}
									on:change={(e) => handleFilterOptionChange(orIndex, andIndex, undefined, e.currentTarget.value, undefined, undefined, undefined)}
								>
									<option selected={extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === null} value={undefined} disabled>Filter Type...</option>
									{#if ColumnType === 'text' && !IsColumnDropdownType}
										<option selected={extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.TextFilterType.CONTAINING} value={Shared.TextFilterType.CONTAINING}>Text containing</option>
										<option selected={extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.TextFilterType.BEGINNING_WITH} value={Shared.TextFilterType.BEGINNING_WITH}> Beginning with </option>
										<option selected={extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.TextFilterType.ENDING_WITH} value={Shared.TextFilterType.ENDING_WITH}>Ending with</option>
										<option selected={extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.TextFilterType.EQUAL_TO} value={Shared.TextFilterType.EQUAL_TO}>Equal to</option>
									{/if}
									{#if (ColumnType === 'number' || ColumnType === 'repetitive') && !IsColumnDropdownType}
										<option selected={extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.NumberFilterType.GREATER_THAN} value={Shared.NumberFilterType.GREATER_THAN}> Greater than </option>
										<option selected={extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.NumberFilterType.LESS_THAN} value={Shared.NumberFilterType.LESS_THAN}>Less than</option>
										<option selected={extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.NumberFilterType.EQUAL_TO} value={Shared.NumberFilterType.EQUAL_TO}>Equal to</option>
									{/if}
									{#if IsColumnDropdownType || ColumnType === 'unique' || ColumnType === 'repetitive'}
										<option selected={extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.MultiSelectFilterType.CONTAINING} value={Shared.MultiSelectFilterType.CONTAINING}> Containing </option>
									{/if}
								</select>
							</div>
							{#if ColumnType === 'text' && !IsColumnDropdownType && (extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.TextFilterType.CONTAINING || extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.TextFilterType.BEGINNING_WITH || extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.TextFilterType.ENDING_WITH || extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === 'equal to')}
								<div class="flex-[1] border-[1px] rounded-none flex justify-center bg-white" class:border-primary={Color === Shared.Colors.ACCENT} class:border-secondary={Color === Shared.Colors.PRIMARY} class:border-accent={Color === Shared.Colors.SECONDARY}>
									<textarea
										class="rounded-none textarea max-h-[20vh] h-[48px] self-center w-full"
										class:textarea-primary={Color === Shared.Colors.ACCENT}
										class:textarea-secondary={Color === Shared.Colors.PRIMARY}
										class:textarea-accent={Color === Shared.Colors.SECONDARY}
										placeholder="Value..."
										value={extractFilterParameter(FilterParam.VALUE, andFo)}
										on:input={(e) => handleFilterOptionChange(orIndex, andIndex, undefined, undefined, e.currentTarget.value, undefined, undefined)}
									/>
								</div>
							{:else if (ColumnType === 'number' || ColumnType === 'repetitive') && !IsColumnDropdownType && (extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.NumberFilterType.GREATER_THAN || extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.NumberFilterType.LESS_THAN || extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === 'equal to')}
								<div class="flex-[1] border-[1px] rounded-none flex justify-center bg-white" class:border-primary={Color === Shared.Colors.ACCENT} class:border-secondary={Color === Shared.Colors.PRIMARY} class:border-accent={Color === Shared.Colors.SECONDARY}>
									<input
										style="border-radius: 0px;"
										class="input input-bordered flex-[1]"
										class:input-primary={Color === Shared.Colors.ACCENT}
										class:input-secondary={Color === Shared.Colors.PRIMARY}
										class:input-accent={Color === Shared.Colors.SECONDARY}
										placeholder="Value..."
										type="number"
										value={extractFilterParameter(FilterParam.VALUE, andFo)}
										on:input={(e) => handleFilterOptionChange(orIndex, andIndex, undefined, undefined, e.currentTarget.value, undefined, undefined)}
									/>
								</div>
							{:else if (IsColumnDropdownType || ColumnType === 'unique' || ColumnType === 'repetitive') && extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.MultiSelectFilterType.CONTAINING}
								<div class="flex-[1] join-item bg-accent w-full min-h-[48px] border-none">
									<Select
										items={selectOptions}
										value={getSelectedValues(andFo)}
										placeholder="Value..."
										multiple={extractFilterParameter(FilterParam.FILTER_TYPE, andFo) === Shared.MultiSelectFilterType.CONTAINING}
										on:change={(e) => handleFilterOptionChange(orIndex, andIndex, undefined, undefined, undefined, e.detail, undefined)}
										on:clear={(e) => handleFilterOptionChange(orIndex, andIndex, undefined, undefined, undefined, undefined, e.detail)}
										floatingConfig={{
											strategy: 'fixed'
										}}
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
							{/if}
							<span
								class="join-item w-fit min-h-fit flex justify-center"
								class:bg-primary={Color === Shared.Colors.ACCENT}
								class:bg-secondary={Color === Shared.Colors.PRIMARY}
								class:bg-accent={Color === Shared.Colors.SECONDARY}
								class:text-primary={GetNextColor(Color) === Shared.Colors.ACCENT}
								class:text-secondary={GetNextColor(Color) === Shared.Colors.PRIMARY}
								class:text-accent={GetNextColor(Color) === Shared.Colors.SECONDARY}
							>
								<button
									class="join-item btn btn-ghost self-center"
									on:click={() => {
										UpdateCreatedFilterOptions(
											TableColumnStruct.split(' ')[0],
											FilterOptions.map((value, index) => {
												let newValue = value
												if (index === orIndex) {
													newValue = newValue.filter((_, i) => i !== andIndex)
												}
												return newValue
											})
										)
									}}
								>
									<Icon type="mdi:delete" color={GetNextColor(GetNextColor(Color))} />
								</button>
							</span>
						</div>
						{#if andIndex < orFo.length - 1}
							<div class=" border-l-4 border-r-4 rounded-none" class:border-primary={Color === Shared.Colors.ACCENT} class:border-secondary={Color === Shared.Colors.PRIMARY} class:border-accent={Color === Shared.Colors.SECONDARY}>
								<div class="divider" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>and</div>
							</div>
						{/if}
					{/each}
				</div>
				{#if orIndex < FilterOptions.length - 1}
					<div class="divider" class:bg-primary-text={Color === Shared.Colors.PRIMARY} class:bg-secondary-text={Color === Shared.Colors.SECONDARY} class:bg-accent-text={Color === Shared.Colors.ACCENT}>or</div>
				{/if}
			{/each}
		{:else}
			<div class="self-center p-5 text-sm" class:text-primary={Color === Shared.Colors.ACCENT} class:text-secondary={Color === Shared.Colors.PRIMARY} class:tootextltip-accent={Color === Shared.Colors.SECONDARY}>Click the "+" button at the top right to add a new "or" filter option...</div>
		{/if}
	</main>
</div>

<style>
	.select:focus {
		outline-style: none;
		outline-width: 0px;
		outline-offset: 0px;
	}
</style>
