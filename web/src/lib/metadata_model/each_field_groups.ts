import { FgProperties } from './metadata_model'

/**
 * 
 * @param metadatamodel 
 * @param callback 
 * @returns 
 */
export function FilterFieldGroups(metadatamodel: any, callback: (property: any) => boolean) {
	if (typeof callback !== 'function') {
		return metadatamodel
	}

	return filterFieldGroups(metadatamodel, callback)
}
/**
 *
 * @param mmGroup Current Metadata Model Group
 * @param callback
 *
 *
 * mm - Alias for metadata model
 *
 * fg - Alias for field group
 */
function filterFieldGroups(mmGroup: any, callback: (property: any) => boolean) {
	if (typeof mmGroup !== 'object' || Array.isArray(mmGroup) || mmGroup === null) {
		return mmGroup
	}

	const mmGroupFields = mmGroup[FgProperties.GROUP_FIELDS][0]
	if (typeof mmGroupFields !== 'object' || Array.isArray(mmGroupFields)) {
		return mmGroup
	}

	if (typeof mmGroup[FgProperties.GROUP_READ_ORDER_OF_FIELDS] !== 'object' || !Array.isArray(mmGroup[FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
		return mmGroup
	}

	mmGroup[FgProperties.GROUP_READ_ORDER_OF_FIELDS] = (mmGroup[FgProperties.GROUP_READ_ORDER_OF_FIELDS] as any[]).filter((fgKey) => {
		if (typeof fgKey === 'string') {
			if (!callback(mmGroup[FgProperties.GROUP_FIELDS][0][fgKey])) {
				delete mmGroup[FgProperties.GROUP_FIELDS][0][fgKey]
				return false
			} else {
				if (Array.isArray(mmGroupFields[fgKey][FgProperties.GROUP_FIELDS])) {
					mmGroup[FgProperties.GROUP_FIELDS][0][fgKey] = filterFieldGroups(mmGroupFields[fgKey], callback)
				}
			}
		}

		return true
	})

	return mmGroup
}


/**
 * 
 * @param metadatamodel 
 * @param callback 
 * @returns 
 */
export function ForEachFieldGroup(metadatamodel: any, callback: (property: any) => void) {
	if (typeof callback !== 'function') {
		return
	}

	forEachFieldGroup(metadatamodel, callback)
}
/**
 *
 * @param mmGroup Current Metadata Model Group
 * @param callback
 *
 *
 * mm - Alias for metadata model
 *
 * fg - Alias for field group
 */
function forEachFieldGroup(mmGroup: any, callback: (property: any) => void) {
	if (typeof mmGroup !== 'object' || Array.isArray(mmGroup) || mmGroup === null) {
		return
	}

	const mmGroupFields = mmGroup[FgProperties.GROUP_FIELDS][0]
	if (typeof mmGroupFields !== 'object' || Array.isArray(mmGroupFields) || mmGroup === null) {
		return
	}

	const mmGroupReadOrderOfFields = mmGroup[FgProperties.GROUP_READ_ORDER_OF_FIELDS]
	if (typeof mmGroupFields !== 'object' || !Array.isArray(mmGroupReadOrderOfFields) || mmGroup === null) {
		return
	}

	for (const key of mmGroupReadOrderOfFields) {
		callback(mmGroup[FgProperties.GROUP_FIELDS][0][key])
		if (Array.isArray(mmGroupFields[key][FgProperties.GROUP_FIELDS])) {
			forEachFieldGroup(mmGroupFields[key], callback)
		}
	}
}


/**
 * 
 * @param metadatamodel 
 * @param callback 
 * @returns 
 */
export function MapFieldGroups(metadatamodel: any, callback: (property: any) => any) {
	if (typeof callback !== 'function') {
		return metadatamodel
	}
	
	return mapFieldGroups(metadatamodel, callback)
}
/**
 *
 * @param mmGroup Current Metadata Model Group
 * @param callback
 *
 *
 * mm - Alias for metadata model
 *
 * fg - Alias for field group
 */
function mapFieldGroups(mmGroup: any, callback: (property: any) => any) {
	if (typeof mmGroup !== 'object' || Array.isArray(mmGroup) || mmGroup === null) {
		return mmGroup
	}

	const mmGroupFields = mmGroup[FgProperties.GROUP_FIELDS][0]
	if (typeof mmGroupFields !== 'object' || Array.isArray(mmGroupFields) || mmGroup === null) {
		return mmGroup
	}

	const mmGroupReadOrderOfFields = mmGroup[FgProperties.GROUP_READ_ORDER_OF_FIELDS]
	if (typeof mmGroupFields !== 'object' || !Array.isArray(mmGroupReadOrderOfFields) || mmGroup === null) {
		return mmGroup
	}

	for (const key of mmGroupReadOrderOfFields) {
		const value = callback(mmGroup[FgProperties.GROUP_FIELDS][0][key])
		if (value && value !== null) {
			mmGroup[FgProperties.GROUP_FIELDS][0][key] = value
		}
		if (Array.isArray(mmGroupFields[key][FgProperties.GROUP_FIELDS])) {
			mmGroup[FgProperties.GROUP_FIELDS][0][key] = mapFieldGroups(mmGroupFields[key], callback)
		}
	}

	return mmGroup
}
