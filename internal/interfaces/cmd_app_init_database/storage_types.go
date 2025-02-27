package initdatabase

import (
	"context"
	"encoding/json"
	"fmt"
	"io/fs"

	embedded "github.com/icipe-official/Data-Abstraction-Platform/database"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlibmmodel "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/metadata_model"
)

func (n *CmdInitDatabaseService) ServiceStorageTypesCreate(ctx context.Context) (int, error) {
	storageTypesEntries, err := fs.ReadDir(embedded.StorageTypes, "storage_types")
	if err != nil {
		return 0, fmt.Errorf("read storage_types directory failed, err: %v", err)
	}

	successfulUpserts := 0
	for _, storageTypeEntry := range storageTypesEntries {
		pathToFile := fmt.Sprintf("storage_types/%v", storageTypeEntry.Name())
		fileContent, err := embedded.StorageTypes.ReadFile(pathToFile)
		if err != nil {
			return successfulUpserts, fmt.Errorf("read file %v failed, err: %v", pathToFile, err)
		}

		var jsonData map[string]any
		if err := json.Unmarshal(fileContent, &jsonData); err != nil {
			return successfulUpserts, fmt.Errorf("convert file content %v to json failed, err: %v", storageTypeEntry.Name(), err)
		}

		storageDriveType := new(intdoment.StorageDrivesTypes)
		if storageTypeID, ok := jsonData[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_NAME].(string); ok && len(storageTypeID) > 0 {
			storageDriveType.ID = []string{storageTypeID}
		} else {
			return successfulUpserts, fmt.Errorf("storage metadata-model does not contain %v", intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_NAME)
		}
		if storageTypeDescription, ok := jsonData[intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_DESCRIPTION].(string); ok && len(storageTypeDescription) > 0 {
			storageDriveType.Description = []string{storageTypeDescription}
		} else {
			return successfulUpserts, fmt.Errorf("storage metadata-model does not contain %v", intlibmmodel.FIELD_GROUP_PROP_FIELD_GROUP_DESCRIPTION)
		}

		if err := n.repo.RepoStorageTypesUpsertOne(ctx, storageDriveType); err != nil {
			return successfulUpserts, err
		}
		successfulUpserts += 1
	}

	return successfulUpserts, nil
}
