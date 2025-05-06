import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load: PageLoad = ({ url }) => {
	const ticketNumber = url.searchParams.get("t")
	if (ticketNumber === null || ticketNumber.length < 63) {
		throw error(400, { message: "Invalid request" })
	}
	const pin = url.searchParams.get("p")
	if (pin === null || pin.length < 6) {
		throw error(400, { message: "Invalid request" })
	}
	return {
		ticketNumber,
		pin
	}
}
