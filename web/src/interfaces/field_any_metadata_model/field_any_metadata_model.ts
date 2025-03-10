import Entities from '@domentities'
import { IFieldAnyMetadataModelGet } from '@dominterfaces/field_any_metadata_model/field_any_metadata_model'
import Log from '@lib/log'
import Url from '@lib/url'

export class FieldAnyMetadataModel implements IFieldAnyMetadataModelGet {
	async GetMetadataModel(actionID: string, currentFgKey: string, tableCollectionUid: string, argument: any) {
		Log.Log(Log.Level.DEBUG, FieldAnyMetadataModel.name, actionID, currentFgKey, tableCollectionUid, argument)
		try {
			switch (actionID) {
				case Entities.MetadataModelsDirectoryGroups.RepositoryName:
				case Entities.MetadataModelsDirectory.RepositoryName:
					if (!Array.isArray(argument) || argument.length != 1) {
						return undefined
					}
					const fetchUrl = new URL(Url.ApiUrlPaths.MetadataModel)
					fetchUrl.pathname = fetchUrl.pathname + `/${actionID}/${argument[0]}`
					const fetchResponse = await fetch(fetchUrl, {
						credentials: 'include'
					})
					let data = await fetchResponse.json()
					if (fetchResponse.ok) {
						if (typeof data !== 'object') {
							return undefined
						}
						return data
					} else {
						throw [fetchResponse.status, data]
					}
				default:
					return undefined
			}
		} catch (e) {
			console.error(e)
			return undefined
		}
	}
}

// const data = {
// 	$FIELD_GROUP_KEY: '$',
// 	$FIELD_GROUP_NAME: 'Metadata Models Directory',
// 	$FIELD_GROUP_DESCRIPTION: 'Metadata model to use when working with directory data in a particular group.',
// 	$FIELD_GROUP_MAX_ENTRIES: 1,
// 	$GROUP_FIELDS: [
// 		{
// 			directory_groups_id: {
// 				$FIELD_GROUP_KEY: '$.$GROUP_FIELDS[*].directory_groups_id',
// 				$FIELD_GROUP_NAME: 'directory groups id',
// 				$FIELD_GROUP_MAX_ENTRIES: 1,
// 				$FIELD_DATATYPE: 'text',
// 				$FIELD_UI: 'text',
// 				$DATABASE_TABLE_COLLECTION_UID: 'metadata_models_directory',
// 				$DATABASE_FIELD_COLUMN_NAME: 'directory_groups_id',
// 				$FIELD_GROUP_INPUT_DISABLE: true,
// 				$FIELD_GROUP_IS_PRIMARY_KEY: true
// 			},
// 			metadata_models_id: {
// 				$FIELD_GROUP_KEY: '$.$GROUP_FIELDS[*].metadata_models_id',
// 				$FIELD_GROUP_NAME: 'metadata models id',
// 				$FIELD_GROUP_MAX_ENTRIES: 1,
// 				$FIELD_DATATYPE: 'text',
// 				$FIELD_UI: 'text',
// 				$DATABASE_TABLE_COLLECTION_UID: 'metadata_models_directory',
// 				$DATABASE_FIELD_COLUMN_NAME: 'metadata_models_id',
// 				$FIELD_GROUP_INPUT_DISABLE: true
// 			},
// 			created_on: {
// 				$FIELD_GROUP_KEY: '$.$GROUP_FIELDS[*].created_on',
// 				$FIELD_GROUP_NAME: 'created on',
// 				$FIELD_GROUP_MAX_ENTRIES: 1,
// 				$FIELD_DATATYPE: 'timestamp',
// 				$FIELD_UI: 'datetime',
// 				$FIELD_DATETIME_FORMAT: 'yyyy-mm-dd hh:mm',
// 				$DATABASE_TABLE_COLLECTION_UID: 'metadata_models_directory',
// 				$DATABASE_FIELD_COLUMN_NAME: 'created_on',
// 				$FIELD_GROUP_INPUT_DISABLE: true
// 			},
// 			last_updated_on: {
// 				$FIELD_GROUP_KEY: '$.$GROUP_FIELDS[*].last_updated_on',
// 				$FIELD_GROUP_NAME: 'last updated on',
// 				$FIELD_GROUP_MAX_ENTRIES: 1,
// 				$FIELD_DATATYPE: 'timestamp',
// 				$FIELD_UI: 'datetime',
// 				$FIELD_DATETIME_FORMAT: 'yyyy-mm-dd hh:mm',
// 				$DATABASE_TABLE_COLLECTION_UID: 'metadata_models_directory',
// 				$DATABASE_FIELD_COLUMN_NAME: 'last_updated_on',
// 				$FIELD_GROUP_INPUT_DISABLE: true
// 			}
// 		}
// 	],
// 	$GROUP_READ_ORDER_OF_FIELDS: ['directory_groups_id', 'metadata_models_id', 'created_on', 'last_updated_on'],
// 	$DATABASE_TABLE_COLLECTION_UID: 'metadata_models_directory',
// 	$DATABASE_TABLE_COLLECTION_NAME: 'metadata_models_directory'
// }
// return data
