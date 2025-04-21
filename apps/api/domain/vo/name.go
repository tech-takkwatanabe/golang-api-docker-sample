package vo

import (
	"database/sql/driver"
	"errors"
	"strings"
)

const maxNameLength = 100

type Name struct {
	value string
}

func NewName(v string) (*Name, error) {
	v = strings.TrimSpace(v)
	if len(v) == 0 || len(v) > maxNameLength {
		return nil, errors.New("name must be between 1 and 100 characters")
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
func (n *Name) Scan(value interface{}) error {
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
