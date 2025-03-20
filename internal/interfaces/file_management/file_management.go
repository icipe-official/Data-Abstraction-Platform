package filemanagement

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"strings"

	"github.com/gofrs/uuid/v5"
	intdoment "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/entities"
	intdomint "github.com/icipe-official/Data-Abstraction-Platform/internal/domain/interfaces"
	intlib "github.com/icipe-official/Data-Abstraction-Platform/internal/lib"
)

const (
	CHUNK_SIZE = 512 * 1024
)

func (n *FileManagement) Download(ctx context.Context, storageFile *intdoment.StorageFiles, storageDrive *intdoment.StorageDrives, w http.ResponseWriter) error {
	if len(storageDrive.StorageDrivesTypesID) < 1 {
		return intlib.FunctionNameAndError(n.Create, errors.New("storageDrive.StorageDriveTypesID is empty"))
	}
	if len(storageFile.ID) < 1 {
		return intlib.FunctionNameAndError(n.Create, errors.New("storageFile.ID is empty"))
	}
	if len(storageFile.DirectoryGroupsID) < 1 {
		return intlib.FunctionNameAndError(n.Create, errors.New("storageFile.DirectoryGroupsID is empty"))
	}

	if len(storageFile.StorageFileMimeType[0]) < 1 {
		return intlib.FunctionNameAndError(n.Create, errors.New("storageFile.StorageFileMimeType is empty"))
	}

	var file *os.File
	switch storageDrive.StorageDrivesTypesID[0] {
	case intdoment.STORAGE_DRIVE_TYPE_LOCAL:
		if len(storageDrive.Data) > 0 {
			if dataMap, ok := storageDrive.Data[0].(map[string]any); ok {
				if pathArray, ok := dataMap[intdoment.LocalStorageDrive().Path].([]any); ok && len(pathArray) > 0 {
					if filePath, ok := pathArray[0].(string); ok && len(filePath) > 0 {
						filePath = appendDirectoryGroupIDToFolderPath(filePath, storageFile.DirectoryGroupsID[0]) + "/" + storageFile.ID[0].String()
						if value, err := os.Open(filePath); err != nil {
							n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("open file failed, err: %v", err), "storageFile", intlib.JsonStringifyMust(storageFile), "storageDrive", intlib.JsonStringifyMust(storageDrive))
							return intlib.FunctionNameAndError(n.Download, fmt.Errorf("open file failed, err: %v", err))
						} else {
							file = value
						}
					} else {
						return intlib.FunctionNameAndError(n.Download, fmt.Errorf("%s %s %s is not valid", intdoment.STORAGE_DRIVE_TYPE_LOCAL, intdoment.StorageDrivesRepository().StorageDrivesTypesID, intdoment.LocalStorageDrive().Path))
					}
				} else {
					return intlib.FunctionNameAndError(n.Download, fmt.Errorf("%s %s %s is not valid", intdoment.STORAGE_DRIVE_TYPE_LOCAL, intdoment.StorageDrivesRepository().StorageDrivesTypesID, intdoment.LocalStorageDrive().Path))
				}
			} else {
				return intlib.FunctionNameAndError(n.Download, errors.New("storageDrive.Data is not map[string]any"))
			}
		} else {
			return intlib.FunctionNameAndError(n.Download, errors.New("storageDrive.Data is empty"))
		}
	default:
		return intlib.FunctionNameAndError(n.Download, fmt.Errorf("%s %s not implemented", intdoment.StorageDrivesRepository().StorageDrivesTypesID, storageDrive.StorageDrivesTypesID[0]))
	}

	if file == nil {
		return intlib.FunctionNameAndError(n.Download, errors.New("file not found"))
	}

	fileBuffer := make([]byte, CHUNK_SIZE)
	w.Header().Set("Content-Type", storageFile.StorageFileMimeType[0])
	w.Header().Set("Cache-Control", "private, max-age=0")
	w.WriteHeader(http.StatusOK)

	n.logger.Log(ctx, slog.LevelDebug, "sending file...", "storageFile", intlib.JsonStringifyMust(storageFile), "storageDrive", intlib.JsonStringifyMust(storageDrive), "file", intlib.JsonStringifyMust(file), "file", intlib.JsonStringifyMust(file))
	for i := 0; ; i++ {
		if noOfBytes, err := file.Read(fileBuffer); err != nil {
			if err != io.EOF {
				n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("read file in chunks failed, error: %v", err), "storageFile", intlib.JsonStringifyMust(storageFile), "storageDrive", intlib.JsonStringifyMust(storageDrive), "file", intlib.JsonStringifyMust(file))
			}
			break
		} else {
			n.logger.Log(ctx, slog.LevelDebug, fmt.Sprintf("%v: reading %v bytes from file", i+1, noOfBytes), "storageFile", intlib.JsonStringifyMust(storageFile), "storageDrive", intlib.JsonStringifyMust(storageDrive), "file", intlib.JsonStringifyMust(file))
			w.Write(fileBuffer[:noOfBytes])
			if flusher, ok := w.(http.Flusher); ok {
				flusher.Flush()
			} else {
				n.logger.Log(ctx, slog.LevelError, "read file in chunks failed, error: could not create flusher", "storageFile", intlib.JsonStringifyMust(storageFile), "storageDrive", intlib.JsonStringifyMust(storageDrive), "file", intlib.JsonStringifyMust(file))
			}
		}
	}
	n.logger.Log(ctx, slog.LevelDebug, "...sending file complete", "storageFile", intlib.JsonStringifyMust(storageFile), "storageDrive", intlib.JsonStringifyMust(storageDrive), "file", intlib.JsonStringifyMust(file))

	return nil
}

