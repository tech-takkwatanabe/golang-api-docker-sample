package vo

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"strings"
)

const maxNameLength = 100
const minNameLength = 2

var ErrInvalidName = errors.New("invalid name")

// Name represents a user's name
// @swagger:model
// @property {string} value - ユーザー名（2-100文字）
type Name struct {
	value string
}

func (n Name) IsValid() bool {
	return len(n.value) >= minNameLength && len(n.value) <= maxNameLength
}

func NewName(v string) (*Name, error) {
	v = strings.TrimSpace(v)
	if len(v) < minNameLength || len(v) > maxNameLength {
		return nil, errors.New("name must be between 2 and 100 characters")
	}
	return &Name{value: v}, nil
}

func (n *Name) String() string {
	return n.value
}

// Value implements the driver.Valuer interface
func (n *Name) Value() (driver.Value, error) {
	if n == nil {
		return nil, nil
	}
	return n.value, nil
}

// Scan implements the sql.Scanner interface
func (n *Name) Scan(value any) error {
	if value == nil {
		n.value = ""
		return nil
	}
	if v, ok := value.(string); ok {
		n.value = v
		return nil
	}
	if v, ok := value.([]byte); ok {
		n.value = string(v)
		return nil
	}
	return errors.New("invalid Name type")
}

// MarshalJSON implements the json.Marshaler interface
func (n *Name) MarshalJSON() ([]byte, error) {
	return json.Marshal(n.value)
}
