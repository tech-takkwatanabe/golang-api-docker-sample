package config

import (
	"log"
	"os"
	"strconv"
)

var (
	AccessTokenExpireSeconds         int
	RefreshTokenExpireSeconds        int
	AccessTokenCookieName            string
	RefreshTokenCookieName           string
	AuthCheckCookieName              string
	RefreshTokenExistCheckCookieName string
	JwtSecret                        string
	FrontendURL                      string
	AwsAccessKeyID                   string
	AwsSecretAccessKey               string
	AwsRegion                        string
	DynamoDBRefreshTokenTableName    string
	DBName                           string
	DBUser                           string
	DBPassword                       string
	DBHost                           string
	DBPort                           string
)

func LoadConfig() {
	var err error
	AccessTokenExpireSeconds, err = strconv.Atoi(os.Getenv("ACCESS_TOKEN_EXPIRE_SECONDS"))
	if err != nil {
		AccessTokenExpireSeconds = 3600 * 24
	}

	RefreshTokenExpireSeconds, err = strconv.Atoi(os.Getenv("REFRESH_TOKEN_EXPIRE_SECONDS"))
	if err != nil {
		RefreshTokenExpireSeconds = 3600 * 24 * 7
	}

	AccessTokenCookieName = os.Getenv("ACCESS_TOKEN_COOKIE_NAME")
	if AccessTokenCookieName == "" {
		AccessTokenCookieName = "accessTokenFromGoBackend"
	}

	RefreshTokenCookieName = os.Getenv("REFRESH_TOKEN_COOKIE_NAME")
	if RefreshTokenCookieName == "" {
		RefreshTokenCookieName = "refreshTokenFromGoBackend"
	}

	AuthCheckCookieName = os.Getenv("AUTH_CHECK_COOKIE_NAME")
	if AuthCheckCookieName == "" {
		AuthCheckCookieName = "isAuthenticatedByGoBackend"
	}

	RefreshTokenExistCheckCookieName = os.Getenv("REFRESH_TOKEN_EXIST_CHECK_COOKIE_NAME")
	if RefreshTokenExistCheckCookieName == "" {
		RefreshTokenExistCheckCookieName = "refreshTokenByGoBackendExists"
	}

	JwtSecret = os.Getenv("JWT_SECRET")
	if JwtSecret == "" {
		JwtSecret = "jwtSecret"
		log.Println("Warning: JWT_SECRET is not set, using default value.")
	}

	FrontendURL = os.Getenv("FRONTEND_URL")
	if FrontendURL == "" {
		FrontendURL = "http://localhost:3000"
		log.Println("Warning: FRONTEND_URL is not set, using default value http://localhost:3000.")
	}

	AwsAccessKeyID = os.Getenv("AWS_ACCESS_KEY_ID")
	if AwsAccessKeyID == "" {
		log.Println("Warning: AWS_ACCESS_KEY_ID is not set, AWS services may not work properly.")
	}
	AwsSecretAccessKey = os.Getenv("AWS_SECRET_ACCESS_KEY")
	if AwsSecretAccessKey == "" {
		log.Println("Warning: AWS_SECRET_ACCESS_KEY is not set, AWS services may not work properly.")
	}
	AwsRegion = os.Getenv("AWS_REGION")
	if AwsRegion == "" {
		log.Println("Warning: AWS_REGION is not set, AWS services may not work properly.")
	}

	DynamoDBRefreshTokenTableName = os.Getenv("DYNAMODB_REFRESH_TOKEN_TABLE_NAME")
	if DynamoDBRefreshTokenTableName == "" {
		log.Println("Warning: DYNAMODB_REFRESH_TOKEN_TABLE_NAME is not set, DynamoDB operations may not work properly.")
	}

	DBName = os.Getenv("DB_NAME")
	if DBName == "" {
		log.Println("Warning: DB_NAME is not set, using default value 'go_auth'.")
		DBName = "go_auth"
	}
	DBUser = os.Getenv("DB_USER")
	if DBUser == "" {
		log.Println("Warning: DB_USER is not set, using default value 'root'.")
		DBUser = "root"
	}
	DBPassword = os.Getenv("DB_PASSWORD")
	if DBPassword == "" {
		log.Println("Warning: DB_PASSWORD is not set, using default value 'password'.")
		DBPassword = "password"
	}
	DBHost = os.Getenv("DB_HOST")
	if DBHost == "" {
		log.Println("Warning: DB_HOST is not set, using default value 'localhost'.")
		DBHost = "localhost"
	}
	DBPort = os.Getenv("DB_PORT")
	if DBPort == "" {
		log.Println("Warning: DB_PORT is not set, using default value '3306'.")
		DBPort = "3306"
	}
}
