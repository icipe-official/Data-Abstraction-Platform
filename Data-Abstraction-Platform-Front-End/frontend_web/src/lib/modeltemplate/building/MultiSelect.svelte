<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public'
	import Icon from '$lib/components/Icon.svelte'
	import { DISALLOWED_CHARACTERS_REGEX_SEARCH, FETCH_ERROR, OPTS_REGEX_SEARCH, OPTS_SPLIT, OPT_SPLIT, Shared } from '$lib/constants'
	import { Loading, ToastType, ToastMessage, LoadingMessage, CataloguesSearchResults } from '$lib/stores'
	import { Log } from '$lib/utils'

	const CURRENT_SECTION = 'Multiselect'

	export let FieldStruct: string
	export let UpdateTemplateFieldGroupStruct: (key: string, value: string) => void

	let showSelectOptions: boolean = false
	const setShowSelectOptions = (value: boolean) => (showSelectOptions = value)
	let showSearchOptions: boolean = false
	const setShowSearchOptions = (value: boolean) => (showSearchOptions = value)

	let createdOptions: [string, string][] = []
	const setCreatedOptions = (value: [string, string][]) => (createdOptions = value)
	let createdOptionsError: (string | null)[] = []
	const setCreatedOptionsError = (value: (string | null)[]) => (createdOptionsError = value)
	function handleUpdateCreatedOption(index: number, key: string | undefined, value: string | undefined) {
		if (typeof key !== 'undefined') {
			createdOptions[index][0] = key.replaceAll(DISALLOWED_CHARACTERS_REGEX_SEARCH, '')
		}
		if (typeof value !== 'undefined') {
			createdOptions[index][1] = value.replaceAll(DISALLOWED_CHARACTERS_REGEX_SEARCH, '')
		}
	}

	$: if (FieldStruct.length > 1) {
		setCreatedOptions([])
		setCreatedOptionsError([])
		setShowSearchOptions(false)
		setShowSelectOptions(true)
		if (OPTS_REGEX_SEARCH.test(FieldStruct)) {
			const optsExtract = OPTS_REGEX_SEARCH.exec(FieldStruct)
			if (optsExtract) {
				const extractedOptions = optsExtract[1].split(OPTS_SPLIT)
				setCreatedOptionsError(extractedOptions.map((_) => null))
				setCreatedOptions(extractedOptions.map((opts) => [opts.split(OPT_SPLIT)[0], opts.split(OPT_SPLIT)[1]]))
			}
		}
	}

	let searchCatalogueQuery: string = ''
	async function handleSearchSelectOptions() {
		$Loading = true
		$LoadingMessage = 'Searching catalogues...'
		try {
			let url = new URL(`${PUBLIC_API_URL}/catalogue`)
			if (searchCatalogueQuery.length > 1) {
				url.searchParams.append('sq', searchCatalogueQuery)
			}
			url.searchParams.append('l', '50')
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			url.searchParams.append('sb', 'last_updated_on')
			url.searchParams.append('sbo', 'desc')
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$CataloguesSearchResults = data !== null ? data : []
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `${data !== null ? data.length : 0} results found`
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Fetch error')
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}
	function handlePopulateSelectOptions(index: number) {
		const catalogue = $CataloguesSearchResults[index].Catalogue
		createdOptions = []
		createdOptionsError = []
		for (let c of catalogue) {
			createdOptions = [...createdOptions, [c.split(OPT_SPLIT)[0], c.split(OPT_SPLIT)[1]]]
			createdOptionsError = [...createdOptionsError, null]
		}
		searchCatalogueQuery = ''
		$ToastType = Shared.ToastType.SUCCESS
		$ToastMessage = `${catalogue.length} options added`
	}
	function handleUpdateFieldSelectOptions() {
		let newOptions = ''
		let isOptionsValid = true
		if (createdOptions.length < 1) return
		for (let i = 0; i < createdOptions.length; i++) {
			if (createdOptions[i][0].length < 1 || createdOptions[i][1].length < 1) {
				createdOptionsError[i] = 'Key/value is invalid'
				isOptionsValid = false
			} else {
				createdOptionsError[i] = null
				newOptions = `${newOptions}${OPTS_SPLIT}${createdOptions[i][0]}${OPT_SPLIT}${createdOptions[i][1]}`
			}
		}
		if (!isOptionsValid) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'One or more options is not valid'
			return
		}
		newOptions = newOptions.replace(OPTS_SPLIT, '')
		newOptions = `opts=${newOptions}&#`
		if (OPTS_REGEX_SEARCH.test(FieldStruct)) {
			FieldStruct = FieldStruct.replace(OPTS_REGEX_SEARCH, newOptions)
		} else {
			FieldStruct = `${FieldStruct} ${newOptions}`
		}
		UpdateTemplateFieldGroupStruct(`${FieldStruct.split(' ')[0]}.struct`, FieldStruct)
		$ToastType = Shared.ToastType.INFO
		$ToastMessage = 'Select options updated'
	}

	let currentFiles: FileList | null = null
	let currentFilesElement: HTMLInputElement | null = null
	let showFileInput: boolean = false
	let appendToCurrentList: boolean = false
	function handleUploadFileCatalogue() {
		if (!currentFiles || !currentFilesElement || currentFiles[0].type !== 'text/csv') {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'File may be empty or not valid format'
			return
		}
		const reader = new FileReader()
		reader.onload = (e) => {
			const listData = e.target?.result
			if (typeof listData === 'string') {
				let listItems = listData.split('\n')
				const isListKeyValue = listItems[0].split(',').length > 1 ? true : false
				let startIndex = createdOptions.length
				if (!appendToCurrentList) {
					createdOptions = []
					createdOptionsError = []
					startIndex = 0
				}
				for (let i = 0; i < listItems.length; i++) {
					createdOptions = [...createdOptions, ['', '']]
					createdOptionsError = [...createdOptionsError, null]
				}
				listItems.forEach((li) => {
					if (isListKeyValue) {
						handleUpdateCreatedOption(startIndex, li.split(',')[0].replace(/\r|\n/, ''), li.split(',')[1].replace(/\r|\n/, ''))
					} else handleUpdateCreatedOption(startIndex, li.replace(/\r|\n/, ''), li.replace(/\r|\n/, ''))
					startIndex++
				})
				$ToastType = Shared.ToastType.INFO
				$ToastMessage = 'List updated'
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = 'List is empty'
			}
		}
		reader.readAsText(currentFiles[0])
		currentFiles = null
		currentFilesElement.value = ''
	}
