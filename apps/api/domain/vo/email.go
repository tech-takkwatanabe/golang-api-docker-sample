package vo

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"net/mail"
	"strings"
)

const maxEmailLength = 320

var ErrInvalidEmail = errors.New("invalid email")

// Email represents an email address
// @swagger:model
// @property {string} value - メールアドレス（320文字以内）
type Email struct {
	value string
}

func NewEmail(v string) (*Email, error) {
	v = strings.TrimSpace(strings.ToLower(v))
	if len(v) == 0 || len(v) > maxEmailLength {
		return nil, errors.New("email must be between 1 and 320 characters")
	}
	_, err := mail.ParseAddress(v)
	if err != nil {
		return nil, errors.New("invalid email format")
	}
	return &Email{value: v}, nil
}

func (e *Email) String() string {
	return e.value
}

// Value implements the driver.Valuer interface
func (e *Email) Value() (driver.Value, error) {
	if e == nil {
		return nil, nil
	}
	return e.value, nil
}

// Scan implements the sql.Scanner interface
func (e *Email) Scan(value any) error {
	if value == nil {
		e.value = ""
		return nil
	}
	if v, ok := value.(string); ok {
		e.value = v
		return nil
	}
	if v, ok := value.([]byte); ok {
		e.value = string(v)
		return nil
	}
	return errors.New("invalid Email type")
}

// MarshalJSON implements the json.Marshaler interface
func (e *Email) MarshalJSON() ([]byte, error) {
	return json.Marshal(e.value)
}

func (e Email) IsValid() bool {
	if len(e.value) == 0 || len(e.value) > maxEmailLength {
		return false
	}
	_, err := mail.ParseAddress(e.value)
	return err == nil
}
