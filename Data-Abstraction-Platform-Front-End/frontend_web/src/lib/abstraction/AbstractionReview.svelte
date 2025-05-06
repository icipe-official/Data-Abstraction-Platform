<script lang="ts">
	import Icon from '$lib/components/Icon.svelte'
	import { OPTS_SPLIT, Shared } from '$lib/constants'
	import type { ISearchAbstraction } from '$lib/interface'
	import { AbstractionCurrentTemplate, CurrentUser } from '$lib/stores'
	import { IsProjectUserAuthorized, LocalDateFromString, LocalTimeFromString } from '$lib/utils'

	export let Abstraction: ISearchAbstraction
	export let HandlePostReview: (IsVerified: boolean) => void
	export let AbstractionReviewComment: string
	export let HandleUpdateAbstractionReviewComment: (value: string) => void

	enum Tab {
		REVIEW = 'review',
		COMMENTS = 'comments'
	}

	let currentTab: Tab = Tab.REVIEW

	let thumbsDownReviews: number
	const setThumbsDownReviews = (value: number) => (thumbsDownReviews = value)
	let thumbsUpReviews: number
	const setThumbsUpReviews = (value: number) => (thumbsUpReviews = value)

	$: {
		if (Abstraction.AbstractionReviews === null) {
			Abstraction.AbstractionReviews = []
		}

		if (Abstraction.AbstractionReviewsComments === null) {
			Abstraction.AbstractionReviewsComments = []
		}
		setThumbsDownReviews(Abstraction.AbstractionReviews.length > 0 ? (Abstraction.AbstractionReviews.map((ar) => (ar.Review ? 0 : 1)) as number[]).reduce((total, current) => total + current) : 0)
		setThumbsUpReviews(Abstraction.AbstractionReviews.length > 0 ? (Abstraction.AbstractionReviews.map((ar) => (ar.Review ? 1 : 0)) as number[]).reduce((total, current) => total + current) : 0)
	}

	const displayDateTime = (value: string | undefined) => (value ? `${LocalDateFromString(value)} at ${LocalTimeFromString(value)}` : 'No date avaliable')
</script>

<div class="flex flex-col w-full h-full overflow-hidden space-y-2">
	<header class="flex-[0.5] flex tabs">
		<button
			class="flex-1 tab tab-bordered text-md font-bold"
			class:tab-active={currentTab === Tab.REVIEW}
			class:text-secondary={currentTab === Tab.REVIEW}
			on:click={() => {
				currentTab = Tab.REVIEW
			}}
		>
			Reviews
		</button>
		<button
			class="flex-1 tab tab-bordered text-md font-bold"
			class:tab-active={currentTab === Tab.COMMENTS}
			class:text-secondary={currentTab === Tab.COMMENTS}
			on:click={() => {
				currentTab = Tab.COMMENTS
			}}
		>
			Comments ({Abstraction.AbstractionReviewsComments.length})
		</button>
	</header>
	<main class="flex-[9.5] flex flex-col overflow-y-auto rounded-md space-y-2">
		{#if currentTab === Tab.REVIEW}
			<span class="flex space-x-1 justify-between">
				<span class="flex-1 flex space-x-2 justify-center">
					<span class="font-bold text-md h-fit self-center"><Icon type="mdi:thumbs-up-down" color={Shared.Colors.INFO} /></span>
					<span class="h-fit self-center">{Abstraction.AbstractionReviews.length}/{$AbstractionCurrentTemplate?.VerificationQuorum}</span>
				</span>
				<div class="divider divider-horizontal" />
				<span class="flex-1 flex space-x-2 justify-center">
					<span class="font-bold text-md h-fit self-center"><Icon type="mdi:thumb-up" color={Shared.Colors.SUCCESS} /></span>
					<span class="h-fit self-center">{thumbsUpReviews}/{$AbstractionCurrentTemplate?.VerificationQuorum}</span>
				</span>
				<div class="divider divider-horizontal" />
				<span class="flex-1 flex space-x-2 justify-center">
					<span class="font-bold text-md h-fit self-center"><Icon type="mdi:thumb-down" color={Shared.Colors.ERROR} /></span>
					<span class="h-fit self-center">{thumbsDownReviews}/{$AbstractionCurrentTemplate?.VerificationQuorum}</span>
				</span>
			</span>
			{#if Abstraction.AbstractionReviews.length > 0}
				<table class="table w-full shadow-inner shadow-gray-800 rounded-md">
					<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0">
						<tr>
							<th>#</th>
							<th>Name</th>
							<th>Contacts</th>
							<th>Review</th>
							<th>Last Updated On</th>
						</tr>
					</thead>
					<tbody>
						{#each Abstraction.AbstractionReviews as ar, index}
							<tr>
								<td>{index + 1}</td>
								<td>{ar.ReviewerDirectoryName}</td>
								<td>{ar.ReviewerDirectoryContacts ? ar.ReviewerDirectoryContacts.map((c) => c.replace(OPTS_SPLIT, '-')).join(',') : 'No contacts available'}</td>
								<td>
									<div class="flex justify-start">
										<Icon type={ar.Review ? 'mdi:thumb-up' : 'mdi:thumb-down'} color={ar.Review ? Shared.Colors.SUCCESS : Shared.Colors.ERROR} />
									</div>
								</td>
								<td>{displayDateTime(ar.ReviewLastUpdatedOn)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<div class="flex-1 flex justify-center">
					<span class="self-center text-lg text-primary">No reviews made...</span>
				</div>
			{/if}
		{:else if currentTab === Tab.COMMENTS}
			{#if Abstraction.AbstractionReviewsComments.length > 0}
				{#each Abstraction.AbstractionReviewsComments as arc}
					<div class="chat" class:chat-end={arc.CommenterDirectoryID === $CurrentUser?.DirectoryID} class:chat-start={arc.CommenterDirectoryID !== $CurrentUser?.DirectoryID}>
						<div class="chat-header text-xs">{arc.CommenterDirectoryName}</div>
						<div class="chat-bubble chat-bubble-primary">{arc.Comment}</div>
						<div class="chat-footer text-xs opacity-50">{displayDateTime(arc.CommentCreatedOn)}</div>
					</div>
				{/each}
			{:else}
				<div class="flex-1 flex justify-center">
					<span class="self-center text-lg text-primary">No comments made...</span>
				</div>
			{/if}
		{/if}
	</main>
	{#if IsProjectUserAuthorized([Shared.ProjectRoles.REVIEWER]) || $CurrentUser?.DirectoryID === Abstraction.AbstractorDirectoryID}
		<div class="divider" />
		<footer class="flex-[0.5] flex space-x-1">
			<textarea class="flex-[9] textarea textarea-primary w-full max-h-[20vh]" value={AbstractionReviewComment} on:input={(e) => HandleUpdateAbstractionReviewComment(e.currentTarget.value)} placeholder="Type a comment..." />
			<section class="flex-1 h-fit join self-center">
				<button class="join-item btn btn-secondary tooltip tooltip-left" data-tip="Abstraction has issues" on:click={() => HandlePostReview(false)}>
					<Icon type="mdi:thumb-down" />
				</button>
				<button class="join-item btn btn-primary tooltip tooltip-left" data-tip="Abstraction is okay/completed" on:click={() => HandlePostReview(true)}>
					<Icon type="mdi:thumb-up" />
				</button>
			</section>
		</footer>
	{/if}
</div>
