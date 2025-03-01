import { ReactiveController, ReactiveControllerHost } from 'lit'
import Entities from '@domentities'
import Lib from '@lib/lib'
import { IOpenidContextConsumer, IOpenidContextProvider } from '@dominterfaces/context/openid'

export const OPEN_ID_ENDPOINTS_STORAGE_KEY = 'openid-endpoints'

export const OPEN_ID_CONTEXT_UPDATE_EVENT = `${Lib.APP_PREFIX}:openidcontextupdate`

export class OpenidContextProvider implements IOpenidContextProvider {
	private _openidendpoints: Entities.AppContext.Openid | undefined

	constructor(openidendponts: Entities.AppContext.Openid | undefined = undefined) {
		if (typeof openidendponts === 'undefined') {
			const value = window.sessionStorage.getItem(OPEN_ID_ENDPOINTS_STORAGE_KEY)
			if (typeof value === 'string') {
				try {
					this._openidendpoints = JSON.parse(value)
				} catch (e) {
					console.error('get openidendpoints from session storage failed', e)
				}
			}
		} else {
			this._openidendpoints = openidendponts
		}
		this._dispatchContextUpdateEvent()
	}

	Getopenidendpoints() {
		return this._openidendpoints
	}

	Setopenidendpoints(value: Entities.AppContext.Openid | undefined) {
		this._openidendpoints = value
		this._updateContext()
	}

	private _updateContext() {
		if (typeof this._openidendpoints === 'object') {
			window.sessionStorage.setItem(OPEN_ID_ENDPOINTS_STORAGE_KEY, JSON.stringify(this._openidendpoints))
		}
		this._dispatchContextUpdateEvent()
	}

	private _dispatchContextUpdateEvent() {
		window.dispatchEvent(new CustomEvent(OPEN_ID_CONTEXT_UPDATE_EVENT, { detail: { value: structuredClone(this._openidendpoints) }, bubbles: true, composed: true }))
	}
}

export class OpenidContextConsumer implements ReactiveController, IOpenidContextConsumer {
	private _host: ReactiveControllerHost
	openidendpoints: Entities.AppContext.Openid | undefined

	constructor(host: ReactiveControllerHost) {
		this._host = host
		host.addController(this)
		const value = window.sessionStorage.getItem(OPEN_ID_ENDPOINTS_STORAGE_KEY)
		if (typeof value === 'string') {
			try {
				this.openidendpoints = JSON.parse(value)
			} catch (e) {
				console.error('get openidendpoints from session storage failed', e)
			}
		}
	}

	private _onContextUpdate = (event: OpenidConfigurationChangeEvent) => {
		try {
			this.openidendpoints = structuredClone(event.detail.value)
			this._host.requestUpdate()
		} catch (e) {
			console.error('execute storage event failed', e)
		}
	}

	hostConnected(): void {
		window.addEventListener(OPEN_ID_CONTEXT_UPDATE_EVENT, this._onContextUpdate as EventListenerOrEventListenerObject)
	}

	hostDisconnected(): void {
		window.removeEventListener(OPEN_ID_CONTEXT_UPDATE_EVENT, this._onContextUpdate as EventListenerOrEventListenerObject)
	}
}

/**
 * Show Loading Screen Event Type.
 */
type OpenidConfigurationChangeEvent = CustomEvent & {
	detail: {
		value: Entities.AppContext.Openid
	}
}
