import MetadataModel from '@lib/metadata_model'
import Entities from '@domentities'
import { IFieldAnyMetadataModelGet } from '@dominterfaces/field_any_metadata_model/field_any_metadata_model'

export interface IMetadataModelGetController {
	cachemetadatamodels: any

	GetMetadataModel: (fieldAnyMetatadaModel: IFieldAnyMetadataModelGet, actionID: string, currentFgKey: string, tableCollectionUid: string, argument: any) => Promise<void>
	GetPathToCachedMetadataModel: (actionID: string, currentFgKey: string, tableCollectionUid: string, argument: any) => string
}

export interface IMetadataModelSearchController {
	searchmetadatamodel: any
	searchresults: Entities.MetadataModel.ISearchResults

	UpdateMetadatamodel: (value: any) => void
	FetchMetadataModel: (authContextDirectoryGroupID: string | undefined, targetJoinDepth: number | undefined, signal: AbortSignal | null | undefined) => Promise<void>
	Search: (
		queryConditions: MetadataModel.QueryConditions[] | undefined,
		authContextDirectoryGroupID: string | undefined,
		startSearchContextDirectoryGroupID: string | undefined,
		targetJoinDepth: number | undefined,
		skipIfFgDisabled: boolean | undefined,
		skipIfDataExtraction: boolean | undefined,
		signal: AbortSignal | null | undefined
	) => Promise<void>
}
