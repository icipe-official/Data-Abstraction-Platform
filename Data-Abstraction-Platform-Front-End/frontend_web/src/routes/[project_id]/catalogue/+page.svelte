<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { base } from '$app/paths'
	import { PUBLIC_API_URL } from '$env/static/public'
	import DateTime from '$lib/components/DateTime.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import Table from '$lib/components/table/Table.svelte'
	import { FETCH_ERROR, LOGO_URL, Shared } from '$lib/constants'
	import type { ICatalogue } from '$lib/interface'
	import {
		CurrentProject,
		Loading,
		LoadingMessage,
		CataloguesSearchResults,
		SearchResultsClickedIndex,
		ToastMessage,
		ToastType,
		CataloguesSearchLimit,
		CataloguesSearchOffset,
		CataloguesSearchCurrentQuery,
		CataloguesSearchUseCurrentProject,
		CataloguesSearchCreatedOnGreaterThan,
		CataloguesSearchCreatedOnLessThan,
		CataloguesSearchLastUpdatedOnGreaterThan,
		CataloguesSearchLastUpdatedOnLessThan,
		CataloguesSearchSortBy,
		CataloguesSearchSortByOrder,
		CataloguesSearchPreviousQuery,

		CataloguesSearchCreatedFilterOptions

	} from '$lib/stores'
	import { IsProjectUserAuthorized, Log, ResetCataloguesStore } from '$lib/utils'
	import { onDestroy } from 'svelte'

	const CURRENT_SECTION = 'Catalogues'

	const mtCatalogue = {
		ID: {
			struct: 'root.ID text text name=ID&# disabled=true&#',
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
		Name: {
			struct: 'root.Name text text name=Name&#',
			value: ''
		},
		Description: {
			struct: 'root.Description text text name=Description&#',
			value: ''
		},
		CreatedOn: {
			struct: 'root.CreatedOn text datetime name=Created On&# dtf=yyyy-mm-dd HH:MM&#',
			value: ''
		},
		LastUpdatedOn: {
			struct: 'root.LastUpdatedOn text datetime name=Last Updated On&# dtf=yyyy-mm-dd HH:MM&#',
			value: ''
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

	let FilterModelTemplate = JSON.stringify(mtCatalogue)
	const HandleUpdateFilterModelTemplate = (value: string) => (FilterModelTemplate = value)
	function handleInputSearchResultsLimit(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$CataloguesSearchLimit = parseInt(value)
		if ($CataloguesSearchLimit < 5) {
			$CataloguesSearchLimit = 5
		} else if ($CataloguesSearchLimit < $CataloguesSearchOffset) {
			if ($CataloguesSearchLimit - 1000 < 0) {
				$CataloguesSearchOffset = 0
			} else {
				$CataloguesSearchOffset = $CataloguesSearchLimit - 1000
			}
		}
	}
	function handleInputSearchResultsOffset(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$CataloguesSearchOffset = parseInt(value)
		if ($CataloguesSearchOffset < 0) {
			$CataloguesSearchOffset = 0
		} else if ($CataloguesSearchOffset > $CataloguesSearchLimit) {
			$CataloguesSearchLimit = $CataloguesSearchOffset + 1000
		}
	}
	async function handleSearchCatalogue() {
		$Loading = true
		$LoadingMessage = 'Searching catalogues...'
		showFilter = false
		try {
			let url = new URL(`${PUBLIC_API_URL}/catalogue`)
			if ($CataloguesSearchCurrentQuery.length > 1) {
				url.searchParams.append('sq', $CataloguesSearchCurrentQuery)
			}
			if ($CataloguesSearchUseCurrentProject) {
				url.searchParams.append('pid', $CurrentProject?.ProjectID as string)
			}
			if ($CataloguesSearchCreatedOnGreaterThan != '') {
				url.searchParams.append('cogt', $CataloguesSearchCreatedOnGreaterThan)
			}
			if ($CataloguesSearchCreatedOnLessThan != '') {
				url.searchParams.append('colt', $CataloguesSearchCreatedOnLessThan)
			}
			if ($CataloguesSearchLastUpdatedOnGreaterThan != '') {
				url.searchParams.append('lugt', $CataloguesSearchLastUpdatedOnGreaterThan)
			}
			if ($CataloguesSearchLastUpdatedOnLessThan != '') {
				url.searchParams.append('lult', $CataloguesSearchLastUpdatedOnLessThan)
			}
			url.searchParams.append('l', `${$CataloguesSearchLimit}`)
			url.searchParams.append('o', `${$CataloguesSearchOffset}`)
			url.searchParams.append('sb', $CataloguesSearchSortBy)
			url.searchParams.append('sbo', $CataloguesSearchSortByOrder)
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$CataloguesSearchResults = data !== null ? data : []
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

	function HandleClickTableRow(index: number) {
		$SearchResultsClickedIndex = index
		goto(`${base}/${$CurrentProject?.ProjectID}/catalogue/${$CataloguesSearchResults[index].ID}`)
	}

	function HandleUpdateCreatedFilterOptions(value: any) {
		$CataloguesSearchCreatedFilterOptions = value
		if (Object.keys($CataloguesSearchCreatedFilterOptions).length < 1) {
			FilterModelTemplate = JSON.stringify(mtCatalogue)
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, $CataloguesSearchCreatedFilterOptions, 'Updated Filter options')
	}

	let showFilter = false
	const setShowFilter = (value: boolean) => (showFilter = value)

	let quickSearchCatalogues: ICatalogue[] = []
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
				quickSearchCatalogues = []
				try {
					let url = new URL(`${PUBLIC_API_URL}/catalogue`)
					if ($CataloguesSearchUseCurrentProject) {
						url.searchParams.append('pid', $CurrentProject?.ProjectID as string)
					}
					if ($CataloguesSearchCreatedOnGreaterThan != '') {
						url.searchParams.append('cogt', $CataloguesSearchCreatedOnGreaterThan)
					}
					if ($CataloguesSearchCreatedOnLessThan != '') {
						url.searchParams.append('colt', $CataloguesSearchCreatedOnLessThan)
					}
					if ($CataloguesSearchLastUpdatedOnGreaterThan != '') {
						url.searchParams.append('lugt', $CataloguesSearchLastUpdatedOnGreaterThan)
					}
					if ($CataloguesSearchLastUpdatedOnLessThan != '') {
						url.searchParams.append('lult', $CataloguesSearchLastUpdatedOnLessThan)
					}
					url.searchParams.append('l', `20`)
					url.searchParams.append('o', `0`)
					url.searchParams.append('qs', 'true')
					url.searchParams.append('sb', 'last_updated_on')
					url.searchParams.append('sbo', 'desc')
					const fetchResponse = await fetch(url, {
						credentials: 'include'
					})
					const data = await fetchResponse.json()
					if (fetchResponse.ok) {
						quickSearchCatalogues = data !== null ? data : []
					} else {
						$ToastType = Shared.ToastType.ERROR
						$ToastMessage = data.message
					}
				} catch {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = FETCH_ERROR
				}
				performingQuickSearch = false
				$CataloguesSearchPreviousQuery = $CataloguesSearchCurrentQuery
				Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, quickSearchCatalogues, 'Quick search catalogues')
			}, 2000)
		}
	}
	$: if ($CataloguesSearchPreviousQuery !== $CataloguesSearchCurrentQuery && searchBarFocused) {
		setupQuickSearchTimeout()
	}

	$: if (browser) {
		document.addEventListener('keydown', handleClickEnter)
	}
	function handleClickEnter(e: KeyboardEvent) {
		if (e.key === 'Enter' && (showFilter || searchBarFocused)) {
			window.clearTimeout(quickSearchTimeout)
			performingQuickSearch = false
			quickSearchCatalogues = []
			handleSearchCatalogue()
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
			<a class="flex-[0.5] flex tooltip tooltip-right btn-ghost rounded-md p-1" data-tip="Need help? Watch a mini-tutorial" href="https://vimeo.com/886797997?share=copy" target="_blank">
				<img src={LOGO_URL} alt="data admin logo" class="max-w-[5vw] max-h-[5vh] self-center" />
				<div class="w-fit h-fit">
					<Icon type="mdi:help-circle" iconSize="23" color={Shared.Colors.PRIMARY} />
				</div>
			</a>
		</section>
		<section class="flex-[9] flex flex-col justify-center">
			<div class="form-control w-[90%]">
				<span class="join">
					<input
						class="join-item flex-[9.5] input input-secondary w-full shadow-sm shadow-gray-600"
						type="search"
						placeholder="Search catalogue..."
						bind:value={$CataloguesSearchCurrentQuery}
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
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={handleSearchCatalogue}>
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
								<input type="checkbox" class="checkbox checkbox-primary" bind:checked={$CataloguesSearchUseCurrentProject} />
							</label>
						</section>
						<section class="flex flex-col space-y-1">
							<div class="text-md">Date range for when catalogues were created...</div>
							<div class="join w-full">
								<DateTime bind:Value={$CataloguesSearchCreatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$CataloguesSearchCreatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
							<div class="divider" />
							<div class="text-md">Date range for when catalogues were last updated...</div>
							<div class="join w-full">
								<DateTime bind:Value={$CataloguesSearchLastUpdatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$CataloguesSearchLastUpdatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Maximum no. of results</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter maximum no. of results to show..." value={$CataloguesSearchLimit} on:input={(e) => handleInputSearchResultsLimit(e.currentTarget.value)} />
							</span>
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">No. of results to skip</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter no. of results to skip..." value={$CataloguesSearchOffset} on:input={(e) => handleInputSearchResultsOffset(e.currentTarget.value)} />
							</span>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Sort by</span>
								<div class="join-item join join-horizontal w-full">
									<select class="join-item select select-primary flex-1" bind:value={$CataloguesSearchSortBy}>
										<option selected={$CataloguesSearchSortBy === ''} value="" disabled>Sorty By...</option>
										<option selected={$CataloguesSearchSortBy === 'created_on'} value="created_on">Created on</option>
										<option selected={$CataloguesSearchSortBy === 'last_updated_on'} value="last_updated_on">Last updated on</option>
									</select>
									<select class="join-item select select-primary flex-1" bind:value={$CataloguesSearchSortByOrder}>
										<option selected={$CataloguesSearchSortByOrder === ''} value="" disabled>Sorty By Order...</option>
										<option selected={$CataloguesSearchSortByOrder === 'asc'} value="asc">Least recent first</option>
										<option selected={$CataloguesSearchSortByOrder === 'desc'} value="desc">Most recent first</option>
									</select>
								</div>
							</span>
						</section>
						<button class="btn btn-secondary self-center w-full max-w-[350px] h-fit" on:click={ResetCataloguesStore}> reset </button>
					</div>
				{/if}
				{#if (searchBarFocused || quickSearchResultsFocused) && (performingQuickSearch || quickSearchCatalogues.length > 0)}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<!-- svelte-ignore a11y-mouse-events-have-key-events -->
					<div class="absolute top-0 left-0 bg-white rounded-md p-1 w-[90%] shadow-md shadow-gray-800 mt-1 flex flex-col space-y-1 justify-center z-[100] overflow-hidden" on:mouseover={() => (quickSearchResultsFocused = true)} on:mouseleave={() => (quickSearchResultsFocused = false)}>
						{#if performingQuickSearch}
							<div class="flex justify-center">
								<span class="loading loading-dots loading-md text-primary" />
							</div>
							<div class="w-full text-center">searching...</div>
						{:else if quickSearchCatalogues.length > 0}
							<div class="w-full h-full max-h-[50vh] overflow-auto flex flex-col space-y-1">
								{#each quickSearchCatalogues as qsc, index}
									<a class="w-full p-1 text-left link-hover oveflow-hidden" href="{base}/{$CurrentProject?.ProjectID}/catalogue/{qsc.ID}"
										>{index + 1}: {qsc.Name.length > 30 ? `${qsc.Name.slice(0, 30)}...` : qsc.Name}-{qsc.Description.length > 30 ? `${qsc.Description.slice(0, 30)}...` : qsc.Description}</a
									>
								{/each}
							</div>
							<div class="w-full text-sm italic font-bold">Showing {quickSearchCatalogues.length} results...</div>
						{:else}
							<div class="w-full text-center font-bold text-lg">No results found...</div>
						{/if}
					</div>
				{/if}
			</div>
		</section>
		{#if IsProjectUserAuthorized([Shared.ProjectRoles.CATALOGUE_CREATOR])}
			<section class="flex-1 flex justify-end space-x-1">
				<div class="tooltip tooltip-left" data-tip="Create new catalogue">
					<a class="flex btn btn-circle btn-secondary justify-center" href="{base}/{$CurrentProject?.ProjectID}/catalogue/new">
						<span class="w-fit h-fit self-center"><Icon type="mdi:plus" /></span>
					</a>
				</div>
			</section>
		{/if}
	</header>
	<main class="flex-[9.5] overflow-hidden flex flex-col space-y-1">
		{#if $CataloguesSearchResults.length > 0}
			<div class="divider" />
			<Table Data={$CataloguesSearchResults} {HandleClickTableRow} {FilterModelTemplate} DataName="Catalogue" CreatedFilterOptions={$CataloguesSearchCreatedFilterOptions} {HandleUpdateCreatedFilterOptions} {HandleUpdateFilterModelTemplate} IncludeIndividualDataRowCounter={false} IncludeIndividualRowNumber={false} />
			<div class="divider" />
		{:else}
			<div class="w-full h-full bg-gray-200 flex justify-center">
				<span class="text-2xl w-fit h-fit self-center flex">
					<span class="text-center text-primary">Create a catalogue e.g., list of countries, species etc. for use as dropdown options across multiple templates as well as download existing catalogues...</span>
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
