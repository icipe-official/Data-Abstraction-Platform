import { browser } from '$app/environment'
import { FETCH_ERROR, Shared } from '$lib/constants'
import { Log } from '$lib/utils'
import { error } from '@sveltejs/kit'
import type { PageLoad } from './$types'
import { PUBLIC_API_URL } from '$env/static/public'
import type { IFile_temp } from '$lib/interface'
import { get } from 'svelte/store'
import { FilesSearchResults, SearchResultsClickedIndex } from '$lib/stores'

export const load: PageLoad = async ({ params, fetch, parent }) => {
	await parent()
	if (!browser) return
	const fileID = params['id']
	if (fileID === 'new') return {} as IFile_temp
	const clickedIndex = get(SearchResultsClickedIndex)
	if (clickedIndex !== null) {
		return get(FilesSearchResults)[clickedIndex] as IFile_temp
	}
	try {
		let url = new URL(`${PUBLIC_API_URL}/storage/file`)
		url.searchParams.append('id', fileID)
		const fetchResponse = await fetch(url, {
			credentials: 'include'
		})
		const data = await fetchResponse.json()
		if (fetchResponse.ok) {
			return data as IFile_temp
		} else {
			throw error(fetchResponse.status, { message: data.message })
		}
	} catch (e) {
		Log(Shared.LogLevel.ERROR, 'File', e)
		throw error(500, { message: FETCH_ERROR })
	}
}
