<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { Shared } from '$lib/constants'
	import { AbstractionCurrentTemplate } from '$lib/stores'

	export let CurrentAbstraction: any
</script>

<dialog id="preview-data-table-dialog" class="modal">
	<form method="dialog" class="modal-box p-0 rounded min-w-[150px] max-w-full">
		<header class="sticky flex justify-between bg-accent items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
			<div class="flex space-x-2">
				<span class="text-lg text-primary h-fit self-center">Previewing data as table</span>
				<div class="flex h-fit self-center">
					<span class="h-fit self-center kbd kbd-xs">shift</span>
					<span class="h-fit self-center">+ ("scrollwheel") to scroll horizontally</span>
				</div>
			</div>
			<button class="btn btn-circle btn-ghost flex justify-center">
				<Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} />
			</button>
		</header>
		<main class="h-full p-2 w-full max-h-[80vh] flex">
			<div class="flex-1 overflow-auto">
				{#if CurrentAbstraction && $AbstractionCurrentTemplate}
					{#await import('$lib/components/table/Table.svelte')}
						<div class="w-full h-full flex justify-center bg-gray-400">
							<div class="w-fit h-fit self-center flex flex-col">
								<div class="w-fit h-fit self-center">
									<span class="loading loading-ball loading-sm text-accent" />
									<span class="loading loading-ball loading-md text-secondary" />
									<span class="loading loading-ball loading-lg text-primary" />
								</div>
								<div class="text-lg text-white">Loading...</div>
							</div>
						</div>
					{:then Table}
						<Table.default Data={[CurrentAbstraction]} DisableConditionalRendering={true} FilterModelTemplate={$AbstractionCurrentTemplate.ModelTemplate} />
					{:catch}
						<div class="w-full h-full flex justify-center bg-gray-400">
							<div class="w-fit h-fit self-center flex flex-col">
								<div class="text-lg text-white">Network error...</div>
							</div>
						</div>
					{/await}
				{/if}
			</div>
		</main>
	</form>
</dialog>
