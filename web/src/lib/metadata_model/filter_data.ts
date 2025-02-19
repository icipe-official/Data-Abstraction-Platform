import Json from '../json'
import MetadataModel from '.'

export function FilterData(queryConditions: any[], data: any[]): number[] {
	if (!Array.isArray(data)) {
		throw [FilterData.name, 'argument data is not an valid.']
	}

	if (!Array.isArray(queryConditions)) {
		throw [FilterData.name, 'argument queryConditions is not an valid.']
	}

	let filterExcludeDataIndexes = new Set<number>()

	for (let dIndex = 0; dIndex < data.length; dIndex++) {
		let filterExcludeDatum = false

		for (const queryCondition of queryConditions) {
			if (typeof queryCondition !== 'object' || Array.isArray(queryCondition)) {
				throw [FilterData.name, 'queryCondition is not an valid.', queryCondition]
			}

			for (const fgKey of Object.keys(queryCondition)) {
				if (fgKey === '$') {
					continue
				}

				const fgQueryCondtion: MetadataModel.IQueryCondition = queryCondition[fgKey]
				if (typeof fgQueryCondtion !== 'object' || Array.isArray(fgQueryCondtion)) {
					throw [FilterData.name, 'fgQueryCondtion is not an valid.', fgQueryCondtion]
				}

				const fgFilterConditions = fgQueryCondtion[MetadataModel.QcProperties.FG_FILTER_CONDITION]
				if (typeof fgFilterConditions !== 'object' || !Array.isArray(fgFilterConditions)) {
					throw [FilterData.name, 'fgQueryCondtion is not an valid.', fgFilterConditions]
				}

				for (let orIndex = 0; orIndex < fgFilterConditions.length; orIndex++) {
					const orFilterConditions = fgFilterConditions[orIndex]
					if (typeof orFilterConditions !== 'object' || !Array.isArray(orFilterConditions)) {
						throw [FilterData.name, 'fgQueryCondtion is not an valid.', orFilterConditions]
					}

					let andFilterConditionsStatus: boolean[] = []
					for (let andIndex = 0; andIndex < orFilterConditions.length; andIndex++) {
						const andCondition = orFilterConditions[andIndex]
						if (typeof andCondition !== 'object' || Array.isArray(andCondition)) {
							throw [FilterData.name, 'andCondition is not an valid.', andCondition]
						}
						if (typeof andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] !== 'string') {
							throw [FilterData.name, 'andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] is not an valid.', andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION]]
						}

						let andConditionTrue = false

						const filterNegate = andCondition[MetadataModel.FConditionProperties.FILTER_NEGATE] || false
						const filterValue = andCondition[MetadataModel.FConditionProperties.FILTER_VALUE]
						let loopSuccessful = Json.ForEachValueInObject(data[dIndex], fgKey, (_, valueFound) => {
							switch (andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] as MetadataModel.FilterCondition) {
								case MetadataModel.FilterCondition.NO_OF_ENTRIES_GREATER_THAN:
								case MetadataModel.FilterCondition.NO_OF_ENTRIES_LESS_THAN:
								case MetadataModel.FilterCondition.NO_OF_ENTRIES_EQUAL_TO:
									if (typeof filterValue !== 'number') {
										throw [FilterData.name, 'filterValue is not an valid.', filterValue]
									}

									if (Array.isArray(valueFound)) {
										let conditionTrue = false
										switch (andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] as MetadataModel.FilterCondition) {
											case MetadataModel.FilterCondition.NO_OF_ENTRIES_GREATER_THAN:
												conditionTrue = valueFound.length > filterValue
												break
											case MetadataModel.FilterCondition.NO_OF_ENTRIES_LESS_THAN:
												conditionTrue = valueFound.length < filterValue
												break
											case MetadataModel.FilterCondition.NO_OF_ENTRIES_EQUAL_TO:
												conditionTrue = valueFound.length == filterValue
												break
										}
										if (conditionTrue) {
											if (filterNegate) {
												return true
											}
											andConditionTrue = true
											return true
										}
									}

									break
								case MetadataModel.FilterCondition.NUMBER_GREATER_THAN:
								case MetadataModel.FilterCondition.NUMBER_LESS_THAN:
									if (typeof filterValue !== 'number') {
										throw [FilterData.name, 'filterValue is not an valid.', filterValue]
									}

									if (Array.isArray(valueFound)) {
										let conditionTrue = false

										for (const valueF of valueFound) {
											if (typeof valueF === 'number') {
												if (compareNumericCondition(andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] as MetadataModel.FilterCondition, valueF, filterValue)) {
													conditionTrue = true
													break
												}
											}
										}
										if (conditionTrue) {
											if (filterNegate) {
												return true
											}
											andConditionTrue = true
											return true
										}
									} else {
										if (typeof valueFound === 'number') {
											if (compareNumericCondition(andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] as MetadataModel.FilterCondition, valueFound, filterValue)) {
												if (filterNegate) {
													return true
												}
												andConditionTrue = true
												return true
											}
										}
									}
									break
								case MetadataModel.FilterCondition.TIMESTAMP_GREATER_THAN:
								case MetadataModel.FilterCondition.TIMESTAMP_LESS_THAN:
									if (typeof filterValue !== 'string') {
										throw [FilterData.name, 'filterValue is not an valid.', filterValue]
									}

									try {
										if (Array.isArray(valueFound)) {
											let conditionTrue = false

											for (const valueF of valueFound) {
												if (compareTimestampCondition(andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] as MetadataModel.FilterCondition, valueF, filterValue)) {
													conditionTrue = true
													break
												}
											}
											if (conditionTrue) {
												if (filterNegate) {
													return true
												}
												andConditionTrue = true
												return true
											}
										} else {
											if (compareTimestampCondition(andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] as MetadataModel.FilterCondition, valueFound, filterValue)) {
												if (filterNegate) {
													return true
												}
												andConditionTrue = true
												return true
											}
										}
									} catch (e) {
										throw e
									}
									break
								case MetadataModel.FilterCondition.TEXT_BEGINS_WITH:
								case MetadataModel.FilterCondition.TEXT_CONTAINS:
								case MetadataModel.FilterCondition.TEXT_ENDS_WITH:
									if (typeof filterValue !== 'string') {
										throw [FilterData.name, 'filterValue is not an valid.', filterValue]
									}
									if (Array.isArray(valueFound)) {
										let conditionTrue = false

										for (const valueF of valueFound) {
											if (typeof valueF === 'string') {
												if (compareTextCondition(andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] as MetadataModel.FilterCondition, valueF, filterValue)) {
													conditionTrue = true
													break
												}
											}
										}
										if (conditionTrue) {
											if (filterNegate) {
												return true
											}
											andConditionTrue = true
											return true
										}
									} else {
										if (typeof valueFound === 'string') {
											if (compareTextCondition(andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] as MetadataModel.FilterCondition, valueFound, filterValue)) {
												if (filterNegate) {
													return true
												}
												andConditionTrue = true
												return true
											}
										}
									}
							}

							if (filterNegate) {
								andConditionTrue = true
								return true
							}

							return false
						})

						if (!loopSuccessful && filterNegate) {
							andConditionTrue = true
						}
					}
				}
			}
		}

		if (filterExcludeDatum) {
			filterExcludeDataIndexes.add(dIndex)
		}
	}

	return Array.from(filterExcludeDataIndexes)
}

