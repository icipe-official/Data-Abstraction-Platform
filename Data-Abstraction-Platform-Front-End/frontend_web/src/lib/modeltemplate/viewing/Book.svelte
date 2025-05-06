<script lang="ts">
	import { NAME_REGEX_SEARCH, OPT_SPLIT, Shared } from '$lib/constants'
	import type { BreadCrumb, FormField, IFormKeyValue } from '$lib/interface'
	import Icon from '$lib/components/Icon.svelte'
	import { GetValueInObject, Log } from '$lib/utils'
	import type TemplateManager from '../templatemanager'

	const CURRENT_SECTION = 'Form'

	export let CurrentTemplate: TemplateManager
	export let NameDescription: string
	export let UpdateValue: (value: IFormKeyValue, repetitiveIndexes: number[]) => void
	export let GetValue: (key: string, repetitiveIndexes: number[]) => FormField
	export let DeleteFieldValue: (key: string, repetitiveIndexes: number[]) => void

	let template = CurrentTemplate.CurrentTemplate()
	function ReloadTemplate() {
		template = CurrentTemplate.CurrentTemplate()
		SetCurrentSection(currentSectionIndex)
	}

	function prepareKey(key: string, repetitiveIndexes: number[]): string | undefined {
		for (let i = 0; i < repetitiveIndexes.length; i++) {
			key = key.replace('[x]', `[${repetitiveIndexes[i]}]`)
		}
		if (key.includes('[x]')) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, `key ${key} does not match indexes ${repetitiveIndexes}`)
			return
		}
		key = key.replace('root.', '')
		return key
	}

	interface TableOfContentSection {
		sectionName: string
		key: string
		paddingLeft: number
		repetitiveIndexes: number[]
		breadCrumb: BreadCrumb[]
	}
	let tableOfContents: TableOfContentSection[] = []
	let CurrentSection: { struct: string; value: any } | undefined = undefined
	let currentSectionIndex: number = 0
	let currentBreadCrumb: BreadCrumb[] = []
	function SetCurrentSection(sectionIndex: number) {
		CurrentSection = undefined
		currentSectionIndex = sectionIndex
		currentBreadCrumb = tableOfContents[currentSectionIndex].breadCrumb
		if (currentSectionIndex < 2) return
		if (currentSectionIndex === 2) {
			CurrentSection = {
				struct: `root.${tableOfContents[currentSectionIndex].sectionName.replaceAll(' ', '_')} desc=${NameDescription.split(OPT_SPLIT)[1]}&#`,
				value: template
			}
		} else {
			const sectionKey = prepareKey(tableOfContents[currentSectionIndex].key, tableOfContents[currentSectionIndex].repetitiveIndexes)
			if (!sectionKey) return
			Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, currentSectionIndex, 'Set current section')
			Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, sectionKey, 'Set current section')
			Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, GetValueInObject(template, /#\d+/.test(tableOfContents[currentSectionIndex].sectionName) ? sectionKey : `${sectionKey}.value`), 'Set current section')
			CurrentSection = {
				struct: /#\d+/.test(tableOfContents[currentSectionIndex].sectionName) ? `${tableOfContents[currentSectionIndex].sectionName.replaceAll(' ', '_')}  rge=${sectionKey}&#` : GetValueInObject(template, `${sectionKey}.struct`),
				value: GetValueInObject(template, /#\d+/.test(tableOfContents[currentSectionIndex].sectionName) ? sectionKey : `${sectionKey}.value`)
			}
		}
	}

	function SetCurrentSectionFromGroups(key: string, repetitiveIndexes: number[]) {
		const preparedSearchKey = prepareKey(key, repetitiveIndexes)
		if (typeof preparedSearchKey === 'undefined') {
			Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, `${key}, prepared as ${preparedSearchKey}, is not valid`)
			return
		}
		for (let i = 0; i < tableOfContents.length; i++) {
			const tocKey = prepareKey(tableOfContents[i].key, tableOfContents[i].repetitiveIndexes)
			if (typeof tocKey === 'undefined') continue
			if (tocKey === preparedSearchKey) {
				SetCurrentSection(i)
				return
			}
		}
		Log(Shared.LogLevel.WARNING, CURRENT_SECTION, `No match found for ${preparedSearchKey}`)
	}
	const INDENT = 12
	$: if (template || NameDescription) {
		tableOfContents = []
		tableOfContents = [...tableOfContents, { sectionName: 'Preface', key: '', paddingLeft: 0, repetitiveIndexes: [], breadCrumb: [] }]
		tableOfContents = [...tableOfContents, { sectionName: 'Table of Contents', key: '', paddingLeft: 0, repetitiveIndexes: [], breadCrumb: [] }]
		genTableOfContentsFromGroups('Introduction', '', JSON.parse(JSON.stringify(template)), [], -INDENT, [])
		Log(Shared.LogLevel.DEBUG, CURRENT_SECTION, tableOfContents, 'Get current section')
	}
	function genTableOfContentsFromGroups(mainSectionName: string, mainSectionKey: string, value: any, repetitiveIndexes: number[], paddingLeft: number, breadCrumb: BreadCrumb[]) {
		tableOfContents = [...tableOfContents, { sectionName: mainSectionName, key: mainSectionKey, paddingLeft, repetitiveIndexes, breadCrumb }]
		if (!value || value === null) return
		for (let key of Object.keys(value)) {
			if (!value[key]['struct']) continue
			if (value[key]['struct'].split(' ')[1] === 'unique') {
				const nameExtract = NAME_REGEX_SEARCH.exec(value[key]['struct'])
				const sectionName = nameExtract ? nameExtract[1] : key.replaceAll('_', ' ')
				const preparedKey = prepareKey(value[key]['struct'].split(' ')[0], repetitiveIndexes)
				if (!preparedKey) Log(Shared.LogLevel.ERROR, CURRENT_SECTION, `Table of contents key not valid: ${value[key]['struct'].split(' ')[0]}`)
				const newSection: TableOfContentSection = {
					sectionName,
					key: value[key]['struct'].split(' ')[0],
					paddingLeft: paddingLeft + INDENT,
					breadCrumb: [...breadCrumb, { crumb: nameExtract ? nameExtract[1] : key.replaceAll('_', ' '), path: preparedKey as string }],
					repetitiveIndexes
				}
				genTableOfContentsFromGroups(newSection.sectionName, newSection.key, value[key]['value'], newSection.repetitiveIndexes, newSection.paddingLeft, newSection.breadCrumb)
			} else if (value[key]['struct'].split(' ')[1] === 'repetitive') {
				const nameExtract = NAME_REGEX_SEARCH.exec(value[key]['struct'])
				const sectionName = nameExtract ? nameExtract[1] : key.replaceAll('_', ' ')
				const preparedKey = prepareKey(value[key]['struct'].split(' ')[0], repetitiveIndexes)
				if (!preparedKey) Log(Shared.LogLevel.ERROR, CURRENT_SECTION, `Table of contents key not valid: ${value[key]['struct'].split(' ')[0]}`)
				const newSection: TableOfContentSection = {
					sectionName,
					key: value[key]['struct'].split(' ')[0],
					paddingLeft: paddingLeft + INDENT,
					breadCrumb: [...breadCrumb, { crumb: nameExtract ? nameExtract[1] : key.replaceAll('_', ' '), path: preparedKey as string }],
					repetitiveIndexes
				}
				tableOfContents = [...tableOfContents, newSection]
				const repetitiveGroupValue: object[] = value[key]['value']
				repetitiveGroupValue.forEach((rgv, i) => {
					const preparedKey = prepareKey(value[key]['struct'].split(' ')[0], repetitiveIndexes)
					if (!preparedKey) Log(Shared.LogLevel.ERROR, CURRENT_SECTION, `Table of contents key not valid: ${value[key]['struct'].split(' ')[0]}`)
					genTableOfContentsFromGroups(`${sectionName} #${i + 1}`, `${value[key]['struct'].split(' ')[0]}.value[x]`, JSON.parse(JSON.stringify(rgv)), [...repetitiveIndexes, i], paddingLeft + INDENT + INDENT, [...newSection.breadCrumb, { crumb: `#${i + 1}`, path: preparedKey as string }])
				})
			}
		}
	}

	let RootViewElement: HTMLElement | undefined = undefined
