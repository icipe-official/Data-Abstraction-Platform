/**
 * Performs a deep check to see if two values are equal. Particulary useful for nested objects and arrays.
 *
 * Checks the following:
 *
 * 1. The data type of each value.
 *
 * 2. Number of elements or keys in array and object respectively.
 *
 * 3. Order of keys in objects if `matchOrderOfObjectKeys` param is set to true.
 *
 * 4. If the value themselves are equal.
 *
 *
 * @param valueOne Expected to be presented as if converted from JSON.
 * @param valueTwo Expected to be presented as if converted from JSON.
 * @param matchOrderOfObjectKeys `false` by default.
 *
 * If `true`, order of key-value in values to compare will determine whether they match.
 *
 * @returns true if values are equal and false if values are not equal.
 */
export function AreValuesEqual(valueOne: any, valueTwo: any, matchOrderOfObjectKeys: boolean = false): boolean {
	return new _(matchOrderOfObjectKeys).AreValuesEqual(valueOne, valueTwo)
}

class _ {
	private _matchOrderOfObjectKeys: boolean = false

	constructor(matchOrderOfObjectKeys: boolean) {
		this._matchOrderOfObjectKeys = matchOrderOfObjectKeys
	}

	AreValuesEqual(valueOne: any, valueTwo: any): boolean {
		if (typeof valueOne !== typeof valueTwo) {
			return false
		}

		if (typeof valueOne === 'object') {
			if (valueOne === null) {
				if (valueTwo === null) {
					return true
				}
				return false
			}

			if ((Array.isArray(valueOne) && !Array.isArray(valueTwo)) || (!Array.isArray(valueOne) && Array.isArray(valueTwo))) {
				return false
			}

			if (Array.isArray(valueOne)) {
				if (valueOne.length !== valueTwo.length) {
					return false
				}

				for (let i = 0; i < valueOne.length; i++) {
					if (!this.AreValuesEqual(valueOne[i], valueTwo[i])) {
						return false
					}
				}

				return true
			}

			const valueOneObjKeys = Object.keys(valueOne)
			const valueTwoObjKeys = Object.keys(valueTwo)

			if (valueOneObjKeys.length !== valueTwoObjKeys.length) {
				return false
			}

			if (this._matchOrderOfObjectKeys) {
				for (let i = 0; i < valueOneObjKeys.length; i++) {
					if (valueOneObjKeys[i] !== valueTwoObjKeys[i]) {
						return false
					}

					if (!this.AreValuesEqual(valueOne[valueOneObjKeys[i]], valueTwo[valueTwoObjKeys[i]])) {
						return false
					}
				}

				return true
			}

			for (let valueOneObjKey of valueOneObjKeys) {
				let valueOneObjKeyMatchedWithTwo = false

				for (let valueTwoObjKey of valueTwoObjKeys) {
					if (valueOneObjKey === valueTwoObjKey) {
						valueOneObjKeyMatchedWithTwo = true

						if (!this.AreValuesEqual(valueOne[valueOneObjKey], valueTwo[valueTwoObjKey])) {
							return false
						}

						break
					}
				}

				if (!valueOneObjKeyMatchedWithTwo) {
					return false
				}
			}

			return true
		}

		return valueOne === valueTwo
	}
}
