package helper

import (
	"fmt"
	"strings"

	"github.com/go-playground/validator/v10"
)

func ValidationMsg(err error) map[string]string {

	errors := make(map[string]string)

	if validationErrors, ok := err.(validator.ValidationErrors); ok {
		for _, e := range validationErrors {
			field := strings.ToLower(e.Field())

			switch e.Tag() {
			case "required":
				errors[field] = fmt.Sprintf("%s is required", field)
			case "email":
				errors[field] = fmt.Sprintf("%s must be a valid email", field)
			case "min":
				errors[field] = fmt.Sprintf("%s must be at least %s characters", field, e.Param())
			case "max":
				errors[field] = fmt.Sprintf("%s must be at most %s characters", field, e.Param())
			case "numeric":
				errors[field] = fmt.Sprintf("%s must be numeric", field)
			case "unique_username":
				errors[field] = fmt.Sprintf("%s already taken", field)
			default:
				errors[field] = fmt.Sprintf("%s is invalid", field)
			}
		}
	}

	return errors
}
