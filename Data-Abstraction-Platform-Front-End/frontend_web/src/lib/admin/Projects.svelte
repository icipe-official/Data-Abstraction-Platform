<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public'
	import Icon from '$lib/components/Icon.svelte'
	import { FETCH_ERROR, NIL_DATE_TIME, Shared } from '$lib/constants'
	import {
		Loading,
		LoadingMessage,
		ProjectsSearchLimit,
		ProjectsSearchOffset,
		ProjectsSearchCurrentQuery,
		ProjectsSearchCreatedFilterOptions,
		ProjectsSearchCreatedOnGreaterThan,
		ProjectsSearchCreatedOnLessThan,
		ProjectsSearchLastUpdatedOnGreaterThan,
		ProjectsSearchLastUpdatedOnLessThan,
		ProjectsSearchPreviousQuery,
		ProjectsSearchSortBy,
		ProjectsSearchResults,
		ProjectsSearchSortByOrder,
		ToastType,
		ToastMessage,
		SearchResultsClickedIndex,
		DirectorySearchCurrentQuery,
		DirectorySearchResults,
		StoragesSearchResults,
		CurrentUser
	} from '$lib/stores'
	import { AreValuesEqual, Log, SetValueInObject, ResetProjectsStore } from '$lib/utils'
	import { onDestroy } from 'svelte'
	import DateTime from '$lib/components/DateTime.svelte'
	import { base } from '$app/paths'
	import Table from '$lib/components/table/Table.svelte'

	const CURRENT_SECTION = 'Admin Projects'

	const mtProjects = {
		ID: {
			struct: 'root.ID text text name=ID&# disabled=true&#',
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
			struct: 'root.LastUpdatedOn text datetime name=Last Updated On&# dtf=yyyy-mm-dd HH:MM&# disabled=true&#',
			value: ''
		},
		OwnerDirectoryID: {
			struct: 'root.OwnerDirectoryID text text name=Owner ID&# disabled=true&#',
			value: ''
		},
		OwnerDirectoryName: {
			struct: 'root.OwnerDirectoryName text text name=Owner Name&#',
			value: ''
		},
		OwnerDirectoryContacts: {
			struct: 'root.OwnerDirectoryContacts text text name=Owner Contacts&#',
			value: ''
		},
		Storage: {
			struct: 'root.Storage repetitive name=Storage Drives&#',
			value: [
				{
					StorageID: {
						struct: 'root.Storage.value[x].StorageID text text name=Storage ID&# disabled=true&#',
						value: ''
					},
					StorageName: {
						struct: 'root.Storage.value[x].StorageName text text name=Storage Name&#',
						value: ''
					}
				}
			]
		}
	}

	let FilterModelTemplate = JSON.stringify(mtProjects)
	const HandleUpdateFilterModelTemplate = (value: string) => (FilterModelTemplate = value)

	function handleInputSearchResultsLimit(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$ProjectsSearchLimit = parseInt(value)
		if ($ProjectsSearchLimit < 5) {
			$ProjectsSearchLimit = 0
		} else if ($ProjectsSearchLimit < $ProjectsSearchOffset) {
			if ($ProjectsSearchLimit - 1000 < 0) {
				$ProjectsSearchOffset = 0
			} else {
				$ProjectsSearchOffset = $ProjectsSearchLimit - 1000
			}
		}
	}
	function handleInputSearchResultsOffset(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$ProjectsSearchOffset = parseInt(value)
		if ($ProjectsSearchOffset < 0) {
			$ProjectsSearchOffset = 0
		} else if ($ProjectsSearchOffset > $ProjectsSearchLimit) {
			$ProjectsSearchLimit = $ProjectsSearchOffset + 1000
		}
	}

	let showFilter = false

	async function handleSearchProjects() {
		$Loading = true
		$LoadingMessage = 'Searching projects...'
		showFilter = false
		try {
			let url = new URL(`${PUBLIC_API_URL}/projects`)
			if ($ProjectsSearchCurrentQuery.length > 1) {
				url.searchParams.append('sq', $ProjectsSearchCurrentQuery)
			}
			if ($ProjectsSearchCreatedOnGreaterThan != '') {
				url.searchParams.append('cogt', $ProjectsSearchCreatedOnGreaterThan)
			}
			if ($ProjectsSearchCreatedOnLessThan != '') {
				url.searchParams.append('colt', $ProjectsSearchCreatedOnLessThan)
			}
			if ($ProjectsSearchLastUpdatedOnGreaterThan != '') {
				url.searchParams.append('lugt', $ProjectsSearchLastUpdatedOnGreaterThan)
			}
			if ($ProjectsSearchLastUpdatedOnLessThan != '') {
				url.searchParams.append('lult', $ProjectsSearchLastUpdatedOnLessThan)
			}
			url.searchParams.append('l', `${$ProjectsSearchLimit}`)
			url.searchParams.append('o', `${$ProjectsSearchOffset}`)
			url.searchParams.append('sb', $ProjectsSearchSortBy)
			url.searchParams.append('sbo', $ProjectsSearchSortByOrder)
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ProjectsSearchResults = data !== null ? data : []
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

	function HandleUpdateCreatedFilterOptions(value: any) {
		$ProjectsSearchCreatedFilterOptions = value
		if (Object.keys($ProjectsSearchCreatedFilterOptions).length < 1) {
			FilterModelTemplate = JSON.stringify(mtProjects)
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, $ProjectsSearchCreatedFilterOptions, 'Updated Filter options')
	}

	let currentProjectOwner: {
		OwnerDirectoryID: string
		OwnerDirectoryName: string
		OwnerDirectoryContacts: string[]
	} | null = null

	async function handleSearchDirectory() {
		$Loading = true
		$LoadingMessage = 'Searching directory...'
		showFilter = false
		try {
			let url = new URL(`${PUBLIC_API_URL}/directory`)
			if ($DirectorySearchCurrentQuery.length > 1) {
				url.searchParams.append('sq', $DirectorySearchCurrentQuery)
			}
			url.searchParams.append('l', '20')
			url.searchParams.append('sb', 'last_updated_on')
			url.searchParams.append('sbo', 'desc')
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$DirectorySearchResults = data !== null ? data : []
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

	let currentName = ''
	let currentNameError: string | null = null
	const DEFAULT_CURRENT_NAME_ERROR = 'Give this new project a name...'
	function handleInputCurrentName(value: string) {
		currentName = value
		if (currentName.length < 3) currentNameError = DEFAULT_CURRENT_NAME_ERROR
		else currentNameError = null
	}

	let currentDescription = ''
	let currentDescriptionError: string | null = null
	const DEFAULT_CURRENT_DESCRIPTION_ERROR = 'Give this new project a description...'
	function handleInputCurrentDescription(value: string) {
		currentDescription = value
		if (currentDescription.length < 3) currentDescriptionError = DEFAULT_CURRENT_DESCRIPTION_ERROR
		else currentDescriptionError = null
	}

	let currentIsActive = false

	onDestroy(() => ($SearchResultsClickedIndex = null))

	let currentProjectStorage: { StorageID: string; StorageName: string }[] | null = null
	function isStorageAvailableInProject(StorageID: string) {
		if (currentProjectStorage !== null) {
			for (let cps of currentProjectStorage) {
				if (cps.StorageID === StorageID) {
					return true
				}
			}
		}
		return false
	}

	function HandleClickTableRow(index: number) {
		$SearchResultsClickedIndex = index
		currentName = $ProjectsSearchResults[index].Name
		currentDescription = $ProjectsSearchResults[index].Description
		currentIsActive = $ProjectsSearchResults[index].IsActive
		currentProjectStorage = $ProjectsSearchResults[index].Storage
		currentProjectOwner = {
			OwnerDirectoryID: $ProjectsSearchResults[index].OwnerDirectoryID,
			OwnerDirectoryName: $ProjectsSearchResults[index].OwnerDirectoryName,
			OwnerDirectoryContacts: $ProjectsSearchResults[index].OwnerDirectoryContacts
		}
		//@ts-expect-error
		document.getElementById('manage-project-dialog').showModal()
	}

	function resetProjectsFields() {
		currentName = ''
		currentNameError = null
		currentDescription = ''
		currentDescriptionError = null
		currentIsActive = false
		currentProjectStorage = null
		currentProjectOwner = null
		$SearchResultsClickedIndex = null
	}

	async function handleCreateUpdateProject() {
		if ($CurrentUser?.SystemUserCreatedOn === NIL_DATE_TIME) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Not Authorized to perform this action'
			return
		}
		if (currentName.length < 3) {
			currentNameError = DEFAULT_CURRENT_NAME_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Current project name is not valid'
			return
		} else currentNameError = null
		if (currentDescription.length < 3) {
			currentDescriptionError = DEFAULT_CURRENT_DESCRIPTION_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Current description is not valid'
			return
		} else currentDescriptionError = null
		if (currentProjectOwner === null) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Project has no owner'
			return
		}
		if ($SearchResultsClickedIndex !== null && $ProjectsSearchResults[$SearchResultsClickedIndex].ID) {
			if (
				$ProjectsSearchResults[$SearchResultsClickedIndex].Name === currentName &&
				$ProjectsSearchResults[$SearchResultsClickedIndex].Description === currentDescription &&
				$ProjectsSearchResults[$SearchResultsClickedIndex].IsActive === currentIsActive &&
				AreValuesEqual($ProjectsSearchResults[$SearchResultsClickedIndex].Storage, currentProjectStorage)
			) {
				$ToastType = Shared.ToastType.INFO
				$ToastMessage = 'No changes detected'
				return
			}
			if ($ProjectsSearchResults[$SearchResultsClickedIndex].Name !== currentName || $ProjectsSearchResults[$SearchResultsClickedIndex].Description !== currentDescription || $ProjectsSearchResults[$SearchResultsClickedIndex].IsActive !== currentIsActive) {
				let projectInfoToUpdate: any = {}
				if ($ProjectsSearchResults[$SearchResultsClickedIndex].Name !== currentName) {
					projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Project.Name', currentName)
					projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Columns', ['name'])
				}
				if ($ProjectsSearchResults[$SearchResultsClickedIndex].Description !== currentDescription) {
					projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Project.Description', currentDescription)
					if (Object.hasOwn(projectInfoToUpdate, 'Columns') && projectInfoToUpdate['Columns'].length > 0) {
						projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Columns', [...projectInfoToUpdate['Columns'], 'description'])
					} else {
						projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Columns', ['description'])
					}
				}
				if ($ProjectsSearchResults[$SearchResultsClickedIndex].IsActive !== currentIsActive) {
					projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Project.IsActive', currentIsActive)
					if (Object.hasOwn(projectInfoToUpdate, 'Columns') && projectInfoToUpdate['Columns'].length > 0) {
						projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Columns', [...projectInfoToUpdate['Columns'], 'is_active'])
					} else {
						projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Columns', ['is_active'])
					}
				}
				$Loading = true
				$LoadingMessage = 'Updating project info...'
				try {
					const fetchResponse = await fetch(`${PUBLIC_API_URL}/projects/${$ProjectsSearchResults[$SearchResultsClickedIndex].ID}`, {
						method: 'PUT',
						credentials: 'include',
						body: JSON.stringify(projectInfoToUpdate)
					})
					const data = await fetchResponse.json()
					if (fetchResponse.ok) {
						$ToastType = Shared.ToastType.SUCCESS
						$ToastMessage = `Project ${data.ID} updated`
						if ($ProjectsSearchResults[$SearchResultsClickedIndex].Name !== currentName) {
							$ProjectsSearchResults[$SearchResultsClickedIndex].Name = currentName
						}
						if ($ProjectsSearchResults[$SearchResultsClickedIndex].Description !== currentDescription) {
							$ProjectsSearchResults[$SearchResultsClickedIndex].Description = currentDescription
						}
						if ($ProjectsSearchResults[$SearchResultsClickedIndex].IsActive !== currentIsActive) {
							$ProjectsSearchResults[$SearchResultsClickedIndex].IsActive = currentIsActive
						}
						$StoragesSearchResults[$SearchResultsClickedIndex].LastUpdatedOn = data.LastUpdatedOn
					} else {
						$ToastType = Shared.ToastType.ERROR
						$ToastMessage = data.message
					}
				} catch (e) {
					Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e)
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = FETCH_ERROR
				}
			}
			if (!AreValuesEqual($ProjectsSearchResults[$SearchResultsClickedIndex].Storage, currentProjectStorage)) {
				let deleteStorageIDs: string[] = []
				let addStorageIDs: string[] = []
				if ($ProjectsSearchResults[$SearchResultsClickedIndex].Storage === null && currentProjectStorage !== null) {
					addStorageIDs = currentProjectStorage.map((value) => value.StorageID)
				} else if ($ProjectsSearchResults[$SearchResultsClickedIndex].Storage !== null && (currentProjectStorage === null || currentProjectStorage.length < 1)) {
					deleteStorageIDs = ($ProjectsSearchResults[$SearchResultsClickedIndex].Storage as { StorageID: string; StorageName: string }[]).map((value) => value.StorageID)
				} else {
					let previousStorageIDs = ($ProjectsSearchResults[$SearchResultsClickedIndex].Storage as { StorageID: string; StorageName: string }[]).map((value) => value.StorageID)
					let currentStorageIDs = (currentProjectStorage as { StorageID: string; StorageName: string }[]).map((value) => value.StorageID)
					previousStorageIDs.forEach((value) => {
						if (!currentStorageIDs.includes(value)) {
							deleteStorageIDs = [...deleteStorageIDs, value]
						}
					})
					currentStorageIDs.forEach((value) => {
						if (!previousStorageIDs.includes(value)) {
							addStorageIDs = [...addStorageIDs, value]
						}
					})
				}
				try {
					let messageSuccess: string[] = []
					if (deleteStorageIDs.length > 0) {
						$Loading = true
						$LoadingMessage = 'deleting storage drives from project...'
						const fetchResponse = await fetch(`${PUBLIC_API_URL}/storage/project`, {
							method: 'DELETE',
							credentials: 'include',
							body: JSON.stringify({
								ProjectID: $ProjectsSearchResults[$SearchResultsClickedIndex].ID,
								StorageIDs: deleteStorageIDs
							})
						})
						const data = await fetchResponse.json()
						if (fetchResponse.ok) {
							messageSuccess = [`In deleting storage drives from project, ${data.StorageProjectsAffected} were affected`]
							$ProjectsSearchResults[$SearchResultsClickedIndex].Storage = currentProjectStorage
						} else {
							$ToastType = Shared.ToastType.ERROR
							$ToastMessage = data.message
						}
					}
					if (addStorageIDs.length > 0) {
						$Loading = true
						$LoadingMessage = 'adding storage drives to project...'
						const fetchResponse = await fetch(`${PUBLIC_API_URL}/storage/project`, {
							method: 'POST',
							credentials: 'include',
							body: JSON.stringify({
								ProjectID: $ProjectsSearchResults[$SearchResultsClickedIndex].ID,
								StorageIDs: addStorageIDs
							})
						})
						const data = await fetchResponse.json()
						if (fetchResponse.ok) {
							messageSuccess = [...messageSuccess, `Storage drives added on ${data.CreatedOn}`]
							$ProjectsSearchResults[$SearchResultsClickedIndex].Storage = currentProjectStorage
						} else {
							$ToastType = Shared.ToastType.ERROR
							$ToastMessage = data.message
						}
					}
					if (messageSuccess.length > 0) {
						$ToastType = Shared.ToastType.SUCCESS
						$ToastMessage = messageSuccess
					}
				} catch (e) {
					Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e)
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = FETCH_ERROR
				}
			}
		} else {
			$Loading = true
			$LoadingMessage = 'Creating new project'
			try {
				const fetchResponse = await fetch(`${PUBLIC_API_URL}/projects`, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify({
						Name: currentName,
						Description: currentDescription,
						DirectoryID: currentProjectOwner.OwnerDirectoryID,
						IsActive: currentIsActive
					})
				})
				const data = await fetchResponse.json()
				if (fetchResponse.ok) {
					$ProjectsSearchResults = [
						...$ProjectsSearchResults,
						{
							ID: data.ID,
							Name: currentName,
							Description: currentDescription,
							OwnerDirectoryID: currentProjectOwner.OwnerDirectoryID,
							OwnerDirectoryName: currentProjectOwner.OwnerDirectoryName,
							OwnerDirectoryContacts: currentProjectOwner.OwnerDirectoryContacts,
							IsActive: currentIsActive,
							CreatedOn: new Date().toISOString(),
							LastUpdatedOn: new Date().toISOString(),
							Storage: null
						}
					]
					resetProjectsFields()
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `Project ${data.ID} created`
				} else {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = data.message
				}
			} catch (e) {
				Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Create project error')
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = FETCH_ERROR
			}
		}
		$Loading = false
		$LoadingMessage = null
	}

	async function handleDeleteProject() {
		if ($SearchResultsClickedIndex === null) {
			return
		}
		if ($CurrentUser?.SystemUserCreatedOn === NIL_DATE_TIME) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Not Authorized to perform this action'
			return
		}
		$Loading = true
		$LoadingMessage = 'Deleting project...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/projects/${$ProjectsSearchResults[$SearchResultsClickedIndex].ID}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `In deleting project, ${data.ProjectsAffected} were affected`
				$ProjectsSearchResults = $ProjectsSearchResults.filter((_, i) => $SearchResultsClickedIndex !== i)
				resetProjectsFields()
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'delete project error')
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

	enum ManageProjectStorageTabs {
		ADD_STORAGE = 'add_storage',
		VIEW_CURRENT_STORAGE = 'view_current_storage'
	}
	let currentTab = ManageProjectStorageTabs.VIEW_CURRENT_STORAGE

	async function handleSearchStorage() {
		$Loading = true
		$LoadingMessage = 'Searching storage...'
		showFilter = false
		try {
			let url = new URL(`${PUBLIC_API_URL}/storage`)
			url.searchParams.append('sb', 'last_updated_on')
			url.searchParams.append('sbo', 'desc')
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$StoragesSearchResults = data !== null ? data : []
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
</script>

<div class="flex-1 flex flex-col space-y-2 overflow-hidden">
	<header class="flex-[0.5] flex space-x-2">
		<section class="flex-[9] flex flex-col justify-center">
			<div class="form-control w-[90%]">
				<span class="join">
					<input class="join-item flex-[9.5] input input-secondary w-full shadow-sm shadow-gray-600" type="search" placeholder="Search projects..." bind:value={$ProjectsSearchCurrentQuery} />
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={() => (showFilter = !showFilter)}>
						<Icon type="mdi:filter" />
					</button>
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={handleSearchProjects}>
						<span class="w-fit h-fit self-center bg-transparent"><Icon type="mdi:search" /></span>
					</button>
				</span>
			</div>
			<div class="relative">
				{#if showFilter}
					<div class="absolute top-0 left-0 bg-white rounded-md p-1 w-[90%] shadow-md shadow-gray-800 mt-1 flex flex-col space-y-1 justify-center z-[100] max-h-[70vh] overflow-auto">
						<section class="flex flex-col space-y-1">
							<div class="text-md">Date range for when projects were created...</div>
							<div class="join w-full">
								<DateTime bind:Value={$ProjectsSearchCreatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$ProjectsSearchCreatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
							<div class="divider" />
							<div class="text-md">Date range for when projects were last updated...</div>
							<div class="join w-full">
								<DateTime bind:Value={$ProjectsSearchLastUpdatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$ProjectsSearchLastUpdatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Maximum no. of results</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter maximum no. of results to show..." value={$ProjectsSearchLimit} on:input={(e) => handleInputSearchResultsLimit(e.currentTarget.value)} />
							</span>
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">No. of results to skip</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter no. of results to skip..." value={$ProjectsSearchOffset} on:input={(e) => handleInputSearchResultsOffset(e.currentTarget.value)} />
							</span>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Sort by</span>
								<div class="join-item join join-horizontal w-full">
									<select class="join-item select select-primary flex-1" bind:value={$ProjectsSearchSortBy}>
										<option selected={$ProjectsSearchSortBy === ''} value="" disabled>Sorty By...</option>
										<option selected={$ProjectsSearchSortBy === 'created_on'} value="created_on">Created on</option>
										<option selected={$ProjectsSearchSortBy === 'last_updated_on'} value="last_updated_on">Last updated on</option>
									</select>
									<select class="join-item select select-primary flex-1" bind:value={$ProjectsSearchSortByOrder}>
										<option selected={$ProjectsSearchSortByOrder === ''} value="" disabled>Sorty By Order...</option>
										<option selected={$ProjectsSearchSortByOrder === 'asc'} value="asc">Least recent first</option>
										<option selected={$ProjectsSearchSortByOrder === 'desc'} value="desc">Most recent first</option>
									</select>
								</div>
							</span>
						</section>
						<button class="btn btn-secondary self-center w-full max-w-[350px] h-fit" on:click={ResetProjectsStore}>reset</button>
					</div>
				{/if}
			</div>
		</section>
		<section class="flex-1 flex justify-end">
			<div class="tooltip tooltip-left" data-tip="Create new project">
				<button
					class="flex btn btn-circle btn-secondary justify-center"
					on:click={() => {
						//@ts-expect-error
						document.getElementById('manage-project-dialog').showModal()
					}}
				>
					<span class="w-fit h-fit self-center"><Icon type="mdi:plus" /></span>
				</button>
			</div>
		</section>
	</header>
	<main class="flex-[9.5] flex flex-col overflow-hidden space-y-1">
		{#if $ProjectsSearchResults.length > 0}
			<div class="divider" />
			<Table
				Data={JSON.parse(JSON.stringify($ProjectsSearchResults))}
				{HandleClickTableRow}
				{FilterModelTemplate}
				DataName="Projects"
				CreatedFilterOptions={$ProjectsSearchCreatedFilterOptions}
				{HandleUpdateCreatedFilterOptions}
				{HandleUpdateFilterModelTemplate}
				IncludeIndividualDataRowCounter={true}
				IncludeIndividualRowNumber={true}
			/>
			<div class="divider" />
		{:else}
			<div class="w-full h-full bg-gray-200 flex justify-center">
				<span class="text-2xl w-fit h-fit self-center flex">
					<span class="text-center text-primary">Create and manage projects from the administrators perspective...</span>
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

<!-- Manage project dialog -->
<dialog id="manage-project-dialog" class="modal">
	<form method="dialog" class="modal-box p-0 rounded max-md:min-w-[90%] md:min-w-[200px] md:w-full md: max-w-[700px] max-h-full min-h-fit">
		<header class="sticky flex justify-between bg-accent items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
			<span class="text-lg text-primary">Manage project</span>
			<button class="btn btn-circle btn-ghost flex justify-center" on:click={resetProjectsFields}>
				<Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} />
			</button>
		</header>
		<main class="p-2 space-y-2 w-full flex flex-col overflow-auto max-h-[70vh]">
			{#if $SearchResultsClickedIndex !== null}
				<div>
					<span class="font-bold">ID: </span>
					<span>{$ProjectsSearchResults[$SearchResultsClickedIndex].ID}</span>
				</div>
				<div>
					<span class="font-bold">Owner name: </span>
					<span>{$ProjectsSearchResults[$SearchResultsClickedIndex].OwnerDirectoryName}</span>
				</div>
			{/if}
			<section class="form-control">
				<div class="join">
					<span class="join-item join-label-primary join-label-content">Name</span>
					<input class="join-item input input-primary w-full" type="text" placeholder="Enter name of project..." value={currentName} on:input={(e) => handleInputCurrentName(e.currentTarget.value)} />
				</div>
				{#if currentNameError}
					<div class="text-xs text-error">{currentNameError}</div>
					<div class="divider" />
				{/if}
			</section>
			<section class="form-control">
				<div class="join join-vertical">
					<span class="join-item join-label-primary join-label-content">Description</span>
					<textarea class="join-item textarea textarea-primary w-full" placeholder="Enter description of project..." value={currentDescription} on:input={(e) => handleInputCurrentDescription(e.currentTarget.value)} />
				</div>
				{#if currentDescriptionError}
					<div class="text-xs text-error">{currentDescriptionError}</div>
					<div class="divider" />
				{/if}
			</section>
			<section class="form-control">
				<label class="label">
					<span class="label-text text-lg font-bold">Is Active?</span>
					<input type="checkbox" class="checkbox checkbox-primary" bind:checked={currentIsActive} />
				</label>
			</section>
			{#if $SearchResultsClickedIndex !== null}
				<div class="divider">Storage drives</div>
				{#if currentTab === ManageProjectStorageTabs.ADD_STORAGE}
					{#if $StoragesSearchResults.length > 0}
						<div class="overflow-auto max-h-[50vh] rounded-md">
							<table class="table w-full shadow-inner shadow-gray-800 rounded-md">
								<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0">
									<tr>
										<th>#</th>
										<th>
											<div class="flex justify-between">
												<span>Storage Name</span>
												<button
													class="btn btn-circle btn-ghost h-fit w-fit"
													on:click={(e) => {
														e.preventDefault()
														handleSearchStorage()
													}}
												>
													<Icon type="mdi:reload" color={Shared.Colors.PRIMARY} />
												</button>
											</div>
										</th>
									</tr>
								</thead>
								<tbody>
									{#each $StoragesSearchResults as ssr}
										{#if currentProjectStorage === null || !isStorageAvailableInProject(ssr.ID)}
											<tr>
												<td>
													<button
														class="btn btn-ghost w-fit h-fit"
														on:click={(e) => {
															e.preventDefault()
															if (currentProjectStorage === null) {
																currentProjectStorage = [
																	{
																		StorageID: ssr.ID,
																		StorageName: ssr.Name
																	}
																]
															} else {
																currentProjectStorage = [
																	...currentProjectStorage,
																	{
																		StorageID: ssr.ID,
																		StorageName: ssr.Name
																	}
																]
															}
														}}
													>
														<Icon type="mdi:check" color={Shared.Colors.SUCCESS} />
													</button>
												</td>
												<td><span class="break-words">{ssr.Name}</span></td>
											</tr>
										{/if}
									{/each}
								</tbody>
							</table>
						</div>
					{/if}
				{:else if currentTab === ManageProjectStorageTabs.VIEW_CURRENT_STORAGE}
					{#if currentProjectStorage !== null && currentProjectStorage.length > 0}
						<table class="table w-full shadow-inner shadow-gray-800 rounded-md">
							<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0">
								<tr>
									<th>#</th>
									<th>Storage Name</th>
								</tr>
							</thead>
							<tbody>
								{#each currentProjectStorage as cps}
									<tr>
										<td>
											<button
												class="btn btn-ghost w-fit h-fit"
												on:click={(e) => {
													e.preventDefault()
													if (currentProjectStorage !== null) {
														currentProjectStorage = currentProjectStorage.filter((val, _) => val.StorageID !== cps.StorageID)
													}
												}}
											>
												<Icon type="mdi:delete" color={Shared.Colors.ERROR} />
											</button>
										</td>
										<td><span class="break-words">{cps.StorageName}</span></td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<div class="text-center text-error italic">Project has no storage drives</div>
					{/if}
				{/if}
				<section role="tablist" class="tabs tabs-boxed text-xl w-fit self-center">
					<button
						role="tab"
						class="tab self-center"
						class:tab-active={currentTab === ManageProjectStorageTabs.ADD_STORAGE}
						on:click={(e) => {
							e.preventDefault()
							if ($StoragesSearchResults.length < 1) {
								handleSearchStorage()
							}
							currentTab = ManageProjectStorageTabs.ADD_STORAGE
						}}
					>
						Add Storage
					</button>
					<button
						role="tab"
						class="tab self-center"
						class:tab-active={currentTab === ManageProjectStorageTabs.VIEW_CURRENT_STORAGE}
						on:click={(e) => {
							e.preventDefault()
							currentTab = ManageProjectStorageTabs.VIEW_CURRENT_STORAGE
						}}
					>
						View Current Storage
					</button>
				</section>
				<div class="divider" />
			{/if}
			{#if $SearchResultsClickedIndex === null}
				<div class="divider">Pick project owner</div>
				<span class="join">
					<input class="join-item flex-[9.5] input input-secondary w-full shadow-sm shadow-gray-600" type="search" placeholder="Search directory..." bind:value={$DirectorySearchCurrentQuery} />
					<button
						class="join-item flex-[0.5] btn btn-regular btn-secondary"
						on:click={(e) => {
							e.preventDefault()
							handleSearchDirectory()
						}}
					>
						<span class="w-fit h-fit self-center bg-transparent"><Icon type="mdi:search" /></span>
					</button>
				</span>
				{#if $DirectorySearchResults.length > 0}
					<div class="overflow-auto max-h-[50vh] rounded-md">
						<table class="table w-full shadow-inner shadow-gray-800 rounded-md">
							<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0">
								<tr>
									<th>#</th>
									<th>User Name</th>
								</tr>
							</thead>
							<tbody>
								{#each $DirectorySearchResults as dsr}
									<tr>
										<td>
											<button
												class="btn btn-ghost w-fit h-fit"
												on:click={(e) => {
													e.preventDefault()
													currentProjectOwner = {
														OwnerDirectoryID: dsr.ID,
														OwnerDirectoryName: dsr.Name,
														OwnerDirectoryContacts: dsr.Contacts
													}
												}}
											>
												<Icon type={currentProjectOwner !== null && currentProjectOwner.OwnerDirectoryID === dsr.ID ? 'mdi:check' : 'mdi:close-thick'} color={currentProjectOwner !== null && currentProjectOwner.OwnerDirectoryID === dsr.ID ? Shared.Colors.SUCCESS : Shared.Colors.ERROR} />
											</button>
										</td>
										<td><span class="break-words">{dsr.Name}</span></td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{/if}
		</main>
		<footer class="flex flex-col p-1">
			<div class="join self-center">
				{#if $SearchResultsClickedIndex !== null}
					<button
						class="join-item btn btn-secondary h-fit"
						on:click={(e) => {
							e.preventDefault()
							handleDeleteProject()
						}}
					>
						delete project
					</button>
				{/if}
				<button
					class="join-item btn btn-secondary h-fit"
					on:click={(e) => {
						e.preventDefault()
						handleCreateUpdateProject()
					}}
				>
					{$SearchResultsClickedIndex !== null && $ProjectsSearchResults[$SearchResultsClickedIndex].ID ? 'Update' : 'Create'} project
				</button>
			</div>
		</footer>
	</form>
</dialog>
