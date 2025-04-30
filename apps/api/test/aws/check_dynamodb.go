package main

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/google/uuid"

	"go-auth/internal/aws"
)

func main() {
	client := aws.NewDynamoDBClient()
	tableName := "golang_api_sample_refresh_token"

	// 1. UUID生成
	refreshTokenID := uuid.New().String()
	userID := "1234"
	expiresAt := time.Now().Add(1 * time.Hour).Unix() // 1時間（TTL）

	// 2. PutItem（書き込み）
	_, err := client.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: &tableName,
		Item: map[string]types.AttributeValue{
			"refresh_token_id": &types.AttributeValueMemberS{Value: refreshTokenID},
			"user_id":          &types.AttributeValueMemberS{Value: userID},
			"expires_at":       &types.AttributeValueMemberN{Value: fmt.Sprintf("%d", expiresAt)},
		},
	})
	if err != nil {
		panic(fmt.Errorf("PutItem error: %w", err))
	}
	fmt.Println("✅ PutItem 成功:", refreshTokenID)

	// 3. GetItem（読み取り）
	output, err := client.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: &tableName,
		Key: map[string]types.AttributeValue{
			"refresh_token_id": &types.AttributeValueMemberS{Value: refreshTokenID},
		},
	})
	if err != nil {
		panic(fmt.Errorf("GetItem error: %w", err))
	}
	if output.Item == nil {
		fmt.Println("⚠️ GetItem 結果: 該当なし")
		return
	}

	// 4. 結果表示
	fmt.Println("✅ GetItem 成功:")
	for key, val := range output.Item {
		fmt.Printf("  %s: %v\n", key, val)
	}
}
