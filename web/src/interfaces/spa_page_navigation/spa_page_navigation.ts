import { IAppContextProvider } from '@dominterfaces/context/app'
import { ISpaPageNavigation } from '@dominterfaces/spa_page_navigation/spa_page_navigation'
import Lib from '@lib/lib'
import Log from '@lib/log'
import Url from '@lib/url'

export enum SearchParams {
	Partial = 'partial',
	PartialName = 'partial_name'
}

export interface HistoryState {
	targetElementID: string
	targetElementUrl: string
	targetElementTitle?: string
}

export class SpaPageNavigation implements ISpaPageNavigation {
	private _appContextProvider: IAppContextProvider
	constructor(appContextProvider: IAppContextProvider) {
		this._appContextProvider = appContextProvider
	}
	/**
	 * Throws error if request fails.
	 */
	async Navigate(targetElement: Element, url: URL, title: string | undefined) {
		Url.AddBaseUrl(url)
		url.searchParams.append('partial', 'true')
		url.searchParams.append('partial_name', targetElement.id)
		Log.Log(Log.Level.DEBUG, 'Misc', targetElement, url.toJSON(), title)
		dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: true }, bubbles: true, composed: true }))
		try {
			const fetchResponse = await fetch(url, {
				credentials: 'include'
			})
			const fetchData = await fetchResponse.text()
			dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: null }, bubbles: true, composed: true }))
			this.AddHistoryState(targetElement, url, title)
			targetElement.innerHTML = fetchData
			Array.from(targetElement.querySelectorAll('script')).forEach((oldScript) => {
				const newScript = document.createElement('script')
				Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value))
				newScript.appendChild(document.createTextNode(oldScript.innerHTML))
				oldScript.parentNode?.replaceChild(newScript, oldScript)
			})
		} catch (e) {
			Log.Log(Log.Level.ERROR, this.Navigate.name, 'Page navigation failed', e, url)
			throw [this.Navigate.name, e]
		} finally {
			dispatchEvent(new CustomEvent(Lib.CustomEvents.SHOW_LOADING_SCREEN, { detail: { loading: null }, bubbles: true, composed: true }))
		}
	}

	AddHistoryState(targetElement: Element, url: URL, title: string | undefined) {
		const targetElementIDUrl = url.toString()
		url.searchParams.delete(SearchParams.Partial)
		url.searchParams.delete(SearchParams.PartialName)
		history.pushState({ targetElementID: targetElement.id, targetElementUrl: targetElementIDUrl, targetElementTitle: title } as HistoryState, '', url)
		this._appContextProvider.UpdateCurrentDirectorygroupPath(title)
	}

	async HandlePopState(e: PopStateEvent) {
		try {
			const historyState: HistoryState = e.state
			if (historyState == null) {
				const url = new URL("/", window.location.origin)
				Url.AddBaseUrl(url)
				this._appContextProvider.UpdateIamdirectorygroupid(undefined)
				this._appContextProvider.UpdateCurrentDirectorygroupPath(undefined)
				window.open(url, "_self")
				return
			}
			Log.Log(Log.Level.DEBUG, SpaPageNavigation.name, historyState)
			const fetchUrl = new URL(historyState.targetElementUrl)
			const fetchResponse = await fetch(fetchUrl, {
				credentials: 'include'
			})
			const fetchData = await fetchResponse.text()
			const elementToReplaceContent = document.querySelector(`#${historyState.targetElementID}`)
			if (elementToReplaceContent !== null) {
				elementToReplaceContent.innerHTML = fetchData
				Array.from(elementToReplaceContent.querySelectorAll('script')).forEach((oldScript) => {
					const newScript = document.createElement('script')
					Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value))
					newScript.appendChild(document.createTextNode(oldScript.innerHTML))
					oldScript.parentNode?.replaceChild(newScript, oldScript)
				})
				this._appContextProvider.UpdateCurrentDirectorygroupPath(historyState.targetElementTitle)
			} else {
				Log.Log(Log.Level.ERROR, 'page-navigation', 'Handle pop state failed', 'Section does not exist')
				window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: 'Section does not exist' }, bubbles: true, composed: true }))
			}
		} catch (error) {
			Log.Log(Log.Level.ERROR, 'page-navigation', 'Handle pop state failed', e, error)
			window.dispatchEvent(new CustomEvent(Lib.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Lib.ToastType.ERROR, toastMessage: Lib.DEFAULT_FETCH_ERROR }, bubbles: true, composed: true }))
		}
	}
}
