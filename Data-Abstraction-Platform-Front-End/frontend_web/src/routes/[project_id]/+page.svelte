<script lang="ts">
	import { goto } from '$app/navigation'
	import { base } from '$app/paths'
	import { PUBLIC_API_URL } from '$env/static/public'
	import Icon from '$lib/components/Icon.svelte'
	import { FETCH_ERROR, LOGO_URL, OPTS_SPLIT, Shared } from '$lib/constants'
	import {
		CurrentProject,
		CurrentUser,
		Loading,
		LoadingMessage,
		ToastMessage,
		ToastType,
		ProjectsStatistics,
		ProjectsStatisticsLastFetch,
		CurrentProjectDetails,
		DirectorySearchResults,
		DirectorySearchCreatedOnGreaterThan,
		DirectorySearchCreatedOnLessThan,
		DirectorySearchCurrentQuery,
		DirectorySearchLastUpdatedOnGreaterThan,
		DirectorySearchLastUpdatedOnLessThan,
		DirectorySearchLimit,
		DirectorySearchOffset,
		DirectorySearchSortBy,
		DirectorySearchSortByOrder,
		DirectorySearchCreatedFilterOptions,
		SearchResultsClickedIndex
	} from '$lib/stores'
	import { IsProjectUserAuthorized, LocalDateFromString, LocalTimeFromString, Log, ResetAbstractionsStore, ResetCataloguesStore, ResetDirectoryStore, ResetFilesStore, ResetModelTemplatesStore, SetValueInObject } from '$lib/utils'
	import Table from '$lib/components/table/Table.svelte'
	import DateTime from '$lib/components/DateTime.svelte'
	import { onDestroy } from 'svelte'
	import type { ISearchUser } from '$lib/interface'
	import { browser } from '$app/environment'

	const CURRENT_SECTION = 'Project Home'

	const PROJECT_ROLES = ['abstractions_admin', 'catalogue_creator', 'editor', 'file_creator', 'model_templates_creator', 'project_admin', 'reviewer', 'explorer']

	enum Tab {
		YOU = 'you',
		PROJECT = 'project',
		MEMBERS = 'members'
	}

	let currentTab = Tab.YOU

	async function handleLogout() {
		$Loading = true
		$LoadingMessage = 'logging out...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/logout`, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = data.message
				$LoadingMessage = null
				$Loading = false
				$ProjectsStatistics = null
				$ProjectsStatisticsLastFetch = null
				$CurrentUser = null
				$CurrentProject = null
				$CurrentProjectDetails = null
				$SearchResultsClickedIndex = null
				ResetAbstractionsStore()
				ResetCataloguesStore()
				ResetFilesStore()
				ResetModelTemplatesStore()
				goto(`${base}/`)
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$LoadingMessage = null
		$Loading = false
	}

	async function getProjectStats() {
		if ($CurrentProject === null) return
		try {
			const projectStatsUrl = new URL(`${PUBLIC_API_URL}/platformstats/projects`)
			projectStatsUrl.searchParams.append('id', $CurrentProject.ProjectID)
			const fetchResponse = await fetch(projectStatsUrl, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ProjectsStatistics = data
				$ProjectsStatisticsLastFetch = new Date().toISOString()
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
	}
	
	$: if (browser && $CurrentProject !== null) {
		if ($ProjectsStatistics === null) {
			getProjectStats()
		}
		if ($CurrentProjectDetails !== null && $CurrentProjectDetails.ID !== $CurrentProject.ProjectID) {
			$CurrentProjectDetails = null
		}
	}

	async function getCurrentProjectDetails() {
		if ($CurrentProject === null || $CurrentProjectDetails !== null) return
		try {
			const projectStatsUrl = new URL(`${PUBLIC_API_URL}/projects`)
			projectStatsUrl.searchParams.append('id', $CurrentProject.ProjectID)
			const fetchResponse = await fetch(projectStatsUrl, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$CurrentProjectDetails = data
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
	}

	let currentProjectName: string = ''
	let currentProjectNameError: string | null = null
	const DEFAULT_CURRENT_PROJECT_NAME_ERROR = 'Name this project...'
	function handleInputCurrentProjectName(value: string) {
		currentProjectName = value
		if (currentProjectName.length < 3) currentProjectNameError = DEFAULT_CURRENT_PROJECT_NAME_ERROR
		else currentProjectNameError = null
	}

	let currentProjectDescription: string = ''
	let currentProjectDescriptionError: string | null = null
	const DEFAULT_CURRENT_PROJECT_DESCRIPTION_ERROR = 'Describe this project...'
	function handleInputCurrentDescription(value: string) {
		currentProjectDescription = value
		if (currentProjectDescription.length < 3) currentProjectDescriptionError = DEFAULT_CURRENT_PROJECT_DESCRIPTION_ERROR
		else currentProjectDescriptionError = null
	}

	let projectDetailsSet = false
	$: if ($CurrentProjectDetails !== null && !projectDetailsSet) {
		currentProjectName = $CurrentProjectDetails ? $CurrentProjectDetails.Name : ''
		currentProjectDescription = $CurrentProjectDetails ? $CurrentProjectDetails.Description : ''
		projectDetailsSet = true
	}

	async function handleUpdateProject() {
		if (!IsProjectUserAuthorized([Shared.ProjectRoles.PROJECT_ADMIN])) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Not Authorized to perform this action'
			return
		}
		if ($CurrentProjectDetails === null) return
		if (currentProjectName.length < 3) {
			currentProjectNameError = DEFAULT_CURRENT_PROJECT_NAME_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Current project name is not valid'
			return
		} else currentProjectNameError = null
		if (currentProjectDescription.length < 3) {
			currentProjectDescriptionError = DEFAULT_CURRENT_PROJECT_DESCRIPTION_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Current project description is not valid'
			return
		} else currentProjectDescriptionError = null
		if ($CurrentProjectDetails.Name === currentProjectName && $CurrentProjectDetails.Description === currentProjectDescription) {
			$ToastType = Shared.ToastType.INFO
			$ToastMessage = 'No changes detected'
			return
		}
		let projectInfoToUpdate: any = {}
		if ($CurrentProjectDetails.Name !== currentProjectName) {
			projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Project.Name', currentProjectName)
			projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Columns', ['name'])
		}
		if ($CurrentProjectDetails.Description !== currentProjectDescription) {
			projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Project.Description', currentProjectDescription)
			if (Object.hasOwn(projectInfoToUpdate, 'Columns') && projectInfoToUpdate['Columns'].length > 0) {
				projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Columns', [...projectInfoToUpdate['Columns'], 'description'])
			} else {
				projectInfoToUpdate = SetValueInObject(projectInfoToUpdate, 'Columns', ['description'])
			}
		}
		$Loading = true
		$LoadingMessage = 'Updating project...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/projects/${$CurrentProjectDetails.ID}`, {
				method: 'PUT',
				credentials: 'include',
				body: JSON.stringify(projectInfoToUpdate)
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `Project ${data.ID} updated`
				if ($CurrentProjectDetails.Name !== currentProjectName) {
					$CurrentProjectDetails.Name = currentProjectName
				}
				if ($CurrentProjectDetails.Description === currentProjectDescription) {
					$CurrentProjectDetails.Description = currentProjectDescription
				}
				$CurrentProjectDetails.LastUpdatedOn = data.LastUpdatedOn
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Update project error')
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

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
			struct: 'root.LastUpdatedOn text datetime name=Last Updated On&# dtf=yyyy-mm-dd HH:MM&# disabled=true&#',
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
						struct: 'root.ProjectsRoles.value[x].ProjectDescription text text name=Project Description&# disabled=true&#',
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

	let showFilter = false

	function HandleUpdateCreatedFilterOptions(value: any) {
		$DirectorySearchCreatedFilterOptions = value
		if (Object.keys($DirectorySearchCreatedFilterOptions).length < 1) {
			FilterModelTemplate = JSON.stringify(mtDirectory)
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, $DirectorySearchCreatedFilterOptions, 'Updated Filter options')
	}

	async function handleSearchProjectDirectory() {
		if ($CurrentProject === null) return
		$Loading = true
		$LoadingMessage = 'Searching directory...'
		showFilter = false
		try {
			let url = new URL(`${PUBLIC_API_URL}/directory`)
			url.searchParams.append('pid', $CurrentProject.ProjectID)
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

	let directorySearchResults: ISearchUser[] = []
	async function handleSearchDirectory() {
		if ($CurrentProject === null) return
		$Loading = true
		$LoadingMessage = 'Searching directory...'
		try {
			let url = new URL(`${PUBLIC_API_URL}/directory`)
			if ($DirectorySearchCurrentQuery.length > 1) {
				url.searchParams.append('sq', $DirectorySearchCurrentQuery)
			}
			url.searchParams.append('l', '30')
			url.searchParams.append('o', '0')
			url.searchParams.append('sb', $DirectorySearchSortBy)
			url.searchParams.append('sbo', $DirectorySearchSortByOrder)
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				directorySearchResults = data !== null ? data : []
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
		if ($DirectorySearchResults[index].ProjectsRoles !== null) {
			//@ts-expect-error
			currentProjectRoles = $DirectorySearchResults[index].ProjectsRoles[0].ProjectRoles
		}
		//@ts-expect-error
		document.getElementById('manage-user-dialog').showModal()
	}

	function resetUserFields() {
		currentProjectRoles = []
		$SearchResultsClickedIndex = null
	}

	let currentProjectRoles: { ProjectRoleID: string; ProjectRoleCreatedOn: string }[] = []

	let newProjectMember: {
		DirectoryID: string
		ProjectID: string
		ProjectRoles: string[]
	} | null = null

	async function handleCreateUpdateUserRoles() {
		if ($CurrentProject === null) return
		if ($SearchResultsClickedIndex === null && newProjectMember !== null) {
			$Loading = true
			$LoadingMessage = 'Adding user to project...'
			try {
				const fetchResponse = await fetch(`${PUBLIC_API_URL}/projects/roles`, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify(newProjectMember)
				})
				const data = await fetchResponse.json()
				if (fetchResponse.ok) {
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `User ${newProjectMember.DirectoryID} assigned ${data.RolesAssigned} roles`
				} else {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = data.message
				}
			} catch (e) {
				Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e)
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = FETCH_ERROR
			}
		} else if ($SearchResultsClickedIndex !== null) {
			let deleteProjectRolesIDs: string[] = []
			let addProjectRolesIDs: string[] = []
			if (currentProjectRoles.length < 1) {
				//@ts-expect-error
				deleteProjectRolesIDs = $DirectorySearchResults[$SearchResultsClickedIndex].ProjectsRoles[0].ProjectRoles.map((value) => value.ProjectRoleID)
			} else {
				//@ts-expect-error
				let previousProjectRolesIDs = $DirectorySearchResults[$SearchResultsClickedIndex].ProjectsRoles[0].ProjectRoles.map((value) => value.ProjectRoleID)
				let currentProjectRoleIDs = currentProjectRoles.map((value) => value.ProjectRoleID)
				previousProjectRolesIDs.forEach((value) => {
					if (!currentProjectRoleIDs.includes(value)) {
						deleteProjectRolesIDs = [...deleteProjectRolesIDs, value]
					}
				})
				currentProjectRoleIDs.forEach((value) => {
					if (!previousProjectRolesIDs.includes(value)) {
						addProjectRolesIDs = [...addProjectRolesIDs, value]
					}
				})
			}
			try {
				let messageSuccess: string[] = []
				if (deleteProjectRolesIDs.length > 0) {
					$Loading = true
					$LoadingMessage = 'deleting project roles...'
					const fetchResponse = await fetch(`${PUBLIC_API_URL}/projects/roles`, {
						method: 'DELETE',
						credentials: 'include',
						body: JSON.stringify({
							DirectoryID: $DirectorySearchResults[$SearchResultsClickedIndex].ID,
							ProjectID: $CurrentProject.ProjectID,
							ProjectRoles: deleteProjectRolesIDs
						})
					})
					const data = await fetchResponse.json()
					if (fetchResponse.ok) {
						directorySearchResults = data !== null ? data : []
						messageSuccess = [`User ${$DirectorySearchResults[$SearchResultsClickedIndex].ID} unassigned ${data.RolesDeleted} roles`]
						if (currentProjectRoles.length < 1) {
							$DirectorySearchResults = $DirectorySearchResults.filter((_, index) => index !== $SearchResultsClickedIndex)
							resetUserFields()
						} else {
							//@ts-expect-error
							$DirectorySearchResults[$SearchResultsClickedIndex].ProjectsRoles[0].ProjectRoles = currentProjectRoles
						}
					} else {
						$ToastType = Shared.ToastType.ERROR
						$ToastMessage = data.message
					}
				}
				if (addProjectRolesIDs.length > 0) {
					$Loading = true
					$LoadingMessage = 'adding project roles...'
					const fetchResponse = await fetch(`${PUBLIC_API_URL}/projects/roles`, {
						method: 'POST',
						credentials: 'include',
						body: JSON.stringify({
							DirectoryID: $DirectorySearchResults[$SearchResultsClickedIndex].ID,
							ProjectID: $CurrentProject.ProjectID,
							ProjectRoles: addProjectRolesIDs
						})
					})
					const data = await fetchResponse.json()
					if (fetchResponse.ok) {
						directorySearchResults = data !== null ? data : []
						messageSuccess = [...messageSuccess, `User ${$DirectorySearchResults[$SearchResultsClickedIndex].ID} assigned ${data.RolesAssigned} roles`]
						//@ts-expect-error
						$DirectorySearchResults[$SearchResultsClickedIndex].ProjectsRoles[0].ProjectRoles = currentProjectRoles
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
		$Loading = false
		$LoadingMessage = null
	}

	function checkIfProjectRoleExists(role: string) {
		for (let pr of currentProjectRoles) {
			if (role === pr.ProjectRoleID) {
				return true
			}
		}
		return false
	}

	onDestroy(() => ($SearchResultsClickedIndex = null))

	function handleNavigateToHomePage() {
		$ProjectsStatistics = null
		$ProjectsStatisticsLastFetch = null
		$CurrentProject = null
		$SearchResultsClickedIndex = null
		$CurrentProjectDetails = null
		ResetAbstractionsStore()
		ResetCataloguesStore()
		ResetFilesStore()
		ResetModelTemplatesStore()
		ResetDirectoryStore()
		goto(`${base}/`)
	}
</script>

{#if $CurrentProject !== null}
	<div class="flex flex-col self-center w-full lg:w-[60%] max-lg:w-[98%] h-full max-h-[98%] bg-white rounded-md shadow-sm shadow-gray-600 overflow-hidden p-2 space-y-2">
		<header class="flex-[0.5] flex space-x-1 justify-between">
			<div class="flex-[0.5] self-center w-fit h-fit">
				<img src={LOGO_URL} alt="data admin logo" class="w-[100%] h-[100%]" />
			</div>
			<div class="flex-[9] flex justify-center self-center">
				<section role="tablist" class="tabs tabs-boxed text-xl h-fit self-center">
					<button role="tab" class="tab self-center" class:tab-active={currentTab === Tab.YOU} on:click={() => (currentTab = Tab.YOU)}>You</button>
					<button role="tab" class="tab self-center" class:tab-active={currentTab === Tab.PROJECT} on:click={() => (currentTab = Tab.PROJECT)}>Project</button>
					<button role="tab" class="tab self-center" class:tab-active={currentTab === Tab.MEMBERS} on:click={() => (currentTab = Tab.MEMBERS)}>Members</button>
				</section>
			</div>
			{#if $CurrentUser !== null && Object.keys($CurrentUser).length > 0}
				<div class="flex-[0.5] join self-center">
					<button class="join-item btn btn-regular btn-ghost w-fit h-fit tooltip tooltip-bottom" on:click={handleNavigateToHomePage} data-tip="Switch projects">
						<Icon type="mdi:city-switch" color={Shared.Colors.NEUTRAL} />
					</button>
					<button class="join-item btn btn-regular btn-ghost w-fit h-fit tooltip tooltip-bottom" on:click={handleLogout} data-tip="logout">
						<Icon type="mdi:exit-to-app" color={Shared.Colors.NEUTRAL} />
					</button>
				</div>
			{/if}
		</header>
		<div class="divider" />
		<main class="flex-[9] flex flex-col space-y-2 overflow-hidden">
			{#if currentTab === Tab.YOU}
				{#if $CurrentUser}
					<div class="flex-1 overflow-auto space-y-2 max-h-[70vh]">
						<section class="space-y-2">
							<div><span class="font-bold">Name</span>: {$CurrentUser.Name}</div>
							<div><span class="font-bold">Contacts</span></div>
							{#if $CurrentUser.Contacts}
								{#each $CurrentUser.Contacts as c, index}
									<div>{index + 1}: {c.split(OPTS_SPLIT)[0]} - {c.split(OPTS_SPLIT)[1]}</div>
								{/each}
							{/if}
						</section>
						{#if $CurrentProject}
							<section class="overflow-x-hidden overflow-y-auto">
								<div class="font-bold text-xl text-secondary">Roles assigned</div>
								<section class="flex flex-col space-y-1">
									{#each $CurrentProject.ProjectRoles as cpr, index}
										<div class="text-black flex">
											<span class="self-center">{index + 1}: {cpr.ProjectRoleID.replaceAll('_', ' ')}</span>
										</div>
									{/each}
								</section>
							</section>
						{/if}
					</div>
				{/if}
			{:else if currentTab === Tab.PROJECT}
				{#await getCurrentProjectDetails()}
					<div>Loading...</div>
				{:then _}
					{#if $CurrentProjectDetails !== null}
						<div class="flex-1 overflow-auto space-y-2 max-h-[70vh]">
							<section class="form-control">
								<div class="join join-vertical">
									<span class="join-item join-label-content join-label-primary">Project Name</span>
									<input class="join-item input input-primary w-full" type="text" placeholder="Enter project name..." value={currentProjectName} on:input={(e) => handleInputCurrentProjectName(e.currentTarget.value)} disabled={!IsProjectUserAuthorized([Shared.ProjectRoles.PROJECT_ADMIN])} />
								</div>
								{#if currentProjectNameError}
									<div class="label">
										<span class="label-text text-error">{currentProjectNameError}</span>
									</div>
									<div class="divider" />
								{/if}
							</section>
							<section class="form-control">
								<div class="join join-vertical">
									<span class="join-item join-label-content join-label-primary">Project Description</span>
									<textarea
										class="join-item textarea textarea-primary max-h-[40vh]"
										placeholder="Enter project description..."
										value={currentProjectDescription}
										on:input={(e) => handleInputCurrentDescription(e.currentTarget.value)}
										disabled={!IsProjectUserAuthorized([Shared.ProjectRoles.PROJECT_ADMIN])}
									/>
								</div>
								{#if currentProjectDescriptionError}
									<div class="label">
										<span class="label-text text-error">{currentProjectDescriptionError}</span>
									</div>
									<div class="divider" />
								{/if}
							</section>
							<div class="text-lg text-secondary text-center"><span class="font-bold">Created on</span>: {LocalDateFromString($CurrentProjectDetails.CreatedOn)} at {LocalTimeFromString($CurrentProjectDetails.CreatedOn)}</div>
							<div class="text-lg text-secondary text-center"><span class="font-bold">Last updated on</span>: {LocalDateFromString($CurrentProjectDetails.LastUpdatedOn)} at {LocalTimeFromString($CurrentProjectDetails.LastUpdatedOn)}</div>
							{#if IsProjectUserAuthorized([Shared.ProjectRoles.PROJECT_ADMIN])}
								<div class="flex justify-center">
									<button class="btn btn-secondary h-fit w-[75%] self-center" on:click={handleUpdateProject}> Update Project </button>
								</div>
							{/if}
							<div class="divider">Storage drives</div>
							{#if $CurrentProjectDetails.Storage !== null && $CurrentProjectDetails.Storage.length > 0}
								{#each $CurrentProjectDetails.Storage as cpds, index}
									<div>{index + 1}: {cpds.StorageName}</div>
								{/each}
							{:else}
								<div class="text-center text-error italic">No storage drives available...</div>
							{/if}
						</div>
					{/if}
				{/await}
			{:else if currentTab === Tab.MEMBERS}
				<header class="flex-[0.5] flex space-x-2">
					<section class="flex-[9] flex flex-col justify-center">
						<div class="form-control w-[90%]">
							<span class="join">
								<input class="join-item flex-[9.5] input input-secondary w-full shadow-sm shadow-gray-600" type="search" placeholder="Search project directory..." bind:value={$DirectorySearchCurrentQuery} />
								<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={() => (showFilter = !showFilter)}>
									<Icon type="mdi:filter" />
								</button>
								<button class="join-item flex-[0.5] btn btn-regular btn-secondary" on:click={handleSearchProjectDirectory}>
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
					{#if IsProjectUserAuthorized([Shared.ProjectRoles.PROJECT_ADMIN])}
						<section class="flex-1 flex justify-end">
							<div class="tooltip tooltip-left" data-tip="Add new user to project">
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
					{/if}
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
						<div class="w-full h-full bg-gray-200 flex justify-center min-h-[40vh]">
							<span class="text-2xl w-fit h-fit self-center flex">
								<span class="text-center text-primary">Browse project directory...</span>
							</span>
						</div>
					{/if}
				</main>
			{/if}
		</main>
		{#if $ProjectsStatistics !== null}
			<section class="flex-[0.5] shadow-inner shadow-gray-800 rounded-md flex flex-col space-y-1 p-1">
				<div class="w-full flex justify-evenly">
					<div class="flex-1">
						<div class="font-bold text-xl text-center">{$ProjectsStatistics.NoOfMembers ? $ProjectsStatistics.NoOfMembers : '-'}</div>
						<div class="text-lg text-center">Members</div>
					</div>
					<div class="flex-1">
						<div class="font-bold text-xl text-center">{$ProjectsStatistics.NoOfModelTemplates ? $ProjectsStatistics.NoOfModelTemplates : '-'}</div>
						<div class="text-lg text-center">Model Templates</div>
					</div>
					<div class="flex-1">
						<div class="font-bold text-xl text-center">{$ProjectsStatistics.NoOfCatalogues ? $ProjectsStatistics.NoOfCatalogues : '-'}</div>
						<div class="text-lg text-center">Catalogues</div>
					</div>
					<div class="flex-1">
						<div class="font-bold text-xl text-center">{$ProjectsStatistics.NoOfFiles ? $ProjectsStatistics.NoOfFiles : '-'}</div>
						<div class="text-lg text-center">Files</div>
					</div>
					<div class="flex-1">
						<div class="font-bold text-xl text-center">{$ProjectsStatistics.NoOfAbstractions ? $ProjectsStatistics.NoOfAbstractions : '-'}</div>
						<div class="text-lg text-center">Abstractions</div>
					</div>
				</div>
				{#if $ProjectsStatisticsLastFetch !== null}
					<div class="flex space-x-1 w-fit self-center">
						<span class="text-xs h-fit w-fit self-center">As of: <span class="italic">{LocalDateFromString($ProjectsStatisticsLastFetch)} at {LocalTimeFromString($ProjectsStatisticsLastFetch)}</span></span>
						<button class="btn btn-circle btn-ghost h-fit w-fit self-center" on:click={getProjectStats}><Icon type="mdi:reload" color={Shared.Colors.PRIMARY} iconSize="20" /></button>
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
					<div>
						<span class="font-bold">Name: </span>
						<span>{$DirectorySearchResults[$SearchResultsClickedIndex].Name}</span>
					</div>
					<div class="divider text-lg font-bold">contacts</div>
					{#if $DirectorySearchResults[$SearchResultsClickedIndex].Contacts.length > 0}
						<section class="flex flex-col space-y-1 bg-gray-400 shadow-inner shadow-gray-700 p-1">
							{#each $DirectorySearchResults[$SearchResultsClickedIndex].Contacts as cc}
								<span class="join w-full bg-white p-1 space-x-1">
									<div class="join-item flex-1 border-r-2">{cc.split(OPTS_SPLIT)[0]}</div>
									<div class="join-item flex-[2]">{cc.split(OPTS_SPLIT)[1]}</div>
								</span>
							{/each}
						</section>
					{/if}
					<div class="divider text-lg font-bold">project roles</div>
					{#if currentProjectRoles}
						<section class="flex flex-wrap justify-evenly">
							{#each PROJECT_ROLES as pr, index}
								<div class="form-control">
									<label class="cursor-pointer label space-x-1">
										<span class="label-text">{pr}</span>
										<input
											id="{index}-{pr}"
											type="checkbox"
											checked={checkIfProjectRoleExists(pr)}
											class="checkbox checkbox-primary"
											on:click={() => (currentProjectRoles = checkIfProjectRoleExists(pr) ? currentProjectRoles.filter((cpr) => cpr.ProjectRoleID !== pr) : [...currentProjectRoles, { ProjectRoleCreatedOn: new Date().toISOString(), ProjectRoleID: pr }])}
											disabled={!IsProjectUserAuthorized([Shared.ProjectRoles.PROJECT_ADMIN])}
										/>
									</label>
								</div>
							{/each}
						</section>
					{/if}
				{:else}
					<section class="flex space-x-2">
						<section class="flex-[9] flex flex-col justify-center">
							<div class="form-control">
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
							</div>
						</section>
					</section>
					<section class="flex-1 flex">
						{#if directorySearchResults.length > 0}
							<div class="overflow-auto max-h-[50vh] rounded-md w-full">
								<table class="table w-full shadow-inner shadow-gray-800 rounded-md">
									<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0">
										<tr>
											<th>#</th>
											<th>Name</th>
											<th>Contacts</th>
										</tr>
									</thead>
									<tbody>
										{#each directorySearchResults as dsr}
											<tr>
												<td>
													<button
														class="btn btn-ghost w-fit h-fit"
														on:click={(e) => {
															e.preventDefault()
															if ($CurrentProject !== null) {
																newProjectMember = {
																	DirectoryID: dsr.ID,
																	ProjectID: $CurrentProject.ProjectID,
																	ProjectRoles: [Shared.ProjectRoles.EXPLORER]
																}
															}
														}}
													>
														<Icon type={newProjectMember !== null && newProjectMember.DirectoryID === dsr.ID ? 'mdi:check' : 'mdi:close-thick'} color={newProjectMember !== null && newProjectMember.DirectoryID === dsr.ID ? Shared.Colors.SUCCESS : Shared.Colors.ERROR} />
													</button>
												</td>
												<td><span class="break-words">{dsr.Name}</span></td>
												<td><span class="break-words">{dsr.Contacts}</span></td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						{/if}
					</section>
				{/if}
			</main>
			<footer class="flex flex-col p-1">
				<div class="join self-center">
					{#if IsProjectUserAuthorized([Shared.ProjectRoles.PROJECT_ADMIN])}
						<button
							class="join-item btn btn-secondary h-fit"
							on:click={(e) => {
								e.preventDefault()
								handleCreateUpdateUserRoles()
							}}
						>
							{$SearchResultsClickedIndex !== null && $DirectorySearchResults[$SearchResultsClickedIndex].ID ? 'Update user roles' : 'Add new user to project'}
						</button>
					{/if}
				</div>
			</footer>
		</form>
	</dialog>
{/if}
