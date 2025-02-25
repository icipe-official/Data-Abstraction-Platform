package lib

import (
	"encoding/json"
	"fmt"

	embedded "github.com/icipe-official/Data-Abstraction-Platform/database"
)

func MetadataModelGetDatum(name string) (map[string]any, error) {
	metadataModelFileContent, err := embedded.MetadataModels.ReadFile(fmt.Sprintf("metadata_models/%s.metadata_model.json", name))
	if err != nil {
		return nil, FunctionNameAndError(MetadataModelGetDatum, err)
	}
	var jsonParsed map[string]any
	if err := json.Unmarshal(metadataModelFileContent, &jsonParsed); err != nil {
		return nil, FunctionNameAndError(MetadataModelGetDatum, err)
	}
	return jsonParsed, nil
}

func MetadataModelGenJoinKey(prefix string, suffix string) string {
	return fmt.Sprintf("%s_join_%s", prefix, suffix)
}
