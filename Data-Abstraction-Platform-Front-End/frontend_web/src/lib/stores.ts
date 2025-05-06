import { type Writable, writable } from 'svelte/store'
import type { ICatalogue, ICurrentProject, ICurrentUser, IFile, IModelTemplate, IPlatformStats, IProjectStats, IProjectStorage, ISearchAbstraction, ISearchDirectory, ISearchProject, ISearchStorage, ISearchUser, IStorageTypes } from './interface'

// Project store
export let CurrentProjectDetails: Writable<ISearchProject|null> = writable(null)

// Platform statistics
export let PlatformStatistics: Writable<IPlatformStats|null> = writable(null)
export let PlatformStatisticsLastFetch: Writable<string|null> = writable(null)
export let ProjectsStatistics: Writable<IProjectStats|null> = writable(null)
export let ProjectsStatisticsLastFetch: Writable<string|null> = writable(null)

// ui store
export let Loading: Writable<boolean> = writable(false)
export let LoadingMessage: Writable<string | null> = writable(null)
export let ToastMessage: Writable<string | string[] | null> = writable(null)
export let ToastType: Writable<string | null> = writable(null)

// Logged In Session store
export let CurrentUser: Writable<ICurrentUser | null> = writable(null)
export let CurrentProject: Writable<ICurrentProject | null> = writable(null)

// Storage store
export let StoragesSearchResults: Writable<ISearchStorage[]> = writable([])
export let StoragesSearchCreatedOnGreaterThan: Writable<string> = writable('')
export let StoragesSearchCreatedOnLessThan: Writable<string> = writable('')
export let StoragesSearchLastUpdatedOnGreaterThan: Writable<string> = writable('')
export let StoragesSearchLastUpdatedOnLessThan: Writable<string> = writable('')
export let StoragesSearchLimit: Writable<number> = writable(1000)
export let StoragesSearchOffset: Writable<number> = writable(0)
export let StoragesSearchSortBy: Writable<string> = writable('last_updated_on')
export let StoragesSearchSortByOrder: Writable<string> = writable('desc')
export let StoragesSearchCreatedFilterOptions: Writable<{}> = writable({})
export let StorageTypesSearchResults: Writable<IStorageTypes[]> = writable([])

// Project store
export let ProjectsSearchResults: Writable<ISearchProject[]> = writable([])
export let ProjectsSearchCurrentQuery: Writable<string> = writable('')
export let ProjectsSearchPreviousQuery: Writable<string> = writable('')
export let ProjectsSearchCreatedOnGreaterThan: Writable<string> = writable('')
export let ProjectsSearchCreatedOnLessThan: Writable<string> = writable('')
export let ProjectsSearchLastUpdatedOnGreaterThan: Writable<string> = writable('')
export let ProjectsSearchLastUpdatedOnLessThan: Writable<string> = writable('')
export let ProjectsSearchLimit: Writable<number> = writable(1000)
export let ProjectsSearchOffset: Writable<number> = writable(0)
export let ProjectsSearchSortBy: Writable<string> = writable('last_updated_on')
export let ProjectsSearchSortByOrder: Writable<string> = writable('desc')
export let ProjectsSearchCreatedFilterOptions: Writable<{}> = writable({})

// Directory store
export let DirectorySearchResults: Writable<ISearchUser[]> = writable([])
export let DirectorySearchCurrentQuery: Writable<string> = writable('')
export let DirectorySearchPreviousQuery: Writable<string> = writable('')
export let DirectorySearchCreatedOnGreaterThan: Writable<string> = writable('')
export let DirectorySearchCreatedOnLessThan: Writable<string> = writable('')
export let DirectorySearchLastUpdatedOnGreaterThan: Writable<string> = writable('')
export let DirectorySearchLastUpdatedOnLessThan: Writable<string> = writable('')
export let DirectorySearchLimit: Writable<number> = writable(1000)
export let DirectorySearchOffset: Writable<number> = writable(0)
export let DirectorySearchSortBy: Writable<string> = writable('last_updated_on')
export let DirectorySearchSortByOrder: Writable<string> = writable('desc')
export let DirectorySearchCreatedFilterOptions: Writable<{}> = writable({})