func appendDirectoryGroupIDToFolderPath(path string, directoryGroupID uuid.UUID) string {
	if strings.HasSuffix(path, "/") {
		return path + directoryGroupID.String()
	} else {
		return path + "/" + directoryGroupID.String()
	}
}

func (n *FileManagement) Create(ctx context.Context, storageFile *intdoment.StorageFiles, storageDrive *intdoment.StorageDrives, file io.Reader) error {
	if len(storageDrive.StorageDrivesTypesID) < 1 {
		return intlib.FunctionNameAndError(n.Create, errors.New("storageDrive.StorageDriveTypesID is empty"))
	}
	if len(storageFile.ID) < 1 {
		return intlib.FunctionNameAndError(n.Create, errors.New("storageFile.ID is empty"))
	}
	if len(storageFile.DirectoryGroupsID) < 1 {
		return intlib.FunctionNameAndError(n.Create, errors.New("storageFile.DirectoryGroupsID is empty"))
	}

	switch storageDrive.StorageDrivesTypesID[0] {
	case intdoment.STORAGE_DRIVE_TYPE_LOCAL:
		if len(storageDrive.Data) > 0 {
			if dataMap, ok := storageDrive.Data[0].(map[string]any); ok {
				if pathArray, ok := dataMap[intdoment.LocalStorageDrive().Path].([]any); ok && len(pathArray) > 0 {
					if folderPath, ok := pathArray[0].(string); ok && len(folderPath) > 0 {
						folderPath = appendDirectoryGroupIDToFolderPath(folderPath, storageFile.DirectoryGroupsID[0])
						if _, err := os.Stat(folderPath); os.IsNotExist(err) {
							if err := os.Mkdir(folderPath, os.ModeDir|0755); err != nil {
								n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("create directory group folder failed, err: %v", err), "storageFile", intlib.JsonStringifyMust(storageFile), "storageDrive", intlib.JsonStringifyMust(storageDrive))
								return intlib.FunctionNameAndError(n.Create, fmt.Errorf("create directory group folder failed, err: %v", err))
							}
						}

						out, err := os.Create(folderPath + "/" + storageFile.ID[0].String())
						if err != nil {
							n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("create file failed, err: %v", err), "storageFile", intlib.JsonStringifyMust(storageFile), "storageDrive", intlib.JsonStringifyMust(storageDrive))
							return intlib.FunctionNameAndError(n.Create, fmt.Errorf("create file failed, err: %v", err))
						}
						defer out.Close()

						if _, err := io.Copy(out, file); err != nil {
							n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("write to file failed, err: %v", err), "storageFile", intlib.JsonStringifyMust(storageFile), "storageDrive", intlib.JsonStringifyMust(storageDrive))
							return intlib.FunctionNameAndError(n.Create, fmt.Errorf("write to file failed, err: %v", err))
						}
					} else {
						return intlib.FunctionNameAndError(n.Create, fmt.Errorf("%s %s %s is not valid", intdoment.STORAGE_DRIVE_TYPE_LOCAL, intdoment.StorageDrivesRepository().StorageDrivesTypesID, intdoment.LocalStorageDrive().Path))
					}
				} else {
					return intlib.FunctionNameAndError(n.Create, fmt.Errorf("%s %s %s is not valid", intdoment.STORAGE_DRIVE_TYPE_LOCAL, intdoment.StorageDrivesRepository().StorageDrivesTypesID, intdoment.LocalStorageDrive().Path))
				}
			} else {
				return intlib.FunctionNameAndError(n.Create, errors.New("storageDrive.Data is not map[string]any"))
			}
		} else {
			return intlib.FunctionNameAndError(n.Create, errors.New("storageDrive.Data is empty"))
		}
	default:
		return intlib.FunctionNameAndError(n.Create, fmt.Errorf("%s %s not implemented", intdoment.StorageDrivesRepository().StorageDrivesTypesID, storageDrive.StorageDrivesTypesID[0]))
	}

	return nil
}

