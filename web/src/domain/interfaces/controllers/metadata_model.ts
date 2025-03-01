import MetadataModel from '@lib/metadata_model'

export interface IMetadataModelController {
	searchmetadatamodel: any
	searchresults: MetadataModel.ISearchResults

    FetchMetadataModel: (authContextDirectoryGroupID: string | undefined, targetJoinDepth: number | undefined, signal: AbortSignal | null | undefined) => void
    Search: (queryConditions: MetadataModel.QueryConditions[], authContextDirectoryGroupID: string | undefined, targetJoinDepth: number | undefined, signal: AbortSignal | null | undefined) => void
}
