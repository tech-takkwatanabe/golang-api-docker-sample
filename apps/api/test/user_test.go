package test

import (
	"testing"
)

func TestDBConnection(t *testing.T) {
	db, err := setupTestDB()
	if err != nil {
		t.Fatalf("Failed to connect to test DB: %v", err)
	}

	// 接続確認
	if db == nil {
		t.Fatal("Database connection is nil")
	}
}
