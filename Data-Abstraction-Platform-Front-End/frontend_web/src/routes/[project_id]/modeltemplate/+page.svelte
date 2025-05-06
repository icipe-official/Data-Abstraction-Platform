<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { base } from '$app/paths'
	import { PUBLIC_API_URL } from '$env/static/public'
	import DateTime from '$lib/components/DateTime.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import Table from '$lib/components/table/Table.svelte'
	import { Shared, FETCH_ERROR, LOGO_URL } from '$lib/constants'
	import type { IModelTemplate } from '$lib/interface'
	import {
		Loading,
		LoadingMessage,
		ToastType,
		ToastMessage,
		ModelTemplatesSearchResults,
		CurrentProject,
		SearchResultsClickedIndex,
		ModelTemplatesSearchLimit,
		ModelTemplatesSearchOffset,
		ModelTemplatesSearchCurrentQuery,
		ModelTemplatesSearchPreviousQuery,
		ModelTemplatesSearchUseCurrentProject,
		ModelTemplatesSearchCreatedOnGreaterThan,
		ModelTemplatesSearchCreatedOnLessThan,
		ModelTemplatesSearchLastUpdatedOnGreaterThan,
		ModelTemplatesSearchLastUpdatedOnLessThan,
		ModelTemplatesSearchSortBy,
		ModelTemplatesSearchSortByOrder,

		ModelTemplatesSearchCreatedFilterOptions

	} from '$lib/stores'
	import { IsProjectUserAuthorized, Log, ResetModelTemplatesStore } from '$lib/utils'
	import { onDestroy } from 'svelte'

	const CURRENT_SECTION = 'Model Templates'

	const mtModelTemplate = {
		ID: {
			struct: 'root.ID text text name=ID&# disabled=true&#',
			value: ''
		},
		DirectoryID: {
			struct: 'root.DirectoryID text text name=Creator ID&# disabled=true&#',
			value: ''
		},
		ProjectID: {
			struct: 'root.ProjectID text text name=Project ID&# disabled=true&#',
			value: ''
		},
		TemplateName: {
			struct: 'root.TemplateName text text name=Template Name&#',
			value: ''
		},
		DataName: {
			struct: 'root.DataName text text name=Data Name&#',
			value: ''
		},
		Description: {
			struct: 'root.Description text text name=Description&#'
		},
		CreatedOn: {
			struct: 'root.CreatedOn text datetime name=Created On&# dtf=yyyy-mm-dd HH:MM&#',
			value: ''
		},
		LastUpdatedOn: {
			struct: 'root.LastUpdatedOn text datetime name=Last Updated On&# dtf=yyyy-mm-dd HH:MM&#',
			value: ''
		},
		VerificationQuorum: {
			struct: 'root.VerificationQuorum number number name=Verification Quorum&# disabled=true&#',
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

	let FilterModelTemplate = JSON.stringify(mtModelTemplate)
	const HandleUpdateFilterModelTemplate = (value: string) => (FilterModelTemplate = value)

	function handleInputSearchResultsLimit(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$ModelTemplatesSearchLimit = parseInt(value)
		if ($ModelTemplatesSearchLimit < 5) {
			$ModelTemplatesSearchLimit = 0
		} else if ($ModelTemplatesSearchLimit < $ModelTemplatesSearchOffset) {
			if ($ModelTemplatesSearchLimit - 1000 < 0) {
				$ModelTemplatesSearchOffset = 0
			} else {
				$ModelTemplatesSearchOffset = $ModelTemplatesSearchLimit - 1000
			}
		}
	}
	function handleInputSearchResultsOffset(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$ModelTemplatesSearchOffset = parseInt(value)
		if ($ModelTemplatesSearchOffset < 0) {
			$ModelTemplatesSearchOffset = 0
		} else if ($ModelTemplatesSearchOffset > $ModelTemplatesSearchLimit) {
			$ModelTemplatesSearchLimit = $ModelTemplatesSearchOffset + 1000
		}
	}
	async function handleSearchModelTemplates() {
		$Loading = true
		$LoadingMessage = 'Searching model templates...'
		showFilter = false
		try {
			let url = new URL(`${PUBLIC_API_URL}/modeltemplate`)
			if ($ModelTemplatesSearchCurrentQuery.length > 1) {
				url.searchParams.append('sq', $ModelTemplatesSearchCurrentQuery)
			}
			if ($ModelTemplatesSearchUseCurrentProject) {
				url.searchParams.append('pid', $CurrentProject?.ProjectID as string)
			}
			if ($ModelTemplatesSearchCreatedOnGreaterThan != '') {
				url.searchParams.append('cogt', $ModelTemplatesSearchCreatedOnGreaterThan)
			}
			if ($ModelTemplatesSearchCreatedOnLessThan != '') {
				url.searchParams.append('colt', $ModelTemplatesSearchCreatedOnLessThan)
			}
			if ($ModelTemplatesSearchLastUpdatedOnGreaterThan != '') {
				url.searchParams.append('lugt', $ModelTemplatesSearchLastUpdatedOnGreaterThan)
			}
			if ($ModelTemplatesSearchLastUpdatedOnLessThan != '') {
				url.searchParams.append('lult', $ModelTemplatesSearchLastUpdatedOnLessThan)
			}
			url.searchParams.append('l', `${$ModelTemplatesSearchLimit}`)
			url.searchParams.append('o', `${$ModelTemplatesSearchOffset}`)
			url.searchParams.append('sb', $ModelTemplatesSearchSortBy)
			url.searchParams.append('sbo', $ModelTemplatesSearchSortByOrder)
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ModelTemplatesSearchResults = data !== null ? data : []
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `${data !== null ? data.length : 0} results found`
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e)
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

	function HandleClickTableRow(index: number) {
		$SearchResultsClickedIndex = index
		goto(`${base}/${$CurrentProject?.ProjectID}/modeltemplate/${$ModelTemplatesSearchResults[index].ID}`)
	}

	function HandleUpdateCreatedFilterOptions(value: any) {
		$ModelTemplatesSearchCreatedFilterOptions = value
		if (Object.keys($ModelTemplatesSearchCreatedFilterOptions).length < 1) {
			FilterModelTemplate = JSON.stringify(mtModelTemplate)
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, $ModelTemplatesSearchCreatedFilterOptions, 'Updated Filter options')
	}

	let showFilter = false
	const setShowFilter = (value: boolean) => (showFilter = value)

	let quickSearchModelTemplates: IModelTemplate[] = []
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
				quickSearchModelTemplates = []
				try {
					let url = new URL(`${PUBLIC_API_URL}/modeltemplate`)
					if ($ModelTemplatesSearchCurrentQuery.length > 1) {
						url.searchParams.append('sq', $ModelTemplatesSearchCurrentQuery)
					}
					if ($ModelTemplatesSearchUseCurrentProject) {
						url.searchParams.append('pid', $CurrentProject?.ProjectID as string)
					}
					if ($ModelTemplatesSearchCreatedOnGreaterThan != '') {
						url.searchParams.append('cogt', $ModelTemplatesSearchCreatedOnGreaterThan)
					}
					if ($ModelTemplatesSearchCreatedOnLessThan != '') {
						url.searchParams.append('colt', $ModelTemplatesSearchCreatedOnLessThan)
					}
					if ($ModelTemplatesSearchLastUpdatedOnGreaterThan != '') {
						url.searchParams.append('lugt', $ModelTemplatesSearchLastUpdatedOnGreaterThan)
					}
					if ($ModelTemplatesSearchLastUpdatedOnLessThan != '') {
						url.searchParams.append('lult', $ModelTemplatesSearchLastUpdatedOnLessThan)
					}
					url.searchParams.append('l', '20')
					url.searchParams.append('o', '0')
					url.searchParams.append('qs', 'true')
					url.searchParams.append('sb', 'last_updated_on')
					url.searchParams.append('sbo', 'desc')
					const fetchResponse = await fetch(url, {
						credentials: 'include'
					})
					const data = await fetchResponse.json()
					if (fetchResponse.ok) {
						quickSearchModelTemplates = data !== null ? data : []
					} else {
						$ToastType = Shared.ToastType.ERROR
						$ToastMessage = data.message
					}
				} catch {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = FETCH_ERROR
				}
				performingQuickSearch = false
				$ModelTemplatesSearchPreviousQuery = $ModelTemplatesSearchCurrentQuery
				Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, quickSearchModelTemplates, 'Quick search model-templates')
			}, 2000)
		}
	}
	$: if ($ModelTemplatesSearchPreviousQuery !== $ModelTemplatesSearchCurrentQuery && searchBarFocused) {
		setupQuickSearchTimeout()
	}

	$: if (browser) {
		document.addEventListener('keydown', handleClickEnter)
	}
	function handleClickEnter(e: KeyboardEvent) {
		if (e.key === 'Enter' && (showFilter || searchBarFocused)) {
			window.clearTimeout(quickSearchTimeout)
			performingQuickSearch = false
			quickSearchModelTemplates = []
			handleSearchModelTemplates()
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
			<a class="flex-[0.5] flex tooltip tooltip-right btn-ghost rounded-md p-1" data-tip="Need help? Watch a mini-tutorial" href="https://vimeo.com/886765717?share=copy#t=0" target="_blank">
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
						placeholder="Search model templates..."
						bind:value={$ModelTemplatesSearchCurrentQuery}
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
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={handleSearchModelTemplates}>
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
								<input type="checkbox" class="checkbox checkbox-primary" bind:checked={$ModelTemplatesSearchUseCurrentProject} />
							</label>
						</section>
						<section class="flex flex-col space-y-1">
							<div class="text-md">Date range for when model-templates were created...</div>
							<div class="join w-full">
								<DateTime bind:Value={$ModelTemplatesSearchLastUpdatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$ModelTemplatesSearchLastUpdatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
							<div class="divider" />
							<div class="text-md">Date range for when model-templates were last updated...</div>
							<div class="join w-full">
								<DateTime bind:Value={$ModelTemplatesSearchLastUpdatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$ModelTemplatesSearchLastUpdatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Maximum no. of results</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter maximum no. of results to show..." value={$ModelTemplatesSearchLimit} on:input={(e) => handleInputSearchResultsLimit(e.currentTarget.value)} />
							</span>
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">No. of results to skip</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter no. of results to skip..." value={$ModelTemplatesSearchOffset} on:input={(e) => handleInputSearchResultsOffset(e.currentTarget.value)} />
							</span>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Sort by</span>
								<div class="join-item join join-horizontal w-full">
									<select class="join-item select select-primary flex-1" bind:value={$ModelTemplatesSearchSortBy}>
										<option selected={$ModelTemplatesSearchSortBy === ''} value="" disabled>Sorty By...</option>
										<option selected={$ModelTemplatesSearchSortBy === 'created_on'} value="created_on">Created on</option>
										<option selected={$ModelTemplatesSearchSortBy === 'last_updated_on'} value="last_updated_on">Last updated on</option>
									</select>
									<select class="join-item select select-primary flex-1" bind:value={$ModelTemplatesSearchSortByOrder}>
										<option selected={$ModelTemplatesSearchSortByOrder === ''} value="" disabled>Sorty By Order...</option>
										<option selected={$ModelTemplatesSearchSortByOrder === 'asc'} value="asc">Least recent first</option>
										<option selected={$ModelTemplatesSearchSortByOrder === 'desc'} value="desc">Most recent first</option>
									</select>
								</div>
							</span>
						</section>
						<button class="btn btn-secondary self-center w-full max-w-[350px] h-fit" on:click={ResetModelTemplatesStore}>reset</button>
					</div>
				{/if}
				{#if (searchBarFocused || quickSearchResultsFocused) && (performingQuickSearch || quickSearchModelTemplates.length > 0)}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<!-- svelte-ignore a11y-mouse-events-have-key-events -->
					<div class="absolute top-0 left-0 bg-white rounded-md p-1 w-[90%] shadow-md shadow-gray-800 mt-1 flex flex-col space-y-1 justify-center z-[100] overflow-hidden" on:mouseover={() => (quickSearchResultsFocused = true)} on:mouseleave={() => (quickSearchResultsFocused = false)}>
						{#if performingQuickSearch}
							<div class="flex justify-center">
								<span class="loading loading-dots loading-md text-primary" />
							</div>
							<div class="w-full text-center">searching...</div>
						{:else if quickSearchModelTemplates.length > 0}
							<div class="w-full h-full max-h-[50vh] overflow-auto flex flex-col space-y-1">
								{#each quickSearchModelTemplates as qsmt, index}
									<a class="w-full p-1 text-left link-hover oveflow-hidden" href="{base}/{$CurrentProject?.ProjectID}/modeltemplate/{qsmt.ID}"
										>{index + 1}: {qsmt.TemplateName.length > 30 ? `${qsmt.TemplateName.slice(0, 30)}...` : qsmt.TemplateName}-{qsmt.Description.length > 30 ? `${qsmt.Description.slice(0, 30)}...` : qsmt.Description}</a
									>
								{/each}
							</div>
							<div class="w-full text-sm italic font-bold">Showing {quickSearchModelTemplates.length} results...</div>
						{:else}
							<div class="w-full text-center font-bold text-lg">No results found...</div>
						{/if}
					</div>
				{/if}
			</div>
		</section>
		{#if IsProjectUserAuthorized([Shared.ProjectRoles.MODEL_TEMPLATES_CREATOR])}
			<section class="flex-1 flex justify-end">
				<div class="tooltip tooltip-left" data-tip="Create new template">
					<a class="flex btn btn-circle btn-secondary justify-center" href="{base}/{$CurrentProject?.ProjectID}/modeltemplate/new">
						<span class="w-fit h-fit self-center"><Icon type="mdi:plus" /></span>
					</a>
				</div>
			</section>
		{/if}
	</header>
	<main class="flex-[9.5] flex flex-col overflow-hidden space-y-1">
		{#if $ModelTemplatesSearchResults.length > 0}
			<div class="divider" />
			<Table
				Data={JSON.parse(JSON.stringify($ModelTemplatesSearchResults))}
				{HandleClickTableRow}
				{FilterModelTemplate}
				DataName="Model Templates"
				CreatedFilterOptions={$ModelTemplatesSearchCreatedFilterOptions}
				{HandleUpdateCreatedFilterOptions}
				{HandleUpdateFilterModelTemplate}
				IncludeIndividualDataRowCounter={false}
				IncludeIndividualRowNumber={false}
			/>
			<div class="divider" />
		{:else}
			<div class="w-full h-full bg-gray-200 flex justify-center">
				<span class="text-2xl w-fit h-fit self-center flex">
					<span class="text-center text-primary">Create and manage model templates that can be used for doing abstraction or surveys...</span>
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
