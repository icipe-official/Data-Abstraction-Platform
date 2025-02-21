import MetadataModel from '.'

/**
 * Extracts database fields from {@linkcode metadatamodel} if {@linkcode tableCollectionName} matches.
 *
 * Throws an error if {@linkcode metadatamodel} or {@linkcode tableCollectionName} is not valid.
 *
 * Will not add field if {@linkcode FgProperties.DATABASE_FIELD_COLUMN_NAME} is not found or duplicate is detected.
 *
 * @param metadatamodel Expected to be presented as if converted from JSON.
 * @param tableCollectionName Extract only fields whose {@linkcode FgProperties.DATABASE_TABLE_COLLECTION_NAME} match this value.
 * @param tableCollectionUID Extract only fields whose {@linkcode FgProperties.DATABASE_TABLE_COLLECTION_UID} match this value.
 * @param skipIfFGDisabled Do not include field if property {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE}($FG_VIEW_DISABLE) is true. Default false.
 * @param skipIfDataExtraction Do not include field if property {@linkcode FgProperties.FIELD_GROUP_SKIP_DATA_EXTRACTION}($FG_SKIP_DATA_EXTRACTION) is true. Default false.
 * @returns Database column fields with their properties as well as their read order.DatabaseSetFieldValue
 */
export function DatabaseGetColumnFields(metadatamodel: MetadataModel.IMetadataModel | any, tableCollectionName: string, tableCollectionUID: string | undefined, skipIfFGDisabled: boolean = false, skipIfDataExtraction: boolean = false): MetadataModel.IDatabaseColumnFields {
	if (typeof tableCollectionName !== 'string') {
		throw 'argument tableCollectionName is not a string.'
	}

	try {
		let x = new _(tableCollectionName, tableCollectionUID, skipIfFGDisabled, skipIfDataExtraction)
		x.GetDatabaseColumnFields(metadatamodel)
		return x.DatabaseColumnFields
	} catch (e) {
		throw e
	}
}

class _ {
	private _databaseColumnFields: MetadataModel.IDatabaseColumnFields = {
		column_fields_read_order: [],
		fields: {}
	}
	private _tableCollectionName: string
	private _tableCollectionUID: string | undefined
	private _skipIfFGDisabled: boolean = true
	private _skipIfDataExtraction: boolean = true

	constructor(tableCollectionName: string, tableCollectionUID: string | undefined, skipIfFGDisabled: boolean = false, skipIfDataExtraction: boolean = false) {
		this._tableCollectionName = tableCollectionName
		this._tableCollectionUID = tableCollectionUID
		this._skipIfFGDisabled = skipIfFGDisabled
		this._skipIfDataExtraction = skipIfDataExtraction
	}

	get DatabaseColumnFields() {
		return this._databaseColumnFields
	}

	/**
	 *
	 * @param mmGroup Current Metadata Model Group
	 *
	 * mm - Alias for metadata model
	 *
	 * fg - Alias for field group
	 */
	GetDatabaseColumnFields(mmGroup: MetadataModel.IMetadataModel | any) {
		if (!MetadataModel.IsGroupFieldsValid(mmGroup)) {
			throw `${this.GetDatabaseColumnFields.name}: argument mmGroup is not an object.`
		}

		const mmGroupFields = mmGroup[MetadataModel.FgProperties.GROUP_FIELDS][0]
		if (!MetadataModel.IsGroupFieldsValid(mmGroupFields)) {
			throw `${this.GetDatabaseColumnFields.name}: argument mmGroup ${MetadataModel.FgProperties.GROUP_FIELDS}[0] is not an object.`
		}

		const mmGroupReadOrderOfFields = mmGroup[MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS]
		if (!MetadataModel.IsGroupReadOrderOfFieldsValid(mmGroupReadOrderOfFields)) {
			throw `${this.GetDatabaseColumnFields.name}: argument mmGroup ${MetadataModel.FgProperties.GROUP_READ_ORDER_OF_FIELDS} is not an array.`
		}

		for (const fgKey of mmGroupReadOrderOfFields) {
			if (!MetadataModel.IsGroupFieldsValid(mmGroupFields[fgKey])) {
				continue
			}

			if ((this._skipIfDataExtraction && mmGroupFields[fgKey][MetadataModel.FgProperties.DATABASE_SKIP_DATA_EXTRACTION]) || (this._skipIfFGDisabled && mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_VIEW_DISABLE])) {
				continue
			}

			if (typeof mmGroupFields[fgKey][MetadataModel.FgProperties.FIELD_GROUP_KEY] !== 'string') {
				continue
			}

			if (typeof mmGroupFields[fgKey][MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === 'string' && mmGroupFields[fgKey][MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_NAME] === this._tableCollectionName) {
				if (typeof this._tableCollectionUID === 'string') {
					if (typeof mmGroupFields[fgKey][MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] !== 'string' || mmGroupFields[fgKey][MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] !== this._tableCollectionUID) {
						continue
					}
				}

				if (Array.isArray(mmGroupFields[fgKey][MetadataModel.FgProperties.GROUP_FIELDS]) && typeof mmGroupFields[fgKey][MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME] === 'undefined') {
					this.GetDatabaseColumnFields(mmGroupFields[fgKey])
					continue
				}

				const fieldColumnName = mmGroupFields[fgKey][MetadataModel.FgProperties.DATABASE_FIELD_COLUMN_NAME]
				if (typeof fieldColumnName !== 'string' || fieldColumnName.length === 0) {
					console.warn(`field column name for key ${fgKey} not found or empty!`, structuredClone(mmGroupFields[fgKey]))
					continue
				}

				if (typeof this._databaseColumnFields.fields[fieldColumnName] === 'object') {
					console.warn(`duplicate field column name ${fieldColumnName} detected!`, structuredClone(this._databaseColumnFields), structuredClone(mmGroup))
					continue
				}

				this._databaseColumnFields.column_fields_read_order.push(fieldColumnName)
				this._databaseColumnFields.fields[fieldColumnName] = structuredClone(mmGroupFields[fgKey])
			}
		}
	}
}
