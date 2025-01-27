import Json from '../json'
import MetadataModel from '.'

interface IFieldGroupConversion {
	field_group_key?: string
	fielg_group_sep_cols_max_values?: number
	field_groups?: IFieldGroupConversion[]
	group_read_order_of_fields?: string[]
}

/**
 *  Converts an object or array of objects into a 2D array following the metadata-model structure.
 *
 * @throws {MetadataModel.Error}
 */
export class ConvertObjectsTo2DArray {
	private _array2D: any[][] = []
	private _skipIfFGDisabled: boolean = true
	private _skipIfDataExtraction: boolean = true
	private _fgConversion: IFieldGroupConversion
	private _currentDatum: any
	private _reorder2DFields: MetadataModel.Reorder2DFields | undefined

	get Array2D() {
		return this._array2D
	}

	ResetArray2D() {
		this._array2D = []
	}

	/**
	 * @throws {MetadataModel.Error} if {@linkcode ConvertObjectsTo2DArray._initFgConversion} throws an error.
	 *
	 * @param metadatamodel
	 * @param skipIfFGDisabled Do not include field group if property {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE}($FG_VIEW_DISABLE) is true. Default tru
	 * @param skipIfDataExtraction Do not include field group if property {@linkcode FgProperties.DATABASE_SKIP_DATA_EXTRACTION}($FG_SKIP_DATA_EXTRACTION) is true. Default true.
	 */
	constructor(metadatamodel: any, target2DFields: any[] | undefined = undefined, skipIfFGDisabled: boolean = true, skipIfDataExtraction: boolean = true) {
		this._skipIfFGDisabled = skipIfFGDisabled
		this._skipIfDataExtraction = skipIfDataExtraction
		try {
			this._fgConversion = this._initFgConversion(metadatamodel)

			let extract2DFields = new MetadataModel.Extract2DFields(metadatamodel, skipIfFGDisabled, skipIfDataExtraction, true)
			extract2DFields.Extract()
			const dataFields = extract2DFields.FieldsWithSkippedRemoved

			if (Array.isArray(target2DFields)) {
				this._reorder2DFields = new MetadataModel.Reorder2DFields(dataFields, target2DFields)
			} else {
				if (Object.keys(extract2DFields.RepositionFields).length > 0) {
					extract2DFields.Reposition()
					extract2DFields.RemoveSkipped()
					this._reorder2DFields = new MetadataModel.Reorder2DFields(dataFields, extract2DFields.Fields)
				}
			}
		} catch (e) {
			throw e
		}
	}

	/**
	 * Recursive function that setups the necessary information required to convert objects to 2D array. Initializes {@linkcode ConvertObjectsTo2DArray._fgConversion}.
	 *
	 * @throws {MetadataModel.Error} if {@linkcode mmGroup} is not valid.
	 *
	 * Will skip fields/groups if {@linkcode ConvertObjectsTo2DArray._skipIfDataExtraction} or {@linkcode ConvertObjectsTo2DArray._skipIfFGDisabled} is true and the corresponding properties are encountered.
	 *
	 * @param mmGroup Current metadata model Group to get conversion information.
	 * @returns
	 */
	private _initFgConversion(mmGroup: MetadataModel.IMetadataModel | any) {
		let mmGroupsConversion: IFieldGroupConversion = {}

		const mmGroupFields = mmGroup[MetadataModel.FgProperties.GROUP_FIELDS][0]
		if (!MetadataModel.IsGroupFieldsValid(mmGroupFields)) {
			throw [this._initFgConversion.name, 'mmGroupFields is not an object', structuredClone(mmGroupFields)]
		}

		const mmGroupReadOrderOfFields = mmGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]
		if (!MetadataModel.IsGroupReadOrderOfFieldsValid(mmGroupReadOrderOfFields)) {
			throw [this._initFgConversion.name, 'mmGroupReadOrderOfFields is not an array', structuredClone(mmGroupReadOrderOfFields)]
		}

		mmGroupsConversion.field_groups = []
		for (const fgKey of mmGroupReadOrderOfFields) {
			if (!MetadataModel.IsGroupFieldsValid(mmGroupFields[fgKey])) {
				throw [this._initFgConversion.name, `mmGroupFields[${fgKey}] is not an object`, structuredClone(mmGroupFields[fgKey])]
			}

			if ((this._skipIfDataExtraction && mmGroupFields[fgKey][MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]) || (this._skipIfFGDisabled && mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE])) continue

