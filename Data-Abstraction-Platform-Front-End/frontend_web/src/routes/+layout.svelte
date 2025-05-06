<script lang="ts">
	import '../app.css'
	import 'iconify-icon'
	import { ToastMessage, ToastType, Loading, LoadingMessage } from '$lib/stores'
	import { fade } from 'svelte/transition'
	import Icon from '$lib/components/Icon.svelte'
	import { onDestroy } from 'svelte'
	import { browser } from '$app/environment'

	let closeToastTimeout: number
	$: if ($ToastMessage && $ToastType) {
		const timeout = typeof $ToastMessage === 'string' ? 3000 : 10000
		closeToastTimeout = window.setTimeout(closeToast, timeout)
	}

	$: if ($Loading && typeof document !== 'undefined') {
		//@ts-expect-error
		document.getElementById('loading-screen-dialog').showModal()
	}

	$: if (!$Loading && typeof document !== 'undefined') {
		//@ts-expect-error
		document.getElementById('loading-screen-dialog').close()
	}

	function closeToast() {
		ToastMessage.set(null)
		ToastType.set(null)
	}

	function closeToastViaButton() {
		window.clearTimeout(closeToastTimeout)
		closeToast()
	}

	onDestroy(() => {
		if (browser) {
			window.clearTimeout(closeToastTimeout)
		}
	})
</script>

<div class="h-[100vh] w-[100vw] overflow-hidden flex justify-center relative">
	<slot />
	<div class="toast max-sm:toast-center max-sm:w-full fixed">
		{#if $ToastMessage && $ToastType}
			<div in:fade out:fade class="alert shadow-sm shadow-slate-600 {$ToastType} flex">
				{#if typeof $ToastMessage === 'string'}
					<div class="break-words flex-[9.5]">{$ToastMessage}</div>
				{:else}
					<div class="flex flex-row w-full justify-between h-fit self-center">
						<div class="flex flex-col">
							{#each $ToastMessage as tm, index}
								<div class="break-words flex-[0.5]">{index + 1}-{tm}</div>
							{/each}
						</div>
					</div>
				{/if}
				<button class="btn btn-circle btn-ghost p-0 w-fit h-fit" on:click={() => closeToastViaButton()}><Icon type="mdi:close" color="bg-slate-200" /> </button>
			</div>
		{/if}
	</div>
</div>

<dialog id="loading-screen-dialog" class="modal">
	<form method="dialog" class="modal-backdrop min-w-[200px]">
		<div class="flex flex-col justify-center items-center text-xl space-y-5">
			<div class="flex">
				<span class="loading loading-ball loading-sm text-accent" />
				<span class="loading loading-ball loading-md text-secondary" />
				<span class="loading loading-ball loading-lg text-primary" />
			</div>
			{#if $LoadingMessage}
				<span class="text-white">{$LoadingMessage}</span>
			{/if}
		</div>
	</form>
</dialog>
