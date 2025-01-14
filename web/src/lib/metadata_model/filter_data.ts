import Json from '../json'
import { QueryConditions, MetadataModelErrorCode, MetadataModelError, IQueryCondition, FgProperties, FieldType, FilterCondition, FieldDateTimeFormat } from './metadata_model'

export function FilterData(queryCondition: QueryConditions, data: any[]) {
	if (!Array.isArray(data)) {
		throw {
			Code: MetadataModelErrorCode.ErrArgumentsInvalid,
			Message: 'argument data is not an valid.'
		} as MetadataModelError
	}

	if (Array.isArray(queryCondition) || typeof queryCondition !== 'object') {
		throw {
			Code: MetadataModelErrorCode.ErrArgumentsInvalid,
			Message: 'argument filterCondition is not an valid.'
		} as MetadataModelError
	}

	let filterIncludeIndexes = new Set<number>()

	for (let dindex = 0; dindex < data.length; dindex++) {
		let datumPassesFilter = true

		for (const keyPathToValue of Object.keys(queryCondition)) {
			if (keyPathToValue === '$') {
				continue
			}
			const fieldFilterCondition: IQueryCondition = queryCondition[keyPathToValue]
			if (!Array.isArray(fieldFilterCondition.$FG_FILTER_CONDITION) || typeof fieldFilterCondition.$FG_PROPERTY !== 'object' || Array.isArray(fieldFilterCondition.$FG_PROPERTY)) {
				throw {
					Code: MetadataModelErrorCode.ErrArgumentsInvalid,
					Message: 'argument filterCondition is not an valid.'
				} as MetadataModelError
			}
			let datumOrConditionsPassStatus: boolean[] = []
			for (let orIndex = 0; orIndex < fieldFilterCondition.$FG_FILTER_CONDITION.length; orIndex++) {
				const fieldFilterOr = fieldFilterCondition.$FG_FILTER_CONDITION[orIndex]
				if (!Array.isArray(fieldFilterOr)) {
					throw {
						Code: MetadataModelErrorCode.ErrArgumentsInvalid,
						Message: 'argument filterCondition is not an valid.'
					} as MetadataModelError
				}
				let datumAndConditionsPassStatus: boolean[] = []
				for (let andIndex = 0; andIndex < fieldFilterOr.length; andIndex++) {
					const filterAnd = fieldFilterOr[andIndex]
					if (typeof filterAnd !== 'object' || Array.isArray(filterAnd)) {
						throw {
							Code: MetadataModelErrorCode.ErrArgumentsInvalid,
							Message: 'argument filterCondition is not an valid.'
						} as MetadataModelError
					}
					let filterValue = filterAnd.$FILTER_VALUE
					if (fieldFilterCondition.$FG_PROPERTY[FgProperties.FIELD_DATATYPE] === FieldType.TIMESTAMP) {
						filterValue = new Date(filterValue)
					}
					const filterNegate = filterAnd[_FilterKey.NEGATE]
					let datumPassesAndCondition = false
					switch (filterAnd[_FilterKey.CONDITION]) {
						case FilterCondition.GROUP_CONTAINING_FIELDS:
							if (!Array.isArray(filterValue)) {
								throw {
									Code: MetadataModelErrorCode.ErrArgumentsInvalid,
									Message: 'argument filterCondition is not an valid.'
								} as MetadataModelError
							}
							try {
								let valueFoundProcessed = false
								Json.ForEachValueInObject(data[dindex], keyPathToValue, (_, valueFound) => {
									valueFoundProcessed = true
									if (Array.isArray(valueFound) && valueFound.length > 0) {
										for (const vf of valueFound) {
											if (typeof vf !== 'object' || Array.isArray(vf)) {
												if (filterNegate) {
													datumPassesAndCondition = true
												}
												return true
											}
											let conditionTrue = false
											for (const vfkey of Object.keys(vf)) {
												if (filterValue.includes(vfkey)) {
													conditionTrue = true
													break
												}
											}
											if ((conditionTrue && !filterNegate) || (!conditionTrue && filterNegate)) {
												datumPassesAndCondition = true
												return true
											}
										}
									} else {
										if (filterNegate) {
											datumPassesAndCondition = true
											return true
										}
									}
									return false
								})
								if (!valueFoundProcessed && filterNegate) {
									datumPassesAndCondition = true
								}
							} catch (e) {
								throw e
							}
							break
						case FilterCondition.FIELD_CONTAINING_VALUE:
							if (!Array.isArray(filterValue)) {
								throw {
									Code: MetadataModelErrorCode.ErrArgumentsInvalid,
									Message: 'argument filterCondition is not an valid.'
								} as MetadataModelError
							}
							try {
								let valueFoundProcessed = false
								Json.ForEachValueInObject(data[dindex], keyPathToValue, (_, valueFound) => {
									valueFoundProcessed = true
									if (Array.isArray(valueFound) && valueFound.length > 0) {
										let conditionTrue = false
										for (const vf of valueFound) {
											if (filterValue.includes(vf)) {
												conditionTrue = true
												break
											}
										}
										if ((conditionTrue && !filterNegate) || (!conditionTrue && filterNegate)) {
											datumPassesAndCondition = true
											return true
										}
									} else {
										if (filterNegate) {
											datumPassesAndCondition = true
											return true
										}
									}
									return false
								})
								if (!valueFoundProcessed && filterNegate) {
									datumPassesAndCondition = true
								}
							} catch (e) {
								throw e
							}
							break
						case FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_GREATER_THAN:
							if (typeof filterValue !== 'number') {
								throw {
									Code: MetadataModelErrorCode.ErrArgumentsInvalid,
									Message: 'argument filterCondition is not an valid.'
								} as MetadataModelError
							}
							try {
								let valueFoundProcessed = false
								Json.ForEachValueInObject(data[dindex], keyPathToValue, (_, valueFound) => {
									valueFoundProcessed = true
									if (Array.isArray(valueFound)) {
										let conditionTrue = false
										if (valueFound.length > filterValue) {
											conditionTrue = true
										}
										if ((conditionTrue && !filterNegate) || (!conditionTrue && filterNegate)) {
											datumPassesAndCondition = true
											return true
										}
									} else {
										if (filterNegate) {
											datumPassesAndCondition = true
											return true
										}
									}
									return false
								})
								if (!valueFoundProcessed && filterNegate) {
									datumPassesAndCondition = true
								}
							} catch (e) {
								throw e
							}
							break
						case FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_LESS_THAN:
							if (typeof filterValue !== 'number') {
								throw {
									Code: MetadataModelErrorCode.ErrArgumentsInvalid,
									Message: 'argument filterCondition is not an valid.'
								} as MetadataModelError
							}
							try {
								let valueFoundProcessed = false
								Json.ForEachValueInObject(data[dindex], keyPathToValue, (_, valueFound) => {
									valueFoundProcessed = true
									if (Array.isArray(valueFound)) {
										let conditionTrue = false
										if (valueFound.length < filterValue) {
											conditionTrue = true
										}
										if ((conditionTrue && !filterNegate) || (!conditionTrue && filterNegate)) {
											datumPassesAndCondition = true
											return true
										}
									} else {
										if (filterNegate) {
											datumPassesAndCondition = true
											return true
										}
									}
									return false
								})
								if (!valueFoundProcessed && filterNegate) {
									datumPassesAndCondition = true
								}
							} catch (e) {
								throw e
							}
							break
						case FilterCondition.FIELD_GROUP_NO_OF_ENTRIES_EQUAL_TO:
							if (typeof filterValue !== 'number') {
								throw {
									Code: MetadataModelErrorCode.ErrArgumentsInvalid,
									Message: 'argument filterCondition is not an valid.'
								} as MetadataModelError
							}
							try {
								let valueFoundProcessed = false
								Json.ForEachValueInObject(data[dindex], keyPathToValue, (_, valueFound) => {
									valueFoundProcessed = true
									if (Array.isArray(valueFound)) {
										let conditionTrue = false
										if (valueFound.length == filterValue) {
											conditionTrue = true
										}
										if ((conditionTrue && !filterNegate) || (!conditionTrue && filterNegate)) {
											datumPassesAndCondition = true
											return true
										}
									} else {
										if (filterNegate) {
											datumPassesAndCondition = true
											return true
										}
									}
									return false
								})
								if (!valueFoundProcessed && filterNegate) {
									datumPassesAndCondition = true
								}
							} catch (e) {
								throw e
							}
							break
						case FilterCondition.FIELD_FULL_TEXT_SEARCH:
						case FilterCondition.FIELD_TEXT_CONTAINS:
							if (typeof filterValue !== 'string') {
								throw {
									Code: MetadataModelErrorCode.ErrArgumentsInvalid,
									Message: 'argument filterCondition is not an valid.'
								} as MetadataModelError
							}
							try {
								let valueFoundProcessed = false
								Json.ForEachValueInObject(data[dindex], keyPathToValue, (_, valueFound) => {
									valueFoundProcessed = true
									if (Array.isArray(valueFound) && valueFound.length > 0) {
										let conditionTrue = false
										for (const vf of valueFound) {
											if (typeof vf === 'string' && vf.includes(filterValue)) {
												conditionTrue = true
												break
											}
										}
										if ((conditionTrue && !filterNegate) || (!conditionTrue && filterNegate)) {
											datumPassesAndCondition = true
											return true
										}
									} else {
										if (filterNegate) {
											datumPassesAndCondition = true
											return true
										}
									}
									return false
								})
								if (!valueFoundProcessed && filterNegate) {
									datumPassesAndCondition = true
								}
							} catch (e) {
								throw e
							}
							break
						case FilterCondition.FIELD_GREATER_THAN:
							if (!(filterValue instanceof Date)) {
								if (typeof filterValue !== 'number') {
									throw {
										Code: MetadataModelErrorCode.ErrArgumentsInvalid,
										Message: 'argument filterCondition is not an valid.'
									} as MetadataModelError
								}
							}
							try {
								let valueFoundProcessed = false
								Json.ForEachValueInObject(data[dindex], keyPathToValue, (_, valueFound) => {
									valueFoundProcessed = true
									if (Array.isArray(valueFound) && valueFound.length > 0) {
										let conditionTrue = false
										for (const vf of valueFound) {
											if (filterValue instanceof Date) {
												const vfAsDate = new Date(vf)
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
												if (conditionTrue) {
													break
												}
											} else {
												if (typeof vf === 'number' && vf > filterValue) {
													conditionTrue = true
													break
												}
											}
										}
										if ((conditionTrue && !filterNegate) || (!conditionTrue && filterNegate)) {
											datumPassesAndCondition = true
											return true
										}
									} else {
										if (filterNegate) {
											datumPassesAndCondition = true
											return true
										}
									}
									return false
								})
								if (!valueFoundProcessed && filterNegate) {
									datumPassesAndCondition = true
								}
							} catch (e) {
								throw e
							}
							break
						case FilterCondition.FIELD_LESS_THAN:
							if (!(filterValue instanceof Date)) {
								if (typeof filterValue !== 'number') {
									throw {
										Code: MetadataModelErrorCode.ErrArgumentsInvalid,
										Message: 'argument filterCondition is not an valid.'
									} as MetadataModelError
								}
							}
							try {
								let valueFoundProcessed = false
								Json.ForEachValueInObject(data[dindex], keyPathToValue, (_, valueFound) => {
									valueFoundProcessed = true
									if (Array.isArray(valueFound) && valueFound.length > 0) {
										let conditionTrue = false
										for (const vf of valueFound) {
											if (filterValue instanceof Date) {
												const vfAsDate = new Date(vf)
												switch (fieldFilterCondition.$FG_PROPERTY[FgProperties.FIELD_DATETIME_FORMAT]) {
													case FieldDateTimeFormat.YYYYMMDDHHMM:
														if (vfAsDate.getFullYear() < filterValue.getFullYear()) {
															conditionTrue = true
															break
														}
														if (vfAsDate.getFullYear() === filterValue.getFullYear()) {
															if (vfAsDate.getMonth() < filterValue.getMonth()) {
																conditionTrue = true
																break
															}
															if (vfAsDate.getMonth() === filterValue.getMonth()) {
																if (vfAsDate.getDate() < filterValue.getDate()) {
																	conditionTrue = true
																	break
																}
																if (vfAsDate.getDate() === filterValue.getDate()) {
																	if (vfAsDate.getHours() < filterValue.getHours()) {
																		conditionTrue = true
																		break
																	}
																	if (vfAsDate.getHours() === filterValue.getHours()) {
																		if (vfAsDate.getMinutes() < filterValue.getMinutes()) {
																			conditionTrue = true
																		}
																	}
																}
															}
														}
														break
													case FieldDateTimeFormat.YYYYMMDD:
														if (vfAsDate.getFullYear() === filterValue.getFullYear()) {
															if (vfAsDate.getMonth() < filterValue.getMonth()) {
																conditionTrue = true
																break
															}
															if (vfAsDate.getMonth() === filterValue.getMonth()) {
																if (vfAsDate.getDate() < filterValue.getDate()) {
																	conditionTrue = true
																	break
																}
															}
														}
														break
													case FieldDateTimeFormat.YYYYMM:
														if (vfAsDate.getFullYear() === filterValue.getFullYear()) {
															if (vfAsDate.getMonth() < filterValue.getMonth()) {
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
														if (vfAsDate.getHours() < filterValue.getHours()) {
															conditionTrue = true
															break
														}
														if (vfAsDate.getHours() === filterValue.getHours()) {
															if (vfAsDate.getMinutes() < filterValue.getMinutes()) {
																conditionTrue = true
															}
														}
														break
													case FieldDateTimeFormat.YYYY:
														if (vfAsDate.getFullYear() < filterValue.getFullYear()) {
															conditionTrue = true
														}
														break
													case FieldDateTimeFormat.MM:
														if (vfAsDate.getMonth() < filterValue.getMonth()) {
															conditionTrue = true
														}
														break
												}
												if (conditionTrue) {
													break
												}
											} else {
												if (typeof vf === 'number' && vf < filterValue) {
													conditionTrue = true
													break
												}
											}
										}
										if ((conditionTrue && !filterNegate) || (!conditionTrue && filterNegate)) {
											datumPassesAndCondition = true
											return true
										}
									} else {
										if (filterNegate) {
											datumPassesAndCondition = true
											return true
										}
									}
									return false
								})
								if (!valueFoundProcessed && filterNegate) {
									datumPassesAndCondition = true
								}
							} catch (e) {
								throw e
							}
							break
						case FilterCondition.FIELD_EQUAL_TO:
							if (!(filterValue instanceof Date)) {
								if (typeof filterValue !== 'number' && typeof filterValue !== 'string') {
									throw {
										Code: MetadataModelErrorCode.ErrArgumentsInvalid,
										Message: 'argument filterCondition is not an valid.'
									} as MetadataModelError
								}
							}
							try {
								let valueFoundProcessed = false
								Json.ForEachValueInObject(data[dindex], keyPathToValue, (_, valueFound) => {
									valueFoundProcessed = true
									if (Array.isArray(valueFound) && valueFound.length > 0) {
										let conditionTrue = false
										for (const vf of valueFound) {
											if (filterValue instanceof Date && typeof fieldFilterCondition.$FG_PROPERTY[FgProperties.FIELD_DATETIME_FORMAT] === 'string') {
												const vfAsDate = new Date(vf)
												switch (fieldFilterCondition.$FG_PROPERTY[FgProperties.FIELD_DATETIME_FORMAT]) {
													case FieldDateTimeFormat.YYYYMMDDHHMM:
														if (vfAsDate.getFullYear() === filterValue.getFullYear()) {
															if (vfAsDate.getMonth() === filterValue.getMonth()) {
																if (vfAsDate.getDate() === filterValue.getDate()) {
																	if (vfAsDate.getHours() === filterValue.getHours()) {
																		if (vfAsDate.getMinutes() === filterValue.getMinutes()) {
																			conditionTrue = true
																		}
																	}
																}
															}
														}
														break
													case FieldDateTimeFormat.YYYYMMDD:
														if (vfAsDate.getFullYear() === filterValue.getFullYear()) {
															if (vfAsDate.getMonth() === filterValue.getMonth()) {
																if (vfAsDate.getDate() === filterValue.getDate()) {
																	conditionTrue = true
																}
															}
														}
														break
													case FieldDateTimeFormat.YYYYMM:
														if (vfAsDate.getFullYear() === filterValue.getFullYear()) {
															if (vfAsDate.getMonth() === filterValue.getMonth()) {
																conditionTrue = true
															}
														}
														break
													case FieldDateTimeFormat.HHMM:
														if (vfAsDate.getHours() === filterValue.getHours()) {
															if (vfAsDate.getMinutes() === filterValue.getMinutes()) {
																conditionTrue = true
															}
														}
														break
													case FieldDateTimeFormat.YYYY:
														if (vfAsDate.getFullYear() === filterValue.getFullYear()) {
															conditionTrue = true
														}
														break
													case FieldDateTimeFormat.MM:
														if (vfAsDate.getMonth() === filterValue.getMonth()) {
															conditionTrue = true
														}
														break
												}
												if (conditionTrue) {
													break
												}
											} else {
												if ((typeof vf === 'number' || typeof vf === 'string') && vf === filterValue) {
													conditionTrue = true
													break
												}
											}
										}
										if ((conditionTrue && !filterNegate) || (!conditionTrue && filterNegate)) {
											datumPassesAndCondition = true
											return true
										}
									} else {
										if (filterNegate) {
											datumPassesAndCondition = true
											return true
										}
									}
									return false
								})
								if (!valueFoundProcessed && filterNegate) {
									datumPassesAndCondition = true
								}
							} catch (e) {
								throw e
							}
							break
						case FilterCondition.FIELD_TEXT_BEGINS_WITH:
							if (typeof filterValue !== 'string') {
								throw {
									Code: MetadataModelErrorCode.ErrArgumentsInvalid,
									Message: 'argument filterCondition is not an valid.'
								} as MetadataModelError
							}
							try {
								let valueFoundProcessed = false
								Json.ForEachValueInObject(data[dindex], keyPathToValue, (_, valueFound) => {
									valueFoundProcessed = true
									if (Array.isArray(valueFound) && valueFound.length > 0) {
										let conditionTrue = false
										for (const vf of valueFound) {
											if (typeof vf === 'string' && vf.startsWith(filterValue)) {
												conditionTrue = true
												break
											}
										}
										if ((conditionTrue && !filterNegate) || (!conditionTrue && filterNegate)) {
											datumPassesAndCondition = true
											return true
										}
									} else {
										if (filterNegate) {
											datumPassesAndCondition = true
											return true
										}
									}
									return false
								})
								if (!valueFoundProcessed && filterNegate) {
									datumPassesAndCondition = true
								}
							} catch (e) {
								throw e
							}
							break
						case FilterCondition.FIELD_TEXT_ENDS_WITH:
							if (typeof filterValue !== 'string') {
								throw {
									Code: MetadataModelErrorCode.ErrArgumentsInvalid,
									Message: 'argument filterCondition is not an valid.'
								} as MetadataModelError
							}
							try {
								let valueFoundProcessed = false
								Json.ForEachValueInObject(data[dindex], keyPathToValue, (_, valueFound) => {
									valueFoundProcessed = true
									if (Array.isArray(valueFound) && valueFound.length > 0) {
										let conditionTrue = false
										for (const vf of valueFound) {
											if (typeof vf === 'string' && vf.endsWith(filterValue)) {
												conditionTrue = true
												break
											}
										}
										if ((conditionTrue && !filterNegate) || (!conditionTrue && filterNegate)) {
											datumPassesAndCondition = true
											return true
										}
									} else {
										if (filterNegate) {
											datumPassesAndCondition = true
											return true
										}
									}
									return false
								})
								if (!valueFoundProcessed && filterNegate) {
									datumPassesAndCondition = true
								}
							} catch (e) {
								throw e
							}
							break
					}
					datumAndConditionsPassStatus.push(datumPassesAndCondition)
				}
				datumOrConditionsPassStatus.push(!datumAndConditionsPassStatus.includes(false))
			}
			if (!datumOrConditionsPassStatus.includes(true)) {
				datumPassesFilter = false
				break
			}
		}
		if (datumPassesFilter) {
			filterIncludeIndexes.add(dindex)
		}
	}

	return Array.from(filterIncludeIndexes)
}
