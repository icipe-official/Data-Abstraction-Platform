import { ReactiveController, ReactiveControllerHost } from 'lit'
import Entities from '@domentities'
import Lib from '@lib/lib'
import { IAppContextConsumer, IAppContextProvider } from '@dominterfaces/context/app'
import Json from '@lib/json'
import Url from '@lib/url'

export enum StorageKey {
	AppContext = `${Lib.APP_PREFIX}-${Entities.AppContext.APP_CONTEXT_SESSION_STORAGE_KEY}`
}

export const APP_CONTEXT_UPDATE_EVENT = `${Lib.APP_PREFIX}:appcontextupdate`

export class AppContextProvider implements IAppContextProvider {
	private _appcontext: Entities.AppContext.Interface | undefined = {}

	constructor(appcontext: Entities.AppContext.Interface | undefined = undefined) {
		if (typeof appcontext === 'undefined') {
			const value = window.sessionStorage.getItem(StorageKey.AppContext)
			if (typeof value === 'string') {
				try {
					this._appcontext = JSON.parse(value)
					if (!this._appcontext) {
						this._appcontext = {
							donotusecurrentdirectorygroupasauthcontext: false,
							targetjoindepth: 1,
							skipiffgdisabled: true,
							skipifdataextraction: true,
							whereafterjoin: false
						}
					}
					this._appcontext.currentdirectorygroupidpath = window.location.pathname
				} catch (e) {
					console.error(`parse ${StorageKey.AppContext} value from session storage failed`, e)
				}
			}
		} else {
			this._appcontext = appcontext
		}

		this._dispatchContextUpdateEvent()
	}

	GetContext() {
		return structuredClone(this._appcontext)
	}

	UpdateOpenidendpoints(value: Entities.AppContext.OpenidEndpoints | undefined) {
		if (Json.AreValuesEqual(this._appcontext?.openidendpoints, value)) {
			return
		}
		if (typeof value === 'undefined') {
			if (this._appcontext) {
				delete this._appcontext.openidendpoints
			}
		} else {
			if (!this._appcontext) {
				this._appcontext = {
					openidendpoints: value
				}
			} else {
				this._appcontext.openidendpoints = value
			}
		}
		this._updateContext()
	}

	UpdateIamcredential(value: Entities.IamCredentials.Interface | undefined) {
		if (Json.AreValuesEqual(this._appcontext?.iamcredential, value)) {
			return
		}
		if (typeof value === 'undefined') {
			if (this._appcontext) {
				delete this._appcontext.iamcredential
			}
		} else {
			if (!this._appcontext) {
				this._appcontext = {
					iamcredential: value
				}
			} else {
				this._appcontext.iamcredential = value
			}
		}
		this._updateContext()
	}

	UpdateIamdirectorygroupid(value: string | undefined) {
		if (Json.AreValuesEqual(this._appcontext?.iamdirectorygroupid, value)) {
			return
		}
		if (typeof value === 'undefined') {
			if (this._appcontext) {
				delete this._appcontext.iamdirectorygroupid
			}
		} else {
			if (!this._appcontext) {
				this._appcontext = {
					iamdirectorygroupid: value
				}
			} else {
				this._appcontext.iamdirectorygroupid = value
			}
		}
		this._updateContext()
	}

	UpdateCurrentDirectorygroupPath(title: string | undefined) {
		let value = window.location.pathname
		if (Json.AreValuesEqual(this._appcontext?.currentdirectorygroupidpath, value)) {
			return
		}
		if (typeof value === 'undefined') {
			if (this._appcontext) {
				delete this._appcontext.currentdirectorygroupidpath
				delete this._appcontext.currentdirectorygroupidpathtitle
			}
		} else {
			if (!this._appcontext) {
				this._appcontext = {
					currentdirectorygroupidpath: value
				}
			} else {
				this._appcontext.currentdirectorygroupidpath = value
			}
			if (title) {
				this._appcontext.currentdirectorygroupidpathtitle = title
			} else {
				delete this._appcontext.currentdirectorygroupidpathtitle
			}
		}
		this._updateContext()
	}

	UpdateContext(value: Entities.AppContext.Interface | undefined) {
		if (Json.AreValuesEqual(this._appcontext, value)) {
			return
		}
		this._appcontext = structuredClone(value)
		this._updateContext()
	}

	Updatedonotusecurrentdirectorygroupasauthcontext(value: boolean | undefined) {
		if (Json.AreValuesEqual(this._appcontext?.donotusecurrentdirectorygroupasauthcontext, value)) {
			return
		}
		if (typeof value === 'undefined') {
			if (this._appcontext) {
				delete this._appcontext.donotusecurrentdirectorygroupasauthcontext
			}
		} else {
			if (!this._appcontext) {
				this._appcontext = {
					donotusecurrentdirectorygroupasauthcontext: value
				}
			} else {
				this._appcontext.donotusecurrentdirectorygroupasauthcontext = value
			}
		}
		this._updateContext()
	}

