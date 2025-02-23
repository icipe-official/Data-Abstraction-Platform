package metadatamodel

import (
	"errors"
	"fmt"

	"github.com/brunoga/deep"
)

type DatabaseColumnFields struct {
	ColumnFieldsReadOrder []string
	Fields                map[string]any
}

// Extracts database fields from metadatamodel if tableCollectionName matches.
//
// Parameters:
//
//   - metadatamodel - A valid metadata-model of type object (not array). Expected to presented as if converted from JSON.
//
//   - tableCollectionName - Extract only fields whose FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_NAME match this value.
//
//   - tableCollectionUID - Extract only fields whose FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_UID match this value.
//
//   - skipIfFGDisabled - Do not include field group if property FIELD_GROUP_PROP_FIELD_GROUP_VIEW_DISABLE($FG_VIEW_DISABLE) is true.
//
//   - skipIfDataExtraction - Do not include field group if property FIELD_GROUP_PROP_DATABASE_SKIP_DATA_EXTRACTION($DATABASE_SKIP_DATA_EXTRACTION) is true.
//
// returns error if metadatamodel or tableCollectionName is not valid.
func DatabaseGetColumnFields(metadatamodel any, tableCollectionName string, tableCollectionUID string, skipIfFGDisabled bool, skipIfDataExtraction bool) (DatabaseColumnFields, error) {
	x, err := newdatabaseGetColumnFields(tableCollectionName, tableCollectionUID, skipIfFGDisabled, skipIfDataExtraction)
	if err != nil {
		return DatabaseColumnFields{}, nil
	}

	if err := x.GetDatabaseColumnFields(metadatamodel); err != nil {
		return DatabaseColumnFields{}, nil
	}
	return x.DatabaseColumnFields(), nil
}

type databaseGetColumnFields struct {
	databaseColumnFields DatabaseColumnFields
	tableCollectionName  string
	tableCollectionUID   *string
	skipIfFgDisabled     bool
	skipIfDataExtraction bool
}

func (n *databaseGetColumnFields) DatabaseColumnFields() DatabaseColumnFields {
	return n.databaseColumnFields
}

func newdatabaseGetColumnFields(tableCollectionName string, tableCollectionUID string, skipIfFGDisabled bool, skipIfDataExtraction bool) (*databaseGetColumnFields, error) {
	n := new(databaseGetColumnFields)

	if len(tableCollectionName) == 0 {
		return nil, errors.New("tableCollectionName is empty")
	}
	n.skipIfFgDisabled = skipIfFGDisabled
	n.skipIfDataExtraction = skipIfDataExtraction

	if len(tableCollectionUID) > 0 {
		n.tableCollectionUID = new(string)
		*n.tableCollectionUID = tableCollectionUID
	}

	n.databaseColumnFields = DatabaseColumnFields{
		ColumnFieldsReadOrder: make([]string, 0),
		Fields:                make(map[string]any),
	}

	return n, nil
}

func (n *databaseGetColumnFields) GetDatabaseColumnFields(mmGroup any) error {
	mmGroupMap, err := GetFieldGroupMap(mmGroup)
	if err != nil {
		return err
	}

	mmGroupFields, err := GetGroupFields(mmGroupMap)
	if err != nil {
		return err
	}

	mmGroupReadOrderOfFields, err := GetGroupReadOrderOfFields(mmGroup)
	if err != nil {
		return err
	}

	for _, fgKeySuffix := range mmGroupReadOrderOfFields {
		fgKeySuffixString, err := GetValueAsString(fgKeySuffix)
		if err != nil {
			return err
		}

		fgMap, err := GetFieldGroupMap(mmGroupFields[fgKeySuffixString])
		if err != nil {
			return err
		}

		if n.skipIfDataExtraction {
			if value, ok := fgMap[FIELD_GROUP_PROP_DATABASE_SKIP_DATA_EXTRACTION].(bool); ok && value {
				continue
			}
		}

		if n.skipIfFgDisabled {
			if value, ok := fgMap[FIELD_GROUP_PROP_FIELD_GROUP_VIEW_DISABLE].(bool); ok && value {
				continue
			}
		}

		if fgTableCollectionName, ok := fgMap[FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_NAME].(string); ok && fgTableCollectionName == n.tableCollectionName {
			if n.tableCollectionUID != nil {
				if value, ok := fgMap[FIELD_GROUP_PROP_DATABASE_TABLE_COLLECTION_UID].(string); !ok || value != *n.tableCollectionUID {
					continue
				}
			}

			if _, err := GetGroupFields(fgMap); err == nil {
				if _, err := GetGroupReadOrderOfFields(fgMap); err == nil {
					n.GetDatabaseColumnFields(fgMap)
					continue
				}
			}

			if fieldColumnName, ok := fgMap[FIELD_GROUP_PROP_DATABASE_FIELD_COLUMN_NAME].(string); ok && len(fieldColumnName) > 0 {
				if _, ok := n.databaseColumnFields.Fields[fieldColumnName]; ok {
					return fmt.Errorf("duplciate fieldColumnName '%s' found", fieldColumnName)
				}

				var newField map[string]any = fgMap
				if value, err := deep.Copy(fgMap); err == nil {
					newField = value
				}

				n.databaseColumnFields.ColumnFieldsReadOrder = append(n.databaseColumnFields.ColumnFieldsReadOrder, fieldColumnName)
				n.databaseColumnFields.Fields[fieldColumnName] = newField
			} else {
				return errors.New("fieldColumnName is empty")
			}
		}
	}

	return nil
}
