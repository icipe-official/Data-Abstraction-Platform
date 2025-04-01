import { html, TemplateResult } from 'lit'

namespace Url {
	export const MetadataModelSearchGetMMPath = '/search/metadata-model'
	export const MetadataModelSearchPath = '/search'

	export interface IWebsitePaths {
		Home: string
		MetadataModels: string
		Directory: {
			Groups: string
			Url: string
		}
		Storage: {
			Drives: {
				Groups: string
				Url: string
			}
			Files: string
		}
		Abstractions: {
			DirectoryGroups: string
			Url: string
		}
	}
	export const WebsitePaths: IWebsitePaths = {
		Home: '/',
		MetadataModels: '/metadata-models',
		Directory: {
			Groups: '/directory/groups',
			Url: '/directory'
		},
		Storage: {
			Drives: {
				Groups: '/storage/drives/groups',
				Url: '/storage/drives'
			},
			Files: '/storage/files'
		},
		Abstractions: {
			DirectoryGroups: '/abstractions/directory-groups',
			Url: '/abstractions'
		}
	}

	export interface IApiUrlPaths {
		Group: {
			RuleAuthorizations: string
			AuthorizationRules: string
		}
		Directory: {
			Groups: string
			Url: string
		}
		Iam: {
			GroupRuleAuthorizations: string
			Credentials: string
			Logout: string
		}
		MetadataModel: string
		MetadataModels: {
			Directory: {
				Groups: string
				Url: string
			}
			Url: string
		}
		Storage: {
			Drives: {
				Types: string
				Groups: string
				Url: string
			}
			Files: string
		}
		Abstractions: {
			DirectoryGroups: string
			Url: string
		}
	}
	export const ApiUrlPaths: IApiUrlPaths = {
		Abstractions: {
			DirectoryGroups: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/abstractions/directory-groups`,
			Url: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/abstractions`
		},
		Storage: {
			Drives: {
				Types: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/storage/drives/types`,
				Groups: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/storage/drives/groups`,
				Url: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/storage/drives`
			},
			Files: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/storage/files`
		},
		Group: {
			RuleAuthorizations: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/group/rule-authorizations`,
			AuthorizationRules: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/group/authorization-rules`
		},
		Directory: {
			Url: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/directory`,
			Groups: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/directory/groups`
		},
		Iam: {
			Credentials: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/iam/credentials`,
			GroupRuleAuthorizations: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/iam/group-authorizations`,
			Logout: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/iam/logout`
		},
		MetadataModel: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/metadata-model`,
		MetadataModels: {
			Directory: {
				Groups: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/metadata-models/directory/groups`,
				Url: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/metadata-models/directory`
			},
			Url: `${import.meta.env.VITE_WEB_SERVICE_API_CORE_URL}/metadata-models`
		}
	}

	export const enum SearchParams {
		TARGET_JOIN_DEPTH = 'target_join_depth',
		SUB_QUERY = 'sub_query',
		VERBOSE_RESPONSE = 'verbose_response',
		SKIP_IF_DATA_EXTRACTION = 'skip_if_data_extraction',
		SKIP_IF_FG_DISABLED = 'skip_if_fg_disabled',
		AUTH_CONTEXT_DIRECTORY_GROUP_ID = 'auth_context_directory_group_id',
		START_SEARCH_DIRECTORY_GROUP_ID = 'start_search_directory_group_id',
		DIRECTORY_GROUP_ID = 'directory_group_id',
		ACTION = 'action'
	}

	export const enum Action {
		CREATE = 'create',
		RETRIEVE = 'retrieve',
		UPDATE = 'update',
		DELETE = 'delete'
	}

	export function AddBaseUrl(url: URL) {
		if (!url.pathname.startsWith(import.meta.env.BASE_URL)) {
			url.pathname = GetBaseUrl() + url.pathname
		}
	}

	export function GetBaseUrl() {
		return import.meta.env.BASE_URL + !import.meta.env.BASE_URL.endsWith('/') ? '/' : ''
	}

	export interface IGroupNavigationInfo {
		path?: string
		title?: string
		icon?: TemplateResult<1>
		description?: string
		navinfo?: IGroupNavigationInfo[]
	}

	export const directoryGroupsNavigation: IGroupNavigationInfo = {
		title: 'Directory Groups',
		icon: html`
			<!--mdi:account-group source: https://icon-sets.iconify.design-->
			<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
				<path
					d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
				/>
			</svg>
		`,
		description: 'Create and manage groups. Groups put together related resources thereby making it easier to manage them as well as who has access to what.',
		navinfo: [
			{
				path: '/directory/groups',
				title: 'Directory Groups',
				icon: html`
					<!--mdi:account-group source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
						<path
							d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
						/>
					</svg>
				`,
				description: 'Create and manage groups. Groups put together related resources thereby making it easier to manage them as well as who has access to what.'
			},
			{
				path: `/directory/groups/new`,
				title: 'Create Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new groups. Such groups will be children of the current group and you will be able to see resources of those groups and their children from the current group.'
			},
			{
				path: `/directory/groups?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for groups that are children of the current group.'
			},
			{
				path: `/directory/groups?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: 'Update groups.'
			},
			{
				path: `/directory/groups?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Deactivate groups and possibly delete resoures under them.'
			}
		]
	}

	export const directoryNavigation: IGroupNavigationInfo = {
		title: 'Directory',
		icon: html`
			<!--mdi:account source: https://icon-sets.iconify.design-->
			<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
		`,
		description: 'Create and manage information about people.',
		navinfo: [
			{
				path: '/directory',
				title: 'Directory',
				icon: html`
					<!--mdi:account source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
				`,
				description: 'Create and manage information about people.'
			},
			{
				path: `/directory/new`,
				title: 'Create Directory Information',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new people ;).'
			},
			{
				path: `/directory?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Directory Information',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for directory information.'
			},
			{
				path: `/directory?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Directory Information',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: 'Update directory information.'
			},
			{
				path: `/directory?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Directory Information',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Deactivate directory users and possibly delete resoures associated them.'
			}
		]
	}

	export const iamCredentialsNavigation: IGroupNavigationInfo = {
		title: 'Iam Credentials',
		icon: html`
			<!--mdi:account-secure source: https://icon-sets.iconify.design-->
			<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
				<path
					d="M6 8c0-2.21 1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4s-4-1.79-4-4m6 10.2c0-.96.5-1.86 1.2-2.46v-.24c0-.39.07-.76.18-1.12c-1.03-.24-2.17-.38-3.38-.38c-4.42 0-8 1.79-8 4v2h10zm10 .1v3.5c0 .6-.6 1.2-1.3 1.2h-5.5c-.6 0-1.2-.6-1.2-1.3v-3.5c0-.6.6-1.2 1.2-1.2v-1.5c0-1.4 1.4-2.5 2.8-2.5s2.8 1.1 2.8 2.5V17c.6 0 1.2.6 1.2 1.3m-2.5-2.8c0-.8-.7-1.3-1.5-1.3s-1.5.5-1.5 1.3V17h3z"
				/>
			</svg>
		`,
		description: 'View and manage credentials that grant users access to different resources within the system.',
		navinfo: [
			{
				path: '/iam/credentials',
				title: 'Iam Credentials',
				icon: html`
					<!--mdi:account-secure source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
						<path
							d="M6 8c0-2.21 1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4s-4-1.79-4-4m6 10.2c0-.96.5-1.86 1.2-2.46v-.24c0-.39.07-.76.18-1.12c-1.03-.24-2.17-.38-3.38-.38c-4.42 0-8 1.79-8 4v2h10zm10 .1v3.5c0 .6-.6 1.2-1.3 1.2h-5.5c-.6 0-1.2-.6-1.2-1.3v-3.5c0-.6.6-1.2 1.2-1.2v-1.5c0-1.4 1.4-2.5 2.8-2.5s2.8 1.1 2.8 2.5V17c.6 0 1.2.6 1.2 1.3m-2.5-2.8c0-.8-.7-1.3-1.5-1.3s-1.5.5-1.5 1.3V17h3z"
						/>
					</svg>
				`,
				description: 'View and manage credentials that grant users access to different resources within the system.'
			},
			{
				path: `/iam/credentials?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Iam Credentials',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account-secure source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								d="M6 8c0-2.21 1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4s-4-1.79-4-4m6 10.2c0-.96.5-1.86 1.2-2.46v-.24c0-.39.07-.76.18-1.12c-1.03-.24-2.17-.38-3.38-.38c-4.42 0-8 1.79-8 4v2h10zm10 .1v3.5c0 .6-.6 1.2-1.3 1.2h-5.5c-.6 0-1.2-.6-1.2-1.3v-3.5c0-.6.6-1.2 1.2-1.2v-1.5c0-1.4 1.4-2.5 2.8-2.5s2.8 1.1 2.8 2.5V17c.6 0 1.2.6 1.2 1.3m-2.5-2.8c0-.8-.7-1.3-1.5-1.3s-1.5.5-1.5 1.3V17h3z"
							/>
						</svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for iam credentials information.'
			},
			{
				path: `/iam/credentials?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Iam Credentials',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account-secure source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								d="M6 8c0-2.21 1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4s-4-1.79-4-4m6 10.2c0-.96.5-1.86 1.2-2.46v-.24c0-.39.07-.76.18-1.12c-1.03-.24-2.17-.38-3.38-.38c-4.42 0-8 1.79-8 4v2h10zm10 .1v3.5c0 .6-.6 1.2-1.3 1.2h-5.5c-.6 0-1.2-.6-1.2-1.3v-3.5c0-.6.6-1.2 1.2-1.2v-1.5c0-1.4 1.4-2.5 2.8-2.5s2.8 1.1 2.8 2.5V17c.6 0 1.2.6 1.2 1.3m-2.5-2.8c0-.8-.7-1.3-1.5-1.3s-1.5.5-1.5 1.3V17h3z"
							/>
						</svg>
						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: "Update iam credentials' directory_id information."
			},
			{
				path: `/iam/credentials?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Iam Credentials',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account-secure source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								d="M6 8c0-2.21 1.79-4 4-4s4 1.79 4 4s-1.79 4-4 4s-4-1.79-4-4m6 10.2c0-.96.5-1.86 1.2-2.46v-.24c0-.39.07-.76.18-1.12c-1.03-.24-2.17-.38-3.38-.38c-4.42 0-8 1.79-8 4v2h10zm10 .1v3.5c0 .6-.6 1.2-1.3 1.2h-5.5c-.6 0-1.2-.6-1.2-1.3v-3.5c0-.6.6-1.2 1.2-1.2v-1.5c0-1.4 1.4-2.5 2.8-2.5s2.8 1.1 2.8 2.5V17c.6 0 1.2.6 1.2 1.3m-2.5-2.8c0-.8-.7-1.3-1.5-1.3s-1.5.5-1.5 1.3V17h3z"
							/>
						</svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Deactivate iam credentials.'
			}
		]
	}

	export const iamGroupAuthorizationsNavigation: IGroupNavigationInfo = {
		title: 'Iam Group Authorizations',
		icon: html`
			<!--mdi:security-account source: https://icon-sets.iconify.design-->
			<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
				<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5zm0 4a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5.13 12A9.7 9.7 0 0 1 12 20.92A9.7 9.7 0 0 1 6.87 17c-.34-.5-.63-1-.87-1.53c0-1.65 2.71-3 6-3s6 1.32 6 3c-.24.53-.53 1.03-.87 1.53" />
			</svg>
		`,
		description: "Create and manage authorization rules that grant users with credentials the ability to perform certain activities in the context of a group within the platform. NB>Requires group to be first granted said role in 'Group Rule Authorizations'.",
		navinfo: [
			{
				path: '/iam/group-authorizations',
				title: 'Iam Group Authorizations',
				icon: html`
					<!--mdi:security-account source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
						<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5zm0 4a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5.13 12A9.7 9.7 0 0 1 12 20.92A9.7 9.7 0 0 1 6.87 17c-.34-.5-.63-1-.87-1.53c0-1.65 2.71-3 6-3s6 1.32 6 3c-.24.53-.53 1.03-.87 1.53" />
					</svg>
				`,
				description: "Create and manage authorization rules that grant users with credentials the ability to perform certain activities in the context of a group within the platform. NB>Requires group to be first granted said role in 'Group Rule Authorizations'."
			},
			{
				path: `/iam/group-authorizations?${SearchParams.ACTION}=${Action.CREATE}`,
				title: 'Create Iam Group Authorizations',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:security-account source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5zm0 4a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5.13 12A9.7 9.7 0 0 1 12 20.92A9.7 9.7 0 0 1 6.87 17c-.34-.5-.63-1-.87-1.53c0-1.65 2.71-3 6-3s6 1.32 6 3c-.24.53-.53 1.03-.87 1.53" />
						</svg>
						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new iam-group-authorizations.'
			},
			{
				path: `/iam/group-authorizations?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Iam Group Authorizations',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:security-account source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5zm0 4a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5.13 12A9.7 9.7 0 0 1 12 20.92A9.7 9.7 0 0 1 6.87 17c-.34-.5-.63-1-.87-1.53c0-1.65 2.71-3 6-3s6 1.32 6 3c-.24.53-.53 1.03-.87 1.53" />
						</svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for iam-group-authorizations information.'
			},
			{
				path: `/iam/group-authorizations?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Iam Group Authorizations',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:security-account source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5zm0 4a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5.13 12A9.7 9.7 0 0 1 12 20.92A9.7 9.7 0 0 1 6.87 17c-.34-.5-.63-1-.87-1.53c0-1.65 2.71-3 6-3s6 1.32 6 3c-.24.53-.53 1.03-.87 1.53" />
						</svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Deactivate iam-group-authorizations.'
			}
		]
	}

	export const groupRuleAuthorizationsNavigation: IGroupNavigationInfo = {
		title: 'Group Rule Authorizations',
		icon: html`
			<div class="flex gap-x-1 self-center">
				<!--mdi:account-group source: https://icon-sets.iconify.design-->
				<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
					<path
						d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
					/>
				</svg>
				<!--mdi:secure source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
					<path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
				</svg>
			</div>
		`,

		description: 'Create and manage authorizations rules that can be assigned to users with credentials within a group.',
		navinfo: [
			{
				path: '/group/rule-authorizations',
				title: 'Group Rule Authorizations',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:secure source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
						</svg>
					</div>
				`,
				description: 'Create and manage authorizations rules that can be assigned to users with credentials within a group.'
			},
			{
				path: `/group/rule-authorizations?${SearchParams.ACTION}=${Action.CREATE}`,
				title: 'Create Group Rule Authorizations',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:secure source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
						</svg>
						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new authorizations rules.'
			},
			{
				path: `/group/rule-authorizations?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Group Rule Authorizations',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:secure source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
						</svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for authorizations rules.'
			},
			{
				path: `/group/rule-authorizations?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Group Rule Authorizations',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:secure source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path d="M12 17a2 2 0 0 0 2-2a2 2 0 0 0-2-2a2 2 0 0 0-2 2a2 2 0 0 0 2 2m6-9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2h1V6a5 5 0 0 1 5-5a5 5 0 0 1 5 5v2zm-6-5a3 3 0 0 0-3 3v2h6V6a3 3 0 0 0-3-3" />
						</svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Deactivate authorizations rules.'
			}
		]
	}

	export const groupAuthorizationRulesNavigation: IGroupNavigationInfo = {
		title: 'Group Authorization Rules',
		icon: html`
			<!--carbon:subnet-acl-rules source: https://icon-sets.iconify.design-->
			<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
				<path d="M18 14h12v2H18zm0 5h8v2h-8zm0-10h12v2H18z" />
				<path d="M22 24v4H6V16h8v-2h-4V8a4 4 0 0 1 7.668-1.6l1.832-.8A6.001 6.001 0 0 0 8 8v6H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4Z" />
			</svg>
		`,
		description: 'View and update the tags of various roles that can be assigned to groups and therefore users with credentials in the platform.',
		navinfo: [
			{
				path: '/group/authorization-rules',
				title: 'Group Authorization Rules',
				icon: html`
					<!--carbon:subnet-acl-rules source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
						<path d="M18 14h12v2H18zm0 5h8v2h-8zm0-10h12v2H18z" />
						<path d="M22 24v4H6V16h8v-2h-4V8a4 4 0 0 1 7.668-1.6l1.832-.8A6.001 6.001 0 0 0 8 8v6H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4Z" />
					</svg>
				`,
				description: 'View and update the tags of various roles that can be assigned to groups and therefore users with credentials in the platform.'
			},
			{
				path: `/group/authorization-rules?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Group Authorization Rules',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--carbon:subnet-acl-rules source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
							<path d="M18 14h12v2H18zm0 5h8v2h-8zm0-10h12v2H18z" />
							<path d="M22 24v4H6V16h8v-2h-4V8a4 4 0 0 1 7.668-1.6l1.832-.8A6.001 6.001 0 0 0 8 8v6H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4Z" />
						</svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for authorizations rules.'
			},
			{
				path: `/group/authorization-rules?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Group Authorization Rules',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--carbon:subnet-acl-rules source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
							<path d="M18 14h12v2H18zm0 5h8v2h-8zm0-10h12v2H18z" />
							<path d="M22 24v4H6V16h8v-2h-4V8a4 4 0 0 1 7.668-1.6l1.832-.8A6.001 6.001 0 0 0 8 8v6H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4Z" />
						</svg>
						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: "Update group authorization rules' tags."
			}
		]
	}

	export const metadataModelsNavigation: IGroupNavigationInfo = {
		title: 'Metadata-Models',
		icon: html`
			<div class="flex gap-x-1 self-center">
				<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
					<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
				</svg>
				<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
					<path
						d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
					/>
				</svg>
			</div>
		`,
		description: 'Create, update, and delete information that forms the building blocks of incorporating unstructured data (JSON) within the platform.',
		navinfo: [
			{
				path: '/metadata-models',
				title: 'Metadata-Models',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
					</div>
				`,
				description: 'Create, update, and delete information that forms the building blocks of incorporating unstructured data (JSON) within the platform.'
			},
			{
				path: `/metadata-models/new`,
				title: 'Create Metadata-Models',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new metadata-models.'
			},
			{
				path: `/metadata-models?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Metadata-Models',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for metadata-models.'
			},
			{
				path: `/metadata-models?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Metadata-Models',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: 'Update metadata-models.'
			},
			{
				path: `/metadata-models?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Metadata-Models',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Deactivate metadata-models.'
			}
		]
	}

	export const storageFilesNavigation: IGroupNavigationInfo = {
		title: 'Storage Files',
		icon: html`
			<!--mdi:file-multiple source: https://icon-sets.iconify.design-->
			<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
				<path d="M15 7h5.5L15 1.5zM8 0h8l6 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2M4 4v18h16v2H4a2 2 0 0 1-2-2V4z" />
			</svg>
		`,
		description: 'Upload and manage files stored in the platform.',
		navinfo: [
			{
				path: '/storage/files',
				title: 'Storage Files',
				icon: html`
					<!--mdi:file-multiple source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
						<path d="M15 7h5.5L15 1.5zM8 0h8l6 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2M4 4v18h16v2H4a2 2 0 0 1-2-2V4z" />
					</svg>
				`,
				description: 'Upload and manage files stored in the platform.'
			},
			{
				path: `/storage/files?${SearchParams.ACTION}=${Action.CREATE}`,
				title: 'Create Storage Files',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:file-multiple source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M15 7h5.5L15 1.5zM8 0h8l6 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2M4 4v18h16v2H4a2 2 0 0 1-2-2V4z" />
						</svg>
						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new files.'
			},
			{
				path: `/storage/files?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Storage Files',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:file-multiple source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M15 7h5.5L15 1.5zM8 0h8l6 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2M4 4v18h16v2H4a2 2 0 0 1-2-2V4z" />
						</svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for files.'
			},
			{
				path: `/storage/files?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Storage Files',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:file-multiple source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M15 7h5.5L15 1.5zM8 0h8l6 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2M4 4v18h16v2H4a2 2 0 0 1-2-2V4z" />
						</svg>
						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: "Update file's information."
			},
			{
				path: `/storage/files?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Storage Files',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:file-multiple source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M15 7h5.5L15 1.5zM8 0h8l6 6v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2M4 4v18h16v2H4a2 2 0 0 1-2-2V4z" />
						</svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Delete files.'
			}
		]
	}

	export const storageDrivesNavigation: IGroupNavigationInfo = {
		title: 'Storage Drives',
		icon: html`
			<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
			<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
				<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
			</svg>
		`,
		description: 'Create and manage storage drives used to store files.',
		navinfo: [
			{
				path: '/storage/drives',
				title: 'Storage Drives',
				icon: html`
					<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
					<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
						<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
					</svg>
				`,
				description: 'Create and manage storage drives used to store files.'
			},
			{
				path: `/storage/drives/new`,
				title: 'Create Storage Drives',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
						</svg>
						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new storage drives.'
			},
			{
				path: `/storage/drives?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Storage Drives',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
						</svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for storage drives.'
			},
			{
				path: `/storage/drives?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Storage Drives',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
						</svg>
						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: 'Update storage drives.'
			},
			{
				path: `/storage/drives?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Storage Drives',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
						</svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Deactivate storage drives.'
			}
		]
	}

	export const storageDrivesGroupNavigation: IGroupNavigationInfo = {
		title: 'Storage Drives Groups',
		icon: html`
			<div class="flex gap-x-1 self-center">
				<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
				<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
					<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
				</svg>
				<!--mdi:account-group source: https://icon-sets.iconify.design-->
				<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
					<path
						d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
					/>
				</svg>
			</div>
		`,
		description: 'Manage storage drives assigned to various groups.',
		navinfo: [
			{
				path: '/storage/drives/groups',
				title: 'Storage Drives Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
						</svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
					</div>
				`,
				description: 'Manage storage drives assigned to various groups.'
			},
			{
				path: `/storage/drives/groups?${SearchParams.ACTION}=${Action.CREATE}`,
				title: 'Create Storage Drives Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
						</svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new storage-drives-group.'
			},
			{
				path: `/storage/drives/groups?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Storage Drives Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
						</svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for storage-drives-group.'
			},
			{
				path: `/storage/drives/groups?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Storage Drives Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
						</svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: 'Update storage-drives-group.'
			},
			{
				path: `/storage/drives/groups?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Storage Drives Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:network-attached-storage source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M4 5c-1.11 0-2 .89-2 2v10c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V7c0-1.11-.89-2-2-2zm.5 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M7 7h13v10H7zm1 1v8h3V8zm4 0v8h3V8zm4 0v8h3V8zM9 9h1v1H9zm4 0h1v1h-1zm4 0h1v1h-1z" />
						</svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg class="self-center" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Deactivate storage-drives-group.'
			}
		]
	}

	export const metadataModelsDirectoryNavigation: IGroupNavigationInfo = {
		title: 'Default Metadata-Models for Directory',
		icon: html`
			<div class="flex gap-x-1 self-center">
				<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
					<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
				</svg>
				<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
					<path
						d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
					/>
				</svg>
				<!--mdi:account source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
			</div>
		`,
		description: 'Manage default metadata-models used for viewing and updating directory data information. Scoped to per group.',
		navinfo: [
			{
				path: '/metadata-models/directory',
				title: 'Default Metadata-Models for Directory',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:account source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
					</div>
				`,
				description: 'Manage default metadata-models used for viewing and updating directory data information. Scoped to per group.'
			},
			{
				path: `/metadata-models/directory?${SearchParams.ACTION}=${Action.CREATE}`,
				title: 'Create Default Metadata-Models for Directory',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:account source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new metadata-models directory.'
			},
			{
				path: `/metadata-models/directory?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Default Metadata-Models for Directory',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:account source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for metadata-models directory.'
			},
			{
				path: `/metadata-models/directory?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Default Metadata-Models for Directory',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:account source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: 'Update metadata-models directory.'
			},
			{
				path: `/metadata-models/directory?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Default Metadata-Models for Directory',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:account source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4" /></svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Deactivate metadata-models directory.'
			}
		]
	}

	export const metadataModelsDirectoryGroupsNavigation: IGroupNavigationInfo = {
		title: 'Default Metadata-Models for Directory Groups',
		icon: html`
			<div class="flex gap-x-1 self-center">
				<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
					<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
				</svg>
				<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
					<path
						d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
					/>
				</svg>
				<!--mdi:account-group source: https://icon-sets.iconify.design-->
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
					<path
						d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
					/>
				</svg>
			</div>
		`,
		description: 'Manage default metadata-models used for viewing and updating directory groups data information. Scoped to per group.',
		navinfo: [
			{
				path: '/metadata-models/directory/groups',
				title: 'Default Metadata-Models for Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
					</div>
				`,
				description: 'Manage default metadata-models used for viewing and updating directory groups data information. Scoped to per group.'
			},
			{
				path: `/metadata-models/directory/groups?${SearchParams.ACTION}=${Action.CREATE}`,
				title: 'Create Default Metadata-Models for Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new metadata-models directory groups.'
			},
			{
				path: `/metadata-models/directory/groups?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Default Metadata-Models for Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for metadata-models directory groups.'
			},
			{
				path: `/metadata-models/directory/groups?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Default Metadata-Models for Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: 'Update metadata-models directory groups.'
			},
			{
				path: `/metadata-models/directory/groups?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Default Metadata-Models for Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:data-matrix source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
							<path d="M2 2v20h20v-2h-2v-2h2v-2h-2v-2h2v-2h-4v-2h-2v2h-2v-2h-2V8H8v4h4v4h-2v2h2v2h-2v-2H8v-2H6v-2H4v-2h2V6H4V2zm4 4h2V2H6zm2 10h2v-2H8zm10-6h4V8h-4zm0-2V4h-2v2h-2v2zm-2-4V2h-2v2zm2 0h2V2h-2zm2 0v2h2V4zM10 2v4h2V2zm4 12h2v2h2v4h-4zM4 18h2v2H4z" />
						</svg>
						<!--mdi:carbon:ibm-secure-infrastructure-on-vpc-for-regulated-industries source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
							<path
								d="M9 21H3c-1.103 0-2-.897-2-2v-6c0-1.103.897-2 2-2h6c1.103 0 2 .897 2 2v6c0 1.103-.897 2-2 2m-6-8v6h6v-6zm13 17q-.543 0-1.076-.04c-4.352-.332-8.36-2.732-10.723-6.42l1.685-1.08a12.06 12.06 0 0 0 9.19 5.505Q15.533 28 16 28zm7 0l-2.1-1c-1.7-.8-2.9-2.6-2.9-4.5V18h10v6.5c0 1.9-1.1 3.7-2.9 4.5zm-3-10v4.5c0 1.2.7 2.2 1.7 2.7l1.3.6l1.3-.6c1-.5 1.7-1.6 1.7-2.7V20zm7.302-8c.454 1.282.698 2.621.698 4h2c0-1.37-.199-2.708-.584-4zM27 10h-3c-1.103 0-2-.897-2-2V5c0-1.103.897-2 2-2h3c1.103 0 2 .897 2 2v3c0 1.103-.897 2-2 2m-3-5v3h3V5zm-4-2.416A14 14 0 0 0 16 2A13.95 13.95 0 0 0 4.202 8.46l1.684 1.08A11.96 11.96 0 0 1 20 4.698z"
							/>
						</svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Deactivate metadata-models directory groups.'
			}
		]
	}

	export const abstractionsDirectoryGroupsNavigation: IGroupNavigationInfo = {
		title: 'Abstractions Directory Groups',
		icon: html`
			<!--mdi:notebook source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>
			<!--mdi:account-group source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
				<path
					d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
				/>
			</svg>
		`,
		description: "Create and manage abstraction's sessions information in the context of a group.",
		navinfo: [
			{
				path: '/abstractions/directory-groups',
				title: 'Abstractions Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:notebook source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
					</div>
				`,
				description: "Create and manage abstraction's sessions information in the context of a group."
			},
			{
				path: `/abstractions/directory-groups/new`,
				title: 'Create Abstractions Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:notebook source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new abstractions directory groups.'
			},
			{
				path: `/abstractions/directory-groups?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Abstractions Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:notebook source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for abstractions directory groups.'
			},
			{
				path: `/abstractions/directory-groups?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Abstractions Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:notebook source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: 'Update abstractions directory groups.'
			},
			{
				path: `/abstractions/directory-groups?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Abstractions Directory Groups',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:notebook source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>
						<!--mdi:account-group source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
							<path
								d="M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z"
							/>
						</svg>
						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Delete/deactivate abstractions directory groups.'
			}
		]
	}

	export const abstractionsNavigation: IGroupNavigationInfo = {
		title: 'Abstractions',
		icon: html`
			<!--mdi:notebook source: https://icon-sets.iconify.design-->
			<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>
		`,
		description: 'Create and manage data abstracted from published works.',
		navinfo: [
			{
				path: '/abstractions',
				title: 'Abstractions',
				icon: html`
					<!--mdi:notebook source: https://icon-sets.iconify.design-->
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>
				`,
				description: 'Create and manage data abstracted from published works.'
			},
			{
				path: `/abstractions?${SearchParams.ACTION}=${Action.CREATE}`,
				title: 'Create New Abstractions',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:notebook source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>

						<!--mdi:plus-thick source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20 14h-6v6h-4v-6H4v-4h6V4h4v6h6z" /></svg>
					</div>
				`,
				description: 'Create new abstractions.'
			},
			{
				path: `/abstractions?${SearchParams.ACTION}=${Action.RETRIEVE}`,
				title: 'Search Abstractions',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:notebook source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>

						<!--mdi:search source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
							<path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.52 6.52 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5" />
						</svg>
					</div>
				`,
				description: 'Search for abstractions.'
			},
			{
				path: `/abstractions?${SearchParams.ACTION}=${Action.UPDATE}`,
				title: 'Update Abstractions',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:notebook source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>

						<!--mdi:edit source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M20.71 7.04c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.37-.39-1.02-.39-1.41 0l-1.84 1.83l3.75 3.75M3 17.25V21h3.75L17.81 9.93l-3.75-3.75z" /></svg>
					</div>
				`,
				description: 'Update abstractions.'
			},
			{
				path: `/abstractions?${SearchParams.ACTION}=${Action.DELETE}`,
				title: 'Delete Abstractions',
				icon: html`
					<div class="flex gap-x-1 self-center">
						<!--mdi:notebook source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="M3 7V5h2V4a2 2 0 0 1 2-2h6v7l2.5-1.5L18 9V2h1c1.05 0 2 .95 2 2v16c0 1.05-.95 2-2 2H7c-1.05 0-2-.95-2-2v-1H3v-2h2v-4H3v-2h2V7zm4 4H5v2h2zm0-4V5H5v2zm0 12v-2H5v2z" /></svg>

						<!--mdi:delete source: https://icon-sets.iconify.design-->
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z" /></svg>
					</div>
				`,
				description: 'Delete/deactivate abstractions.'
			}
		]
	}

	export const groupNavigation: IGroupNavigationInfo[] = [
		abstractionsNavigation,
		metadataModelsNavigation,
		storageFilesNavigation,
		abstractionsDirectoryGroupsNavigation,
		{
			title: 'Administration',
			navinfo: [
				directoryNavigation,
				directoryGroupsNavigation,
				iamCredentialsNavigation,
				iamGroupAuthorizationsNavigation,
				groupRuleAuthorizationsNavigation,
				groupAuthorizationRulesNavigation,
				storageDrivesNavigation,
				storageDrivesGroupNavigation,
				metadataModelsDirectoryNavigation,
				metadataModelsDirectoryGroupsNavigation
			]
		}
	]
}

export default Url
