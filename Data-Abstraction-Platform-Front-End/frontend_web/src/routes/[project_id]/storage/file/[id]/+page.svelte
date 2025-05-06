<script lang="ts">
	import { CurrentProject, CurrentUser, FilesSearchResults, Loading, LoadingMessage, SearchResultsClickedIndex, ToastMessage, ToastType } from '$lib/stores'
	import { onDestroy } from 'svelte'
	import type { PageData } from './$types'
	import { browser } from '$app/environment'
	import { PUBLIC_API_URL } from '$env/static/public'
	import Icon from '$lib/components/Icon.svelte'
	import { FETCH_ERROR, OPTS_SPLIT, Shared } from '$lib/constants'
	import { IsProjectUserAuthorized, LocalDateFromString, LocalTimeFromString, Log } from '$lib/utils'
	import { goto } from '$app/navigation'
	import { base } from '$app/paths'

	const CURRENT_SECTION = 'File'
	export let data: PageData

	async function handleDeleteFile() {
		if (!data.ID) {
			return
		}
		$Loading = true
		$LoadingMessage = 'Deleting file...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/storage/file`, {
				method: 'DELETE',
				credentials: 'include',
				body: JSON.stringify({
					ID: data.ID,
					ProjectID: data.ProjectID
				})
			})
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				if (fetchData.FilesAffected === 1) {
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `${fetchData.FilesAffected} file deleted`
				} else {
					$ToastType = Shared.ToastType.WARNING
					$ToastMessage = `${fetchData.FilesAffected} files deleted`
				}
				if ($FilesSearchResults.length > 0) {
					$FilesSearchResults = $FilesSearchResults.filter((fsr) => fsr.ID !== data.ID)
				}
				goto(`${base}/${$CurrentProject?.ProjectID}/storage`)
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = fetchData.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e)
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

	enum LeftSectionTabs {
		FILE = 'FILE',
		ACTIONS = 'ACTIONS'
	}
	let currentTab: LeftSectionTabs = LeftSectionTabs.ACTIONS
	const getCurrentTab = () => currentTab
	const setCurrentTab = (value: LeftSectionTabs) => (currentTab = value)

	onDestroy(() => ($SearchResultsClickedIndex = null))

	let windowWidth = window.innerWidth
	$: {
		if (windowWidth > 1065) {
			if (getCurrentTab() === LeftSectionTabs.FILE) {
				setCurrentTab(LeftSectionTabs.ACTIONS)
				expandFileSection = false
			}
		} else {
			expandFileSection = false
		}
	}

	let expandFileSection = false
</script>

<svelte:window bind:innerWidth={windowWidth} />

