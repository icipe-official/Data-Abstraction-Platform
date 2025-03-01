import { IMetadataModelController } from "@dominterfaces/controllers/metadata_model";
import MetadataModel from "@lib/metadata_model";
import { ReactiveController, ReactiveControllerHost } from "lit";

export const enum SearchParams {
    CURRENT_DIRECTORY_GROUP_ID = 'current_directory_group_id',
    TARGET_JOIN_DEPTH = 'target_join_depth',
    SUB_QUERY = 'sub_query',
    VERBOSE_RESPONSE = 'verbose',
    SKIP_IF_DATA_EXTRACTION = 'skip_if_data_extraction',
    SKIP_IF_FG_DISABLED = 'skip_if_fg_disabled',
    AUTH_CONTEXT_DIRECTORY_GROUP_ID = 'auth_context_directory_group_id',
    START_SEARCH_DIRECTORY_GROUP_ID = 'start_search_directory_group_id'
}

export class MetadataModelController implements ReactiveController, IMetadataModelController {
    private _host: ReactiveControllerHost
    private _searchMetadatamodelUrl: string
    private _searchUrl: string
    searchmetadatamodel: any = {}
    searchresults: MetadataModel.ISearchResults = {}

    constructor(host: ReactiveControllerHost, searchMetadatamodelUrl: string, searchUrl: string) {
        this._host = host
        host.addController(this)
        this._searchMetadatamodelUrl = searchMetadatamodelUrl
        this._searchUrl = searchUrl
    }

    /**
     * 
     * @param authContextDirectoryGroupID 
     * @param targetJoinDepth 
     * @param signal 
     * 
     * 
     * throws error.
     */
    async FetchMetadataModel(authContextDirectoryGroupID: string | undefined = undefined, targetJoinDepth: number | undefined = undefined, signal: AbortSignal | null | undefined) {
        let fetchUrl = new URL(this._searchMetadatamodelUrl)
        if (typeof authContextDirectoryGroupID === 'string' && authContextDirectoryGroupID.length > 0) {
            fetchUrl.searchParams.append(SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authContextDirectoryGroupID)
        }
        if (typeof targetJoinDepth === 'number') {
            fetchUrl.searchParams.append(SearchParams.TARGET_JOIN_DEPTH, `${targetJoinDepth}`)
        }
        const fetchResponse = await fetch(fetchUrl, {
            credentials: "include",
            signal
        })
        const fetchData = await fetchResponse.json()
        if (fetchResponse.ok) {
            this.searchmetadatamodel = structuredClone(fetchData)
            this._host.requestUpdate()
        } else {
            throw [fetchResponse.status, fetchResponse.statusText]
        }
    }

    /**
     * 
     * @param queryConditions 
     * @param authContextDirectoryGroupID 
     * @param targetJoinDepth 
     * @param signal 
     * 
     * 
     * throws error
     */
    async Search(queryConditions: MetadataModel.QueryConditions[], authContextDirectoryGroupID: string | undefined = undefined, targetJoinDepth: number | undefined = undefined, signal: AbortSignal | null | undefined) {
        let metadataModelSearch: MetadataModel.ISearch = {
            metadata_model: this.searchmetadatamodel
        }
        if (Array.isArray(queryConditions) && queryConditions.length > 0) {
            metadataModelSearch.query_conditions = queryConditions
        }

        let fetchUrl = new URL(this._searchUrl)
        if (typeof authContextDirectoryGroupID === 'string' && authContextDirectoryGroupID.length > 0) {
            fetchUrl.searchParams.append(SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authContextDirectoryGroupID)
        }
        if (typeof targetJoinDepth === 'number') {
            fetchUrl.searchParams.append(SearchParams.TARGET_JOIN_DEPTH, `${targetJoinDepth}`)
        }

        const fetchResponse = await fetch(fetchUrl, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(metadataModelSearch),
            signal
        })

        const fetchData = await fetchResponse.json()
        if (fetchResponse.ok) {
            this.searchresults = structuredClone(fetchData)
            this._host.requestUpdate()
        } else {
            throw [fetchResponse.status, fetchResponse.statusText]
        }
    }

    hostConnected(): void {
        
    }

    hostDisconnected(): void {
        
    }
}