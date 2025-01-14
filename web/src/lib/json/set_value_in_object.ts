import Json from '.'

/**
 * Adds or replaces value in {@linkcode object} with {@linkcode valueToSet} using the {@linkcode path}.
 *
 * @param object Object or array of objects which to modify through addition of {@linkcode valueToSet}. Expected to be presented as if converted from JSON.
 * @param path Object-like path to value to add to {@linkcode object}.
 *
 * Numbers enclosed in square brackets or between full-stops indicate array indexes.
 *
 * If path is empty, then valueToSet will be returned.
 *
 * If path begins with `$.`, then it is removed. Intention is to match Postgres' json path syntax.
 *
 * Examples:
 *
 * `$.[8].childobject.array[2][3].childobject`
 *
 * `$.8.childobject.array.2.3.childobject`.
 * @param valueToSet value to be added to the {@linkcode object}. Expected to be presented as if converted from JSON.
 * @returns An {@linkcode object} with value added to it.
 */
export function SetValueInObject(object: any, path: string, valueToSet: any): any {
	if (typeof path !== 'string' || path.length === 0 || path === '$') {
		if (typeof valueToSet === 'object') {
			return structuredClone(valueToSet)
		}

		return valueToSet
	}

	return new _(valueToSet).SetValueInObject(object, path.replace('$.', '').match(Json.KEY_ARRAY_INDEX_REGEX) as any[])
}

class _ {
	private _valueToSet: any

	constructor(valueToSet: any) {
		if (typeof valueToSet === 'object') {
			this._valueToSet = structuredClone(valueToSet)
		} else {
			this._valueToSet = valueToSet
		}
	}

	SetValueInObject(value: any, pathObjectKeyArrayIndexes: string[]): any {
		let currentPathKeyArrayIndex: string | number = pathObjectKeyArrayIndexes[0]
		if (!Number.isNaN(Number(currentPathKeyArrayIndex))) {
			currentPathKeyArrayIndex = Number(currentPathKeyArrayIndex)
		}

		pathObjectKeyArrayIndexes = pathObjectKeyArrayIndexes.slice(1)

		if (typeof currentPathKeyArrayIndex === 'number') {
			if (!Array.isArray(value)) {
				value = []
			}

			if (currentPathKeyArrayIndex > value.length - 1) {
				for (let i = value.length; i <= currentPathKeyArrayIndex; i++) {
					value.push(undefined)
				}
			}
		} else {
			if (typeof value !== 'object' || value === null) {
				value = {}
			}
		}

		if (pathObjectKeyArrayIndexes.length > 0) {
			value[currentPathKeyArrayIndex] = this.SetValueInObject(value[currentPathKeyArrayIndex], pathObjectKeyArrayIndexes)
		} else {
			value[currentPathKeyArrayIndex] = this._valueToSet
		}

		return value
	}
}
