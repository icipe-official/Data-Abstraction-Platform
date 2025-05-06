<script lang="ts">
	import { PUBLIC_API_URL } from '$env/static/public'
	import DateTime from '$lib/components/DateTime.svelte'
	import Icon from '$lib/components/Icon.svelte'
	import { FETCH_ERROR, Shared } from '$lib/constants'
	import {
		Loading,
		LoadingMessage,
		ModelTemplatesSearchResults,
		ToastType,
		ToastMessage,
		AbstractionCurrentTemplate,
		AbstractionEditorsSearchResults,
		CurrentProject,
		CurrentUser,
		AbstractionsSearchResults,
		AbstractionsSearchCurrentAbstractor,
		AbstractionsSearchCreatedOnGreaterThan,
		AbstractionsSearchCreatedOnLessThan,
		AbstractionsSearchLastUpdatedOnGreaterThan,
		AbstractionsSearchLastUpdatedOnLessThan,
		AbststractionsSearchIsVerified,
		AbstractionsSearchLimit,
		AbstractionsSearchOffset,
		AbstractionsSearchSortBy,
		AbstractionsSearchSortByOrder,
	} from '$lib/stores'
	import { Log, LocalDateFromString, LocalTimeFromString, ResetAbstractionsStore } from '$lib/utils'

	const CURRENT_SECTION = 'Get Abstractions'

	export let MyAbstractions: boolean = false
	export let UpdateDialogBeingDisplayed: (value: boolean) => void

	let showChooseTemplate = true
	let showChooseEditor = false
	let showChooseTimelines = false
	let showChooseAbstractionVerificationStatus = false
	let showLimitOffset = false
	let showSortBy = false
	function handleInputSearchResultsLimit(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$AbstractionsSearchLimit = parseInt(value)
		if ($AbstractionsSearchLimit < $AbstractionsSearchOffset) {
			if ($AbstractionsSearchLimit - 1000 < 0) {
				$AbstractionsSearchOffset = 0
			} else {
				$AbstractionsSearchOffset = $AbstractionsSearchLimit - 1000
			}
		}
	}
	function handleInputSearchResultsOffset(value: string) {
		if (isNaN(parseInt(value))) {
			return
		}
		$AbstractionsSearchOffset= parseInt(value)
		if ($AbstractionsSearchOffset > $AbstractionsSearchLimit) {
			$AbstractionsSearchLimit = $AbstractionsSearchOffset + 1000
		}
	}

	let searchModelTemplateQuery: string = ''
	async function handleSearchModelTemplates() {
		$Loading = true
		$LoadingMessage = 'Searching model templates...'
		try {
			let url = new URL(`${PUBLIC_API_URL}/modeltemplate`)
			if (searchModelTemplateQuery.length > 1) {
				url.searchParams.append('sq', searchModelTemplateQuery)
			}
			url.searchParams.append('l', '20')
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

	$: if (MyAbstractions) {
		$AbstractionsSearchCurrentAbstractor = { ID: $CurrentUser?.DirectoryID }
	}
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

	function handleReset() {
		searchModelTemplateQuery = ''
		ResetAbstractionsStore()
	}

	async function searchAbstractions() {
		if ($AbstractionCurrentTemplate === null) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = 'Pick a template to search data with...'
			return
		}
		try {
			let url = new URL(`${PUBLIC_API_URL}/abstraction/${$CurrentProject?.ProjectID}`)
			url.searchParams.append('mtid', $AbstractionCurrentTemplate.ID)
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
			if ($AbstractionsSearchLimit >= 5) {
				url.searchParams.append('l', `${$AbstractionsSearchLimit}`)
			} else {
				url.searchParams.append('l', '1000')
			}
			if ($AbstractionsSearchOffset >= 0) {
				url.searchParams.append('o', `${$AbstractionsSearchOffset}`)
			} else {
				url.searchParams.append('o', '0')
			}
			url.searchParams.append('sb', $AbstractionsSearchSortBy)
			url.searchParams.append('sbo', $AbstractionsSearchSortByOrder)
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$AbstractionsSearchResults = data !== null ? data : []
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `${data !== null ? data.length : 0} abstractions found`
				UpdateDialogBeingDisplayed(false)
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
</script>

<dialog id="get-abstractions-dialog" class="modal">
	<form method="dialog" class="modal-box p-0 rounded min-w-[150px] w-full max-w-[800px] flex flex-col justify-center">
		<header class="sticky flex justify-between bg-accent items-center p-2 shadow-gray-800 shadow-sm top-0 left-0 right-0">
			<span class="text-lg text-primary">View, review, and manage abstractions</span>
			<button class="btn btn-circle btn-ghost flex justify-center" on:click={() => UpdateDialogBeingDisplayed(false)}>
				<Icon type="mdi:close-circle" color={Shared.Colors.PRIMARY} />
			</button>
		</header>
		<main class="overflow-auto max-h-[70vh] p-1 space-y-1">
			<section class="shadow-gray-800 shadow-sm rounded-md space-y-1 p-1 flex flex-col">
				<header class="flex justify-between">
					<span class="text-lg font-bold text-primary h-fit self-center">Choose template (required)</span>
					<button
						class="btn btn-circle btn-ghost w-fit h-fit p-0"
						on:click={(e) => {
							e.preventDefault()
							showChooseTemplate = !showChooseTemplate
						}}
					>
						<Icon type={showChooseTemplate ? 'mdi:eye' : 'mdi:eye-off'} color={Shared.Colors.SECONDARY} />
					</button>
				</header>
				{#if showChooseTemplate}
					<span class="join w-[75%] self-center">
						<button
							class="join-item flex-[0.5] btn btn-regular btn-secondary"
							on:click={(e) => {
								e.preventDefault()
								handleSearchModelTemplates()
							}}
						>
							<span class="w-fit h-fit self-center bg-transparent"><Icon type="mdi:search" /></span>
						</button>
						<input class="join-item flex-[9.5] input input-secondary w-full shadow-sm shadow-gray-600" type="search" placeholder="Search templates..." bind:value={searchModelTemplateQuery} />
					</span>
					{#if $ModelTemplatesSearchResults.length > 0}
						<section class="flex flex-col rounded-md">
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
														$AbstractionCurrentTemplate = sqr
													}}
												>
													{#if $AbstractionCurrentTemplate?.ID === sqr.ID}
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
				{/if}
			</section>
			{#if !MyAbstractions}
				<section class="shadow-gray-800 shadow-sm rounded-md space-y-1 p-1 flex flex-col">
					<header class="flex justify-between">
						<span class="text-lg font-bold text-primary h-fit self-center flex-[9]">Choose abstractor</span>
						<div class="join">
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
							<button
								class="join-item btn btn-circle btn-ghost w-fit h-fit p-0"
								on:click={(e) => {
									e.preventDefault()
									showChooseEditor = !showChooseEditor
									if ($AbstractionEditorsSearchResults.length < 1) {
										handleGetAbstractors()
									}
								}}
							>
								<Icon type={showChooseEditor ? 'mdi:eye' : 'mdi:eye-off'} color={Shared.Colors.SECONDARY} />
							</button>
						</div>
					</header>
					{#if showChooseEditor}
						{#if $AbstractionEditorsSearchResults.length > 0}
							<section class="flex flex-col rounded-md">
								<table class="table w-full shadow-inner shadow-gray-800 rounded-md">
									<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0">
										<tr>
											<th>#</th>
											<th>Name</th>
										</tr>
									</thead>
									<tbody>
										{#each $AbstractionEditorsSearchResults as sqr, index}
											<tr>
												<td>
													<button
														class="btn btn-ghost h-fit w-fit"
														on:click={(e) => {
															e.preventDefault()
															$AbstractionsSearchCurrentAbstractor = sqr
														}}
													>
														{#if $AbstractionsSearchCurrentAbstractor?.ID === sqr.ID}
															<Icon type="mdi:check" color={Shared.Colors.PRIMARY} />
														{:else}
															{index + 1}
														{/if}
													</button>
												</td>
												<td class="font-bold">{sqr.Name}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</section>
						{/if}
					{/if}
				</section>
			{/if}
			<section class="shadow-gray-800 shadow-sm rounded-md space-y-1 p-1 flex flex-col">
				<header class="flex justify-between">
					<span class="text-lg font-bold text-primary h-fit self-center">Choose timelines</span>
					<button
						class="btn btn-circle btn-ghost w-fit h-fit p-0"
						on:click={(e) => {
							e.preventDefault()
							showChooseTimelines = !showChooseTimelines
						}}
					>
						<Icon type={showChooseTimelines ? 'mdi:eye' : 'mdi:eye-off'} color={Shared.Colors.SECONDARY} />
					</button>
				</header>
				{#if showChooseTimelines}
					<section class="flex flex-col space-y-1">
						<div class="text-md">Date range for when abstractions were created...</div>
						<div class="join w-full">
							<DateTime bind:Value={$AbstractionsSearchCreatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							<DateTime bind:Value={$AbstractionsSearchCreatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
						</div>
						<div class="divider" />
						<div class="text-md">Date range for when abstractions were last updated...</div>
						<div class="join w-full">
							<DateTime bind:Value={$AbstractionsSearchLastUpdatedOnGreaterThan} Placeholder="From..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
							<DateTime bind:Value={$AbstractionsSearchLastUpdatedOnLessThan} Placeholder="To..." classInputType="input-secondary flex-1 join-item" DateTimeFormat="yyyy-mm-dd" />
						</div>
					</section>
				{/if}
			</section>
			<section class="shadow-gray-800 shadow-sm rounded-md space-y-1 p-1 flex flex-col">
				<header class="flex justify-between">
					<span class="text-lg font-bold text-primary h-fit self-center">Choose abstraction verification status</span>
					<button
						class="btn btn-circle btn-ghost w-fit h-fit p-0"
						on:click={(e) => {
							e.preventDefault()
							showChooseAbstractionVerificationStatus = !showChooseAbstractionVerificationStatus
						}}
					>
						<Icon type={showChooseAbstractionVerificationStatus ? 'mdi:eye' : 'mdi:eye-off'} color={Shared.Colors.SECONDARY} />
					</button>
				</header>
				{#if showChooseAbstractionVerificationStatus}
					<section class="form-control">
						<div class="join join-vertical max-h-[50vh]">
							<span class="join-item join-label-primary join-label-content">Abstraction's verification status</span>
							<select class="join-item select select-primary flex-1" bind:value={$AbststractionsSearchIsVerified}>
								<option selected={$AbststractionsSearchIsVerified === ''} value="" disabled>Verfication status...</option>
								<option selected={$AbststractionsSearchIsVerified === 'null'} value="null">both</option>
								<option selected={$AbststractionsSearchIsVerified === 'true'} value="true">Verified</option>
								<option selected={$AbststractionsSearchIsVerified === 'false'} value="false">Not verified</option>
							</select>
						</div>
					</section>
				{/if}
			</section>
			<section class="shadow-gray-800 shadow-sm rounded-md space-y-1 p-1 flex flex-col">
				<header class="flex justify-between">
					<span class="text-lg font-bold text-primary h-fit self-center">Set max no. of results to show and no. of results to skip</span>
					<button
						class="btn btn-circle btn-ghost w-fit h-fit p-0"
						on:click={(e) => {
							e.preventDefault()
							showLimitOffset = !showLimitOffset
						}}
					>
						<Icon type={showLimitOffset ? 'mdi:eye' : 'mdi:eye-off'} color={Shared.Colors.SECONDARY} />
					</button>
				</header>
				{#if showLimitOffset}
					<section class="flex flex-col space-y-1">
						<span class="join join-vertical">
							<span class="join-item join-label-primary join-label-content">Maximum no. of results</span>
							<input class="join-item input input-primary w-full" type="number" placeholder="Enter maximum no. of results to show..." value={$AbstractionsSearchLimit} on:input={(e) => handleInputSearchResultsLimit(e.currentTarget.value)} />
						</span>
						<span class="join join-vertical">
							<span class="join-item join-label-primary join-label-content">No. of results to skip</span>
							<input class="join-item input input-primary w-full" type="number" placeholder="Enter no. of results to skip..." value={$AbstractionsSearchOffset} on:input={(e) => handleInputSearchResultsOffset(e.currentTarget.value)} />
						</span>
					</section>
				{/if}
			</section>
			<section class="shadow-gray-800 shadow-sm rounded-md space-y-1 p-1 flex flex-col">
				<header class="flex justify-between">
					<span class="text-lg font-bold text-primary h-fit self-center">Sort by</span>
					<button
						class="btn btn-circle btn-ghost w-fit h-fit p-0"
						on:click={(e) => {
							e.preventDefault()
							showSortBy = !showSortBy
						}}
					>
						<Icon type={showSortBy ? 'mdi:eye' : 'mdi:eye-off'} color={Shared.Colors.SECONDARY} />
					</button>
				</header>
				{#if showSortBy}
				<section class="flex flex-col space-y-1">
					<span class="join join-vertical">
						<span class="join-item join-label-primary join-label-content">Sort by</span>
						<div class="join-item join join-horizontal w-full">
							<select class="join-item select select-primary flex-1" bind:value={$AbstractionsSearchSortBy}>
								<option selected={$AbstractionsSearchSortBy === ''} value="" disabled>Sorty By...</option>
								<option selected={$AbstractionsSearchSortBy === 'created_on'} value="created_on">Created on</option>
								<option selected={$AbstractionsSearchSortBy === 'last_updated_on'} value="last_updated_on">Last updated on</option>
							</select>
							<select class="join-item select select-primary flex-1" bind:value={$AbstractionsSearchSortByOrder}>
								<option selected={$AbstractionsSearchSortByOrder === ''} value="" disabled>Sorty By Order...</option>
								<option selected={$AbstractionsSearchSortByOrder === 'asc'} value="asc">Least recent first</option>
								<option selected={$AbstractionsSearchSortByOrder === 'desc'} value="desc">Most recent first</option>
							</select>
						</div>
					</span>
				</section>
				{/if}
			</section>
		</main>
		<footer class="join w-full p-1 justify-center">
			<button
				class="join-item btn btn-secondary btn-regular h-fit"
				on:click={(e) => {
					e.preventDefault()
					handleReset()
				}}>reset search</button
			>
			<button class="join-item btn btn-secondary btn-regular h-fit" on:click={searchAbstractions}>get abstractions</button>
		</footer>
	</form>
</dialog>
