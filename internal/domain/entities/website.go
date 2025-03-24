package entities

import (
	"errors"
	"fmt"

	intlibjson "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/json"
)

const (
	WEBSITE_HTMLTMPL_LIB_PAGES_ERROR string = "lib/pages/error"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_ID_PAGE string = "routes/[group_id]/abstractions/[id]/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_PAGE    string = "routes/[group_id]/abstractions/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_DIRECTORY_GROUPS_ID_PAGE string = "routes/[group_id]/abstractions/directory-groups/[id]/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_DIRECTORY_GROUPS_PAGE    string = "routes/[group_id]/abstractions/directory-groups/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_ID_PAGE string = "routes/[group_id]/metadata-models/[id]/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_PAGE    string = "routes/[group_id]/metadata-models/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_DIRECTORY_PAGE        string = "routes/[group_id]/metadata-models/directory/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_DIRECTORY_GROUPS_PAGE string = "routes/[group_id]/metadata-models/directory/groups/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_DRIVES_GROUPS_ID_PAGE string = "routes/[group_id]/storage/drives/groups/[id]/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_DRIVES_GROUPS_PAGE    string = "routes/[group_id]/storage/drives/groups/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_DRIVES_ID_PAGE string = "routes/[group_id]/storage/drives/[id]/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_DRIVES_PAGE    string = "routes/[group_id]/storage/drives/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_ID_PAGE string = "routes/[group_id]/storage/files/[id]/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_PAGE    string = "routes/[group_id]/storage/files/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_DIRECTORY_ID_PAGE string = "routes/[group_id]/directory/[id]/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_DIRECTORY_PAGE    string = "routes/[group_id]/directory/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_DIRECTORY_GROUPS_ID_PAGE string = "routes/[group_id]/directory/groups/[id]/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_DIRECTORY_GROUPS_PAGE    string = "routes/[group_id]/directory/groups/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_IAM_CREDENTIALS_PAGE string = "routes/[group_id]/iam/credentials/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_IAM_GROUP_AUTHORIZATIONS_PAGE string = "routes/[group_id]/iam/group-authorizations/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_GROUP_AUTHORIZATION_RULES_PAGE string = "routes/[group_id]/group/authorization-rules/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_GROUP_RULE_AUTHORIZATIONS_PAGE string = "routes/[group_id]/group/rule-authorizations/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_LAYOUT string = "routes/[group_id]/layout"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_PAGE   string = "routes/[group_id]/page"

	WEBSITE_HTMLTMPL_ROUTES_PAGE   string = "routes/page"
	WEBSITE_HTMLTMPL_ROUTES_LAYOUT string = "routes/layout"

	WEBSITE_HTMLTMPL_PRTL_ROUTES        string = "routes"
	WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID string = "routesGroupid"
	WEBSITE_HTMLTMPL_PRTL_ERROR         string = "error"
)

const (
	WEBSITE_PATH_KEY_CONTEXT       string = "Context"
	WEBSITE_PATH_KEY_ERROR         string = "Error"
	WEBSITE_PATH_KEY_ERROR_CODE    string = "Code"
	WEBSITE_PATH_KEY_ERROR_MESSAGE string = "Message"
	WEBSITE_PATH_KEY_DATA          string = "Data"
)

const (
	WEBSITE_PATH_ROUTES string = "$"

	WEBSITE_PATH_ROUTES_GROUPID                string = WEBSITE_PATH_ROUTES + "." + WEBSITE_PATH_KEY_CONTEXT
	WEBSITE_PATH_ROUTES_GROUPID_HOME           string = WEBSITE_PATH_ROUTES_GROUPID + "." + WEBSITE_PATH_KEY_CONTEXT
	WEBSITE_PATH_ROUTES_GROUPID_STORAGE_FILES  string = WEBSITE_PATH_ROUTES_GROUPID + "." + WEBSITE_PATH_KEY_CONTEXT
	WEBSITE_PATH_ROUTES_GROUPID_METADATAMODELS string = WEBSITE_PATH_ROUTES_GROUPID + "." + WEBSITE_PATH_KEY_CONTEXT
	WEBSITE_PATH_ROUTES_GROUPID_ABSTRACTIONS   string = WEBSITE_PATH_ROUTES_GROUPID + "." + WEBSITE_PATH_KEY_CONTEXT
)

func WebsiteAddErrorToHTMLTemplateContext(data any, partial bool, partialName string, code int, message string) (any, error) {
	dataToSet := map[string]any{
		WEBSITE_PATH_KEY_ERROR_CODE:    code,
		WEBSITE_PATH_KEY_ERROR_MESSAGE: message,
	}

	if partial {
		switch partialName {
		case WEBSITE_HTMLTMPL_PRTL_ROUTES:
			if d, err := intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", WEBSITE_PATH_ROUTES, WEBSITE_PATH_KEY_ERROR), dataToSet); err != nil {
				return nil, err
			} else {
				return d, nil
			}
		case WEBSITE_HTMLTMPL_PRTL_ROUTESGROUPID:
			if d, err := intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", WEBSITE_PATH_ROUTES_GROUPID, WEBSITE_PATH_KEY_ERROR), dataToSet); err != nil {
				return nil, err
			} else {
				return d, nil
			}
		default:
			return nil, errors.New("invalid inline section")
		}
	} else {
		if d, err := intlibjson.SetValueInObject(data, fmt.Sprintf("%s.%s", WEBSITE_PATH_ROUTES, WEBSITE_PATH_KEY_ERROR), dataToSet); err != nil {
			return nil, err
		} else {
			return d, nil
		}
	}
}
