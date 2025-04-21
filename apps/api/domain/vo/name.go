package vo

import (
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
