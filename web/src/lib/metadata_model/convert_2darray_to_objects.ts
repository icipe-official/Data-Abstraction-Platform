import Json from '../json'
import MetadataModel from '.'

interface IGroupConversion {
	field_group_key: string
	fg_key_suffix: string
	fields_2d_indexes: number[]
	fields_2d_primary_key_indexes: number[]
	fields: IFieldConversion[]
	groups: IGroupConversion[]
}

interface IFieldConversion {
	fg_key_suffix: string
	fields_2d_indexes?: number[]
	column_indexes_that_match_2d_index_header?: number[][]
	read_order_of_fields?: string[]
}

/**
 * Converts a 2D array({@linkcode data}) into an array of objects following the metadata-model structure.
 *
 * @throws {MetadataModel.Error} in the following instances:
 * * {@linkcode metadatamodel} structure is invalid.
 * * {@linkcode fieldStructures} structure is invalid.
 * * Horizontal length of each array in {@linkcode data} does not match length of base headers.
 *
 * @param metadatamodel A valid metadata-model of type object (not array).
 * @param data A 2D array ONLY.
 * @param skipIfFGDisabled Do not include field group if property {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE}($FG_VIEW_DISABLE) is true. Default true.
 * @param skipIfDataExtraction Do not include field group if property {@linkcode FgProperties.FIELD_GROUP_SKIP_DATA_EXTRACTION}($FG_SKIP_DATA_EXTRACTION) is true. Default true.
 * @param fieldStructures Similar to default generated base headers except the order in which the columns appear may be different.
 * @returns An array of objects.
 */

/**
 * Converts a 2D array into  an object or array of objects following the metadata-model structure.
 */
export class Convert2DArrayToObjects {
	private _2DFields: any[]
	private _objects: any[] = []
	private _fgConversion: IGroupConversion
	private _current2DArray: any[][] = []

	get Objects() {
		return this._objects
	}

	ResetObjects() {
		this._objects = []
	}

	constructor(metadatamodel: any, target2DFields: any[] | undefined = undefined, skipIfFGDisabled: boolean = true, skipIfDataExtraction: boolean = true, removePrimaryKey: boolean = true) {
		try {
			if (Array.isArray(target2DFields)) {
				this._2DFields = target2DFields
			} else {
				let extract2DFields = new MetadataModel.Extract2DFields(metadatamodel, skipIfFGDisabled, skipIfDataExtraction, removePrimaryKey)
				extract2DFields.Extract()
				extract2DFields.Reposition()
				extract2DFields.RemoveSkipped()
				this._2DFields = extract2DFields.Fields
			}

			this._fgConversion = this._initFgConversion(metadatamodel)
		} catch (e) {
			throw e
		}
	}

