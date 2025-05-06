<script lang="ts">
	import { OPTS_SPLIT, Shared } from '$lib/constants'
	import Icon from '$lib/components/Icon.svelte'
	import type TemplateManager from '$lib/modeltemplate/templatemanager'
	import type { FormField, IFormKeyValue, ISearchAbstraction } from '$lib/interface'
	import { IsProjectUserAuthorized, LocalDateFromString, LocalTimeFromString } from '$lib/utils'
	import { CurrentUser, CurrentProject, Loading, ToastType, ToastMessage } from '$lib/stores'
	import { PUBLIC_API_URL } from '$env/static/public'

	export let DefaultTemplateManager: TemplateManager
	export let NameDescription: string
	export let UpdateAbstractionValue: (value: IFormKeyValue, repetitiveIndexes: number[]) => void
	export let GetAbstractionValue: (key: string, repetitiveIndexes: number[]) => FormField
	export let DeleteFieldValue: (key: string, repetitiveIndexes: number[]) => void
	export let CurrentAbstractionTag: string
	export let HandleInputAbstractionTag: (value: string) => void
	export let CurrentAbstractionTagError: string | null
	export let Abstraction: ISearchAbstraction
	export let CurrentAbstraction: any
	export let HandleUpdateAbstraction: () => void
	export let HandleDeleteAbstraction: () => void
	export let CheckCompletedStatus: () => boolean
	export let ExpandLeftSection: boolean | undefined = undefined
	export let HandleExpandLeftSection: (() => void) | undefined = undefined

	enum AbstractionTabs {
		ABSTRACTION = 'ABSTRACTION',
		ACTIONS = 'ACTIONS'
	}
	let currentTab: AbstractionTabs = AbstractionTabs.ABSTRACTION

	let viewUiAsTable = false
	let SwitchTableViewToTwoDimension = true
	let previewAbstractionComponent: any = null
</script>

