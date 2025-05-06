import { browser } from '$app/environment'
import type { IModelTemplate_temp } from '$lib/interface'
import { get } from 'svelte/store'
import type { PageLoad } from './$types'
import { ModelTemplatesSearchResults, SearchResultsClickedIndex } from '$lib/stores'
import { PUBLIC_API_URL } from '$env/static/public'
import { Shared, FETCH_ERROR } from '$lib/constants'
import { Log } from '$lib/utils'
import { error } from '@sveltejs/kit'

export const load: PageLoad = async ({ params, fetch, parent }) => {
	await parent()
	if (!browser) return
	const modeltemplateID = params['id']
	if (modeltemplateID === 'new') return {} as IModelTemplate_temp
	const clickedIndex = get(SearchResultsClickedIndex)
	if (clickedIndex !== null) {
		return get(ModelTemplatesSearchResults)[clickedIndex] as IModelTemplate_temp
	}
	try {
		let url = new URL(`${PUBLIC_API_URL}/modeltemplate`)
		url.searchParams.append('id', modeltemplateID)
		const fetchResponse = await fetch(url, {
			credentials: 'include'
		})
		const data = await fetchResponse.json()
		if (fetchResponse.ok) {
			return data as IModelTemplate_temp
		} else {
			throw error(fetchResponse.status, { message: data.message })
		}
	} catch (e) {
		Log(Shared.LogLevel.ERROR, 'Model Template', e)
		throw error(500, { message: FETCH_ERROR })
	}
}
