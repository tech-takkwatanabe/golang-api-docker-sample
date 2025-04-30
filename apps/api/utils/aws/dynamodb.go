package awsutil

import "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"

func GetString(attr types.AttributeValue) string {
	if s, ok := attr.(*types.AttributeValueMemberS); ok {
		return s.Value
	}
	if n, ok := attr.(*types.AttributeValueMemberN); ok {
		return n.Value
	}
	return ""
}
