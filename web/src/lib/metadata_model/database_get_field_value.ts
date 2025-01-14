import Json from '../json'
import MetadataModel from '.'

export function DatabaseGetColumnFieldValue(metadatamodel: any, columnFieldName: string, tableCollectionName: string, valueToGetFrom: any, skipIfFGDisabled: boolean = false, skipIfDataExtraction: boolean = false) {
	if (!MetadataModel.isGroupFieldsValid(metadatamodel)) {
		throw 'argument metadatamodel is not an object.'
	}

	if (typeof columnFieldName !== 'string') {
		throw 'argument columnFieldName is not a string.'
	}

	if (typeof tableCollectionName !== 'string') {
		throw 'argument tableCollectionName is not a string.'
	}

	let databseColumnFields: MetadataModel.IDatabaseColumnFields
	try {
		databseColumnFields = MetadataModel.DatabaseGetColumnFields(metadatamodel, tableCollectionName, skipIfFGDisabled, skipIfDataExtraction)
	} catch (e) {
		throw e
	}

	let columnField = databseColumnFields.fields[columnFieldName]
	if (typeof columnField !== 'object') {
		throw `column ${columnField} not found among list of databseColumnFields.fields`
	}

	const pathToColumnFieldValue = (columnField[MetadataModel.FgProperties.FIELD_GROUP_KEY] as string)
		.replace(/\.\$G_FIELDS\[\*\]/, '')
		.replace(new RegExp(MetadataModel.GROUP_FIELDS_REGEX_SEARCH, 'g'), '')
		.replace(new RegExp(MetadataModel.ARRAY_PATH_REGEX_SEARCH, 'g'), '[0]')

	try {
		return Json.GetValueInObject(valueToGetFrom, pathToColumnFieldValue)
	} catch (e) {
		throw e
	}
}
