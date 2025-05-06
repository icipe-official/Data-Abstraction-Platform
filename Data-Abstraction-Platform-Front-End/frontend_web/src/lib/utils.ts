import { PUBLIC_LOG_LEVEL } from '$env/static/public'
import { get } from 'svelte/store'
import { DISABLED_REGEX_SEARCH, MAX_EXTRACT, NAME_REGEX_SEARCH, RENDER_HORIZONTALLY_EXTRACT, Shared } from './constants'
import { 
	CurrentProject,
	AbstractionsSearchResults,
	AbstractionEditorsSearchResults,
	AbstractionCurrentTemplate,
	AbstractionsSearchCurrentAbstractor,
	AbstractionsSearchCreatedOnGreaterThan,
	AbstractionsSearchCreatedOnLessThan,
	AbstractionsSearchLastUpdatedOnGreaterThan,
	AbstractionsSearchLastUpdatedOnLessThan,
	AbststractionsSearchIsVerified,
	AbstractionsSearchLimit,
	AbstractionsSearchOffset,
	AbstractionsSearchSortBy,
	AbstractionsSearchSortByOrder,
	AbstractionsSearchCreatedFilterOptions,
	FilesSearchResults,
	FilesSearchCurrentQuery,
	FilesSearchPreviousQuery,
	FilesSearchUseCurrentProject,
	FilesSearchCreatedOnGreaterThan,
	FilesSearchCreatedOnLessThan,
	FilesSearchLimit,
	FilesSearchOffset,
	FilesSearchSortBy,
	FilesSearchSortByOrder,
	FilesSearchFileWithAbstractions,
	FilesSearchCreatedFilterOptions,
	ModelTemplatesSearchResults,
	ModelTemplatesSearchCurrentQuery,
	ModelTemplatesSearchPreviousQuery,
	ModelTemplatesSearchUseCurrentProject,
	ModelTemplatesSearchCreatedOnGreaterThan,
	ModelTemplatesSearchCreatedOnLessThan,
	ModelTemplatesSearchLastUpdatedOnGreaterThan,
	ModelTemplatesSearchLastUpdatedOnLessThan,
	ModelTemplatesSearchLimit,
	ModelTemplatesSearchOffset,
	ModelTemplatesSearchSortBy,
	ModelTemplatesSearchSortByOrder,
	ModelTemplatesSearchCreatedFilterOptions,
	CataloguesSearchResults,
	CataloguesSearchCurrentQuery,
	CataloguesSearchPreviousQuery,
	CataloguesSearchUseCurrentProject,
	CataloguesSearchCreatedOnGreaterThan,
	CataloguesSearchCreatedOnLessThan,
	CataloguesSearchLastUpdatedOnGreaterThan,
	CataloguesSearchLastUpdatedOnLessThan,
	CataloguesSearchLimit,
	CataloguesSearchOffset,
	CataloguesSearchSortBy,
	CataloguesSearchSortByOrder,
	CataloguesSearchCreatedFilterOptions,
	DirectorySearchResults,
	DirectorySearchCurrentQuery,
	DirectorySearchCreatedFilterOptions,
	DirectorySearchSortByOrder,
	DirectorySearchSortBy,
	DirectorySearchOffset,
	DirectorySearchLimit,
	DirectorySearchLastUpdatedOnLessThan,
	DirectorySearchLastUpdatedOnGreaterThan,
	DirectorySearchCreatedOnLessThan,
	DirectorySearchCreatedOnGreaterThan,
	DirectorySearchPreviousQuery,
	ProjectsSearchCreatedFilterOptions,
	ProjectsSearchSortByOrder,
	ProjectsSearchSortBy,
	ProjectsSearchOffset,
	ProjectsSearchLimit,
	ProjectsSearchLastUpdatedOnLessThan,
	ProjectsSearchLastUpdatedOnGreaterThan,
	ProjectsSearchCreatedOnLessThan,
	ProjectsSearchCreatedOnGreaterThan,
	ProjectsSearchPreviousQuery,
	ProjectsSearchCurrentQuery,
	ProjectsSearchResults,
	StorageTypesSearchResults,
	StoragesSearchCreatedFilterOptions,
	StoragesSearchSortByOrder,
	StoragesSearchSortBy,
	StoragesSearchOffset,
	StoragesSearchLimit,
	StoragesSearchLastUpdatedOnLessThan,
	StoragesSearchLastUpdatedOnGreaterThan,
	StoragesSearchCreatedOnLessThan,
	StoragesSearchCreatedOnGreaterThan,
	StoragesSearchResults
} from './stores'
import type { FlatTableArrayValue } from './interface'