func (n *FileManagement) Delete(ctx context.Context, storageFile *intdoment.StorageFiles, storageDrive *intdoment.StorageDrives) error {
	if len(storageDrive.StorageDrivesTypesID) < 1 {
		return intlib.FunctionNameAndError(n.Create, errors.New("storageDrive.StorageDriveTypesID is empty"))
	}
	if len(storageFile.ID) < 1 {
		return intlib.FunctionNameAndError(n.Create, errors.New("storageFile.ID is empty"))
	}
	if len(storageFile.DirectoryGroupsID) < 1 {
		return intlib.FunctionNameAndError(n.Create, errors.New("storageFile.DirectoryGroupsID is empty"))
	}

	if len(storageFile.StorageFileMimeType[0]) < 1 {
		return intlib.FunctionNameAndError(n.Create, errors.New("storageFile.StorageFileMimeType is empty"))
	}

	switch storageDrive.StorageDrivesTypesID[0] {
	case intdoment.STORAGE_DRIVE_TYPE_LOCAL:
		if len(storageDrive.Data) > 0 {
			if dataMap, ok := storageDrive.Data[0].(map[string]any); ok {
				if pathArray, ok := dataMap[intdoment.LocalStorageDrive().Path].([]any); ok && len(pathArray) > 0 {
					if filePath, ok := pathArray[0].(string); ok && len(filePath) > 0 {
						if err := os.Remove(appendDirectoryGroupIDToFolderPath(filePath, storageFile.DirectoryGroupsID[0]) + "/" + storageFile.ID[0].String()); err != nil {
							n.logger.Log(ctx, slog.LevelError, fmt.Sprintf("delete file failed, err: %v", err), "storageFile", intlib.JsonStringifyMust(storageFile), "storageDrive", intlib.JsonStringifyMust(storageDrive))
							return intlib.FunctionNameAndError(n.Download, fmt.Errorf("open file failed, err: %v", err))
						}
					} else {
						return intlib.FunctionNameAndError(n.Download, fmt.Errorf("%s %s %s is not valid", intdoment.STORAGE_DRIVE_TYPE_LOCAL, intdoment.StorageDrivesRepository().StorageDrivesTypesID, intdoment.LocalStorageDrive().Path))
					}
				} else {
					return intlib.FunctionNameAndError(n.Download, fmt.Errorf("%s %s %s is not valid", intdoment.STORAGE_DRIVE_TYPE_LOCAL, intdoment.StorageDrivesRepository().StorageDrivesTypesID, intdoment.LocalStorageDrive().Path))
				}
			} else {
				return intlib.FunctionNameAndError(n.Download, errors.New("storageDrive.Data is not map[string]any"))
			}
		} else {
			return intlib.FunctionNameAndError(n.Download, errors.New("storageDrive.Data is empty"))
		}
	default:
		return intlib.FunctionNameAndError(n.Download, fmt.Errorf("%s %s not implemented", intdoment.StorageDrivesRepository().StorageDrivesTypesID, storageDrive.StorageDrivesTypesID[0]))
	}

	return nil
}

func NewFileManagement(logger intdomint.Logger) *FileManagement {
	n := new(FileManagement)
	n.logger = logger
	return n
}

type FileManagement struct {
	logger intdomint.Logger
}
