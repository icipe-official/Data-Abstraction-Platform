import { LitElement, PropertyValues, TemplateResult, html, nothing, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import '$src/lib/components/error-section/component'
import 'iconify-icon'
import indexCss from '$src/assets/index.css?inline'
import componentCss from './component.css?inline'
import Theme from '$src/lib/theme'
import Log from '$src/lib/log'
import Misc from '$src/lib/miscellaneous'
import '$src/lib/components/drop-down/component'

type DateTime = number | null
type InputDateTime = string | null

enum CalendarTimeTab {
	YEAR = 'YEAR',
	MONTH = 'MONTH',
	DAY = 'DAY',
	TIME = 'TIME'
}

/**
 * Lit component for inputting date-time values.
 *
 * Properties accepted:
 * * value - Current date-time value. will be used as argument in Date() constructor to obtain the year, month, day, hour, and minute. Preferably set as unix epox (new Date()) or ISOstring or UTC. Returns as ISOstring.
 * * datetimeinputformat - Used to determine which input fields to show and values to extract from `value` property. Case insensitive. Formats accepted: yyyy-mm-dd hh:mm, yyyy-mm-dd, yyyy-mm, hh:mm, yyyy, mm.
 * * color - Theme for the component. Based on defined enum `Theme.Color`.
 * * headersbottom - True if to place field headers at the bottom.
 * * disabled - True to disable input.
 *
 * If format is not equal to `yyyy-mm-dd hh:mm` then default date time is set to `0001-01-01 00:00:00 +0000 UTC` otherwise it is set to current date time.
 */
@customElement('calendar-time')
class Component extends LitElement {
	static styles = [unsafeCSS(indexCss), unsafeCSS(componentCss)]

	/** Preferably set as unix epox (new Date()) or ISOstring or UTC. Returns as ISOstring */
	@property() value: string | number | null = null
	/** Supported formats: yyyy-mm-dd hh:mm, yyyy-mm-dd, yyyy-mm, hh:mm, yyyy, mm */
	@property() datetimeinputformat: string = 'yyyy-mm-dd hh:mm'
	@property() color: Theme.Color | undefined
	@property({ type: Boolean }) headersbottom: boolean = false
	@property({ type: Boolean }) disabled: boolean = false
	@property({ type: Boolean }) roundedborder: boolean = true

	@state() private _currentTab?: CalendarTimeTab

	@state() private _year: DateTime = null
	@state() private _yearsToDisplay: number[] = []
	private _maxYearToDisplay: DateTime = null
	@state() private _showYearInputBox: boolean = true
	private _generateYearsToDisplay(next: boolean) {
		if (this._maxYearToDisplay === null) return
		this._yearsToDisplay = []
		this._maxYearToDisplay = next ? (() => (this._maxYearToDisplay + 24 < 9999 ? this._maxYearToDisplay + 24 : 9999))() : this._maxYearToDisplay - 24 > 1000 ? this._maxYearToDisplay - 24 : 1024
		for (let i = this._maxYearToDisplay - 24; i < this._maxYearToDisplay; i++) {
			this._yearsToDisplay = [...this._yearsToDisplay, i < 1000 ? 0 : i]
		}
		// Log.Log(Log.Level.DEBUG, this.localName, 'Generate years to display', { maxYearToDisplay: this._maxYearToDisplay, yearsToDisplay: this._yearsToDisplay })
	}
	@state() private _month: DateTime = null
	@state() private _showMonthInputBox: boolean = true

	@state() private _day: DateTime = null
	@state() private _maxDays: number = 0
	@state() private _daysToDisplay: number[] = []
	@state() private _showDayInputBox: boolean = true
	private _generateDaysToDisplay() {
		if (this._year === null || this._month === null) return
		this._daysToDisplay = []
		this._maxDays = this._month === 2 ? (() => (this._year % 400 === 0 || (this._year % 4 === 0 && this._year % 100 !== 0) ? 29 : 28))() : [4, 6, 9, 11].includes(this._month) ? 30 : 31
		if (this._day !== null && this._day > this._maxDays) {
			this._day = this._maxDays
		}
		const startWeekDay = new Date(`${this._year}-${this._month}-01`).getDay()
		let dayCounter = 0
		for (let i = 0; i < 49; i++) {
			this._daysToDisplay = [
				...this._daysToDisplay,
				dayCounter < this._maxDays && i >= startWeekDay
					? (() => {
							dayCounter += 1
							return dayCounter
						})()
					: 0
			]
		}
		// Log.Log(Log.Level.DEBUG, this.localName, this._generateDaysToDisplay.name, 'Generate days to display', { maxDays: this._maxDays, daysToDisplay: this._daysToDisplay })
	}
	@state() private _hour: DateTime = null
	@state() private _showHourInputBox: boolean = true
	@state() private _minute: DateTime = null
	@state() private _showMinuteInputBox: boolean = true

	private _getDateTimeUnitsString = (value: DateTime) => (typeof value !== 'undefined' && value !== null && value < 10 ? `0${value}` : `${value}`)

	private _reloadDateTimeInputBox(inputBoxesToReload: string[]) {
		if (inputBoxesToReload.includes('year')) {
			this._showYearInputBox = false
			setTimeout(() => {
				this._showYearInputBox = true
			}, 1000)
		}
		if (inputBoxesToReload.includes('month')) {
			this._showMonthInputBox = false
			setTimeout(() => {
				this._showMonthInputBox = true
			}, 1000)
		}
		if (inputBoxesToReload.includes('day')) {
			this._showDayInputBox = false
			setTimeout(() => {
				this._showDayInputBox = true
			}, 1000)
		}
		if (inputBoxesToReload.includes('hour')) {
			this._showHourInputBox = false
			setTimeout(() => {
				this._showHourInputBox = true
			}, 1000)
		}
		if (inputBoxesToReload.includes('minute')) {
			this._showMinuteInputBox = false
			setTimeout(() => {
				this._showMinuteInputBox = true
			}, 1000)
		}
	}

	private _handleDateTimeInput(nyear: InputDateTime, nmonth: InputDateTime, nday: InputDateTime, nhour: InputDateTime, nminute: InputDateTime) {
		if (nyear !== null) {
			if (parseInt(nyear) < 1000 || parseInt(nyear) > 9999) {
				return
			}
			this._year = parseInt(nyear)
			this._maxYearToDisplay = this._year
			this._generateYearsToDisplay(true)
			this._generateDaysToDisplay()
		}
		if (nmonth !== null) {
			if (parseInt(nmonth) < 1) {
				this._month = 1
			} else if (parseInt(nmonth) > 12) {
				this._month = 12
			} else {
				this._month = parseInt(nmonth)
			}
			this._generateDaysToDisplay()
		}
		if (nday !== null) {
			this._day = parseInt(nday)
			this._generateDaysToDisplay()
		}
		if (nhour !== null) {
			if (parseInt(nhour) < 0) {
				this._hour = 0
			} else if (parseInt(nhour) > 23) {
				this._hour = 23
			} else {
				this._hour = parseInt(nhour)
			}
		}
		if (nminute !== null) {
			if (parseInt(nminute) < 0) {
				this._minute = 0
			} else if (Number(nhour) > 59) {
				this._minute = 59
			} else {
				this._minute = parseInt(nminute)
			}
		}

		try {
			let newValue = new Date()
			switch (this.datetimeinputformat) {
				case 'yyyy-mm-dd hh:mm':
					if (this._year !== null) newValue.setFullYear(this._year)
					if (this._month !== null) newValue.setMonth(this._month - 1)
					if (this._day !== null) newValue.setDate(this._day)
					if (this._hour !== null) newValue.setHours(this._hour)
					if (this._minute !== null) newValue.setMinutes(this._minute)
					break
				case 'yyyy-mm-dd':
					if (this._year !== null) newValue.setFullYear(this._year)
					if (this._month !== null) newValue.setMonth(this._month - 1)
					if (this._day !== null) newValue.setDate(this._day)
					break
				case 'yyyy-mm':
					if (this._year !== null) newValue.setFullYear(this._year)
					if (this._month !== null) newValue.setMonth(this._month - 1)
					break
				case 'hh:mm':
					if (this._hour !== null) newValue.setHours(this._hour)
					if (this._minute !== null) newValue.setMinutes(this._minute)
					break
				case 'yyyy':
					if (this._year !== null) newValue.setFullYear(this._year)
					break
				case 'mm':
					if (this._month !== null) newValue.setMonth(this._month - 1)
					break
				default:
					throw `Invalid input date format ${this.datetimeinputformat}`
			}
			this.value = newValue.toISOString()
			// Log.Log(Log.Level.DEBUG, this.localName, this._handleDateTimeInput.name, 'update calendar time', newValue)
			this.dispatchEvent(
				new CustomEvent('calendar-time:datetimeupdate', {
					detail: {
						value: this.value,
						year: this._year,
						month: this._month,
						day: this._day,
						hour: this._hour,
						minute: this._minute,
						epoch: newValue.valueOf()
					}
				})
			)
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.localName, this._handleDateTimeInput.name, e)
		}
	}

	connectedCallback(): void {
		super.connectedCallback()

		// Hanlde Value Change
		let newDateValue: Date

		if (this.value !== null) {
			newDateValue = new Date(this.value)
			if (isNaN(newDateValue.getFullYear())) {
				if (this.datetimeinputformat === 'yyyy-mm-dd hh:mm') {
					newDateValue = new Date()
				} else {
					newDateValue = new Date('0001-01-01 00:00:00 +0000 UTC')
				}
			}
		} else {
			if (this.datetimeinputformat === 'yyyy-mm-dd hh:mm') {
				newDateValue = new Date()
			} else {
				newDateValue = new Date('0001-01-01 00:00:00 +0000 UTC')
			}
		}

		switch (this.datetimeinputformat.toLowerCase()) {
			case 'yyyy-mm-dd hh:mm':
				this._year = newDateValue.getFullYear()
				this._month = newDateValue.getMonth() + 1
				this._day = newDateValue.getDate()
				this._hour = newDateValue.getHours()
				this._minute = newDateValue.getMinutes()
				break
			case 'yyyy-mm-dd':
				this._year = newDateValue.getFullYear()
				this._month = newDateValue.getMonth() + 1
				this._day = newDateValue.getDate()
				break
			case 'yyyy-mm':
				this._year = newDateValue.getFullYear()
				this._month = newDateValue.getMonth() + 1
				break
			case 'yyyy':
				this._year = newDateValue.getFullYear()
				break
			case 'mm':
				this._month = newDateValue.getMonth() + 1
				break
			case 'hh:mm':
				this._hour = newDateValue.getHours()
				this._minute = newDateValue.getMinutes()
				break
			default:
				break
		}

		// Handle Date Format Change
		let dateToday: Date
		if (this.datetimeinputformat === 'yyyy-mm-dd hh:mm') {
			dateToday = new Date()
		} else {
			dateToday = new Date('0001-01-01 00:00:00 +0000 UTC')
		}

		let currentCalendarTab: CalendarTimeTab | undefined = undefined

		if (this.datetimeinputformat.match('yyyy')) {
			this._maxYearToDisplay =
				this._year !== null
					? this._year
					: (() => {
							this._year = dateToday.getFullYear()
							return this._year
						})()
			this._generateYearsToDisplay(true)
			currentCalendarTab = CalendarTimeTab.YEAR
		}
		if (this.datetimeinputformat.match('mm')) {
			if (this._month === null) {
				this._month = dateToday.getMonth() + 1
			}
			currentCalendarTab = CalendarTimeTab.MONTH
		}
		if (this.datetimeinputformat.match('dd')) {
			if (this._day === null) {
				this._day = dateToday.getDay()
			}
			this._generateDaysToDisplay()
			currentCalendarTab = CalendarTimeTab.DAY
		}
		if (this.datetimeinputformat.match('hh:mm')) {
			if (this._hour === null || this._minute === null) {
				this._hour = dateToday.getHours() + 1
				this._minute = dateToday.getMinutes() + 1
			}
			currentCalendarTab = CalendarTimeTab.TIME
		}
		this._currentTab = currentCalendarTab
	}

	protected render(): unknown {
		return html`
			<drop-down
				.contenthtmltemplate=${html`
					<div class="mt-1 rounded-lg bg-white shadow-md shadow-gray-800 p-1 w-full top-0 overflow-auto flex flex-col space-y-1">
						<header role="tablist" class="tabs tabs-bordered">
							${(() => {
								let tabs: TemplateResult<1>[] = []
								if (this.datetimeinputformat.match('yyyy')) {
									tabs.push(html`
										<button
											role="tab"
											class="tab${this._currentTab === CalendarTimeTab.YEAR ? ' tab-active' : ''}"
											@click=${(e: Event) => {
												e.preventDefault()
												this._currentTab = CalendarTimeTab.YEAR
											}}
										>
											year
										</button>
									`)
								}
								if (this.datetimeinputformat.match('mm')) {
									tabs.push(html`
										<button
											role="tab"
											class="tab${this._currentTab === CalendarTimeTab.MONTH ? ' tab-active' : ''}"
											@click=${(e: Event) => {
												e.preventDefault()
												this._currentTab = CalendarTimeTab.MONTH
											}}
										>
											month
										</button>
									`)
								}
								if (this.datetimeinputformat.match('dd')) {
									tabs.push(html`
										<button
											role="tab"
											class="tab${this._currentTab === CalendarTimeTab.DAY ? ' tab-active' : ''}"
											@click=${(e: Event) => {
												e.preventDefault()
												this._currentTab = CalendarTimeTab.DAY
											}}
										>
											day
										</button>
									`)
								}
								if (this.datetimeinputformat.match('hh:mm')) {
									tabs.push(html`
										<button
											role="tab"
											class="tab${this._currentTab === CalendarTimeTab.TIME ? ' tab-active' : ''}"
											@click=${(e: Event) => {
												e.preventDefault()
												this._currentTab = CalendarTimeTab.TIME
											}}
										>
											time
										</button>
									`)
								}
								return tabs.length > 0 ? tabs : nothing
							})()}
						</header>
						<main class="flex justify-center">
							${(() => {
								switch (this._currentTab) {
									case CalendarTimeTab.YEAR:
										return html`
											<div class="flex flex-col space-y-1 w-full">
												<div class="flex w-full">
													<button
														class="rounded-bl-lg rounded-tl-lg rounded-br-none rounded-tr-none btn ${this.color === Theme.Color.PRIMARY
															? 'btn-primary'
															: this.color === Theme.Color.SECONDARY
																? 'btn-secondary'
																: this.color === Theme.Color.ACCENT
																	? 'btn-accent'
																	: 'bg-black text-white'} flex-1 h-fit${this._maxYearToDisplay !== null && this._maxYearToDisplay - 24 <= 1000 ? ' btn-disabled' : ''}"
														@click=${(e: Event) => {
															e.preventDefault()
															this._generateYearsToDisplay(false)
														}}
													>
														<iconify-icon icon="mdi:chevron-triple-left" style="color: ${typeof this.color === 'undefined' ? 'white' : Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
													</button>
													<button
														class="rounded-bl-none rounded-tl-none rounded-br-lg rounded-tr-lg btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'} flex-1 h-fit"
														@click=${(e: Event) => {
															e.preventDefault()
															this._generateYearsToDisplay(true)
														}}
													>
														<iconify-icon icon="mdi:chevron-triple-right" style="color: ${typeof this.color === 'undefined' ? 'white' : Theme.GetColorContent(this.color)};" width=${Misc.IconifySize()} height=${Misc.IconifySize()}></iconify-icon>
													</button>
												</div>
												<div class="grid grid-cols-6 rounded-lg">
													${this._yearsToDisplay.map((ytd) => {
														if (ytd > 0) {
															if (this.disabled) {
																return html`
																	<div
																		class="p-1 text-center ${this._year === ytd
																			? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																			: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
																	>
																		${ytd}
																	</div>
																`
															} else {
																return html`
																	<button
																		class="btn rounded-none h-fit w-full ${this._year === ytd
																			? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																			: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
																		@click=${() => this._handleDateTimeInput(`${ytd}`, null, null, null, null)}
																		.disabled=${this.disabled}
																	>
																		${ytd}
																	</button>
																`
															}
														} else {
															return html`<div class="bg-accent min-h-full min-w-full"></div>`
														}
													})}
													<div></div>
												</div>
											</div>
										`
									case CalendarTimeTab.MONTH:
										return this.disabled
											? html`
													<div class="grid grid-cols-3 w-full">
														<div
															class="p-1 text-center ${this._month === 1
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															jan
														</div>
														<button
															class="p-1 text-center ${this._month === 2
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															feb
														</button>
														<button
															class="p-1 text-center ${this._month === 3
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															mar
														</button>
														<button
															class="p-1 text-center ${this._month === 4
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															apr
														</button>
														<button
															class="p-1 text-center ${this._month === 5
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															may
														</button>
														<button
															class="p-1 text-center ${this._month === 6
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															jun
														</button>
														<button
															class="p-1 text-center ${this._month === 7
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															jul
														</button>
														<button
															class="p-1 text-center ${this._month === 8
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															aug
														</button>
														<button
															class="p-1 text-center ${this._month === 9
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															sept
														</button>
														<button
															class="p-1 text-center ${this._month === 10
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															oct
														</button>
														<button
															class="p-1 text-center ${this._month === 11
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															nov
														</button>
														<button
															class="p-1 text-center ${this._month === 12
																? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
														>
															dec
														</button>
													</div>
												`
											: html`
													<div class="grid grid-cols-3 w-full">
														<button
															class="btn rounded-none h-fit w-full ${this._month === 1
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '1', null, null, null)}
														>
															jan
														</button>
														<button
															class="btn rounded-none h-fit w-full ${this._month === 2
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '2', null, null, null)}
														>
															feb
														</button>
														<button
															class="btn rounded-none h-fit w-full ${this._month === 3
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '3', null, null, null)}
														>
															mar
														</button>
														<button
															class="btn rounded-none h-fit w-full ${this._month === 4
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '4', null, null, null)}
														>
															apr
														</button>
														<button
															class="btn rounded-none h-fit w-full ${this._month === 5
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '5', null, null, null)}
														>
															may
														</button>
														<button
															class="btn rounded-none h-fit w-full ${this._month === 6
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '6', null, null, null)}
														>
															jun
														</button>
														<button
															class="btn rounded-none h-fit w-full ${this._month === 7
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '7', null, null, null)}
														>
															jul
														</button>
														<button
															class="btn rounded-none h-fit w-full ${this._month === 8
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '8', null, null, null)}
														>
															aug
														</button>
														<button
															class="btn rounded-none h-fit w-full ${this._month === 9
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '9', null, null, null)}
														>
															sept
														</button>
														<button
															class="btn rounded-none h-fit w-full ${this._month === 10
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '10', null, null, null)}
														>
															oct
														</button>
														<button
															class="btn rounded-none h-fit w-full ${this._month === 11
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '11', null, null, null)}
														>
															nov
														</button>
														<button
															class="btn rounded-none h-fit w-full ${this._month === 12
																? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
															@click=${() => this._handleDateTimeInput(null, '12', null, null, null)}
														>
															dec
														</button>
													</div>
												`
									case CalendarTimeTab.DAY:
										return html`
											<div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr));" class="w-full">
												<div class="btn rounded-none btn-disabled h-fit ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Su</div>
												<div class="btn rounded-none btn-disabled h-fit ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Mo</div>
												<div class="btn rounded-none btn-disabled h-fit ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Tu</div>
												<div class="btn rounded-none btn-disabled h-fit ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">We</div>
												<div class="btn rounded-none btn-disabled h-fit ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Th</div>
												<div class="btn rounded-none btn-disabled h-fit ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Fr</div>
												<div class="btn rounded-none btn-disabled h-fit ${this.color === Theme.Color.PRIMARY ? 'text-primary' : this.color === Theme.Color.SECONDARY ? 'text-secondary' : 'text-accent'}">Sa</div>
												${this._daysToDisplay.map((dtd) => {
													if (dtd > 0) {
														if (this.disabled) {
															return html`
																<div
																	class="p-1 text-center ${dtd === this._day
																		? `${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'}`
																		: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.SECONDARY ? 'bg-accent text-accent-content' : 'bg-primary text-primary-content'}`}"
																>
																	${dtd}
																</div>
															`
														} else {
															return html`
																<button
																	class="btn rounded-none h-fit w-full ${dtd === this._day
																		? `${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'}`
																		: `${typeof this.color === 'undefined' ? 'bg-white text-black' : this.color === Theme.Color.PRIMARY ? 'btn-secondary' : this.color === Theme.Color.SECONDARY ? 'btn-accent' : 'btn-primary'}`}"
																	@click=${() => this._handleDateTimeInput(null, null, `${dtd}`, null, null)}
																	.disabled=${this.disabled}
																>
																	${dtd}
																</button>
															`
														}
													} else {
														return html`<div class="bg-accent min-h-full min-w-full"></div>`
													}
												})}
											</div>
										`
									case CalendarTimeTab.TIME:
										return html`
											<div class="self-center sm:w-[50%] max-sm:w-full flex">
												<div class="flex-1 flex flex-col">
													<button
														class="rounded-tl-lg rounded-tr-none rounded-b-none btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'} h-fit${this._hour !== null &&
														this._hour >= 23
															? ' btn-disabled'
															: ''}"
														@click=${() => this._handleDateTimeInput(null, null, null, `${this._hour !== null ? this._hour + 1 : 1}`, null)}
														.disabled=${this.disabled}
													>
														<iconify-icon
															icon="mdi:chevron-up"
															style="color: ${typeof this.color === 'undefined' ? 'black' : this.color === Theme.Color.PRIMARY ? Theme.Color.SECONDARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.ACCENT_CONTENT : Theme.Color.PRIMARY_CONTENT};"
															width=${Misc.IconifySize()}
															height=${Misc.IconifySize()}
														></iconify-icon>
													</button>
													<div class="w-full text-2xl text-center p-1 border-2">${this._hour ? this._getDateTimeUnitsString(this._hour) : 'hh'}</div>
													<button
														class="rounded-bl-lg rounded-br-none rounded-t-none btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'} h-fit${this._hour !== null &&
														this._hour <= 0
															? ' btn-disabled'
															: ''}"
														@click=${() => this._handleDateTimeInput(null, null, null, `${this._hour !== null ? this._hour - 1 : -1}`, null)}
														.disabled=${this.disabled}
													>
														<iconify-icon
															icon="mdi:chevron-down"
															style="color: ${typeof this.color === 'undefined' ? 'black' : this.color === Theme.Color.PRIMARY ? Theme.Color.SECONDARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.ACCENT_CONTENT : Theme.Color.PRIMARY_CONTENT};"
															width=${Misc.IconifySize()}
															height=${Misc.IconifySize()}
														></iconify-icon>
													</button>
												</div>
												<div class="flex-1 flex flex-col">
													<button
														class="rounded-tl-none rounded-tr-lg rounded-b-none btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'} h-fit${this._minute !==
															null && this._minute >= 59
															? ' btn-disabled'
															: ''}"
														@click=${() => this._handleDateTimeInput(null, null, null, null, `${this._minute !== null ? this._minute + 1 : 1}`)}
														.disabled=${this.disabled}
													>
														<iconify-icon
															icon="mdi:chevron-up"
															style="color: ${typeof this.color === 'undefined' ? 'black' : this.color === Theme.Color.PRIMARY ? Theme.Color.SECONDARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.ACCENT_CONTENT : Theme.Color.PRIMARY_CONTENT};"
															width=${Misc.IconifySize()}
															height=${Misc.IconifySize()}
														></iconify-icon>
													</button>
													<div class="w-full text-2xl text-center p-1 border-2">${this._minute ? this._getDateTimeUnitsString(this._minute) : 'mm'}</div>
													<button
														class="rounded-bl-none rounded-br-lg rounded-t-none btn ${this.color === Theme.Color.PRIMARY ? 'btn-primary' : this.color === Theme.Color.SECONDARY ? 'btn-secondary' : this.color === Theme.Color.ACCENT ? 'btn-accent' : 'bg-black text-white'} h-fit${this._minute !==
															null && this._minute <= 0
															? ' btn-disabled'
															: ''}"
														@click=${() => this._handleDateTimeInput(null, null, null, null, `${this._minute !== null ? this._minute - 1 : -1}`)}
														.disabled=${this.disabled}
													>
														<iconify-icon
															icon="mdi:chevron-down"
															style="color: ${typeof this.color === 'undefined' ? 'black' : this.color === Theme.Color.PRIMARY ? Theme.Color.SECONDARY_CONTENT : this.color === Theme.Color.SECONDARY ? Theme.Color.ACCENT_CONTENT : Theme.Color.PRIMARY_CONTENT};"
															width=${Misc.IconifySize()}
															height=${Misc.IconifySize()}
														></iconify-icon>
													</button>
												</div>
											</div>
										`
									default:
										return html`<error-section class="shadow-inner shadow-gray-800 p-1 rounded-md" errorcode="400" errormessage="Invalid date-time format"></error-section>`
								}
							})()}
						</main>
					</div>
				`}
			>
				<header slot="header" class="flex max-h-fit w-full ${this.roundedborder ? 'rounded-md' : ''} border-2 ${this.color === Theme.Color.PRIMARY ? 'border-primary' : this.color === Theme.Color.SECONDARY ? 'border-secondary' : this.color === Theme.Color.ACCENT ? 'border-accent' : 'border-black'}">
					${(() => {
						let tabs: TemplateResult<1>[] = []
						if (this.datetimeinputformat.match('yyyy')) {
							tabs.push(html`
								<div class="flex-1 flex min-w-[70px] ${this.headersbottom ? 'flex-col-reverse' : 'flex-col'}">
									<span
										class="text-xs w-full p-1 text-center ${this.color === Theme.Color.PRIMARY
											? 'bg-primary text-primary-content'
											: this.color === Theme.Color.SECONDARY
												? 'bg-secondary text-secondary-content'
												: this.color === Theme.Color.ACCENT
													? 'bg-accent text-accent-content'
													: 'bg-black text-white'} font-bold"
										>year</span
									>
									${(() => {
										if (this._showYearInputBox) {
											return html`
												<input
													class="flex-1 input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : this.color === Theme.Color.ACCENT ? 'input-accent' : ''} w-full rounded-none border-none"
													type="number"
													min="1000"
													max="9999"
													.value=${typeof this._year === 'number' ? this._year.toString() : ''}
													placeholder="yyyy"
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => this._handleDateTimeInput(e.currentTarget.value, null, null, null, null)}
													@focusout=${() => this._reloadDateTimeInputBox(['year', 'day'])}
													.disabled=${this.disabled}
												/>
											`
										} else {
											return html`
												<div class="flex-1 w-full h-full flex justify-center">
													<span class="loading loading-spinner loading-md self-center ${this.color === Theme.Color.PRIMARY ? 'text-primary-content' : this.color === Theme.Color.SECONDARY ? 'text-secondary-content' : this.color === Theme.Color.ACCENT ? 'text-accent-content' : 'text-black'}"></span>
												</div>
											`
										}
									})()}
								</div>
							`)
						}
						if (this.datetimeinputformat.match('yyyy-mm-dd hh:mm') || this.datetimeinputformat.match('yyyy-mm-dd') || this.datetimeinputformat.match('yyyy-mm')) {
							tabs.push(html`
								<div
									class="${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'} font-bold min-h-full flex"
								>
									<div class="pr-1 pl-1 ${this.headersbottom ? 'self-end' : 'self-start'}">/</div>
								</div>
							`)
						}
						if (this.datetimeinputformat.match('mm')) {
							tabs.push(html`
								<div class="flex-[0.5] min-w-[50px] flex ${this.headersbottom ? 'flex-col-reverse' : 'flex-col'}">
									<span
										class="text-xs w-full p-1 text-center ${this.color === Theme.Color.PRIMARY
											? 'bg-primary text-primary-content'
											: this.color === Theme.Color.SECONDARY
												? 'bg-secondary text-secondary-content'
												: this.color === Theme.Color.ACCENT
													? 'bg-accent text-accent-content'
													: 'bg-black text-white'} font-bold"
										>month</span
									>
									${(() => {
										if (this._showMonthInputBox) {
											return html`
												<input
													class="flex-1 input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : this.color === Theme.Color.ACCENT ? 'input-accent' : ''} w-full rounded-none border-none"
													type="number"
													min="1"
													max="12"
													value=${typeof this._month === 'number' ? this._getDateTimeUnitsString(this._month) : ''}
													placeholder="mm"
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => this._handleDateTimeInput(null, e.currentTarget.value, null, null, null)}
													@focusout=${() => this._reloadDateTimeInputBox(['month', 'day'])}
													.disabled=${this.disabled}
												/>
											`
										} else {
											return html`
												<div class="flex-1 w-full h-full flex justify-center">
													<span class="loading loading-spinner loading-md self-center ${this.color === Theme.Color.PRIMARY ? 'text-primary-content' : this.color === Theme.Color.SECONDARY ? 'text-secondary-content' : this.color === Theme.Color.ACCENT ? 'text-accent-content' : 'text-black'}"></span>
												</div>
											`
										}
									})()}
								</div>
							`)
						}
						if (this.datetimeinputformat.match('yyyy-mm-dd hh:mm') || this.datetimeinputformat.match('yyyy-mm-dd')) {
							tabs.push(html`
								<div
									class="${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'} font-bold min-h-full flex"
								>
									<div class="pr-1 pl-1 ${this.headersbottom ? 'self-end' : 'self-start'}">/</div>
								</div>
							`)
						}
						if (this.datetimeinputformat.match('dd')) {
							tabs.push(html`
								<div class="flex-[0.5] min-w-[50px] flex ${this.headersbottom ? 'flex-col-reverse' : 'flex-col'}">
									<span
										class="text-xs w-full p-1 text-center ${this.color === Theme.Color.PRIMARY
											? 'bg-primary text-primary-content'
											: this.color === Theme.Color.SECONDARY
												? 'bg-secondary text-secondary-content'
												: this.color === Theme.Color.ACCENT
													? 'bg-accent text-accent-content'
													: 'bg-black text-white'} font-bold"
										>day</span
									>
									${(() => {
										if (this._showDayInputBox) {
											return html`
												<input
													class="flex-1 input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : this.color === Theme.Color.ACCENT ? 'input-accent' : ''} w-full rounded-none border-none"
													type="number"
													min="1"
													.max=${this._maxDays.toString()}
													.value=${typeof this._day === 'number' ? this._getDateTimeUnitsString(this._day) : ''}
													placeholder="dd"
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => this._handleDateTimeInput(null, null, e.currentTarget.value, null, null)}
													@focusout=${() => this._reloadDateTimeInputBox(['day'])}
													.disabled=${this.disabled}
												/>
											`
										} else {
											return html`
												<div class="flex-1 w-full h-full flex justify-center">
													<span class="loading loading-spinner loading-md self-center ${this.color === Theme.Color.PRIMARY ? 'text-primary-content' : this.color === Theme.Color.SECONDARY ? 'text-secondary-content' : this.color === Theme.Color.ACCENT ? 'text-accent-content' : 'text-black'}"></span>
												</div>
											`
										}
									})()}
								</div>
							`)
						}
						if (this.datetimeinputformat.match('yyyy-mm-dd hh:mm')) {
							tabs.push(html`
								<div
									class="${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'} font-bold min-h-full flex"
								>
									<div class="pr-1 pl-1 ${this.headersbottom ? 'self-end' : 'self-start'}">@</div>
								</div>
							`)
						}
						if (this.datetimeinputformat.match('hh:mm')) {
							tabs.push(html`
								<div class="flex-[0.5] min-w-[50px] flex ${this.headersbottom ? 'flex-col-reverse' : 'flex-col'}">
									<span
										class="text-xs w-full p-1 text-center ${this.color === Theme.Color.PRIMARY
											? 'bg-primary text-primary-content'
											: this.color === Theme.Color.SECONDARY
												? 'bg-secondary text-secondary-content'
												: this.color === Theme.Color.ACCENT
													? 'bg-accent text-accent-content'
													: 'bg-black text-white'} font-bold"
										>hour</span
									>
									${(() => {
										if (this._showHourInputBox) {
											return html`
												<input
													class="flex-1 input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : this.color === Theme.Color.ACCENT ? 'input-accent' : ''} w-full rounded-none border-none"
													type="number"
													min="0"
													max="23"
													value=${typeof this._hour === 'number' ? this._getDateTimeUnitsString(this._hour) : ''}
													placeholder="hh"
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => this._handleDateTimeInput(null, null, null, e.currentTarget.value, null)}
													@focusout=${() => this._reloadDateTimeInputBox(['hour'])}
													.disabled=${this.disabled}
												/>
											`
										} else {
											return html`
												<div class="flex-1 w-full h-full flex justify-center">
													<span class="loading loading-spinner loading-md self-center ${this.color === Theme.Color.PRIMARY ? 'text-primary-content' : this.color === Theme.Color.SECONDARY ? 'text-secondary-content' : this.color === Theme.Color.ACCENT ? 'text-accent-content' : 'text-black'}"></span>
												</div>
											`
										}
									})()}
								</div>
								<div
									class="${this.color === Theme.Color.PRIMARY ? 'bg-primary text-primary-content' : this.color === Theme.Color.SECONDARY ? 'bg-secondary text-secondary-content' : this.color === Theme.Color.ACCENT ? 'bg-accent text-accent-content' : 'bg-black text-white'} font-bold min-h-full flex"
								>
									<div class="pr-1 pl-1 ${this.headersbottom ? 'self-end' : 'self-start'}">:</div>
								</div>
								<div class="flex-[0.5] min-w-[50px] flex ${this.headersbottom ? 'flex-col-reverse' : 'flex-col'}">
									<span
										class="text-xs w-full p-1 text-center ${this.color === Theme.Color.PRIMARY
											? 'bg-primary text-primary-content'
											: this.color === Theme.Color.SECONDARY
												? 'bg-secondary text-secondary-content'
												: this.color === Theme.Color.ACCENT
													? 'bg-accent text-accent-content'
													: 'bg-black text-white'} font-bold"
										>minute</span
									>
									${(() => {
										if (this._showMinuteInputBox) {
											return html`
												<input
													class="flex-1 input ${this.color === Theme.Color.PRIMARY ? 'input-primary' : this.color === Theme.Color.SECONDARY ? 'input-secondary' : this.color === Theme.Color.ACCENT ? 'input-accent' : ''} w-full rounded-none border-none"
													type="number"
													min="0"
													max="59"
													value=${typeof this._minute === 'number' ? this._getDateTimeUnitsString(this._minute) : ''}
													placeholder="mm"
													@input=${(e: Event & { currentTarget: EventTarget & HTMLInputElement }) => this._handleDateTimeInput(null, null, null, null, e.currentTarget.value)}
													@focusout=${() => this._reloadDateTimeInputBox(['minute'])}
													.disabled=${this.disabled}
												/>
											`
										} else {
											return html`
												<div class="flex-1 w-full h-full flex justify-center">
													<span class="loading loading-spinner loading-md self-center ${this.color === Theme.Color.PRIMARY ? 'text-primary-content' : this.color === Theme.Color.SECONDARY ? 'text-secondary-content' : this.color === Theme.Color.ACCENT ? 'text-accent-content' : 'text-black'}"></span>
												</div>
											`
										}
									})()}
								</div>
							`)
						}
						tabs.push(html`
							<div class="flex-[0.5] flex ${this.headersbottom ? 'flex-col-reverse' : 'flex-col'} border-l-[1px] ${this.color === Theme.Color.PRIMARY ? 'border-primary' : this.color === Theme.Color.SECONDARY ? 'border-secondary' : 'border-accent'}">
								<span
									class="text-xs w-full p-1 text-center ${this.color === Theme.Color.PRIMARY
										? 'bg-primary text-primary-content'
										: this.color === Theme.Color.SECONDARY
											? 'bg-secondary text-secondary-content'
											: this.color === Theme.Color.ACCENT
												? 'bg-accent text-accent-content'
												: 'bg-black text-white'} font-bold"
									>...</span
								>
								<div class="h-full flex">
									${(() => {
										if (!this.disabled) {
											return html`
												<button
													class="flex-1 btn btn-ghost btn-sm w-full h-full rounded-none"
													@click=${() => {
														this.value = null
														this._year = null
														this._month = null
														this._day = null
														this._hour = null
														this._minute = null
														this._daysToDisplay = []
														this.dispatchEvent(
															new CustomEvent('calendar-time:datetimeupdate', {
																detail: {
																	value: this.value,
																	year: this._year,
																	month: this._month,
																	day: this._day,
																	hour: this._hour,
																	minute: this._minute
																}
															})
														)
													}}
												>
													<iconify-icon icon="mdi:delete" style="color: black;" width=${Misc.IconifySize('23')} height=${Misc.IconifySize('23')}></iconify-icon>
												</button>
											`
										} else {
											return nothing
										}
									})()}
								</div>
							</div>
						`)
						return tabs.length > 0 ? tabs : nothing
					})()}
				</header>
			</drop-down>
		`
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'calendar-time': Component
	}
}
