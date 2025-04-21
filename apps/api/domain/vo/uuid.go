package vo

import (
	"database/sql/driver"
	"encoding/json"
	"errors"

	"github.com/google/uuid"
)

type UUID struct {
	value string
}

func NewUUID(v string) (*UUID, error) {
	_, err := uuid.Parse(v)
	if err != nil {
		return nil, errors.New("invalid UUID format")
	}
	return &UUID{value: v}, nil
}

func NewUUIDv7() *UUID {
	v7 := uuid.Must(uuid.NewV7())
	return &UUID{value: v7.String()}
}

func (u *UUID) String() string {
	return u.value
}

// Value implements the driver.Valuer interface
func (u *UUID) Value() (driver.Value, error) {
	if u == nil {
		return nil, nil
	}
	return u.value, nil
}

// Scan implements the sql.Scanner interface
func (u *UUID) Scan(value interface{}) error {
	if value == nil {
		u.value = ""
		return nil
	}
	if v, ok := value.(string); ok {
		u.value = v
		return nil
	}
	if v, ok := value.([]byte); ok {
		u.value = string(v)
		return nil
	}
	return errors.New("invalid UUID type")
}

// MarshalJSON implements the json.Marshaler interface
func (u *UUID) MarshalJSON() ([]byte, error) {
	return json.Marshal(u.value)
}
