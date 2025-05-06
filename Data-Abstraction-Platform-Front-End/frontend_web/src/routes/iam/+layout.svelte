<script lang="ts">
	import { PUBLIC_VERSION } from '$env/static/public'
	import Intro from '$lib/misc/Intro.svelte'
</script>

<div class="w-full h-full overflow-hidden flex flex-col">
	<div class="flex-[9.5] flex justify-center overflow-hidden">
		<section class="flex-1 flex justify-center">
			<slot />
		</section>
		<section class="flex-[2] flex justify-center max-md:hidden">
			<Intro />
		</section>
	</div>
	<div class="text-sm self-center text-center text-accent p-2 bg-accent-text w-fit h-fit">Version: {PUBLIC_VERSION}</div>
</div>
