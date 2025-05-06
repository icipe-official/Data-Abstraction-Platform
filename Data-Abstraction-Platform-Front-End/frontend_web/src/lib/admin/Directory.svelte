<script lang="ts">
	import { base } from '$app/paths'
	import { PUBLIC_API_URL } from '$env/static/public'
	import DateTime from '$lib/components/DateTime.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import Table from '$lib/components/table/Table.svelte'
	import { DISALLOWED_CHARACTERS_REGEX_SEARCH, FETCH_ERROR, NIL_DATE_TIME, OPTS_SPLIT, Shared } from '$lib/constants'
	import {
		DirectorySearchCurrentQuery,
		DirectorySearchLastUpdatedOnGreaterThan,
		DirectorySearchLastUpdatedOnLessThan,
		DirectorySearchLimit,
		DirectorySearchOffset,
		DirectorySearchSortBy,
		DirectorySearchSortByOrder,
		DirectorySearchCreatedOnGreaterThan,
		DirectorySearchCreatedOnLessThan,
		DirectorySearchResults,
		Loading,
		LoadingMessage,
		ToastType,
		ToastMessage,
		DirectorySearchCreatedFilterOptions,
		CurrentUser,
		SearchResultsClickedIndex
	} from '$lib/stores'
	import { AreValuesEqual, LocalDateFromString, LocalTimeFromString, Log, SetValueInObject, ResetDirectoryStore } from '$lib/utils'
	import { onDestroy } from 'svelte'

	const CURRENT_SECTION = 'Admin Directory'

	const mtDirectory = {
		ID: {
			struct: 'root.ID text text name=ID&# disabled=true&#',
			value: ''
		},
		Name: {
			struct: 'root.Name text text name=Name&#',
			value: ''
		},
		Contacts: {
			struct: 'root.Contacts text text name=Contacts&#',
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
		SystemUserCreatedOn: {
			struct: 'root.SystemUserCreatedOn text datetime name=System User Created On&# dtf=yyyy-mm-dd HH:MM&#',
			value: ''
		},
		IamEmail: {
			struct: 'root.IamEmail text text name=Iam Email&#',
			value: ''
		},
		IamCreatedOn: {
			struct: 'root.CreatedOn text datetime name=Iam Created On&# dtf=yyyy-mm-dd HH:MM&# disabled=true&#',
			value: ''
		},
		IamLastUpdatedOn: {
			struct: 'root.LastUpdatedOn text datetime name=Iam Last Updated On&# dtf=yyyy-mm-dd HH:MM&#  disabled=true&#',
			value: ''
		},
		ProjectsRoles: {
			struct: 'root.ProjectsRoles repetitive name=Projects and Roles&#',
			value: [
				{
					ID: {
						struct: 'root.ProjectsRoles.value[x].ProjectID text text name=Project ID&# disabled=true&#',
						value: ''
					},
					ProjectName: {
						struct: 'root.ProjectsRoles.value[x].ProjectName text text name=Project Name&#',
						value: ''
					},
					Description: {
						struct: 'root.ProjectsRoles.value[x].ProjectDescription text text name=Project Description&#',
						value: ''
					},
					ProjectCreatedOn: {
						struct: 'root.ProjectsRoles.value[x].ProjectCreatedOn text datetime name=Project Created On&# dtf=yyyy-mm-dd HH:MM&#  disabled=true&#',
						value: ''
					},
					ProjectRoles: {
						struct: 'root.ProjectsRoles.value[x].ProjectRoles repetitive name=Roles&#',
						value: [
							{
								ID: {
									struct: 'root.ProjectsRoles.value[x].ProjectRoles.value[x].ProjectRoleID text text name=Role ID&#',
									value: ''
								},
								ProjectName: {
									struct: 'root.ProjectsRoles.value[x].ProjectRoles.value[x].Name text text name=Role Created On&# disabled=true&#',
									value: ''
								}
							}
						]
					}
				}
			]
		}
	}

	let FilterModelTemplate = JSON.stringify(mtDirectory)
	const HandleUpdateFilterModelTemplate = (value: string) => (FilterModelTemplate = value)

	function handleInputSearchResultsLimit(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$DirectorySearchLimit = parseInt(value)
		if ($DirectorySearchLimit < 5) {
			$DirectorySearchLimit = 0
		} else if ($DirectorySearchLimit < $DirectorySearchOffset) {
			if ($DirectorySearchLimit - 1000 < 0) {
				$DirectorySearchOffset = 0
			} else {
				$DirectorySearchOffset = $DirectorySearchLimit - 1000
			}
		}
	}
	function handleInputSearchResultsOffset(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$DirectorySearchOffset = parseInt(value)
		if ($DirectorySearchOffset < 0) {
			$DirectorySearchOffset = 0
		} else if ($DirectorySearchOffset > $DirectorySearchLimit) {
			$DirectorySearchLimit = $DirectorySearchOffset + 1000
		}
	}

	async function handleSearchDirectory() {
		$Loading = true
		$LoadingMessage = 'Searching directory...'
		showFilter = false
		try {
			let url = new URL(`${PUBLIC_API_URL}/directory`)
			if ($DirectorySearchCurrentQuery.length > 1) {
				url.searchParams.append('sq', $DirectorySearchCurrentQuery)
			}
			if ($DirectorySearchCreatedOnGreaterThan != '') {
				url.searchParams.append('cogt', $DirectorySearchCreatedOnGreaterThan)
			}
			if ($DirectorySearchCreatedOnLessThan != '') {
				url.searchParams.append('colt', $DirectorySearchCreatedOnLessThan)
			}
			if ($DirectorySearchLastUpdatedOnGreaterThan != '') {
				url.searchParams.append('lugt', $DirectorySearchLastUpdatedOnGreaterThan)
			}
			if ($DirectorySearchLastUpdatedOnLessThan != '') {
				url.searchParams.append('lult', $DirectorySearchLastUpdatedOnLessThan)
			}
			url.searchParams.append('l', `${$DirectorySearchLimit}`)
			url.searchParams.append('o', `${$DirectorySearchOffset}`)
			url.searchParams.append('sb', $DirectorySearchSortBy)
			url.searchParams.append('sbo', $DirectorySearchSortByOrder)
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

	let showFilter = false

	function HandleUpdateCreatedFilterOptions(value: any) {
		$DirectorySearchCreatedFilterOptions = value
		if (Object.keys($DirectorySearchCreatedFilterOptions).length < 1) {
			FilterModelTemplate = JSON.stringify(mtDirectory)
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, $DirectorySearchCreatedFilterOptions, 'Updated Filter options')
	}

	let currentName = ''
	let currentNameError: string | null = null
	const DEFAULT_CURRENT_NAME_ERROR = 'Give this new user a name...'
	function handleInputCurrentName(value: string) {
		currentName = value
		if (currentName.length < 3) currentNameError = DEFAULT_CURRENT_NAME_ERROR
		else currentNameError = null
	}

	let currentContacts: string[] = []
	let currentContactsError: (string | null)[] = []
	function handleInputContactInfo(index: number, contactType: string | null, contactDetails: string | null) {
		if (contactType !== null) {
			currentContacts[index] = `${contactType.replaceAll(DISALLOWED_CHARACTERS_REGEX_SEARCH, '')}${OPTS_SPLIT}${currentContacts[index].split(OPTS_SPLIT)[1]}`
		}
		if (contactDetails !== null) {
			currentContacts[index] = `${currentContacts[index].split(OPTS_SPLIT)[0]}${OPTS_SPLIT}${contactDetails.replaceAll(DISALLOWED_CHARACTERS_REGEX_SEARCH, '')}`
		}
		if (currentContacts[index].split(OPTS_SPLIT)[0].length < 1 || currentContacts[index].split(OPTS_SPLIT)[1].length < 1) {
			currentContactsError[index] = 'Invalid contact info'
		} else currentContactsError[index] = null
	}
	function handleDeleteContactInfo(index: number) {
		currentContacts = currentContacts.filter((_, i) => index !== i)
		currentContactsError = currentContactsError.filter((_, i) => index !== i)
	}

	let previousIsSystemUser = false
	let currentIsSystemUser = false

	let currentIamEmail = ''
	let currentIamEmailError: string | null = null
	const DEFAULT_CURRENT_IAM_EMAIL_ERROR = 'Enter login email for user...'
	function handleInputCurrentIamEmail(value: string) {
		currentIamEmail = value
		if (currentIamEmail.length < 3) currentIamEmailError = DEFAULT_CURRENT_IAM_EMAIL_ERROR
		else currentIamEmailError = null
	}

	async function handleCreateUpdateUser() {
		if ($CurrentUser?.SystemUserCreatedOn === NIL_DATE_TIME) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Not Authorized to perform this action'
			return
		}
		if (currentName.length < 3) {
			currentNameError = DEFAULT_CURRENT_NAME_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Current user name is not valid'
			return
		} else currentNameError = null
		for (let cc of currentContacts) {
			if (cc.length < 6) {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = 'Current contact info is not valid'
				return
			}
		}
		if (currentContacts.length < 1) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Current user does not have contact info'
			return
		}
		if (currentIamEmail.length < 3) {
			currentIamEmailError = DEFAULT_CURRENT_IAM_EMAIL_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Current iam email is not valid'
			return
		} else currentIamEmailError = null
		if ($SearchResultsClickedIndex !== null && $DirectorySearchResults[$SearchResultsClickedIndex].ID) {
			if ($DirectorySearchResults[$SearchResultsClickedIndex].Name === currentName && AreValuesEqual($DirectorySearchResults[$SearchResultsClickedIndex].Contacts, currentContacts) && currentIsSystemUser === previousIsSystemUser) {
				$ToastType = Shared.ToastType.INFO
				$ToastMessage = 'No changes detected'
				return
			}
			let userInfoToUpdate: any = {}
			if ($DirectorySearchResults[$SearchResultsClickedIndex].Name !== currentName) {
				userInfoToUpdate = SetValueInObject(userInfoToUpdate, 'Directory.Name', currentName)
				userInfoToUpdate = SetValueInObject(userInfoToUpdate, 'Columns', ['name'])
			}
			if (!AreValuesEqual($DirectorySearchResults[$SearchResultsClickedIndex].Contacts, currentContacts)) {
				userInfoToUpdate = SetValueInObject(userInfoToUpdate, 'Directory.Contacts', currentContacts)
				if (Object.hasOwn(userInfoToUpdate, 'Columns') && userInfoToUpdate['Columns'].length > 0) {
					userInfoToUpdate = SetValueInObject(userInfoToUpdate, 'Columns', [...userInfoToUpdate['Columns'], 'contacts'])
				} else {
					userInfoToUpdate = SetValueInObject(userInfoToUpdate, 'Columns', ['contacts'])
				}
			}
			if (currentIsSystemUser !== previousIsSystemUser) {
				userInfoToUpdate = SetValueInObject(userInfoToUpdate, 'IsSystemUser', currentIsSystemUser)
			}
			$Loading = true
			$LoadingMessage = 'Updating user...'
			try {
				const fetchResponse = await fetch(`${PUBLIC_API_URL}/directory/${$DirectorySearchResults[$SearchResultsClickedIndex].ID}`, {
					method: 'PUT',
					credentials: 'include',
					body: JSON.stringify(userInfoToUpdate)
				})
				const data = await fetchResponse.json()
				if (fetchResponse.ok) {
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `User ${data.ID} updated`
					if ($DirectorySearchResults[$SearchResultsClickedIndex].Name !== currentName) {
						$DirectorySearchResults[$SearchResultsClickedIndex].Name = currentName
					}
					if (!AreValuesEqual($DirectorySearchResults[$SearchResultsClickedIndex].Contacts, currentContacts)) {
						$DirectorySearchResults[$SearchResultsClickedIndex].Contacts = currentContacts
					}
					if (currentIsSystemUser !== previousIsSystemUser) {
						$DirectorySearchResults[$SearchResultsClickedIndex].SystemUserCreatedOn = currentIsSystemUser ? new Date().toISOString() : NIL_DATE_TIME
						previousIsSystemUser = currentIsSystemUser
					}
					$DirectorySearchResults[$SearchResultsClickedIndex].LastUpdatedOn = data.LastUpdatedOn
				} else {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = data.message
				}
			} catch (e) {
				Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Create user error')
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = FETCH_ERROR
			}
		} else {
			$Loading = true
			$LoadingMessage = 'Creating new user'
			try {
				const fetchResponse = await fetch(`${PUBLIC_API_URL}/directory`, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify({
						Name: currentName,
						Contacts: currentContacts,
						Email: currentIamEmail,
						IsSystemUser: currentIsSystemUser
					})
				})
				const data = await fetchResponse.json()
				if (fetchResponse.ok) {
					$DirectorySearchResults = [
						...$DirectorySearchResults,
						{
							ID: data.ID,
							Name: currentName,
							Contacts: currentContacts,
							CreatedOn: new Date().toISOString(),
							SystemUserCreatedOn: currentIsSystemUser ? new Date().toISOString() : NIL_DATE_TIME,
							LastUpdatedOn: new Date().toISOString(),
							IamEmail: currentIamEmail,
							IamCreatedOn: new Date().toISOString(),
							IamLastUpdatedOn: new Date().toISOString(),
							ProjectsRoles: null
						}
					]
					resetUserFields()
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `User ${data.ID} created`
				} else {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = data.message
				}
			} catch (e) {
				Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Create user error')
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = FETCH_ERROR
			}
		}
		$Loading = false
		$LoadingMessage = null
	}

	enum IamRequestType {
		EMAIL_VERIFICATION = 'email_verification',
		PASSWORD_RESET = 'password_reset'
	}

	async function handleInitializeRequest(requestType: IamRequestType) {
		if ($SearchResultsClickedIndex === null) return
		$Loading = true
		$LoadingMessage = `Initializing ${requestType} reset...`
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/request/${requestType}`, {
				method: 'POST',
				body: JSON.stringify({
					Email: $DirectorySearchResults[$SearchResultsClickedIndex].IamEmail
				})
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = data.message
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e)
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$LoadingMessage = null
		$Loading = false
	}

	function HandleClickTableRow(index: number) {
		$SearchResultsClickedIndex = index
		currentName = $DirectorySearchResults[index].Name
		currentContacts = $DirectorySearchResults[index].Contacts
		currentContactsError = currentContacts.map(() => null)
		currentIamEmail = $DirectorySearchResults[index].IamEmail
		previousIsSystemUser = $DirectorySearchResults[index].SystemUserCreatedOn !== NIL_DATE_TIME && true
		currentIsSystemUser = previousIsSystemUser
		//@ts-expect-error
		document.getElementById('manage-user-dialog').showModal()
	}

	function resetUserFields() {
		currentName = ''
		currentNameError = null
		currentContacts = []
		currentContactsError = []
		currentIamEmail = ''
		currentIamEmailError = null
		previousIsSystemUser = false
		currentIsSystemUser = false
		$SearchResultsClickedIndex = null
	}

	onDestroy(() => $SearchResultsClickedIndex = null)

	function getProjectsRolesForClickedUser() {
		if ($SearchResultsClickedIndex !== null) {
			return $DirectorySearchResults[$SearchResultsClickedIndex].ProjectsRoles as {
				ProjectID: string
				ProjectName: string
				ProjectDescription: string
				ProjectCreatedOn: string
				ProjectRoles: {
					ProjectRoleID: string
					ProjectRoleCreatedOn: string
				}[]
			}[]
		} else {
			return []
		}
	}

	async function handleDeleteUser() {
		if ($SearchResultsClickedIndex === null) {
			return
		}
		if ($CurrentUser?.SystemUserCreatedOn === NIL_DATE_TIME) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Not Authorized to perform this action'
			return
		}
		$Loading = true
		$LoadingMessage = 'Deleting user...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/directory/${$DirectorySearchResults[$SearchResultsClickedIndex].ID}`, {
				method: 'DELETE',
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `In deleting user, ${data.UsersAffected} were affected`
				$DirectorySearchResults = $DirectorySearchResults.filter((_, i) => $SearchResultsClickedIndex !== i)
				resetUserFields()
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
</script>

<div class="flex-1 flex flex-col space-y-2 overflow-hidden">
	<header class="flex-[0.5] flex space-x-2">
		<section class="flex-[9] flex flex-col justify-center">
			<div class="form-control w-[90%]">
				<span class="join">
					<input class="join-item flex-[9.5] input input-secondary w-full shadow-sm shadow-gray-600" type="search" placeholder="Search directory..." bind:value={$DirectorySearchCurrentQuery} />
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={() => (showFilter = !showFilter)}>
						<Icon type="mdi:filter" />
					</button>
					<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={handleSearchDirectory}>
						<span class="w-fit h-fit self-center bg-transparent"><Icon type="mdi:search" /></span>
					</button>
				</span>
			</div>
			<div class="relative">
				{#if showFilter}
					<div class="absolute top-0 left-0 bg-white rounded-md p-1 w-[90%] shadow-md shadow-gray-800 mt-1 flex flex-col space-y-1 justify-center z-[100] max-h-[70vh] overflow-auto">
						<section class="flex flex-col space-y-1">
							<div class="text-md">Date range for when users were created...</div>
							<div class="join w-full">
								<DateTime bind:Value={$DirectorySearchCreatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$DirectorySearchCreatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
							<div class="divider" />
							<div class="text-md">Date range for when users were last updated...</div>
							<div class="join w-full">
								<DateTime bind:Value={$DirectorySearchLastUpdatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
								<DateTime bind:Value={$DirectorySearchLastUpdatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							</div>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Maximum no. of results</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter maximum no. of results to show..." value={$DirectorySearchLimit} on:input={(e) => handleInputSearchResultsLimit(e.currentTarget.value)} />
							</span>
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">No. of results to skip</span>
								<input class="join-item input input-primary w-full" type="number" placeholder="Enter no. of results to skip..." value={$DirectorySearchOffset} on:input={(e) => handleInputSearchResultsOffset(e.currentTarget.value)} />
							</span>
						</section>
						<section class="flex flex-col space-y-1">
							<span class="join join-vertical">
								<span class="join-item join-label-primary join-label-content">Sort by</span>
								<div class="join-item join join-horizontal w-full">
									<select class="join-item select select-primary flex-1" bind:value={$DirectorySearchSortBy}>
										<option selected={$DirectorySearchSortBy === ''} value="" disabled>Sorty By...</option>
										<option selected={$DirectorySearchSortBy === 'created_on'} value="created_on">Created on</option>
										<option selected={$DirectorySearchSortBy === 'last_updated_on'} value="last_updated_on">Last updated on</option>
									</select>
									<select class="join-item select select-primary flex-1" bind:value={$DirectorySearchSortByOrder}>
										<option selected={$DirectorySearchSortByOrder === ''} value="" disabled>Sorty By Order...</option>
										<option selected={$DirectorySearchSortByOrder === 'asc'} value="asc">Least recent first</option>
										<option selected={$DirectorySearchSortByOrder === 'desc'} value="desc">Most recent first</option>
									</select>
								</div>
							</span>
						</section>
						<button class="btn btn-secondary self-center w-full max-w-[350px] h-fit" on:click={ResetDirectoryStore}>reset</button>
					</div>
				{/if}
			</div>
		</section>
		<section class="flex-1 flex justify-end">
			<div class="tooltip tooltip-left" data-tip="Create new user">
				<button
					class="flex btn btn-circle btn-secondary justify-center"
					on:click={() => {
						//@ts-expect-error
						document.getElementById('manage-user-dialog').showModal()
					}}
				>
					<span class="w-fit h-fit self-center"><Icon type="mdi:plus" /></span>
				</button>
			</div>
		</section>
	</header>
	<main class="flex-[9.5] flex flex-col overflow-hidden space-y-1">
		{#if $DirectorySearchResults.length > 0}
			<div class="divider" />
			<Table
				Data={JSON.parse(JSON.stringify($DirectorySearchResults))}
				{HandleClickTableRow}
				{FilterModelTemplate}
				DataName="Users"
				CreatedFilterOptions={$DirectorySearchCreatedFilterOptions}
				{HandleUpdateCreatedFilterOptions}
				{HandleUpdateFilterModelTemplate}
				IncludeIndividualDataRowCounter={true}
				IncludeIndividualRowNumber={true}
			/>
			<div class="divider" />
		{:else}
			<div class="w-full h-full bg-gray-200 flex justify-center">
				<span class="text-2xl w-fit h-fit self-center flex">
					<span class="text-center text-primary">Create and manage users from the administrators perspective...</span>
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

<!-- Manage user dialog -->
<dialog id="manage-user-dialog" class="modal">
	<form method="dialog" class="modal-box p-0 rounded max-md:min-w-[90%] md:min-w-[200px] md:w-full md: max-w-[700px] max-h-full min-h-fit">
		<header class="sticky flex justify-between bg-accent items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
			<span class="text-lg text-primary">Manage user</span>
			<button class="btn btn-circle btn-ghost flex justify-center" on:click={resetUserFields}>
				<Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} />
			</button>
		</header>
		<main class="p-2 space-y-2 w-full flex flex-col overflow-auto max-h-[70vh]">
			{#if $SearchResultsClickedIndex !== null}
				<div>
					<span class="font-bold">ID: </span>
					<span>{$DirectorySearchResults[$SearchResultsClickedIndex].ID}</span>
				</div>
			{/if}
			<section class="form-control">
				<div class="join">
					<span class="join-item join-label-primary join-label-content">Name</span>
					<input class="join-item input input-primary w-full" type="text" placeholder="Enter name of user..." value={currentName} on:input={(e) => handleInputCurrentName(e.currentTarget.value)} />
				</div>
				{#if currentNameError}
					<div class="text-xs text-error">{currentNameError}</div>
					<div class="divider" />
				{/if}
			</section>
			<section class="form-control">
				<label class="label">
					<span class="label-text text-lg font-bold">Is System User?</span>
					<input type="checkbox" class="checkbox checkbox-primary" bind:checked={currentIsSystemUser} />
				</label>
			</section>
			<div class="divider text-lg font-bold">contacts</div>
			{#if currentContacts.length > 0}
				<section class="flex flex-col space-y-1 bg-gray-400 shadow-inner shadow-gray-700 p-1">
					{#each currentContacts as cc, index}
						<span class="join">
							<input class="join-item input input-primary w-full" type="text" placeholder="Contact type..." value={cc.split(OPTS_SPLIT)[0]} on:input={(e) => handleInputContactInfo(index, e.currentTarget.value, null)} />
							<input class="join-item input input-primary w-full" type="text" placeholder="Contact details..." value={cc.split(OPTS_SPLIT)[1]} on:input={(e) => handleInputContactInfo(index, null, e.currentTarget.value)} />
							<button
								class="join-item btn btn-error"
								on:click={(e) => {
									e.preventDefault()
									handleDeleteContactInfo(index)
								}}
							>
								<Icon type="mdi:delete" />
							</button>
						</span>
						{#if currentContactsError[index]}
							<div class="text-xs text-error">{currentContactsError[index]}</div>
							<div class="divider" />
						{/if}
					{/each}
				</section>
			{/if}
			<button
				class="btn btn-secondary h-fit w-[75%] self-center"
				on:click={(e) => {
					e.preventDefault()
					currentContacts = [...currentContacts, OPTS_SPLIT]
					currentContactsError = [...currentContactsError, null]
				}}
			>
				Add contact
			</button>
			{#if $SearchResultsClickedIndex !== null}
				<div><span class="font-bold">User Created On: </span>{LocalDateFromString($DirectorySearchResults[$SearchResultsClickedIndex].CreatedOn)} at {LocalTimeFromString($DirectorySearchResults[$SearchResultsClickedIndex].CreatedOn)}</div>
				<div><span class="font-bold">User Last Updated On: </span>{LocalDateFromString($DirectorySearchResults[$SearchResultsClickedIndex].LastUpdatedOn)} at {LocalTimeFromString($DirectorySearchResults[$SearchResultsClickedIndex].LastUpdatedOn)}</div>
			{/if}
			<div class="divider text-lg font-bold">Identity & Access Management</div>
			<section class="form-control">
				<div class="join">
					<span class="join-item join-label-primary join-label-content flex-[2]">Iam Email</span>
					<input
						class="join-item input input-primary w-full flex-[8]"
						type="text"
						placeholder="Enter login email..."
						value={currentIamEmail}
						on:input={(e) => handleInputCurrentIamEmail(e.currentTarget.value)}
						disabled={$SearchResultsClickedIndex !== null && $DirectorySearchResults[$SearchResultsClickedIndex].IamEmail.length > 0}
					/>
				</div>
				{#if currentIamEmailError}
					<div class="text-xs text-error">{currentIamEmailError}</div>
					<div class="divider" />
				{/if}
			</section>
			{#if $SearchResultsClickedIndex !== null}
				<div><span class="font-bold">Iam Created On: </span>{LocalDateFromString($DirectorySearchResults[$SearchResultsClickedIndex].IamCreatedOn)} at {LocalTimeFromString($DirectorySearchResults[$SearchResultsClickedIndex].IamCreatedOn)}</div>
				<div><span class="font-bold">Iam Last Updated On: </span>{LocalDateFromString($DirectorySearchResults[$SearchResultsClickedIndex].IamLastUpdatedOn)} at {LocalTimeFromString($DirectorySearchResults[$SearchResultsClickedIndex].IamLastUpdatedOn)}</div>
				{#if $DirectorySearchResults[$SearchResultsClickedIndex].ProjectsRoles}
					<div class="divider text-lg font-bold">Projects and roles</div>
					<div class="flex flex-col space-y-1 shadow-inner shadow-gray-700 p-1">
						{#each getProjectsRolesForClickedUser() as cpr, index}
							<div class="font-bold">Project #{index + 1}</div>
							<div><span class="font-bold">Project ID: </span>{cpr.ProjectID}</div>
							<div><span class="font-bold">Project Name: </span>{cpr.ProjectName}</div>
							<div class="break-words"><span class="font-bold">Project Roles: </span>{cpr.ProjectRoles.map((cprpr) => cprpr.ProjectRoleID).join(',')}</div>
							<div class="divider" />
						{/each}
					</div>
				{:else}
					<div class="divider" />
				{/if}
			{/if}
		</main>
		<footer class="flex flex-col p-1">
			<div class="join self-center">
				{#if $SearchResultsClickedIndex !== null}
					<button
						class="join-item btn btn-secondary h-fit tooltip tooltip-top"
						data-tip="send password reset mail"
						on:click={(e) => {
							e.preventDefault()
							handleInitializeRequest(IamRequestType.PASSWORD_RESET)
						}}
					>
						<Icon type="mdi:lock-reset"/>
					</button>
					<button
						class="join-item btn btn-secondary h-fit tooltip tooltip-top"
						data-tip="send email verification"
						on:click={(e) => {
							e.preventDefault()
							handleInitializeRequest(IamRequestType.EMAIL_VERIFICATION)
						}}
					>
						<Icon type="mdi:email-seal"/>
					</button>
					<button
						class="join-item btn btn-secondary h-fit tooltip tooltip-top"
						data-tip="delete/deactivate user"
						on:click={(e) => {
							e.preventDefault()
							handleDeleteUser()
						}}
					>
						<Icon type="mdi:account-remove"/>
					</button>
				{/if}
				<button
					class="join-item btn btn-secondary h-fit tooltip tooltip-top"
					data-tip="{$SearchResultsClickedIndex !== null ? "Update" : "Create new"} user"
					on:click={(e) => {
						e.preventDefault()
						handleCreateUpdateUser()
					}}
				>
					<Icon type={$SearchResultsClickedIndex !== null ? "mdi:account-edit" : "mdi:account-plus"}/>
				</button>
			</div>
		</footer>
	</form>
</dialog>