export function ResetStorageStore() {
	StoragesSearchResults.set([])
	StoragesSearchCreatedOnGreaterThan.set('')
	StoragesSearchCreatedOnLessThan.set('')
	StoragesSearchLastUpdatedOnGreaterThan.set('')
	StoragesSearchLastUpdatedOnLessThan.set('')
	StoragesSearchLimit.set(1000)
	StoragesSearchOffset.set(0)
	StoragesSearchSortBy.set('last_updated_on')
	StoragesSearchSortByOrder.set('desc')
	StoragesSearchCreatedFilterOptions.set({})
	StorageTypesSearchResults.set([])
}

export function ResetProjectsStore() {
	ProjectsSearchResults.set([])
	ProjectsSearchCurrentQuery.set('')
	ProjectsSearchPreviousQuery.set('')
	ProjectsSearchCreatedOnGreaterThan.set('')
	ProjectsSearchCreatedOnLessThan.set('')
	ProjectsSearchLastUpdatedOnGreaterThan.set('')
	ProjectsSearchLastUpdatedOnLessThan.set('')
	ProjectsSearchLimit.set(1000)
	ProjectsSearchOffset.set(0)
	ProjectsSearchSortBy.set('last_updated_on')
	ProjectsSearchSortByOrder.set('desc')
	ProjectsSearchCreatedFilterOptions.set({})
}

export function ResetDirectoryStore() {
	DirectorySearchResults.set([])
	DirectorySearchCurrentQuery.set('')
	DirectorySearchPreviousQuery.set('')
	DirectorySearchCreatedOnGreaterThan.set('')
	DirectorySearchCreatedOnLessThan.set('')
	DirectorySearchLastUpdatedOnGreaterThan.set('')
	DirectorySearchLastUpdatedOnLessThan.set('')
	DirectorySearchLimit.set(1000)
	DirectorySearchOffset.set(0)
	DirectorySearchSortBy.set('last_updated_on')
	DirectorySearchSortByOrder.set('desc')
	DirectorySearchCreatedFilterOptions.set({})
}

export function ResetCataloguesStore() {
	CataloguesSearchResults.set([])
	CataloguesSearchCurrentQuery.set('')
	CataloguesSearchPreviousQuery.set('')
	CataloguesSearchUseCurrentProject.set(true)
	CataloguesSearchCreatedOnGreaterThan.set('')
	CataloguesSearchCreatedOnLessThan.set('')
	CataloguesSearchLastUpdatedOnGreaterThan.set('')
	CataloguesSearchLastUpdatedOnLessThan.set('')
	CataloguesSearchLimit.set(1000)
	CataloguesSearchOffset.set(0)
	CataloguesSearchSortBy.set('last_updated_on')
	CataloguesSearchSortByOrder.set('desc')
	CataloguesSearchCreatedFilterOptions.set({})
}

export function ResetModelTemplatesStore() {
	ModelTemplatesSearchResults.set([])
	ModelTemplatesSearchCurrentQuery.set('')
	ModelTemplatesSearchPreviousQuery.set('')
	ModelTemplatesSearchUseCurrentProject.set(true)
	ModelTemplatesSearchCreatedOnGreaterThan.set('')
	ModelTemplatesSearchCreatedOnLessThan.set('')
	ModelTemplatesSearchLastUpdatedOnGreaterThan.set('')
	ModelTemplatesSearchLastUpdatedOnLessThan.set('')
	ModelTemplatesSearchLimit.set(1000)
	ModelTemplatesSearchOffset.set(0)
	ModelTemplatesSearchSortBy.set('last_updated_on')
	ModelTemplatesSearchSortByOrder.set('desc')
	ModelTemplatesSearchCreatedFilterOptions.set({})

}

