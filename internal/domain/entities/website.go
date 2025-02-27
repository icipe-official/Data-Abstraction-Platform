package entities

const (
	WEBSITE_HTMLTMPL_LIB_PAGES_ERROR string = "lib/pages/error"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_ID_PAGE string = "routes/[group_id]/abstractions/[id]/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_ABSTRACTIONS_PAGE    string = "routes/[group_id]/abstractions/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_ID_PAGE string = "routes/[group_id]/metadata-models/[id]/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_METADATAMODELS_PAGE    string = "routes/[group_id]/metadata-models/page"

	WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_ID_PAGE string = "routes/[group_id]/storage/files/[id]/page"
	WEBSITE_HTMLTMPL_ROUTES_GROUPID_STORAGE_FILES_PAGE    string = "routes/[group_id]/storage/files/page"

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
	WEBSITE_PATH_ROUTES                        string = "$"
	WEBSITE_PATH_ROUTES_GROUPID                string = WEBSITE_PATH_ROUTES + "." + WEBSITE_PATH_KEY_CONTEXT
	WEBSITE_PATH_ROUTES_GROUPID_STORAGE_FILES  string = WEBSITE_PATH_ROUTES_GROUPID + "." + WEBSITE_PATH_KEY_CONTEXT
	WEBSITE_PATH_ROUTES_GROUPID_METADATAMODELS string = WEBSITE_PATH_ROUTES_GROUPID + "." + WEBSITE_PATH_KEY_CONTEXT
	WEBSITE_PATH_ROUTES_GROUPID_ABSTRACTIONS   string = WEBSITE_PATH_ROUTES_GROUPID + "." + WEBSITE_PATH_KEY_CONTEXT
)
