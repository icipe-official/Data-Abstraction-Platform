<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DISALLOWED_CHARACTERS_REGEX_SEARCH, NAME_REGEX_SEARCH, Shared } from '$lib/constants'
	import { ToastType, ToastMessage } from '$lib/stores'

	export let FieldStruct: string
	export let UpdateTemplateFieldGroupStruct: (key: string, value: string) => void

	let fieldGroupName: string = ''
	const setFieldGroupName = (value: string) => (fieldGroupName = value)
	function handleInputFieldName(value: string) {
		fieldGroupName = value.replaceAll(DISALLOWED_CHARACTERS_REGEX_SEARCH, '')
	}

	function handleUpdateFieldGroupName() {
		const newName = fieldGroupName.length > 0 ? `name=${fieldGroupName}&#` : ''
		if (NAME_REGEX_SEARCH.test(FieldStruct)){
			FieldStruct = FieldStruct.replace(NAME_REGEX_SEARCH, newName)
		} else {
			FieldStruct = `${FieldStruct} ${newName}`
		}
		UpdateTemplateFieldGroupStruct(`${FieldStruct.split(' ')[0]}.struct`, FieldStruct)
		$ToastType = Shared.ToastType.INFO
		$ToastMessage = 'Name updated'
	}

	$: if (FieldStruct.length > 1) {
		setFieldGroupName('')
		const nameExtract = NAME_REGEX_SEARCH.exec(FieldStruct)
		if (nameExtract) setFieldGroupName(nameExtract[1])
	}
</script>

<section class="flex flex-col space-y-1 shadow-md shadow-gray-800 rounded-md bg-accent bg-opacity-50 p-1">
	<header class="flex space-x-1">
		<h1 class="flex-[8] text-lg text-primary">Field/group name</h1>
		<button
			class="btn btn-ghost btn-secondary w-fit h-fit p-0"
			on:click={(e) => {
				e.preventDefault()
				handleUpdateFieldGroupName()
			}}
		>
			<Icon type="mdi:content-save" color={Shared.Colors.SECONDARY} />
		</button>
	</header>
	<div class="divider" />
	<main>
		<input class="join-item input input-primary w-full" placeholder="Enter field name/group..." on:input={(e) => handleInputFieldName(e.currentTarget.value)} value={fieldGroupName} />
	</main>
</section>
