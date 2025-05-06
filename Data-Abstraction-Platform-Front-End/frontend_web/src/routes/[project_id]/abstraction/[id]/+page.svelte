<script lang="ts">
	import { AbstractionCurrentTemplate, AbstractionTimeoutActive, AbstractionTimeoutSeconds, CurrentProject, CurrentUser, Loading, LoadingMessage, AbstractionsSearchResults, SearchResultsClickedIndex, ToastMessage, ToastType } from '$lib/stores'
	import { onDestroy } from 'svelte'
	import type { PageData } from './$types'
	import { browser } from '$app/environment'
	import { PUBLIC_API_URL } from '$env/static/public'
	import TemplateManager from '$lib/modeltemplate/templatemanager'
	import { AreValuesEqual, DeleteValueInObject, GetValueInObject, LocalDateFromString, LocalTimeFromString, Log, SetValueInObject } from '$lib/utils'
	import type { IAbstraction_temp, IFormKeyValue, ISearchAbstraction } from '$lib/interface'
	import { FETCH_ERROR, OPT_SPLIT, Shared } from '$lib/constants'
	import { base } from '$app/paths'
	import { goto } from '$app/navigation'
	import Icon from '$lib/components/Icon.svelte'

	const CURRENT_SECTION = 'View abstraction page'

	export let data: PageData
	let AbstractionReference: ISearchAbstraction

	enum AbstractionTabs {
		ABSTRACTION = 'ABSTRACTION',
		FILE = 'File',
		ABSTRACTION_REVIEW = 'ABSTRACTION_REVIEW'
	}
	let currentTab: AbstractionTabs = AbstractionTabs.ABSTRACTION_REVIEW
	const setCurrentTab = (value: AbstractionTabs) => (currentTab = value)
	const getCurrentTab = () => currentTab

	onDestroy(() => ($SearchResultsClickedIndex = null))

	let windowWidth = window.innerWidth
	let ExpandLeftSection = false
	const setExpandSection = (value: boolean) => (ExpandLeftSection = value)
	const HandleExpandLeftSection = () => (ExpandLeftSection = !ExpandLeftSection)
	$: {
		if (windowWidth > 1065) {
			if (getCurrentTab() === AbstractionTabs.ABSTRACTION) {
				setCurrentTab(AbstractionTabs.ABSTRACTION_REVIEW)
			}
		} else {
			setExpandSection(false)
		}
	}

	let CurrentModelTemplate: any
	let OriginalModelTemplate: string
	let TemplateName: string
	let TemplateDescription: string
	let CurrentAbstraction: string
	let CurrentAbstractionTag: string
	let LastUpdatedOn: string
	function addRepetitiveGroupsToTemplate(value: any, repetitiveIndexes: number[]) {
		for (let key of Object.keys(value)) {
			if (value[key]['struct'].split(' ')[1] === 'repetitive') {
				let repetitiveGroupKey = value[key]['struct'].split(' ')[0].replace('root.', '')
				const defaultRepetitiveGroupStructValue = JSON.stringify(GetValueInObject(JSON.parse(OriginalModelTemplate), `${repetitiveGroupKey.replaceAll('[x]', '[0]')}.value[0]`))
				repetitiveIndexes.forEach((ri) => {
					repetitiveGroupKey = repetitiveGroupKey.replace('[x]', `[${ri}]`)
				})
				const abstractionValue = GetValueInObject(CurrentAbstraction, repetitiveGroupKey.replaceAll('.value', ''))
				if (Array.isArray(abstractionValue)) {
					for (let i = 0; i < abstractionValue.length; i++) {
						CurrentModelTemplate = SetValueInObject(CurrentModelTemplate, `${repetitiveGroupKey}.value[${i}]`, JSON.parse(defaultRepetitiveGroupStructValue))
						addRepetitiveGroupsToTemplate(GetValueInObject(CurrentModelTemplate, `${repetitiveGroupKey}.value[${i}]`), [...repetitiveIndexes, i])
					}
				}
			} else if (value[key]['struct'].split(' ')[1] === 'unique') {
				addRepetitiveGroupsToTemplate(value[key]['value'], repetitiveIndexes)
			}
		}
	}
	let DefaultTemplateManager: TemplateManager
	function UpdateAbstractionValue(value: IFormKeyValue, repetitiveIndexes: number[]) {
		value.key = value.key.replace('root.', '')
		repetitiveIndexes.forEach((ri) => {
			value.key = value.key.replace('[x]', `[${ri}]`)
		})
		CurrentAbstraction = SetValueInObject(CurrentAbstraction, value.key.replaceAll('.value', ''), value.value)
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, CurrentAbstraction, 'Update Abstraction')
	}
	function GetAbstractionValue(key: string, repetitiveIndexes: number[]) {
		key = key.replace('root.', '')
		repetitiveIndexes.forEach((ri) => {
			key = key.replace('[x]', `[${ri}]`)
		})
		return GetValueInObject(CurrentAbstraction, key.replaceAll('.value', ''))
	}
	function DeleteFieldValue(key: string, repetitiveIndexes: number[]) {
		key = key.replace('root.', '')
		repetitiveIndexes.forEach((ri) => {
			key = key.replace('[x]', `[${ri}]`)
		})
		CurrentAbstraction = DeleteValueInObject(CurrentAbstraction, key.replaceAll('.value', ''))
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, CurrentAbstraction, 'After delete Template value field')
	}
	let CurrentAbstractionTagError: string | null = null
	const DEFAULT_CURRENT_ABSTRACTION_TAG_ERROR = 'Give this abstraction a tag...'
	function HandleInputAbstractionTag(value: string) {
		CurrentAbstractionTag = value
		if (CurrentAbstractionTag.length < 3) CurrentAbstractionTagError = DEFAULT_CURRENT_ABSTRACTION_TAG_ERROR
	}
	async function HandleUpdateAbstraction() {
		if (AreValuesEqual(JSON.parse(data.Abstraction as string), CurrentAbstraction) && data.Tags === CurrentAbstractionTag) {
			$ToastType = Shared.ToastType.INFO
			$ToastMessage = 'No changes detected'
			return
		}
		$Loading = true
		$LoadingMessage = 'Updating abstraction...'
		let Columns: string[] = []
		let Abstraction: IAbstraction_temp = {}
		if (data.Tags !== CurrentAbstractionTag) {
			Columns = ['tags']
			Abstraction.Tags = CurrentAbstractionTag
		}
		if (!AreValuesEqual(JSON.parse(data.Abstraction as string), CurrentAbstraction)) {
			Columns = [...Columns, 'abstraction']
			Abstraction.Abstraction = JSON.stringify(CurrentAbstraction)
		}
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/abstraction/${$CurrentProject?.ProjectID}/${data.ID}`, {
				method: 'PUT',
				credentials: 'include',
				body: JSON.stringify({ Abstraction, Columns })
			})
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `Abstraction with id ${fetchData.ID} updated`
				LastUpdatedOn = fetchData.LastUpdatedOn
				if (Columns.includes('tags')) {
					data.Tags = CurrentAbstractionTag
				}
				if (Columns.includes('abstraction')) {
					data.Abstraction = JSON.stringify(CurrentAbstraction)
					addRepetitiveGroupsToTemplate(CurrentModelTemplate, [])
					DefaultTemplateManager = new TemplateManager(CurrentModelTemplate)
				}
				data.LastUpdatedOn = LastUpdatedOn
				if ($SearchResultsClickedIndex !== null) {
					$AbstractionsSearchResults[$SearchResultsClickedIndex].Tags = CurrentAbstractionTag
					$AbstractionsSearchResults[$SearchResultsClickedIndex].Abstraction = JSON.stringify(CurrentAbstraction)
					$AbstractionsSearchResults[$SearchResultsClickedIndex].LastUpdatedOn = LastUpdatedOn
				}
				AbstractionReference = JSON.parse(JSON.stringify(data)) as ISearchAbstraction
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = fetchData.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Update abstraction')
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}
	async function HandleDeleteAbstraction() {
		$Loading = true
		$LoadingMessage = 'Deleting abstraction...'
		try {
			const deleteUrl = new URL(`${PUBLIC_API_URL}/abstraction/${data.ID}`)
			if ($CurrentUser?.DirectoryID !== data.AbstractorDirectoryID) {
				deleteUrl.searchParams.append("pid", $CurrentProject?.ProjectID as string)
			}
			const fetchResponse = await fetch(deleteUrl, {
				method: 'DELETE',
				credentials: 'include'
			})
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				if (fetchData.AbstractionsAffected === 1) {
					$ToastType = Shared.ToastType.SUCCESS
					$ToastMessage = `${fetchData.AbstractionsAffected} abstraction deleted`
					if ($AbstractionsSearchResults.length > 0) {
						$AbstractionsSearchResults = $AbstractionsSearchResults.filter((value) => value.ID !== data.ID)
					}
					goto(`${base}/${$CurrentProject?.ProjectID}/abstraction`)
				} else {
					$ToastType = Shared.ToastType.WARNING
					$ToastMessage = `${fetchData.AbstractionsAffected} abstractions deleted`
				}
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = fetchData.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, 'Delete abstraction')
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}
	function CheckCompletedStatus() {
		if (data.AbstractionReviews) {
			for (let ar of data.AbstractionReviews) {
				if (ar.ReviewerDirectoryID === data.AbstractorDirectoryID) {
					return ar.Review as boolean
				}
			}
		}
		return false
	}

	let AbstractionReviewComment = ''
	function HandleUpdateAbstractionReviewComment(value: string) {
		AbstractionReviewComment = value
	}
	async function HandlePostReview(Review: boolean) {
		$Loading = true
		$LoadingMessage = 'Posting abstraction review...'
		try {
			let AbstractionReview: { AbstractionID: string; Review: boolean; Comment?: { Comment: string } } = {
				AbstractionID: data.ID as string,
				Review
			}
			if (AbstractionReviewComment.length > 0) {
				AbstractionReview.Comment = {
					Comment: AbstractionReviewComment
				}
			}
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/abstraction/review/${$CurrentProject?.ProjectID}`, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify(AbstractionReview)
			})
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `Review posted for abstraction ${fetchData.ID}`
				let abstractionReviewUpdated = false
				if (data.AbstractionReviews) {
					for (let i = 0; i < data.AbstractionReviews.length; i++) {
						if (data.AbstractionReviews[i].ReviewerDirectoryID === $CurrentUser?.DirectoryID) {
							data.AbstractionReviews[i].Review = Review
							abstractionReviewUpdated = true
							break
						}
					}
				}
				if (!abstractionReviewUpdated && data.AbstractionReviews) {
					data.AbstractionReviews = [
						...data.AbstractionReviews,
						{
							ReviewerDirectoryID: $CurrentUser?.DirectoryID as string,
							ReviewerDirectoryName: $CurrentUser?.Name as string,
							ReviewerDirectoryContacts: $CurrentUser?.Contacts as string[],
							Review,
							ReviewCreatedOn: new Date().toUTCString(),
							ReviewLastUpdatedOn: new Date().toUTCString()
						}
					]
				}
				if (data.AbstractionReviewsComments && AbstractionReviewComment.length > 0) {
					data.AbstractionReviewsComments = [
						...data.AbstractionReviewsComments,
						{
							ID: $CurrentUser?.DirectoryID as string,
							CommenterDirectoryID: $CurrentUser?.DirectoryID as string,
							CommenterDirectoryName: $CurrentUser?.Name as string,
							CommenterDirectoryContacts: $CurrentUser?.Contacts as string[],
							Comment: AbstractionReviewComment,
							CommentCreatedOn: new Date().toUTCString()
						}
					]
				}
				data.IsVerified = data.AbstractionReviews && data.AbstractionReviews.length > 0 ? ((data.AbstractionReviews.map((ar) => (ar.Review ? 1 : 0)) as number[]).reduce((total, current) => total + current) >= ($AbstractionCurrentTemplate?.VerificationQuorum as number) ? true : false) : false
				if ($SearchResultsClickedIndex !== null) {
					let abstractionReviewUpdated = false
					if ($AbstractionsSearchResults[$SearchResultsClickedIndex].AbstractionReviews !== null) {
						//@ts-expect-error
						for (let i = 0; i < $AbstractionsSearchResults[$SearchResultsClickedIndex].AbstractionReviews.length; i++) {
							//@ts-expect-error
							if ($AbstractionsSearchResults[$SearchResultsClickedIndex].AbstractionReviews[i].ReviewerDirectoryID === $CurrentUser?.DirectoryID) {
								//@ts-expect-error
								$AbstractionsSearchResults[$SearchResultsClickedIndex].AbstractionReviews[i].Review = Review
								abstractionReviewUpdated = true
								break
							}
						}
					}
					if (!abstractionReviewUpdated && $AbstractionsSearchResults[$SearchResultsClickedIndex].AbstractionReviews !== null) {
						$AbstractionsSearchResults[$SearchResultsClickedIndex].AbstractionReviews = [
							//@ts-expect-error
							...$AbstractionsSearchResults[$SearchResultsClickedIndex].AbstractionReviews,
							{
								ReviewerDirectoryID: $CurrentUser?.DirectoryID as string,
								Review,
								ReviewerDirectoryName: $CurrentUser?.Name as string,
								ReviewerDirectoryContacts: $CurrentUser?.Contacts as string[],
								ReviewCreatedOn: new Date().toUTCString(),
								ReviewLastUpdatedOn: new Date().toUTCString()
							}
						]
					}
					if ($AbstractionsSearchResults[$SearchResultsClickedIndex].AbstractionReviewsComments !== null) {
						$AbstractionsSearchResults[$SearchResultsClickedIndex].AbstractionReviewsComments = [
							//@ts-expect-error
							...$AbstractionsSearchResults[$SearchResultsClickedIndex].AbstractionReviewsComments,
							{
								ID: $CurrentUser?.DirectoryID as string,
								CommenterDirectoryID: $CurrentUser?.DirectoryID as string,
								CommenterDirectoryName: $CurrentUser?.Name as string,
								CommenterDirectoryContacts: $CurrentUser?.Contacts as string[],
								Comment: AbstractionReviewComment,
								CommentCreatedOn: new Date().toUTCString()
							}
						]
					}
				}
				AbstractionReviewComment = ''
				AbstractionReference = JSON.parse(JSON.stringify(data)) as ISearchAbstraction
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = fetchData.message
			}
		} catch (e) {
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e, FETCH_ERROR)
		}
		$Loading = false
		$LoadingMessage = null
	}

	async function initializeAbstraction() {
		$Loading = true
		$LoadingMessage = 'Setting up abstraction...'
		AbstractionReference = JSON.parse(JSON.stringify(data)) as ISearchAbstraction
		CurrentModelTemplate = JSON.parse($AbstractionCurrentTemplate?.ModelTemplate as any)
		OriginalModelTemplate = $AbstractionCurrentTemplate?.ModelTemplate as string
		TemplateName = $AbstractionCurrentTemplate?.TemplateName as string
		TemplateDescription = $AbstractionCurrentTemplate?.Description as string
		CurrentAbstraction = JSON.parse(data.Abstraction as string)
		CurrentAbstractionTag = data.Tags as string
		LastUpdatedOn = data.LastUpdatedOn as string
		addRepetitiveGroupsToTemplate(CurrentModelTemplate, [])
		DefaultTemplateManager = new TemplateManager(CurrentModelTemplate)
		$Loading = false
		$LoadingMessage = null
	}

	let autoSaveTimeout: number
	const setAutoTimeout = (value: number) => (autoSaveTimeout = value)
	const getAutoSaveTimeout = () => autoSaveTimeout
	let autoSaveTimeoutActive = false
	const setAutoSaveTimeoutActive = (value: boolean) => (autoSaveTimeoutActive = value)
	const getAutoSaveTimeoutActive = () => autoSaveTimeoutActive
	$: if ($AbstractionTimeoutActive && data.AbstractorDirectoryID === $CurrentUser?.DirectoryID) {
		if (data.Tags !== CurrentAbstractionTag || !AreValuesEqual(JSON.parse(data.Abstraction as string), CurrentAbstraction)) {
			if (getAutoSaveTimeoutActive() === false) {
				setAutoSaveTimeoutActive(true)
				setAutoTimeout(
					window.setTimeout(async function () {
						await HandleUpdateAbstraction()
						window.clearTimeout(getAutoSaveTimeout())
						setAutoSaveTimeoutActive(false)
					}, $AbstractionTimeoutSeconds)
				)
			}
		} else {
			window.clearTimeout(getAutoSaveTimeout())
			setAutoSaveTimeoutActive(false)
		}
	}

	onDestroy(() => {
		if (browser) {
			window.clearTimeout(autoSaveTimeout)
		}
	})