</script>

<section class="flex flex-col overflow-hidden space-y-1 shadow-md shadow-gray-900 rounded-md bg-accent bg-opacity-50 p-1">
	<header class="flex space-x-1">
		<h1 class="flex-[8] text-lg text-primary">Select options</h1>
		<div class="flex-1 join h-fit self-center">
			<button
				class="join-item btn btn-regular btn-neutral w-fit h-fit p-0 pl-1 pr-1 tooltip tooltip-left tooltip-primary"
				on:click={(e) => {
					e.preventDefault()
					showFileInput = true
					showSearchOptions = false
					showSelectOptions = false
				}}
				data-tip="Populate list from csv file"
			>
				<Icon type="mdi:file-import" />
			</button>
			<button
				class="join-item btn btn-regular btn-neutral w-fit h-fit p-0 pl-1 pr-1 tooltip tooltip-left tooltip-primary"
				on:click={(e) => {
					e.preventDefault()
					showFileInput = false
					showSearchOptions = true
					showSelectOptions = false
				}}
				data-tip="Use existing catalogue"
			>
				<Icon type="mdi:magnify" />
			</button>
			<button
				class="join-item btn btn-regular btn-neutral w-fit h-fit p-0 pl-1 pr-1 tooltip tooltip-left tooltip-primary"
				on:click={(e) => {
					e.preventDefault()
					showFileInput = false
					showSearchOptions = false
					showSelectOptions = true
				}}
				data-tip="Manage options"
			>
				<Icon type="mdi:list-box" />
			</button>
		</div>
		<button
			class="flex-1 btn btn-regular btn-ghost w-fit h-fit p-0"
			on:click={(e) => {
				e.preventDefault()
				handleUpdateFieldSelectOptions()
			}}
			class:btn-disabled={createdOptions.length < 1}
		>
			<Icon type="mdi:content-save" color={Shared.Colors.SECONDARY} />
		</button>
	</header>
	<div class="divider" />
	{#if showSelectOptions}
		<main class="space-y-1">
			{#each createdOptions as co, index}
				<div class="form-control">
					<div class="join">
						<input class="join-item input input-primary flex-1" placeholder="key.." type="text" value={co[0]} on:input={(e) => handleUpdateCreatedOption(index, e.currentTarget.value, undefined)} />
						<input class="join-item input input-primary flex-1" placeholder="value.." type={FieldStruct.split(' ')[1]} value={co[1]} on:input={(e) => handleUpdateCreatedOption(index, undefined, e.currentTarget.value)} />
						<button
							class="join-item btn btn-regular btn-primary"
							on:click={(e) => {
								e.preventDefault()
								createdOptions = createdOptions.filter((_, i) => i !== index)
							}}
						>
							<Icon type="mdi:delete" />
						</button>
					</div>
					{#if createdOptionsError[index] !== null}
						<div class="label">
							<span class="label-text text-error">{createdOptionsError[index]}</span>
						</div>
						<div class="divider" />
					{/if}
				</div>
			{/each}
		</main>
		<footer class="join">
			<button
				class="join-item flex-1 btn btn-regular btn-secondary"
				on:click={(e) => {
					e.preventDefault()
					createdOptions = []
					createdOptionsError = []
				}}
			>
				<Icon type="mdi:delete-empty" />options
			</button>
			<button
				class="join-item flex-1 btn btn-regular btn-primary"
				on:click={(e) => {
					e.preventDefault()
					createdOptions = [...createdOptions, ['', '']]
					createdOptionsError = [...createdOptionsError, null]
				}}
			>
				<Icon type="mdi:plus" />option
			</button>
		</footer>
	{/if}
	{#if showSearchOptions}
		<div class="form-control">
			<span class="join">
				<button
					class="join-item flex-[0.5] btn btn-regular btn-secondary"
					on:click={(e) => {
						e.preventDefault()
						handleSearchSelectOptions()
					}}
				>
					<span class="w-fit h-fit self-center bg-transparent"><Icon type="mdi:search" /></span>
				</button>
				<input class="join-item flex-[9.5] input input-secondary w-full" type="search" placeholder="Search catalogue..." bind:value={searchCatalogueQuery} />
			</span>
		</div>
		{#if $CataloguesSearchResults.length > 0}
			<div class="overflow-auto max-h-[30vh]">
				<table class="table w-full z-[1] shadow-inner shadow-gray-800 rounded-md">
					<thead class="sticky top-0 z-10 shadow-sm shadow-gray-600 bg-secondary text-primary">
						<tr>
							<th />
							<th>Name</th>
							<th>Description</th>
							<th>Created By</th>
						</tr>
					</thead>
					<tbody class="overflow-auto max-h-[30vh]">
						{#each $CataloguesSearchResults as sqr, index}
							<tr class="hover">
								<td>
									<button
										class="btn btn-regular btn-ghost w-fit h-fit p-0"
										on:click={(e) => {
											e.preventDefault()
											handlePopulateSelectOptions(index)
										}}
									>
										<Icon type="mdi:check" color={Shared.Colors.SUCCESS} />
									</button>
								</td>
								<td>{sqr.Name}</td>
								<td>{sqr.Description}</td>
								<td>{sqr.Directory.Name}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<div class="text-center text-sm text-primary">No results to show..</div>
		{/if}
	{/if}
	{#if showFileInput}
		<main class="overflow-hidden p-2 space-y-2">
			<input class="file-input file-input-primary w-full" type="file" bind:files={currentFiles} bind:this={currentFilesElement} accept="text/csv" />
			<label class="label cursor-pointer">
				<span class="label-text">Append to current list</span>
				<input type="checkbox" class="checkbox checkbox-primary" bind:checked={appendToCurrentList} />
			</label>
			<button
				class="btn btn-regular btn-secondary w-full justify-center"
				on:click={(e) => {
					e.preventDefault()
					handleUploadFileCatalogue()
				}}
				class:btn-disabled={!currentFiles}
			>
				Upload file to list
			</button>
		</main>
	{/if}
</section>
