<script lang="ts">
	import type { Shared } from '$lib/constants'
	import type { IFormKeyValue, FormField } from '$lib/interface'

	export let Struct: string
	export let Value: FormField
	export let UpdateValue: (value: IFormKeyValue, repetitiveIndexes: number[]) => void
	export let GetValue: (key: string, repetitiveIndexes: number[]) => FormField
	export let DeleteFieldValue: (key: string, repetitiveIndexes: number[]) => void
	export let Color: Shared.Colors
	export let RepetitiveIndexes: number[]
	export let ViewingAsList = false

	let fieldUI: string = ''
	const SetFieldUI = (value: string) => (fieldUI = value)
	$: if (Struct) {
		SetFieldUI(Struct.split(' ')[2])
	}
</script>

{#if fieldUI === 'text' || fieldUI === 'textarea'}
	{#await import('./TextArea.svelte')}
		<div class="w-full h-fit flex justify-center bg-gray-400">
			<div class="w-fit h-fit self-center flex flex-col">
				<div class="w-fit h-fit self-center">
					<span class="loading loading-ball loading-sm text-accent" />
					<span class="loading loading-ball loading-md text-secondary" />
					<span class="loading loading-ball loading-lg text-primary" />
				</div>
				<div class="text-lg text-white">Loading...</div>
			</div>
		</div>
	{:then TextArea}
		<TextArea.default {Struct} {Value} {UpdateValue} {Color} {RepetitiveIndexes} {GetValue} {DeleteFieldValue} {ViewingAsList} />
	{:catch}
		<div class="w-full h-fit flex justify-center bg-gray-400">
			<div class="w-fit h-fit self-center flex flex-col">
				<div class="text-lg text-white">Network error...</div>
			</div>
		</div>
	{/await}
{:else if fieldUI === 'number'}
	{#await import('./Number.svelte')}
		<div class="w-full h-fit flex justify-center bg-gray-400">
			<div class="w-fit h-fit self-center flex flex-col">
				<div class="w-fit h-fit self-center">
					<span class="loading loading-ball loading-sm text-accent" />
					<span class="loading loading-ball loading-md text-secondary" />
					<span class="loading loading-ball loading-lg text-primary" />
				</div>
				<div class="text-lg text-white">Loading...</div>
			</div>
		</div>
	{:then Number}
		<Number.default {Struct} {Value} {UpdateValue} {Color} {RepetitiveIndexes} {GetValue} {DeleteFieldValue} {ViewingAsList} />
	{:catch}
		<div class="w-full h-fit flex justify-center bg-gray-400">
			<div class="w-fit h-fit self-center flex flex-col">
				<div class="text-lg text-white">Network error...</div>
			</div>
		</div>
	{/await}
{:else if fieldUI === 'multiselect' || fieldUI === 'select'}
	{#await import('./MultiSelect.svelte')}
		<div class="w-full h-fit flex justify-center bg-gray-400">
			<div class="w-fit h-fit self-center flex flex-col">
				<div class="w-fit h-fit self-center">
					<span class="loading loading-ball loading-sm text-accent" />
					<span class="loading loading-ball loading-md text-secondary" />
					<span class="loading loading-ball loading-lg text-primary" />
				</div>
				<div class="text-lg text-white">Loading...</div>
			</div>
		</div>
	{:then MultiSelect}
		<MultiSelect.default {Struct} {UpdateValue} {Color} {RepetitiveIndexes} {GetValue} {DeleteFieldValue} {ViewingAsList} />
	{:catch}
		<div class="w-full h-fit flex justify-center bg-gray-400">
			<div class="w-fit h-fit self-center flex flex-col">
				<div class="text-lg text-white">Network error...</div>
			</div>
		</div>
	{/await}
{:else if fieldUI === 'datetime'}
	{#await import('./DateTime.svelte')}
		<div class="w-full h-fit flex justify-center bg-gray-400">
			<div class="w-fit h-fit self-center flex flex-col">
				<div class="w-fit h-fit self-center">
					<span class="loading loading-ball loading-sm text-accent" />
					<span class="loading loading-ball loading-md text-secondary" />
					<span class="loading loading-ball loading-lg text-primary" />
				</div>
				<div class="text-lg text-white">Loading...</div>
			</div>
		</div>
	{:then DateTime}
		<DateTime.default {Struct} {Value} {UpdateValue} {Color} {RepetitiveIndexes} {GetValue} {DeleteFieldValue} {ViewingAsList} />
	{:catch}
		<div class="w-full h-fit flex justify-center bg-gray-400">
			<div class="w-fit h-fit self-center flex flex-col">
				<div class="text-lg text-white">Network error...</div>
			</div>
		</div>
	{/await}
{:else}
	<div>Invalid field!!!</div>
{/if}
