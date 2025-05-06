<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { MAX_EXTRACT, NAME_REGEX_SEARCH, RENDER_HORIZONTALLY_EXTRACT, Shared } from '$lib/constants'
	import { ToastType, ToastMessage } from '$lib/stores'
	import { CheckIfGroupIsEligibleForHorizontalRendering } from '$lib/utils'

	export let FieldGroupStruct: string
	export let FieldGroupValue: object[]
	export let UpdateTemplateFieldGroupStruct: (key: string, value: string) => void

	let fieldGroupMaxLength = -1
	const setFieldGroupMaxLength = (value: number) => (fieldGroupMaxLength = value)
	let renderFieldGroupHorizontally: boolean
	const setRenderFieldGroupHorizontally = (value: boolean) => (renderFieldGroupHorizontally = value)

	function handleUpdateFieldGroupRendering() {
		const newGroupMaxLength = fieldGroupMaxLength > 0 ? `max=${fieldGroupMaxLength}&#` : ''
		if (MAX_EXTRACT.test(FieldGroupStruct)){
			let struct = FieldGroupStruct.split(' ') as string[]
			struct = struct.filter((value) => !MAX_EXTRACT.test(value))
			FieldGroupStruct = struct.join(' ')
		}
		FieldGroupStruct = `${FieldGroupStruct} ${newGroupMaxLength}`
		if (renderFieldGroupHorizontally) {
			if (!RENDER_HORIZONTALLY_EXTRACT.test(FieldGroupStruct)) {
				FieldGroupStruct = `${FieldGroupStruct} renderhorizontally=true&#`
			}
		} else {
			if (RENDER_HORIZONTALLY_EXTRACT.test(FieldGroupStruct)) {
				let struct = FieldGroupStruct.split(' ') as string[]
				struct = struct.filter((value) => !RENDER_HORIZONTALLY_EXTRACT.test(value))
				FieldGroupStruct = struct.join(' ')
			}
		}
		UpdateTemplateFieldGroupStruct(`${FieldGroupStruct.split(' ')[0]}.struct`, FieldGroupStruct)
		$ToastType = Shared.ToastType.INFO
		$ToastMessage = 'Render settings updated'
	}

	let fieldGroupName = ''
	const setFieldGroupName = (value: string) => (fieldGroupName = value)
	$: if (FieldGroupStruct) {
		setFieldGroupMaxLength(-1)
		const fieldGroupMaxLengthExtract = MAX_EXTRACT.exec(FieldGroupStruct)
		if (fieldGroupMaxLengthExtract) setFieldGroupMaxLength(parseInt(fieldGroupMaxLengthExtract[1]))
		setRenderFieldGroupHorizontally(false)
		if (RENDER_HORIZONTALLY_EXTRACT.test(FieldGroupStruct)) {
			setRenderFieldGroupHorizontally(true)
		} else {
			setRenderFieldGroupHorizontally(false)
		}
		const nameExtract = NAME_REGEX_SEARCH.exec(FieldGroupStruct)
		if (nameExtract) setFieldGroupName(nameExtract[1])
		else setFieldGroupName(FieldGroupStruct.split(' ')[0].split('.').at(-1) as string)
	}

	let eligibleForHorizontalRendering = false
	const setEligibleForHorizontalRendering = (value: boolean) => (eligibleForHorizontalRendering = value)
	$: if (FieldGroupValue) {
		setEligibleForHorizontalRendering(FieldGroupStruct.split(" ")[2] === "multiselect" || CheckIfGroupIsEligibleForHorizontalRendering(FieldGroupValue[0]))
	}
</script>

<section class="flex flex-col space-y-1 shadow-md shadow-gray-800 rounded-md bg-accent bg-opacity-50 p-1">
	<header class="flex space-x-1">
		<h1 class="flex-[8] text-lg text-primary">Render field/group setup</h1>
		<button
			class="btn btn-ghost btn-secondary w-fit h-fit p-0"
			on:click={(e) => {
				e.preventDefault()
				handleUpdateFieldGroupRendering()
			}}
		>
			<Icon type="mdi:content-save" color={Shared.Colors.SECONDARY} />
		</button>
	</header>
	<div class="divider" />
	<main class="flex flex-col space-y-1">
		<div class="join join-vertical w-full">
			<span class="join-item join-label-primary">Expected maximum no. of {fieldGroupName}</span>
			<input class="join-item input input-primary w-full" placeholder="Enter field name/group..." type="number" bind:value={fieldGroupMaxLength} />
		</div>
		<div
			class="flex justify-between tooltip tooltip-top"
			class:tooltip={!eligibleForHorizontalRendering}
			class:tooltip-top={!eligibleForHorizontalRendering}
			class:tooltip-error={!eligibleForHorizontalRendering}
			data-tip={eligibleForHorizontalRendering ? '' : 'Group has nested groups! Cannot render horizontally'}
		>
			<div class="flex justify-between flex-[9]">
				<span class="label-text text-primary text-lg">Render {FieldGroupStruct.split(" ")[2] === "multiselect"? 'field' : 'group'} horizontally?</span>
				{#if !eligibleForHorizontalRendering}
					<div class="flex">
						<Icon type="mdi:exclamation-thick" color={Shared.Colors.ERROR} />
						<Icon type="mdi:exclamation-thick" color={Shared.Colors.ERROR} />
					</div>
				{/if}
			</div>
			<input type="checkbox" class="checkbox checkbox-primary" bind:checked={renderFieldGroupHorizontally} />
		</div>
	</main>
</section>
