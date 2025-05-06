<script lang="ts">
	import { SetValueInObject } from '$lib/utils'
	import TableFilterTable from './TableFilterTable.svelte'

	export let FilterModelTemplate: string
	export let UpdateModelTemplate: ((value: string) => void) | undefined = undefined
	export let DataName: string | null = null
	export let GetCreatedFilterOptions: (key: string) => string[][]
	export let UpdateCreatedFilterOptions: (path: string, value: string[][]) => void
	export let DeleteFilterOption: (key: string) => void
	export let ClearCreatedFilterOptions: boolean

	let TableStructure = {
		struct: `root unique name=${DataName ? DataName : 'Filter Data'}&#`,
		value: JSON.parse(FilterModelTemplate)
	}

	function UpdateTablesAndColumnsStruct(path: string, newStruct: string) {
		TableStructure = {
			struct: TableStructure.struct,
			value: SetValueInObject(TableStructure.value, `${path.replace('root.', '').replaceAll('[x]', '[0]')}.struct`, newStruct)
		}
		if (UpdateModelTemplate) {
			UpdateModelTemplate(JSON.stringify(TableStructure.value))
		}
	}

	let RootViewElement: HTMLElement | undefined
</script>

<div class="w-full h-full overflow-auto" bind:this={RootViewElement}>
	<TableFilterTable TableStructure={JSON.parse(JSON.stringify(TableStructure))} {RootViewElement} {UpdateTablesAndColumnsStruct} {GetCreatedFilterOptions} {UpdateCreatedFilterOptions} {DeleteFilterOption} {ClearCreatedFilterOptions} />
</div>
