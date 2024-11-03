namespace _Index {
	export function FilterData(queryConditions: IQueryConditions[], data: any[]) {
		
	}

    export enum FilterConditionLogicalOperators {
        AND = 'AND',
        OR = 'OR',
        AND_NOT = 'AND NOT',
        OR_NOT = 'OR NOT'
    }

	export type IQueryConditions = { [key: string]: IQueryCondition } | string

	export interface ISearchResults {
		metadata_model?: IMetadataModel
		data?: any[]
	}

	export interface IQueryCondition {
		$QC_LABEL?: string
		$FG_PROPERTY?: IMetadataModel
		$FG_FILTER_CONDITION?: IFilterCondition[][]
		$D_SORT_BY_ASC?: { [key: string]: boolean }
		$D_SORT_BY_DESC?: { [key: string]: boolean }
		$D_DISTINCT?: boolean
	}

	export interface IFilterCondition {
		$FILTER_NEGATE?: boolean
		$FILTER_CONDITION?: FilterCondition
		$FILTER_VALUE?: any[]
	}

	export enum FilterCondition {
		GROUP_CONTAINING_FIELDS = 'FILTER_G_CONTAINING_FIELDS',
		FIELD_CONTAINING_VALUE = 'FILTER_F_CONTAINING_VALUE',
		FIELD_GROUP_NO_OF_ENTRIES_GREATER_THAN = 'FILTER_FG_NO_OF_ENTRIES_GREATER_THAN',
		FIELD_GROUP_NO_OF_ENTRIES_LESS_THAN = 'FILTER_FG_NO_OF_ENTRIES_LESS_THAN',
		FIELD_GROUP_NO_OF_ENTRIES_EQUAL_TO = 'FILTER_FG_NO_OF_ENTRIES_EQUAL_TO',
		FIELD_FULL_TEXT_SEARCH = 'FILTER_F_FULL_TEXT_SEARCH',
		FIELD_GREATER_THAN = 'FILTER_F_GREATER_THAN',
		FIELD_LESS_THAN = 'FILTER_F_LESS_THAN',
		FIELD_EQUAL_TO = 'FILTER_F_EQUAL_TO',
		FIELD_TEXT_BEGINS_WITH = 'FILTER_F_TEXT_BEGINS_WITH',
		FIELD_TEXT_ENDS_WITH = 'FILTER_F_TEXT_ENDS_WITH',
		FIELD_TEXT_CONTAINS = 'FILTER_F_TEXT_CONTAINS'
	}

	export interface IMetadataModel {
		$METADATA_MODEL_VERSION?: number
		$FG_KEY?: string
		$FG_NAME?: string
		$FG_DESCRIPTION?: string
		$G_VIEW_TABLE_IN_2D?: boolean
		$G_QUERY_ADD_FULL_TEXT_SEARCH_BOX?: boolean
		$FG_IS_PRIMARY_KEY?: boolean
		$F_DATATYPE?: FieldType
		$F_UI?: FieldUi
		$FG_VIEW_VALUES_IN_SEPARATE_COLUMNS?: boolean
		$FG_VIEW_MAX_NO_OF_VALUES_IN_SEPARATE_COLUMNS?: number
		$F_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_FORMAT?: string
		$F_VIEW_VALUES_IN_SEPARATE_COLUMNS_HEADER_INDEX?: number
		$F_DATETIME_FORMAT?: FieldDateTimeFormat
		$F_SELECT_OPTIONS?: {
			$TYPE?: string
			$LABEL?: string
			$VALUE?: any
		}[]
		$F_PLACEHOLDER?: string
		$FG_MAX_ENTRIES?: number
		$F_DEFAULT_VALUE?: any
		$FG_DISABLE_INPUT?: boolean
		$FG_DISABLE_PROPERTIES_EDIT?: boolean
		$F_ADD_TO_FULL_TEXT_SEARCH_INDEX?: boolean
		$F_CHECKBOX_VALUE_IF_TRUE?: any
		$F_CHECKBOX_VALUE_IF_FALSE?: any
		$F_CHECKBOX_VALUES_USE_IN_VIEW?: boolean
		$F_CHECKBOX_VALUES_USE_IN_STORAGE?: boolean
		$FG_VIEW_DISABLE?: boolean
		$FG_SKIP_DATA_EXTRACTION?: boolean
		$FG_FILTER_DISABLE?: boolean
		$G_EXTRACT_AS_SINGLE_VALUE?: boolean

		$G_READ_ORDER_OF_FIELDS?: string[]
		$G_FIELDS_INDEX?: number
		$G_FIELDS?: { [key: string]: IMetadataModel }[]

		$D_TABLE_COLLECTION_NAME?: string
		$D_FIELD_COLUMN_NAME?: string
	}

	export enum FieldType {
		TEXT = 'text',
		NUMBER = 'number',
		BOOLEAN = 'boolean',
		TIMESTAMP = 'timestamp',
		ANY = 'any',
		UUID = 'uuid'
	}

	export enum FieldUi {
		TEXT = 'text',
		TEXTAREA = 'textarea',
		NUMBER = 'number',
		CHECKBOX = 'checkbox',
		SELECT = 'select',
		DATETIME = 'datetime',
		GROUP = 'group',
		UUID = 'uuid'
	}

	export enum FieldDateTimeFormat {
		YYYYMMDDHHMM = 'yyyy-mm-dd hh:mm',
		YYYYMMDD = 'yyyy-mm-dd',
		YYYYMM = 'yyyy-mm',
		HHMM = 'hh:mm',
		YYYY = 'yyyy',
		MM = 'mm'
	}
}

export default _Index
