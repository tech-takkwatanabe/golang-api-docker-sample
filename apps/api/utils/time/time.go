package timeutil

import "time"

const Layout = "2006-01-02 15:04:05.000"

func Format(t time.Time) string {
	return t.Format(Layout)
}

func Parse(s string) (time.Time, error) {
	return time.Parse(Layout, s)
}
