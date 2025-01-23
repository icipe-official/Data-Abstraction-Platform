import Json from '.'

/**
 * Delete value in {@linkcode object} using {@linkcode path}.
 *
 * @param object Object or array of objects which to modify through deletion. Expected to be presented as if converted from JSON.
 * @param path Object-like path to value to remove from {@linkcode object} supplied as param.
 *
 * Numbers enclosed in square brackets or between full-stops indicate array indexes.
 *
 * If path is empty, then an empty array will be returned if object param was an array otherwise it will return an empty object.
 *
 * If path begins with `$.`, then it is removed. Intention is to match Postgres' json path syntax
 *
 * Examples:
 *
 * `$.[8].childobject.array[2][3].childobject`
 *
 * `$.8.childobject.array.2.3.childobject`
 *
 * @returns An {@linkcode object} with value removed if it was found using the {@linkcode path} specified.
 */
export function DeleteValueInObject(object: any, path?: string): any {
	if (typeof path !== 'string' || path.length === 0 || path === '$') {
		if (Array.isArray(object)) {
			return []
		}

		return {}
	}

	return deleteValueInObject(object, path.replace('$.', '').match(Json.KEY_ARRAY_INDEX_REGEX) as any[])
}

function deleteValueInObject(value: any, pathObjectKeyArrayIndexes: string[]): any {
	if (typeof value !== 'object' || value === null) return value

	let pathKeyArrayIndex: string | number = pathObjectKeyArrayIndexes[0]
	if (!Number.isNaN(Number(pathKeyArrayIndex))) {
		pathKeyArrayIndex = Number(pathKeyArrayIndex)
	}

	pathObjectKeyArrayIndexes = pathObjectKeyArrayIndexes.slice(1)

	if (pathObjectKeyArrayIndexes.length > 0) {
		if (typeof value[pathKeyArrayIndex] === 'object') {
			value[pathKeyArrayIndex] = deleteValueInObject(value[pathKeyArrayIndex], pathObjectKeyArrayIndexes)
		}
	} else {
		if (typeof pathKeyArrayIndex === 'number') {
			if (Array.isArray(value)) {
				return value.filter((_, index) => index !== pathKeyArrayIndex)
			}
		} else {
			if (typeof value[pathKeyArrayIndex] !== 'undefined') {
				delete value[pathKeyArrayIndex]
			}
		}
	}

	return value
}
