<script lang="ts">
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { base } from '$app/paths'
	import { PUBLIC_API_URL } from '$env/static/public'
	import Icon from '$lib/components/Icon.svelte'
	import { FETCH_ERROR, LOGO_URL, Shared } from '$lib/constants'
	import { CurrentUser, Loading, LoadingMessage, ToastType, ToastMessage } from '$lib/stores'
	import { Log } from '$lib/utils'
	import { onDestroy } from 'svelte'

	const CURRENT_SECTION = 'Login'

	export let FromHomeScreen = false

	let email: string = ''
	let emailError: string | null = null
	const DEFAULT_EMAIL_ERROR = 'Enter a valid email'
	function handleInputEmail(value: string) {
		email = value
		emailError = email.length < 7 ? DEFAULT_EMAIL_ERROR : null
	}

	let password: string = ''
	let passwordError: string | null = null
	const DEFAULT_PASSWORD_ERROR = 'Enter a valid password'
	function handleInputPassword(value: string) {
		password = value
		passwordError = password.length < 7 ? DEFAULT_PASSWORD_ERROR : null
	}

	async function handleLogin() {
		let isRequestValid = true
		if (email.length < 7) {
			emailError = DEFAULT_EMAIL_ERROR
			isRequestValid = false
		}
		if (password.length < 7) {
			passwordError = DEFAULT_PASSWORD_ERROR
			isRequestValid = false
		}
		if (!isRequestValid) return

		$Loading = true
		$LoadingMessage = 'Logging in...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/login`, {
				method: 'POST',
				credentials: 'include',
				body: JSON.stringify({
					Email: email,
					Password: password
				})
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$CurrentUser = data
				if (!FromHomeScreen) {
					goto(`${base}/`)
				}
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e)
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$Loading = false
		$LoadingMessage = null
	}

	let isShowLoginSection = true

	async function handleInitializePasswordReset() {
		if (email.length < 7) {
			emailError = DEFAULT_EMAIL_ERROR
			return
		}
		$Loading = true
		$LoadingMessage = 'Initializing password reset...'
		try {
			const fetchResponse = await fetch(`${PUBLIC_API_URL}/iam/request/password_reset`, {
				method: 'POST',
				body: JSON.stringify({
					Email: email
				})
			})
			const data = await fetchResponse.json()
			if (fetchResponse.ok) {
				$ToastType = Shared.ToastType.SUCCESS
				$ToastMessage = data.message
			} else {
				$ToastType = Shared.ToastType.ERROR
				$ToastMessage = data.message
			}
		} catch (e) {
			Log(Shared.LogLevel.ERROR, CURRENT_SECTION, e)
			$ToastType = Shared.ToastType.ERROR
			$ToastMessage = FETCH_ERROR
		}
		$LoadingMessage = null
		$Loading = false
	}

	$: if (browser) {
		document.addEventListener('keydown', handleClickEnter)
	}
	function handleClickEnter(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			handleLogin()
		}
	}
	onDestroy(() => {
		if (browser) {
			document.removeEventListener('keydown', handleClickEnter)
		}
	})
</script>

{#if browser && $CurrentUser === null}
	<header class="flex-[0.5] flex space-x-1">
		{#if isShowLoginSection}
			{#if !FromHomeScreen}
				<div class="flex-1 self-center w-fit h-fit">
					<img src={LOGO_URL} alt="data admin logo" class="w-[3vw] h-[4vh]" />
				</div>
			{/if}
		{:else}
			<button
				class="btn btn-circle btn-ghost"
				on:click={() => {
					isShowLoginSection = !isShowLoginSection
				}}
			>
				<Icon type="mdi:arrow-left" color={Shared.Colors.NEUTRAL} />
			</button>
		{/if}
		<div class="flex-[9] self-center text-neutral text-2xl font-bold text-center">
			{isShowLoginSection ? 'Welcome!' : 'Enter password reset mail'}
		</div>
	</header>
	<main class="flex-[9] flex flex-col space-y-2 justify-evenly">
		<div class="form-control">
			<span class="join">
				<div class="join-item join-label-primary join-label-content"><span>Email</span></div>
				<input class="join-item input input-primary w-full" type="email" value={email} on:input={(e) => handleInputEmail(e.currentTarget.value)} />
			</span>
			{#if emailError}
				<span class="label-text text-error">{emailError}</span>
				<div class="divider" />
			{/if}
		</div>
		{#if isShowLoginSection}
			<div class="form-control">
				<span class="join">
					<span class="join-item join-label-primary join-label-content"><span>Password</span></span>
					<input class="join-item input input-primary w-full" type="password" value={password} on:input={(e) => handleInputPassword(e.currentTarget.value)} />
				</span>
				{#if passwordError}
					<span class="label-text text-error">{passwordError}</span>
					<div class="divider" />
				{/if}
			</div>
		{/if}
	</main>
	<footer class="flex-[0.5] flex flex-col space-y-2 justify-evenly">
		{#if isShowLoginSection}
			<button class="flex-1 btn btn-secondary w-[50%] self-center" on:click={handleLogin}>login</button>
			<button
				class="flex-1 link link-hover"
				on:click={() => {
					isShowLoginSection = !isShowLoginSection
				}}
				>Forgot password?
			</button>
		{:else}
			<button class="btn btn-regular btn-secondary w-[60%] self-center" on:click={handleInitializePasswordReset}>Send password reset mail</button>
		{/if}
	</footer>
{:else}
	<div class="w-full h-full flex justify-center">
		<div class="w-fit h-fit self-center flex flex-col">
			<div class="w-fit h-fit self-center">
				<span class="loading loading-ball loading-sm text-accent" />
				<span class="loading loading-ball loading-md text-secondary" />
				<span class="loading loading-ball loading-lg text-primary" />
			</div>
			<div class="text-lg text-white">Loading...</div>
		</div>
	</div>
{/if}
