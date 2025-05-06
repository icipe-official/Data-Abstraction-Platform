import { base } from '$app/paths'

export namespace Shared {
	export enum Colors {
		PRIMARY = '#3c7847',
		SECONDARY = '#d4c16d',
		ACCENT = '#ffffff',
		NEUTRAL = '#000000',
		ERROR = '#ff0000',
		SUCCESS = '#008000',
		INFO = '#0000cd',
		WARNING = '#ffa500'
	}

	export enum ToastType {
		ERROR = 'alert-error',
		WARNING = 'alert-warning',
		INFO = 'alert-info',
		SUCCESS = 'alert-success'
	}

	export enum ProjectRoles {
		ABSTRACTIONS_ADMIN = 'abstractions_admin',
		CATALOGUE_CREATOR = 'catalogue_creator',
		EDITOR = 'editor',
		FILE_CREATOR = 'file_creator',
		MODEL_TEMPLATES_CREATOR = 'model_templates_creator',
		PROJECT_ADMIN = 'project_admin',
		REVIEWER = 'reviewer',
		EXPLORER = 'explorer'
	}

	export enum LogLevel {
		DEBUG = 0,
		WARNING = 1,
		ERROR = 2
	}

	export enum TextFilterType {
		CONTAINING = 'text containing',
		BEGINNING_WITH = 'beginning with',
		ENDING_WITH = 'ending with',
		EQUAL_TO = 'equal to'
	}

	export enum NumberFilterType {
		GREATER_THAN = 'greater than',
		LESS_THAN = 'less than',
		EQUAL_TO = 'equal to'
	}

	export enum MultiSelectFilterType {
		CONTAINING = 'containing'
	}
}

export const NIL_DATE_TIME = "0001-01-01T00:00:00Z"

export const OPTS_REGEX_SEARCH = /opts=((?:.+?~!!~.+?(?:%!!%|))+?)&#/
export const OPTS_SPLIT = '%!!%'
export const OPT_SPLIT = '~!!~'

export const DATE_TIME_REGEX_SEARCH = /dtf=([a-zA-Z\:\-\s]+?)&#/

export const DESC_REGEX_SEARCH = /desc=(.+?)&#/s

export const SPECIAL_CHARS_REGEX_SEARCH = /[^a-zA-Z0-9]+/g

export const NAME_REGEX_SEARCH = /name=(.+?)&#/

export const DISABLED_REGEX_SEARCH = /disabled=true&#/

export const DISALLOWED_CHARACTERS_REGEX_SEARCH = /%!!%|~!!~|&#|name=|desc=|dtf=|opts=|met@d@t@/gm

export const NOT_REGEX_EXTRACT = /not=true&#/
export const FILTER_TYPE_EXTRACT = /filtertype=(equal to|between|greater than|less than|beginning with|ending with|containing|text containing)&#/
export const VALUE_EXTRACT = /value=(.+?)&#/
export const MAX_EXTRACT = /max=(.+?)&#/
export const RENDER_HORIZONTALLY_EXTRACT = /renderhorizontally=true&#/
export const DATA_ENTRY_MANDATORY = /dataentrymandatory=true&#/

export const FETCH_ERROR = 'Unkown error occured'

export const LOGO_URL = `${base}/logo.png`
