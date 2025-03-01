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
export function DatabaseSetColumnFieldValue(metadatamodel: any, columnFieldName: string, tableCollectionUID: string, valueToSetIn: any, value: any, skipIfFGDisabled: boolean = false, skipIfDataExtraction: boolean = false) {
	if (!MetadataModel.IsGroupFieldsValid(metadatamodel)) {
		throw [DatabaseSetColumnFieldValue.name, 'argument metadatamodel is not an object']
	}

	if (typeof columnFieldName !== 'string') {
		throw [DatabaseSetColumnFieldValue.name, 'argument columnFieldName is not a string']
	}

	if (typeof tableCollectionUID !== 'string') {
		throw [DatabaseSetColumnFieldValue.name, 'argument tableCollectionUID is not a string']
	}

	let databseColumnFields: MetadataModel.IDatabaseColumnFields
	try {
		databseColumnFields = MetadataModel.DatabaseGetColumnFields(metadatamodel, tableCollectionUID, skipIfFGDisabled, skipIfDataExtraction)
	} catch (e) {
		throw e
	}

	let columnField = databseColumnFields.fields[columnFieldName]
	if (typeof columnField !== 'object') {
		throw [DatabaseSetColumnFieldValue.name, 'column ${columnField} not found among list of databseColumnFields.fields']
	}

	const pathToColumnFieldValue = (columnField[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string)
		.replace(/\.\$GROUP_FIELDS\[\*\]/, '')
		.replace(new RegExp(MetadataModel.GROUP_FIELDS_REGEX_SEARCH, 'g'), '')
		.replace(new RegExp(MetadataModel.ARRAY_PATH_REGEX_SEARCH, 'g'), '[0]')

	try {
		return Json.SetValueInObject(valueToSetIn, pathToColumnFieldValue, Array.isArray(value) ? value : [value])
	} catch (e) {
		throw e
	}
}

export function DatabaseGetColumnFieldValue(metadatamodel: any, columnFieldName: string, tableCollectionUID: string, valueToGetFrom: any, skipIfFGDisabled: boolean = false, skipIfDataExtraction: boolean = false) {
    if (!MetadataModel.IsGroupFieldsValid(metadatamodel)) {
        throw 'argument metadatamodel is not an object.'
    }

    if (typeof columnFieldName !== 'string') {
        throw 'argument columnFieldName is not a string.'
    }

    if (typeof tableCollectionUID !== 'string') {
        throw 'argument tableCollectionUID is not a string.'
    }

    let databseColumnFields: MetadataModel.IDatabaseColumnFields
    try {
        databseColumnFields = MetadataModel.DatabaseGetColumnFields(metadatamodel,tableCollectionUID, skipIfFGDisabled, skipIfDataExtraction)
    } catch (e) {
        throw e
    }

    let columnField = databseColumnFields.fields[columnFieldName]
    if (typeof columnField !== 'object') {
        throw `column ${columnField} not found among list of databseColumnFields.fields`
    }

    const pathToColumnFieldValue = (columnField[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string)
        .replace(/\.\$GROUP_FIELDS\[\*\]/, '')
        .replace(new RegExp(MetadataModel.GROUP_FIELDS_REGEX_SEARCH, 'g'), '')
        .replace(new RegExp(MetadataModel.ARRAY_PATH_REGEX_SEARCH, 'g'), '[0]')

    try {
        return Json.GetValueInObject(valueToGetFrom, pathToColumnFieldValue)
    } catch (e) {
        throw e
    }
}

export function DatabaseDeleteColumnFieldValue(metadatamodel: any, columnFieldName: string, tableCollectionUID: string, valueToGetIn: any, skipIfFGDisabled: boolean = false, skipIfDataExtraction: boolean = false) {
    if (!MetadataModel.IsGroupFieldsValid(metadatamodel)) {
        throw 'argument metadatamodel is not an object.'
    }

    if (typeof columnFieldName !== 'string') {
        throw 'argument columnFieldName is not a string.'
    }

    if (typeof tableCollectionUID !== 'string') {
        throw 'argument tableCollectionUID is not a string.'
    }

    let databseColumnFields: MetadataModel.IDatabaseColumnFields
    try {
        databseColumnFields = MetadataModel.DatabaseGetColumnFields(metadatamodel, tableCollectionUID, skipIfFGDisabled, skipIfDataExtraction)
    } catch (e) {
        throw e
    }

    let columnField = databseColumnFields.fields[columnFieldName]
    if (typeof columnField !== 'object') {
        throw `column ${columnField} not found among list of databseColumnFields.fields`
    }

    const pathToColumnFieldValue = (columnField[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string)
        .replace(/\.\$GROUP_FIELDS\[\*\]/, '')
        .replace(new RegExp(MetadataModel.GROUP_FIELDS_REGEX_SEARCH, 'g'), '')
        .replace(new RegExp(MetadataModel.ARRAY_PATH_REGEX_SEARCH, 'g'), '[0]')

    try {
        return Json.DeleteValueInObject(valueToGetIn, pathToColumnFieldValue)
    } catch (e) {
        throw e
    }
}
