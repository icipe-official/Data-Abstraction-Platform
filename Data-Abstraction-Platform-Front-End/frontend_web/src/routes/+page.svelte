<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { base } from '$app/paths'
	import { PUBLIC_API_URL, PUBLIC_VERSION } from '$env/static/public'
	import { FETCH_ERROR, LOGO_URL, Shared } from '$lib/constants'
	import Intro from '$lib/misc/Intro.svelte'
	import { Loading, LoadingMessage, ToastType, ToastMessage, CurrentUser } from '$lib/stores'
	import Icon from '$lib/components/Icon.svelte'
	import { LocalDateFromString, LocalTimeFromString } from '$lib/utils'
	import Login from '$lib/iam/Login.svelte'

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
				$CurrentUser = null
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

	enum Tab {
		CHOOSE_PROJECT = 'choose_project',
		ABOUT_US = 'about_us'
	}

	let currentTab = Tab.CHOOSE_PROJECT
</script>

{#if browser}
	<div class="w-full h-full overflow-hidden flex flex-col">
		<div class="flex-[9.5] flex justify-center overflow-hidden">
			<section class="flex-[2] flex justify-center">
				<div class="max-w-[90%] max-h-[80%] w-full h-fit self-center bg-white rounded-md shadow-sm shadow-gray-600 overflow-hidden p-2 space-y-1 flex flex-col">
					<header class="flex-[0.5] flex space-x-1 justify-between">
						<div class="flex-[0.5] self-center w-fit h-fit">
							<img src="{LOGO_URL}" alt="data admin logo" class="w-[100%] h-[100%]" />
						</div>
						<div class="flex-[9] flex justify-center">
							<section role="tablist" class="tabs tabs-boxed text-xl h-fit self-center">
								<button role="tab" class="tab self-center" class:tab-active={currentTab === Tab.CHOOSE_PROJECT} on:click={() => (currentTab = Tab.CHOOSE_PROJECT)}>{$CurrentUser !== null && Object.keys($CurrentUser).length > 0 ? 'Launch a project' : 'Login'}</button>
								<button role="tab" class="tab self-center" class:tab-active={currentTab === Tab.ABOUT_US} on:click={() => (currentTab = Tab.ABOUT_US)}>About us</button>
							</section>
						</div>
						{#if $CurrentUser !== null && Object.keys($CurrentUser).length > 0}
							<div class="flex-[0.5] flex justify-end">
								<button class="btn btn-regular btn-ghost w-fit self-center justify-self-end tooltip tooltip-bottom" on:click={handleLogout} data-tip="logout">
									<Icon type="mdi:exit-to-app" color={Shared.Colors.NEUTRAL} />
								</button>
							</div>
						{/if}
					</header>
					<main class="flex-[9] h-full w-full overflow-hidden rounded-md">
						{#if currentTab === Tab.CHOOSE_PROJECT}
							{#if $CurrentUser !== null && Object.keys($CurrentUser).length > 0}
								<span class="text-base text-neutral font-bold"><span class="text-primary">User</span>: {$CurrentUser.Name}</span>
								<main class="flex-[9] h-full w-full overflow-auto rounded-md">
									{#if Array.isArray($CurrentUser.ProjectsRoles) && $CurrentUser.ProjectsRoles.length > 0}
										<table class="table w-full shadow-inner shadow-gray-800 rounded-md">
											<thead class="shadow-sm shadow-gray-600 bg-secondary text-primary sticky top-0">
												<tr>
													<th>#</th>
													<th>Name</th>
													<th>Description</th>
													<th>Created On</th>
												</tr>
											</thead>
											<tbody>
												{#each $CurrentUser.ProjectsRoles as cup, index}
													<tr class="hover">
														<td>{index + 1}</td>
														<td class="font-bold"><a class="w-full text-left" href="{base}/{cup.ProjectID}">{cup.ProjectName}</a></td>
														<td><a class="w-full break-words text-left" href="{base}/{cup.ProjectID}">{cup.ProjectDescription}</a></td>
														<td><a class="w-full text-left" href="{base}/{cup.ProjectID}">{LocalDateFromString(cup.ProjectCreatedOn)} at {LocalTimeFromString(cup.ProjectCreatedOn)}</a></td>
													</tr>
												{/each}
											</tbody>
										</table>
									{:else}
										<div class="w-full h-full bg-gray-200 flex justify-center">
											<span class="text-2xl w-fit h-fit self-center flex">
												<span class="text-center">No projects found<br />You have not been assigned any projects</span>
												<Icon type="mdi:binoculars" iconSize="56" color={Shared.Colors.ACCENT} />
											</span>
										</div>
									{/if}
								</main>
							{:else}
								<div class="flex justify-center">
									<div class="w-full h-fit shadow-inner shadow-gray-800 p-2 self-center space-y-2">
										<Login FromHomeScreen={true} />
									</div>
								</div>
							{/if}
						{:else if currentTab === Tab.ABOUT_US}
							<div class="flex-1 text-sm overflow-auto max-h-[60vh] shadow-inner shadow-gray-800 p-2 rounded-none">
								<div>
									<div class="font-bold">Background</div>
									Data abstraction constitutes a fundamental component of systematic reviews and scientific research, demanding meticulous attention to detail and precision. Nevertheless, conventional data abstraction methods frequently prove laborious, prone to errors, and inadequately equipped to facilitate
									source tracking and the integration of diverse data categories. In response to these persistent challenges, we introduce the Data Abstraction Tool (DAT), an intuitive software application poised to revolutionize the data abstraction process.
								</div>
								<div>
									<div class="font-bold">Methods</div>
									Historically, data abstraction has been reliant on manual procedures, involving the extraction of information from both published and unpublished sources. However, this manual approach is notorious for its time-intensive and resource-draining nature, impeding the realization of a comprehensive,
									all-encompassing data platform. To confront this challenge head-on, we present DAT—an innovative web-based data-abstraction platform harnessing the capabilities of semantic web technologies to automate data extraction from journal publications. Our methodology's effectiveness is empirically
									demonstrated through an evaluation of its performance in a use case focused on malaria vectors data abstraction, showcasing remarkable reductions in time expenditure and improvements in accuracy compared to manual techniques.
								</div>
								<div>
									<div class="font-bold">Conclusions</div>
									DAT represents a publicly accessible web tool tailored for the manual abstraction of data, fostering a unified and cohesive environment for data management. It stands as a valuable resource serving both researchers and policymakers alike, promising to expedite progress in the realm
									of data abstraction. This advancement is poised to facilitate the establishment of expansive databases encompassing diverse datasets, marking a significant stride towards data integration and synthesis in research endeavors.
								</div>
							</div>
						{/if}
					</main>
				</div>
			</section>
			<section class="flex-[3] flex justify-center max-md:hidden">
				<Intro />
			</section>
		</div>
		<div class="text-sm self-center text-center text-accent p-2 bg-accent-text w-fit h-fit">Version: {PUBLIC_VERSION}</div>
	</div>
{:else}
	<div class="w-full h-full flex justify-center bg-gray-400 opacity-90">
		<div class="w-fit h-fit self-center flex flex-col">
			<div class="w-fit h-fit self-center">
				<span class="loading loading-ball loading-sm text-accent" />
				<span class="loading loading-ball loading-md text-secondary" />
				<span class="loading loading-ball loading-lg text-primary" />
			</div>
			<div class="text-lg text-white">Loading...</div>
		</div>
	</div>
{/if}
