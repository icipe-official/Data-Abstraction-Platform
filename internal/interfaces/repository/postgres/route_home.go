package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"slices"
	"strings"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
	intlibmmodel "github.com/icipe-official/Data-Abstraction-Platform/internal/lib/metadata_model"
)

func (n *PostrgresRepository) RepoIamCredentialsInsertOpenIDUserInfo(ctx context.Context, openIDUserInfo *intdoment.OpenIDUserInfo, columns []string) (*intdoment.IamCredentials, error) {
	iamCredentialsMModel, err := intlib.MetadataModelGetDatum(intdoment.IamCredentialsRepository().RepositoryName)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, err)
	}

	if len(columns) == 0 {
		if dbColumnFields, err := intlibmmodel.DatabaseGetColumnFields(iamCredentialsMModel, intdoment.IamCredentialsRepository().RepositoryName, intdoment.IamCredentialsRepository().RepositoryName, false, false); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, err)
		} else {
			columns = dbColumnFields.ColumnFieldsReadOrder
		}
	}

	if !slices.Contains(columns, intdoment.IamCredentialsRepository().ID) {
		columns = append(columns, intdoment.IamCredentialsRepository().ID)
	}

	columnsToInsert := make([]string, 0)
	valuesToInsert := make([]any, 0)

	if openIDUserInfo.IsSubValid() {
		columnsToInsert = append(columnsToInsert, intdoment.IamCredentialsRepository().OpenidSub)
		valuesToInsert = append(valuesToInsert, openIDUserInfo.Sub)
	} else {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, errors.New("openIDUserInfo.Sub is empty"))
	}

	if openIDUserInfo.IsPreferredUsernameValid() {
		columnsToInsert = append(columnsToInsert, intdoment.IamCredentialsRepository().OpenidPreferredUsername)
		valuesToInsert = append(valuesToInsert, openIDUserInfo.PreferredUsername)
	} else {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, errors.New("openIDUserInfo.PreferredUsername is empty"))
	}

	if openIDUserInfo.IsEmailValid() {
		columnsToInsert = append(columnsToInsert, intdoment.IamCredentialsRepository().OpenidEmail)
		valuesToInsert = append(valuesToInsert, openIDUserInfo.Email)
	} else {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, errors.New("openIDUserInfo.Email is empty"))
	}

	columnsToInsert = append(columnsToInsert, intdoment.IamCredentialsRepository().OpenidEmailVerified)
	valuesToInsert = append(valuesToInsert, openIDUserInfo.EmailVerified)

	if openIDUserInfo.IsGivenNameValid() {
		columnsToInsert = append(columnsToInsert, intdoment.IamCredentialsRepository().OpenidGivenName)
		valuesToInsert = append(valuesToInsert, openIDUserInfo.GivenName)
	}

	if openIDUserInfo.IsFamilyNameValid() {
		columnsToInsert = append(columnsToInsert, intdoment.IamCredentialsRepository().OpenidFamilyName)
		valuesToInsert = append(valuesToInsert, openIDUserInfo.FamilyName)
	}

	query := fmt.Sprintf(
		"INSERT INTO %[1]s (%[2]s) VALUES (%[3]s) RETURNING %[4]s;",
		intdoment.IamCredentialsRepository().RepositoryName,          //1
		strings.Join(columnsToInsert, " , "),                         //2
		GetQueryPlaceholderString(len(valuesToInsert), &[]int{1}[0]), //3
		intdoment.IamCredentialsRepository().ID,                      //4
	)
	n.logger.Log(ctx, slog.LevelDebug, query, "function", intlib.FunctionName(n.RepoIamCredentialsInsertOpenIDUserInfo))

	rows, err := n.db.Query(ctx, query, valuesToInsert...)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, fmt.Errorf("insert %s failed, err: %v", intdoment.IamCredentialsRepository().RepositoryName, err))
	}
	defer rows.Close()
	dataRows := make([]any, 0)
	for rows.Next() {
		if r, err := rows.Values(); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, err)
		} else {
			dataRows = append(dataRows, r)
		}
	}

	array2DToObject, err := intlibmmodel.NewConvert2DArrayToObjects(iamCredentialsMModel, nil, false, false, columns)
	if err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, err)
	}
	if err := array2DToObject.Convert(dataRows); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, err)
	}

	if len(array2DToObject.Objects()) == 0 {
		n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("length of array2DToObject.Objects(): %v", len(array2DToObject.Objects())), "function", intlib.FunctionName(n.RepoIamCredentialsInsertOpenIDUserInfo))
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, errors.New("convert inserted rows return empty"))
	}

	iamCredential := new(intdoment.IamCredentials)
	if jsonData, err := json.Marshal(array2DToObject.Objects()[0]); err != nil {
		return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, err)
	} else {
		n.logger.Log(ctx, slog.LevelDebug, "json parsing iamCredential", "iamCredential", string(jsonData), "function", intlib.FunctionName(n.RepoIamCredentialsInsertOpenIDUserInfo))
		if err := json.Unmarshal(jsonData, iamCredential); err != nil {
			return nil, intlib.FunctionNameAndError(n.RepoIamCredentialsInsertOpenIDUserInfo, err)
		}
	}

	return iamCredential, nil
}
