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

	export interface IVerboseResponse {
		message?: string
		metadata_model_verbose_response?: {
			metadata_model?: any
			data?: any[]
		}
		successful?: number
		failed?: number
	}

	export function GetToastFromJsonVerboseResponse(data: IVerboseResponse) {
		let toastdata: any = {}
		if (typeof data.message === 'string') {
			toastdata.toastMessage = data.message
		}
		if (data.metadata_model_verbose_response) {
			toastdata.toastMetadataModelSearchResults = {}
			if (data.metadata_model_verbose_response.metadata_model) {
				(toastdata.toastMetadataModelSearchResults as ISearchResults).metadata_model = data.metadata_model_verbose_response.metadata_model
			}
			if (data.metadata_model_verbose_response.data) {
				(toastdata.toastMetadataModelSearchResults as ISearchResults).data = data.metadata_model_verbose_response.data
			}
		}

		return toastdata
	}
}

export default _MetadataModel