export function ResetFilesStore() {
	FilesSearchResults.set([])
	FilesSearchCurrentQuery.set('')
	FilesSearchPreviousQuery.set('')
	FilesSearchUseCurrentProject.set(true)
	FilesSearchCreatedOnGreaterThan.set('')
	FilesSearchCreatedOnLessThan.set('')
	FilesSearchLimit.set(1000)
	FilesSearchOffset.set(0)
	FilesSearchSortBy.set('created_on')
	FilesSearchSortByOrder.set('desc')
	FilesSearchFileWithAbstractions.set('')
	FilesSearchCreatedFilterOptions.set({})
}

export function ResetAbstractionsStore() {
	AbstractionsSearchResults.set([])
	AbstractionEditorsSearchResults.set([])
	AbstractionCurrentTemplate.set(null)
	AbstractionsSearchCurrentAbstractor.set(null)
	AbstractionsSearchCreatedOnGreaterThan.set('')
	AbstractionsSearchCreatedOnLessThan.set('')
	AbstractionsSearchLastUpdatedOnGreaterThan.set('')
	AbstractionsSearchLastUpdatedOnLessThan.set('')
	AbststractionsSearchIsVerified.set('')
	AbstractionsSearchLimit.set(1000)
	AbstractionsSearchOffset.set(0)
	AbstractionsSearchSortBy.set('last_updated_on')
	AbstractionsSearchSortByOrder.set('desc')
	AbstractionsSearchCreatedFilterOptions.set({})
}

export function IsProjectUserAuthorized(ProjectRoles: string[]) {
	const currentProject = get(CurrentProject)
	if (currentProject !== null) {
		for (let pr of currentProject.ProjectRoles) {
			if (ProjectRoles.includes(pr.ProjectRoleID)) {
				return true
			}
		}
	}
	return false
}

export const LocalDateFromString = (value: string) => new Date(value).toLocaleDateString()

export const LocalTimeFromString = (value: string) => new Date(value).toLocaleTimeString()

export function Log(logLevel: Shared.LogLevel, section: string, message: any, messageObjectTitle: string = '') {
	if (logLevel < parseInt(PUBLIC_LOG_LEVEL)) {
		return
	}
	switch (logLevel) {
		case 0:
			if (typeof message !== 'string') {
				console.info(`DEBUG || ${section} || ${messageObjectTitle}...`)
				console.info(message)
			} else {
				console.info(`DEBUG || ${section} || ${message}`)
			}
			break
		case 1:
			if (typeof message !== 'string') {
				console.warn(`WARNING || ${section} || ${messageObjectTitle}...`)
				console.warn(message)
			} else {
				console.warn(`WARNING || ${section} || ${message}`)
			}
			break
		case 2:
			if (typeof message !== 'string') {
				console.error(`ERROR || ${section} || ${messageObjectTitle}...`)
				console.error(message)
			} else {
				console.error(`ERROR || ${section} || ${message}`)
			}
			break
	}
}

export function GetNextColor(currentColor: Shared.Colors) {
	switch (currentColor) {
		case Shared.Colors.PRIMARY:
			return Shared.Colors.SECONDARY
		case Shared.Colors.SECONDARY:
			return Shared.Colors.ACCENT
		case Shared.Colors.ACCENT:
			return Shared.Colors.PRIMARY
		default:
			return Shared.Colors.PRIMARY
	}
}

export function GetNextColor2(currentColor: Shared.Colors) {
	switch (currentColor) {
		case Shared.Colors.PRIMARY:
			return Shared.Colors.SECONDARY
		case Shared.Colors.SECONDARY:
			return Shared.Colors.NEUTRAL
		case Shared.Colors.NEUTRAL:
			return Shared.Colors.PRIMARY
		default:
			return Shared.Colors.PRIMARY
	}
}

export function CheckIfGroupIsEligibleForHorizontalRendering(group: any) {
	for (let key of Object.keys(group)) {
		if (group[key]['struct'].split(' ')[1] === 'unique' || group[key]['struct'].split(' ')[1] === 'repetitive') {
			return false
		}
	}
	return true
}

export function prepareKey(key: string, repetitiveIndexes: number[]): string | undefined {
	for (let i = 0; i < repetitiveIndexes.length; i++) {
		key = key.replace('[x]', `[${repetitiveIndexes[i]}]`)
	}
	if (key.includes('[x]')) {
		console.error(`key ${key} does not match indexes ${repetitiveIndexes}`)
		return
	}
	key = key.replace('root.', '')
	return key
}

