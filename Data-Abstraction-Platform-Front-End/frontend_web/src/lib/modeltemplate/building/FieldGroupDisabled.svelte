<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DISABLED_REGEX_SEARCH, Shared } from '$lib/constants'
	import { ToastType, ToastMessage } from '$lib/stores'

	export let FieldStruct: string
	export let UpdateTemplateFieldGroupStruct: (key: string, value: string) => void

	let fieldGroupDisabled: boolean
	const setFieldGroupDisabled = (value: boolean) => (fieldGroupDisabled = value)
	function handleUpdateFieldGroupDisabledStatus() {
		if (fieldGroupDisabled) {
			if (!DISABLED_REGEX_SEARCH.test(FieldStruct)) {
				FieldStruct = `${FieldStruct} disabled=true&#`
			}
		} else {
			if (DISABLED_REGEX_SEARCH.test(FieldStruct)) {
				let struct = FieldStruct.split(' ') as string[]
				struct = struct.filter((value) => !DISABLED_REGEX_SEARCH.test(value))
				FieldStruct = struct.join(' ')
			}
		}
		UpdateTemplateFieldGroupStruct(`${FieldStruct.split(' ')[0]}.struct`, FieldStruct)
		$ToastType = Shared.ToastType.INFO
		$ToastMessage = 'Disabled status updated'
	}

	$: if (FieldStruct.length > 1) {
		setFieldGroupDisabled(false)
		if (DISABLED_REGEX_SEARCH.test(FieldStruct)) {
			setFieldGroupDisabled(true)
		} else {
			setFieldGroupDisabled(false)
		}
	}
</script>

<section class="flex flex-col space-y-1 shadow-md shadow-gray-800 rounded-md bg-accent bg-opacity-50 p-1">
	<header class="flex space-x-1">
		<h1 class="flex-[8] text-lg text-primary">Field/group disabled status</h1>
		<button
			class="btn btn-ghost btn-secondary w-fit h-fit p-0"
			on:click={(e) => {
				e.preventDefault()
				handleUpdateFieldGroupDisabledStatus()
			}}
		>
			<Icon type="mdi:content-save" color={Shared.Colors.SECONDARY} />
		</button>
	</header>
	<div class="divider" />
	<main>
		<label class="label cursor-pointer">
			<span class="label-text">Disabled?</span>
			<input type="checkbox" class="checkbox checkbox-primary" bind:checked={fieldGroupDisabled} />
		</label>
	</main>
</section>
