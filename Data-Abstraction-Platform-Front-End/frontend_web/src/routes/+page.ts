import { browser } from '$app/environment'
import { get } from 'svelte/store'
import type { PageLoad } from './$types'
import { CurrentUser } from '$lib/stores'
import { PUBLIC_API_URL } from '$env/static/public'
import { goto } from '$app/navigation'
import { base } from '$app/paths'
import { FETCH_ERROR, Shared } from '$lib/constants'
import { Log } from '$lib/utils'
import { error } from '@sveltejs/kit'

export const load: PageLoad = async ({ fetch }) => {
	if (browser && get(CurrentUser) === null) {
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/session`, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				CurrentUser.set(data)
				goto(`${base}/`)
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, 'Login', e, 'Get session failed')
			throw error(500, { message: FETCH_ERROR })
		}
	}
}
