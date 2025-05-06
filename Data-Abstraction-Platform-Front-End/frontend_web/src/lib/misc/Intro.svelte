<script lang="ts">
	import { base } from '$app/paths'
	import { PUBLIC_API_URL } from '$env/static/public'
	import Icon from '$lib/components/Icon.svelte'
	import { FETCH_ERROR, Shared } from '$lib/constants'
	import { PlatformStatistics, PlatformStatisticsLastFetch, ToastMessage, ToastType } from '$lib/stores'
	import { LocalDateFromString, LocalTimeFromString } from '$lib/utils'

	let slideNumber = 0
	setInterval(() => {
		slideNumber = slideNumber === 2 ? 0 : slideNumber + 1
	}, 4000)

	async function getPlatformStats() {
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/platformstats`, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$PlatformStatistics = data
				$PlatformStatisticsLastFetch = new Date().toISOString()
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
	}

	if ($PlatformStatistics === null) {
		getPlatformStats()
	}
</script>

<div class="self-center w-[90%] h-[90%] bg-white shadow-md shadow-gray-800 rounded-md p-2 flex flex-col space-y-2 overflow-auto">
	<header class="flex-[0.5]">
		<h1 class="text-3xl text-center font-bold">VECTOR ATLAS<span>-</span><span class="text-primary-focus">DATA ABSTRACTION PLAFORM</span></h1>
	</header>
	<main class="flex-[9] flex justify-center">
		{#if slideNumber === 0}
			<div class="w-full h-fit self-center flex flex-col space-y-2 text-neutral">
				<div class="flex-1 flex-col h-full">
					<div class="flex-[9] flex justify-center"><Icon type="material-symbols:construction" color={Shared.Colors.NEUTRAL} iconSize="200" /></div>
					<div class="flex-1 text-3xl text-center">Prepare</div>
				</div>
				<div class="flex-[9]">
					<ul class="text-center text-xl">
						<li>Setup your team</li>
						<li>Upload documents to abstract</li>
						<li>Create catalogues for reuse across templates when collecting data using a dropdown</li>
						<li>Design forms/model templates</li>
					</ul>
				</div>
			</div>
		{:else if slideNumber === 1}
			<div class="w-full h-fit self-center flex flex-col space-y-2 text-secondary">
				<div class="flex-1 flex-col h-full">
					<div class="flex-[9] flex justify-center"><Icon type="game-icons:plant-watering" color={Shared.Colors.SECONDARY} iconSize="200" /></div>
					<div class="flex-1 text-3xl text-center h-full font-bold">Collect</div>
				</div>
				<div class="flex-[9]">
					<ul class="text-center text-xl">
						<li>Abstract data</li>
					</ul>
				</div>
			</div>
		{:else if slideNumber === 2}
			<div class="w-full h-fit self-center flex flex-col space-y-2 text-primary">
				<div class="flex-1 flex-col h-full">
					<div class="flex-[9] flex justify-center"><Icon type="material-symbols:travel-explore" color={Shared.Colors.PRIMARY} iconSize="200" /></div>
					<div class="flex-1 text-3xl text-center">Explore</div>
				</div>
				<div class="flex-[9]">
					<ul class="text-center text-xl">
						<li>View data as a table with frontend filtering</li>
						<li>Generate excel workbooks</li>
					</ul>
				</div>
			</div>
		{/if}
	</main>
	{#if $PlatformStatistics !== null}
		<section class="flex-[0.5] shadow-inner shadow-gray-800 rounded-md flex flex-col space-y-1 p-1">
			<div class="w-full flex justify-evenly">
				<div class="flex-1">
					<div class="font-bold text-xl text-center">{$PlatformStatistics.NoOfProjects ? $PlatformStatistics.NoOfProjects  : "-"}</div>
					<div class="text-lg text-center">Projects</div>
				</div>
				<div class="flex-1">
					<div class="font-bold text-xl text-center">{$PlatformStatistics.NoOfModelTemplates ? $PlatformStatistics.NoOfModelTemplates : "-"}</div>
					<div class="text-lg text-center">Model Templates</div>
				</div>
				<div class="flex-1">
					<div class="font-bold text-xl text-center">{$PlatformStatistics.NoOfCatalogues ? $PlatformStatistics.NoOfCatalogues : "-"}</div>
					<div class="text-lg text-center">Catalogues</div>
				</div>
				<div class="flex-1">
					<div class="font-bold text-xl text-center">{$PlatformStatistics.NoOfAbstractions ? $PlatformStatistics.NoOfAbstractions : "-"}</div>
					<div class="text-lg text-center">Abstractions</div>
				</div>
			</div>
			{#if $PlatformStatisticsLastFetch !== null}
				<div class="flex space-x-1 w-fit self-center">
					<span class="text-xs h-fit w-fit self-center">As of: <span class="italic">{LocalDateFromString($PlatformStatisticsLastFetch)} at {LocalTimeFromString($PlatformStatisticsLastFetch)}</span></span>
					<button class="btn btn-circle btn-ghost h-fit w-fit self-center" on:click={getPlatformStats}><Icon type="mdi:reload" color={Shared.Colors.PRIMARY} iconSize="20"/></button>
				</div>
			{/if}
		</section>
	{/if}
	<footer class="flex-[0.5] flex justify-between">
		<img src="{base}/icipe_logo.png" alt="icipe logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/university_of_oxford_logo.png" alt="university of oxford logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/vector_atlas_logo.png" alt="vector atlas logo" class="max-w-[10vw] max-h-[10vh] self-center" />
		<img src="{base}/malaria_atlas_project_logo.png" alt="malaria atlas logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/bill_and_melinda_gates_logo.png" alt="bill and melinda gates foundation logo" class="max-w-[10vw] max-h-[5vh] self-center" />
	</footer>
</div>
