import Misc from '$src/lib/miscellaneous'
import Interface from '$src/lib/interface'
import Log from '$src/lib/log'
import '$src/lib/components/app-context/component'

// listen to back forward navigation
window.addEventListener('popstate', async (e: PopStateEvent) => {
	try {
		const fetchResponse = await fetch((e.state as Interface.HistoryState).url, {
			credentials: 'include'
		})
		const fetchData = await fetchResponse.text()
		const elementToReplaceContent = document.querySelector(`#${(e.state as Interface.HistoryState).targetElementID}`)
		if (elementToReplaceContent !== null) {
			elementToReplaceContent.innerHTML = fetchData
			Array.from(elementToReplaceContent.querySelectorAll('script')).forEach((oldScript) => {
				const newScript = document.createElement('script')
				Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value))
				newScript.appendChild(document.createTextNode(oldScript.innerHTML))
				oldScript.parentNode?.replaceChild(newScript, oldScript)
			})
		} else {
			Log.Log(Log.Level.ERROR, 'page-navigation', 'Handle pop state failed', 'Section does not exist')
			window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.ERROR, toastMessage: 'Section does not exist' }, bubbles: true, composed: true }))
		}
	} catch (error) {
		Log.Log(Log.Level.ERROR, 'page-navigation', 'Handle pop state failed', e, error)
		window.dispatchEvent(new CustomEvent(Misc.CustomEvents.TOAST_NOTIFY, { detail: { toastType: Misc.ToastType.ERROR, toastMessage: Misc.DEFAULT_FETCH_ERROR }, bubbles: true, composed: true }))
	}
})
