<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public'
	import Icon from '$lib/components/Icon.svelte'
	import { FETCH_ERROR, Shared } from '$lib/constants'
	import type { IFile, IFile_temp, IModelTemplate_temp, ISearchDirectory } from '$lib/interface'
	import { Loading, LoadingMessage, ModelTemplatesSearchResults, ToastType, ToastMessage, CurrentProject, AbstractionEditorsSearchResults, FilesSearchResults } from '$lib/stores'
	import { LocalDateFromString, LocalTimeFromString, Log } from '$lib/utils'

	const CURRENT_SECTION = 'Assign abstractions'

	export let UpdateDialogBeingDisplayed: (value: boolean) => void

	let stepCounter = 1

	let abstractionTemplate: IModelTemplate_temp | null = null
	let searchTemplatesQuery: string = ''
	async function handleSearchModelTemplates() {
		$Loading = true
		$LoadingMessage = 'Searching model templates...'
		try {
			let url = new URL(`${PUBLIC_API_URL}/modeltemplate`)
			url.searchParams.append('l', '20')
			if (searchTemplatesQuery.length > 1) {
				url.searchParams.append('sq', searchTemplatesQuery)
			}
			url.searchParams.append('sb', 'last_updated_on')
			url.searchParams.append('sbo', 'desc')
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

	let abstractionUser: ISearchDirectory | null = null
	async function handleGetAbstractors() {
		$Loading = true
		$LoadingMessage = 'Getting abstractors...'
		try {
			let url = new URL(`${PUBLIC_API_URL}/directory`)
			url.searchParams.append('pid', $CurrentProject?.ProjectID as string)
			url.searchParams.append('prole', Shared.ProjectRoles.EDITOR)
			url.searchParams.append('l', '20')
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$AbstractionEditorsSearchResults = data !== null ? data : []
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `${data !== null ? data.length : 0} abstractors found`
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
	if ($AbstractionEditorsSearchResults.length < 1) {
		handleGetAbstractors()
	}

	let searchFilesQuery = ''
	let filesWithAbstractions = 'false'
	async function handleSearchFiles() {
		$Loading = true
		$LoadingMessage = 'Searching files...'
		try {
			let url = new URL(`${PUBLIC_API_URL}/storage/file`)
			if (searchFilesQuery.length > 1) {
				url.searchParams.append('sq', searchFilesQuery)
			}
			url.searchParams.append('pid', $CurrentProject?.ProjectID as string)
			url.searchParams.append('l', '100')
			url.searchParams.append('sb', 'created_on')
			url.searchParams.append('sbo', 'desc')
			if (filesWithAbstractions.length > 1) {
				url.searchParams.append('fwa', filesWithAbstractions)
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

	let switchPickFilesManually = false
	let pickedFiles: IFile[] = []
	let pickedFilesId: string[] = []
	function handlePickFile(index: number, fileId: string) {
		if (pickedFilesId.includes(fileId)) {
			pickedFiles = pickedFiles.filter((pf) => pf.ID !== fileId)
			pickedFilesId = pickedFilesId.filter((pf) => pf !== fileId)
		} else {
			pickedFiles = [...pickedFiles, $FilesSearchResults[index]]
			pickedFilesId = [...pickedFilesId, fileId]
		}
	}

	let abstractionCommonTag: string = ''
	function handleInputAbstractionCommonTag(value: string) {
		abstractionCommonTag = value
	}

	let fileSearchTag: string = ''

	interface AbstractionCreation {
		DirectoryID: string
		ProjectID: string
		ModelTemplateID: string
		Files?: IFile_temp[]
		FilesSearchQuery?: string
		Tags: string
		SkipFilesWithAbstractions?: boolean
	}

	let skipFilesWithAbstractions = true

	async function createAbstractions() {
		if (abstractionUser === null || abstractionTemplate === null || (fileSearchTag.length < 1 && pickedFiles.length < 1)) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = ['Request is not valid.', 'Ensure an abstractor and template is chosen', 'Ensure file search tag is entered or files are picked manually']
			return
		}
		try {
			let abstractionCreation: AbstractionCreation = {
				DirectoryID: abstractionUser.ID as string,
				ProjectID: $CurrentProject?.ProjectID as string,
				ModelTemplateID: abstractionTemplate.ID as string,
				Tags: abstractionCommonTag
			}
			if (switchPickFilesManually) {
				if (pickedFiles.length < 1) {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = 'Please pick a file manually...'
					return
				} else {
					abstractionCreation.Files = pickedFiles
				}
			} else {
				if (fileSearchTag.length < 1) {
					$ToastType = Shared.ToastType.ERROR
					$ToastMessage = 'Enter a common file tag...'
					return
				} else {
					abstractionCreation.FilesSearchQuery = fileSearchTag
				}
				abstractionCreation.SkipFilesWithAbstractions = skipFilesWithAbstractions
			}

			$Loading = true
			$LoadingMessage = 'Creating abstractions...'
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/abstraction`, {
				credentials: 'include',
				method: 'POST',
				body: JSON.stringify(abstractionCreation)
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `${data.AbstractionsCreated} abstractions created`
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Fetch error')
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$LoadingMessage = null
		$Loading = false
	}

	function handleReset() {
		abstractionUser = null
		abstractionTemplate = null
		pickedFiles = []
		pickedFilesId = []
		fileSearchTag = ''
		abstractionCommonTag = ''
		filesWithAbstractions = ''
	}
</script>

<dialog id="assign-abstractions-dialog" class="modal">
	<form method="dialog" class="modal-box p-0 rounded min-w-[150px] w-full max-w-[800px]">
		<header class="sticky flex justify-between bg-accent items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
			<span class="flex-[0.5] text-lg text-primary">Assign abstractions</span>
			<section class="flex-[9] w-full flex justify-center h-fit">
				<ul class="steps h-fit">
					<li class="step" class:step-secondary={stepCounter >= 1}>
						<button
							class="btn btn-ghost h-fit p-1"
							on:click={(e) => {
								e.preventDefault()
								stepCounter = 1
							}}>Pick abstractor</button
						>
					</li>
					<li class="step" class:step-secondary={stepCounter >= 2}>
						<button
							class="btn btn-ghost h-fit p-1"
							on:click={(e) => {
								e.preventDefault()
								stepCounter = 2
							}}>Choose template</button
						>
					</li>
					<li class="step" class:step-secondary={stepCounter >= 3}>
						<button
							class="btn btn-ghost h-fit p-1"
							on:click={(e) => {
								e.preventDefault()
								stepCounter = 3
							}}>Create Abstractions</button
						>
					</li>
				</ul>
			</section>
			<button class="flex-[0.5] btn btn-circle btn-ghost flex justify-center" on:click={() => UpdateDialogBeingDisplayed(false)}>
				<Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} />
			</button>
		</header>
		<main class="overflow-hidden p-2 space-y-1 w-full flex flex-col">
			{#if stepCounter === 1}
				<section class="flex flex-col overflow-auto rounded-md max-h-[30vh] space-y-1">
					<div class="flex justify-between">
						<span class="flex-[9]">Select the abstractor you would like to create abstractions for: </span>
						<button
							class="btn btn-ghost p-1 h-fit tooltip tooltip-primary tooltip-left"
							on:click={(e) => {
								e.preventDefault()
								handleGetAbstractors()
							}}
							data-tip="Refresh list of abstractors"
						>
							<Icon type="mdi:refresh" color={Shared.Colors.PRIMARY} />
						</button>
					</div>
					{#if $AbstractionEditorsSearchResults.length > 0}
						<table class="table w-full shadow-inner shadow-gray-800 rounded-md sticky top-0">
							<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary">
								<tr>
									<th>Index</th>
									<th>Name</th>
								</tr>
							</thead>
							<tbody>
								{#each $AbstractionEditorsSearchResults as sqr, index}
									<tr>
										<td
											class="cursor-pointer"
											on:click={(e) => {
												e.preventDefault()
												abstractionUser = sqr
												abstractionCommonTag = sqr.Name ? sqr.Name : ''
											}}
										>
											{#if abstractionUser?.ID === sqr.ID}
												<Icon type="mdi:check" color={Shared.Colors.PRIMARY} />
											{:else}
												{index + 1}
											{/if}
										</td>

										<td class="font-bold">{sqr.Name}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{/if}
				</section>
			{:else if stepCounter === 2}
				<section class="flex-[9] flex justify-center">
					<div class="form-control w-[90%]">
						<span class="join">
							<button
								class="join-item flex-[0.5] btn btn-regular btn-secondary"
								on:click={(e) => {
									e.preventDefault()
									handleSearchModelTemplates()
								}}
							>
								<span class="w-fit h-fit self-center bg-transparent"><Icon type="mdi:search" /></span>
							</button>
							<input class="join-item flex-[9.5] input input-secondary w-full shadow-sm shadow-gray-600" type="search" placeholder="Search model templates..." bind:value={searchTemplatesQuery} />
						</span>
					</div>
				</section>

				{#if $ModelTemplatesSearchResults.length > 0}
					<section class="flex flex-col overflow-auto rounded-md max-h-[50vh]">
						<table class="table w-full shadow-inner shadow-gray-800 rounded-md">
							<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0">
								<tr>
									<th />
									<th>Name</th>
									<th>Description</th>
									<th>Created On</th>
								</tr>
							</thead>
							<tbody>
								{#each $ModelTemplatesSearchResults as sqr, index}
									<tr>
										<td>
											<button
												class="btn btn-ghost h-fit w-fit"
												on:click={(e) => {
													e.preventDefault()
													abstractionTemplate = sqr
												}}
											>
												{#if abstractionTemplate?.ID === sqr.ID}
													<Icon type="mdi:check" color={Shared.Colors.PRIMARY} />
												{:else}
													{index + 1}
												{/if}
											</button>
										</td>
										<td>{sqr.TemplateName}</td>
										<td class="w-full break-words">{sqr.Description}</td>
										<td>{LocalDateFromString(sqr.CreatedOn)} at {LocalTimeFromString(sqr.CreatedOn)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</section>
				{/if}
			{:else if stepCounter === 3}
				<section class="form-control">
					<span class="join join-vertical">
						<span class="join-item join-label-primary flex">
							<span class="flex-[9.5]">Abstraction Common Tag</span>
						</span>
						<input class="join-item input input-primary w-full" type="text" placeholder="Enter abstraction common tag..." value={abstractionCommonTag} on:input={(e) => handleInputAbstractionCommonTag(e.currentTarget.value)} />
						<span class="join-item join-label-primary text-xs"> Alternative way to distinguish each abstraction in the system. Tag will be combined with file description of existing files. </span>
					</span>
				</section>
				<div class="divider" />
				<section class="join self-center">
					<button
						class="flex-1 join-item btn btn-regular h-fit"
						class:btn-primary={switchPickFilesManually === false}
						class:btn-secondary={switchPickFilesManually === true}
						on:click={(e) => {
							e.preventDefault()
							switchPickFilesManually = false
						}}
					>
						<div class="flex justify-between">
							<span>Use common file tag</span>
							{#if !switchPickFilesManually}
								<Icon type="mdi:check" />
							{/if}
						</div>
					</button>
					<button
						class="flex-1 join-item btn btn-regular h-fit"
						class:btn-primary={switchPickFilesManually === true}
						class:btn-secondary={switchPickFilesManually === false}
						on:click={(e) => {
							e.preventDefault()
							switchPickFilesManually = true
						}}
					>
						<div class="flex justify-between">
							<span>Manually pick files</span>
							{#if switchPickFilesManually}
								<Icon type="mdi:check" />
							{/if}
						</div>
					</button>
				</section>
				{#if !switchPickFilesManually}
					<section class="form-control">
						<span class="join join-vertical">
							<span class="join-item join-label-primary flex">
								<span class="flex-[9.5]">File Tag</span>
							</span>
							<input class="join-item input input-primary w-full" type="text" placeholder="Enter common file tag..." bind:value={fileSearchTag} />
							<span class="join-item join-label-primary text-xs"> Use files with the common file tag to create abstractions from. For example, 3ii will use files uploaded with the name between 300 and 399 and automatically create abstractions from them. </span>
						</span>
					</section>
					<div class="flex justify-between">
						<div class="flex justify-between flex-[9]">
							<span class="label-text text-primary text-lg">Skip files that already have abstractions</span>
						</div>
						<input type="checkbox" class="checkbox checkbox-primary" bind:checked={skipFilesWithAbstractions} />
					</div>
				{:else}
					<section class="flex-[9] flex justify-center">
						<div class="form-control w-[90%]">
							<span class="join">
								<button
									class="join-item flex-[0.5] btn btn-regular btn-secondary"
									on:click={(e) => {
										e.preventDefault()
										handleSearchFiles()
									}}
								>
									<span class="w-fit h-fit self-center bg-transparent"><Icon type="mdi:search" /></span>
								</button>
								<input class="join-item flex-[9.5] input input-secondary w-full shadow-sm shadow-gray-600" type="search" placeholder="Search files..." bind:value={searchFilesQuery} />
							</span>
						</div>
					</section>
					<div class="join join-vertical">
						<span class="join-item join-label-primary join-label-content">Filter by files with/without abstractions</span>
						<select class="join-item select select-primary flex-1" bind:value={filesWithAbstractions}>
							<option selected={filesWithAbstractions === 'both'} value="">both</option>
							<option selected={filesWithAbstractions === 'true'} value="true">With abstractions</option>
							<option selected={filesWithAbstractions === 'false'} value="false">Without abstractions</option>
						</select>
					</div>
					{#if $FilesSearchResults.length > 0}
						<section class="flex flex-col overflow-auto rounded-md max-h-[25vh]">
							<table class="table w-full shadow-inner shadow-gray-800 rounded-md">
								<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0">
									<tr>
										<th />
										<th>Tags</th>
										<th>Content Type</th>
										<th>Uploaded by</th>
										<th>Created On</th>
									</tr>
								</thead>
								<tbody>
									{#each $FilesSearchResults as sqr, index}
										<tr>
											<td>
												<button
													class="btn btn-ghost h-fit w-fit"
													on:click={(e) => {
														e.preventDefault()
														handlePickFile(index, sqr.ID)
													}}
												>
													<Icon type={pickedFilesId.includes(sqr.ID) ? 'mdi:check' : 'mdi:close-thick'} color={pickedFilesId.includes(sqr.ID) ? Shared.Colors.SUCCESS : Shared.Colors.ERROR} />
												</button>
											</td>
											<td>{sqr.Tags}</td>
											<td><button class="text-left w-full">{sqr.ContentType}</button></td>
											<td>{sqr.Directory.Name}</td>
											<td>{LocalDateFromString(sqr.CreatedOn)} at {LocalTimeFromString(sqr.CreatedOn)}</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</section>
					{/if}
				{/if}
				<div class="divider" />
				<section class="join self-center">
					<button
						class="join-item flex-1 h-fit btn btn-secondary self-center"
						on:click={(e) => {
							e.preventDefault()
							handleReset()
						}}
					>
						Reset
					</button>
					<button
						class="join-item flex-1 h-fit btn btn-secondary self-center"
						on:click={(e) => {
							e.preventDefault()
							createAbstractions()
						}}
					>
						Create abstraction(s)
					</button>
				</section>
			{/if}
		</main>
	</form>
</dialog>
