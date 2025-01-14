import Database from './database'

namespace Interface {
	export interface ItemID {
		id: string
		created_on: string
		group_id: string
		group_created_on: string
	}

	export interface DirectoryGroupID {
		id: string
		created_on: string
	}

	export interface HistoryState {
		targetElementID: string
		url: string
	}

	export interface VerboseResponseStatus {
		status_code: number[]
		status_message: string[]
	}

	export interface VerboseResponse {
		status: VerboseResponseStatus[]
		Data: any[]
	}

	export interface OpenidEndpoints {
		login_endpoint: string
		registration_endpoint?: string
	}

	export interface SessionData {
		openid_endpoints: OpenidEndpoints
		iam_credential?: Database.IamCredentials.Interface
	}
}

export default Interface
