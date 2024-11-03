/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_WEBSITE_LOG_LEVEL: number
    readonly VITE_WEBSITE_TITLE: string
    readonly VITE_WEB_SERVICE_API_CORE_URL: string
    readonly VITE_LAYOUT_ROUTES: string
    readonly VITE_LAYOUT_ROUTES_IAM: string
    readonly VITE_LAYOUT_ROUTES_DIRECTORYGROUPID: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}