export function GenBreadCrumbs(key: string, repetitiveIndexes: number[]): { crumb: string; path: string }[] | undefined {
	const preparedKey = prepareKey(key, repetitiveIndexes)
	if (!preparedKey) {
		console.error('Key is not valid')
		return
	}
	let currentPath = 'root'
	let breadCrumbs: { crumb: string; path: string }[] = []
	const REP_GROUP_ELEMENT_SEARCH = new RegExp(/(.+)\[([0-9]+)\]/)
	for (const pk of preparedKey.split('.')) {
		currentPath = currentPath + `.${pk}`
		const regGroupExtraction = REP_GROUP_ELEMENT_SEARCH.exec(pk)
		if (regGroupExtraction) {
			breadCrumbs.push({ crumb: `#${Number(regGroupExtraction[2]) + 1}`, path: currentPath })
		} else if (pk !== 'value') {
			breadCrumbs.push({ crumb: pk.replaceAll('_', ' '), path: currentPath })
		}
	}
	return breadCrumbs
}

export function GetColumnHeadersForTwoDimensionArray(template: any) {
	let columnHeaders: string[] = []
	function calculateColumnHeaders(currentTemplateSection: any) {
		let columns = currentTemplateSection.columns as string[]
		let currentTemplateSectionValue = Array.isArray(currentTemplateSection.value) ? currentTemplateSection.value[0] : currentTemplateSection.value
		for (let c of columns) {
			if (c.startsWith('@')) {
				if (RENDER_HORIZONTALLY_EXTRACT.test(currentTemplateSectionValue[c.replace('@', '')]['struct']) && Array.isArray(currentTemplateSectionValue[c.replace('@', '')]['value'])) {
					let maxNoOfResultsExtract = MAX_EXTRACT.exec(currentTemplateSectionValue[c.replace('@', '')]['struct'])
					if (maxNoOfResultsExtract) {
						let columns: string[] = []
						for (let value of Object.values(currentTemplateSectionValue[c.replace('@', '')]['value'][0])) {
							let name = ''
							const nameExtract = NAME_REGEX_SEARCH.exec((value as any)['struct'])
							if (nameExtract) name = nameExtract[1]
							else name = (value as any)['struct'].split(' ')[0].split('.').at(-1)
							columns = [...columns, name]
						}
						for (let i = 0; i < parseInt(maxNoOfResultsExtract[1]); i++) {
							for (let c of columns) {
								columnHeaders = [...columnHeaders, `${c}_${i + 1}`]
							}
						}
					} else {
						calculateColumnHeaders(currentTemplateSectionValue[c.replace('@', '')])
					}
				} else {
					calculateColumnHeaders(currentTemplateSectionValue[c.replace('@', '')])
				}
			} else {
				const fieldNameExtract = NAME_REGEX_SEARCH.exec(currentTemplateSectionValue[c].struct)
				let columnName = fieldNameExtract ? fieldNameExtract[1] : c
				if (RENDER_HORIZONTALLY_EXTRACT.test(currentTemplateSectionValue[c].struct)) {
					let maxNoOfResultsExtract = MAX_EXTRACT.exec(currentTemplateSectionValue[c.replace('@', '')]['struct'])
					if (maxNoOfResultsExtract) {
						for (let i = 0; i < parseInt(maxNoOfResultsExtract[1]); i++) {
							columnHeaders = [...columnHeaders, `${columnName}_${i + 1}`]
						}
					} else {
						columnHeaders = [...columnHeaders, columnName]
					}
				} else {
					columnHeaders = [...columnHeaders, columnName]
				}
			}
		}
	}
	calculateColumnHeaders(template)
	return columnHeaders
}

