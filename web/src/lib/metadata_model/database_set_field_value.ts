import Json from '../json'
import MetadataModel from '.'

/**
 * Sets the value of a field with database properties
 *
 * @throws {MetadataModel.Error} if arguments are not vald or column is not found.
 *
 * @param metadatamodel Expected to be presented as if converted from JSON.
 * @param columnFieldName database column/field to match against retrieved Database Column Fields when {@linkcode_MetadataModel.DatabaseGetColumnFields} is called.
 * @param tableCollectionName Extract only fields whose {@linkcode FgProperties.DATABASE_TABLE_COLLECTION_NAME} match this value.
 * @param valueToSetIn
 * @param value
 * @param skipIfFGDisabled Do not include field if property {@linkcode FgProperties.FIELD_GROUP_VIEW_DISABLE}($FG_VIEW_DISABLE) is true. Default false.
 * @param skipIfDataExtraction Do not include field if property {@linkcode FgProperties.FIELD_GROUP_SKIP_DATA_EXTRACTION}($FG_SKIP_DATA_EXTRACTION) is true. Default false.
 * @returns Updated {@linkcode valueToSetIn}
 */
export function DatabaseSetColumnFieldValue(metadatamodel: any, columnFieldName: string, tableCollectionName: string, valueToSetIn: any, value: any, skipIfFGDisabled: boolean = false, skipIfDataExtraction: boolean = false) {
	if (!MetadataModel.IsGroupFieldsValid(metadatamodel)) {
		throw [DatabaseSetColumnFieldValue.name, 'argument metadatamodel is not an object']
	}

	if (typeof columnFieldName !== 'string') {
		throw [DatabaseSetColumnFieldValue.name, 'argument columnFieldName is not a string']
	}

	if (typeof tableCollectionName !== 'string') {
		throw [DatabaseSetColumnFieldValue.name, 'argument tableCollectionName is not a string']
	}

	let databseColumnFields: MetadataModel.IDatabaseColumnFields
	try {
		databseColumnFields = MetadataModel.DatabaseGetColumnFields(metadatamodel, tableCollectionName, skipIfFGDisabled, skipIfDataExtraction)
	} catch (e) {
		throw e
	}

	let columnField = databseColumnFields.fields[columnFieldName]
	if (typeof columnField !== 'object') {
		throw [DatabaseSetColumnFieldValue.name, 'column ${columnField} not found among list of databseColumnFields.fields']
	}

	const pathToColumnFieldValue = (columnField[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string)
		.replace(/\.\$G_FIELDS\[\*\]/, '')
		.replace(new RegExp(MetadataModel.GROUP_FIELDS_REGEX_SEARCH, 'g'), '')
		.replace(new RegExp(MetadataModel.ARRAY_PATH_REGEX_SEARCH, 'g'), '[0]')

	try {
		return Json.SetValueInObject(valueToSetIn, pathToColumnFieldValue, Array.isArray(value) ? value : [value])
	} catch (e) {
		throw e
	}
}
