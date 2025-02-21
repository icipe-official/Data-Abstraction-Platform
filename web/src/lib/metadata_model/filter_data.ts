import Json from '../json'
import MetadataModel from '.'

/**
 * Executes filter conditions against data.
 * @param queryConditions an array of query conditions containing filter conditions. Will treat each queryCondition in {@linkcode queryConditions} as 'or' condition.
 * @param data rows of data to filter through. Expected to be presented as if converted from JSON.
 * @returns an array containing indexes of {@linkcode data} that DID NOT pass the filter conditions.
 */
export function FilterData(queryConditions: MetadataModel.QueryConditions[], data: any[]): number[] {
	if (!Array.isArray(data)) {
		throw [FilterData.name, 'argument data is not an valid.']
	}

	let filterExcludeDataIndexes = new Set<number>()

	if (!Array.isArray(queryConditions)) {
		return Array.from(filterExcludeDataIndexes)
	}


	for (let dIndex = 0; dIndex < data.length; dIndex++) {
		let filterExcludeDatum = true

		for (const queryCondition of queryConditions) {
			if (typeof queryCondition !== 'object' || Array.isArray(queryCondition)) {
				throw [FilterData.name, 'queryCondition is not an valid.', queryCondition]
			}

			let queryConditionTrue = true
			for (const fgKey of Object.keys(queryCondition)) {
				const fgQueryCondtion: MetadataModel.IQueryCondition = queryCondition[fgKey]
				if (typeof fgQueryCondtion !== 'object' || Array.isArray(fgQueryCondtion)) {
					throw [FilterData.name, 'fgQueryCondtion is not an valid.', fgQueryCondtion]
				}

				const fgFilterConditions = fgQueryCondtion[MetadataModel.QcProperties.FG_FILTER_CONDITION]
				if (typeof fgFilterConditions !== 'object' || !Array.isArray(fgFilterConditions)) {
					throw [FilterData.name, 'fgQueryCondtion is not an valid.', fgFilterConditions]
				}

				let allOrConditionsFalse: boolean = true

				for (let orIndex = 0; orIndex < fgFilterConditions.length; orIndex++) {
					const orFilterConditions = fgFilterConditions[orIndex]
					if (typeof orFilterConditions !== 'object' || !Array.isArray(orFilterConditions)) {
						throw [FilterData.name, 'fgQueryCondtion is not an valid.', orFilterConditions]
					}

					let allAndConditionsTrue: boolean = true
					for (let andIndex = 0; andIndex < orFilterConditions.length; andIndex++) {
						const andCondition = orFilterConditions[andIndex]
						if (typeof andCondition !== 'object' || Array.isArray(andCondition)) {
							throw [FilterData.name, 'andCondition is not an valid.', andCondition]
						}
						if (typeof andCondition[MetadataModel.FConditionProperties.CONDITION] !== 'string') {
							throw [FilterData.name, 'andCondition[MetadataModel.FConditionProperties.FILTER_CONDITION] is not an valid.', andCondition[MetadataModel.FConditionProperties.CONDITION]]
						}

						let andConditionTrue = false

						const filterNegate = andCondition[MetadataModel.FConditionProperties.NEGATE] || false
						const filterValue = andCondition[MetadataModel.FConditionProperties.VALUE]
						let loopSuccessful = Json.ForEachValueInObject(data[dIndex], fgKey, (_, valueFound) => {
							switch (andCondition[MetadataModel.FConditionProperties.CONDITION] as MetadataModel.FilterCondition) {
								case MetadataModel.FilterCondition.NO_OF_ENTRIES_GREATER_THAN:
								case MetadataModel.FilterCondition.NO_OF_ENTRIES_LESS_THAN:
								case MetadataModel.FilterCondition.NO_OF_ENTRIES_EQUAL_TO:
									if (typeof filterValue !== 'number') {
										throw [FilterData.name, 'filterValue is not an valid.', filterValue]
									}

									if (Array.isArray(valueFound)) {
										let conditionTrue = false
										switch (andCondition[MetadataModel.FConditionProperties.CONDITION] as MetadataModel.FilterCondition) {
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
												if (isNumberConditionTrue(andCondition[MetadataModel.FConditionProperties.CONDITION] as MetadataModel.FilterCondition, valueF, filterValue)) {
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
											if (isNumberConditionTrue(andCondition[MetadataModel.FConditionProperties.CONDITION] as MetadataModel.FilterCondition, valueFound, filterValue)) {
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
												if (isTimestampConditionTrue(andCondition[MetadataModel.FConditionProperties.CONDITION] as MetadataModel.FilterCondition, andCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT], valueF, filterValue)) {
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
											if (isTimestampConditionTrue(andCondition[MetadataModel.FConditionProperties.CONDITION] as MetadataModel.FilterCondition, andCondition[MetadataModel.FConditionProperties.DATE_TIME_FORMAT], valueFound, filterValue)) {
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
												if (isTextConditionTrue(andCondition[MetadataModel.FConditionProperties.CONDITION] as MetadataModel.FilterCondition, valueF, filterValue)) {
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
											if (isTextConditionTrue(andCondition[MetadataModel.FConditionProperties.CONDITION] as MetadataModel.FilterCondition, valueFound, filterValue)) {
												if (filterNegate) {
													return true
												}
												andConditionTrue = true
												return true
											}
										}
									}
									break
								case MetadataModel.FilterCondition.EQUAL_TO:
									if (Array.isArray(valueFound)) {
										let conditionTrue = false

										for (const valueF of valueFound) {
											if (typeof valueF === 'string') {
												if (
													isEqualToConditionTrue(filterValue[MetadataModel.FSelectProperties.TYPE], filterValue[MetadataModel.FSelectProperties.DATE_TIME_FORMAT] || undefined, valueF, filterValue[MetadataModel.FSelectProperties.VALUE])
												) {
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
											if (
												isEqualToConditionTrue(filterValue[MetadataModel.FSelectProperties.TYPE], filterValue[MetadataModel.FSelectProperties.DATE_TIME_FORMAT] || undefined, valueFound, filterValue[MetadataModel.FSelectProperties.VALUE])
											) {
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

						if (!andConditionTrue) {
							allAndConditionsTrue = false
							break
						}
					}

					if (allAndConditionsTrue) {
						allOrConditionsFalse = false
						break
					}
				}

				if (allOrConditionsFalse) {
					queryConditionTrue = false
					break
				}
			}

			if (queryConditionTrue) {
				filterExcludeDatum = false
				break
			}
		}

		if (filterExcludeDatum) {
			filterExcludeDataIndexes.add(dIndex)
		}
	}

	return Array.from(filterExcludeDataIndexes)
}

function isEqualToConditionTrue(filterValueType: MetadataModel.FieldType | MetadataModel.FSelectType, dateTimeFormat: MetadataModel.FieldDateTimeFormat = MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM, valueFound: any, filterValue: any) {
	switch (filterValueType as MetadataModel.FieldType | MetadataModel.FSelectType) {
		case MetadataModel.FSelectType.SELECT:
		case MetadataModel.FieldType.TEXT:
		case MetadataModel.FieldType.NUMBER:
		case MetadataModel.FieldType.BOOLEAN:
			return valueFound === filterValue
		case MetadataModel.FieldType.TIMESTAMP:
			return isTimestampConditionTrue(MetadataModel.FilterCondition.EQUAL_TO, dateTimeFormat, valueFound, filterValue)
	}
}

function isTimestampConditionTrue(filterCondtion: MetadataModel.FilterCondition, dateTimeFormat: MetadataModel.FieldDateTimeFormat = MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM, valueFound: any, filterValue: any) {
	try {
		const filterValueDate = new Date(filterValue)
		const valueFoundDate = new Date(valueFound)

		switch (filterCondtion) {
			case MetadataModel.FilterCondition.TIMESTAMP_GREATER_THAN:
				switch (dateTimeFormat as MetadataModel.FieldDateTimeFormat) {
					case MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM:
						if (valueFoundDate.getFullYear() > filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() > filterValueDate.getMonth()) {
								return true
							}
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() > filterValueDate.getDate()) {
									return true
								}
								if (valueFoundDate.getDate() === filterValueDate.getDate()) {
									if (valueFoundDate.getHours() > filterValueDate.getHours()) {
										return true
									}
									if (valueFoundDate.getHours() === filterValueDate.getHours()) {
										if (valueFoundDate.getMinutes() > filterValueDate.getMinutes()) {
											return true
										}
									}
								}
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.YYYYMMDD:
						if (valueFoundDate.getFullYear() > filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() > filterValueDate.getMonth()) {
								return true
							}
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() > filterValueDate.getDate()) {
									return true
								}
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.YYYYMM:
						if (valueFoundDate.getFullYear() > filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() > filterValueDate.getMonth()) {
								return true
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.HHMM:
						if (valueFoundDate.getHours() > filterValueDate.getHours()) {
							return true
						}
						if (valueFoundDate.getHours() === filterValueDate.getHours()) {
							if (valueFoundDate.getMinutes() > filterValueDate.getMinutes()) {
								return true
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.YYYY:
						return valueFoundDate.getFullYear() > filterValueDate.getFullYear()
					case MetadataModel.FieldDateTimeFormat.MM:
						return valueFoundDate.getMonth() > filterValueDate.getMonth()
				}
				break
			case MetadataModel.FilterCondition.TIMESTAMP_LESS_THAN:
				switch (dateTimeFormat as MetadataModel.FieldDateTimeFormat) {
					case MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM:
						if (valueFoundDate.getFullYear() < filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() < filterValueDate.getMonth()) {
								return true
							}
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() < filterValueDate.getDate()) {
									return true
								}
								if (valueFoundDate.getDate() === filterValueDate.getDate()) {
									if (valueFoundDate.getHours() < filterValueDate.getHours()) {
										return true
									}
									if (valueFoundDate.getHours() === filterValueDate.getHours()) {
										if (valueFoundDate.getMinutes() < filterValueDate.getMinutes()) {
											return true
										}
									}
								}
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.YYYYMMDD:
						if (valueFoundDate.getFullYear() < filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() < filterValueDate.getMonth()) {
								return true
							}
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() < filterValueDate.getDate()) {
									return true
								}
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.YYYYMM:
						if (valueFoundDate.getFullYear() < filterValueDate.getFullYear()) {
							return true
						}
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() < filterValueDate.getMonth()) {
								return true
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.HHMM:
						if (valueFoundDate.getHours() < filterValueDate.getHours()) {
							return true
						}
						if (valueFoundDate.getHours() === filterValueDate.getHours()) {
							if (valueFoundDate.getMinutes() < filterValueDate.getMinutes()) {
								return true
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.YYYY:
						return valueFoundDate.getFullYear() < filterValueDate.getFullYear()
					case MetadataModel.FieldDateTimeFormat.MM:
						return valueFoundDate.getMonth() < filterValueDate.getMonth()
				}
				break
			case MetadataModel.FilterCondition.EQUAL_TO:
				switch (dateTimeFormat as MetadataModel.FieldDateTimeFormat) {
					case MetadataModel.FieldDateTimeFormat.YYYYMMDDHHMM:
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() === filterValueDate.getDate()) {
									if (valueFoundDate.getHours() === filterValueDate.getHours()) {
										if (valueFoundDate.getMinutes() === filterValueDate.getMinutes()) {
											return true
										}
									}
								}
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.YYYYMMDD:
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								if (valueFoundDate.getDate() === filterValueDate.getDate()) {
									return true
								}
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.YYYYMM:
						if (valueFoundDate.getFullYear() === filterValueDate.getFullYear()) {
							if (valueFoundDate.getMonth() === filterValueDate.getMonth()) {
								return true
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.HHMM:
						if (valueFoundDate.getHours() === filterValueDate.getHours()) {
							if (valueFoundDate.getMinutes() === filterValueDate.getMinutes()) {
								return true
							}
						}
						return false
					case MetadataModel.FieldDateTimeFormat.YYYY:
						return valueFoundDate.getFullYear() === filterValueDate.getFullYear()
					case MetadataModel.FieldDateTimeFormat.MM:
						return valueFoundDate.getMonth() === filterValueDate.getMonth()
				}
				break
		}
		return false
	} catch (e) {
		throw [isTimestampConditionTrue.name, e]
	}
}

function isTextConditionTrue(filterCondtion: MetadataModel.FilterCondition, valueFound: string, filterValue: string) {
	switch (filterCondtion) {
		case MetadataModel.FilterCondition.TEXT_BEGINS_WITH:
			return valueFound.startsWith(filterValue)
		case MetadataModel.FilterCondition.TEXT_CONTAINS:
			return valueFound.includes(filterValue)
		case MetadataModel.FilterCondition.TEXT_ENDS_WITH:
			return valueFound.endsWith(filterValue)
	}

	return false
}

function isNumberConditionTrue(filterCondtion: MetadataModel.FilterCondition, valueFound: number, filterValue: number) {
	switch (filterCondtion) {
		case MetadataModel.FilterCondition.NUMBER_GREATER_THAN:
			return valueFound > filterValue
		case MetadataModel.FilterCondition.NUMBER_LESS_THAN:
			return valueFound < filterValue
	}

	return false
}
