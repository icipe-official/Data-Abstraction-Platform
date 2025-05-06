<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { DATE_TIME_REGEX_SEARCH, Shared } from '$lib/constants'
	import { ToastType, ToastMessage } from '$lib/stores'

	export let FieldStruct: string
	export let UpdateTemplateFieldGroupStruct: (key: string, value: string) => void

	let selectedDateFormat: string = ''
	const setSelectedDateFormat = (value: string) => (selectedDateFormat = value)
	let fieldType: string = ''
	const setFieldType = (value: string) => (fieldType = value)
	$: if (FieldStruct.length > 1) {
		setFieldType('')
		setFieldType(FieldStruct.split(' ')[1])
		if (DATE_TIME_REGEX_SEARCH.test(FieldStruct)) {
			const dateFormatExtract = DATE_TIME_REGEX_SEARCH.exec(FieldStruct)
			if (dateFormatExtract) setSelectedDateFormat(dateFormatExtract[1])
		}
	}
	function handleInputDateFormat(value: string) {
		selectedDateFormat = value
	}
	function handleUpdateFieldDateFormat() {
		if (selectedDateFormat.length < 2) return
		let newDateFormat = `dtf=${selectedDateFormat}&#`
		if (DATE_TIME_REGEX_SEARCH.test(FieldStruct)) FieldStruct = FieldStruct.replace(DATE_TIME_REGEX_SEARCH, newDateFormat)
		else FieldStruct = `${FieldStruct} ${newDateFormat}`
		UpdateTemplateFieldGroupStruct(`${FieldStruct.split(' ')[0]}.struct`, FieldStruct)
		$ToastType = Shared.ToastType.INFO
		$ToastMessage = 'Date format updated'
	}
</script>

<div class="join w-full">
	<select class="join-item select select-primary flex-[9]" on:change={(e) => handleInputDateFormat(e.currentTarget.value)}>
		<option selected={selectedDateFormat === ''} value="" disabled>Choose date format</option>
		{#if fieldType === 'text'}
			<option selected={selectedDateFormat === 'yyyy-mm-dd HH:MM'} value="yyyy-mm-dd HH:MM">yyyy-mm-dd HH:MM</option>
			<option selected={selectedDateFormat === 'yyyy-mm-dd'} value="yyyy-mm-dd">yyyy-mm-dd</option>
			<option selected={selectedDateFormat === 'yyyy-mm'} value="yyyy-mm">yyyy-mm</option>
			<option selected={selectedDateFormat === 'HH:MM'} value="HH:MM">HH:MM</option>
		{/if}
		<option selected={selectedDateFormat === 'yyyy'} value="yyyy">yyyy</option>
		<option selected={selectedDateFormat === 'mm'} value="mm">mm</option>
	</select>
	<button
		class="join-item btn btn-regular btn-secondary flex-1"
		on:click={(e) => {
			e.preventDefault()
			handleUpdateFieldDateFormat()
		}}
		class:btn-disabled={selectedDateFormat === ''}
	>
		<Icon type="mdi:content-save" />
	</button>
</div>