// Catalogues store
export let CataloguesSearchResults: Writable<ICatalogue[]> = writable([])
export let CataloguesSearchCurrentQuery: Writable<string> = writable('')
export let CataloguesSearchPreviousQuery: Writable<string> = writable('')
export let CataloguesSearchUseCurrentProject: Writable<boolean> = writable(true)
export let CataloguesSearchCreatedOnGreaterThan: Writable<string> = writable('')
export let CataloguesSearchCreatedOnLessThan: Writable<string> = writable('')
export let CataloguesSearchLastUpdatedOnGreaterThan: Writable<string> = writable('')
export let CataloguesSearchLastUpdatedOnLessThan: Writable<string> = writable('')
export let CataloguesSearchLimit: Writable<number> = writable(1000)
export let CataloguesSearchOffset: Writable<number> = writable(0)
export let CataloguesSearchSortBy: Writable<string> = writable('last_updated_on')
export let CataloguesSearchSortByOrder: Writable<string> = writable('desc')
export let CataloguesSearchCreatedFilterOptions: Writable<{}> = writable({})

// Model Templates store
export let ModelTemplatesSearchResults: Writable<IModelTemplate[]> = writable([])
export let ModelTemplatesSearchCurrentQuery: Writable<string> = writable('')
export let ModelTemplatesSearchPreviousQuery: Writable<string> = writable('')
export let ModelTemplatesSearchUseCurrentProject: Writable<boolean> = writable(true)
export let ModelTemplatesSearchCreatedOnGreaterThan: Writable<string> = writable('')
export let ModelTemplatesSearchCreatedOnLessThan: Writable<string> = writable('')
export let ModelTemplatesSearchLastUpdatedOnGreaterThan: Writable<string> = writable('')
export let ModelTemplatesSearchLastUpdatedOnLessThan: Writable<string> = writable('')
export let ModelTemplatesSearchLimit: Writable<number> = writable(1000)
export let ModelTemplatesSearchOffset: Writable<number> = writable(0)
export let ModelTemplatesSearchSortBy: Writable<string> = writable('last_updated_on')
export let ModelTemplatesSearchSortByOrder: Writable<string> = writable('desc')
export let ModelTemplatesSearchCreatedFilterOptions: Writable<{}> = writable({})

// Files Store
export let FilesSearchResults: Writable<IFile[]> = writable([])
export let FilesSearchCurrentQuery: Writable<string> = writable('')
export let FilesSearchPreviousQuery: Writable<string> = writable('')
export let FilesSearchUseCurrentProject: Writable<boolean> = writable(true)
export let FilesSearchCreatedOnGreaterThan: Writable<string> = writable('')
export let FilesSearchCreatedOnLessThan: Writable<string> = writable('')
export let FilesSearchLimit: Writable<number> = writable(1000)
export let FilesSearchOffset: Writable<number> = writable(0)
export let FilesSearchSortBy: Writable<string> = writable('created_on')
export let FilesSearchSortByOrder: Writable<string> = writable('desc')
export let FilesSearchFileWithAbstractions: Writable<string> = writable('')
export let FilesSearchCreatedFilterOptions: Writable<{}> = writable({})

// Search Results Store
export let SearchResultsClickedIndex: Writable<number | null> = writable(null)

// Available Project Storage Options
export let ProjectStorage: Writable<IProjectStorage[]> = writable([])

// Abstractions store
export let AbstractionsSearchResults: Writable<ISearchAbstraction[]> = writable([])
export let AbstractionEditorsSearchResults: Writable<ISearchDirectory[]> = writable([])
export let AbstractionCurrentTemplate: Writable<IModelTemplate | null> = writable(null)
export let AbstractionsSearchCurrentAbstractor: Writable<ISearchDirectory | null> = writable(null)
export let AbstractionsSearchCreatedOnGreaterThan: Writable<string> = writable('')
export let AbstractionsSearchCreatedOnLessThan: Writable<string> = writable('')
export let AbstractionsSearchLastUpdatedOnGreaterThan: Writable<string> = writable('')
export let AbstractionsSearchLastUpdatedOnLessThan: Writable<string> = writable('')
export let AbststractionsSearchIsVerified: Writable<string> = writable('')
export let AbstractionsSearchLimit: Writable<number> = writable(1000)
export let AbstractionsSearchOffset: Writable<number> = writable(0)
export let AbstractionsSearchSortBy: Writable<string> = writable('last_updated_on')
export let AbstractionsSearchSortByOrder: Writable<string> = writable('desc')
export let AbstractionTimeoutActive: Writable<boolean> = writable(true)
export let AbstractionTimeoutSeconds: Writable<number> = writable(300000)
export let AbstractionsSearchCreatedFilterOptions: Writable<{}> = writable({})
