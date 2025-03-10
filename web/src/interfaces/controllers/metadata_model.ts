import Entities from '@domentities'
import _MetadataModel from '@domentities/metadata_model'
import { IMetadataModelGetController, IMetadataModelSearchController } from '@dominterfaces/controllers/metadata_model'
import { IFieldAnyMetadataModelGet } from '@dominterfaces/field_any_metadata_model/field_any_metadata_model'
import MetadataModel from '@lib/metadata_model'
import { ReactiveController, ReactiveControllerHost } from 'lit'

export class MetadataModelGetController implements ReactiveController, IMetadataModelGetController {
	private _host: ReactiveControllerHost
	cachemetadatamodels: any = {}

	constructor(host: ReactiveControllerHost) {
		this._host = host
		host.addController(this)
	}

	async GetMetadataModel(fieldAnyMetatadaModel: IFieldAnyMetadataModelGet, actionID: string, currentFgKey: string, tableCollectionUid: string, argument: any) {
		if (this.cachemetadatamodels[this.GetPathToCachedMetadataModel(actionID, currentFgKey, tableCollectionUid, argument)]) {
			return structuredClone(this.cachemetadatamodels[this.GetPathToCachedMetadataModel(actionID, currentFgKey, tableCollectionUid, argument)])
		}
		const mm = await fieldAnyMetatadaModel.GetMetadataModel(actionID, currentFgKey, tableCollectionUid, argument)
		if (typeof mm === 'undefined') {
			return undefined
		}
		this.cachemetadatamodels[this.GetPathToCachedMetadataModel(actionID, currentFgKey, tableCollectionUid, argument)] = this._changeMetadataModelFgKeyTableCollectionUid(mm, currentFgKey, tableCollectionUid)
		this.cachemetadatamodels = structuredClone(this.cachemetadatamodels)
		this._host.requestUpdate()
	}

	GetPathToCachedMetadataModel(actionID: string, currentFgKey: string, tableCollectionUid: string, argument: any) {
		return actionID + '/' + (Array.isArray(argument) ? argument.join('/') : `${argument}`) + currentFgKey + '/' + tableCollectionUid + '/'
	}

	private _changeMetadataModelFgKeyTableCollectionUid(metadataModel: any, currentFgKey: string, tableCollectionUid: string) {
		metadataModel[MetadataModel.FgProperties.FIELD_GROUP_KEY] = currentFgKey
		metadataModel[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] = tableCollectionUid
		return MetadataModel.MapFieldGroups(metadataModel, (property: any) => {
			if (tableCollectionUid.length > 0) {
				property[MetadataModel.FgProperties.DATABASE_TABLE_COLLECTION_UID] = tableCollectionUid
			}
			if (typeof property[MetadataModel.FgProperties.FIELD_GROUP_KEY] === 'string') {
				property[MetadataModel.FgProperties.FIELD_GROUP_KEY] = property[MetadataModel.FgProperties.FIELD_GROUP_KEY].replace('$', currentFgKey)
			}

			return property
		})
	}

	hostConnected(): void {}

	hostDisconnected(): void {}
}

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

export class MetadataModelSearchController implements ReactiveController, IMetadataModelSearchController {
	private _host: ReactiveControllerHost
	private _searchMetadatamodelUrl: string
	private _searchUrl: string
	searchmetadatamodel: any = {}
	searchresults: Entities.MetadataModel.ISearchResults = {}

	constructor(host: ReactiveControllerHost, searchMetadatamodelUrl: string, searchUrl: string) {
		this._host = host
		host.addController(this)
		this._searchMetadatamodelUrl = searchMetadatamodelUrl
		this._searchUrl = searchUrl
	}


	UpdateMetadatamodel(value: any) {
		this.searchmetadatamodel = structuredClone(value)
		this._host.requestUpdate()
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
			credentials: 'include',
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
	async Search(
		queryConditions: MetadataModel.QueryConditions[] | undefined,
		authContextDirectoryGroupID: string | undefined,
		startSearchContextDirectoryGroupID: string | undefined,
		targetJoinDepth: number | undefined,
		skipIfFgDisabled: boolean | undefined,
		skipIfDataExtraction: boolean | undefined,
		signal: AbortSignal | null | undefined
	) {
		let metadataModelSearch: Entities.MetadataModel.ISearch = {
			metadata_model: this.searchmetadatamodel
		}
		if (Array.isArray(queryConditions) && queryConditions.length > 0) {
			metadataModelSearch.query_conditions = queryConditions
		}

		let fetchUrl = new URL(this._searchUrl)
		if (typeof authContextDirectoryGroupID === 'string' && authContextDirectoryGroupID.length > 0) {
			fetchUrl.searchParams.append(SearchParams.AUTH_CONTEXT_DIRECTORY_GROUP_ID, authContextDirectoryGroupID)
		}
		if (typeof startSearchContextDirectoryGroupID === 'string' && startSearchContextDirectoryGroupID.length > 0) {
			fetchUrl.searchParams.append(SearchParams.START_SEARCH_DIRECTORY_GROUP_ID, startSearchContextDirectoryGroupID)
		}
		if (typeof skipIfFgDisabled === 'boolean') {
			fetchUrl.searchParams.append(SearchParams.SKIP_IF_FG_DISABLED, `${skipIfFgDisabled}`)
		}
		if (typeof skipIfDataExtraction === 'boolean') {
			fetchUrl.searchParams.append(SearchParams.SKIP_IF_DATA_EXTRACTION, `${skipIfDataExtraction}`)
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
			if (!Array.isArray(this.searchresults.data)) {
				this.searchresults.data = []
			}
			this._host.requestUpdate()
		} else {
			throw [fetchResponse.status, fetchData]
		}
	}

	hostConnected(): void {}

	hostDisconnected(): void {}
}
