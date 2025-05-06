<script lang="ts">
	import { goto } from '$app/navigation'
	import { base } from '$app/paths'
	import { PUBLIC_API_URL } from '$env/static/public'
	import Icon from '$lib/components/Icon.svelte'
	import Table from '$lib/components/table/Table.svelte'
	import { FETCH_ERROR, LOGO_URL, OPTS_SPLIT, Shared } from '$lib/constants'
	import {
		Loading,
		ToastType,
		ToastMessage,
		AbstractionsSearchResults,
		AbstractionCurrentTemplate,
		SearchResultsClickedIndex,
		CurrentProject,
		LoadingMessage,
		AbstractionsSearchCreatedOnGreaterThan,
		AbstractionsSearchCreatedOnLessThan,
		AbstractionsSearchLastUpdatedOnGreaterThan,
		AbstractionsSearchLastUpdatedOnLessThan,
		AbststractionsSearchIsVerified,
		AbstractionsSearchCurrentAbstractor,
		AbstractionsSearchSortBy,
		AbstractionsSearchSortByOrder,
		AbstractionTimeoutActive,
		AbstractionTimeoutSeconds,
		AbstractionsSearchCreatedFilterOptions
	} from '$lib/stores'
	import { AppendColumnsToTemplate, IsProjectUserAuthorized, LocalDateFromString, LocalTimeFromString, Log } from '$lib/utils'
	import { onDestroy } from 'svelte'
	import { scale } from 'svelte/transition'

	const CURRENT_SECTION = 'Abstraction'

	let dialogBeingDisplayed = false
	const UpdateDialogBeingDisplayed = (value: boolean) => (dialogBeingDisplayed = value)

	let assignAbstractionsComponent: any = null
	let getAbstractionsComponent: any = null
	let MyAbstractions = false
	async function showGetAbstractionsDialog() {
		if (getAbstractionsComponent === null) {
			$Loading = true
			await import('$lib/abstraction/GetAbstractions.svelte')
				.then((c) => {
					getAbstractionsComponent = c.default
				})
				.catch(() => {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = 'Network error'
				})
				.finally(() => {
					$Loading = false
				})
		}
		if (getAbstractionsComponent !== null) {
			dialogBeingDisplayed = true
			//@ts-expect-error
			document.getElementById('get-abstractions-dialog').showModal()
		}
	}

	let FilterModelTemplate: string
	const HandleUpdateFilterModelTemplate = (value: string) => (FilterModelTemplate = value)
	function setupLocalTemplateInfo() {
		if (!$AbstractionCurrentTemplate) return
		let newModelTemplate = {
			abstraction_info: {
				struct: 'root.abstraction_info unique name=Abstraction Info&#',
				value: {
					abstraction_id: {
						struct: 'root.abstraction_info.value.abstraction_id text text name=Abstraction ID&#',
						value: ''
					},
					abstractor_name: {
						struct: 'root.abstraction_info.value.abstractor_name text text name=Abstractor Name&#',
						value: ''
					},
					file_id: {
						struct: 'root.abstraction_info.value.file_id text text name=File ID&#',
						value: ''
					},
					file_tags: {
						struct: 'root.abstraction_info.value.file_tags text text name=File Tags&#',
						value: ''
					},
					completed: {
						struct: 'root.abstraction_info.value.completed text select name=Completed&# opts=yes~!!~yes%!!%no~!!~no&#',
						value: ''
					},
					verified: {
						struct: 'root.abstraction_info.value.verified text select name=Verified&# opts=yes~!!~yes%!!%no~!!~no&#',
						value: ''
					}
				}
			},
			abstraction_reviews: {
				struct: 'root.abstraction_reviews repetitive name=Abstraction Reviews&# renderhorizontally=true&# max=3&#',
				value: [
					{
						name: {
							struct: 'root.abstraction_reviews.value[x].name text text name=Reviewer Name&#',
							value: ''
						},
						contacts: {
							struct: 'root.abstraction_reviews.value[x].contacts text text name=Reviewer Contacts&#',
							value: ''
						},
						review: {
							struct: 'root.abstraction_reviews.value[x].review text select name=Review&# opts=positive~!!~positive%!!%negative~!!~negative&#',
							value: ''
						},
						last_updated_on: {
							struct: 'root.abstraction_reviews.value[x].last_updated_on text text name=Review Last Updated On&#',
							value: ''
						}
					}
				]
			},
			...JSON.parse($AbstractionCurrentTemplate.ModelTemplate)
		}
		FilterModelTemplate = JSON.stringify(newModelTemplate)
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, JSON.parse(FilterModelTemplate), 'Generated abstraction sample from modeltemplate')
	}
	$: if ($AbstractionCurrentTemplate && $AbstractionsSearchResults.length > 0) {
		setupLocalTemplateInfo()
	}

	function genAbstractionData() {
		return $AbstractionsSearchResults.map((sar) => {
			let is_completed = false
			let abstraction_reviews: { name: string; contacts: string; review: string; last_updated_on: string }[] = []
			if (sar.AbstractionReviews !== null) {
				for (let rv of sar.AbstractionReviews) {
					if (rv.ReviewerDirectoryID === sar.AbstractorDirectoryID && rv.Review === true) {
						is_completed = true
					}
					abstraction_reviews.push({
						name: rv.ReviewerDirectoryName as string,
						contacts: rv.ReviewerDirectoryContacts.map((c) => `${c.split(OPTS_SPLIT)[0]}-${c.split(OPTS_SPLIT)[1]}`).join(',') as string,
						review: rv.Review ? 'positive' : 'negative',
						last_updated_on: `${LocalDateFromString(rv.ReviewLastUpdatedOn as string)} at ${LocalTimeFromString(rv.ReviewLastUpdatedOn as string)}`
					})
				}
			}
			let searchedAbstraction: any = {
				abstraction_info: {
					abstraction_id: sar.ID,
					abstractor_name: sar.AbstractorDirectoryName,
					file_id: sar.FileID,
					file_tags: sar.FileTags,
					completed: is_completed ? 'yes' : 'no',
					verified: sar.IsVerified ? 'yes' : 'no'
				}
			}
			if (abstraction_reviews.length > 0) {
				searchedAbstraction = { ...searchedAbstraction, abstraction_reviews }
			}
			searchedAbstraction = { ...searchedAbstraction, ...JSON.parse(sar.Abstraction) }
			return searchedAbstraction
		})
	}

	function HandleClickTableRow(index: number) {
		$SearchResultsClickedIndex = index
		goto(`${base}/${$CurrentProject?.ProjectID}/abstraction/${$AbstractionsSearchResults[index].ID}`)
	}

	function HandleUpdateCreatedFilterOptions(value: any) {
		$AbstractionsSearchCreatedFilterOptions = value
		if (Object.keys($AbstractionsSearchCreatedFilterOptions).length < 1) {
			setupLocalTemplateInfo()
		}
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, $AbstractionsSearchCreatedFilterOptions, 'Updated Filter options')
	}

	let selectedFileType = 'csv'
	let singleSheetMode = true
	let currentDownloadUrl: string | null = null
	let currentDownloadFileType: string | null = null
	function HandleGenerateFileFromData() {
		//@ts-expect-error
		document.getElementById('gen-file-from-abstractions-dialog').showModal()
	}
	async function GenerateFileFromData() {
		let url = new URL(`${PUBLIC_API_URL}/abstraction/filefromdata/${$CurrentProject?.ProjectID}`)
		url.searchParams.append('mtid', $AbstractionCurrentTemplate?.ID as string)
		url.searchParams.append('ft', selectedFileType)
		if (selectedFileType === 'excel' && singleSheetMode) {
			url.searchParams.append('ss', 'true')
		}
		if ($AbstractionsSearchCurrentAbstractor !== null) {
			url.searchParams.append('did', $AbstractionsSearchCurrentAbstractor.ID as string)
		}
		if ($AbstractionsSearchCreatedOnGreaterThan !== '') {
			url.searchParams.append('cogt', $AbstractionsSearchCreatedOnGreaterThan)
		}
		if ($AbstractionsSearchCreatedOnLessThan !== '') {
			url.searchParams.append('colt', $AbstractionsSearchCreatedOnLessThan)
		}
		if ($AbstractionsSearchLastUpdatedOnGreaterThan !== '') {
			url.searchParams.append('lugt', $AbstractionsSearchLastUpdatedOnGreaterThan)
		}
		if ($AbstractionsSearchLastUpdatedOnLessThan !== '') {
			url.searchParams.append('lult', $AbstractionsSearchLastUpdatedOnLessThan)
		}
		if ($AbststractionsSearchIsVerified === 'true' || $AbststractionsSearchIsVerified === 'false') {
			url.searchParams.append('iv', $AbststractionsSearchIsVerified)
		}
		url.searchParams.append('sb', $AbstractionsSearchSortBy)
		url.searchParams.append('sbo', $AbstractionsSearchSortByOrder)
		$Loading = true
		$LoadingMessage = 'Generating file from abstractions...'
		let data: Blob | null = null
		let fileType: string | null = null
		try {
			const fetchResponse = await fetch(url, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify({ ModelTemplate: JSON.stringify(AppendColumnsToTemplate({ struct: 'root', value: JSON.parse(FilterModelTemplate) })) })
			})
			if (fetchResponse.ok) {
				data = await fetchResponse.blob()
				fileType = fetchResponse.headers.get('Content-Type')
			} else {
				const message = await fetchResponse.json()
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = message.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Generate workbook failed')
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null

		if (data === null || fileType === null) {
			return
		}

		if (currentDownloadUrl) {
			URL.revokeObjectURL(currentDownloadUrl)
		}

		$ToastType = Shared.ToastType.SUCCESS
		$ToastMessage = [`${selectedFileType} file generated`, 'Click green download button to get the file']
		currentDownloadUrl = URL.createObjectURL(data)
		currentDownloadFileType = fileType
		//@ts-expect-error
		document.getElementById('gen-file-from-abstractions-dialog').close()
	}
	onDestroy(() => {
		if (currentDownloadUrl) {
			URL.revokeObjectURL(currentDownloadUrl)
		}
	})

	let showEditorSettings = false
	function handleSelectAutosaveTimeout(value: string) {
		$AbstractionTimeoutSeconds = parseInt(value)
		localStorage.setItem('asats', `${$AbstractionTimeoutSeconds}`)
		localStorage.getItem('asa')
	}
	function handleAutoSaveActivation(value: boolean) {
		$AbstractionTimeoutActive = value
		if (value) {
			localStorage.setItem('asa', 'true')
		} else {
			localStorage.setItem('asa', 'false')
		}
	}
</script>

<div class="flex flex-col self-center w-full h-full max-w-[98%] max-h-[98%] bg-white rounded-md shadow-sm shadow-gray-800 p-2 overflow-hidden space-y-2">
	<header class="flex-[0.5] flex flex-col">
		<div class="w-full flex space-x-2">
			<img src={LOGO_URL} alt="data admin logo" class="max-w-[5vw] max-h-[5vh] self-center" />
			<div class="w-fit h-fit">
				<Icon type="mdi:help-circle" iconSize="23" color={Shared.Colors.PRIMARY} />
			</div>
			<section class="flex-[9] flex justify-center">
				<span class="join z-[200]">
					<div class=" tooltip tooltip-bottom" data-tip="View and review abstractions">
						<button
							class="join-item btn btn-regular btn-secondary"
							on:click={() => {
								MyAbstractions = false
								showGetAbstractionsDialog()
							}}
						>
							<Icon type="mdi:search" />
						</button>
					</div>
					{#if IsProjectUserAuthorized([Shared.ProjectRoles.EDITOR])}
						<div class=" tooltip tooltip-bottom" data-tip="Abstract data">
							<button
								class="join-item btn btn-regular btn-secondary"
								on:click={() => {
									MyAbstractions = true
									showGetAbstractionsDialog()
								}}
							>
								<Icon type="mdi:notebook-edit" />
							</button>
						</div>
					{/if}
					{#if currentDownloadUrl}
						<div class=" tooltip tooltip-bottom" data-tip="Download currently generated {selectedFileType} file" in:scale>
							<a class="join-item btn btn-regular btn-primary" href={currentDownloadUrl} target="_blank" type={currentDownloadFileType}>
								<Icon type="mdi:file-download" />
							</a>
						</div>
					{/if}
				</span>
			</section>
			<section class="flex-[0.5] join justify-end z-20">
				{#if IsProjectUserAuthorized([Shared.ProjectRoles.EDITOR])}
					<div class="tooltip tooltip-left" data-tip="Abstraction's editor settings">
						<button class="join-item btn btn-secondary" on:click={() => (showEditorSettings = !showEditorSettings)}>
							<Icon type="mdi:cog" />
						</button>
					</div>
				{/if}
				{#if IsProjectUserAuthorized([Shared.ProjectRoles.ABSTRACTIONS_ADMIN])}
					<div class="tooltip tooltip-left" data-tip="Assign abstractors to particular files e.g. pdfs">
						<button
							class="join-item btn btn-secondary"
							on:click={async () => {
								if (assignAbstractionsComponent === null) {
									$Loading = true
									await import('$lib/abstraction/AssignAbstractions.svelte')
										.then((x) => {
											assignAbstractionsComponent = x.default
										})
										.catch(() => {
											$ToastType = Shared.ToastType.ERROR
											$ToastMessage = 'Network error'
										})
										.finally(() => {
											$Loading = false
										})
								}
								if (assignAbstractionsComponent !== null) {
									dialogBeingDisplayed = true
									//@ts-expect-error
									document.getElementById('assign-abstractions-dialog').showModal()
								}
							}}
						>
							<Icon type="mdi:clipboard-account" />
						</button>
					</div>
				{/if}
			</section>
		</div>
		<div class="relative">
			{#if showEditorSettings}
				<div class="absolute top-0 right-0 bg-white shadow-md shadow-gray-800 rounded-md p-2 w-full max-w-[500px] z-[100]">
					<section class="form-control">
						<label class="label">
							<span class="label-text text-lg font-bold">Autosave active?</span>
							<input type="checkbox" class="checkbox checkbox-primary" checked={$AbstractionTimeoutActive} on:change={(e) => handleAutoSaveActivation(e.currentTarget.checked)} />
						</label>
					</section>
					<section class="form-control">
						<span class="join join-vertical">
							<span class="join-item join-label-primary join-label-content">Autosave after?</span>
							<select class="join-item select select-primary" on:change={(e) => handleSelectAutosaveTimeout(e.currentTarget.value)}>
								<option selected={$AbstractionTimeoutSeconds.toString() === '180000'} value="180000">3 minutes</option>
								<option selected={$AbstractionTimeoutSeconds.toString() === '300000'} value="300000">5 minutes</option>
								<option selected={$AbstractionTimeoutSeconds.toString() === '420000'} value="420000">7 minutes</option>
								<option selected={$AbstractionTimeoutSeconds.toString() === '600000'} value="420000">10 minutes</option>
							</select>
						</span>
					</section>
				</div>
			{/if}
		</div>
	</header>
	<main class="flex-[9] overflow-hidden flex flex-col space-y-1">
		{#if $AbstractionsSearchResults.length < 1 || $AbstractionCurrentTemplate === null || dialogBeingDisplayed}
			<div class="flex justify-center bg-gray-300 w-full h-full">
				<span class="self-center text-primary text-3xl">Create, update, view, and review abstractions...</span>
			</div>
		{:else}
			<div class="divider" />
			<Table Data={genAbstractionData()} {HandleClickTableRow} {FilterModelTemplate} CreatedFilterOptions={$AbstractionsSearchCreatedFilterOptions} {HandleUpdateFilterModelTemplate} {HandleUpdateCreatedFilterOptions} {HandleGenerateFileFromData} DataName="Abstractions" />
			<div class="divider" />
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

<!-- assign files to abstract dialog -->
<svelte:component this={assignAbstractionsComponent} {UpdateDialogBeingDisplayed} />

<!-- get abstractions dialog -->
<svelte:component this={getAbstractionsComponent} {MyAbstractions} {UpdateDialogBeingDisplayed} />

<!--Gen file from abstractions dialog-->
<dialog id="gen-file-from-abstractions-dialog" class="modal">
	<form method="dialog" class="modal-box p-0 rounded min-w-[150px] max-h-[95vh] flex flex-col justify-center">
		<header class="sticky flex justify-between bg-accent items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
			<span class="text-lg text-primary">Generate file from abstractions</span>
			<button class="btn btn-circle btn-ghost flex justify-center">
				<Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} />
			</button>
		</header>
		<main class="flex flex-col space-y-2 p-2">
			<div class="flex join join-vertical">
				<span class="join-item join-label-primary join-label-content"><span>File Type</span></span>
				<select class="join-item select select-primary flex-1" bind:value={selectedFileType}>
					<option selected={selectedFileType === ''} value="" disabled>Choose file type...</option>
					<option selected={selectedFileType === 'excel'} value="excel">excel</option>
					<option selected={selectedFileType === 'csv'} value="csv">csv</option>
				</select>
			</div>
			{#if selectedFileType == 'excel'}
				<section class="form-control">
					<label class="label">
						<span class="label-text text-lg font-bold">Single sheet?</span>
						<input type="checkbox" class="checkbox checkbox-primary" bind:checked={singleSheetMode} disabled />
					</label>
				</section>
			{/if}
		</main>
		<footer class="flex justify-center p-2">
			<button
				class="btn btn-secondary w-[75%]"
				on:click={(e) => {
					e.preventDefault()
					GenerateFileFromData()
				}}>Generate file</button
			>
		</footer>
	</form>
</dialog>
