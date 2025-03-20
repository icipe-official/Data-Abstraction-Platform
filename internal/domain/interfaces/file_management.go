package interfaces

import (
	"context"
	"io"
	"mime/multipart"
	"net/http"

	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
)

type FormFileUpload interface {
	FormFile(key string) (multipart.File, *multipart.FileHeader, error)
	FormValue(key string) string
}

type FileManagement interface {
	Create(ctx context.Context, storageFile *intdoment.StorageFiles, storageDrive *intdoment.StorageDrives, file io.Reader) error
	Delete(ctx context.Context, storageFile *intdoment.StorageFiles, storageDrive *intdoment.StorageDrives) error
	Download(ctx context.Context, storageFile *intdoment.StorageFiles, storageDrive *intdoment.StorageDrives, w http.ResponseWriter) error
}
