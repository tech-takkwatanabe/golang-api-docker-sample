package vo

import (
	"time"
)

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
