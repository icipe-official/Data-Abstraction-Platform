<script lang="ts">
	import { inview, type Options } from 'svelte-inview'
	import { fade, type TransitionConfig } from 'svelte/transition'

	export let PaddingLeft: number
	export let SectionName: string
	export let Index: number
	export let SetCurrentSection: (index: number) => void
	export let RootViewElement: HTMLElement | undefined

	const inViewOptions: Options = {
		root: RootViewElement,
		rootMargin: '20px'
	}

	const transitionConfig: TransitionConfig = {
		delay: 100,
		duration: 150
	}

	let tocViewTracker: boolean
</script>

<div
	class="w-full"
	use:inview={inViewOptions}
	on:inview_change={(e) => {
		tocViewTracker = e.detail.inView
	}}
>
	{#if tocViewTracker}
		<button in:fade={transitionConfig} class="w-full flex space-x-1 link link-hover" style="padding-left: {PaddingLeft}px;" on:click={() => SetCurrentSection(Index)}>
			<span class="flex-[0.5] whitespace-nowrap text-md">{SectionName}</span>
			<span class="flex-[9] border-b-2 border-dotted w-full h-fit self-center" />
			<span class="flex-[0.5] w-fit text-end text-md">{Index}</span>
		</button>
	{:else}
		<div class="h-[2px] w-full" />
	{/if}
</div>