{#if browser && $CurrentProject}
	<div class="flex self-center w-full h-full max-w-[98%] max-h-[98%] overflow-hidden space-x-2">
		{#if !expandFileSection || windowWidth <= 1065}
			<section class="flex-1 flex flex-col bg-white rounded-md shadow-md shadow-gray-800 p-2 overflow-hidden space-y-2">
				{#if windowWidth <= 1065}
					<header class="flex-[0.5] flex justify-center">
						<section class="tabs tabs-boxed w-full flex">
							<button class="flex-1 tab" class:tab-active={currentTab === LeftSectionTabs.FILE} on:click={() => setCurrentTab(LeftSectionTabs.FILE)}>
								{LeftSectionTabs.FILE}
							</button>
							<button class="flex-1 tab" class:tab-active={currentTab === LeftSectionTabs.ACTIONS} on:click={() => setCurrentTab(LeftSectionTabs.ACTIONS)}>
								{LeftSectionTabs.ACTIONS}
							</button>
						</section>
					</header>
				{/if}
				<main class="flex-[9.5] flex flex-col p-1 overflow-auto space-y-2">
					{#if currentTab === LeftSectionTabs.ACTIONS}
						<div class="flex-1 flex flex-col justify-between">
							<div class="rounded-md shadow-inner shadow-gray-800 text-md p-2">
								<div class="text-primary text-lg font-bold">File Info</div>
								<div><span class="font-bold">File ID</span>: {data.ID}</div>
								<div><span class="font-bold">Content-Type</span>: {data.ContentType}</div>
								{#if data.CreatedOn}
									<div><span class="font-bold">Created On</span>: {LocalDateFromString(data.CreatedOn)} at {LocalTimeFromString(data.CreatedOn)}</div>
								{/if}
								<div><span class="font-bold">Tags</span>: {data.Tags}</div>
								<div class="divider" />
								<div class="text-primary text-lg font-bold">Owner Info</div>
								<div><span class="font-bold">Name</span>: {data.Directory?.Name}</div>
								<div><span class="font-bold">Contacts</span></div>
								{#if data.Directory?.Contacts}
									{#each data.Directory.Contacts as c, index}
										<div>{index + 1}: {c.split(OPTS_SPLIT)[0]} - {c.split(OPTS_SPLIT)[1]}</div>
									{/each}
								{/if}
								<div class="divider" />
								<div class="text-primary text-lg font-bold">Project Info</div>
								<div><span class="font-bold">Project ID</span>: {data.ProjectID}</div>
								<div><span class="font-bold">Name</span>: {data.Project?.Name}</div>
								<div><span class="font-bold">Name</span>: {data.Project?.Description}</div>
							</div>
							<div class="join">
								{#if IsProjectUserAuthorized([Shared.ProjectRoles.PROJECT_ADMIN]) || data.DirectoryID === $CurrentUser?.DirectoryID}
									<button class="join-item flex-1 btn btn-secondary" on:click={handleDeleteFile}>delete file</button>
								{/if}
								<a class="join-item flex-1 btn btn-primary" href="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.ProjectID}" target="_blank">download file</a>
							</div>
						</div>
					{:else if currentTab === LeftSectionTabs.FILE}
						{#if data.ContentType && data.ContentType.startsWith('image/')}
							<img src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.ID}" alt={data.Tags} />
						{:else if data.ContentType && data.ContentType.startsWith('audio/')}
							<audio controls src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.ID}" />
						{:else if data.ContentType && data.ContentType.startsWith('video/')}
							<video controls>
								<source src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.ID}" />
								<track kind="captions" />
							</video>
						{:else if data.ContentType === 'application/pdf'}
							<iframe src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.ID}" title={data.Tags} height="100%" width="100%" />
						{:else}
							<div class="w-full h-full flex justify-center">
								<a class="btn btn-primary self-center" href="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.ID}" target="_blank"> download file </a>
							</div>
						{/if}
					{/if}
				</main>
			</section>
		{/if}
		{#if windowWidth > 1065}
			<section class="flex-1 flex flex-col bg-white rounded-md shadow-md shadow-gray-800 p-1 overflow-hidden space-x-1">
				<header class="flex-[0.5] flex justify-between">
					<span class="font-bold texl-lg h-fit self-center">{data.ID}</span>
					<button class="btn btn-ghost w-fit h-fit p-0 self-center" on:click={() => (expandFileSection = !expandFileSection)}>
						<Icon type={expandFileSection ? 'mdi:arrow-collapse-all' : 'mdi:arrow-expand-all'} color={Shared.Colors.PRIMARY} />
					</button>
				</header>
				<main class="flex-[9.5] flex flex-col overflow-auto w-full h-full">
					{#if data.ContentType && data.ContentType.startsWith('image/')}
						<img src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.ID}" alt={data.Tags} />
					{:else if data.ContentType && data.ContentType.startsWith('audio/')}
						<audio controls src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.ID}" />
					{:else if data.ContentType && data.ContentType.startsWith('video/')}
						<video controls>
							<source src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.ID}" />
							<track kind="captions" />
						</video>
					{:else if data.ContentType === 'application/pdf'}
						<iframe src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.ID}" title={data.Tags} height="100%" width="100%" />
					{:else}
						<div class="w-full h-full flex justify-center">
							<a class="btn btn-primary self-center" href="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.ID}" target="_blank"> download file </a>
						</div>
					{/if}
				</main>
			</section>
		{/if}
	</div>
{:else}
	<div>Invalid request</div>
{/if}