	Updateskipiffgdisabled(value: boolean | undefined) {
		if (Json.AreValuesEqual(this._appcontext?.skipiffgdisabled, value)) {
			return
		}
		if (typeof value === 'undefined') {
			if (this._appcontext) {
				delete this._appcontext.skipiffgdisabled
			}
		} else {
			if (!this._appcontext) {
				this._appcontext = {
					skipiffgdisabled: value
				}
			} else {
				this._appcontext.skipiffgdisabled = value
			}
		}
		this._updateContext()
	}

	Updateskipifdataextraction(value: boolean | undefined) {
		if (Json.AreValuesEqual(this._appcontext?.skipifdataextraction, value)) {
			return
		}
		if (typeof value === 'undefined') {
			if (this._appcontext) {
				delete this._appcontext.skipifdataextraction
			}
		} else {
			if (!this._appcontext) {
				this._appcontext = {
					skipifdataextraction: value
				}
			} else {
				this._appcontext.skipifdataextraction = value
			}
		}
		this._updateContext()
	}

	Updatetargetjoindepth(value: number | undefined) {
		if (Json.AreValuesEqual(this._appcontext?.targetjoindepth, value)) {
			return
		}
		if (typeof value === 'undefined') {
			if (this._appcontext) {
				delete this._appcontext.targetjoindepth
			}
		} else {
			if (!this._appcontext) {
				this._appcontext = {
					targetjoindepth: value
				}
			} else {
				this._appcontext.targetjoindepth = value
			}
		}
		this._updateContext()
	}

	Updatewhereafterjoin(value: boolean | undefined) {
		if (Json.AreValuesEqual(this._appcontext?.whereafterjoin, value)) {
			return
		}
		if (typeof value === 'undefined') {
			if (this._appcontext) {
				delete this._appcontext.whereafterjoin
			}
		} else {
			if (!this._appcontext) {
				this._appcontext = {
					whereafterjoin: value
				}
			} else {
				this._appcontext.whereafterjoin = value
			}
		}
		this._updateContext()
	}

	Updateverboseresponse(value: boolean | undefined) {
		if (Json.AreValuesEqual(this._appcontext?.verboseresponse, value)) {
			return
		}
		if (typeof value === 'undefined') {
			if (this._appcontext) {
				delete this._appcontext.verboseresponse
			}
		} else {
			if (!this._appcontext) {
				this._appcontext = {
					verboseresponse: value
				}
			} else {
				this._appcontext.verboseresponse = value
			}
		}
		this._updateContext()
	}

	private _updateContext() {
		if (typeof this._appcontext === 'object') {
			window.sessionStorage.setItem(StorageKey.AppContext, JSON.stringify(this._appcontext))
		}
		this._dispatchContextUpdateEvent()
	}

	private _dispatchContextUpdateEvent() {
		window.dispatchEvent(new CustomEvent(APP_CONTEXT_UPDATE_EVENT, { detail: { value: structuredClone(this._appcontext) }, bubbles: true, composed: true }))
	}
}

export class AppContextConsumer implements ReactiveController, IAppContextConsumer {
	private _host: ReactiveControllerHost
	appcontext: Entities.AppContext.Interface | undefined

	constructor(host: ReactiveControllerHost) {
		this._host = host
		host.addController(this)
		const value = window.sessionStorage.getItem(StorageKey.AppContext)
		if (typeof value === 'string') {
			try {
				this.appcontext = JSON.parse(value)
			} catch (e) {
				console.error(`parse ${StorageKey.AppContext} value from session storage failed`, e)
			}
		}
	}

	private _onContextUpdate = (event: AppContextUpdateEvent) => {
		try {
			this.appcontext = structuredClone(event.detail.value)
			this._host.requestUpdate()
		} catch (e) {
			console.error(`update ${StorageKey.AppContext} context failed`, e)
		}
	}

	GetCurrentdirectorygroupid() {
		const currentPageUrl = new URL(window.location.href)
		const dgid = currentPageUrl.searchParams.get(Url.SearchParams.DIRECTORY_GROUP_ID)
		if (dgid) {
			return dgid
		}
		return undefined
	}

	Getauthcontextdirectorygroupid() {
		if (this.appcontext?.donotusecurrentdirectorygroupasauthcontext) {
			return this.appcontext.iamdirectorygroupid || ''
		} else {
			return this.GetCurrentdirectorygroupid() || ''
		}
	}

	hostConnected(): void {
		window.addEventListener(APP_CONTEXT_UPDATE_EVENT, this._onContextUpdate as EventListenerOrEventListenerObject)
	}

	hostDisconnected(): void {
		window.removeEventListener(APP_CONTEXT_UPDATE_EVENT, this._onContextUpdate as EventListenerOrEventListenerObject)
	}
}

type AppContextUpdateEvent = CustomEvent & {
	detail: {
		value: Entities.AppContext.Interface
	}
}
