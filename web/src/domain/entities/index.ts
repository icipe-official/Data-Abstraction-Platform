import _Abstractions from './abstractions'
import _AbstractionsAuthorizationIDs from './abstractions_authorization_ids'
import _AbstractionsDirectoryGroups from './abstractions_directory_groups'
import _AbstractionsDirectoryGroupsAuthorizationIDs from './abstractions_directory_groups_authorization_ids'
import _AbstractionsReviews from './abstractions_reviews'
import _AbstractionsReviewsComments from './abstractions_reviews_comments'
import _AppContext from './app_context'
import _Directory from './directory'
import _DirectoryAuthorizationIDs from './directory_authorization_ids'
import _DirectoryGroups from './directory_groups'
import _DirectoryGroupsAuthorizationIDs from './directory_groups_authorization_ids'
import _DirectoryGroupsSubGroups from './directory_groups_sub_groups'
import _GroupAuthorizationRules from './group_authorization_rules'
import _GroupRuleAuthorizations from './group_rule_authorizations'
import _GroupRuleAuthorizationsIDs from './group_rule_authorizations_ids'
import _IamCredentials from './iam_credentials'
import _IamCredentialsSessions from './iam_credentials_sessions'
import _IamGroupAuthorizations from './iam_group_authorizations'
import _IamGroupAuthorizationsIDs from './iam_group_authorizations_ids'
import _MetadataModel from './metadata_model'
import _MetadataModels from './metadata_models'
import _MetadataModelsAuthorizationIDs from './metadata_models_authorization_ids'
import _MetadataModelsDirectory from './metadata_models_directory'
import _MetadataModelsDirectoryGroups from './metadata_models_directory_groups'
import _StorageDrives from './storage_drives'
import _StorageDrivesAuthorizationIDs from './storage_drives_authorization_ids'
import _StorageDrivesGroups from './storage_drives_groups'
import _StorageDrivesGroupAuthorizationIDs from './storage_drives_groups_authorization_ids'
import _StorageDrivesTypes from './storage_drives_types'
import _StorageFiles from './storage_files'
import _StorageFilesAuthorizationIDs from './storage_files_authorization_ids'

namespace Entities {
	export import StorageFilesAuthorizationIDs = _StorageFilesAuthorizationIDs
	export import StorageFiles = _StorageFiles
	export import StorageDrivesTypes = _StorageDrivesTypes
	export import StorageDrivesGroupAuthorizationIDs = _StorageDrivesGroupAuthorizationIDs
	export import StorageDrivesGroups = _StorageDrivesGroups
	export import StorageDrivesAuthorizationIDs = _StorageDrivesAuthorizationIDs
	export import StorageDrives = _StorageDrives
	export import MetadataModelsAuthorizationIDs = _MetadataModelsAuthorizationIDs
	export import MetadataModels = _MetadataModels
	export import IamGroupAuthorizationsIDs = _IamGroupAuthorizationsIDs
	export import IamGroupAuthorizations = _IamGroupAuthorizations
	export import IamCredentialsSessions = _IamCredentialsSessions
	export import IamCredentials = _IamCredentials
	export import GroupRuleAuthorizationsIDs = _GroupRuleAuthorizationsIDs
	export import GroupRuleAuthorizations = _GroupRuleAuthorizations
	export import  GroupAuthorizationRules = _GroupAuthorizationRules
	export import DirectoryGroupsSubGroups = _DirectoryGroupsSubGroups
	export import DirectoryGroupsAuthorizationIDs = _DirectoryGroupsAuthorizationIDs
	export import DirectoryGroups = _DirectoryGroups
	export import DirectoryAuthorizationIDs = _DirectoryAuthorizationIDs
	export import Directory = _Directory
	export import AbstractionsReviewsComments = _AbstractionsReviewsComments
	export import AbstractionsReviews = _AbstractionsReviews
	export import AbstractionsDirectoryGroupsAuthorizationIDs = _AbstractionsDirectoryGroupsAuthorizationIDs
	export import AbstractionsDirectoryGroups = _AbstractionsDirectoryGroups
	export import AbstractionsAuthorizationIDs = _AbstractionsAuthorizationIDs
	export import Abstractions = _Abstractions
	export import AppContext = _AppContext
	export import MetadataModel = _MetadataModel
	export import MetadataModelsDirectoryGroups = _MetadataModelsDirectoryGroups
	export import MetadataModelsDirectory = _MetadataModelsDirectory
}

export default Entities
