<script lang="ts">
	import Icon from "$lib/components/Icon.svelte"
	import { Shared } from "$lib/constants"
	import type { PageData } from "./$types"

	export let data: PageData
</script>

{#if data.ID}
	<div class="md:w-[30vw] max-md:w-[90%] h-fit shadow-md shadow-gray-800 bg-white self-center rounded-md p-2 flex space-y-2">
		<div class="flex-[9] flex flex-col justify-evenly">
			<div class="h-fit w-fit self-center flex-[9] text-xl font-bold">Your email has been successfully verified</div>
			<div class="text-center text-base">User ID is <strong>{data.ID}</strong></div>
		</div>
		<div class="flex-[0.5] h-fit self-center">
			<Icon type="mdi:check-decagram" color={Shared.Colors.PRIMARY} iconSize="80" />
		</div>
	</div>
{/if}
