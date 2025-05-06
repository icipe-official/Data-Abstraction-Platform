<script lang="ts">
	import { Shared } from '$lib/constants'
	import Icon from './Icon.svelte'

	export let Value: string | null
	export let Placeholder: string = ''
	/**
	 * Supported formats: yyyy-mm-dd HH:MM, yyyy-mm-dd, yyyy-mm, HH:MM, yyyy, mm
	 */
	export let DateTimeFormat: string = 'yyyy-mm-dd HH:MM'
	export let Color: Shared.Colors = Shared.Colors.SECONDARY
	export let OnDateTimeUpdate: ((value: string | null) => void) | null = null
	export let classInputType: string = 'input-secondary'

	const GetCurrentValue = () => Value

	type DateTime = number | undefined
	let yyyy: DateTime = undefined
	const setYyyy = (value: DateTime) => (yyyy = value)
	let mm: DateTime = undefined
	const setMm = (value: DateTime) => (mm = value)
	let dd: DateTime = undefined
	const setDd = (value: DateTime) => (dd = value)
	let HH: DateTime = undefined
	const setHH = (value: DateTime) => (HH = value)
	let MM: DateTime = undefined
	const setMM = (value: DateTime) => (MM = value)
	enum DateTabs {
		YYYY = 'yyyy',
		MM = 'mm',
		DD = 'dd'
	}
	let currentDateTabs: DateTabs | undefined = undefined
	const setCurrentTabs = (value: DateTabs) => (currentDateTabs = value)
	let currentYears: number[] = []
	let maxYear: DateTime = undefined
	const setMaxYear = (value: DateTime) => (maxYear = value)
	function generateCurrentYears(direction: number) {
		if (!maxYear) return
		currentYears = []
		maxYear = direction > 0 ? maxYear + 24 : maxYear - 24
		for (let i = maxYear - 24; i < maxYear; i++) {
			if (i < 1000) continue
			currentYears = [...currentYears, i]
		}
	}
	let currentDays: number[] = []
	function generateDays() {
		if (!yyyy) return
		currentDays = []
		let maxDays = 0
		if (mm === 2) {
			if (yyyy % 400 === 0 || (yyyy % 4 === 0 && yyyy % 100 !== 0)) maxDays = 29
			else maxDays = 28
		} else if (mm === 4 || mm === 6 || mm === 9 || mm === 11) maxDays = 30
		else maxDays = 31
		const startWeekDay = new Date(`${yyyy}-${mm}-01`).getDay()
		let dayCounter = 0
		for (let i = 0; i < 49; i++) {
			let currentDay = 0
			if (dayCounter < maxDays && i >= startWeekDay) {
				dayCounter += 1
				currentDay = dayCounter
			}
			currentDays = [...currentDays, currentDay]
		}
	}
	$: if (DateTimeFormat) {
		setYyyy(undefined)
		setMm(undefined)
		setDd(undefined)
		setHH(undefined)
		setMM(undefined)
		if (DateTimeFormat.includes('yyyy')) {
			setYyyy(new Date().getFullYear())
			setMaxYear(new Date().getFullYear())
			generateCurrentYears(1)
		}
		if (DateTimeFormat.includes('mm')) setMm(new Date().getMonth() + 1)
		if (DateTimeFormat.includes('dd')) {
			setDd(new Date().getDay())
			generateDays()
		}
		if (DateTimeFormat.includes('HH')) setHH(new Date().getHours())
		if (DateTimeFormat.includes('MM')) setMM(new Date().getMinutes())
		setCurrentTabs(DateTimeFormat.includes('yyyy') ? DateTabs.YYYY : DateTimeFormat.includes('mm') ? DateTabs.MM : DateTabs.DD)
		const pickedDateTime = GetCurrentValue()
		let regexExtract: RegExpExecArray | null = null
		switch (DateTimeFormat) {
			case 'yyyy-mm-dd HH:MM':
				if (typeof pickedDateTime !== 'string') break
				regexExtract = /([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2})/.exec(pickedDateTime)
				if (regexExtract === null) break
				setYyyy(Number(regexExtract[1]))
				setMm(Number(regexExtract[2]))
				setDd(Number(regexExtract[3]))
				setHH(Number(regexExtract[4]))
				setMM(Number(regexExtract[5]))
				break
			case 'yyyy-mm-dd':
				if (typeof pickedDateTime !== 'string') break
				regexExtract = /([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(pickedDateTime)
				if (regexExtract === null) break
				setYyyy(Number(regexExtract[1]))
				setMm(Number(regexExtract[2]))
				setDd(Number(regexExtract[3]))
				break
			case 'yyyy-mm':
				if (typeof pickedDateTime !== 'string') break
				regexExtract = /([0-9]{4})-([0-9]{2})/.exec(pickedDateTime)
				if (regexExtract === null) break
				setYyyy(Number(regexExtract[1]))
				setMm(Number(regexExtract[2]))
				break
			case 'HH:MM':
				if (typeof pickedDateTime !== 'string') break
				regexExtract = /([0-9]{2}):([0-9]{2})/.exec(pickedDateTime)
				if (regexExtract === null) break
				setHH(Number(regexExtract[1]))
				setMM(Number(regexExtract[2]))
				break
			case 'yyyy':
				if (typeof pickedDateTime === 'string') setYyyy(Number(pickedDateTime))
				else if (typeof pickedDateTime === 'number') setYyyy(pickedDateTime)
				break
			case 'mm':
				if (typeof pickedDateTime === 'string') setMm(Number(pickedDateTime))
				else if (typeof pickedDateTime === 'number') setMm(pickedDateTime)
				break
		}
	}

	const getDateTimeUnitsString = (value: DateTime) => (typeof value !== 'undefined' && value < 10 ? `0${value}` : `${value}`)

	type InputDateTime = string | undefined
	function handleInputDateTime(nyyyy: InputDateTime, nmm: InputDateTime, ndd: InputDateTime, nHH: InputDateTime, nMM: InputDateTime) {
		if (typeof nyyyy !== 'undefined') {
			yyyy = parseInt(nyyyy)
			if (yyyy < 1000) yyyy = 1000
			mm = undefined
			dd = undefined
		}
		if (typeof nmm !== 'undefined') {
			mm = parseInt(nmm)
			dd = undefined
			if (typeof yyyy !== 'undefined' && DateTimeFormat?.includes('dd')) generateDays()
		}
		if (typeof ndd !== 'undefined') {
			dd = parseInt(ndd)
		}
		if (typeof nHH !== 'undefined') {
			HH = parseInt(nHH)
		}
		if (typeof nMM !== 'undefined') {
			MM = parseInt(nMM)
		}
		let newValue: string | null = null
		switch (DateTimeFormat) {
			case 'yyyy-mm-dd HH:MM':
				newValue = `${yyyy ? yyyy : '0000'}-${mm ? getDateTimeUnitsString(mm) : '00'}-${dd ? getDateTimeUnitsString(dd) : '00'} ${HH ? getDateTimeUnitsString(HH) : '00'}:${MM ? getDateTimeUnitsString(MM) : '00'}`
				break
			case 'yyyy-mm-dd':
				newValue = `${yyyy ? yyyy : '0000'}-${mm ? getDateTimeUnitsString(mm) : '00'}-${dd ? getDateTimeUnitsString(dd) : '00'}`
				break
			case 'yyyy-mm':
				newValue = `${yyyy ? yyyy : '0000'}-${mm ? getDateTimeUnitsString(mm) : '00'}`
				break
			case 'HH:MM':
				newValue = `${HH ? getDateTimeUnitsString(HH) : '00'}:${MM ? getDateTimeUnitsString(MM) : '00'}`
				break
			case 'yyyy':
				newValue = yyyy ? yyyy.toString() : null
				break
			case 'mm':
				newValue = mm ? mm.toString() : null
				break
		}
		Value = newValue
		if (OnDateTimeUpdate !== null) {
			OnDateTimeUpdate(newValue)
		}
	}

	function generateHoursMinutes(limit: number) {
		let newHoursMinutes: number[] = []
		for (let i = 0; i < limit; i++) {
			newHoursMinutes.push(i)
		}
		return newHoursMinutes
	}

	let showCalendarOptions = false
</script>

<div class="form-control overflow-visible input {classInputType} p-0">
	<header class="flex h-full">
		<div class="flex-[8] bg-accent flex justify-center">
			<span class="h-fit w-fit self-center bg-accent-text">{Value === null || Value === '' || Value === 'null' ? Placeholder : Value}</span>
		</div>
		<div class="h-full p-1">
			<button
				class="btn btn-ghost h-full"
				on:click={(e) => {
					e.preventDefault()
					showCalendarOptions = !showCalendarOptions
				}}
			>
				<Icon type="mdi:calendar-plus" color={Color} />
			</button>
		</div>
	</header>
	{#if showCalendarOptions}
		<div class="relative flex h-0 min-w-[300px] max-w-[700px] z-[1000000000]">
			<div class="flex-1 w-full flex flex-col shadow-md rounded-md shadow-gray-800 bg-accent text-primary p-1 space-y-1 absolute top-0 left-0">
				{#if DateTimeFormat.includes('yyyy') || DateTimeFormat.includes('mm') || DateTimeFormat.includes('dd')}
					<section class="flex flex-col space-y-1">
						<header class="tabs">
							{#if DateTimeFormat.includes('yyyy')}
								<button
									class="tab tab-bordered flex-1"
									class:tab-active={currentDateTabs === DateTabs.YYYY}
									on:click={(e) => {
										e.preventDefault()
										currentDateTabs = DateTabs.YYYY
									}}
								>
									{yyyy ? yyyy : 'year'}
								</button>
							{/if}
							{#if DateTimeFormat.includes('mm')}
								<button
									class="tab tab-bordered flex-1"
									class:tab-active={currentDateTabs === DateTabs.MM}
									on:click={(e) => {
										e.preventDefault()
										currentDateTabs = DateTabs.MM
									}}
								>
									{mm ? getDateTimeUnitsString(mm) : 'month'}
								</button>
							{/if}
							{#if DateTimeFormat.includes('dd')}
								<button
									class="tab tab-bordered flex-1"
									class:tab-active={currentDateTabs === DateTabs.DD}
									on:click={(e) => {
										e.preventDefault()
										currentDateTabs = DateTabs.DD
									}}
								>
									{dd ? getDateTimeUnitsString(dd) : 'day'}
								</button>
							{/if}
						</header>
						<main>
							{#if currentDateTabs === DateTabs.YYYY}
								<div class="join w-full">
									<button
										class="join-item btn btn-secondary btn-neutral flex-1 h-fit"
										on:click={(e) => {
											e.preventDefault()
											generateCurrentYears(-1)
										}}
									>
										<Icon type="mdi:chevron-triple-left" />
									</button>
									<button
										class="join-item btn btn-secondary btn-neutral flex-1 h-fit"
										on:click={(e) => {
											e.preventDefault()
											generateCurrentYears(1)
										}}
									>
										<Icon type="mdi:chevron-triple-right" />
									</button>
								</div>
								<div class="grid grid-cols-6">
									{#each currentYears as cy}
										<button
											class="btn btn-regular btn-primary h-fit"
											class:btn-accent={yyyy !== cy}
											class:btn-success={yyyy === cy}
											on:click={(e) => {
												e.preventDefault()
												handleInputDateTime(`${cy}`, undefined, undefined, undefined, undefined)
											}}
										>
											{cy}
										</button>
									{/each}
								</div>
							{:else if currentDateTabs === DateTabs.MM}
								<div class="grid grid-cols-3">
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 1}
										class:btn-success={mm === 1}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '1', undefined, undefined, undefined)
										}}
									>
										jan
									</button>
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 2}
										class:btn-success={mm === 2}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '2', undefined, undefined, undefined)
										}}
									>
										feb
									</button>
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 3}
										class:btn-success={mm === 3}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '3', undefined, undefined, undefined)
										}}
									>
										mar
									</button>
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 4}
										class:btn-success={mm === 4}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '4', undefined, undefined, undefined)
										}}
									>
										apr
									</button>
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 5}
										class:btn-success={mm === 5}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '5', undefined, undefined, undefined)
										}}
									>
										may
									</button>
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 6}
										class:btn-success={mm === 6}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '6', undefined, undefined, undefined)
										}}
									>
										jun
									</button>
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 7}
										class:btn-success={mm === 7}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '7', undefined, undefined, undefined)
										}}
									>
										july
									</button>
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 8}
										class:btn-success={mm === 8}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '8', undefined, undefined, undefined)
										}}
									>
										aug
									</button>
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 9}
										class:btn-success={mm === 9}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '9', undefined, undefined, undefined)
										}}
									>
										sept
									</button>
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 10}
										class:btn-success={mm === 10}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '10', undefined, undefined, undefined)
										}}
									>
										oct
									</button>
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 11}
										class:btn-success={mm === 11}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '11', undefined, undefined, undefined)
										}}
									>
										nov
									</button>
									<button
										class="btn btn-regular btn-primary h-fit"
										class:btn-accent={mm !== 12}
										class:btn-success={mm === 12}
										on:click={(e) => {
											e.preventDefault()
											handleInputDateTime(undefined, '12', undefined, undefined, undefined)
										}}
									>
										dec
									</button>
								</div>
							{:else if currentDateTabs === DateTabs.DD}
								<div class="dateDaysGrid">
									<div class="btn btn-regular btn-disabled h-fit text-secondary">Su</div>
									<div class="btn btn-regular btn-disabled h-fit text-secondary">Mo</div>
									<div class="btn btn-regular btn-disabled h-fit text-secondary">Tu</div>
									<div class="btn btn-regular btn-disabled h-fit text-secondary">We</div>
									<div class="btn btn-regular btn-disabled h-fit text-secondary">Th</div>
									<div class="btn btn-regular btn-disabled h-fit text-secondary">Fr</div>
									<div class="btn btn-regular btn-disabled h-fit text-secondary">Sa</div>
									{#each currentDays as cd}
										{#if cd > 0}
											<button
												class="btn btn-primary btn-regular h-fit"
												class:btn-accent={dd !== cd}
												class:btn-success={dd === cd}
												on:click={(e) => {
													e.preventDefault()
													handleInputDateTime(undefined, undefined, `${cd}`, undefined, undefined)
												}}
											>
												{cd}
											</button>
										{:else}
											<div class="btn-disabled btn-regular h-fit"></div>
										{/if}
									{/each}
								</div>
							{/if}
						</main>
					</section>
				{/if}
				{#if DateTimeFormat === 'yyyy-mm-dd HH:MM'}
					<div class="divider" />
				{/if}
				{#if DateTimeFormat.includes('HH:MM')}
					<section class="join">
						<select
							class="join-item select select-primary flex-1"
							value={HH}
							on:change={(e) => {
								e.preventDefault()
								handleInputDateTime(undefined, undefined, undefined, e.currentTarget.value, undefined)
							}}
						>
							<option selected={!HH} value={undefined} disabled>Hour..</option>
							{#each generateHoursMinutes(24) as ghm}
								<option selected={ghm === HH} value={ghm}>{getDateTimeUnitsString(ghm)}</option>
							{/each}
						</select>
						<select
							class="join-item select select-primary flex-1"
							value={MM}
							on:change={(e) => {
								e.preventDefault()
								handleInputDateTime(undefined, undefined, undefined, undefined, e.currentTarget.value)
							}}
						>
							<option selected={!MM} value={undefined} disabled>Minute..</option>
							{#each generateHoursMinutes(60) as ghm}
								<option selected={ghm === MM} value={ghm}>{getDateTimeUnitsString(ghm)}</option>
							{/each}
						</select>
					</section>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.dateDaysGrid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
	}
</style>
