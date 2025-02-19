import Json from '.'

/**
 * @callback ValueFoundInObject
 * @param pathObjectKeyArrayIndexes path to value found in object
 * @param valueFound Value found at path specified
 * @returns If callback returns true then loop is terminated
 */

/**
 * Calls {@linkcode ifValueFoundInObject} if value is found at path.
 *
 * @param object Expected to be an object or array of objects and be presented as if converted from JSON.
 * @param path Object-like path to value to find from {@linkcode object} supplied as param.
 * @param {ValueFoundInObject} ifValueFoundInObject Called when value has been found in object. Return true to terminate loop.
 * @returns {boolean} to indicate that the loop has ended (true if successful).
 */
export function ForEachValueInObject(object: any, path: string, ifValueFoundInObject: (currentValuePathKeyArrayIndexes: (string | number)[], valueFound: any) => boolean): boolean {
	if (typeof ifValueFoundInObject !== 'function') {
		return false
	}

	if (path.length === 0 || path === '$') {
		return ifValueFoundInObject(['$'], object)
	}

	return new _(ifValueFoundInObject).ForEachValueInObject(object, path.replace('$.', '').match(Json.KEY_ARRAY_INDEX_REGEX) as any[], ['$'])
}

class _ {
	private _ifValueFoundInObject: (currentValuePathKeyArrayIndexes: (string | number)[], valueFound: any) => boolean

	constructor(ifValueFoundInObject: (currentValuePathKeyArrayIndexes: (string | number)[], valueFound: any) => boolean) {
		this._ifValueFoundInObject = ifValueFoundInObject
	}

	ForEachValueInObject(value: any, pathObjectKeyArrayIndexes: string[], valuePathKeyArrayIndexes: (string | number)[]): boolean {
		if (typeof value !== 'object' || value === null) return true

		let currentPathKeyArrayIndex: string | number = pathObjectKeyArrayIndexes[0]
		if (!Number.isNaN(Number(currentPathKeyArrayIndex))) {
			currentPathKeyArrayIndex = Number(currentPathKeyArrayIndex)
		}

		pathObjectKeyArrayIndexes = pathObjectKeyArrayIndexes.slice(1)

		if (pathObjectKeyArrayIndexes.length > 0) {
			if (typeof currentPathKeyArrayIndex === 'number') {
				if (Array.isArray(value) && currentPathKeyArrayIndex < value.length) {
					this.ForEachValueInObject(value[currentPathKeyArrayIndex], pathObjectKeyArrayIndexes, [...valuePathKeyArrayIndexes, currentPathKeyArrayIndex])
				}
			} else if (currentPathKeyArrayIndex === '*') {
				if (Array.isArray(value)) {
					for (let i = 0; i < value.length; i++) {
						if (this.ForEachValueInObject(value[i], pathObjectKeyArrayIndexes, [...valuePathKeyArrayIndexes, i])) {
							return true
						}
					}
				} else {
					for (const key of Object.keys(value)) {
						if (this.ForEachValueInObject(value[key], pathObjectKeyArrayIndexes, [...valuePathKeyArrayIndexes, key])) {
							return true
						}
					}
				}
			} else {
				if (typeof value[currentPathKeyArrayIndex] !== 'undefined') {
					this.ForEachValueInObject(value[currentPathKeyArrayIndex], pathObjectKeyArrayIndexes, [...valuePathKeyArrayIndexes, currentPathKeyArrayIndex])
				}
			}
		} else {
			if (typeof currentPathKeyArrayIndex === 'number') {
				if (Array.isArray(value) && currentPathKeyArrayIndex < value.length) {
					this._ifValueFoundInObject([...valuePathKeyArrayIndexes, currentPathKeyArrayIndex], value[currentPathKeyArrayIndex])
				}
			} else if (currentPathKeyArrayIndex === '*') {
				if (Array.isArray(value)) {
					for (let i = 0; i < value.length; i++) {
						if (this._ifValueFoundInObject([...valuePathKeyArrayIndexes, i], value[i])) {
							return true
						}
					}
				} else {
					for (const key of Object.keys(value)) {
						if (this._ifValueFoundInObject([...valuePathKeyArrayIndexes, key], value[key])) {
							return true
						}
					}
				}
			} else {
				if (typeof value[currentPathKeyArrayIndex] !== 'undefined') {
					this._ifValueFoundInObject([...valuePathKeyArrayIndexes, currentPathKeyArrayIndex], value[currentPathKeyArrayIndex])
				}
			}
		}

		return true
	}
}
