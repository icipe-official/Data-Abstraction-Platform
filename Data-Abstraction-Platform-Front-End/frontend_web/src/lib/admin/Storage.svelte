<script lang="ts">
	import { base } from '$app/paths'
	import { PUBLIC_API_URL } from '$env/static/public'
	import DateTime from '$lib/components/DateTime.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import Table from '$lib/components/table/Table.svelte'
	import { Shared, FETCH_ERROR, NIL_DATE_TIME } from '$lib/constants'
	import {
		Loading,
		LoadingMessage,
		StoragesSearchCreatedFilterOptions,
		StoragesSearchCreatedOnGreaterThan,
		StoragesSearchCreatedOnLessThan,
		StoragesSearchLastUpdatedOnGreaterThan,
		StoragesSearchLastUpdatedOnLessThan,
		ToastMessage,
		ToastType,
		SearchResultsClickedIndex,
		StoragesSearchLimit,
		StoragesSearchOffset,
		StoragesSearchResults,
		StoragesSearchSortBy,
		StoragesSearchSortByOrder,
		StorageTypesSearchResults,
		CurrentUser
	} from '$lib/stores'
	import { AreValuesEqual, Log, ResetStorageStore, SetValueInObject } from '$lib/utils'
	import { onDestroy } from 'svelte'

	const CURRENT_SECTION = 'Admin Storage'

	const mtStorage = {
		ID: {
			struct: 'root.ID text text name=ID&# disabled=true&#',
			value: ''
		},
		Name: {
			struct: 'root.Name text text name=Name&#',
			value: ''
		},
		StorageTypeID: {
			struct: 'root.StorageTypeID text text name=Storage Type ID&#',
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
		IsActive: {
			struct: 'root.IsActive text text name=Is Active&#',
			value: ''
		}
	}

	let FilterModelTemplate = JSON.stringify(mtStorage)
	const HandleUpdateFilterModelTemplate = (value: string) => (FilterModelTemplate = value)

	function handleInputSearchResultsLimit(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$StoragesSearchLimit = parseInt(value)
		if ($StoragesSearchLimit < 5) {
			$StoragesSearchLimit = 0
		} else if ($StoragesSearchLimit < $StoragesSearchOffset) {
			if ($StoragesSearchLimit - 1000 < 0) {
				$StoragesSearchOffset = 0
			} else {
				$StoragesSearchOffset = $StoragesSearchLimit - 1000
			}
		}
	}
	function handleInputSearchResultsOffset(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$StoragesSearchOffset = parseInt(value)
		if ($StoragesSearchOffset < 0) {
			$StoragesSearchOffset = 0
		} else if ($StoragesSearchOffset > $StoragesSearchLimit) {
			$StoragesSearchLimit = $StoragesSearchOffset + 1000
		}
	}

	async function handleSearchStorage() {
		$Loading = true
		$LoadingMessage = 'Searching storage...'
		showFilter = false
		try {
			let url = new URL(`${PUBLIC_API_URL}/storage`)
			if ($StoragesSearchCreatedOnGreaterThan != '') {
				url.searchParams.append('cogt', $StoragesSearchCreatedOnGreaterThan)
			}
			if ($StoragesSearchCreatedOnLessThan != '') {
				url.searchParams.append('colt', $StoragesSearchCreatedOnLessThan)
			}
			if ($StoragesSearchLastUpdatedOnGreaterThan != '') {
				url.searchParams.append('lugt', $StoragesSearchLastUpdatedOnGreaterThan)
			}
			if ($StoragesSearchLastUpdatedOnLessThan != '') {
				url.searchParams.append('lult', $StoragesSearchLastUpdatedOnLessThan)
			}
			url.searchParams.append('l', `${$StoragesSearchLimit}`)
			url.searchParams.append('o', `${$StoragesSearchOffset}`)
			url.searchParams.append('sb', $StoragesSearchSortBy)
			url.searchParams.append('sbo', $StoragesSearchSortByOrder)
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

	let showFilter = false

	function HandleUpdateCreatedFilterOptions(value: any) {
		$StoragesSearchCreatedFilterOptions = value
		if (Object.keys($StoragesSearchCreatedFilterOptions).length < 1) {
			FilterModelTemplate = JSON.stringify(mtStorage)
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, $StoragesSearchCreatedFilterOptions, 'Updated Filter options')
	}

	onDestroy(() => ($SearchResultsClickedIndex = null))

	let currentName = ''
	let currentNameError: string | null = null
	const DEFAULT_CURRENT_NAME_ERROR = 'Give this storage drive user a name...'
	function handleInputCurrentName(value: string) {
		currentName = value
		if (currentName.length < 3) currentNameError = DEFAULT_CURRENT_NAME_ERROR
		else currentNameError = null
	}

	let currentIsActive = false
	let currentStorageType = ''
	let currentStorageTypeProperties: string | null = null
	let currentStorage: any | null = null

	function HandleClickTableRow(index: number) {
		$SearchResultsClickedIndex = index
		currentName = $StoragesSearchResults[index].Name
		currentIsActive = $StoragesSearchResults[index].IsActive
		currentStorageType = $StoragesSearchResults[index].StorageTypeID
		currentStorage = JSON.parse($StoragesSearchResults[index].Storage)
		//@ts-expect-error
		document.getElementById('manage-storage-drive-dialog').showModal()
	}

	function resetStorageFields() {
		currentName = ''
		currentNameError = null
		currentIsActive = false
		currentStorage = {}
		currentStorageType = ''
		currentStorageTypeProperties = null
		$SearchResultsClickedIndex = null
	}

	async function handleDeleteStorageDrive() {
		if ($SearchResultsClickedIndex === null) {
			return
		}
		if ($CurrentUser?.SystemUserCreatedOn === NIL_DATE_TIME) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Not Authorized to perform this action'
			return
		}
		$Loading = true
		$LoadingMessage = 'Deleting/deactivating storage drive...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/storage/${$StoragesSearchResults[$SearchResultsClickedIndex].ID}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `In deleting storage drive, ${data.StorageAffected} were affected`
				$StoragesSearchResults = $StoragesSearchResults.filter((_, i) => $SearchResultsClickedIndex !== i)
				resetStorageFields()
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'delete user error')
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

	async function handleCreateUpdateStorageDrive() {
		if ($CurrentUser?.SystemUserCreatedOn === NIL_DATE_TIME) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Not Authorized to perform this action'
			return
		}
		if (currentName.length < 3) {
			currentNameError = DEFAULT_CURRENT_NAME_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Storage name is not valid'
			return
		} else currentNameError = null
		if (currentStorageType == '') {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Storage type not selected'
			return
		}
		for (let key of Object.keys(currentStorage)) {
			if (!Object.hasOwn(currentStorage, key) || (Object.hasOwn(currentStorage, key) && currentStorage[key].length < 1)) {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = 'Storage properties not valid'
				return
			}
		}
		if ($SearchResultsClickedIndex !== null && $StoragesSearchResults[$SearchResultsClickedIndex].ID) {
			if ($StoragesSearchResults[$SearchResultsClickedIndex].Name === currentName && AreValuesEqual(JSON.parse($StoragesSearchResults[$SearchResultsClickedIndex].Storage), currentStorage) && currentStorageType === $StoragesSearchResults[$SearchResultsClickedIndex].StorageTypeID && currentIsActive === $StoragesSearchResults[$SearchResultsClickedIndex].IsActive) {
				$ToastType = Shared.ToastType.INFO
				$ToastMessage = 'No changes detected'
				return
			}
			let storageDriveInfoToUpdate: any = {}
			if ($StoragesSearchResults[$SearchResultsClickedIndex].Name !== currentName) {
				storageDriveInfoToUpdate = SetValueInObject(storageDriveInfoToUpdate, 'Storage.Name', currentName)
				storageDriveInfoToUpdate = SetValueInObject(storageDriveInfoToUpdate, 'Columns', ['name'])
			}			
			if (currentStorageType !== $StoragesSearchResults[$SearchResultsClickedIndex].StorageTypeID) {
				storageDriveInfoToUpdate = SetValueInObject(storageDriveInfoToUpdate, 'Storage.StorageTypeID', currentStorageType)
				if (Object.hasOwn(storageDriveInfoToUpdate,'Columns') && storageDriveInfoToUpdate['Columns'].length > 0) {
					storageDriveInfoToUpdate = SetValueInObject(storageDriveInfoToUpdate, 'Columns', [...storageDriveInfoToUpdate['Columns'], 'storage_type_id'])
				} else {
					storageDriveInfoToUpdate = SetValueInObject(storageDriveInfoToUpdate, 'Columns', ['storage_type_id'])
				}
			}
			if (!AreValuesEqual(JSON.parse($StoragesSearchResults[$SearchResultsClickedIndex].Storage), currentStorage)) {
				storageDriveInfoToUpdate = SetValueInObject(storageDriveInfoToUpdate, 'Storage.Storage', JSON.stringify(currentStorage))
				if (Object.hasOwn(storageDriveInfoToUpdate,'Columns') && storageDriveInfoToUpdate['Columns'].length > 0) {
					storageDriveInfoToUpdate = SetValueInObject(storageDriveInfoToUpdate, 'Columns', [...storageDriveInfoToUpdate['Columns'], 'storage'])
				} else {
					storageDriveInfoToUpdate = SetValueInObject(storageDriveInfoToUpdate, 'Columns', ['storage'])
				}
			}
			if (currentIsActive !== $StoragesSearchResults[$SearchResultsClickedIndex].IsActive) {
				storageDriveInfoToUpdate = SetValueInObject(storageDriveInfoToUpdate, 'Storage.IsActive', currentIsActive)
				if (Object.hasOwn(storageDriveInfoToUpdate,'Columns') && storageDriveInfoToUpdate['Columns'].length > 0) {
					storageDriveInfoToUpdate = SetValueInObject(storageDriveInfoToUpdate, 'Columns', [...storageDriveInfoToUpdate['Columns'], 'is_active'])
				} else {
					storageDriveInfoToUpdate = SetValueInObject(storageDriveInfoToUpdate, 'Columns', ['is_active'])
				}
			}
			$Loading = true
			$LoadingMessage = 'Updating storage drive...'
			try {	
				const fetchResponse = await fetch(`${PUBLIC_API_URL}/storage/${$StoragesSearchResults[$SearchResultsClickedIndex].ID}`, {
					method: 'PUT',
					credentials: 'include',
					body: JSON.stringify(storageDriveInfoToUpdate)
				})
				const data = await fetchResponse.json()
				if (fetchResponse.ok) {
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `Storage drive ${data.ID} updated`
					if ($StoragesSearchResults[$SearchResultsClickedIndex].Name !== currentName) {
						$StoragesSearchResults[$SearchResultsClickedIndex].Name = currentName
					}
					if (!AreValuesEqual($StoragesSearchResults[$SearchResultsClickedIndex].Storage, currentStorage)) {
						$StoragesSearchResults[$SearchResultsClickedIndex].Storage = currentStorage
					}
					if (currentStorageType !== $StoragesSearchResults[$SearchResultsClickedIndex].StorageTypeID) {
						$StoragesSearchResults[$SearchResultsClickedIndex].StorageTypeID = currentStorageType
					}
					if (currentIsActive !== $StoragesSearchResults[$SearchResultsClickedIndex].IsActive) {
						$StoragesSearchResults[$SearchResultsClickedIndex].IsActive = currentIsActive
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
		} else {
			$Loading = true
			$LoadingMessage = 'Creating storage drive...'
			try {
				const fetchResponse = await fetch(`${PUBLIC_API_URL}/storage`, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify({
						Name: currentName,
						StorageTypeID: currentStorageType,
						Storage: JSON.stringify(currentStorage),
						IsActive: currentIsActive
					})
				})
				const data = await fetchResponse.json()
				if (fetchResponse.ok) {
					$StoragesSearchResults = [
						...$StoragesSearchResults,
						{
							ID: data.ID,
							Name: currentName,
							StorageTypeID: currentStorageType,
							Storage: JSON.stringify(currentStorage),
							StorageTypeProperties: currentStorageTypeProperties as string,
							IsActive: currentIsActive,
							CreatedOn: new Date().toISOString(),
							LastUpdatedOn: new Date().toISOString()
						}
					]
					resetStorageFields()
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `Storage ${data.ID} created`
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
		$Loading = false
		$LoadingMessage = null
	}

	async function getStorageOptions() {
		$Loading = true
		$LoadingMessage = 'Getting storage types...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/storage/type`, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$StorageTypesSearchResults = data
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `${data ? data.length : 0} storage types found`
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

	function handleInputCurrentStorageProperties(key: string, value: string) {
		currentStorage = SetValueInObject(currentStorage, key, value)
	}
</script>

<div class="flex-1 flex flex-col space-y-2 overflow-hidden">
	<header class="flex-[0.5] flex space-x-2">
		<section class="flex-[9] flex flex-col justify-center">
			<div class="form-control w-fit">
				<span class="join">
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={() => (showFilter = !showFilter)}>
						<Icon type="mdi:filter" />
					</button>
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={handleSearchStorage}>
						<span class="w-fit h-fit self-center bg-transparent"><Icon type="mdi:search" /></span>
					</button>
				</span>
			</div>
			<div class="relative">
				{#if showFilter}
					<div class="absolute top-0 left-0 bg-white rounded-md p-1 w-[90%] shadow-md shadow-gray-800 mt-1 flex flex-col space-y-1 justify-center z-[100] max-h-[70vh] overflow-auto">
						<section class="flex flex-col space-y-1">
							<div class="text-md">Date range for when storage drives were created...</div>
							<div class="join w-full">
								<DateTime bind:Value={$StoragesSearchCreatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$StoragesSearchCreatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
							<div class="divider" />
							<div class="text-md">Date range for when storage drives were last updated...</div>
							<div class="join w-full">
								<DateTime bind:Value={$StoragesSearchLastUpdatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$StoragesSearchLastUpdatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Maximum no. of results</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter maximum no. of results to show..." value={$StoragesSearchLimit} on:input={(e) => handleInputSearchResultsLimit(e.currentTarget.value)} />
							</span>
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">No. of results to skip</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter no. of results to skip..." value={$StoragesSearchOffset} on:input={(e) => handleInputSearchResultsOffset(e.currentTarget.value)} />
							</span>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Sort by</span>
								<div class="join-item join join-horizontal w-full">
									<select class="join-item select select-primary flex-1" bind:value={$StoragesSearchSortBy}>
										<option selected={$StoragesSearchSortBy === ''} value="" disabled>Sorty By...</option>
										<option selected={$StoragesSearchSortBy === 'created_on'} value="created_on">Created on</option>
										<option selected={$StoragesSearchSortBy === 'last_updated_on'} value="last_updated_on">Last updated on</option>
									</select>
									<select class="join-item select select-primary flex-1" bind:value={$StoragesSearchSortByOrder}>
										<option selected={$StoragesSearchSortByOrder === ''} value="" disabled>Sorty By Order...</option>
										<option selected={$StoragesSearchSortByOrder === 'asc'} value="asc">Least recent first</option>
										<option selected={$StoragesSearchSortByOrder === 'desc'} value="desc">Most recent first</option>
									</select>
								</div>
							</span>
						</section>
						<button class="btn btn-secondary self-center w-full max-w-[350px] h-fit" on:click={ResetStorageStore}>reset</button>
					</div>
				{/if}
			</div>
		</section>
		<section class="flex-1 flex justify-end">
			<div class="tooltip tooltip-left" data-tip="Create new storage drive">
				<button
					class="flex btn btn-circle btn-secondary justify-center"
					on:click={() => {
						//@ts-expect-error
						document.getElementById('manage-storage-drive-dialog').showModal()
					}}
				>
					<span class="w-fit h-fit self-center"><Icon type="mdi:plus" /></span>
				</button>
			</div>
		</section>
	</header>
	<main class="flex-[9.5] flex flex-col overflow-hidden space-y-1">
		{#if $StoragesSearchResults.length > 0}
			<div class="divider" />
			<Table
				Data={JSON.parse(JSON.stringify($StoragesSearchResults))}
				{HandleClickTableRow}
				{FilterModelTemplate}
				DataName="Storage drives"
				CreatedFilterOptions={$StoragesSearchCreatedFilterOptions}
				{HandleUpdateCreatedFilterOptions}
				{HandleUpdateFilterModelTemplate}
				IncludeIndividualDataRowCounter={false}
				IncludeIndividualRowNumber={false}
			/>
			<div class="divider" />
		{:else}
			<div class="w-full h-full bg-gray-200 flex justify-center">
				<span class="text-2xl w-fit h-fit self-center flex">
					<span class="text-center text-primary">Create and manage storage drives from the administrators perspective...</span>
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

<!-- Manage storage drive dialog -->
<dialog id="manage-storage-drive-dialog" class="modal">
	<form method="dialog" class="modal-box p-0 rounded max-md:min-w-[90%] md:min-w-[200px] md:w-full md: max-w-[700px] max-h-full min-h-fit">
		<header class="sticky flex justify-between bg-accent items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
			<span class="text-lg text-primary">Manage storage drive</span>
			<button class="btn btn-circle btn-ghost flex justify-center" on:click={resetStorageFields}>
				<Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} />
			</button>
		</header>
		<main class="p-2 space-y-2 w-full flex flex-col overflow-auto max-h-[70vh]">
			{#if $SearchResultsClickedIndex !== null}
				<div>
					<span class="font-bold">ID: </span>
					<span>{$StoragesSearchResults[$SearchResultsClickedIndex].ID}</span>
				</div>
			{/if}
			<section class="form-control">
				<div class="join">
					<span class="join-item join-label-primary join-label-content">Name</span>
					<input class="join-item input input-primary w-full" type="text" placeholder="Enter name of storage drive..." value={currentName} on:input={(e) => handleInputCurrentName(e.currentTarget.value)} />
				</div>
				{#if currentNameError}
					<div class="text-xs text-error">{currentNameError}</div>
					<div class="divider" />
				{/if}
			</section>
			<section class="form-control">
				<label class="label">
					<span class="label-text text-lg font-bold">Is Active?</span>
					<input type="checkbox" class="checkbox checkbox-primary" bind:checked={currentIsActive} />
				</label>
			</section>
			<div class="divider text-lg font-bold">properties</div>
			{#if currentStorage !== null && currentStorageType}
				<div><span class="font-bold">Type:</span> {currentStorageType}</div>
				{#each Object.keys(currentStorage) as key}
					<div class="join">
						<span class="join-item join-label-primary join-label-content">{key}</span>
						<input class="join-item input input-primary w-full" type="text" placeholder="Enter {key}..." value={currentStorage[key]} on:input={(e) => handleInputCurrentStorageProperties(key, e.currentTarget.value)} />
					</div>
				{/each}
			{:else if $StorageTypesSearchResults.length > 0}
				<table class="table w-full shadow-inner shadow-gray-800 rounded-md sticky top-0">
					<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary">
						<tr>
							<th />
							<th>ID</th>
						</tr>
					</thead>
					<tbody>
						{#each $StorageTypesSearchResults as sqr, index}
							<tr>
								<td
									class="cursor-pointer"
									on:click={() => {
										currentStorageType = sqr.ID
										currentStorageTypeProperties = sqr.Properties
										currentStorage = JSON.parse(currentStorageTypeProperties)
									}}
								>
									{#if currentStorageType === sqr.ID}
										<Icon type="mdi:check" color={Shared.Colors.PRIMARY} />
									{:else}
										{index + 1}
									{/if}
								</td>
								<td class="font-bold">{sqr.ID}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
			<section class="join self-center w-fit">
				{#if $SearchResultsClickedIndex !== null}
					<button
						class="join-item btn btn-secondary h-fit"
						on:click={(e) => {
							e.preventDefault()
							if ($SearchResultsClickedIndex !== null) {
								currentStorage = JSON.parse($StoragesSearchResults[$SearchResultsClickedIndex].Storage)
								currentStorageType = $StoragesSearchResults[$SearchResultsClickedIndex].StorageTypeID
								currentStorageTypeProperties = $StoragesSearchResults[$SearchResultsClickedIndex].StorageTypeProperties
							}
						}}
					>
						reset
					</button>
				{/if}
				<div class="join self-center">
					<button
						class="join-item btn btn-secondary h-fit"
						on:click={(e) => {
							e.preventDefault()
							if ($StorageTypesSearchResults.length < 1) {
								getStorageOptions()
							}
							currentStorageType = ''
							currentStorageTypeProperties = null
							currentStorage = null
						}}
					>
						choose storage type
					</button>
					<button
						class="join-item btn btn-secondary h-fit"
						on:click={(e) => {
							e.preventDefault()
							getStorageOptions()
						}}
					>
						refresh storage types
					</button>
				</div>
			</section>
		</main>
		<div class="divider" />
		<footer class="flex flex-col p-1">
			<div class="join self-center">
				{#if $SearchResultsClickedIndex !== null}
					<button
						class="join-item btn btn-secondary h-fit"
						on:click={(e) => {
							e.preventDefault()
							handleDeleteStorageDrive()
						}}
					>
						delete storage drive
					</button>
				{/if}
				<button
					class="join-item btn btn-secondary h-fit"
					on:click={(e) => {
						e.preventDefault()
						handleCreateUpdateStorageDrive()
					}}
				>
					{$SearchResultsClickedIndex !== null && $StoragesSearchResults[$SearchResultsClickedIndex] ? 'Update' : 'Create'} storage drive
				</button>
			</div>
		</footer>
	</form>
</dialog>
