<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DATA_ENTRY_MANDATORY, Shared } from '$lib/constants'
	import { ToastType, ToastMessage } from '$lib/stores'

	export let FieldGroupStruct: string
	export let UpdateTemplateFieldGroupStruct: (key: string, value: string) => void

    let fieldGroupMandatory: boolean
	const setFieldGroupMandatory = (value: boolean) => (fieldGroupMandatory = value)

	function handleUpdateFieldGroupValidation() {
        if (fieldGroupMandatory) {
			if (!DATA_ENTRY_MANDATORY.test(FieldGroupStruct)) {
				FieldGroupStruct = `${FieldGroupStruct} dataentrymandatory=true&#`
			}
		} else {
			if (DATA_ENTRY_MANDATORY.test(FieldGroupStruct)) {
				let struct = FieldGroupStruct.split(' ') as string[]
				struct = struct.filter((value) => !DATA_ENTRY_MANDATORY.test(value))
				FieldGroupStruct = struct.join(' ')
			}
		}
		UpdateTemplateFieldGroupStruct(`${FieldGroupStruct.split(' ')[0]}.struct`, FieldGroupStruct)
		$ToastType = Shared.ToastType.INFO
		$ToastMessage = `${FieldGroupStruct.split(" ")[1] === "unique" || FieldGroupStruct.split(" ")[1] === "repetitive" ? 'group' : 'field'} validation updated`
    }

    $: if (FieldGroupStruct) {
		if (DATA_ENTRY_MANDATORY.test(FieldGroupStruct)) {
			setFieldGroupMandatory(true)
		} else {
			setFieldGroupMandatory(false)
		}
	}
</script>

<section class="flex flex-col space-y-1 shadow-md shadow-gray-800 rounded-md bg-accent bg-opacity-50 p-1">
	<header class="flex space-x-1">
		<h1 class="flex-[8] text-lg text-primary">Field/group validation</h1>
		<button
			class="btn btn-ghost btn-secondary w-fit h-fit p-0"
			on:click={(e) => {
				e.preventDefault()
				handleUpdateFieldGroupValidation()
			}}
		>
			<Icon type="mdi:content-save" color={Shared.Colors.SECONDARY} />
		</button>
	</header>
	<div class="divider" />
	<main class="flex flex-col space-y-1">
		<div class="flex justify-between">
            <div class="flex justify-between flex-[9]">
                <span class="label-text text-primary text-lg">{FieldGroupStruct.split(" ")[1] === "unique" || FieldGroupStruct.split(" ")[1] === "repetitive" ? 'group' : 'field'} mandatory?</span>
            </div>
            <input type="checkbox" class="checkbox checkbox-primary" bind:checked={fieldGroupMandatory} />
        </div>
	</main>
</section>