			if (typeof mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_KEY] !== 'string') {
				throw [this._initFgConversion.name, `mmGroupFields[${fgKey}][${MetadataModel.FgProperties.FIELD_GROUP_KEY}] is not a string`, mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_KEY]]
			}

			let newFieldGroupConversion: IFieldGroupConversion = {
				field_group_key: mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_KEY]
			}

			if (Array.isArray(mmGroupFields[fgKey][MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS])) {
				newFieldGroupConversion.group_read_order_of_fields = mmGroupFields[fgKey][MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]
				if (
					MetadataModel.GroupCanBeProcessedAs2D(mmGroupFields[fgKey]) &&
					mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] &&
					!Number.isNaN(mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]) &&
					mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS] > 0
				) {
					newFieldGroupConversion.fielg_group_sep_cols_max_values = Number(mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]) - 1
				} else {
					newFieldGroupConversion.field_groups = this._initFgConversion(mmGroupFields[fgKey]).field_groups
				}
			} else {
				if (
					mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_VIEW_VALUES_IN_SEPARATE_COLUMNS] &&
					!Number.isNaN(mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]) &&
					mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS] > 0
				) {
					newFieldGroupConversion.fielg_group_sep_cols_max_values = Number(mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS]) - 1
				}
			}

			mmGroupsConversion.field_groups.push(newFieldGroupConversion)
		}

		return mmGroupsConversion
	}

	/**
	 * Converts Data into a 2D array.
	 *
	 * @throws {MetadataModel.Error} if:
	 * * {@linkcode data} is not valid.
	 * * {@linkcode ConvertObjectsTo2DArray._convert} throws an error.
	 *
	 * @param data Array of objects to convert.
	 */
	Convert(data: any[]) {
		if (!Array.isArray(data)) {
			throw [this.Convert.name, 'datum is not an array']
		}

		for (let datum of data) {
			if (typeof datum !== 'object' || datum == null || Array.isArray(datum)) {
				throw [this.Convert.name, 'datum is not an object']
			}

			try {
				this._currentDatum = structuredClone(datum)

				let datum2DArray = this._convert([[]], this._fgConversion, [0])
				if (this._reorder2DFields instanceof MetadataModel.Reorder2DFields) {
					this._reorder2DFields.Reorder(datum2DArray)
				}
				this._array2D = [...this._array2D, ...datum2DArray]

				this._currentDatum = {}
			} catch (e) {
				throw e
			}
		}
	}

	/**
	 * Recursive function that converts object into 2D array and returns it.
	 *
	 * @throws {MetadataModel.Error} if {@linkcode gConversion} is not valid.
	 *
	 * @param datumObject2DArray current 2DArray to merge data into.
	 * @param gConversion current groupConversion information.
	 * @param arrayIndexes current array indexes of objects' data to replace {@linkcode MetadataModel.ARRAY_INDEX_PLACEHOLDER} with.
	 * @returns
	 */
	private _convert(datumObject2DArray: any[][], gConversion: IFieldGroupConversion, arrayIndexes: number[]) {
		if (typeof gConversion.field_groups === 'undefined') {
			throw [this._convert.name, 'mmGroupConversion.field_groups is undefined']
		}

		for (const fgConversion of gConversion.field_groups) {
			if (typeof fgConversion.field_group_key !== 'string') {
				throw [this._convert.name, 'fgConversion.field_group_key is not a string']
			}

			const valueInObject = Json.GetValueInObject(this._currentDatum, MetadataModel.PreparePathToValueInObject(fgConversion.field_group_key, arrayIndexes))

			if (Array.isArray(fgConversion.group_read_order_of_fields)) {
				if (typeof fgConversion.fielg_group_sep_cols_max_values === 'number' && fgConversion.fielg_group_sep_cols_max_values > 0) {
					let newValueInObject: any[] = []

					for (let i = 0; i <= fgConversion.fielg_group_sep_cols_max_values; i++) {
						for (const _ of fgConversion.group_read_order_of_fields) {
							newValueInObject = [...newValueInObject, undefined]
						}
					}

					if (Array.isArray(valueInObject) && valueInObject.length > 0) {
						let startIndexOfValueInObject = 0
						for (let vioIndex = 0; vioIndex < valueInObject.length; vioIndex++) {
							for (const fgKey of fgConversion.group_read_order_of_fields) {
								newValueInObject[startIndexOfValueInObject] = Json.GetValueInObject(valueInObject, `$.${vioIndex}.${fgKey}`)
								startIndexOfValueInObject += 1
							}
						}
					}

					datumObject2DArray = this._merge2DArrays(datumObject2DArray, [newValueInObject])
					continue
				}

				if (Array.isArray(valueInObject) && valueInObject.length > 0) {
					let new2DArray: any[][] = []
					for (let vioIndex = 0; vioIndex < valueInObject.length; vioIndex++) {
						new2DArray = [...structuredClone(new2DArray), ...this._convert(datumObject2DArray, fgConversion, [...arrayIndexes, vioIndex])]
					}
					datumObject2DArray = new2DArray
					continue
				}

				datumObject2DArray = this._convert(datumObject2DArray, fgConversion, [...arrayIndexes, 0])

				continue
			}

			if (typeof fgConversion.fielg_group_sep_cols_max_values === 'number' && fgConversion.fielg_group_sep_cols_max_values > 0) {
				let newValueInObject: any[] = []

				for (let i = 0; i <= fgConversion.fielg_group_sep_cols_max_values; i++) {
					newValueInObject = [...newValueInObject, undefined]
				}
				if (Array.isArray(valueInObject) && valueInObject.length > 0) {
					for (let vioIndex = 0; vioIndex < valueInObject.length; vioIndex++) {
						newValueInObject[vioIndex] = valueInObject[vioIndex]
					}
				}

				datumObject2DArray = this._merge2DArrays(datumObject2DArray, [newValueInObject])
				continue
			}

			datumObject2DArray = this._merge2DArrays(datumObject2DArray, [[valueInObject]])
		}

		return datumObject2DArray
	}

	/**
	 * Merges {@linkcode rightArray} into {@linkcode leftArray}.
	 *
	 * For example, if size of {@linkcode leftArray} is 2 and size of {@linkcode rightArray} is 3, the new2Darray will have a size of 6 as each row of {@linkcode leftArray} will be merged with each row of {@linkcode rightArray}.
	 *
	 * @param leftArray Current row of data.
	 * @param rightArray Row of data to merge into {@linkcode leftArray}
	 * @returns
	 */
	private _merge2DArrays(leftArray: any[][], rightArray: any[][]) {
		let new2DArray: any[][] = []

		for (let l = 0; l < leftArray.length; l++) {
			for (let r = 0; r < rightArray.length; r++) {
				new2DArray = [...new2DArray, [...leftArray[l], ...rightArray[r]]]
			}
		}

		return new2DArray
	}
}
