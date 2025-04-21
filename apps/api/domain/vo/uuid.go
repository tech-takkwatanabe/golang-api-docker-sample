package vo

import (
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
