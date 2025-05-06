<script lang="ts">
	import { FETCH_ERROR, Shared } from '$lib/constants'
	import Icon from '$lib/components/Icon.svelte'
	import { page } from '$app/stores'
	import { base } from '$app/paths'
	import { CurrentProject, CurrentUser, ProjectStorage, SearchResultsClickedIndex, ToastMessage, ToastType, AbstractionTimeoutActive, AbstractionTimeoutSeconds, Loading, LoadingMessage, ProjectsStatistics, ProjectsStatisticsLastFetch } from '$lib/stores'
	import { browser } from '$app/environment'
	import { IsProjectUserAuthorized, ResetAbstractionsStore, ResetCataloguesStore, ResetDirectoryStore, ResetFilesStore, ResetModelTemplatesStore } from '$lib/utils'
	import { goto } from '$app/navigation'
	import { PUBLIC_API_URL } from '$env/static/public'

	let collapseSideBar: boolean = false
	$ProjectStorage = []

	function handleClearLocalCache() {
		$SearchResultsClickedIndex = null
		ResetAbstractionsStore()
		ResetCataloguesStore()
		ResetFilesStore()
		ResetModelTemplatesStore()
		$ToastType = Shared.ToastType.INFO
		$ToastMessage = 'Cache cleared...'
	}

	$: if (browser && $CurrentProject && IsProjectUserAuthorized([Shared.ProjectRoles.EDITOR])) {
		setupAbstractionAutosave()
	}

	function setupAbstractionAutosave() {
		let autoSaveActive = localStorage.getItem('asa')
		if (autoSaveActive !== null) {
			if (autoSaveActive === 'true') {
				$AbstractionTimeoutActive = true
				let autoSaveActiveTimeoutSeconds = localStorage.getItem('asats')
				if (autoSaveActiveTimeoutSeconds !== null) {
					$AbstractionTimeoutSeconds = parseInt(autoSaveActiveTimeoutSeconds)
				}
			} else {
				$AbstractionTimeoutActive = false
			}
		}
	}

	async function handleLogout() {
		$Loading = true
		$LoadingMessage = 'Logging out...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/logout`, {
				credentials: 'include'
			})
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = fetchData.message
				$CurrentUser = null		
				$CurrentProject = null
				$SearchResultsClickedIndex = null
				ResetAbstractionsStore()
				ResetCataloguesStore()
				ResetFilesStore()
				ResetModelTemplatesStore()
				$ProjectsStatistics = null
				$ProjectsStatisticsLastFetch = null
				goto(`${base}/`)
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = fetchData.message
			}
		} catch {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

	function handleNavigateToHomePage() {
		ProjectsStatistics.set(null)
		$ProjectsStatistics = null
		$CurrentProject = null
		$ProjectsStatisticsLastFetch = null
		$SearchResultsClickedIndex = null
		ResetAbstractionsStore()
		ResetCataloguesStore()
		ResetFilesStore()
		ResetModelTemplatesStore()
		ResetDirectoryStore()
		goto(`${base}/`)
	}
</script>

{#if browser && $CurrentUser !== null && $CurrentProject !== null}
	<div class="flex w-full h-full flex-col-reverse md:flex-row">
		<aside class="md:flex-[0.5] max-md:flex-1 flex flex-row md:flex-col bg-white p-2 md:space-y-2 max-md:space-x-2 max-md:justify-between md:w-fit max-md:h-fit shadow-md shadow-gray-800 max-md:overflow-auto">
			<header class="md:flex-[0.5] max-md:flex-1 flex">
				<button
					class="btn btn-ghost max-md:btn-disabled max-md:self-center"
					on:click={() => {
						collapseSideBar = !collapseSideBar
					}}
				>
					<Icon type="tabler:vector-triangle" color={Shared.Colors.NEUTRAL} iconSize="42" />
					{#if !collapseSideBar}
						<span class="max-md:hidden"><Icon type="fa-solid:atlas" color={Shared.Colors.PRIMARY} iconSize="42" /></span>
					{/if}
				</button>
			</header>
			<div class="divider max-md:divider-horizontal" />
			<main class="flex-[9] flex md:flex-col md:space-y-3 md:overflow-x-hidden md:overflow-y-auto max-md:justify-around">
				<a class="link link-hover w-full flex space-x-1 justify-center max-md:flex-col" href="{base}/{$CurrentProject.ProjectID}" class:link-neutral={$page.url.pathname !== `${base}/${$CurrentProject.ProjectID}`} class:link-primary={$page.url.pathname === `${base}/${$CurrentProject.ProjectID}`}>
					<span class="self-center">
						<Icon type="mdi:home" color={$page.url.pathname === `${base}/${$CurrentProject.ProjectID}` ? Shared.Colors.NEUTRAL : Shared.Colors.PRIMARY} iconSize="36" />
					</span>
					<span class="text-center w-full h-fit self-center break-words md:font-bold max-md:text-xs" class:hideMenuEntryName={collapseSideBar} class:showMenuEntryName={!collapseSideBar}>Home</span>
				</a>
				<!-- <a
					class="link link-hover w-full flex space-x-1 justify-center max-md:flex-col"
					href="{base}/{$CurrentProject?.ProjectID}/explore"
					class:link-neutral={!$page.url.pathname.startsWith(`${base}/${$CurrentProject?.ProjectID}/explore`)}
					class:link-primary={$page.url.pathname.startsWith(`${base}/${$CurrentProject?.ProjectID}/explore`)}
				>
					<span class="self-center">
						<Icon type="mdi:compass" color={$page.url.pathname.startsWith(`${base}/${$CurrentProject?.ProjectID}/explore`) ? Shared.Colors.NEUTRAL : Shared.Colors.PRIMARY} iconSize="36" />
					</span>
					<span class="text-center w-full h-fit self-center break-words md:font-bold max-md:text-xs" class:hideMenuEntryName={collapseSideBar} class:showMenuEntryName={!collapseSideBar}>Explore</span>
				</a> -->
				<a
					class="link link-hover w-full flex space-x-1 justify-center max-md:flex-col"
					href="{base}/{$CurrentProject.ProjectID}/storage"
					class:link-neutral={!$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/storage`)}
					class:link-primary={$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/storage`)}
				>
					<span class="self-center">
						<Icon type="mdi:file-multiple" color={$page.url.pathname.startsWith(`${base}/${$CurrentProject?.ProjectID}/storage`) ? Shared.Colors.NEUTRAL : Shared.Colors.PRIMARY} iconSize="36" />
					</span>
					<span class="text-center w-full h-fit self-center break-words md:font-bold max-md:text-xs" class:hideMenuEntryName={collapseSideBar} class:showMenuEntryName={!collapseSideBar}>Files</span>
				</a>
				<a
					class="link link-hover w-full flex space-x-1 justify-center max-md:flex-col"
					href="{base}/{$CurrentProject.ProjectID}/modeltemplate"
					class:link-neutral={!$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/modeltemplate`)}
					class:link-primary={$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/modeltemplate`)}
				>
					<span class="self-center">
						<Icon type="mdi:clipboard-list" color={$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/modeltemplate`) ? Shared.Colors.NEUTRAL : Shared.Colors.PRIMARY} iconSize="36" />
					</span>
					<span class="text-center w-full self-center md:font-bold max-md:text-xs" class:hideMenuEntryName={collapseSideBar} class:showMenuEntryName={!collapseSideBar}>Model Templates</span>
				</a>
				<a
					class="link link-hover w-full flex space-x-1 justify-center max-md:flex-col"
					href="{base}/{$CurrentProject.ProjectID}/catalogue"
					class:link-neutral={!$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/catalogue`)}
					class:link-primary={$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/catalogue`)}
				>
					<span class="self-center">
						<Icon type="mdi:list-box" color={$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/catalogue`) ? Shared.Colors.NEUTRAL : Shared.Colors.PRIMARY} iconSize="36" />
					</span>
					<span class="text-center w-full h-fit self-center break-words md:font-bold max-md:text-xs" class:hideMenuEntryName={collapseSideBar} class:showMenuEntryName={!collapseSideBar}>Catalogues</span>
				</a>
				<a
					class="link link-hover w-full flex space-x-1 justify-center max-md:flex-col"
					href="{base}/{$CurrentProject.ProjectID}/abstraction"
					class:link-neutral={!$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/abstraction`)}
					class:link-primary={$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/abstraction`)}
				>
					<span class="self-center">
						<Icon type="mdi:notebook-edit" color={$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/abstraction`) ? Shared.Colors.NEUTRAL : Shared.Colors.PRIMARY} iconSize="36" />
					</span>
					<span class="text-center w-full h-fit self-center break-words md:font-bold max-md:text-xs" class:hideMenuEntryName={collapseSideBar} class:showMenuEntryName={!collapseSideBar}>Abstractions</span>
				</a>
			</main>
			<div class="divider max-md:divider-horizontal" />
			<footer class="md:flex-[0.5] max-md:flex-1 flex md:flex-col justify-center">
				<button class="w-full flex space-x-1 justify-center max-md:flex-col max-md:self-center" on:click={handleClearLocalCache}>
					<span class="self-center max-md:flex-col">
						<Icon type="mdi:cached" color={Shared.Colors.PRIMARY} iconSize="36" />
					</span>
					<span class="text-center w-full h-fit self-center break-words md:font-bold max-md:text-xs" class:hideMenuEntryName={collapseSideBar} class:showMenuEntryName={!collapseSideBar}>Clear cache</span>
				</button>
				<div class="dropdown md:dropdown-right dropdown-end max-md:dropdown-left max-md:self-center">
					<div tabindex="0" role="button" class="link link-hover w-full flex space-x-1 justify-center max-md:flex-col max-md:self-center">
						<span class="self-center max-md:flex-col">
							<Icon type="mdi:account-circle" color={$page.url.pathname.startsWith(`${base}/${$CurrentProject.ProjectID}/account`) ? Shared.Colors.NEUTRAL : Shared.Colors.PRIMARY} iconSize="36" />
						</span>
						<span class="text-center w-full h-fit self-center break-words md:font-bold max-md:text-xs" class:hideMenuEntryName={collapseSideBar} class:showMenuEntryName={!collapseSideBar}>
							{$CurrentUser.Name}
						</span>
					</div>
					<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
					<ul tabindex="0" class="dropdown-content menu p-2 shadow-md shadow-gray-800 bg-base-100 rounded-md w-fit h-fit flex">
						<!-- svelte-ignore a11y-missing-attribute -->
						<li>
							<button class="btn btn-regular btn-ghost w-full h-fit self-center" on:click={handleNavigateToHomePage}>
								<div class="flex space-x-1">
									<span class="max-md:hidden"><Icon type="mdi:city-switch" color={Shared.Colors.NEUTRAL} /></span>
									<span class="self-center">switch projects</span>
								</div>
							</button>
						</li>
						<!-- svelte-ignore a11y-missing-attribute -->
						<li>
							<button class="btn btn-regular btn-ghost w-full h-fit self-center" on:click={handleLogout}>
								<div class="flex space-x-1">
									<span class="max-md:hidden"><Icon type="mdi:exit-to-app" color={Shared.Colors.NEUTRAL} /></span>
									<span class="self-center">logout</span>
								</div>
							</button>
						</li>
					</ul>
				</div>
			</footer>
		</aside>
		<main class="flex-[9.5] flex justify-center overflow-hidden">
			<slot />
		</main>
	</div>
{:else}
	<div class="w-full h-full flex justify-center bg-gray-400 opacity-90">
		<div class="w-fit h-fit self-center flex flex-col">
			<div class="w-fit h-fit self-center">
				<span class="loading loading-ball loading-sm text-accent" />
				<span class="loading loading-ball loading-md text-secondary" />
				<span class="loading loading-ball loading-lg text-primary" />
			</div>
			<div class="text-lg text-white">Loading...</div>
		</div>
	</div>
{/if}

<style>
	.hideMenuEntryName {
		display: none;
	}

	.showMenuEntryName {
		display: run-in;
	}
</style>
