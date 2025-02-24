package entities

type StorageDrivesTypes struct {
	ID          []string `sql:"primary_key" json:"id,omitempty"`
	Description []string `json:"description,omitempty"`
}

type storageDrivesTypesRepository struct {
	RepositoryName string

	ID          string
	Description string
}

func StorageDrivesTypesRepository() storageDrivesTypesRepository {
	return storageDrivesTypesRepository{
		RepositoryName: "storage_drives_types",

		ID:          "id",
		Description: "description",
	}
}
