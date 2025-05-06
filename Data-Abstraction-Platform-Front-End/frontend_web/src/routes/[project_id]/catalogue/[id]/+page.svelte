<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { base } from '$app/paths'
	import { PUBLIC_API_URL } from '$env/static/public'
	import Icon from '$lib/components/Icon.svelte'
	import { DISALLOWED_CHARACTERS_REGEX_SEARCH, FETCH_ERROR, OPT_SPLIT, Shared } from '$lib/constants'
	import type { ICatalogue_temp } from '$lib/interface'
	import { ToastType, ToastMessage, Loading, LoadingMessage, CurrentProject, CurrentUser, CataloguesSearchResults, SearchResultsClickedIndex } from '$lib/stores'
	import { AreValuesEqual, IsProjectUserAuthorized, LocalDateFromString, LocalTimeFromString, Log } from '$lib/utils'
	import { onDestroy } from 'svelte'
	import type { PageData } from './$types'

	const CURRENT_SECTION = 'Catalogue'

	export let data: PageData

	let stepCounter: number = 1

	let previousName: string | null = data.Name ? data.Name : null
	let currentName: string = previousName ? previousName : ''
	let currentNameError: string | null = null
	const DEFAULT_CURRENT_NAME_ERROR = 'Give this catalogue a name...'
	function handleInputCurrentName(value: string) {
		currentName = value
		currentNameError = value.length < 3 ? DEFAULT_CURRENT_NAME_ERROR : null
	}

	let previousDescription: string | undefined = data.Description ? data.Description : undefined
	let currentDescription: string = previousDescription ? previousDescription : ''
	let currentDescriptionError: string | null = null
	const DEFAULT_CURRENT_DESCRIPTION_ERROR = 'Describe this catalogue...'
	function handleInputCurrentDescription(value: string) {
		currentDescription = value
		currentDescriptionError = value.length < 3 ? DEFAULT_CURRENT_DESCRIPTION_ERROR : null
	}

	let previousCatalogue: string[] | undefined = data.Catalogue
	let currentCatalogue: string[] = typeof previousCatalogue !== 'undefined' ? previousCatalogue : []
	let currentCatalogueError: (string | null)[] = currentCatalogue.map((_) => null)
	function handleInputCatalogueItem(key: string | undefined, value: string | undefined, index: number) {
		if (typeof key !== 'undefined') {
			currentCatalogue[index] = `${key.replaceAll(DISALLOWED_CHARACTERS_REGEX_SEARCH, '')}${OPT_SPLIT}${currentCatalogue[index].split(OPT_SPLIT)[1]}`
		}
		if (typeof value !== 'undefined') {
			currentCatalogue[index] = `${currentCatalogue[index].split(OPT_SPLIT)[0]}${OPT_SPLIT}${value.replaceAll(DISALLOWED_CHARACTERS_REGEX_SEARCH, '')}`
		}
		if (currentCatalogue[index].split(OPT_SPLIT)[0].length < 1 || currentCatalogue[index].split(OPT_SPLIT)[1].length < 1) {
			currentCatalogueError[index] = 'Invalid key/value pair'
		} else currentCatalogueError[index] = null
	}

	let previousCanPublicView: boolean | undefined = data.CanPublicView
	let currentCanPublicView: boolean = typeof previousCanPublicView !== 'undefined' ? previousCanPublicView : false

	function handleDeleteCatalogueItem(index: number) {
		currentCatalogue = currentCatalogue.filter((_, i) => i !== index)
		currentCatalogueError = currentCatalogueError.filter((_, i) => i !== index)
	}

	let currentFiles: FileList | null = null
	let currentFilesElement: HTMLInputElement | null = null
	let showFileInput: boolean = false
	let appendToCurrentCatalogue: boolean = false
	function handleUploadFileCatalogue() {
		if (!currentFiles || !currentFilesElement || currentFiles[0].type !== 'text/csv') {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'File may be empty or not valid format'
			return
		}
		const reader = new FileReader()
		reader.onload = (e) => {
			const listData = e.target?.result
			if (typeof listData === 'string') {
				let listItems = listData.split('\n')
				const isListKeyValue = listItems[0].split(',').length > 1 ? true : false
				let startIndex = currentCatalogue.length
				if (!appendToCurrentCatalogue) {
					currentCatalogue = []
					currentCatalogueError = []
					startIndex = 0
				}
				for (let i = 0; i < listItems.length; i++) {
					currentCatalogue = [...currentCatalogue, OPT_SPLIT]
					currentCatalogueError = [...currentCatalogueError, null]
				}
				listItems.forEach((li) => {
					if (isListKeyValue) {
						handleInputCatalogueItem(li.split(',')[0].replace(/\r|\n/, ''), li.split(',')[1].replace(/\r|\n/, ''), startIndex)
					} else handleInputCatalogueItem(li.replace(/\r|\n/, ''), li.replace(/\r|\n/, ''), startIndex)
					startIndex++
				})
				$ToastType = Shared.ToastType.INFO
				$ToastMessage = 'List updated'
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = 'List is empty'
			}
		}
		reader.readAsText(currentFiles[0])
		currentFiles = null
		currentFilesElement.value = ''
	}

	async function handleCreateUpdateCatalogue() {
		if ((!data.ID && !IsProjectUserAuthorized([Shared.ProjectRoles.CATALOGUE_CREATOR])) || (data.ID && data.DirectoryID !== $CurrentUser?.DirectoryID)) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Not Authorized to perform this action'
			return
		}
		if (currentName.length < 1) {
			currentNameError = DEFAULT_CURRENT_NAME_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Step 1: Name is not valid'
			return
		}
		if (currentDescription.length < 1) {
			currentDescriptionError = DEFAULT_CURRENT_DESCRIPTION_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Step 1: Description is not valid'
			return
		}
		if (currentCatalogue.length < 1) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Step 2: List is empty'
			return
		}
		for (let cle of currentCatalogueError) {
			if (cle !== null) {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = 'Step 2: One or more list items is invalid'
				return
			}
		}
		if (data.ID) {
			if (previousName === currentName && previousDescription === currentDescription && AreValuesEqual(previousCatalogue, currentCatalogue) && previousCanPublicView === currentCanPublicView) {
				$ToastType = Shared.ToastType.INFO
				$ToastMessage = 'No changes detected'
				return
			}
		}
		$Loading = true
		if (data.ID) {
			let Columns: string[] = []
			let Catalogue: ICatalogue_temp = {}
			if (previousName !== currentName) {
				Catalogue.Name = currentName
				Columns = ['name']
			}
			if (previousDescription !== currentDescription) {
				Catalogue.Description = currentDescription
				Columns = [...Columns, 'description']
			}
			if (!AreValuesEqual(previousCatalogue, currentCatalogue)) {
				Catalogue.Catalogue = currentCatalogue
				Columns = [...Columns, 'catalogue']
			}
			if (previousCanPublicView !== currentCanPublicView) {
				Catalogue.CanPublicView = currentCanPublicView
				Columns = [...Columns, 'can_public_view']
			}
			$LoadingMessage = `Updating catalogue ${data.ID}...`
			try {
				const fetchResponse = await fetch(`${PUBLIC_API_URL}/catalogue/${$CurrentProject?.ProjectID}/${data.ID}`, {
					credentials: 'include',
					method: 'PUT',
					body: JSON.stringify({ Catalogue, Columns })
				})
				const fetchData = await fetchResponse.json()
				if (fetchResponse.ok) {
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `Catalogue with id ${fetchData.ID} updated`
					previousName = currentName
					previousDescription = currentDescription
					previousCatalogue = currentCatalogue
					previousCanPublicView = currentCanPublicView
					data.LastUpdatedOn = fetchData.LastUpdatedOn
					if ($SearchResultsClickedIndex !== null) {
						$CataloguesSearchResults[$SearchResultsClickedIndex].Name = currentName
						$CataloguesSearchResults[$SearchResultsClickedIndex].Description = currentDescription
						$CataloguesSearchResults[$SearchResultsClickedIndex].Catalogue = currentCatalogue
						$CataloguesSearchResults[$SearchResultsClickedIndex].CanPublicView = currentCanPublicView
						$CataloguesSearchResults[$SearchResultsClickedIndex].LastUpdatedOn = fetchData.LastUpdatedOn
					}
				} else {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = fetchData.message
				}
			} catch (e) {
				Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Fetch error')
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = FETCH_ERROR
			}
		} else {
			try {
				$LoadingMessage = 'Creating new catalogue...'
				const fetchResponse = await fetch(`${PUBLIC_API_URL}/catalogue`, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify({
						ProjectID: $CurrentProject?.ProjectID,
						Name: currentName,
						Description: currentDescription,
						Catalogue: currentCatalogue
					})
				})
				const data = await fetchResponse.json()
				if (fetchResponse.ok) {
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `Catalogue with id ${data.ID} created`
					currentName = ''
					currentDescription = ''
					currentCatalogue = []
					currentCatalogueError = []
					stepCounter = 1
				} else {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = data.message
				}
			} catch (e) {
				Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Fetch error')
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = FETCH_ERROR
			}
		}
		$Loading = false
	}

	async function handleDeleteCatalogue() {
		if (!data.ID || (data.ID && data.DirectoryID !== $CurrentUser?.DirectoryID)) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Not Authorized to perform this action'
			return
		}
		$Loading = true
		$LoadingMessage = `Delete catalogue ${data.ID}...`
		try {
			const deleteUrl = new URL(`${PUBLIC_API_URL}/catalogue/${data.ID}`)
			if ($CurrentUser?.DirectoryID !== data.ProjectID) {
				deleteUrl.searchParams.append("pid", $CurrentProject?.ProjectID as string)
			}
			const fetchResponse = await fetch(deleteUrl, {
				credentials: 'include',
				method: 'DELETE'
			})
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				if (fetchData.CataloguesAffected === 1) {
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `${fetchData.CataloguesAffected} catalogue deleted`
				} else {
					$ToastType = Shared.ToastType.WARNING
					$ToastMessage = `${fetchData.CataloguesAffected} catalogue deleted`
				}
				if ($CataloguesSearchResults.length > 0) {
					$CataloguesSearchResults = $CataloguesSearchResults.filter((value) => value.ID !== data.ID)
				}
				goto(`${base}/${$CurrentProject?.ProjectID}/catalogue`)
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = fetchData.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Fetch error')
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

	function downloadCatalogue() {
		$Loading = true
		$LoadingMessage = 'Preparing catalogue...'
		let encodedUri = encodeURI(
			'data:text/csv;charset=utf-8,' +
				currentCatalogue
					.map((value) => {
						return `${value.split('~!!~')[0]},${value.split('~!!~')[1]}`
					})
					.join('\n')
		)
		$Loading = false
		$LoadingMessage = null
		window.open(encodedUri)
	}

	onDestroy(() => ($SearchResultsClickedIndex = null))
</script>

{#if browser && $CurrentProject}
	<div class="flex flex-col self-center w-fit h-full max-w-[95%] max-h-[98%] bg-white rounded-md shadow-sm shadow-gray-800 p-2 overflow-hidden">
		<header class="flex-[0.5] flex space-x-2">
			<section class="flex-[0.5]">
				<img src="{base}/logo.png" alt="data admin logo" class="max-w-[5vw] max-h-[5vh] self-center" />
			</section>
			<section class="flex-[9] flex text-center text-lg font-bold justify-center">
				{#if !data.ID || !data.CreatedOn || !data.LastUpdatedOn}
					<span class="h-fit self-center">New Catalogue</span>
				{:else}
					<span class="h-fit self-center">Catalogue of {currentName}</span>
				{/if}
			</section>
		</header>
		<div class="divider" />
		<section class="flex-[0.5]">
			<ul class="steps">
				<li class="step" class:step-secondary={stepCounter >= 1}>
					<button class="btn btn-ghost p-1 h-fit" on:click={() => (stepCounter = 1)}>Describe Catalogue</button>
				</li>
				<li class="step" class:step-secondary={stepCounter >= 2}>
					<button class="btn btn-ghost p-1 h-fit" on:click={() => (stepCounter = 2)}>Set Catalogue data</button>
				</li>
				<li class="step" class:step-secondary={stepCounter >= 3}>
					<button class="btn btn-ghost p-1 h-fit" on:click={() => (stepCounter = 3)}>Create/update or delete Catalogue</button>
				</li>
			</ul>
		</section>
		<div class="divider" />
		<main class="flex-[9] flex flex-col space-y-2 overflow-hidden">
			{#if stepCounter === 1}
				<section class="form-control">
					<span class="join">
						<span class="join-item flex-[0.5] join-label-primary join-label-content">Name</span>
						<input class="join-item flex-[9.5] input input-primary w-full" type="text" placeholder="Enter name of catalogue..." value={currentName} on:input={(e) => handleInputCurrentName(e.currentTarget.value)} />
					</span>
					{#if currentNameError}
						<div class="label">
							<span class="label-text text-error">{currentNameError}</span>
						</div>
						<div class="divider" />
					{/if}
				</section>
				<section class="form-control">
					<span class="join join-vertical max-h-[50vh]">
						<span class="join-item join-label-primary join-label-content">Description</span>
						<textarea class="join-item textarea textarea-primary" placeholder="Describe this catalogue..." value={currentDescription} on:input={(e) => handleInputCurrentDescription(e.currentTarget.value)} />
					</span>
					{#if currentDescriptionError}
						<div class="label">
							<span class="label-text text-error">{currentDescriptionError}</span>
						</div>
						<div class="divider" />
					{/if}
				</section>
				<section class="form-control">
					<label class="label">
						<span class="label-text text-lg font-bold">Can Public View?</span>
						<input type="checkbox" class="checkbox checkbox-primary" checked={currentCanPublicView} on:change={(e) => currentCanPublicView = e.currentTarget.checked} />
					</label>
				</section>
			{:else if stepCounter === 2}
				<section class="w-full h-full overflow-x-hidden overflow-y-auto shadow-inner shadow-gray-900 bg-gray-700 p-1 space-y-1">
					{#each currentCatalogue as cl, index}
						<section class="form-control">
							<span class="join">
								<input class="join-item flex-[9.5] input input-primary w-full" type="text" placeholder="Key..." value={cl.split(OPT_SPLIT)[0]} on:input={(e) => handleInputCatalogueItem(e.currentTarget.value, undefined, index)} />
								<input class="join-item flex-[9.5] input input-primary w-full" type="text" placeholder="Value..." value={cl.split(OPT_SPLIT)[1]} on:input={(e) => handleInputCatalogueItem(undefined, e.currentTarget.value, index)} />
								<button class="join-item btn btn-regular btn-primary" on:click={() => handleDeleteCatalogueItem(index)}><Icon type="mdi:delete" /></button>
							</span>
							{#if currentCatalogueError[index]}
								<div class="label">
									<span class="label-text text-error">{currentCatalogueError[index]}</span>
									<div class="divider" />
								</div>
							{/if}
						</section>
					{/each}
				</section>
				<section class="join">
					<button
						class="join-item btn btn-regular btn-secondary"
						on:click={() => {
							//@ts-expect-error
							document.getElementById('upload-list-file-dialog').showModal()
						}}
					>
						<Icon type="mdi:file-import" /> from csv file..
					</button>
					<button
						class="join-item btn btn-regular btn-neutral flex-1"
						on:click={() => {
							currentCatalogue = []
							currentCatalogueError = []
						}}
					>
						<Icon type="mdi:delete" /> list
					</button>
					<button
						class="join-item btn btn-regular btn-primary flex-1"
						on:click={() => {
							currentCatalogue = [...currentCatalogue, OPT_SPLIT]
							currentCatalogueError = [...currentCatalogueError, null]
						}}
					>
						<Icon type="mdi:plus-box" /> list item
					</button>
				</section>
			{:else if stepCounter === 3}
				<section class="join w-[70%] self-center">
					{#if data.ID}
						<button class="join-item btn btn-regular btn-neutral flex-1 h-fit" on:click={downloadCatalogue}>download</button>
					{/if}
					{#if data.DirectoryID === $CurrentUser?.DirectoryID || IsProjectUserAuthorized([Shared.ProjectRoles.PROJECT_ADMIN])}
						<button class="join-item btn btn-regular btn-secondary flex-1 h-fit" on:click={handleDeleteCatalogue}>delete</button>
					{/if}
					{#if (!data.ID && IsProjectUserAuthorized([Shared.ProjectRoles.CATALOGUE_CREATOR])) || (data.ID && data.DirectoryID === $CurrentUser?.DirectoryID)}
						<button class="join-item btn btn-regular btn-primary flex-1 h-fit" on:click={handleCreateUpdateCatalogue}>save</button>
					{/if}
				</section>
				{#if data.CreatedOn && data.LastUpdatedOn && data.Directory}
					<div class="text-lg text-primary text-center"><span class="font-bold">Created by</span> {data.Directory.Name} <span class="font-bold">On</span> {LocalDateFromString(data.CreatedOn)} at {LocalTimeFromString(data.CreatedOn)}</div>
					<div class="text-lg text-secondary text-center"><span class="font-bold">Last updated on</span>: {LocalDateFromString(data.LastUpdatedOn)} at {LocalTimeFromString(data.LastUpdatedOn)}</div>
				{/if}
			{/if}
		</main>
	</div>

	<!-- upload catalogue from file dialog -->
	<dialog id="upload-list-file-dialog" class="modal">
		<form method="dialog" class="modal-box p-0 rounded min-w-[150px]">
			<header class="sticky flex justify-between bg-accent items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
				<div class="text-lg text-primary">Upload list from csv file</div>
				<button class="btn btn-circle btn-ghost flex justify-center"><Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} /></button>
			</header>
			<main class="overflow-hidden p-2 space-y-2">
				<input class="file-input file-input-primary w-full" type="file" bind:files={currentFiles} bind:this={currentFilesElement} accept="text/csv" />
				<label class="label cursor-pointer">
					<span class="label-text">Append to current catalogue</span>
					<input type="checkbox" class="checkbox checkbox-primary" bind:checked={appendToCurrentCatalogue} />
				</label>
				<button class="btn btn-regular btn-secondary w-full justify-center" on:click={handleUploadFileCatalogue} class:btn-disabled={!currentFiles}>Upload file to catalogue</button>
			</main>
		</form>
	</dialog>
{:else}
	<div>Invalid request</div>
{/if}
