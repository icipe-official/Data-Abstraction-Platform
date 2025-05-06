<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DISALLOWED_CHARACTERS_REGEX_SEARCH, NAME_REGEX_SEARCH, SPECIAL_CHARS_REGEX_SEARCH, Shared } from '$lib/constants'
	import type { ITemplateStructValue } from '$lib/interface'
	import { Loading, LoadingMessage, ToastMessage, ToastType } from '$lib/stores'
	import { GetNextColor2, GetValueInObject, Log, SetValueInObject } from '$lib/utils'
	import { inview, type Options } from 'svelte-inview'
	import { fade } from 'svelte/transition'

	const CURRENT_SECTION = 'Template'

	export let Color: Shared.Colors = Shared.Colors.PRIMARY
	export let UniqueGroupBasePath: string
	export let TemplateUniqueGroup: any
	export let CreateUpdateTemplateFieldGroup: (key: string, value: ITemplateStructValue | string) => void
	export let DeleteTemplateFieldGroup: (key: string) => void
	export let CopiedFieldGroup: ITemplateStructValue | null
	export let SetCopiedFieldGRoup: (value: ITemplateStructValue) => void
	export let HandleReoderFieldGroup: (currentGroupPath: string, direction: number, currentIndex: number, currentFieldGroupPath: string) => void
	export let RootViewElement: HTMLElement | undefined = undefined
	export let GroupName: string

	let UNIQUE_DIALOG_ID: string
	try {
		UNIQUE_DIALOG_ID = self.crypto.randomUUID()
		if (!UNIQUE_DIALOG_ID || UNIQUE_DIALOG_ID.length < 1) UNIQUE_DIALOG_ID = (Date.now() + Math.floor(Math.random() * 20)).toString()
	} catch {
		UNIQUE_DIALOG_ID = (Date.now() + Math.floor(Math.random() * 20)).toString()
	}
	const ADD_FIELD_DIALOG_ID = `add-field-dialog-${UNIQUE_DIALOG_ID}`
	const ADD_GROUP_DIALOG_ID = `add-group-dialog-${UNIQUE_DIALOG_ID}`

	let currentFieldName: string = ''
	let currentFieldType: string = ''
	let currentFieldUi: string = ''
	let currentFieldError: string[] = []
	function handleInputField(name: string | undefined, type: string | undefined, ui: string | undefined) {
		if (name) {
			currentFieldName = name.replaceAll(DISALLOWED_CHARACTERS_REGEX_SEARCH, '').replaceAll('\n', '')
		}
		if (type) {
			currentFieldType = type
			currentFieldUi = ''
		}
		if (ui) {
			currentFieldUi = ui
		}
	}
	function handleCreateField() {
		currentFieldError = []
		let isValid = true
		if (currentFieldName.length < 2) {
			currentFieldError.push('1-Give this new field a name...')
			isValid = false
		}
		if (currentFieldType.length < 4) {
			currentFieldError.push('2-Choose the field type...')
			isValid = false
		}
		if (currentFieldUi.length < 4) {
			currentFieldError.push('3-Choose the ui for the field...')
			isValid = false
		}
		if (!isValid) return
		let value: string[] | number[] | string | number
		if (currentFieldUi === 'multiselect') value = []
		else if (currentFieldType === 'text') value = ''
		else if (currentFieldType === 'number') value = 0
		else {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Cannot not set default value for field'
			return
		}
		let newPath = `${UniqueGroupBasePath}.${currentFieldName.toLocaleLowerCase().replaceAll(SPECIAL_CHARS_REGEX_SEARCH, '_')}`.trim()
		if (newPath.lastIndexOf('_') === newPath.length - 1) newPath = newPath.substring(0, newPath.lastIndexOf('_'))
		if (/^\d+$/.test(currentFieldName)) {
			newPath = newPath + '_'
		}
		CreateUpdateTemplateFieldGroup(newPath, { struct: `${newPath} ${currentFieldType} ${currentFieldUi} name=${currentFieldName}&#`, value })
		clearFieldGroupStruct()
	}

	let currentGroupName: string = ''
	let currentGroupType: string = ''
	let currentGroupError: string[] = []
	function handleInputGroup(name: string | undefined, type: string | undefined) {
		if (name) {
			currentGroupName = name.replaceAll(DISALLOWED_CHARACTERS_REGEX_SEARCH, '').replaceAll('\n', '')
		}
		if (type) {
			currentGroupType = type
		}
	}
	function handleCreateGroup() {
		currentGroupError = []
		let isValid = true
		if (currentGroupName.length < 2) {
			currentGroupError.push('1-Give this new group a name...')
			isValid = false
		}
		if (currentGroupType.length < 4) {
			currentGroupError.push('2-Choose the group type...')
			isValid = false
		}
		if (!isValid) return
		let value: object[] | object
		if (currentGroupType === 'unique') value = {}
		else if (currentGroupType === 'repetitive') value = [{}]
		else {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Cannot not set default value for group'
			return
		}
		let newPath = `${UniqueGroupBasePath}.${currentGroupName.toLocaleLowerCase().replaceAll(SPECIAL_CHARS_REGEX_SEARCH, '_')}`
		if (newPath.lastIndexOf('_') === newPath.length - 1) newPath = newPath.substring(0, newPath.lastIndexOf('_'))
		if (/^\d+$/.test(currentGroupName)) {
			newPath = newPath + '_'
		}
		CreateUpdateTemplateFieldGroup(newPath, { struct: `${newPath} ${currentGroupType} name=${currentGroupName}&#`, value })
		clearFieldGroupStruct()
	}

	let currentFieldGroupStruct: string | undefined = undefined
	let currentFieldGroupValue: object | object[] | undefined = undefined
	function UpdateCurrentFieldGroup(newFieldGroupStruct: string, field: boolean, group: boolean, newFieldGroupValue?: object | object[]) {
		clearFieldGroupStruct()
		currentFieldGroupStruct = newFieldGroupStruct
		if (!currentFieldGroupStruct) return
		if (field) {
			currentFieldName = currentFieldGroupStruct.split(' ')[0].split('.').at(-1) as string
			currentFieldType = currentFieldGroupStruct.split(' ')[1]
			currentFieldUi = currentFieldGroupStruct.split(' ')[2]
		}
		if (group) {
			currentGroupName = currentFieldGroupStruct.split(' ')[0].split('.').at(-1) as string
			currentGroupType = currentFieldGroupStruct.split(' ')[1]
			currentFieldGroupValue = newFieldGroupValue
		}
	}
	function clearFieldGroupStruct() {
		currentFieldName = ''
		currentFieldType = ''
		currentFieldUi = ''
		currentGroupName = ''
		currentGroupType = ''
		currentFieldGroupStruct = undefined
		currentFieldGroupValue = undefined
	}

	function HandleUpdateTemplateFieldGroupStruct(key: string, value: string) {
		currentFieldGroupStruct = value
		CreateUpdateTemplateFieldGroup(key, value)
	}

	function handlePasteFieldGroup() {
		$Loading = true
		$LoadingMessage = 'Pasting Field/Group...'
		if (CopiedFieldGroup === null) return
		let currentFieldGroupStruct = CopiedFieldGroup.struct.split(' ')
		const baseFieldGroupStruct = currentFieldGroupStruct[1] === 'unique' ? `${currentFieldGroupStruct[0]}.value` : currentFieldGroupStruct[1] === 'repetitive' ? `${currentFieldGroupStruct[0]}.value[x]` : currentFieldGroupStruct[0].substring(0, currentFieldGroupStruct[0].lastIndexOf('.'))
		if (currentFieldGroupStruct[1] !== 'repetitive' && currentFieldGroupStruct[1] !== 'unique') {
			currentFieldGroupStruct[0] = currentFieldGroupStruct[0].replace(baseFieldGroupStruct, UniqueGroupBasePath.replaceAll('[0]', '[x]'))
			CopiedFieldGroup.struct = currentFieldGroupStruct.join(' ')
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, `${baseFieldGroupStruct} -> ${UniqueGroupBasePath.replaceAll('[0]', '[x]')}`)
		if (currentFieldGroupStruct[1] === 'repetitive' || currentFieldGroupStruct[1] === 'unique') {
			handleUpdateCopiedFieldGroupStructPath(currentFieldGroupStruct[1] === 'repetitive' ? 'value[0]' : 'value', baseFieldGroupStruct)
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, CopiedFieldGroup, 'Field/Group after struct update')
		if (currentFieldGroupStruct[1] === 'repetitive' || currentFieldGroupStruct[1] === 'unique') {
			const CopiedFieldGroupValue = currentFieldGroupStruct[1] === 'repetitive' ? (CopiedFieldGroup as any)['value'][0] : (CopiedFieldGroup as any)['value']
			Object.keys(CopiedFieldGroupValue).forEach((fg) => {
				CreateUpdateTemplateFieldGroup((CopiedFieldGroupValue[fg]['struct'] as string).split(' ')[0].replaceAll('[x]', '[0]'), CopiedFieldGroupValue[fg])
			})
		} else {
			CreateUpdateTemplateFieldGroup(currentFieldGroupStruct[0].replaceAll('[x]', '[0]'), CopiedFieldGroup)
		}
		CopiedFieldGroup = null
		$Loading = false
		$LoadingMessage = null
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, TemplateUniqueGroup, 'Updated section')
	}

	function handleUpdateCopiedFieldGroupStructPath(currentPath: string, fieldGroupPathToReplace: string) {
		if (CopiedFieldGroup === null) return
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, currentPath)
		const fieldGroup = GetValueInObject(CopiedFieldGroup, currentPath)
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, fieldGroup, currentPath)
		Object.keys(fieldGroup).forEach((fg) => {
			let fgStruct = (fieldGroup[fg].struct as string).split(' ')
			fgStruct[0] = fgStruct[0].replace(fieldGroupPathToReplace, UniqueGroupBasePath.replaceAll('[0]', '[x]'))
			Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, `${fieldGroupPathToReplace} -> ${fgStruct[0]}`)
			CopiedFieldGroup = SetValueInObject(CopiedFieldGroup, `${currentPath}.${fg}.struct`, fgStruct.join(' '))
			if (typeof fieldGroup[fg].value === 'object' || (Array.isArray(fieldGroup[fg].value) && typeof fieldGroup[fg].value[0] === 'object')) {
				handleUpdateCopiedFieldGroupStructPath(Array.isArray(fieldGroup[fg].value) && typeof fieldGroup[fg].value[0] === 'object' ? `${currentPath}.${fg}.value[0]` : `${currentPath}.${fg}.value`, fieldGroupPathToReplace)
			}
		})
	}

	const inViewOptions: Options = {
		root: RootViewElement,
		rootMargin: '80%',
		threshold: [0, 0.25, 0.5, 0.75, 1]
	}

	/**
	 * Array of booleans that tracks the view status of Template Groups
	 */
	let groupViewTracker: boolean[] = Object.keys(TemplateUniqueGroup).map(() => false)
	const handleViewChange = (index: number, { detail }: CustomEvent<ObserverEventDetails>) => (groupViewTracker[index] = detail.inView)
	function getGroupName(struct: string) {
		const nameExtract = NAME_REGEX_SEARCH.exec(struct)
		if (nameExtract) {
			return nameExtract[1]
		} else {
			return struct.split(' ')[0].split('.').at(-1) as string
		}
	}
	let showGroupName = false
