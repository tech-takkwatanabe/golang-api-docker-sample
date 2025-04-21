package vo

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// DateTime represents a date and time value
// @swagger:model
// @property {string} value - RFC3339形式の日時文字列
type DateTime struct {
	value time.Time
}

func NewDateTime(t time.Time) *DateTime {
	return &DateTime{value: t}
}

func (d *DateTime) Time() time.Time {
	return d.value
}

func (d *DateTime) String() string {
	return d.value.Format(time.RFC3339Nano)
}

// Value implements the driver.Valuer interface
func (d *DateTime) Value() (driver.Value, error) {
	if d == nil {
		return nil, nil
	}
	return d.value, nil
}

// Scan implements the sql.Scanner interface
func (d *DateTime) Scan(value interface{}) error {
	if value == nil {
		d.value = time.Time{}
		return nil
	}
	if v, ok := value.(time.Time); ok {
		d.value = v
		return nil
	}
	return errors.New("invalid DateTime type")
}

// MarshalJSON implements the json.Marshaler interface
func (d *DateTime) MarshalJSON() ([]byte, error) {
	return json.Marshal(d.value.Format(time.RFC3339Nano))
}