function compareTimestampCondition(filterCondtion: MetadataModel.FilterCondition, valueFound: any, filterValue: any) {
	try {
		const filterValueDate = new Date(filterValue)
		const valueFoundDate = new Date(valueFound)

		switch (filterCondtion) {
			case MetadataModel.FilterCondition.TIMESTAMP_GREATER_THAN:
				return valueFound > filterValue
			case MetadataModel.FilterCondition.TIMESTAMP_LESS_THAN:
				return valueFound < filterValue
			case MetadataModel.FilterCondition.EQUAL_TO:
				return valueFound === filterValue
		}
	} catch (e) {
		throw [compareTimestampCondition.name, e]
	}
}

function compareTextCondition(filterCondtion: MetadataModel.FilterCondition, valueFound: string, filterValue: string) {
	switch (filterCondtion) {
		case MetadataModel.FilterCondition.TEXT_BEGINS_WITH:
			return valueFound.startsWith(filterValue)
		case MetadataModel.FilterCondition.TEXT_CONTAINS:
			return valueFound.includes(filterValue)
		case MetadataModel.FilterCondition.TEXT_ENDS_WITH:
			return valueFound.endsWith(filterValue)
	}
}

function compareNumericCondition(filterCondtion: MetadataModel.FilterCondition, valueFound: number, filterValue: number) {
	switch (filterCondtion) {
		case MetadataModel.FilterCondition.NUMBER_GREATER_THAN:
			return valueFound > filterValue
		case MetadataModel.FilterCondition.NUMBER_LESS_THAN:
			return valueFound < filterValue
	}
}

