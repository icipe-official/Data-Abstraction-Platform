import Interface from './interface'
import Log from './log'
import MetadataModel from './metadata_model'

namespace Misc {
	export enum IamTicketTypes {
		IAM_TICKET_EMAIL_VERIFICATION = 'email_verification',
		IAM_TICKET_PHONE_VERIFICATION = 'phone_verification',
		IAM_TICKET_PASSWORD_RESET = 'password_reset'
	}

	/**
	 * Expects Four values:
	 * * alert-error (red background)
	 * * aler-warning (yellow/amber background)
	 * * alert-info (blue background)
	 * * alert-success (green background)
	 */
	export const enum ToastType {
		ERROR = 'alert-error',
		WARNING = 'alert-warning',
		INFO = 'alert-info',
		SUCCESS = 'alert-success'
	}

	/**
	 * Custom Events triggered within the application.
	 */
	export const enum CustomEvents {
		TOAST_NOTIFY = 'data-abstraction-platform:toastnotify',
		SHOW_LOADING_SCREEN = 'data-abstraction-platform:showloadingscreen'
	}

	export const EMAIL_VALIDATION_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

	/**
	 * Use to seet icon size for iconify-icon, comes with handy default
	 * @param size. default 24.
	 * @returns
	 */
	export const IconifySize = (size?: string) => (size ? size : '24')

	export const WINDOW_APP_OBJECT_KEY = 'data-abstraction-platform'

	export const DEFAULT_FETCH_ERROR = 'Unknown error occured possibly due to server being unreachable.'

	export const enum SharedStorageKey {
		SESSION_DATA = 'dap-session-data',
		SPA_MODE = 'dap-spa-mode',
		AUTH_CONTEXT_NOT_CURRENT_DIRECTORY_GROUP_ID = 'dap-auth-context-not-current-directory-group-id',
		START_SEARCH_NOT_CURRENT_DIRECTORY_GROUP_ID = 'dap-start-search-not-current-directory-group-id',
		NOT_SKIP_IF_DATA_EXTRACTION = 'dap-not-skip-if-data-extraction',
		NOT_SKIP_IF_FG_DISABLED = 'dap-not-skip-if-fg-disabled',
		VERBOSE_RESPONSE = 'dap-verbose-response'
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

	/**
	 * Handles page navigation without reloading
	 * @param targetElementID id of element whose children will be replaced with new content.
	 * @param path url path.
	 *
	 * Throws error if request fails.
	 */
	export async function PageNavigation(targetElementID: string, path: string) {
		// Log.Log(Log.Level.DEBUG, 'Misc', targetElementID)
		const urlPath = import.meta.env.BASE_URL + (!import.meta.env.BASE_URL.endsWith('/') ? '/' : '') + path
		const url = new URL(urlPath, window.location.origin)
		url.searchParams.append('partial', 'true')
		url.searchParams.append('partial_name', targetElementID)
		dispatchEvent(new CustomEvent(CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true }, bubbles: true, composed: true }))
		try {
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const fetchData = await fetchResponse.text()
			const elementToReplaceContent = document.querySelector(`#${targetElementID}`)
			if (elementToReplaceContent !== null) {
				dispatchEvent(new CustomEvent(CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: null }, bubbles: true, composed: true }))
				history.pushState({ targetElementID, url: url.toString() } as Interface.HistoryState, '', urlPath)
				sessionStorage.setItem(SharedStorageKey.SPA_MODE, JSON.stringify(true))
				elementToReplaceContent.innerHTML = fetchData
				Array.from(elementToReplaceContent.querySelectorAll('script')).forEach((oldScript) => {
					const newScript = document.createElement('script')
					Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value))
					newScript.appendChild(document.createTextNode(oldScript.innerHTML))
					oldScript.parentNode?.replaceChild(newScript, oldScript)
				})
			} else {
				throw 'section does not exist'
			}
		} catch (e) {
			Log.Log(Log.Level.ERROR, 'page-navigation', 'Page navigation failed', url, e)
			throw DEFAULT_FETCH_ERROR
		} finally {
			dispatchEvent(new CustomEvent(CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: null }, bubbles: true, composed: true }))
		}
	}

	export function AddHistoryState(targetElementID: string, windowlocationpathname: string) {
		const spaMode = sessionStorage.getItem(SharedStorageKey.SPA_MODE)
		if (typeof spaMode === 'string' && JSON.parse(spaMode) === false) {
			const url = new URL(windowlocationpathname, window.location.origin)
			url.searchParams.append('partial', 'true')
			url.searchParams.append('partial_name', targetElementID)
			history.pushState({ targetElementID, url: url.toString() } as Interface.HistoryState, '', url.pathname)
		}
	}

	export const CurrentDirectoryGroupID = (currentUrl: string) => new URL(currentUrl).searchParams.get(SearchParams.CURRENT_DIRECTORY_GROUP_ID)

	export function GetRelativePath(path: string) {
		const basePath = import.meta.env.BASE_URL + (!import.meta.env.BASE_URL.endsWith('/') ? '/' : '')
		return path.replace(basePath, '')
	}

	export function GetDirectoryGroupIDString(directoryGroupID: Interface.DirectoryGroupID) {
		return `${directoryGroupID.id}@${directoryGroupID.created_on}`
	}

	export const LocalDateFromString = (value: string) => new Date(value).toLocaleDateString()

	export const LocalTimeFromString = (value: string) => new Date(value).toLocaleTimeString()

	export function GetToastFromJsonVerboseResponse(data: any) {
		let toastdata: any = {}
		if (typeof data.message !== 'undefined') {
			toastdata.toastMessage = data.message
		}
		if (typeof data.metadata_model !== 'undefined' && Array.isArray(data.data)) {
			toastdata.toastMetadataModelSearchResults = {
				metadata_model: data.metadata_model,
				data: data.data
			} as MetadataModel.ISearchResults
		}

		return toastdata
	}

	// export const GetQueryCondition = (metadataModel: any, path: string, value: any, filterCondition = MetadataModel.FilterCondition.FIELD_EQUAL_TO) => ({
	// 	[MetadataModel.QueryFilterKeys.QUERY_FG_PROPERTY]: Json.GetValueInObject(metadataModel, path),
	// 	[MetadataModel.QueryFilterKeys.QUERY_FG_FILTER_CONDITION]: [
	// 		[
	// 			{
	// 				[MetadataModel.FilterKey.CONDITION]: filterCondition,
	// 				[MetadataModel.FilterKey.VALUE]: value
	// 			}
	// 		]
	// 	]
	// })
}

export default Misc