</script>

<svelte:window bind:innerWidth={windowWidth} />

{#if browser && $CurrentProject}
	{#await initializeAbstraction() then _}
		<div class="flex self-center w-full h-full max-w-[98%] max-h-[98%] overflow-hidden space-x-2 p-1">
			{#if windowWidth > 1065}
				<section class="flex-1 w-full h-full overflow-hidden rounded-md bg-white shadow-md shadow-gray-800 p-1">
					{#await import('$lib/abstraction/Abstraction.svelte')}
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
					{:then Abstraction}
						<Abstraction.default
							{DefaultTemplateManager}
							NameDescription={`${TemplateName}${OPT_SPLIT}${TemplateDescription}`}
							{UpdateAbstractionValue}
							{GetAbstractionValue}
							{DeleteFieldValue}
							{CurrentAbstractionTag}
							{HandleInputAbstractionTag}
							{CurrentAbstractionTagError}
							Abstraction={AbstractionReference}
							{CurrentAbstraction}
							{HandleUpdateAbstraction}
							{HandleDeleteAbstraction}
							{CheckCompletedStatus}
							{ExpandLeftSection}
							{HandleExpandLeftSection}
						/>
					{:catch}
						<div class="w-full h-full flex justify-center bg-gray-400">
							<div class="w-fit h-fit self-center flex flex-col">
								<div class="text-lg text-white">Network error...</div>
							</div>
						</div>
					{/await}
				</section>
			{/if}
			{#if (windowWidth > 1065 && !ExpandLeftSection) || windowWidth <= 1065}
				<section class="flex-1 flex flex-col w-full h-full overflow-hidden rounded-md bg-white shadow-md shadow-gray-800 p-1 space-y-2">
					<header class="flex-[0.5] w-full h-fit">
						<div class="tabs tabs-boxed w-full overflow-y-hidden overflow-x-auto">
							{#if windowWidth <= 1065}
								<button
									class="flex-1 tab text-md font-bold"
									class:tab-active={currentTab === AbstractionTabs.ABSTRACTION}
									class:text-secondary={currentTab === AbstractionTabs.ABSTRACTION}
									on:click={(e) => {
										e.preventDefault()
										currentTab = AbstractionTabs.ABSTRACTION
									}}
								>
									Abstraction
								</button>
							{/if}
							<button
								class="flex-1 tab text-md font-bold"
								class:tab-active={currentTab === AbstractionTabs.FILE}
								class:text-secondary={currentTab === AbstractionTabs.FILE}
								on:click={(e) => {
									e.preventDefault()
									currentTab = AbstractionTabs.FILE
								}}
							>
								File
							</button>
							<button
								class="flex-1 tab text-md font-bold"
								class:tab-active={currentTab === AbstractionTabs.ABSTRACTION_REVIEW}
								class:text-secondary={currentTab === AbstractionTabs.ABSTRACTION_REVIEW}
								on:click={(e) => {
									e.preventDefault()
									currentTab = AbstractionTabs.ABSTRACTION_REVIEW
								}}
							>
								Review
							</button>
						</div>
					</header>
					<main class="flex-[9.5] overflow-hidden w-full h-full">
						{#if currentTab === AbstractionTabs.ABSTRACTION}
							{#await import('$lib/abstraction/Abstraction.svelte')}
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
							{:then Abstraction}
								<Abstraction.default
									{DefaultTemplateManager}
									NameDescription={`${TemplateName}${OPT_SPLIT}${TemplateDescription}`}
									{UpdateAbstractionValue}
									{GetAbstractionValue}
									{DeleteFieldValue}
									{CurrentAbstractionTag}
									{HandleInputAbstractionTag}
									{CurrentAbstractionTagError}
									Abstraction={AbstractionReference}
									{CurrentAbstraction}
									{HandleUpdateAbstraction}
									{HandleDeleteAbstraction}
									{CheckCompletedStatus}
									{ExpandLeftSection}
									{HandleExpandLeftSection}
								/>
							{:catch}
								<div class="w-full h-full flex justify-center bg-gray-400">
									<div class="w-fit h-fit self-center flex flex-col">
										<div class="text-lg text-white">Network error...</div>
									</div>
								</div>
							{/await}
						{:else if currentTab === AbstractionTabs.ABSTRACTION_REVIEW}
							{#await import('$lib/abstraction/AbstractionReview.svelte')}
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
							{:then AbstractionReview}
								<AbstractionReview.default Abstraction={AbstractionReference} {AbstractionReviewComment} {HandlePostReview} {HandleUpdateAbstractionReviewComment} />
							{:catch}
								<div class="w-full h-full flex justify-center bg-gray-400">
									<div class="w-fit h-fit self-center flex flex-col">
										<div class="text-lg text-white">Network error...</div>
									</div>
								</div>
							{/await}
						{:else if currentTab === AbstractionTabs.FILE}
							<div class="flex-1 w-full h-full overflow-auto">
								{#if data.FileContentType}
									{#if data.FileContentType.startsWith('image/')}
										<img src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.FileID}" alt={data.Tags} />
									{:else if data.FileContentType.startsWith('audio/')}
										<audio controls src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.FileID}" />
									{:else if data.FileContentType.startsWith('video/')}
										<video controls>
											<source src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.FileID}" />
											<track kind="captions" />
										</video>
									{:else if data.FileContentType === 'application/pdf'}
										<iframe src="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.FileID}" title={data.Tags} height="100%" width="100%" />
									{:else}
										<div class="w-full h-full flex justify-center">
											<a class="btn btn-primary self-center" href="{PUBLIC_API_URL}/storage/file/{$CurrentProject.ProjectID}/{data.FileID}" target="_blank"> download file </a>
										</div>
									{/if}
								{:else}
									<div>Invalid Request</div>
								{/if}
							</div>
						{/if}
					</main>
					{#if $AbstractionTimeoutActive && data.LastUpdatedOn && data.AbstractorDirectoryID === $CurrentUser?.DirectoryID}
						<footer class="flex-[0.5] w-full overflow-hidden shadow-inner shadow-gray-800 rounded-md p-1 flex justify-center">
							<div class="w-fit flex">
								<span class="h-fit self-center flex justify-center"><Icon type={autoSaveTimeoutActive ? 'mdi:alert' : 'mdi:information-variant-circle'} color={autoSaveTimeoutActive ? Shared.Colors.WARNING : Shared.Colors.INFO} /></span>
								<span class="h-fit self-center">Last save: <span class="font-bold" class:text-warning={autoSaveTimeoutActive}>{LocalDateFromString(data.LastUpdatedOn)} at {LocalTimeFromString(data.LastUpdatedOn)}</span></span>
							</div>
						</footer>
					{/if}
				</section>
			{/if}
		</div>
	{/await}
{:else}
	<div>Invalid request</div>
{/if}
