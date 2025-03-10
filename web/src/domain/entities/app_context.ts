import type _IamCredentials from './iam_credentials'

namespace _AppContext {
	export interface Interface {
		openidendpoints?: OpenidEndpoints | undefined
		iamcredential?: _IamCredentials.Interface | undefined
		iamdirectorygroupid?: string
		currentdirectorygroupidpath?: string
		currentdirectorygroupidpathtitle?: string
		usecurrentdirectorygroupasauthcontext?: boolean
		targetjoindepth?: number
		skipiffgdisabled?: boolean
		skipifdataextraction?: boolean
		whereafterjoin?: boolean
	}

	export const APP_CONTEXT_SESSION_STORAGE_KEY = 'app-context'

	export interface OpenidEndpoints {
		login_endpoint: string
		registration_endpoint?: string
		account_management_endpoint?: string
	}
}

export default _AppContext