export function ConvertObjectToTwoDimensionArray(template: any, value: any) {
	function mergeTwoDimensionArrays(leftArray: FlatTableArrayValue[][], rightArray: FlatTableArrayValue[][]) {
		let newArray: FlatTableArrayValue[][] = []
		for (let l = 0; l < leftArray.length; l++) {
			for (let r = 0; r < rightArray.length; r++) {
				newArray = [...newArray, [...leftArray[l], ...rightArray[r]]]
			}
		}
		return newArray
	}
	function convert(twoDimensionArray: FlatTableArrayValue[][], currentTemplateSection: any, repetitiveIndexes: number[]) {
		let columns = currentTemplateSection.columns as string[]
		let currentTemplateSectionValue = Array.isArray(currentTemplateSection.value) ? currentTemplateSection.value[0] : currentTemplateSection.value
		for (let c of columns) {
			if (c.startsWith('@')) {
				const groupDetails = currentTemplateSectionValue[c.replace('@', '')]
				if (groupDetails.struct.split(' ')[1] === 'unique') {
					twoDimensionArray = convert(twoDimensionArray, groupDetails, repetitiveIndexes)
				} else {
					const keyPathInValue = prepareKey(groupDetails.struct.split(' ')[0].replace('root.', '').replaceAll('.value', ''), repetitiveIndexes)
					if (!keyPathInValue) {
						console.error('Key Path invalid')
						return []
					}
					const groupValue = GetValueInObject(value, keyPathInValue)
					if (RENDER_HORIZONTALLY_EXTRACT.test(currentTemplateSectionValue[c.replace('@', '')]['struct']) && Array.isArray(currentTemplateSectionValue[c.replace('@', '')]['value'])) {
						let maxNoOfResultsExtract = MAX_EXTRACT.exec(currentTemplateSectionValue[c.replace('@', '')]['struct'])
						if (maxNoOfResultsExtract) {
							const maxNoOfResults = parseInt(maxNoOfResultsExtract[1])
							let newSingleDimensionArray: FlatTableArrayValue[] = []
							if (Array.isArray(groupValue)) {
								for (let i = 0; i < maxNoOfResults; i++) {
									if (groupValue[i]) {
										for (let key of Object.keys(currentTemplateSectionValue[c.replace('@', '')]['value'][0])) {
											if (typeof groupValue[i][key] !== 'object') {
												newSingleDimensionArray = [...newSingleDimensionArray, groupValue[i][key] as FlatTableArrayValue]
											} else {
												newSingleDimensionArray = [...newSingleDimensionArray, '#SECTION HAS NESTED GROUPS']
											}
										}
									} else {
										;(groupDetails.columns as string[]).forEach(() => (newSingleDimensionArray = [...newSingleDimensionArray, null]))
									}
								}
							} else {
								for (let i = 0; i < maxNoOfResults; i++) {
									;(groupDetails.columns as string[]).forEach(() => (newSingleDimensionArray = [...newSingleDimensionArray, null]))
								}
							}
							twoDimensionArray = mergeTwoDimensionArrays(twoDimensionArray, [newSingleDimensionArray])
						} else {
							if (Array.isArray(groupValue)) {
								let newTwoDimensionArray: FlatTableArrayValue[][] = []
								for (let i = 0; i < groupValue.length; i++) {
									newTwoDimensionArray = [...newTwoDimensionArray, ...convert(twoDimensionArray, groupDetails, [...repetitiveIndexes, i])]
								}
								twoDimensionArray = newTwoDimensionArray
							} else {
								twoDimensionArray = convert(twoDimensionArray, groupDetails, [...repetitiveIndexes, 0])
							}
						}
					} else {
						if (Array.isArray(groupValue)) {
							let newTwoDimensionArray: FlatTableArrayValue[][] = []
							for (let i = 0; i < groupValue.length; i++) {
								newTwoDimensionArray = [...newTwoDimensionArray, ...convert(twoDimensionArray, groupDetails, [...repetitiveIndexes, i])]
							}
							twoDimensionArray = newTwoDimensionArray
						} else {
							twoDimensionArray = convert(twoDimensionArray, groupDetails, [...repetitiveIndexes, 0])
						}
					}
				}
			} else {
				const keyPathInValue = prepareKey(currentTemplateSectionValue[c].struct.split(' ')[0].replace('root.', '').replaceAll('.value', ''), repetitiveIndexes)
				if (!keyPathInValue) {
					console.error('Key Path invalid')
					return []
				}
				let fieldValue = GetValueInObject(value, keyPathInValue)
				if (currentTemplateSectionValue[c].struct.split(' ')[2] === 'multiselect') {
					if (RENDER_HORIZONTALLY_EXTRACT.test(currentTemplateSectionValue[c].struct)) {
						let maxNoOfResultsExtract = MAX_EXTRACT.exec(currentTemplateSectionValue[c.replace('@', '')]['struct'])
						if (maxNoOfResultsExtract) {
							let newSingleDimensionArray: FlatTableArrayValue[] = []
							if (Array.isArray(fieldValue)) {
								for (let i = 0; i < parseInt(maxNoOfResultsExtract[1]); i++) {
									if (fieldValue[i] !== null && typeof fieldValue[i] !== "undefined") {
										newSingleDimensionArray = [...newSingleDimensionArray,fieldValue[i]]
									} else {
										newSingleDimensionArray = [...newSingleDimensionArray,null]
									}
								}
							} else {
								for (let i = 0; i < parseInt(maxNoOfResultsExtract[1]); i++) {
									newSingleDimensionArray = [...newSingleDimensionArray,null]
								}
							}
							twoDimensionArray = mergeTwoDimensionArrays(twoDimensionArray, [newSingleDimensionArray])
						} else {
							if (Array.isArray(fieldValue)) {
								fieldValue = fieldValue.join(',')
							}
							twoDimensionArray = mergeTwoDimensionArrays(twoDimensionArray, [[fieldValue]])
						}
					} else {
						if (Array.isArray(fieldValue)) {
							fieldValue = fieldValue.join(',')
						}
						twoDimensionArray = mergeTwoDimensionArrays(twoDimensionArray, [[fieldValue]])
					}
				} else {
					twoDimensionArray = mergeTwoDimensionArrays(twoDimensionArray, [[fieldValue]])
				}
			}
		}
		return twoDimensionArray
	}
	return convert([[]], template, [])
}

