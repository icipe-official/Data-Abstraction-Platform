import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"
import { FETCH_ERROR, Shared } from "$lib/constants"
import { PUBLIC_API_URL } from "$env/static/public"
import { Log } from "$lib/utils"

interface EmailVerified {
	ID: string
}

const CURRENT_SECTION = "Email Verification"

export const load: PageLoad = async ({ fetch, url }) => {
	const ticketNumber = url.searchParams.get("t")
	if (ticketNumber === null || ticketNumber.length < 63) {
		throw error(400, { message: "Invalid request" })
	}
	const pin = url.searchParams.get("p")
	if (pin === null || pin.length < 6) {
		throw error(400, { message: "Invalid request" })
	}
	try {
		const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/request/email_verification/${ticketNumber}/${pin}`, {
			method: "POST",
			body: JSON.stringify({})
		})
		const data = await fetchResponse.json()
		if (fetchResponse.ok) {
			return data as EmailVerified
		} else {
			throw error(fetchResponse.status, { message: data.message })
		}
	} catch (e) {
		Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e)
		throw error(500, { message: FETCH_ERROR })
	}
}
