import { browser } from '$app/environment'
import { get } from 'svelte/store'
import type { LayoutLoad } from './$types'
import { CurrentProject, CurrentUser } from '$lib/stores'
import { PUBLIC_API_URL } from '$env/static/public'
import { FETCH_ERROR, Shared } from '$lib/constants'
import { Log } from '$lib/utils'
import { error } from '@sveltejs/kit'

export const load: LayoutLoad = async ({ fetch, params }) => {
	if (!browser) return
	if (get(CurrentUser) === null) {
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/session`, {
				credentials: 'include'
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				CurrentUser.set(data)
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, 'IAM', e, 'Get session failed')
			throw error(500, { message: FETCH_ERROR })
		}
	}
	let projectsRoles = get(CurrentUser)?.ProjectsRoles
	if (Array.isArray(projectsRoles)) {
		let isProjectFound = false
		for (let p of projectsRoles) {
			if (p.ProjectID === params['project_id']) {
				CurrentProject.set(p)
				isProjectFound = true
				break
			}
		}
		if (!isProjectFound) {
			throw error(403, { message: 'Forbidden' })
		}
	} else {
		throw error(400, { message: 'Bad request' })
	}
}