export function AppendColumnsToTemplate(template: any) {
	function append(currentTemplateSection: any) {
		let columns: string[] = []
		let currentTemplateSectionValue = Array.isArray(currentTemplateSection.value) ? currentTemplateSection.value[0] : currentTemplateSection.value
		Object.keys(currentTemplateSectionValue).forEach((tk) => {
			if (!DISABLED_REGEX_SEARCH.exec(currentTemplateSectionValue[tk].struct)) {
				switch (typeof currentTemplateSectionValue[tk].value) {
					case 'object':
						if (!Array.isArray(currentTemplateSectionValue[tk].value)) {
							append(currentTemplateSectionValue[tk])
							columns = [...columns, `@${tk}`]
						} else {
							if (currentTemplateSectionValue[tk].value.length < 1) {
								columns = [...columns, tk]
							} else {
								append(currentTemplateSectionValue[tk])
								columns = [...columns, `@${tk}`]
							}
						}
						break
					default:
						columns = [...columns, tk]
						break
				}
			}
		})
		let path = (currentTemplateSection.struct as string).split(' ')[0] === 'root' ? 'columns' : `${(currentTemplateSection.struct as string).split(' ')[0].replace('root.', 'value.').replaceAll('[x]', '[0]')}.columns`
		template = SetValueInObject(template, path, columns)
	}
	append(template)
	return template
}

export function GenAbstractionValueFromTemplate(template: any) {
	let abstractionValue: any = {}
	function gen(templateValue: any): void {
		Object.keys(templateValue).forEach((tk) => {
			if (!DISABLED_REGEX_SEARCH.exec(templateValue[tk].struct)) {
				switch (typeof templateValue[tk].value) {
					case 'number':
					case 'string':
						const fieldGroupPath = (templateValue[tk].struct as string).split(' ')[0].replace('root.', '').replaceAll('[x]', '[0]').replaceAll('.value', '')
						abstractionValue = SetValueInObject(abstractionValue, fieldGroupPath, templateValue[tk].value)
						break
					case 'object':
						if (!Array.isArray(templateValue[tk].value)) {
							gen(templateValue[tk].value)
						} else {
							if (templateValue[tk].value.length < 1) {
								const fieldGroupPath = (templateValue[tk].struct as string).split(' ')[0].replace('root.', '').replaceAll('[x]', '[0]').replaceAll('.value', '')
								abstractionValue = SetValueInObject(abstractionValue, fieldGroupPath, templateValue[tk].value)
							} else {
								templateValue[tk].value.forEach((rgv: any) => {
									gen(rgv)
								})
							}
						}
				}
			}
		})
	}
	gen(template)

	return abstractionValue
}

