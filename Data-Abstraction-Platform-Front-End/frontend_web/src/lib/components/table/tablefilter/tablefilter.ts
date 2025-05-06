import { FILTER_TYPE_EXTRACT, NOT_REGEX_EXTRACT, OPT_SPLIT, Shared, VALUE_EXTRACT } from '$lib/constants'
import { ForEachValueInObject } from '$lib/utils'

export function BeginFiltering(data: any[], filterOptions: any) {
	let dataToRetain: number[] = []

	function executeAndCondition(value: any, condition: string[]): boolean {
		let isAndConditionTrue = false
		for (let c of condition) {
			const columnType = c.split(' ')[0]
			const filterTypeExtract = FILTER_TYPE_EXTRACT.exec(c)
			const valueExtract = VALUE_EXTRACT.exec(c)
			const notExtract = NOT_REGEX_EXTRACT.exec(c)
			if (filterTypeExtract && valueExtract) {
				switch (columnType) {
					case 'unique':
						if (filterTypeExtract[1] === Shared.MultiSelectFilterType.CONTAINING) {
							if (typeof value === 'object' && !Array.isArray(value)) {
								let valueContains = valueExtract[1].split(OPT_SPLIT)
								let valueFound = false
								for (let key of Object.keys(value)) {
									if (valueContains.includes(key)) {
										valueFound = true
										isAndConditionTrue = notExtract !== null ? false : true
										break
									}
								}
								if (!valueFound && notExtract !== null) {
									isAndConditionTrue = true
								}
							} else {
								isAndConditionTrue = notExtract !== null ? true : false
							}
						}
						break
					case 'repetitive':
						switch (filterTypeExtract[1]) {
							case Shared.MultiSelectFilterType.CONTAINING:
								if (typeof value === 'object' && Array.isArray(value)) {
									for (let v of value) {
										let valueContains = valueExtract[1].split(OPT_SPLIT)
										let valueFound = false
										for (let key of Object.keys(v)) {
											if (valueContains.includes(key)) {
												valueFound = true
												isAndConditionTrue = notExtract !== null ? false : true
												break
											}
										}
										if (valueFound) {
											break
										}
										if (!valueFound && notExtract !== null) {
											isAndConditionTrue = true
											break
										}
									}
								} else {
									isAndConditionTrue = notExtract !== null ? true : false
								}
								break
							case Shared.NumberFilterType.GREATER_THAN:
							case Shared.NumberFilterType.LESS_THAN:
							case Shared.NumberFilterType.EQUAL_TO:
								if (typeof value === 'object' && Array.isArray(value)) {
									const valueLengthGreaterLessEqual =
										filterTypeExtract[1] === Shared.NumberFilterType.GREATER_THAN ? value.length > Number(valueExtract[1]) : filterTypeExtract[1] === Shared.NumberFilterType.LESS_THAN ? value.length < Number(valueExtract[1]) : value.length === Number(valueExtract[1])
									isAndConditionTrue = notExtract !== null ? !valueLengthGreaterLessEqual : valueLengthGreaterLessEqual
								}
								break
							default:
								break
						}
						break
					case 'number':
						switch (filterTypeExtract[1]) {
							case Shared.NumberFilterType.GREATER_THAN:
							case Shared.NumberFilterType.LESS_THAN:
							case Shared.NumberFilterType.EQUAL_TO:
								if (typeof value === 'number') {
									const valueLengthGreaterLessEqual = filterTypeExtract[1] === Shared.NumberFilterType.GREATER_THAN ? value > Number(valueExtract[1]) : filterTypeExtract[1] === Shared.NumberFilterType.LESS_THAN ? value < Number(valueExtract[1]) : value === Number(valueExtract[1])
									isAndConditionTrue = notExtract !== null ? !valueLengthGreaterLessEqual : valueLengthGreaterLessEqual
								}
								break
							case Shared.MultiSelectFilterType.CONTAINING:
								let valueContains = valueExtract[1].split(OPT_SPLIT)
								if (typeof value === 'number' || Array.isArray(value)) {
									let doesValueContain = false
									if (Array.isArray(value)) {
										for (let v of value) {
											if (valueContains.includes(v.toString())) {
												doesValueContain = true
												break
											}
										}
									} else {
										doesValueContain = valueContains.includes(value.toString())
									}
									isAndConditionTrue = notExtract !== null ? !doesValueContain : doesValueContain
								}
								break
							default:
								break
						}
						break
					case 'text':
						switch (filterTypeExtract[1]) {
							case Shared.TextFilterType.BEGINNING_WITH:
							case Shared.TextFilterType.ENDING_WITH:
							case Shared.TextFilterType.CONTAINING:
								if (typeof value === 'string') {
									const valueLengthGreaterLessEqual =
										filterTypeExtract[1] === Shared.TextFilterType.BEGINNING_WITH
											? new RegExp('^' + valueExtract[1].toLocaleLowerCase()).test(value.toLocaleLowerCase())
											: filterTypeExtract[1] === Shared.TextFilterType.ENDING_WITH
											? new RegExp(valueExtract[1] + '$').test(value.toLocaleLowerCase())
											: filterTypeExtract[1] === Shared.TextFilterType.CONTAINING
											? new RegExp(valueExtract[1]).test(value.toLocaleLowerCase())
											: valueExtract[1].toLocaleLowerCase() === value.toLocaleLowerCase()
									isAndConditionTrue = notExtract !== null ? !valueLengthGreaterLessEqual : valueLengthGreaterLessEqual
								}
								break
							case Shared.MultiSelectFilterType.CONTAINING:
								let valueContains = valueExtract[1].split(OPT_SPLIT)
								if (typeof value === 'string' || Array.isArray(value)) {
									let doesValueContain = false
									if (Array.isArray(value)) {
										for (let v of value) {
											if (valueContains.includes(v)) {
												doesValueContain = true
												break
											}
										}
									} else {
										doesValueContain = valueContains.includes(value)
									}
									isAndConditionTrue = notExtract !== null ? !doesValueContain : doesValueContain
								}
								break
							default:
								break
						}
						break
				}
			}
			if (!isAndConditionTrue) {
				return isAndConditionTrue
			}
		}
		return isAndConditionTrue
	}

	data.forEach((dataValue, index) => {
		let isRetainRow = true
		// filterOptions executed as and
		for (let key of Object.keys(filterOptions)) {
			let isFilterOptionTrue = false
			ForEachValueInObject(dataValue, key.replace('root.', '').replaceAll('.value', '').replaceAll('[x]', ''), (_, value) => {
				for (let andFo of filterOptions[key] as string[][]) {
					if (executeAndCondition(value, andFo)) {
						isFilterOptionTrue = true
						return true
					}
				}
				return false
			})
			if (!isFilterOptionTrue) {
				isRetainRow = false
				break
			}
		}
		if (isRetainRow) {
			dataToRetain = [...dataToRetain, index]
		}
	})

	return dataToRetain
}
