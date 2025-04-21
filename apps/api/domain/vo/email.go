package vo

import (
	"errors"
	"net/mail"
	"strings"
)

const maxEmailLength = 320

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
