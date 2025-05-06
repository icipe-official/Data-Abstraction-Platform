<script lang="ts">
	import { CurrentProject, CurrentUser, Loading, LoadingMessage, ModelTemplatesSearchResults, SearchResultsClickedIndex, ToastMessage, ToastType } from '$lib/stores'
	import { onDestroy } from 'svelte'
	import type { PageData } from './$types'
	import TemplateManager from '$lib/modeltemplate/templatemanager'
	import type { IFormKeyValue, IModelTemplate_temp, ITemplateStructValue } from '$lib/interface'
	import { AreValuesEqual, DeleteValueInObject, GetValueInObject, IsProjectUserAuthorized, LocalDateFromString, LocalTimeFromString, Log, SetValueInObject } from '$lib/utils'
	import { FETCH_ERROR, LOGO_URL, OPT_SPLIT, Shared } from '$lib/constants'
	import { PUBLIC_API_URL } from '$env/static/public'
	import { goto } from '$app/navigation'
	import { base } from '$app/paths'
	import { browser } from '$app/environment'
	import Icon from '$lib/components/Icon.svelte'

	const CURRENT_SECTION = 'Model Template'
	export let data: PageData

	enum LeftSectionTabs {
		DESCRIPTION = 'DESCRIPTION',
		BUILDING = 'BUILDING',
		UI = 'UI'
	}
	let currentTab: LeftSectionTabs = LeftSectionTabs.DESCRIPTION
	const getCurrentTab = () => currentTab
	const setCurrentTab = (value: LeftSectionTabs) => (currentTab = value)

	let previousModelTemplate: string
	let currentModelTemplate: any
	let demoTemplateManager: TemplateManager

	let previousTemplateName: string
	let currentTemplateName: string
	let currentTemplateNameError: string | null = null
	const DEFAULT_CURRENT_TEMPLATE_NAME_ERROR = 'Name this template...'
	function handleInputCurrentTemplateName(value: string) {
		currentTemplateName = value
		if (currentTemplateName.length < 3) currentTemplateNameError = DEFAULT_CURRENT_TEMPLATE_NAME_ERROR
		else currentTemplateNameError = null
	}

	let previousDescription: string
	let currentDescription: string
	let currentDescriptionError: string | null = null
	const DEFAULT_CURRENT_DESCRIPTION_ERROR = 'Describe this template...'
	function handleInputCurrentDescription(value: string) {
		currentDescription = value
		if (currentDescription.length < 3) currentDescriptionError = DEFAULT_CURRENT_DESCRIPTION_ERROR
		else currentDescriptionError = null
	}

	let previousDataName: string
	let currentDataName: string
	let currentDataNameError: string | null = null
	const DEFAULT_CURRENT_DATA_NAME_ERROR = "What's the name of the data being collected..."
	function handleInputCurrentDataName(value: string) {
		currentDataName = value
		if (currentDataName.length < 3) currentDataNameError = DEFAULT_CURRENT_DATA_NAME_ERROR
		else currentDataNameError = null
	}

	let previousCanPublicView: boolean
	let currentCanPublicView: boolean

	let previousVerificationQuorum: number
	let currentVerificationQuorum: number

	function CreateUpdateTemplateFieldGroup(key: string, value: ITemplateStructValue | string) {
		key = key.replace('root.', '').replaceAll('[x]', '[0]')
		if (typeof value !== 'string') {
			let fieldGroupPath = value.struct.split(' ')[0].replaceAll('[0]', '[x]')
			value.struct =
				fieldGroupPath +
				' ' +
				value.struct
					.split(' ')
					.filter((_, index) => index !== 0)
					.join(' ')
		}
		currentModelTemplate = SetValueInObject(currentModelTemplate, key, value)
		demoTemplateManager = new TemplateManager(currentModelTemplate)
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, currentModelTemplate, 'After Create update Template Field/Group')
	}
	function DeleteTemplateFieldGroup(key: string) {
		key = key.replace('root.', '').replaceAll('[x]', '[0]')
		currentModelTemplate = DeleteValueInObject(currentModelTemplate, key)
		demoTemplateManager = new TemplateManager(currentModelTemplate)
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, currentModelTemplate, 'After delete Template Field/Group')
	}

	let modeltemplateValues: any = {}
	function UpdateValue(value: IFormKeyValue, repetitiveIndexes: number[]) {
		value.key = value.key.replace('root.', '')
		repetitiveIndexes.forEach((ri) => {
			value.key = value.key.replace('[x]', `[${ri}]`)
		})
		modeltemplateValues = SetValueInObject(modeltemplateValues, value.key.replaceAll('.value', ''), value.value)
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, modeltemplateValues, 'Update modeltemplate value')
	}

	function GetValue(key: string, repetitiveIndexes: number[]) {
		key = key.replace('root.', '')
		repetitiveIndexes.forEach((ri) => {
			key = key.replace('[x]', `[${ri}]`)
		})
		return GetValueInObject(modeltemplateValues, key.replaceAll('.value', ''))
	}

	function DeleteFieldValue(key: string, repetitiveIndexes: number[]) {
		key = key.replace('root.', '')
		repetitiveIndexes.forEach((ri) => {
			key = key.replace('[x]', `[${ri}]`)
		})
		modeltemplateValues = DeleteValueInObject(modeltemplateValues, key.replaceAll('.value', ''))
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, modeltemplateValues, 'After delete model template value field')
	}

	async function handleCreateUpdateTemplate() {
		if ((!data.ID && !IsProjectUserAuthorized([Shared.ProjectRoles.MODEL_TEMPLATES_CREATOR])) || (data.ID && data.DirectoryID !== $CurrentUser?.DirectoryID)) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Not Authorized to perform this action'
			return
		}
		if (currentTemplateName.length < 3) {
			currentTemplateNameError = DEFAULT_CURRENT_TEMPLATE_NAME_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Current template name is not valid'
			return
		} else currentTemplateNameError = null
		if (currentDescription.length < 3) {
			currentDescriptionError = DEFAULT_CURRENT_DESCRIPTION_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Current description is not valid'
			return
		} else currentDescriptionError = null
		if (currentDataName.length < 3) {
			currentDataNameError = DEFAULT_CURRENT_DATA_NAME_ERROR
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Current data name is not valid'
			return
		} else currentDataNameError = null
		if (Object.keys(currentModelTemplate).length < 1) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Model Template is not valid'
			return
		}
		if (data.ID) {
			if (
				previousTemplateName === currentTemplateName &&
				previousDescription === currentDescription &&
				AreValuesEqual(JSON.parse(previousModelTemplate), currentModelTemplate) &&
				currentDataName === previousDataName &&
				previousCanPublicView === currentCanPublicView &&
				currentVerificationQuorum === previousVerificationQuorum
			) {
				$ToastType = Shared.ToastType.INFO
				$ToastMessage = 'No changes detected'
				return
			}
		}
		$Loading = true
		if (data.ID) {
			let Columns: string[] = []
			let ModelTemplate: IModelTemplate_temp = {}
			if (previousTemplateName !== currentTemplateName) {
				ModelTemplate.TemplateName = currentTemplateName
				Columns = ['template_name']
			}
			if (previousDescription !== currentDescription) {
				ModelTemplate.Description = currentDescription
				Columns = [...Columns, 'description']
			}
			if (previousDataName !== currentDataName) {
				ModelTemplate.DataName = currentDataName
				Columns = [...Columns, 'data_name']
			}
			if (previousVerificationQuorum !== currentVerificationQuorum) {
				ModelTemplate.VerificationQuorum = currentVerificationQuorum
				Columns = [...Columns, 'verification_quorum']
			}
			if (!AreValuesEqual(previousModelTemplate, currentModelTemplate)) {
				ModelTemplate.ModelTemplate = JSON.stringify(currentModelTemplate)
				Columns = [...Columns, 'model_template']
			}
			if (previousCanPublicView !== currentCanPublicView) {
				ModelTemplate.CanPublicView = currentCanPublicView
				Columns = [...Columns, 'can_public_view']
			}
			$LoadingMessage = `Updating modeltemplate ${data.ID}...`
			try {
				const fetchResponse = await fetch(`${PUBLIC_API_URL}/modeltemplate/${$CurrentProject?.ProjectID}/${data.ID}`, {
					credentials: 'include',
					method: 'PUT',
					body: JSON.stringify({ ModelTemplate, Columns })
				})
				const fetchData = await fetchResponse.json()
				if (fetchResponse.ok) {
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `Model Template with id ${fetchData.ID} updated`
					previousTemplateName = currentTemplateName
					previousDescription = currentDescription
					previousDataName = currentDataName
					previousVerificationQuorum = currentVerificationQuorum
					previousModelTemplate = JSON.stringify(currentModelTemplate)
					previousCanPublicView = currentCanPublicView
					demoTemplateManager = new TemplateManager(currentModelTemplate)
					data.LastUpdatedOn = fetchData.LastUpdatedOn
					if ($SearchResultsClickedIndex !== null) {
						$ModelTemplatesSearchResults[$SearchResultsClickedIndex].TemplateName = currentTemplateName
						$ModelTemplatesSearchResults[$SearchResultsClickedIndex].Description = currentDescription
						$ModelTemplatesSearchResults[$SearchResultsClickedIndex].DataName = currentDataName
						$ModelTemplatesSearchResults[$SearchResultsClickedIndex].ModelTemplate = JSON.stringify(currentModelTemplate)
						$ModelTemplatesSearchResults[$SearchResultsClickedIndex].VerificationQuorum = currentVerificationQuorum
						$ModelTemplatesSearchResults[$SearchResultsClickedIndex].CanPublicView = currentCanPublicView
						$ModelTemplatesSearchResults[$SearchResultsClickedIndex].LastUpdatedOn = fetchData.LastUpdatedOn
					}
				} else {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = fetchData.message
				}
			} catch (e) {
				Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Update model-template error')
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = FETCH_ERROR
			}
		} else {
			$LoadingMessage = 'Creating new modeltemplate...'
			try {
				const fetchResponse = await fetch(`${PUBLIC_API_URL}/modeltemplate`, {
					credentials: 'include',
					method: 'POST',
					body: JSON.stringify({
						ProjectID: $CurrentProject?.ProjectID,
						TemplateName: currentTemplateName,
						DataName: currentDataName,
						Description: currentDescription,
						ModelTemplate: JSON.stringify(currentModelTemplate)
					})
				})
				const data = await fetchResponse.json()
				if (fetchResponse.ok) {
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `Model Template with id ${data.ID} created`
					currentTemplateName = ''
					currentDataName = ''
					currentDescription = ''
					currentModelTemplate = {}
				} else {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = data.message
				}
			} catch (e) {
				Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Create Template error')
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = FETCH_ERROR
			}
		}
		$Loading = false
		$LoadingMessage = null
	}

	async function handleDeleteTemplate() {
		if (!data.ID || (data.ID && data.DirectoryID !== $CurrentUser?.DirectoryID)) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Not Authorized to perform this action'
			return
		}
		$Loading = true
		$LoadingMessage = 'Deleting model template...'
		try {
			const deleteUrl = new URL(`${PUBLIC_API_URL}/modeltemplate/${data.ID}`)
			if ($CurrentUser?.DirectoryID !== data.DirectoryID) {
				deleteUrl.searchParams.append("pid", $CurrentProject?.ProjectID as string)
			}
			const fetchResponse = await fetch(deleteUrl, {
				credentials: 'include',
				method: 'DELETE'
			})
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				if (fetchData.ModelTemplatesAffected === 1) {
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `${fetchData.ModelTemplatesAffected} Model Template deleted`
				} else {
					$ToastType = Shared.ToastType.WARNING
					$ToastMessage = `${fetchData.ModelTemplatesAffected} Model Templates deleted`
				}
				if ($ModelTemplatesSearchResults.length > 0) {
					$ModelTemplatesSearchResults = $ModelTemplatesSearchResults.filter((mtsr) => mtsr.ID !== data.ID)
				}
				goto(`${base}/${$CurrentProject?.ProjectID}/modeltemplate`)
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = fetchData.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Delete Model Template')
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

	let CopiedFieldGroup: ITemplateStructValue | null = null
	function SetCopiedFieldGRoup(value: ITemplateStructValue) {
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, value, 'Copied Field/Group')
		CopiedFieldGroup = JSON.parse(JSON.stringify(value))
	}

	function HandleReoderFieldGroup(currentGroupPath: string, direction: number, currentIndex: number, currentFieldGroupPath: string) {
		let groupToReorder = currentGroupPath === 'root' ? currentModelTemplate : GetValueInObject(currentModelTemplate, currentGroupPath.replace('root.', ''))
		let fieldGroupToOrder = GetValueInObject(currentModelTemplate, currentFieldGroupPath.replace('root.', ''))
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, `${currentGroupPath} | ${direction} | ${currentIndex} | ${currentFieldGroupPath}`)
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, groupToReorder, 'Group To Reorder')
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, fieldGroupToOrder, 'Field/Group To Reorder')
		let newGroup: any = {}
		Object.keys(groupToReorder).forEach((gtr, index) => {
			if (index === currentIndex) {
				return
			}
			if (direction < 0 && currentIndex + direction === index) {
				newGroup[`${currentFieldGroupPath.split('.').at(-1)}`] = fieldGroupToOrder
				newGroup[`${gtr}`] = groupToReorder[`${gtr}`]
			} else if (direction > 0 && currentIndex + direction === index) {
				newGroup[`${gtr}`] = groupToReorder[`${gtr}`]
				newGroup[`${currentFieldGroupPath.split('.').at(-1)}`] = fieldGroupToOrder
			} else {
				newGroup[`${gtr}`] = groupToReorder[`${gtr}`]
			}
		})
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, newGroup, 'Reordered group')
		currentModelTemplate = currentGroupPath === 'root' ? newGroup : SetValueInObject(currentModelTemplate, currentGroupPath.replace('root.', ''), newGroup)
		demoTemplateManager = new TemplateManager(currentModelTemplate)
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, currentModelTemplate, 'Reordered template')
	}

	let RootViewElement: HTMLElement | undefined = undefined
	let viewUiAsTable = false
	const setViewUiAsTable = (value: boolean) => viewUiAsTable = value
	$:if (currentModelTemplate) {
		setViewUiAsTable(!viewUiAsTable)
		setViewUiAsTable(!viewUiAsTable)
	}

	onDestroy(() => ($SearchResultsClickedIndex = null))

	let windowWidth = window.innerWidth
	let ExpandLeftSection = false
	const HandleExpandLeftSection = () => (ExpandLeftSection = !ExpandLeftSection)
	$: {
		if (windowWidth > 1065) {
			if (getCurrentTab() === LeftSectionTabs.UI) {
				setCurrentTab(LeftSectionTabs.BUILDING)
			}
		} else {
			ExpandLeftSection = false
		}
	}

	async function initializeModelTemplate() {
		$Loading = true
		$LoadingMessage = 'Setting up modeltemplate...'
		previousModelTemplate = data.ModelTemplate ? data.ModelTemplate : '{}'
		currentModelTemplate = JSON.parse(previousModelTemplate)
		demoTemplateManager = new TemplateManager(currentModelTemplate)
		previousTemplateName = data.TemplateName ? data.TemplateName : ''
		currentTemplateName = previousTemplateName
		previousDescription = data.Description ? data.Description : ''
		currentDescription = previousDescription
		previousDataName = data.DataName ? data.DataName : ''
		currentDataName = previousDataName
		previousCanPublicView = typeof data.CanPublicView !== 'undefined' ? data.CanPublicView : false
		currentCanPublicView = previousCanPublicView
		previousVerificationQuorum = typeof data.VerificationQuorum !== 'undefined' ? data.VerificationQuorum : 0
		currentVerificationQuorum = previousVerificationQuorum
		$Loading = false
		$LoadingMessage = null
	}
