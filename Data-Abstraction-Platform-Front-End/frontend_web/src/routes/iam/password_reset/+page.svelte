<script lang="ts">
	import { goto } from "$app/navigation"
	import { base } from "$app/paths"
	import { PUBLIC_API_URL } from "$env/static/public"
	import { FETCH_ERROR, Shared } from "$lib/constants"
	import { Loading, LoadingMessage, ToastMessage, ToastType } from "$lib/stores"
	import { Log } from "$lib/utils"
	import type { PageData } from "./$types"

	export let data: PageData
	const CURRENT_SECTION = "Password Reset"

	const PASSWORD_ERROR = "Password is not valid"
	let newPassword = ""
	let newPasswordError: string | null = null
	let confirmPassword = ""
	let confirmPasswordError: string | null = null
	function handleInputPassword(newP: string | undefined, confirmP: string | undefined) {
		if (newP) {
			newPassword = newP
			newPasswordError = newPassword.length < 6 ? PASSWORD_ERROR : null
		}
		if (confirmP) {
			confirmPassword = confirmP
			confirmPasswordError = confirmPassword.length < 6 || newPassword !== confirmPassword ? PASSWORD_ERROR : null
		}
	}

	async function handleResetPassword() {
		let isPasswordVerified = true
		if (newPassword.length < 6) {
			newPasswordError = PASSWORD_ERROR
			isPasswordVerified = false
		}
		if (confirmPassword.length < 6 || newPassword !== confirmPassword) {
			confirmPasswordError = PASSWORD_ERROR
			isPasswordVerified = false
		}
		if (!isPasswordVerified) {
			return
		}
		$Loading = true
		$LoadingMessage = "Resetting password..."
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/request/password_reset/${data.ticketNumber}/${data.pin}`, {
				method: "POST",
				body: JSON.stringify({
					Password: confirmPassword
				})
			})
			const fetchData = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = `Password reset for ${fetchData.ID} successful`
				goto(`${base}/`)
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = fetchData.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e)
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}
</script>

<div class="md:w-[30vw] max-md:w-[90%] min-h-[40vh] shadow-md shadow-gray-800 bg-white self-center rounded-md p-2 flex flex-col space-y-2">
	<header class="flex-[0.5] flex space-x-1">
		<div class="self-center w-fit h-fit">
			<img src="{base}/logo.png" alt="data admin logo" class="w-[3vw] h-[4vh]" />
		</div>
		<div class="flex-[9] text-neutral text-2xl text-center font-bold">Password Reset</div>
	</header>
	<main class="flex-[9] flex flex-col space-y-2 justify-evenly">
		<div class="form-control">
			<span class="join">
				<span class="join-item join-label-primary join-label-content"><span>New</span></span>
				<input class="join-item input input-primary w-full" type="password" value={newPassword} on:input={(e) => handleInputPassword(e.currentTarget.value, undefined)} />
			</span>
			{#if newPasswordError}
				<span class="label-text text-error">{newPasswordError}</span>
				<div class="divider" />
			{/if}
		</div>
		<div class="form-control">
			<span class="join">
				<span class="join-item join-label-primary join-label-content">Confirm</span>
				<input class="join-item input input-primary w-full" type="password" value={confirmPassword} on:input={(e) => handleInputPassword(undefined, e.currentTarget.value)} />
			</span>
			{#if confirmPasswordError}
				<span class="label-text text-error">{confirmPasswordError}</span>
				<div class="divider" />
			{/if}
		</div>
	</main>
	<footer class="flex-[0.5] flex">
		<button class="flex-1 join-item btn btn-secondary" on:click={handleResetPassword}>reset password</button>
	</footer>
</div>