	/**
	 * Recursive function that setups the necessary information required to convert 2D array to objects . Initializes {@linkcode Convert2DArrayToObjects._fgConversion}.
	 *
	 * @throws {MetadataModel.Error} if {@linkcode mmGroup} is not valid.
	 *
	 * Will skip fields/groups if {@linkcode Convert2DArrayToObjects._skipIfDataExtraction} or {@linkcode Convert2DArrayToObjects._skipIfFGDisabled} is true and the corresponding properties are encountered.
	 *
	 * @param mmGroup Current metadata model Group to get conversion information.
	 * @returns
	 */
	private _initFgConversion(mmGroup: MetadataModel.IMetadataModel | any) {
		if (!MetadataModel.IsFieldGroupKeyValid(mmGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY])) {
			throw [this._initFgConversion.name, `mmGroup.${MetadataModel.FgProperties.FIELD_GROUP_KEY} is not a string`, mmGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]]
		}

		let mmGroupConversion: IGroupConversion = {
			field_group_key: mmGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY],
			fg_key_suffix: (mmGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split('.').at(-1) as string,
			fields_2d_indexes: [],
			fields_2d_primary_key_indexes: [],
			groups: [],
			fields: []
		}

		// Set 2D Fields Indexes for current mmGroup
		for (let fieldIndex = 0; fieldIndex < this._2DFields.length; fieldIndex++) {
			if (!MetadataModel.IsGroupFieldsValid(this._2DFields[fieldIndex])) {
				throw [this._initFgConversion.name, `this._2DFields[${fieldIndex}] is not an object`, structuredClone(this._2DFields[fieldIndex])]
			}

			if (!MetadataModel.IsFieldGroupKeyValid(this._2DFields[fieldIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY])) {
				throw [this._initFgConversion.name, `this._2DFields[${fieldIndex}][${MetadataModel.FgProperties.FIELD_GROUP_KEY}] is not a string`, this._2DFields[fieldIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY]]
			}

			const relativePath = (this._2DFields[fieldIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).split(`${mmGroup[MetadataModel.FgProperties.FIELD_GROUP_KEY]}.${MetadataModel.FgProperties.GROUP_FIELDS}${MetadataModel.ARRAY_INDEX_PLACEHOLDER}.`)
			if (relativePath.length === 2 && relativePath[1].split('.').length === 1) {
				mmGroupConversion.fields_2d_indexes.push(fieldIndex)
			}
		}

		// Set 2D Fields Indexes that are primary keys
		mmGroupConversion.fields_2d_primary_key_indexes = this._getPrimaryKey2DFieldsIndexes(mmGroup)
		if (mmGroupConversion.fields_2d_primary_key_indexes.length === 0) {
			mmGroupConversion.fields_2d_primary_key_indexes = structuredClone(mmGroupConversion.fields_2d_indexes)
		}

		const mmGroupFields = mmGroup[MetadataModel.FgProperties.GROUP_FIELDS][0]
		if (!MetadataModel.IsGroupFieldsValid(mmGroupFields)) {
			throw [this._initFgConversion.name, `mmGroup[${MetadataModel.FgProperties.GROUP_FIELDS}][0] is not an object`, structuredClone(mmGroupFields)]
		}

		const mmGroupReadOrderOfFields = mmGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]
		if (!MetadataModel.IsGroupReadOrderOfFieldsValid(mmGroupReadOrderOfFields)) {
			throw [this._initFgConversion.name, `mmGroup[${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS}] is not an array`, structuredClone(mmGroupReadOrderOfFields)]
		}

		for (const fgKeySuffix of mmGroupReadOrderOfFields) {
			if (!MetadataModel.IsGroupFieldsValid(mmGroupFields[fgKeySuffix])) {
				throw [this._initFgConversion.name, `mmGroupFields[${fgKeySuffix}] is not an object`, structuredClone(mmGroupFields[fgKeySuffix])]
			}

			if (!MetadataModel.IsFieldGroupKeyValid(mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.FIELD_GROUP_KEY])) {
				throw [this._initFgConversion.name, `mmGroupFields[${fgKeySuffix}][${MetadataModel.FgProperties.FIELD_GROUP_KEY}] is not a string`, structuredClone(mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.FIELD_GROUP_KEY])]
			}

			let newField: IFieldConversion = {
				fg_key_suffix: fgKeySuffix
			}

			if (Array.isArray(mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
				if (mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.GROUP_EXTRACT_AS_SINGLE_FIELD]) {
					const fields2dIndexes = this._get2DFieldsIndexesFromCurrentGroupIndexes(mmGroupConversion.fields_2d_indexes, mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.FIELD_GROUP_KEY])

					if (fields2dIndexes.length == 0) {
						throw [this._initFgConversion.name, `fields2dIndexes for mmGroupFields[${fgKeySuffix}][${MetadataModel.FgProperties.GROUP_EXTRACT_AS_SINGLE_FIELD}] is empty`]
					}

					newField.fields_2d_indexes = fields2dIndexes
					mmGroupConversion.fields.push(newField)

					continue
				}

				if (
					MetadataModel.GroupCanBeProcessedAs2D(mmGroupFields[fgKeySuffix]) &&
					mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] &&
					!Number.isNaN(mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]) &&
					mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS] > 0
				) {
					const maxIndexOfValuesInObject = Number(mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]) - 1

					newField.read_order_of_fields = mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]

					newField.column_indexes_that_match_2d_index_header = []
					for (let columnIndex = 0; columnIndex <= maxIndexOfValuesInObject; columnIndex++) {
						let columnIndexHeaders: number[] = []
						for (let fIndex = 0; fIndex < this._2DFields.length; fIndex++) {
							if (!MetadataModel.IsGroupFieldsValid(this._2DFields[fIndex])) {
								throw [this._initFgConversion.name, `this._2DFields[${fIndex}] is not an object`, this._2DFields[fIndex]]
							}

							if (!MetadataModel.IsFieldGroupKeyValid(this._2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY])) {
								throw [this._initFgConversion.name, `this._2DFields[${fIndex}] is not a string`, this._2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY]]
							}

							if ((this._2DFields[fIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY] as string).startsWith(mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.FIELD_GROUP_KEY])) {
								if (this._2DFields[fIndex][MetadataModel.FgProperties.FIELD_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX] === columnIndex) {
									columnIndexHeaders.push(fIndex)
								}
							}
						}
						newField.column_indexes_that_match_2d_index_header.push(columnIndexHeaders)
					}
				}

				mmGroupConversion.groups.push(this._initFgConversion(mmGroupFields[fgKeySuffix]))
				continue
			}

			const fields2dIndexes = this._get2DFieldsIndexesFromCurrentGroupIndexes(mmGroupConversion.fields_2d_indexes, mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.FIELD_GROUP_KEY])
			if (fields2dIndexes.length == 0) {
				throw [this._initFgConversion.name, `fields2dIndexes for mmGroupFields[${fgKeySuffix}][${MetadataModel.FgProperties.FIELD_GROUP_KEY}] is empty`, structuredClone(mmGroupFields[fgKeySuffix][MetadataModel.FgProperties.FIELD_GROUP_KEY])]
			}
			newField.fields_2d_indexes = fields2dIndexes
			mmGroupConversion.fields.push(newField)
		}

		return mmGroupConversion
	}

	Convert(data: any[][]) {
		data = data.filter(datum => {
			for (let dIndex = 0; dIndex < datum.length; dIndex++) {
				if (datum[dIndex] !== null && typeof datum[dIndex] !== 'undefined') {
					return true
				}
			}
			return false
		})
		let currentDataIndexes = new Array(data.length)
		for (let cdIndex = 0; cdIndex < data.length; cdIndex++) {
			currentDataIndexes[cdIndex] = cdIndex
		}

		this._current2DArray = data

		try {
			const newObjects = this._convert(this._fgConversion, currentDataIndexes, [])
			if (Array.isArray(newObjects)) {
				this._objects = [...this._objects, ...newObjects]
			}
		} catch (e) {
			throw e
		}
	}

	private _convert(gConversion: IGroupConversion, current2DArrayRowIndexes: number[], groupIndexes: number[]) {
		try {
			const groupedDataIndexes = this._groupDataByPrimaryKeys(gConversion, current2DArrayRowIndexes)

			let objects = new Array(groupIndexes.length)

			for (let gdIndex = 0; gdIndex < groupedDataIndexes.length; gdIndex++) {
				let object: any = {}

				for (const field of gConversion.fields) {
					if (Array.isArray(field.column_indexes_that_match_2d_index_header) && field.column_indexes_that_match_2d_index_header.length > 0 && Array.isArray(field.read_order_of_fields) && field.read_order_of_fields.length > 0) {
						let groupFieldValue: any[] = []

						for (const ci2dhIndex of field.column_indexes_that_match_2d_index_header) {
							let newFieldValue: any = {}

							for (let citmihIndex = 0; citmihIndex < ci2dhIndex.length; citmihIndex++) {
								const fieldValue = this._extractFieldValueFromGroupedData(groupedDataIndexes[gdIndex], [ci2dhIndex[citmihIndex]])
								if (fieldValue.length > 0) {
									newFieldValue[field.read_order_of_fields[citmihIndex]] = fieldValue
								}
							}

							if (Object.keys(newFieldValue).length > 0) {
								groupFieldValue.push(newFieldValue)
							}
						}

						if (groupFieldValue.length > 0) {
							object[field.fg_key_suffix] = groupFieldValue
						}

						continue
					}

					if (Array.isArray(field.fields_2d_indexes)) {
						const fieldValue = this._extractFieldValueFromGroupedData(groupedDataIndexes[gdIndex], field.fields_2d_indexes)
						if (fieldValue.length > 0) {
							object[field.fg_key_suffix] = fieldValue
						}
					}
				}

				if (gConversion.groups.length > 0) {
					for (const gc of gConversion.groups) {
						const newObjectValue = this._convert(gc, groupedDataIndexes[gdIndex], [...groupIndexes, gdIndex])
						if (Array.isArray(newObjectValue) && newObjectValue.length > 0) {
							object[gc.fg_key_suffix] = newObjectValue
						}
					}
				}

				if (Object.keys(object).length > 0) {
					objects[gdIndex] = object
				}
			}

			if ((objects[0] === null || typeof objects[0] === 'undefined') && objects.length === 1) {
				return objects[0]
			} else {
				let newObjects: any[] = []

				for (const o of objects) {
					if (o !== null && typeof o !== 'undefined') {
						newObjects.push(o)
					}
				}

				return newObjects
			}
		} catch (e) {
			throw e
		}
	}

	/**
	 * @throws {MetadataModel.Error} if dataRow is not valid or each row of duplicateRowValues are not equal.
	 *
	 * @param groupedDataIndexes
	 * @param columnIndexes
	 * @returns
	 */
	private _extractFieldValueFromGroupedData(groupedDataIndexes: number[], columnIndexes: number[]) {
		let duplicateRowValues: any[][] = []

		for (const gdIndex of groupedDataIndexes) {
			let value: any[] = []
			for (const cIndex of columnIndexes) {
				const dataRow = this._current2DArray[gdIndex]
				if (!Array.isArray(dataRow) || cIndex >= dataRow.length) {
					throw [this._extractFieldValueFromGroupedData.name, `dataRow and or column index ${cIndex} not valid`]
				}

				if (Array.isArray(dataRow[cIndex])) {
					value.push(...dataRow[cIndex])
					continue
				}
				value.push(dataRow[cIndex])
			}

			duplicateRowValues = [...structuredClone(duplicateRowValues), value]
		}

		if (duplicateRowValues.length > 0) {
			for (let drvIndex = 0; drvIndex < duplicateRowValues.length; drvIndex++) {
				if (!Json.AreValuesEqual(duplicateRowValues[0], duplicateRowValues[drvIndex])) {
					throw [this._extractFieldValueFromGroupedData.name, 'duplicateRowValues not equal', duplicateRowValues, 'groupedDataIndexes', groupedDataIndexes, 'columnIndexes', columnIndexes]
				}
			}
		}

		let duplicatedRowIsEmpty = true
		for (const value of duplicateRowValues[0]) {
			if (value !== null && typeof value !== 'undefined') {
				duplicatedRowIsEmpty = false
				break
			}
		}

		return !duplicatedRowIsEmpty ? duplicateRowValues[0] : []
	}

	/**
	 * @throws {MetadataModel.Error} if {@linkcode Convert2DArrayToObjects._getPrimaryKeysValuesFromDataRow} throws an error.
	 * @param gConversion
	 * @param current2DArrayRowIndexes
	 * @returns
	 */
	private _groupDataByPrimaryKeys(gConversion: IGroupConversion, current2DArrayRowIndexes: number[]) {
		let groupedDataIndexes: number[][] = []
		let currentDataIndexesProcessed: number[] = []
		let currentGroupDataIndexesRow = 0

		for (const cdIndex of current2DArrayRowIndexes) {
			if (currentDataIndexesProcessed.includes(cdIndex)) {
				continue
			}
			currentDataIndexesProcessed.push(cdIndex)

			groupedDataIndexes.push([cdIndex])
			for (const compCdIndex of current2DArrayRowIndexes) {
				if (currentDataIndexesProcessed.includes(compCdIndex)) {
					continue
				}

				try {
					const cdPrimaryKeyValues = this._getPrimaryKeysValuesFromDataRow(gConversion.fields_2d_primary_key_indexes, cdIndex)
					const compCdPrimaryKeyValues = this._getPrimaryKeysValuesFromDataRow(gConversion.fields_2d_primary_key_indexes, compCdIndex)

					if (Json.AreValuesEqual(cdPrimaryKeyValues, compCdPrimaryKeyValues)) {
						currentDataIndexesProcessed.push(compCdIndex)
						groupedDataIndexes[currentGroupDataIndexesRow].push(compCdIndex)
					}
				} catch (e) {
					throw e
				}
			}

			currentGroupDataIndexesRow += 1
		}

		return groupedDataIndexes
	}

	/**
	 *
	 * @throws {MetadataModel.Error} if current2DArrayRow is not valid.
	 *
	 * @param fieldPrimaryKeysIndexes
	 * @param dataRowIndex
	 * @returns
	 */
	private _getPrimaryKeysValuesFromDataRow(fieldPrimaryKeysIndexes: number[], dataRowIndex: number) {
		let primaryKeysValues: any[] = []

		for (const fcpkIndex of fieldPrimaryKeysIndexes) {
			const current2DArrayRow = this._current2DArray[dataRowIndex]
			if (Array.isArray(current2DArrayRow) && fcpkIndex < current2DArrayRow.length) {
				primaryKeysValues.push(structuredClone(current2DArrayRow[fcpkIndex]))
				continue
			}
			throw [this._getPrimaryKeysValuesFromDataRow.name, 'current2DArrayRow is not valid', structuredClone(current2DArrayRow)]
		}

		return primaryKeysValues
	}

	private _get2DFieldsIndexesFromCurrentGroupIndexes(currentGroupIndexes: number[], fgKey: string) {
		let fields2DIndexes: number[] = []

		for (const fgIndex of currentGroupIndexes) {
			if (!MetadataModel.IsGroupFieldsValid(this._2DFields[fgIndex])) {
				throw [this._get2DFieldsIndexesFromCurrentGroupIndexes.name, `${fgIndex} Field is not an object`, structuredClone(this._2DFields[fgIndex])]
			}

			if (this._2DFields[fgIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY] === fgKey) {
				fields2DIndexes.push(fgIndex)
			}
		}

		return fields2DIndexes
	}

	private _getPrimaryKey2DFieldsIndexes(mmGroup: MetadataModel.IMetadataModel | any) {
		const mmGroupFields = mmGroup[MetadataModel.FgProperties.GROUP_FIELDS][0]
		if (!MetadataModel.IsGroupFieldsValid(mmGroupFields)) {
			throw [this._getPrimaryKey2DFieldsIndexes.name, `argument mmGroup[${MetadataModel.FgProperties.GROUP_FIELDS}][0] is not an object`, structuredClone(mmGroupFields)]
		}

		const mmGroupReadOrderOfFields = mmGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]
		if (!MetadataModel.IsGroupReadOrderOfFieldsValid(mmGroupReadOrderOfFields)) {
			throw [this._getPrimaryKey2DFieldsIndexes.name, `argument mmGroup.${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS} is not an array`, structuredClone(mmGroupReadOrderOfFields)]
		}

		let primaryKeyIndexes: number[] = []

		for (const fgKey of mmGroupReadOrderOfFields) {
			if (!MetadataModel.IsGroupFieldsValid(mmGroupFields[fgKey])) {
				throw [this._getPrimaryKey2DFieldsIndexes.name, 'mmGroupFields[fgKey] is not an object', structuredClone(mmGroupFields[fgKey])]
			}

			if (!MetadataModel.IsFieldGroupKeyValid(mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_KEY])) {
				throw [this._getPrimaryKey2DFieldsIndexes.name, `mmGroupFields[fgKey][${MetadataModel.FgProperties.FIELD_GROUP_KEY} ]is not a string`]
			}

			if (mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_IS_PRIMARY_KEY] === true) {
				if (Array.isArray(mmGroupFields[fgKey][MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
					primaryKeyIndexes.push(...this._getPrimaryKey2DFieldsIndexes(mmGroupFields[fgKey]))
					continue
				}

				for (let fieldIndex = 0; fieldIndex < this._2DFields.length; fieldIndex++) {
					if (!MetadataModel.IsGroupFieldsValid(this._2DFields[fieldIndex])) {
						throw [this._getPrimaryKey2DFieldsIndexes.name, `this._2DFields[${fieldIndex}] is not an object`, this._2DFields[fieldIndex]]
					}

					if (mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_KEY] === this._2DFields[fieldIndex][MetadataModel.FgProperties.FIELD_GROUP_KEY]) {
						primaryKeyIndexes.push(fieldIndex)
					}
				}
			}
		}

		return primaryKeyIndexes
	}
}
