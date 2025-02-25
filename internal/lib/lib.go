package lib

import (
	"fmt"
	"reflect"
	"runtime"
)

func FunctionNameAndError(function any, err error) error {
	return fmt.Errorf("%v -> %v", runtime.FuncForPC(reflect.ValueOf(function).Pointer()).Name(), err)
}