export function AreValuesEqual(valueOne: any, valueTwo: any): boolean {
	function check(valueOne: any, valueTwo: any): boolean {
		if (typeof valueOne !== typeof valueTwo) {
			return false
		}
		if (typeof valueOne === 'object') {
			if (valueOne == null) {
				if (valueTwo === null) {
					return true
				} else {
					return false
				}
			}
			if (Array.isArray(valueOne) && !Array.isArray(valueTwo)) {
				return false
			}
			if (!Array.isArray(valueOne) && Array.isArray(valueTwo)) {
				return false
			}
			if (Array.isArray(valueOne)) {
				if (valueOne.length !== valueTwo.length) {
					return false
				}
				let isValuesEqual = true
				for (let i = 0; i < valueOne.length; i++) {
					if (!check(valueOne[i], valueTwo[i])) {
						isValuesEqual = false
						break
					}
				}
				return isValuesEqual
			} else {
				if (Object.keys(valueOne).length !== Object.keys(valueTwo).length) {
					return false
				}
				if (!check(Object.keys(valueOne), Object.keys(valueTwo))) {
					return false
				}
				let isValuesEqual = true
				for (let key of Object.keys(valueOne)) {
					if (!check(valueOne[key], valueTwo[key])) {
						isValuesEqual = false
						break
					}
				}
				return isValuesEqual
			}
		} else {
			if (valueOne === valueTwo) {
				return true
			} else {
				return false
			}
		}
	}

	return check(valueOne, valueTwo)
}

export function DeleteValueInObject(currentObject: any, path: string): any {
	function deleteValue(currentValue: any, deletePath: string): any {
		if (currentValue === null) {
			return currentValue
		}
		const paths = deletePath.split('.')
		const pathIndex = new RegExp(/(.+)\[(\d+)\]/).exec(paths[0])
		if (paths.length === 1) {
			if (pathIndex !== null) {
				if (parseInt(pathIndex[2]) < 0) {
					return currentValue
				}
				if (!currentValue.hasOwnProperty(pathIndex[1]) || typeof currentValue[pathIndex[1]] !== 'object' || !Array.isArray(currentValue[pathIndex[1]])) {
					return currentValue
				}
				if (parseInt(pathIndex[2]) >= currentValue[pathIndex[1]].length) {
					return currentValue
				}
				currentValue[pathIndex[1]] = currentValue[pathIndex[1]].filter((_: any, index: number) => index !== parseInt(pathIndex[2]))
			} else {
				delete currentValue[paths[0]]
			}
		} else {
			if (pathIndex !== null) {
				if (!currentValue.hasOwnProperty(pathIndex[1]) || typeof currentValue[pathIndex[1]] !== 'object' || !Array.isArray(currentValue[pathIndex[1]])) {
					return currentValue
				}
				if (parseInt(pathIndex[2]) >= currentValue[pathIndex[1]].length) {
					return currentValue
				}
				paths.shift()
				currentValue[pathIndex[1]][parseInt(pathIndex[2])] = deleteValue(currentValue[pathIndex[1]][parseInt(pathIndex[2])], paths.join('.'))
			} else {
				const objectPath = paths[0]
				if (!currentValue.hasOwnProperty(objectPath) || typeof currentValue[objectPath] !== 'object' || Array.isArray(currentValue[objectPath])) {
					return currentValue
				}
				paths.shift()
				currentValue[objectPath] = deleteValue(currentValue[objectPath], paths.join('.'))
			}
		}
		return currentValue
	}

	return deleteValue(currentObject, path)
}

