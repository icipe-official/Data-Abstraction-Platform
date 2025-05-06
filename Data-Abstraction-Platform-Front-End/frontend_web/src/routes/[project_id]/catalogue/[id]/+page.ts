import { browser } from '$app/environment'
import { FETCH_ERROR, Shared } from '$lib/constants'
import { Log } from '$lib/utils'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'
import { PUBLIC_API_URL } from '$env/static/public'
import type { ICatalogue_temp } from '$lib/interface'
import { get } from 'svelte/store'
import { CataloguesSearchResults, SearchResultsClickedIndex } from '$lib/stores'

export const load: PageLoad = async ({ params, fetch, parent }) => {
	await parent()
	if (!browser) return
	const catalogueID = params['id']
	if (catalogueID === 'new') return {} as ICatalogue_temp
	const clickedIndex = get(SearchResultsClickedIndex)
	if (clickedIndex !== null) {
		return get(CataloguesSearchResults)[clickedIndex] as ICatalogue_temp
	}
	try {
		let url = new URL(`${PUBLIC_API_URL}/catalogue`)
		url.searchParams.append('id', catalogueID)
		const fetchResponse = await fetch(url, {
			credentials: 'include'
		})
		const data = await fetchResponse.json()
		if (fetchResponse.ok) {
			return data as ICatalogue_temp
		} else {
			throw error(fetchResponse.status, { message: data.message })
		}
	} catch (e) {
		Log(Shared.LogLevel.ERROR, 'Catalogue', e)
		throw error(500, { message: FETCH_ERROR })
	}
}
