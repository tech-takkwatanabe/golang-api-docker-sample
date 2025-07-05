package dynamodb

import (
	"context"
	"errors"
	"fmt"
	"go-auth/config"
	"go-auth/domain/entity"
	"go-auth/domain/vo"
	awsclient "go-auth/external/aws"
	awsutil "go-auth/utils/aws"
	timeutil "go-auth/utils/time"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type RefreshTokenRepository struct {
	Client    *dynamodb.Client
	TableName string
}

func NewRefreshTokenRepository() *RefreshTokenRepository {
	client := awsclient.NewDynamoDBClient()
	tableName := config.DynamoDBRefreshTokenTableName
	if tableName == "" {
		panic("DYNAMODB_REFRESH_TOKEN_TABLE_NAME is not set")
	}
	return &RefreshTokenRepository{
		Client:    client,
		TableName: tableName,
	}
}

func (r *RefreshTokenRepository) Put(ctx context.Context, token *entity.RefreshToken) error {
	createdAtStr := timeutil.Format(token.CreatedAt)

	item := map[string]types.AttributeValue{
		"refresh_token_id": &types.AttributeValueMemberS{Value: token.RefreshTokenID.String()}, // user.uuid
		"user_id":          &types.AttributeValueMemberN{Value: fmt.Sprintf("%d", token.UserID)},
		"refresh_token":    &types.AttributeValueMemberS{Value: token.Token},
		"created_at":       &types.AttributeValueMemberS{Value: createdAtStr},
		"expires_at":       &types.AttributeValueMemberN{Value: fmt.Sprintf("%d", token.ExpiresAt)},
	}

	_, err := r.Client.PutItem(context.TODO(), &dynamodb.PutItemInput{
		TableName: aws.String(r.TableName),
		Item:      item,
	})
	return err
}

func (r *RefreshTokenRepository) Get(ctx context.Context, refreshTokenID *vo.UUID) (*entity.RefreshToken, error) {
	key := map[string]types.AttributeValue{
		"refresh_token_id": &types.AttributeValueMemberS{Value: refreshTokenID.String()},
	}

	resp, err := r.Client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: aws.String(r.TableName),
		Key:       key,
	})
	if err != nil {
		return nil, err
	}
	if resp.Item == nil {
		return nil, errors.New("refresh token not found")
	}

	userIDStr := awsutil.GetString(resp.Item["user_id"])
	userID, err := strconv.ParseUint(userIDStr, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid user_id format: %w", err)
	}

	expiresAt, err := strconv.ParseInt(awsutil.GetString(resp.Item["expires_at"]), 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid expires_at format: %w", err)
	}

	createdAt, err := timeutil.Parse(awsutil.GetString(resp.Item["created_at"]))
	if err != nil {
		return nil, fmt.Errorf("invalid created_at format: %w", err)
	}

	token := &entity.RefreshToken{
		RefreshTokenID: refreshTokenID,
		UserID:         uint(userID),
		Token:          awsutil.GetString(resp.Item["refresh_token"]),
		ExpiresAt:      expiresAt,
		CreatedAt:      createdAt,
	}
	return token, nil
}

func (r *RefreshTokenRepository) Delete(ctx context.Context, refreshTokenID *vo.UUID) error {
	key := map[string]types.AttributeValue{
		"refresh_token_id": &types.AttributeValueMemberS{Value: refreshTokenID.String()},
	}
	_, err := r.Client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: aws.String(r.TableName),
		Key:       key,
	})
	return err
}

func (r *RefreshTokenRepository) Rotate(ctx context.Context, oldRefreshTokenID *vo.UUID, newRefreshToken *entity.RefreshToken) error {
	// 新しいリフレッシュトークンをDynamoDBの属性値マップにマーシャリング
	av, err := attributevalue.MarshalMap(newRefreshToken)
	if err != nil {
		return fmt.Errorf("failed to marshal new refresh token: %w", err)
	}

	// 古いリフレッシュトークンのキーをマーシャリング
	oldKey, err := attributevalue.MarshalMap(map[string]string{
		"refresh_token_id": oldRefreshTokenID.String(),
	})
	if err != nil {
		return fmt.Errorf("failed to marshal old refresh token key: %w", err)
	}

	// トランザクションのアイテムを作成
	transactItems := []types.TransactWriteItem{
		// 1. 新しいトークンを保存 (Put)
		{
			Put: &types.Put{
				TableName: aws.String(r.TableName),
				Item:      av,
				// 念のため、同じIDのトークンが既に存在しないことを確認
				ConditionExpression: aws.String("attribute_not_exists(refresh_token_id)"),
			},
		},
		// 2. 古いトークンを削除 (Delete)
		{
			Delete: &types.Delete{
				TableName: aws.String(r.TableName),
				Key:       oldKey,
				// 削除対象のトークンが存在することを確認 (リプレイアタック対策)
				ConditionExpression: aws.String("attribute_exists(refresh_token_id)"),
			},
		},
	}

	// トランザクション書き込みを実行
	_, err = r.Client.TransactWriteItems(ctx, &dynamodb.TransactWriteItemsInput{
		TransactItems: transactItems,
	})

	if err != nil {
		// 条件チェック失敗 (ConditionalCheckFailed) はリプレイアタックの可能性を示唆
		var tce *types.TransactionCanceledException
		if errors.As(err, &tce) {
			return fmt.Errorf("token rotation failed due to a conditional check, possible replay attack: %w", err)
		}
		return fmt.Errorf("failed to execute transact write items for token rotation: %w", err)
	}

	return nil
}
