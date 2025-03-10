import MetadataModel from '@lib/metadata_model'

namespace _MetadataModel {
	export interface ISearch {
		metadata_model?: any
		query_conditions?: MetadataModel.QueryConditions[]
	}

	export interface IDatum {
		metadata_model?: any
		datum?: any
	}

	export interface ISearchResults {
		metadata_model?: any
		data?: any[]
	}

	export function GetToastFromJsonVerboseResponse(data: any) {
		let toastdata: any = {}
		if (typeof data.message !== 'undefined') {
			toastdata.toastMessage = data.message
		}
		if (typeof data.metadata_model !== 'undefined' && Array.isArray(data.data)) {
			toastdata.toastMetadataModelSearchResults = {
				metadata_model: data.metadata_model,
				data: data.data
			} as ISearchResults
		}

		return toastdata
	}
}

export default _MetadataModel
