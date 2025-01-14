namespace _DirectoryGroupsSubGroups {
	export enum Column {
		ParentGroupID = 'parent_group_id',
		SubGroupID = 'sub_group_id'
	}

	export const TableName = 'directory_groups_sub_groups'

	export interface Interface {
		parent_group_id?: string[]
		sub_group_id?: string[]
	}
}

export default _DirectoryGroupsSubGroups
