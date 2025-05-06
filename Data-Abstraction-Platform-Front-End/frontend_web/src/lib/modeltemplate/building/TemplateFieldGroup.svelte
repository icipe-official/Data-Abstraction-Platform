<script lang="ts">
	import { NAME_REGEX_SEARCH, Shared } from '$lib/constants'
	import Icon from '$lib/components/Icon.svelte'
	import type { ITemplateStructValue } from '$lib/interface'
	import { GetNextColor2 } from '$lib/utils'

	export let AddFieldDialogId: string | undefined = undefined
	export let AddGroupDialogId: string | undefined = undefined
	export let Color: Shared.Colors
	export let FieldGroupStruct: string
	export let FieldGroup: ITemplateStructValue
	export let UpdateCurrentFieldGroup: (newFieldGroupStruct: string, field: boolean, group: boolean, newFieldGroupValue?:object | object[]) => void
	export let DeleteTemplateFieldGroup: (key: string) => void
	export let SetCopiedFieldGRoup: (value: ITemplateStructValue) => void
	export let index: number
	export let groupLength: number
	export let UniqueGroupBasePath: string
	export let HandleReoderFieldGroup: (currentGroupPath: string, direction: number, currentIndex: number, currentFieldGroupPath: string) => void

	let fieldGroupName: string = ''
	const setFieldGroupName = (value: string) => (fieldGroupName = value)
	$: if (FieldGroupStruct) {
		const nameExtract = NAME_REGEX_SEARCH.exec(FieldGroupStruct)
		if (nameExtract) setFieldGroupName(nameExtract[1])
		else setFieldGroupName(FieldGroupStruct.split(' ')[0].split('.').at(-1) as string)
	}
</script>

<div class="mt-1 w-fit flex space-x-1 text-lg" style="color: {Color};">
	<button
		class="link link-hover h-fit"
		on:click={() => {
			UpdateCurrentFieldGroup(FieldGroupStruct, AddFieldDialogId ? true : false, AddGroupDialogId ? true : false, Array.isArray(FieldGroup.value) ? FieldGroup.value : undefined)
			//@ts-expect-error
			document.getElementById(AddFieldDialogId ? AddFieldDialogId : AddGroupDialogId ? AddGroupDialogId : '').showModal()
		}}
	>
		{fieldGroupName}
	</button>
	{#if FieldGroupStruct.split(' ')[1] === 'repetitive'}
		<span class="h-fit" style="color: {GetNextColor2(Color)};">(GR)</span>
	{:else if FieldGroupStruct.split(' ')[1] === 'unique'}
		<span class="h-fit" style="color: {GetNextColor2(Color)};">(GU)</span>
	{/if}
	<span class="join w-fit h-fit">
		<button class="join-item btn btn-ghost bg-neutral h-fit w-fit p-0" on:click={() => SetCopiedFieldGRoup(FieldGroup)}>
			<Icon type="mdi:content-copy" iconSize="20" />
		</button>
		<button class="join-item btn btn-ghost bg-error h-fit w-fit p-0" on:click={() => DeleteTemplateFieldGroup(FieldGroupStruct.split(' ')[0])}>
			<Icon type="mdi:delete" iconSize="20" />
		</button>
		{#if index > 0}
			<button class="join-item btn btn-ghost bg-secondary h-fit w-fit p-0" on:click={() => HandleReoderFieldGroup(UniqueGroupBasePath, -1, index, FieldGroupStruct.split(' ')[0].replaceAll('[x]', '[0]'))}>
				<Icon type="mdi:chevron-up" iconSize="20" />
			</button>
		{/if}
		{#if index < groupLength - 1}
			<button class="join-item btn btn-ghost bg-secondary h-fit w-fit p-0" on:click={() => HandleReoderFieldGroup(UniqueGroupBasePath, +1, index, FieldGroupStruct.split(' ')[0].replaceAll('[x]', '[0]'))}>
				<Icon type="mdi:chevron-down" iconSize="20" />
			</button>
		{/if}
	</span>
</div>