<div class="flex flex-col w-full h-full overflow-hidden space-y-2">
	<header class="flex-[0.5] flex">
		<button
			class="btn btn-ghost w-fit h-fit p-0 tooltip tooltip-secondary tooltip-right space-x-1"
			on:click={() => {
				viewUiAsTable = !viewUiAsTable
				if (currentTab !== AbstractionTabs.ABSTRACTION) currentTab = AbstractionTabs.ABSTRACTION
			}}
			data-tip={viewUiAsTable ? 'View data in a book' : 'View data in a table/list'}
		>
			<Icon type={viewUiAsTable ? 'mdi:book-open-blank-variant' : 'mdi:file-table-box'} color={Shared.Colors.PRIMARY} iconSize="34" />
		</button>
		<section class="flex-[9] tabs w-full overflow-y-hidden overflow-x-auto">
			<button
				class="flex-1 tab tab-bordered text-md font-bold"
				class:tab-active={currentTab === AbstractionTabs.ABSTRACTION}
				class:text-secondary={currentTab === AbstractionTabs.ABSTRACTION}
				on:click={() => {
					currentTab = AbstractionTabs.ABSTRACTION
				}}
			>
				Abstraction
			</button>
			<button
				class="flex-1 tab tab-bordered text-md font-bold"
				class:tab-active={currentTab === AbstractionTabs.ACTIONS}
				class:text-secondary={currentTab === AbstractionTabs.ACTIONS}
				on:click={() => {
					currentTab = AbstractionTabs.ACTIONS
				}}
			>
				Actions
			</button>
		</section>
		{#if typeof ExpandLeftSection !== 'undefined' || HandleExpandLeftSection}
			<button class="btn btn-ghost w-fit h-fit p-0 tooltip tooltip-secondary tooltip-left space-x-1" on:click={HandleExpandLeftSection} data-tip={ExpandLeftSection ? 'Minimize section' : 'Expand section'}>
				<Icon type={ExpandLeftSection ? 'mdi:arrow-collapse' : 'mdi:arrow-expand'} color={Shared.Colors.PRIMARY} iconSize="34" />
			</button>
		{/if}
	</header>
	<main class="flex-[9.5] flex flex-col overflow-hidden space-y-2">
		{#if currentTab === AbstractionTabs.ABSTRACTION}
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
					<List.default CurrentTemplate={DefaultTemplateManager} {NameDescription} UpdateValue={UpdateAbstractionValue} GetValue={GetAbstractionValue} {DeleteFieldValue} />
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
					<Book.default CurrentTemplate={DefaultTemplateManager} {NameDescription} UpdateValue={UpdateAbstractionValue} GetValue={GetAbstractionValue} {DeleteFieldValue} />
				{:catch}
					<div class="w-full h-full flex justify-center bg-gray-400">
						<div class="w-fit h-fit self-center flex flex-col">
							<div class="text-lg text-white">Network error...</div>
						</div>
					</div>
				{/await}
			{/if}
		{:else if currentTab === AbstractionTabs.ACTIONS}
			<section class="flex-[0.5] form-control">
				<div class="join">
					<span class="join-item join-label-primary join-label-content"><span>Tag</span></span>
					<input class="join-item input input-primary w-full" placeholder="Enter tag..." value={CurrentAbstractionTag} on:input={(e) => HandleInputAbstractionTag(e.currentTarget.value)} />
				</div>
				{#if CurrentAbstractionTagError}
					<div class="label">
						<span class="label-text text-error">{CurrentAbstractionTagError}</span>
					</div>
					<div class="divider" />
				{/if}
			</section>
			<section class="flex-[9] rounded-md shadow-inner shadow-gray-800 w-full h-fit p-2 overflow-y-auto overflow-x-hidden">
				<div class="text-primary text-lg font-bold">Editor</div>
				<div class="text-md"><span class="font-bold">Name</span>: {Abstraction.AbstractorDirectoryName}</div>
				<div><span class="font-bold">Contacts</span></div>
				{#if Abstraction.AbstractorDirectoryContacts}
					{#each Abstraction.AbstractorDirectoryContacts as c, index}
						<div>{index + 1}: {c.split(OPTS_SPLIT)[0]} - {c.split(OPTS_SPLIT)[1]}</div>
					{/each}
				{/if}
				<div class="divider" />
				<div class="text-primary text-lg font-bold flex">
					<span>File</span>
					<a class="btn btn-ghost w-fit h-fit p-0" href="{PUBLIC_API_URL}/storage/file/{$CurrentProject?.ProjectID}/{Abstraction.FileID}" target="_blank"><Icon type="mdi:download" color={Shared.Colors.PRIMARY} /></a>
				</div>
				<div class="text-md"><span class="font-bold">Tags</span>: {Abstraction.FileTags}</div>
				<div class="text-md"><span class="font-bold">Content-Type</span>: {Abstraction.FileContentType}</div>
				<div class="divider" />
				<div class="text-primary text-lg font-bold">Abstraction</div>
				<div class="text-md"><span class="font-bold">ID</span>: {Abstraction.ID}</div>
				<div class="text-md flex">
					<span class="font-bold h-fit self-center">Review status</span>: <Icon type={Abstraction.IsVerified ? 'mdi:thumb-up' : 'mdi:thumb-down'} color={Abstraction.IsVerified ? Shared.Colors.SUCCESS : Shared.Colors.ERROR} />
				</div>
				<div class="text-md flex">
					<span class="font-bold h-fit self-center">Completed status</span>: <Icon type={CheckCompletedStatus() ? 'mdi:check-decagram' : 'mdi:close-octagon'} color={CheckCompletedStatus() ? Shared.Colors.SUCCESS : Shared.Colors.ERROR} />
				</div>
				<div class="text-md"><span class="font-bold">Created on</span>: {LocalDateFromString(Abstraction.CreatedOn)} at {LocalTimeFromString(Abstraction.CreatedOn)}</div>
				<div class="text-md"><span class="font-bold">Last updated on</span>: {LocalDateFromString(Abstraction.LastUpdatedOn)} at {LocalTimeFromString(Abstraction.LastUpdatedOn)}</div>
			</section>
			<section class="flex-[0.5] join w-[75%] self-center">
				<button
					class="flex-1 join-item self-center w-[50%] h-fit btn btn-neutral"
					on:click={async () => {
						if (previewAbstractionComponent === null) {
							$Loading = true
							await import('./AbstractionPreviewDialog.svelte')
								.then((c) => {
									previewAbstractionComponent = c.default
								})
								.catch(() => {
									$ToastType = Shared.ToastType.ERROR
									$ToastMessage = 'Network error'
								})
								.finally(() => {
									$Loading = false
								})
						}
						if (previewAbstractionComponent !== null) {
							//@ts-expect-error
							document.getElementById('preview-data-table-dialog').showModal()
						}
					}}
				>
					View as table
				</button>
				{#if $CurrentUser?.DirectoryID === Abstraction.AbstractorDirectoryID || IsProjectUserAuthorized([Shared.ProjectRoles.PROJECT_ADMIN])}
					<button class="flex-1 join-item h-fit w-fit btn btn-secondary" on:click={HandleDeleteAbstraction}>delete</button>
				{/if}
				{#if  $CurrentUser?.DirectoryID === Abstraction.AbstractorDirectoryID}
					<button class="flex-1 join-item h-fit w-fit btn btn-primary" on:click={HandleUpdateAbstraction}>save</button>
				{/if}
			</section>
		{/if}
	</main>
</div>

<!--preview data in a table dialog-->
<svelte:component this={previewAbstractionComponent} {SwitchTableViewToTwoDimension} {CurrentAbstraction} />
