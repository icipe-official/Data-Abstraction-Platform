import { browser } from '$app/environment'
import type { ISearchAbstraction } from '$lib/interface'
import { AbstractionCurrentTemplate, CurrentProject, AbstractionsSearchResults, SearchResultsClickedIndex } from '$lib/stores'
import { get } from 'svelte/store'
import type { PageLoad } from './$types'
import { PUBLIC_API_URL } from '$env/static/public'
import { Log } from '$lib/utils'
import { FETCH_ERROR, Shared } from '$lib/constants'
import { error } from '@sveltejs/kit'

export const load: PageLoad = async ({ params, fetch, parent }) => {
	await parent()
	if (!browser) return
	const abstractionID = params['id']
	const clickedIndex = get(SearchResultsClickedIndex)
	const currentProject = get(CurrentProject)
	if (currentProject === null) {
		throw error(500, { message: 'Invalid request' })
	}
	if (clickedIndex !== null) {
		return get(AbstractionsSearchResults)[clickedIndex] as ISearchAbstraction
	}
	try {
		let url = new URL(`${PUBLIC_API_URL}/abstraction/${currentProject.ProjectID}`)
		url.searchParams.append('id', abstractionID)
		const fetchResponse = await fetch(url, {
			credentials: 'include'
		})
		const data = await fetchResponse.json()
		if (fetchResponse.ok) {
			AbstractionCurrentTemplate.set(data.ModelTemplate)
			return data as ISearchAbstraction
		} else {
			throw error(fetchResponse.status, { message: data.message })
		}
	} catch (e) {
		Log(Shared.LogLevel.ERROR, 'Get abstraction', e)
		throw error(500, { message: FETCH_ERROR })
	}
}
