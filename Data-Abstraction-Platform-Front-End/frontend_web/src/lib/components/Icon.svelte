<script lang="ts">
	export let type: string
	export let color: string = 'white'
	export let iconSize = '24'
</script>

<iconify-icon icon={type} style="color: {color};" height={iconSize} width={iconSize} />
