<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { base } from '$app/paths'
	import { PUBLIC_API_URL } from '$env/static/public'
	import DateTime from '$lib/components/DateTime.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import Table from '$lib/components/table/Table.svelte'
	import { Shared, FETCH_ERROR, LOGO_URL } from '$lib/constants'
	import type { IFile } from '$lib/interface'
	import {
		Loading,
		LoadingMessage,
		ToastType,
		ToastMessage,
		FilesSearchResults,
		CurrentProject,
		SearchResultsClickedIndex,
		ProjectStorage,
		FilesSearchLimit,
		FilesSearchOffset,
		FilesSearchCurrentQuery,
		FilesSearchUseCurrentProject,
		FilesSearchCreatedOnGreaterThan,
		FilesSearchCreatedOnLessThan,
		FilesSearchSortBy,
		FilesSearchSortByOrder,
		FilesSearchFileWithAbstractions,
		FilesSearchPreviousQuery,

		FilesSearchCreatedFilterOptions

	} from '$lib/stores'
	import { IsProjectUserAuthorized, Log, ResetFilesStore } from '$lib/utils'
	import { onDestroy } from 'svelte'

	const CURRENT_SECTION = 'Storage'

	const mtFiles = {
		ID: {
			struct: 'root.ID text text name=ID&# disabled=true&#',
			value: ''
		},
		StorageID: {
			struct: 'root.StorageID text text name=Storage ID&# disabled=true&#',
			value: ''
		},
		ProjectID: {
			struct: 'root.ProjectID text text name=Project ID&# disabled=true&#',
			value: ''
		},
		DirectoryID: {
			struct: 'root.DirectoryID text text name=Creator ID&# disabled=true&#',
			value: ''
		},
		Tags: {
			struct: 'root.Tags text text name=Tags&#',
			value: ''
		},
		ContentType: {
			struct: 'root.ContentType text text name=Content Type&#',
			value: ''
		},
		CreatedOn: {
			struct: 'root.CreatedOn text datetime name=Created On&# dtf=yyyy-mm-dd HH:MM&#',
			value: ''
		},
		Storage: {
			struct: 'root.Storage unique name=Storage&# disabled=true&#',
			value: {
				StorageTypeID: {
					struct: 'root.Project.value.StorageTypeID text text name=Storage Type&#',
					value: ''
				},
				Name: {
					struct: 'root.Project.value.Name text text name=Storage Name&#',
					value: ''
				}
			}
		},
		Directory: {
			struct: 'root.Directory unique name=Directory&#',
			value: {
				Name: {
					struct: 'root.Directory.value.Name text text name=Created By&#',
					value: ''
				}
			}
		},
		Project: {
			struct: 'root.Project unique name=Project&# disabled=true&#',
			value: {
				Name: {
					struct: 'root.Project.value.Name text text name=Project Name&#',
					value: ''
				},
				Description: {
					struct: 'root.Project.value.Description text text name=Project Description&#',
					value: ''
				}
			}
		}
	}

	let FilterModelTemplate = JSON.stringify(mtFiles)
	const HandleUpdateFilterModelTemplate = (value: string) => (FilterModelTemplate = value)

	function handleInputSearchResultsLimit(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$FilesSearchLimit = parseInt(value)
		if ($FilesSearchLimit < 5) {
			$FilesSearchLimit = 0
		} else if ($FilesSearchLimit < $FilesSearchOffset) {
			if ($FilesSearchLimit - 1000 < 0) {
				$FilesSearchOffset = 0
			} else {
				$FilesSearchOffset = $FilesSearchLimit - 1000
			}
		}
	}
	function handleInputSearchResultsOffset(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$FilesSearchOffset = parseInt(value)
		if ($FilesSearchOffset < 0) {
			$FilesSearchOffset = 0
		} else if ($FilesSearchOffset > $FilesSearchLimit) {
			$FilesSearchLimit = $FilesSearchOffset + 1000
		}
	}
	async function handleSearchFiles() {
		$Loading = true
		$LoadingMessage = 'Searching files...'
		showFilter = false
		try {
			let url = new URL(`${PUBLIC_API_URL}/storage/file`)
			if ($FilesSearchCurrentQuery.length > 1) {
				url.searchParams.append('sq', $FilesSearchCurrentQuery)
			}
			if ($FilesSearchUseCurrentProject) {
				url.searchParams.append('pid', $CurrentProject?.ProjectID as string)
			}
			if ($FilesSearchCreatedOnGreaterThan != '') {
				url.searchParams.append('cogt', $FilesSearchCreatedOnGreaterThan)
			}
			if ($FilesSearchCreatedOnLessThan != '') {
				url.searchParams.append('colt', $FilesSearchCreatedOnLessThan)
			}
			url.searchParams.append('l', `${$FilesSearchLimit}`)
			url.searchParams.append('o', `${$FilesSearchOffset}`)
			url.searchParams.append('sb', $FilesSearchSortBy)
			url.searchParams.append('sbo', $FilesSearchSortByOrder)
			if ($FilesSearchFileWithAbstractions.length > 1) {
				url.searchParams.append('fwa', $FilesSearchFileWithAbstractions)
			}
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$FilesSearchResults = data !== null ? data : []
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `${data !== null ? data.length : 0} results found`
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

	let currentFiles: FileList | null = null
	let currentFilesElement: HTMLInputElement | null = null
	let currentFilesCommonTag: string = ''
	let currentStorageID: string = ''

	async function handleUploadFiles() {
		if (!currentFiles || !currentFilesElement) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Pick a file or files to upload'
			return
		}
		if (currentStorageID.length < 1) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Pick storage drive'
			return
		}
		$Loading = true
		let noFilesUploaded = 0
		let fileUploadErrors: string[] = []
		let cfi = 1
		for (let cf of currentFiles) {
			let fileTag = cf.name.substring(0, cf.name.lastIndexOf('.'))
			if (!isNaN(parseInt(fileTag))) {
				for (let i = 0; i < cf.name.substring(0, cf.name.lastIndexOf('.')).length - 1; i++) {
					let newIs = ''
					for (let z = i + 1; z < cf.name.substring(0, cf.name.lastIndexOf('.')).length; z++) {
						newIs += 'i'
					}
					fileTag = fileTag + ' ' + fileTag.substring(0, i + 1) + newIs
				}
			}
			let formData = new FormData()
			formData.append('ProjectID', $CurrentProject?.ProjectID as string)
			formData.append('StorageID', currentStorageID)
			formData.append('Tags', (currentFilesCommonTag + ' ' + fileTag).trim())
			formData.append('FileUpload', cf)
			$LoadingMessage = `Uploading ${cfi}/${currentFiles.length} files...`
			try {
				const fetchResponse = await fetch(`${PUBLIC_API_URL}/storage/file`, {
					method: 'POST',
					credentials: 'include',
					body: formData
				})
				const data = await fetchResponse.json()
				if (fetchResponse.ok) {
					noFilesUploaded += 1
				} else {
					fileUploadErrors.push(`File '${cf.name}' not uploaded.\nReason: ${data.message}`)
				}
			} catch {
				fileUploadErrors.push(`File '${cf.name}' not uploaded.\nReason: ${FETCH_ERROR}`)
			} finally {
				cfi += 1
			}
		}
		if (fileUploadErrors.length > 0) {
			$ToastType = Shared.ToastType.ERROR
			fileUploadErrors.push(`${noFilesUploaded}/${currentFiles.length} files uploaded.`)
			$ToastMessage = fileUploadErrors
		} else {
			$ToastType = Shared.ToastType.SUCCESS
			$ToastMessage = `${noFilesUploaded}/${currentFiles.length} files uploaded.`
		}
		currentFiles = null
		currentFilesCommonTag = ''
		currentStorageID = ''
		currentFilesElement.value = ''
		$LoadingMessage = null
		$Loading = false
	}

	function HandleClickTableRow(index: number) {
		$SearchResultsClickedIndex = index
		goto(`${base}/${$CurrentProject?.ProjectID}/storage/file/${$FilesSearchResults[index].ID}`)
	}

	let showFileUploadDialog = false

	async function handlePrepareProjectStorage() {
		if ($ProjectStorage.length < 1) {
			await handleGetProjectStorage()
		}
		if ($ProjectStorage.length > 0) {
			if ($ProjectStorage.length == 1) {
				currentStorageID = $ProjectStorage[0].StorageID
			}
		}
	}

	async function handleGetProjectStorage() {
		$Loading = true
		$LoadingMessage = 'Retrieving available project storage options...'
		try {
			let url = new URL(`${PUBLIC_API_URL}/storage/project`)
			url.searchParams.append('pid', $CurrentProject?.ProjectID as string)
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ProjectStorage = data !== null ? data : []
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `${data !== null ? data.length : 0} storage options found`
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

	function HandleUpdateCreatedFilterOptions(value: any) {
		$FilesSearchCreatedFilterOptions = value
		if (Object.keys($FilesSearchCreatedFilterOptions).length < 1) {
			FilterModelTemplate = JSON.stringify(mtFiles)
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, $FilesSearchCreatedFilterOptions, 'Updated Filter options')
	}

	let showFilter = false
	const setShowFilter = (value: boolean) => (showFilter = value)

	let quickSearchFiles: IFile[] = []
	let performingQuickSearch = false
	let searchBarFocused = false
	let quickSearchResultsFocused = false
	$: if (searchBarFocused) {
		setShowFilter(false)
	}
	let quickSearchTimeout: number
	function setupQuickSearchTimeout() {
		if (!performingQuickSearch) {
			performingQuickSearch = true
			quickSearchTimeout = window.setTimeout(async () => {
				quickSearchFiles = []
				try {
					let url = new URL(`${PUBLIC_API_URL}/storage/file`)
					if ($FilesSearchCurrentQuery.length > 1) {
						url.searchParams.append('sq', $FilesSearchCurrentQuery)
					}
					if ($FilesSearchUseCurrentProject) {
						url.searchParams.append('pid', $CurrentProject?.ProjectID as string)
					}
					if ($FilesSearchCreatedOnGreaterThan != '') {
						url.searchParams.append('cogt', $FilesSearchCreatedOnGreaterThan)
					}
					if ($FilesSearchCreatedOnLessThan != '') {
						url.searchParams.append('colt', $FilesSearchCreatedOnLessThan)
					}
					if ($FilesSearchFileWithAbstractions.length > 1) {
						url.searchParams.append('fwa', $FilesSearchFileWithAbstractions)
					}
					url.searchParams.append('l', `20`)
					url.searchParams.append('o', `0`)
					url.searchParams.append('qs', 'true')
					url.searchParams.append('sb', 'created_on')
					url.searchParams.append('sbo', 'desc')
					const fetchResponse = await fetch(url, {
						credentials: 'include'
					})
					const data = await fetchResponse.json()
					if (fetchResponse.ok) {
						quickSearchFiles = data !== null ? data : []
					} else {
						$ToastType = Shared.ToastType.ERROR
						$ToastMessage = data.message
					}
				} catch {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = FETCH_ERROR
				}
				performingQuickSearch = false
				$FilesSearchPreviousQuery = $FilesSearchCurrentQuery
				Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, quickSearchFiles, 'Quick search files')
			}, 2000)
		}
	}
	$: if ($FilesSearchPreviousQuery !== $FilesSearchCurrentQuery && searchBarFocused) {
		setupQuickSearchTimeout()
	}

	$: if (browser) {
		document.addEventListener('keydown', handleClickEnter)
	}
	function handleClickEnter(e: KeyboardEvent) {
		if (e.key === 'Enter' && (showFilter || searchBarFocused)) {
			window.clearTimeout(quickSearchTimeout)
			quickSearchFiles = []
			handleSearchFiles()
		}
	}
	onDestroy(() => {
		if (browser) {
			document.removeEventListener('keydown', handleClickEnter)
		}
		window.clearTimeout(quickSearchTimeout)
	})
</script>

<div class="flex flex-col self-center w-full h-full max-w-[98%] max-h-[98%] bg-white rounded-md shadow-sm shadow-gray-800 p-2 overflow-hidden space-y-2">
	<header class="flex-[0.5] flex space-x-2">
		<section class="flex-1 flex">
			<img src={LOGO_URL} alt="data admin logo" class="max-w-[5vw] max-h-[5vh] self-center" />
			<div class="w-fit h-fit">
				<Icon type="mdi:help-circle" iconSize="23" color={Shared.Colors.PRIMARY} />
			</div>
		</section>
		<section class="flex-[9] flex flex-col justify-center">
			<div class="form-control w-[90%]">
				<span class="join">
					<input
						class="join-item flex-[9.5] input input-secondary w-full shadow-sm shadow-gray-600"
						type="search"
						placeholder="Search files..."
						bind:value={$FilesSearchCurrentQuery}
						on:focusin={() => {
							searchBarFocused = true
						}}
						on:focusout={() => {
							searchBarFocused = false
							clearTimeout(quickSearchTimeout)
						}}
					/>
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={() => (showFilter = !showFilter)}>
						<Icon type="mdi:filter" />
					</button>
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={handleSearchFiles}>
						<span class="w-fit h-fit self-center bg-transparent"><Icon type="mdi:search" /></span>
					</button>
				</span>
			</div>
			<div class="relative">
				{#if showFilter}
					<div class="absolute top-0 left-0 bg-white rounded-md p-1 w-[90%] shadow-md shadow-gray-800 mt-1 flex flex-col space-y-1 justify-center z-[100] max-h-[70vh] overflow-auto">
						<section class="form-control">
							<label class="label">
								<span class="label-text text-lg font-bold">Search in current project?</span>
								<input type="checkbox" class="checkbox checkbox-primary" bind:checked={$FilesSearchUseCurrentProject} />
							</label>
						</section>
						<section class="flex flex-col space-y-1">
							<div class="text-md">Date range for when files were created...</div>
							<div class="join w-full">
								<DateTime bind:Value={$FilesSearchCreatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$FilesSearchCreatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item flex-[0.5] join-label-primary join-label-content">Maximum no. of results</span>
								<input class="join-item flex-[9.5] input input-primary w-full" type="text" placeholder="Enter maximum no. of results to show..." value={$FilesSearchLimit} on:input={(e) => handleInputSearchResultsLimit(e.currentTarget.value)} />
							</span>
							<span class="join join-vertical">
								<span class="join-item flex-[0.5] join-label-primary join-label-content">No. of results to skip</span>
								<input class="join-item flex-[9.5] input input-primary w-full" type="text" placeholder="Enter no. of results to skip..." value={$FilesSearchOffset} on:input={(e) => handleInputSearchResultsOffset(e.currentTarget.value)} />
							</span>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Sort by</span>
								<div class="join-item join join-horizontal w-full">
									<select class="join-item select select-primary flex-1" bind:value={$FilesSearchSortBy}>
										<option selected={$FilesSearchSortBy === ''} value="" disabled>Sorty By...</option>
										<option selected={$FilesSearchSortBy === 'created_on'} value="created_on">Created on</option>
										<option selected={$FilesSearchSortBy === 'last_updated_on'} value="last_updated_on">Last updated on</option>
									</select>
									<select class="join-item select select-primary flex-1" bind:value={$FilesSearchSortByOrder}>
										<option selected={$FilesSearchSortByOrder === ''} value="" disabled>Sorty By Order...</option>
										<option selected={$FilesSearchSortByOrder === 'asc'} value="asc">Least recent first</option>
										<option selected={$FilesSearchSortByOrder === 'desc'} value="desc">Most recent first</option>
									</select>
								</div>
							</span>
						</section>
						<div class="join join-vertical">
							<span class="join-item join-label-primary join-label-content">Filter by files with/without abstractions</span>
							<select class="join-item select select-primary flex-1" bind:value={$FilesSearchFileWithAbstractions}>
								<option selected={$FilesSearchFileWithAbstractions === 'both'} value="">both</option>
								<option selected={$FilesSearchFileWithAbstractions === 'true'} value="true">With abstractions</option>
								<option selected={$FilesSearchFileWithAbstractions === 'false'} value="false">Without abstractions</option>
							</select>
						</div>
						<button class="btn btn-secondary self-center w-full max-w-[350px] h-fit" on:click={ResetFilesStore}> reset </button>
					</div>
				{/if}
				{#if (searchBarFocused || quickSearchResultsFocused) && (performingQuickSearch || quickSearchFiles.length > 0)}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<!-- svelte-ignore a11y-mouse-events-have-key-events -->
					<div class="absolute top-0 left-0 bg-white rounded-md p-1 w-[90%] shadow-md shadow-gray-800 mt-1 flex flex-col space-y-1 justify-center z-[100] overflow-hidden" on:mouseover={() => (quickSearchResultsFocused = true)} on:mouseleave={() => (quickSearchResultsFocused = false)}>
						{#if performingQuickSearch}
							<div class="flex justify-center">
								<span class="loading loading-dots loading-md text-primary" />
							</div>
							<div class="w-full text-center">searching...</div>
						{:else if quickSearchFiles.length > 0}
							<div class="w-full h-full max-h-[50vh] overflow-auto flex flex-col space-y-1">
								{#each quickSearchFiles as qsf, index}
									<a class="w-full p-1 text-left link-hover oveflow-hidden h-full max-h-[50px]" href="{base}/{$CurrentProject?.ProjectID}/storage/file/{qsf.ID}">{index + 1}: {qsf.Tags.length > 30 ? `${qsf.Tags.slice(0, 30)}...` : qsf.Tags}-{qsf.ContentType}</a>
								{/each}
							</div>
							<div class="w-full text-sm italic font-bold">Showing {quickSearchFiles.length} results...</div>
						{:else}
							<div class="w-full text-center font-bold text-lg">No results found...</div>
						{/if}
					</div>
				{/if}
			</div>
		</section>
		{#if IsProjectUserAuthorized([Shared.ProjectRoles.FILE_CREATOR])}
			<section class="flex-1 flex justify-end space-x-1">
				<div class="tooltip tooltip-left" data-tip="Upload files">
					<button
						class="btn btn-circle btn-secondary"
						on:click={() => {
							//@ts-expect-error
							document.getElementById('upload-files-dialog').showModal()
							showFileUploadDialog = true
						}}
					>
						<Icon type="mdi:plus" />
					</button>
				</div>
			</section>
		{/if}
	</header>
	<main class="flex-[9.5] overflow-hidden flex flex-col space-y-1">
		{#if $FilesSearchResults.length > 0}
			<div class="divider" />
			<Table Data={$FilesSearchResults} {HandleClickTableRow} {FilterModelTemplate} DataName="Files" CreatedFilterOptions={$FilesSearchCreatedFilterOptions} {HandleUpdateCreatedFilterOptions} {HandleUpdateFilterModelTemplate} IncludeIndividualDataRowCounter={false} IncludeIndividualRowNumber={false} />
			<div class="divider" />
		{:else}
			<div class="w-full h-full bg-gray-200 flex justify-center">
				<span class="text-2xl w-fit h-fit self-center flex">
					<span class="text-center text-primary">Upload files that can be used to perform data abstraction as well as manage files uploaded into the platform...</span>
				</span>
			</div>
		{/if}
	</main>
	<footer class="flex-[0.5] flex justify-between">
		<img src="{base}/icipe_logo.png" alt="icipe logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/university_of_oxford_logo.png" alt="university of oxford logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/vector_atlas_logo.png" alt="vector atlas logo" class="max-w-[10vw] max-h-[10vh] self-center" />
		<img src="{base}/malaria_atlas_project_logo.png" alt="malaria atlas logo" class="max-w-[10vw] max-h-[5vh] self-center" />
		<img src="{base}/bill_and_melinda_gates_logo.png" alt="bill and melinda gates foundation logo" class="max-w-[10vw] max-h-[5vh] self-center" />
	</footer>
</div>

<!-- upload file/files dialog -->
<dialog id="upload-files-dialog" class="modal">
	<form method="dialog" class="modal-box p-0 rounded min-w-[150px]">
		<header class="sticky flex justify-between bg-accent items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
			<span class="text-lg text-primary">File Upload</span>
			<button class="btn btn-circle btn-ghost flex justify-center">
				<Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} />
			</button>
		</header>
		{#if showFileUploadDialog}
			<main class="overflow-hidden p-2 space-y-2 w-full">
				<div class="flex join join-vertical">
					<span class="join-item join-label-primary join-label-content"><span>Common File Tag</span></span>
					<input class="join-item input input-primary w-full" placeholder="Enter common file tag (optional) e.g. 31121999 1218 Jane Doe..." bind:value={currentFilesCommonTag} />
				</div>
				<input class="file-input file-input-primary w-full" type="file" bind:files={currentFiles} bind:this={currentFilesElement} multiple />
				<div class="divider" />
				<div class="flex justify-between">
					<div class="flex space-x-1 h-fit">
						<span class="h-fit w-fit self-center text-lg font-bold">Pick Storage</span>
						<span class="w-fit h-fit self-center tooltip tooltip-right tooltip-primary" data-tip="Storage drive to store the file...">
							<Icon type="mdi:help-circle" color={Shared.Colors.NEUTRAL} />
						</span>
					</div>
					<button
						class="btn btn-circle btn-ghost h-fit w-fit p-0 self-center"
						on:click={(e) => {
							e.preventDefault()
							handleGetProjectStorage()
						}}
					>
						<Icon type="mdi:refresh" color={Shared.Colors.PRIMARY} />
					</button>
				</div>
				{#await handlePrepareProjectStorage()}
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
				{:then _}
					{#if $ProjectStorage.length > 0}
						<div class="overflow-auto max-h-[50vh] rounded-md">
							<table class="table w-full shadow-inner shadow-gray-800 rounded-md">
								<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0">
									<tr>
										<th>#</th>
										<th>Storage Name</th>
									</tr>
								</thead>
								<tbody>
									{#each $ProjectStorage as sqr}
										<tr>
											<td>
												<button
													class="btn btn-ghost w-fit h-fit"
													on:click={(e) => {
														e.preventDefault()
														currentStorageID = sqr.StorageID
													}}
												>
													<Icon type={currentStorageID === sqr.StorageID ? 'mdi:check' : 'mdi:close-thick'} color={currentStorageID === sqr.StorageID ? Shared.Colors.SUCCESS : Shared.Colors.ERROR} />
												</button>
											</td>
											<td><span class="break-words">{sqr.Storage.Name}</span></td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					{:else}
						<div class="w-full h-full bg-gray-200 flex justify-center">
							<span class="text-2xl w-fit h-fit self-center flex">
								<span class="text-center text-primary">No project storage options available...</span>
							</span>
						</div>
					{/if}
				{/await}
				<button
					class="btn btn-secondary w-full"
					on:click={(e) => {
						e.preventDefault()
						handleUploadFiles()
					}}>Upload files</button
				>
			</main>
		{/if}
	</form>
</dialog>