</script>

<div class="w-full h-fit border-l-4 pl-1 border-dotted space-y-2" style="border-color: {Color};" in:fade={{ delay: 300, duration: 350 }}>
	{#each Object.keys(TemplateUniqueGroup) as key, index}
		{#if typeof TemplateUniqueGroup[key]['value'] === 'string' || typeof TemplateUniqueGroup[key]['value'] === 'number' || TemplateUniqueGroup[key]['struct'].split(' ')[2] === 'multiselect'}
			{#await import('./TemplateFieldGroup.svelte')}
				<div class="w-full h-fit self-center flex flex-col">
					<div class="w-fit h-fit self-center">
						<span class="loading loading-ball loading-sm text-accent" />
						<span class="loading loading-ball loading-md text-secondary" />
						<span class="loading loading-ball loading-lg text-primary" />
					</div>
				</div>
			{:then TemplateFieldGroup}
				<TemplateFieldGroup.default
					AddFieldDialogId={ADD_FIELD_DIALOG_ID}
					{Color}
					FieldGroupStruct={TemplateUniqueGroup[key]['struct']}
					{UpdateCurrentFieldGroup}
					{DeleteTemplateFieldGroup}
					FieldGroup={JSON.parse(JSON.stringify(TemplateUniqueGroup[key]))}
					{SetCopiedFieldGRoup}
					{index}
					groupLength={Object.keys(TemplateUniqueGroup).length}
					{HandleReoderFieldGroup}
					{UniqueGroupBasePath}
				/>
			{:catch}
				<div class="w-full h-fit flex justify-center bg-gray-400">
					<div class="w-fit h-fit self-center flex flex-col">
						<div class="text-lg text-white">Network error...</div>
					</div>
				</div>
			{/await}
		{:else if TemplateUniqueGroup[key]['struct'].split(' ')[1] === 'unique'}
			{#await import('./TemplateFieldGroup.svelte')}
				<div class="w-full h-fit self-center flex flex-col">
					<div class="w-fit h-fit self-center">
						<span class="loading loading-ball loading-sm text-accent" />
						<span class="loading loading-ball loading-md text-secondary" />
						<span class="loading loading-ball loading-lg text-primary" />
					</div>
				</div>
			{:then TemplateFieldGroup}
				<TemplateFieldGroup.default
					AddGroupDialogId={ADD_GROUP_DIALOG_ID}
					{Color}
					FieldGroupStruct={TemplateUniqueGroup[key]['struct']}
					{UpdateCurrentFieldGroup}
					{DeleteTemplateFieldGroup}
					FieldGroup={JSON.parse(JSON.stringify(TemplateUniqueGroup[key]))}
					{SetCopiedFieldGRoup}
					{index}
					groupLength={Object.keys(TemplateUniqueGroup).length}
					{HandleReoderFieldGroup}
					{UniqueGroupBasePath}
				/>
			{:catch}
				<div class="w-full h-fit flex justify-center bg-gray-400">
					<div class="w-fit h-fit self-center flex flex-col">
						<div class="text-lg text-white">Network error...</div>
					</div>
				</div>
			{/await}
			<div use:inview={inViewOptions} on:inview_change={(e) => handleViewChange(index, e)}>
				{#if groupViewTracker[index] && RootViewElement}
					<svelte:self
						TemplateUniqueGroup={TemplateUniqueGroup[key]['value']}
						UniqueGroupBasePath={`${UniqueGroupBasePath}.${key}.value`}
						{CreateUpdateTemplateFieldGroup}
						{DeleteTemplateFieldGroup}
						Color={GetNextColor2(Color)}
						{CopiedFieldGroup}
						{SetCopiedFieldGRoup}
						{HandleReoderFieldGroup}
						{RootViewElement}
						GroupName={getGroupName(TemplateUniqueGroup[key]['struct'])}
					/>
				{/if}
			</div>
		{:else if TemplateUniqueGroup[key]['struct'].split(' ')[1] === 'repetitive'}
			{#await import('./TemplateFieldGroup.svelte')}
				<div class="w-full h-fit self-center flex flex-col">
					<div class="w-fit h-fit self-center">
						<span class="loading loading-ball loading-sm text-accent" />
						<span class="loading loading-ball loading-md text-secondary" />
						<span class="loading loading-ball loading-lg text-primary" />
					</div>
				</div>
			{:then TemplateFieldGroup}
				<TemplateFieldGroup.default
					AddGroupDialogId={ADD_GROUP_DIALOG_ID}
					{Color}
					FieldGroupStruct={TemplateUniqueGroup[key]['struct']}
					{UpdateCurrentFieldGroup}
					{DeleteTemplateFieldGroup}
					FieldGroup={JSON.parse(JSON.stringify(TemplateUniqueGroup[key]))}
					{SetCopiedFieldGRoup}
					{index}
					groupLength={Object.keys(TemplateUniqueGroup).length}
					{HandleReoderFieldGroup}
					{UniqueGroupBasePath}
				/>
			{:catch}
				<div class="w-full h-fit flex justify-center bg-gray-400">
					<div class="w-fit h-fit self-center flex flex-col">
						<div class="text-lg text-white">Network error...</div>
					</div>
				</div>
			{/await}
			<div use:inview={inViewOptions} on:inview_change={(e) => handleViewChange(index, e)}>
				{#if groupViewTracker[index] && RootViewElement}
					{#each TemplateUniqueGroup[key]['value'] as repetitiveGroupValues, index}
						<svelte:self
							TemplateUniqueGroup={repetitiveGroupValues}
							UniqueGroupBasePath={`${UniqueGroupBasePath}.${key}.value[${index}]`}
							{CreateUpdateTemplateFieldGroup}
							{DeleteTemplateFieldGroup}
							Color={GetNextColor2(Color)}
							{CopiedFieldGroup}
							{SetCopiedFieldGRoup}
							{HandleReoderFieldGroup}
							{RootViewElement}
							GroupName={getGroupName(TemplateUniqueGroup[key]['struct'])}
						/>
					{/each}
				{/if}
			</div>
		{:else}
			<div>Invalid Field/Group!!</div>
		{/if}
	{/each}
	<footer
		class="w-full flex flex-col"
		on:mouseenter={() => {
			showGroupName = true
		}}
		on:mouseleave={() => {
			showGroupName = false
		}}
	>
		<div class="join w-full max-w-[80%]">
			<button
				class="join-item flex-1 btn btn-regular h-fit btn-primary flex"
				on:click={() => {
					clearFieldGroupStruct()
					//@ts-expect-error
					document.getElementById(ADD_FIELD_DIALOG_ID).showModal()
				}}
			>
				<span class="h-fit self-center"><Icon type="mdi:plus" color={Shared.Colors.SECONDARY} /></span>
				<span class="h-fit self-center text-secondary">field</span>
			</button>
			<button
				class="join-item flex-1 btn btn-regular h-fit btn-secondary flex"
				on:click={() => {
					clearFieldGroupStruct()
					//@ts-expect-error
					document.getElementById(ADD_GROUP_DIALOG_ID).showModal()
				}}
			>
				<span class="h-fit self-center"><Icon type="mdi:plus" color={Shared.Colors.PRIMARY} /></span>
				<span class="h-fit self-center text-primary">group</span>
			</button>
			{#if CopiedFieldGroup !== null}
				<button class="join-item btn btn-regular w-fit h-fit btn-neutral flex" on:click={handlePasteFieldGroup}>
					<span class="h-fit self-center"><Icon type="mdi:content-paste" color={Shared.Colors.ACCENT} /></span>
				</button>
			{/if}
		</div>
		<div class="relative w-full max-w-[80%]">
			{#if showGroupName}
				<div class="absolute top-0 bg-primary bg-primary-text p-1 rounded-md shadow-md shadow-gray-800 text-center w-full" in:fade out:fade>
					{GroupName}
				</div>
			{/if}
		</div>
	</footer>
</div>

<!-- Add field dialog -->
<dialog id={ADD_FIELD_DIALOG_ID} class="modal">
	<form method="dialog" class="modal-box p-0 rounded min-w-[150px] overflow-hidden">
		<header class="sticky flex justify-between bg-accent items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
			<div class="text-lg text-primary">{currentFieldGroupStruct ? 'Update' : 'Add'} field</div>
			<button class="btn btn-circle btn-ghost flex justify-center"><Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} /></button>
		</header>
		<main class="p-2 space-y-2 overflow-x-hidden overflow-y-auto max-h-[70vh]">
			<div class="form-control">
				<div class="join join-vertical">
					<input class="join-item input input-primary w-full font-bold" placeholder="Enter field name..." value={currentFieldName} on:input={(e) => handleInputField(e.currentTarget.value, undefined, undefined)} class:input-disabled={currentFieldGroupStruct !== undefined} />
					<select class="join-item select select-primary w-full" on:change={(e) => handleInputField(undefined, e.currentTarget.value, undefined)} class:select-disabled={currentFieldGroupStruct !== undefined}>
						<option disabled selected={currentFieldType === ''} value="">Choose field type..</option>
						<option selected={currentFieldType === 'text'} value="text">Text</option>
						<option selected={currentFieldType === 'number'} value="number">Number</option>
					</select>
					<select class="join-item select select-primary w-full" on:change={(e) => handleInputField(undefined, undefined, e.currentTarget.value)} class:select-disabled={currentFieldGroupStruct !== undefined}>
						<option disabled selected={currentFieldUi === ''} value="">Choose user interface..</option>
						{#if currentFieldType === 'text'}
							<option selected={currentFieldUi === 'text'} value="text">Text</option>
							<option selected={currentFieldUi === 'textarea'} value="textarea">Textarea</option>
						{/if}
						{#if currentFieldType === 'number'}
							<option selected={currentFieldUi === 'number'} value="number">Number</option>
						{/if}
						<option selected={currentFieldUi === 'select'} value="select">Select</option>
						<option selected={currentFieldUi === 'multiselect'} value="multiselect">multi-select</option>
						<option selected={currentFieldUi === 'datetime'} value="datetime">Date Time</option>
					</select>
				</div>
				{#if currentFieldError.length > 0}
					<div class="flex flex-col">
						{#each currentFieldError as cfe}
							<div class="label-text text-error">{cfe}</div>
						{/each}
					</div>
				{/if}
			</div>
			{#if currentFieldGroupStruct}
				{#await import('./FieldGroupName.svelte')}
					<div class="w-full h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
					</div>
				{:then FieldGroupName}
					<FieldGroupName.default FieldStruct={currentFieldGroupStruct} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
				{:catch}
					<div class="w-full h-fit flex justify-center bg-gray-400">
						<div class="w-fit h-fit self-center flex flex-col">
							<div class="text-lg text-white">Network error...</div>
						</div>
					</div>
				{/await}
				{#await import('./FieldGroupDescription.svelte')}
					<div class="w-full h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
					</div>
				{:then FieldGroupDescription}
					<FieldGroupDescription.default FieldStruct={currentFieldGroupStruct} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
				{:catch}
					<div class="w-full h-fit flex justify-center bg-gray-400">
						<div class="w-fit h-fit self-center flex flex-col">
							<div class="text-lg text-white">Network error...</div>
						</div>
					</div>
				{/await}
				{#await import('./FieldGroupDisabled.svelte')}
					<div class="w-full h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
					</div>
				{:then FieldGroupDisabled}
					<FieldGroupDisabled.default FieldStruct={currentFieldGroupStruct} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
				{:catch}
					<div class="w-full h-fit flex justify-center bg-gray-400">
						<div class="w-fit h-fit self-center flex flex-col">
							<div class="text-lg text-white">Network error...</div>
						</div>
					</div>
				{/await}
				{#await import('./FieldGroupValidation.svelte')}
					<div class="w-full h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
					</div>
				{:then FieldGroupDisabled}
					<FieldGroupDisabled.default FieldGroupStruct={currentFieldGroupStruct} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
				{:catch}
					<div class="w-full h-fit flex justify-center bg-gray-400">
						<div class="w-fit h-fit self-center flex flex-col">
							<div class="text-lg text-white">Network error...</div>
						</div>
					</div>
				{/await}
				{#if currentFieldUi === 'multiselect'}
					{#await import('./FieldGroupRendering.svelte')}
						<div class="w-full h-fit self-center flex flex-col">
							<div class="w-fit h-fit self-center">
								<span class="loading loading-ball loading-sm text-accent" />
								<span class="loading loading-ball loading-md text-secondary" />
								<span class="loading loading-ball loading-lg text-primary" />
							</div>
						</div>
					{:then FieldGroupRendering}
						<FieldGroupRendering.default FieldGroupStruct={currentFieldGroupStruct} FieldGroupValue={[]} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
					{/await}
				{/if}
			{/if}
			{#if currentFieldGroupStruct && (currentFieldUi === 'select' || currentFieldUi === 'multiselect')}
				{#await import('./MultiSelect.svelte')}
					<div class="w-full h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
					</div>
				{:then MultiSelect}
					<MultiSelect.default FieldStruct={currentFieldGroupStruct} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
				{:catch}
					<div class="w-full h-fit flex justify-center bg-gray-400">
						<div class="w-fit h-fit self-center flex flex-col">
							<div class="text-lg text-white">Network error...</div>
						</div>
					</div>
				{/await}
			{:else if currentFieldGroupStruct && currentFieldUi === 'datetime'}
				{#await import('./DateTime.svelte')}
					<div class="w-full h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
					</div>
				{:then DateTime}
					<DateTime.default FieldStruct={currentFieldGroupStruct} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
				{:catch}
					<div class="w-full h-fit flex justify-center bg-gray-400">
						<div class="w-fit h-fit self-center flex flex-col">
							<div class="text-lg text-white">Network error...</div>
						</div>
					</div>
				{/await}
			{/if}
			{#if !currentFieldGroupStruct}
				<button
					class="btn btn-regular btn-primary text-secondary w-full"
					on:click={(e) => {
						e.preventDefault()
						handleCreateField()
					}}
				>
					<Icon type="mdi:content-save" color={Shared.Colors.SECONDARY} />field
				</button>
			{/if}
		</main>
	</form>
</dialog>

<!-- Add group dialog -->
<dialog id={ADD_GROUP_DIALOG_ID} class="modal">
	<form method="dialog" class="modal-box p-0 rounded min-w-[150px] overflow-hidden">
		<header class="sticky flex justify-between bg-accent items-center rounded-tr rounded-tl p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
			<div class="text-lg text-primary">{currentFieldGroupStruct ? 'Update' : 'Add'} group</div>
			<button class="btn btn-circle btn-ghost flex justify-center"><Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} /></button>
		</header>
		<main class="p-2 space-y-2 overflow-x-hidden overflow-y-auto max-h-[70vh]">
			<div class="form-control">
				<div class="join join-vertical">
					<input class="join-item input input-primary w-full font-bold" placeholder="Enter group name..." value={currentGroupName} on:input={(e) => handleInputGroup(e.currentTarget.value, undefined)} class:input-disabled={currentFieldGroupStruct !== undefined} />
					<select class="join-item select select-primary w-full" on:change={(e) => handleInputGroup(undefined, e.currentTarget.value)} class:select-disabled={currentFieldGroupStruct !== undefined}>
						<option disabled selected={currentGroupType === ''} value="">Choose group type..</option>
						<option selected={currentGroupType === 'unique'} value="unique">Unique</option>
						<option selected={currentGroupType === 'repetitive'} value="repetitive">Repetitive</option>
					</select>
				</div>
				{#if currentGroupError.length > 0}
					<div class="flex flex-col">
						{#each currentGroupError as cge}
							<div class="label-text text-error">{cge}</div>
						{/each}
					</div>
				{/if}
			</div>
			{#if currentFieldGroupStruct}
				{#await import('./FieldGroupName.svelte')}
					<div class="w-full h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
					</div>
				{:then FieldGroupName}
					<FieldGroupName.default FieldStruct={currentFieldGroupStruct} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
				{:catch}
					<div class="w-full h-fit flex justify-center bg-gray-400">
						<div class="w-fit h-fit self-center flex flex-col">
							<div class="text-lg text-white">Network error...</div>
						</div>
					</div>
				{/await}
				{#await import('./FieldGroupDescription.svelte')}
					<div class="w-full h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
					</div>
				{:then FieldGroupDescription}
					<FieldGroupDescription.default FieldStruct={currentFieldGroupStruct} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
				{:catch}
					<div class="w-full h-fit flex justify-center bg-gray-400">
						<div class="w-fit h-fit self-center flex flex-col">
							<div class="text-lg text-white">Network error...</div>
						</div>
					</div>
				{/await}
				{#await import('./FieldGroupDisabled.svelte')}
					<div class="w-full h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
					</div>
				{:then FieldGroupDisabled}
					<FieldGroupDisabled.default FieldStruct={currentFieldGroupStruct} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
				{:catch}
					<div class="w-full h-fit flex justify-center bg-gray-400">
						<div class="w-fit h-fit self-center flex flex-col">
							<div class="text-lg text-white">Network error...</div>
						</div>
					</div>
				{/await}
				{#await import('./FieldGroupValidation.svelte')}
					<div class="w-full h-fit self-center flex flex-col">
						<div class="w-fit h-fit self-center">
							<span class="loading loading-ball loading-sm text-accent" />
							<span class="loading loading-ball loading-md text-secondary" />
							<span class="loading loading-ball loading-lg text-primary" />
						</div>
					</div>
				{:then FieldGroupDisabled}
					<FieldGroupDisabled.default FieldGroupStruct={currentFieldGroupStruct} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
				{:catch}
					<div class="w-full h-fit flex justify-center bg-gray-400">
						<div class="w-fit h-fit self-center flex flex-col">
							<div class="text-lg text-white">Network error...</div>
						</div>
					</div>
				{/await}
				{#if Array.isArray(currentFieldGroupValue)}
					{#await import('./FieldGroupRendering.svelte')}
						<div class="w-full h-fit self-center flex flex-col">
							<div class="w-fit h-fit self-center">
								<span class="loading loading-ball loading-sm text-accent" />
								<span class="loading loading-ball loading-md text-secondary" />
								<span class="loading loading-ball loading-lg text-primary" />
							</div>
						</div>
					{:then FieldGroupRendering}
						<FieldGroupRendering.default FieldGroupStruct={currentFieldGroupStruct} FieldGroupValue={currentFieldGroupValue} UpdateTemplateFieldGroupStruct={HandleUpdateTemplateFieldGroupStruct} />
					{/await}
				{/if}
			{/if}
			{#if !currentFieldGroupStruct}
				<button
					class="btn btn-regular btn-secondary text-primary w-full"
					on:click={(e) => {
						e.preventDefault()
						handleCreateGroup()
					}}
				>
					<Icon type="mdi:content-save" color={Shared.Colors.PRIMARY} />group
				</button>
			{/if}
		</main>
	</form>
</dialog>