</script>

<div class="flex flex-col w-full h-full space-y-1 overflow-hidden">
	{#if currentSectionIndex === 0}
		<main class="flex-[9.5] flex flex-col rounded-md shadow-inner shadow-gray-800 overflow-hidden space-y-1 justify-center p-2" style="background-color: {Shared.Colors.PRIMARY};">
			<h1 class="bg-primary-text text-4xl text-center">{NameDescription.split(OPT_SPLIT)[0]}</h1>
			{#if NameDescription.split(OPT_SPLIT)[1].replaceAll(' ', '_')}
				<div class="overflow-x-hidden overflow-y-auto max-h-[50vh]">
					<div class="bg-primary-text text-center text-2xl">{NameDescription.split(OPT_SPLIT)[1]}</div>
				</div>
			{/if}
		</main>
	{:else if currentSectionIndex === 1}
		<main class="flex-[9.5] flex flex-col rounded-md shadow-inner shadow-gray-800 overflow-hidden space-y-1" style="background-color: {Shared.Colors.ACCENT};">
			<header class="flex-[0.5] border-b text-xl text-primary font-bold p-2">Table of Contents</header>
			<main bind:this={RootViewElement} class="flex-[9.5] flex flex-col overflow-auto p-1">
				{#if RootViewElement}
					{#await import('./BookToC.svelte')}
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
					{:then BookToC}
						{#each tableOfContents as toc, Index}
							<BookToC.default PaddingLeft={toc.paddingLeft} SectionName={toc.sectionName} {Index} {SetCurrentSection} {RootViewElement} />
						{/each}
					{:catch}
						<div class="w-full h-full flex justify-center bg-gray-400">
							<div class="w-fit h-fit self-center flex flex-col">
								<div class="text-lg text-white">Network error...</div>
							</div>
						</div>
					{/await}
				{/if}
			</main>
		</main>
	{:else if typeof CurrentSection !== 'undefined'}
		{#if Array.isArray(CurrentSection.value)}
			{#await import('./BookRepetitiveGroup.svelte')}
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
			{:then BookRepetitiveGroup}
				<BookRepetitiveGroup.default
					{CurrentTemplate}
					Struct={CurrentSection.struct}
					Value={CurrentSection.value}
					RepetitiveIndexes={tableOfContents[currentSectionIndex].repetitiveIndexes}
					Color={Shared.Colors.PRIMARY}
					BreadCrumb={tableOfContents[currentSectionIndex].breadCrumb}
					{SetCurrentSectionFromGroups}
					{ReloadTemplate}
				/>
			{:catch}
				<div class="w-full h-full flex justify-center bg-gray-400">
					<div class="w-fit h-fit self-center flex flex-col">
						<div class="text-lg text-white">Network error...</div>
					</div>
				</div>
			{/await}
		{:else}
			{#await import('./BookUniqueGroup.svelte')}
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
			{:then BookUniqueGroup}
				<BookUniqueGroup.default
					Struct={CurrentSection.struct}
					Value={CurrentSection.value}
					{UpdateValue}
					RepetitiveIndexes={tableOfContents[currentSectionIndex].repetitiveIndexes}
					BreadCrumb={tableOfContents[currentSectionIndex].breadCrumb}
					{SetCurrentSectionFromGroups}
					{DeleteFieldValue}
					{GetValue}
				/>
			{:catch}
				<div class="w-full h-full flex justify-center bg-gray-400">
					<div class="w-fit h-fit self-center flex flex-col">
						<div class="text-lg text-white">Network error...</div>
					</div>
				</div>
			{/await}
		{/if}
	{/if}
	<footer class="flex-[0.5] join">
		<button class="join-item btn btn-regular btn-secondary flex-1 h-fit" on:click={() => SetCurrentSection(0)} class:btn-disabled={currentSectionIndex === 0}>
			<Icon type="mdi:page-first" />
		</button>
		<button class="join-item btn btn-regular btn-secondary flex-1 h-fit" on:click={() => SetCurrentSection(currentSectionIndex - 1)} class:btn-disabled={currentSectionIndex === 0}>
			<Icon type="mdi:chevron-left" />
		</button>
		<button class="join-item btn btn-regular btn-neutral flex-1 h-fit" on:click={() => SetCurrentSection(1)}>
			{currentSectionIndex}
		</button>
		<button class="join-item btn btn-regular btn-primary flex-1 h-fit" on:click={() => SetCurrentSection(currentSectionIndex + 1)} class:btn-disabled={currentSectionIndex === tableOfContents.length - 1}>
			<Icon type="mdi:chevron-right" />
		</button>
		<button class="join-item btn btn-regular btn-primary flex-1 h-fit" on:click={() => SetCurrentSection(tableOfContents.length - 1)} class:btn-disabled={currentSectionIndex === tableOfContents.length - 1}>
			<Icon type="mdi:page-last" />
		</button>
	</footer>
</div>
