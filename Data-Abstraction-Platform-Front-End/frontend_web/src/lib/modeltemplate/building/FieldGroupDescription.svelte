<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DESC_REGEX_SEARCH, DISALLOWED_CHARACTERS_REGEX_SEARCH, Shared } from '$lib/constants'
	import { ToastMessage, ToastType } from '$lib/stores'

	export let FieldStruct: string
	export let UpdateTemplateFieldGroupStruct: (key: string, value: string) => void

	let fieldGroupDescription: string = ''
	const setFieldGroupDescription = (value: string) => (fieldGroupDescription = value)
	function handleInputFieldGroupDescription(value: string) {
		fieldGroupDescription = value.replaceAll(DISALLOWED_CHARACTERS_REGEX_SEARCH, '')
	}

	function handleUpdateFieldGroupDescription() {
		const newDescription = fieldGroupDescription.length > 0 ? `desc=${fieldGroupDescription}&#` : ''
		if (DESC_REGEX_SEARCH.test(FieldStruct)) {
			FieldStruct = FieldStruct.replace(DESC_REGEX_SEARCH, newDescription)
		} else {
			FieldStruct = `${FieldStruct} ${newDescription}`
		}
		UpdateTemplateFieldGroupStruct(`${FieldStruct.split(' ')[0]}.struct`, FieldStruct.trim())
		$ToastType = Shared.ToastType.INFO
		$ToastMessage = 'Description updated'
	}

	$: if (FieldStruct.length > 1) {
		setFieldGroupDescription('')
		const descExtract = DESC_REGEX_SEARCH.exec(FieldStruct)
		if (descExtract) setFieldGroupDescription(descExtract[1])
	}
</script>

<section class="flex flex-col space-y-1 shadow-md shadow-gray-900 rounded-md bg-accent bg-opacity-50 p-1">
	<header class="flex space-x-1">
		<h1 class="flex-[8] text-lg text-primary">Field/group description</h1>
		<button
			class="btn btn-ghost btn-secondary w-fit h-fit p-0"
			on:click={(e) => {
				e.preventDefault()
				handleUpdateFieldGroupDescription()
			}}
		>
			<Icon type="mdi:content-save" color={Shared.Colors.SECONDARY} />
		</button>
	</header>
	<main>
		<textarea class="join-item textarea textarea-primary w-full max-h-[35vh]" placeholder="Describe this field/group..." on:input={(e) => handleInputFieldGroupDescription(e.currentTarget.value)} value={fieldGroupDescription} />
	</main>
</section>
