package database

import "embed"

//go:embed metadata_models
var MetadataModels embed.FS

//go:embed group_authorization_rules
var GroupAuthorizationRules embed.FS

//go:embed storage_types
var StorageTypes embed.FS
