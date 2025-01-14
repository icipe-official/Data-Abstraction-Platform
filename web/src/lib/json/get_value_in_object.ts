import Json from '.'

/**
 * Get value in {@linkcode object} found at {@linkcode path}.
 *
 * @param object Object or array of objects which to modify through addition of valueToSet. Expected to be presented as if converted from JSON.
 * @param path Object-like path to value to get from {@linkcode object}.
 *
 * Numbers enclosed in square brackets or between full-stops indicate array indexes.
 *
 * If path is empty, then the {@linkcode object} will be returned.
 *
 * If path begins with `$.`, then it is removed. Intention is to match Postgres' json path syntax.
 *
 * Examples:
 *
 * `$.[8].childobject.array[2][3].childobject`.
 *
 * `$.8.childobject.array.2.3.childobject`.
 * @returns value found in {@linkcode object} or undefined if not found.
 */
export function GetValueInObject(object: any, path: string): any {
	if (typeof path !== 'string' || path.length === 0 || path === '$') {
		return object
	}

	return getValueInObject(object, path.replace('$.', '').match(Json.KEY_ARRAY_INDEX_REGEX) as any[])
}

function getValueInObject(value: any, pathObjectKeyArrayIndexes: string[]): any {
	if (typeof value === 'object' && value !== null) {
		let currentPathKeyArrayIndex: string | number = pathObjectKeyArrayIndexes[0]
		if (!Number.isNaN(Number(currentPathKeyArrayIndex))) {
			currentPathKeyArrayIndex = Number(currentPathKeyArrayIndex)
		}

		pathObjectKeyArrayIndexes = pathObjectKeyArrayIndexes.slice(1)

		if (typeof value[currentPathKeyArrayIndex] === 'undefined') {
			return undefined
		}

		if (pathObjectKeyArrayIndexes.length > 0) {
			return getValueInObject(value[currentPathKeyArrayIndex], pathObjectKeyArrayIndexes)
		}

		return value[currentPathKeyArrayIndex]
	}

	return undefined
}