</script>

<svelte:window bind:innerWidth={windowWidth} />

{#if browser && $CurrentProject}
	{#await initializeModelTemplate() then _}
		<div class="flex self-center w-full h-full max-w-[98%] max-h-[98%] overflow-hidden space-x-2">
			{#if (windowWidth > 1065 && !ExpandLeftSection) || windowWidth <= 1065}
				<section class="flex-1 flex flex-col bg-white rounded-md shadow-md shadow-gray-800 p-2 overflow-hidden space-y-2">
					<header class="flex-[0.5] flex justify-center">
						<section class="tabs tabs-boxed w-full flex">
							<button class="flex-1 tab" class:tab-active={currentTab === LeftSectionTabs.DESCRIPTION} on:click={() => setCurrentTab(LeftSectionTabs.DESCRIPTION)}>
								{LeftSectionTabs.DESCRIPTION}
							</button>
							<button class="flex-1 tab" class:tab-active={currentTab === LeftSectionTabs.BUILDING} on:click={() => setCurrentTab(LeftSectionTabs.BUILDING)}>
								{LeftSectionTabs.BUILDING}
							</button>
							{#if windowWidth <= 1065}
								<button class="flex-1 tab" class:tab-active={currentTab === LeftSectionTabs.UI} on:click={() => setCurrentTab(LeftSectionTabs.UI)}>
									{LeftSectionTabs.UI}
								</button>
							{/if}
						</section>
					</header>
					{#if currentTab === LeftSectionTabs.DESCRIPTION}
						<main class="flex-[9] flex flex-col overflow-hidden rounded-md bg-accent shadow-inner shadow-gray-800 overflow-x-hidden overflow-y-auto p-2 space-y-2">
							<section class="form-control">
								<div class="join join-vertical">
									<span class="join-item join-label-content join-label-primary">Template Name</span>
									<input class="join-item input input-primary w-full" type="text" placeholder="Enter template name..." value={currentTemplateName} on:input={(e) => handleInputCurrentTemplateName(e.currentTarget.value)} />
								</div>
								{#if currentTemplateNameError}
									<div class="label">
										<span class="label-text text-error">{currentTemplateNameError}</span>
									</div>
									<div class="divider" />
								{/if}
							</section>
							<section class="form-control">
								<div class="join join-vertical">
									<span class="join-item join-label-content join-label-primary">Description</span>
									<textarea class="join-item textarea textarea-primary max-h-[40vh]" placeholder="Enter template description..." value={currentDescription} on:input={(e) => handleInputCurrentDescription(e.currentTarget.value)} />
								</div>
								{#if currentDescriptionError}
									<div class="label">
										<span class="label-text text-error">{currentDescriptionError}</span>
									</div>
									<div class="divider" />
								{/if}
							</section>
							<section class="form-control">
								<div class="join join-vertical">
									<span class="join-item join-label-content join-label-primary">Data Name</span>
									<input class="join-item input input-primary w-full" type="text" placeholder="Enter data name..." value={currentDataName} on:input={(e) => handleInputCurrentDataName(e.currentTarget.value)} />
								</div>
								{#if currentDataNameError}
									<div class="label">
										<span class="label-text text-error">{currentDataNameError}</span>
									</div>
									<div class="divider" />
								{/if}
							</section>
							<section class="form-control">
								<div class="join join-vertical">
									<span class="join-item join-label-content join-label-primary">Verification Quorum</span>
									<input class="join-item input input-primary w-full" type="number" placeholder="Enter verification quorum..." bind:value={currentVerificationQuorum} />
								</div>
							</section>
							<section class="form-control">
								<label class="label">
									<span class="label-text text-lg font-bold">Can Public View?</span>
									<input type="checkbox" class="checkbox checkbox-primary" checked={currentCanPublicView} on:change={(e) => currentCanPublicView = e.currentTarget.checked} />
								</label>
							</section>
							{#if data.CreatedOn && data.LastUpdatedOn && data.Directory}
								<section class="flex flex-col">
									<div class="text-lg text-primary text-center"><span class="font-bold">Created by</span> {data.Directory.Name} <span class="font-bold">On</span> {LocalDateFromString(data.CreatedOn)} at {LocalTimeFromString(data.CreatedOn)}</div>
									<div class="text-lg text-secondary text-center"><span class="font-bold">Last updated on</span>: {LocalDateFromString(data.LastUpdatedOn)} at {LocalTimeFromString(data.LastUpdatedOn)}</div>
								</section>
							{/if}
						</main>
						<footer class="flex-[0.5] join">
							{#if data.DirectoryID === $CurrentUser?.DirectoryID || IsProjectUserAuthorized([Shared.ProjectRoles.PROJECT_ADMIN])}
								<button class="join-item btn btn-regular btn-secondary flex-1" on:click={handleDeleteTemplate}>
									<Icon type="mdi:delete" /> Template
								</button>
							{/if}
							{#if (!data.ID && IsProjectUserAuthorized([Shared.ProjectRoles.MODEL_TEMPLATES_CREATOR])) || (data.ID && data.DirectoryID === $CurrentUser?.DirectoryID)}
								<button class="join-item btn btn-regular btn-primary flex-1" on:click={handleCreateUpdateTemplate}>
									<Icon type="mdi:content-save" /> Template
								</button>
							{/if}
						</footer>
					{:else if currentTab === LeftSectionTabs.BUILDING}
						<main bind:this={RootViewElement} class="flex-[9] flex flex-col overflow-auto rounded-md bg-white shadow-inner shadow-gray-800 p-2">
							{#if RootViewElement}
								{#await import('$lib/modeltemplate/building/Template.svelte')}
									<div class="w-full h-full flex justify-center bg-gray-400">
										<div class="w-fit h-fit self-center flex flex-col">
											<div class="w-fit h-fit self-center">
												<span class="loading loading-ball loading-sm text-accent" />
												<span class="loading loading-ball loading-md text-secondary" />
												<span class="loading loading-ball loading-lg text-primary" />
											</div>
											<div class="text-lg text-white">Loading...</div>
										</div>
									</div>
								{:then Template}
									<Template.default TemplateUniqueGroup={currentModelTemplate} UniqueGroupBasePath="root" {CreateUpdateTemplateFieldGroup} {DeleteTemplateFieldGroup} {CopiedFieldGroup} {SetCopiedFieldGRoup} {HandleReoderFieldGroup} {RootViewElement} GroupName="root" />
								{:catch}
									<div class="w-full h-full flex justify-center bg-gray-400">
										<div class="w-fit h-fit self-center flex flex-col">
											<div class="text-lg text-white">Network error...</div>
										</div>
									</div>
								{/await}
							{/if}
						</main>
					{:else if currentTab === LeftSectionTabs.UI}
						<header class="flex-[0.5] flex">
							<section class="flex-1 flex">
								<img src={LOGO_URL} alt="data admin logo" class="max-w-[5vw] max-h-[5vh] self-center" />
							</section>
							<section class="flex-[8] flex justify-end text-right">
								<span class="text-lg h-fit self-center">UI Results</span>
								<button class="btn btn-ghost w-fit h-fit p-0 tooltip tooltip-secondary tooltip-left space-x-1" on:click={() => (viewUiAsTable = !viewUiAsTable)} data-tip={viewUiAsTable ? 'View data in a book' : 'View data in a table/list'}>
									<Icon type={viewUiAsTable ? 'mdi:book-open-blank-variant' : 'mdi:file-table-box'} color={Shared.Colors.PRIMARY} iconSize="48" />
								</button>
							</section>
						</header>
						<main class="flex-[9.5] flex overflow-hidden">
							{#if viewUiAsTable}
								{#await import('$lib/modeltemplate/viewing/List.svelte')}
									<div class="w-full h-full flex justify-center bg-gray-400">
										<div class="w-fit h-fit self-center flex flex-col">
											<div class="w-fit h-fit self-center">
												<span class="loading loading-ball loading-sm text-accent" />
												<span class="loading loading-ball loading-md text-secondary" />
												<span class="loading loading-ball loading-lg text-primary" />
											</div>
											<div class="text-lg text-white">Loading...</div>
										</div>
									</div>
								{:then List}
									<List.default CurrentTemplate={demoTemplateManager} NameDescription={currentTemplateName + OPT_SPLIT + currentDescription} {UpdateValue} {GetValue} {DeleteFieldValue} />
								{:catch}
									<div class="w-full h-full flex justify-center bg-gray-400">
										<div class="w-fit h-fit self-center flex flex-col">
											<div class="text-lg text-white">Network error...</div>
										</div>
									</div>
								{/await}
							{:else}
								{#await import('$lib/modeltemplate/viewing/Book.svelte')}
									<div class="w-full h-full flex justify-center bg-gray-400">
										<div class="w-fit h-fit self-center flex flex-col">
											<div class="w-fit h-fit self-center">
												<span class="loading loading-ball loading-sm text-accent" />
												<span class="loading loading-ball loading-md text-secondary" />
												<span class="loading loading-ball loading-lg text-primary" />
											</div>
											<div class="text-lg text-white">Loading...</div>
										</div>
									</div>
								{:then Book}
									<Book.default CurrentTemplate={demoTemplateManager} NameDescription={currentTemplateName + OPT_SPLIT + currentDescription} {UpdateValue} {GetValue} {DeleteFieldValue} />
								{:catch}
									<div class="w-full h-full flex justify-center bg-gray-400">
										<div class="w-fit h-fit self-center flex flex-col">
											<div class="text-lg text-white">Network error...</div>
										</div>
									</div>
								{/await}
							{/if}
						</main>
					{/if}
				</section>
			{/if}
			{#if windowWidth > 1065}
				<section class="flex-1 flex flex-col bg-white rounded-md shadow-md shadow-gray-800 p-2 overflow-hidden space-y-2">
					<header class="flex-[0.5] flex">
						<section class="flex-1 flex">
							<img src="{base}/logo.png" alt="data admin logo" class="max-w-[5vw] max-h-[5vh] self-center" />
						</section>
						<section class="flex-[8] flex justify-end text-right space-x-1">
							<span class="text-lg h-fit self-center">UI Results</span>
							<div class="join">
								<button class="flex-1 join-item btn btn-ghost w-fit h-fit p-0 tooltip tooltip-secondary tooltip-left" on:click={() => (viewUiAsTable = !viewUiAsTable)} data-tip={viewUiAsTable ? 'View data in a book' : 'View data in a table/list'}>
									<Icon type={viewUiAsTable ? 'mdi:book-open-blank-variant' : 'mdi:file-table-box'} color={Shared.Colors.PRIMARY} iconSize="48" />
								</button>
								{#if windowWidth > 1065}
									<button class="flex-1 join-item btn btn-ghost w-fit h-fit p-0 tooltip tooltip-secondary tooltip-left space-x-1" on:click={HandleExpandLeftSection} data-tip={ExpandLeftSection ? 'Minimize section' : 'Expand section'}>
										<Icon type={ExpandLeftSection ? 'mdi:arrow-collapse' : 'mdi:arrow-expand'} color={Shared.Colors.PRIMARY} iconSize="48" />
									</button>
								{/if}
							</div>
						</section>
					</header>
					<main class="flex-[9.5] flex overflow-hidden">
						{#if viewUiAsTable}
							{#await import('$lib/modeltemplate/viewing/List.svelte')}
								<div class="w-full h-full flex justify-center bg-gray-400">
									<div class="w-fit h-fit self-center flex flex-col">
										<div class="w-fit h-fit self-center">
											<span class="loading loading-ball loading-sm text-accent" />
											<span class="loading loading-ball loading-md text-secondary" />
											<span class="loading loading-ball loading-lg text-primary" />
										</div>
										<div class="text-lg text-white">Loading...</div>
									</div>
								</div>
							{:then List}
								<List.default CurrentTemplate={demoTemplateManager} NameDescription={currentTemplateName + OPT_SPLIT + currentDescription} {UpdateValue} {GetValue} {DeleteFieldValue} />
							{:catch}
								<div class="w-full h-full flex justify-center bg-gray-400">
									<div class="w-fit h-fit self-center flex flex-col">
										<div class="text-lg text-white">Network error...</div>
									</div>
								</div>
							{/await}
						{:else}
							{#await import('$lib/modeltemplate/viewing/Book.svelte')}
								<div class="w-full h-full flex justify-center bg-gray-400">
									<div class="w-fit h-fit self-center flex flex-col">
										<div class="w-fit h-fit self-center">
											<span class="loading loading-ball loading-sm text-accent" />
											<span class="loading loading-ball loading-md text-secondary" />
											<span class="loading loading-ball loading-lg text-primary" />
										</div>
										<div class="text-lg text-white">Loading...</div>
									</div>
								</div>
							{:then Book}
								<Book.default CurrentTemplate={demoTemplateManager} NameDescription={currentTemplateName + OPT_SPLIT + currentDescription} {UpdateValue} {GetValue} {DeleteFieldValue} />
							{:catch}
								<div class="w-full h-full flex justify-center bg-gray-400">
									<div class="w-fit h-fit self-center flex flex-col">
										<div class="text-lg text-white">Network error...</div>
									</div>
								</div>
							{/await}
						{/if}
					</main>
				</section>
			{/if}
		</div>
	{/await}
{:else}
	<div>Invalid request</div>
{/if}
