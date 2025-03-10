namespace Lib {
	export interface ItemID {
		id: string
		created_on: string
		group_id: string
		group_created_on: string
	}

	export interface VerboseResponseStatus {
		status_code: number[]
		status_message: string[]
	}

	export interface VerboseResponse {
		status: VerboseResponseStatus[]
		Data: any[]
	}

	export const APP_PREFIX = 'data-abstraction-platform'

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
		SHOW_LOADING_SCREEN = 'data-abstraction-platform:showloadingscreen',
		OPEN_ID_CONTEXT_UPDATE = 'data-abstraction-platform:openidcontextupdate'
	}

	export const EMAIL_VALIDATION_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

	export const DEFAULT_FETCH_ERROR = 'Unknown error occured possibly due to server being unreachable.'

	export const LocalDateFromString = (value: string) => new Date(value).toLocaleDateString()

	export const LocalTimeFromString = (value: string) => new Date(value).toLocaleTimeString()
}

export default Lib