export function SetValueInObject(currentObject: any, path: string, valueToSet: any): any {
	function set(currentValue: any, setPath: string, valueToSet: any): any {
		if (currentValue === null) {
			currentValue = {}
		}
		const paths = setPath.split('.')
		const pathIndex = new RegExp(/(.+)\[(\d+)\]/).exec(paths[0])
		if (paths.length === 1) {
			if (pathIndex !== null) {
				if (parseInt(pathIndex[2]) < 0) {
					return undefined
				}
				if (!currentValue.hasOwnProperty(pathIndex[1]) || typeof currentValue[pathIndex[1]] !== 'object' || !Array.isArray(currentValue[pathIndex[1]])) {
					currentValue[pathIndex[1]] = []
				}
				if (parseInt(pathIndex[2]) >= currentValue[pathIndex[1]].length) {
					for (let i = currentValue[pathIndex[1]].length; i <= parseInt(pathIndex[2]); i++) {
						currentValue[pathIndex[1]].push(null)
					}
				}
				currentValue[pathIndex[1]][parseInt(pathIndex[2])] = valueToSet
			} else {
				currentValue[paths[0]] = valueToSet
			}
		} else {
			if (pathIndex !== null) {
				if (!currentValue.hasOwnProperty(pathIndex[1]) || typeof currentValue[pathIndex[1]] !== 'object' || !Array.isArray(currentValue[pathIndex[1]])) {
					currentValue[pathIndex[1]] = []
				}
				if (parseInt(pathIndex[2]) >= currentValue[pathIndex[1]].length) {
					for (let i = currentValue[pathIndex[1]].length; i <= parseInt(pathIndex[2]); i++) {
						currentValue[pathIndex[1]].push(null)
					}
				}
				paths.shift()
				currentValue[pathIndex[1]][parseInt(pathIndex[2])] = set(currentValue[pathIndex[1]][parseInt(pathIndex[2])], paths.join('.'), valueToSet)
			} else {
				const objectPath = paths[0]
				if (!currentValue.hasOwnProperty(objectPath) || typeof currentValue[objectPath] !== 'object' || Array.isArray(currentValue[objectPath])) {
					currentValue[objectPath] = {}
				}
				paths.shift()
				currentValue[objectPath] = set(currentValue[objectPath], paths.join('.'), valueToSet)
			}
		}
		return currentValue
	}

	return set(currentObject, path, valueToSet)
}

export function GetValueInObject(currentObject: any, path: string): any {
	function get(currentValue: any, getPath: string): any {
		if (currentValue !== null && typeof currentValue !== 'undefined') {
			const paths = getPath.split('.')
			const pathIndex = new RegExp(/(.+?)\[(\d+)\]/).exec(paths[0])
			if (paths.length === 1) {
				if (pathIndex === null) {
					if (currentValue.hasOwnProperty(paths[0])) {
						return currentValue[paths[0]]
					} else {
						return null
					}
				} else {
					if (currentValue.hasOwnProperty(pathIndex[1]) && typeof currentValue[pathIndex[1]][parseInt(pathIndex[2])] !== 'undefined') {
						return currentValue[pathIndex[1]][parseInt(pathIndex[2])]
					} else {
						return null
					}
				}
			} else {
				for (let key of Object.keys(currentValue)) {
					if (key === paths[0] || (pathIndex !== null && key === pathIndex[1])) {
						if (pathIndex !== null) {
							paths.shift()
							if (currentValue.hasOwnProperty(pathIndex[1]) && typeof currentValue[pathIndex[1]] !== 'undefined' && currentValue[pathIndex[1]] !== null) {
								return get(currentValue[pathIndex[1]][parseInt(pathIndex[2])], paths.join('.'))
							} else {
								return null
							}
						} else if (typeof currentValue[key] === 'object') {
							paths.shift()
							return get(currentValue[key], paths.join('.'))
						} else {
							return null
						}
					}
				}
				return null
			}
		} else {
			return null
		}
	}

	return get(currentObject, path)
}

// if callback returns true then loop is terminated
export function ForEachValueInObject(value: any, path: string, callback: (indexInValueIfArray: number, value: any) => boolean) {
	function eachValueInObject(indexInValueIfArray: number, originalValue: any, valueForCallback: any, filterPath: string, callback: (indexInValueIfArray: number, value: any) => boolean) {
		const paths = filterPath.split('.')
		if (paths.length === 1) {
			if (callback(indexInValueIfArray, valueForCallback[paths[0]])) {
				return
			}
		} else {
			for (let key of Object.keys(valueForCallback)) {
				if (key === paths[0]) {
					paths.shift()
					if (typeof valueForCallback[key] === 'object') {
						if (Array.isArray(valueForCallback[key])) {
							valueForCallback[key].forEach((value: any) => eachValueInObject(indexInValueIfArray, originalValue, value, paths.join('.'), callback))
						} else {
							eachValueInObject(indexInValueIfArray, originalValue, valueForCallback[key], paths.join('.'), callback)
						}
					}
					break
				}
			}
		}
	}

	if (typeof value === 'object') {
		if (Array.isArray(value)) {
			value.forEach((value: any, index) => eachValueInObject(index, value, value, path, callback))
		} else {
			eachValueInObject(0, value, value, path, callback)
		}
	}
}