switch (fieldFilterCondition.$FG_PROPERTY[FgProperties.FIELD_DATETIME_FORMAT]) {
	case FieldDateTimeFormat.YYYYMMDDHHMM:
		if (vfAsDate.getFullYear() > filterValue.getFullYear()) {
			conditionTrue = true
			break
		}
		if (vfAsDate.getFullYear() === filterValue.getFullYear()) {
			if (vfAsDate.getMonth() > filterValue.getMonth()) {
				conditionTrue = true
				break
			}
			if (vfAsDate.getMonth() === filterValue.getMonth()) {
				if (vfAsDate.getDate() > filterValue.getDate()) {
					conditionTrue = true
					break
				}
				if (vfAsDate.getDate() === filterValue.getDate()) {
					if (vfAsDate.getHours() > filterValue.getHours()) {
						conditionTrue = true
						break
					}
					if (vfAsDate.getHours() === filterValue.getHours()) {
						if (vfAsDate.getMinutes() > filterValue.getMinutes()) {
							conditionTrue = true
						}
					}
				}
			}
		}
		break
	case FieldDateTimeFormat.YYYYMMDD:
		if (vfAsDate.getFullYear() === filterValue.getFullYear()) {
			if (vfAsDate.getMonth() > filterValue.getMonth()) {
				conditionTrue = true
				break
			}
			if (vfAsDate.getMonth() === filterValue.getMonth()) {
				if (vfAsDate.getDate() > filterValue.getDate()) {
					conditionTrue = true
					break
				}
			}
		}
		break
	case FieldDateTimeFormat.YYYYMM:
		if (vfAsDate.getFullYear() === filterValue.getFullYear()) {
			if (vfAsDate.getMonth() > filterValue.getMonth()) {
				conditionTrue = true
				break
			}
			if (vfAsDate.getMonth() === filterValue.getMonth()) {
				conditionTrue = true
				break
			}
		}
		break
	case FieldDateTimeFormat.HHMM:
		if (vfAsDate.getHours() > filterValue.getHours()) {
			conditionTrue = true
			break
		}
		if (vfAsDate.getHours() === filterValue.getHours()) {
			if (vfAsDate.getMinutes() > filterValue.getMinutes()) {
				conditionTrue = true
			}
		}
		break
	case FieldDateTimeFormat.YYYY:
		if (vfAsDate.getFullYear() > filterValue.getFullYear()) {
			conditionTrue = true
		}
		break
	case FieldDateTimeFormat.MM:
		if (vfAsDate.getMonth() > filterValue.getMonth()) {
			conditionTrue = true
		}
		break
}