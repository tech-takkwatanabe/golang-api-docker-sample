package aws

import (
	"context"
	"go-auth/config"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	sdkConfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/joho/godotenv"
)

func NewDynamoDBClient() *dynamodb.Client {
	_ = godotenv.Load()

	accessKey := config.AwsAccessKeyID
	secretKey := config.AwsSecretAccessKey
	region := config.AwsRegion

	var cfg aws.Config
	var err error

	if accessKey != "" && secretKey != "" && region != "" {
		creds := aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider(accessKey, secretKey, ""))
		cfg, err = sdkConfig.LoadDefaultConfig(context.TODO(),
			sdkConfig.WithRegion(region),
			sdkConfig.WithCredentialsProvider(creds),
		)
		if err != nil {
			log.Fatalf("failed to load SDK config from env vars: %v", err)
		}
	} else {
		cfg, err = sdkConfig.LoadDefaultConfig(context.TODO())
		if err != nil {
			log.Fatalf("failed to load SDK default config: %v", err)
		}
	}

	return dynamodb.NewFromConfig(cfg)
}
