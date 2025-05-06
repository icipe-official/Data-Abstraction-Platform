<script lang="ts">
	import { page } from '$app/stores'
</script>

<div class="flex w-fit h-fit self-center p-2 bg-accent shadow-md shadow-gray-800 rounded-md space-x-2">
	<div class="flex flex-col space-y-2">
		<div class="w-full text-lg text-primary">Error</div>
		<div class="text-xl w-full text-center text-primary">{$page.status}</div>
	</div>
	<div class="divider divider-horizontal" />
	<div class="text-2xl w-full text-center h-fit self-center text-neutral">{$page.error?.message}</div>
</div>
