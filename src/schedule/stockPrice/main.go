package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
	"github.com/google/uuid"
)

type Event struct {
	Name string `json:"name"`
}

func getSession() *session.Session {
	return session.Must(session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region:     aws.String(os.Getenv("REGION")),
			MaxRetries: aws.Int(2),
			HTTPClient: &http.Client{
				// The maximum amount of time the SDK will wait for a response from a service
				Timeout: time.Duration(2 * time.Second),
			},
			LogLevel: aws.LogLevel(aws.LogDebugWithRequestErrors | aws.LogDebugWithRequestRetries),
		},
	}))
}

func GetQueueURL(sess *session.Session, queueName string) (*sqs.GetQueueUrlOutput, error) {
	sqsClient := sqs.New(sess)

	return sqsClient.GetQueueUrl(&sqs.GetQueueUrlInput{
		QueueName: &queueName,
	})
}

func SendMessage(sess *session.Session, queueUrl string, messageBody string) error {
	sqsClient := sqs.New(sess)

	_, err := sqsClient.SendMessage(&sqs.SendMessageInput{
		QueueUrl:    &queueUrl,
		MessageBody: aws.String(messageBody),
	})

	return err
}

func SendMessageFifo(sess *session.Session, queueUrl string, messageGroupId string, messageBody string) (*sqs.SendMessageOutput, error) {
	sqsClient := sqs.New(sess)

	return sqsClient.SendMessage(&sqs.SendMessageInput{
		QueueUrl:               &queueUrl,
		MessageBody:            aws.String(messageBody),
		MessageGroupId:         aws.String(messageGroupId),
		MessageDeduplicationId: aws.String(uuid.Must(uuid.NewRandom()).String()),
	})
}

// func SendMessage(queueName string, messageBody string) error {
// 	sess, err := session.NewSessionWithOptions(session.Options{
// 		Config: aws.Config{
// 			Region: aws.String(os.Getenv("REGION")),
// 		},
// 	})
// if err != nil {
// 	fmt.Printf("Failed to initialize new session: %v", err)
// 	return err
// }
// 	sqsClient := sqs.New(sess)
// 	result, err := sqsClient.GetQueueUrl(&sqs.GetQueueUrlInput{
// 		QueueName: &queueName,
// 	})
// 	if err != nil {
// 		fmt.Printf("Got an error while trying to Get Queue Url: %v", err)
// 		return err
// 	}
// 	success, err := sqsClient.SendMessage(&sqs.SendMessageInput{
// 		QueueUrl:               result.QueueUrl,
// 		MessageBody:            aws.String(messageBody),
// MessageGroupId:         aws.String("stockPrice"),
// MessageDeduplicationId: aws.String(uuid.Must(uuid.NewRandom()).String()),
// 	})
// 	if err != nil {
// 		fmt.Printf("Got an error while trying to send message to queue: %v", err)
// 		return err
// 	}

// 	fmt.Printf("Send message to queue: %v", success)

// 	return err
// }

func HandleRequest(ctx context.Context, event Event) (bool, error) {
	sess := session.Must(session.NewSessionWithOptions(session.Options{
		Config: aws.Config{
			Region:     aws.String(os.Getenv("REGION")),
			MaxRetries: aws.Int(2),
			HTTPClient: &http.Client{
				// The maximum amount of time the SDK will wait for a response from a service
				Timeout: time.Duration(2 * time.Second),
			},
			LogLevel: aws.LogLevel(aws.LogDebugWithRequestErrors | aws.LogDebugWithRequestRetries),
		},
	}))
	queueName := os.Getenv("STOCK_CRAWLER_QUEUE_NAME")
	sqsClient := sqs.New(sess)

	getQueueUrlOutput, err := sqsClient.GetQueueUrl(&sqs.GetQueueUrlInput{
		QueueName: &queueName,
	})
	if err != nil {
		fmt.Printf("Got an error while trying to Get Queue Url: %v", err)
		return false, err
	}

	codeArr := [2]string{"HPG", "TDM"}
	messageGroupId := "PriceStock"
	for i, code := range codeArr {
		fmt.Println("Send Message", i, code)
		sendMessageOutput, err :=
			sqsClient.SendMessage(&sqs.SendMessageInput{
				QueueUrl:               getQueueUrlOutput.QueueUrl,
				MessageBody:            aws.String(code),
				MessageGroupId:         aws.String(messageGroupId),
				MessageDeduplicationId: aws.String(uuid.Must(uuid.NewRandom()).String()),
			})
		if err != nil {
			fmt.Printf("Got an error while trying to Send Message %v: %v", code, err)
		}
		if err == nil {
			fmt.Printf("Successful Send Message: %v", sendMessageOutput)
		}
	}

	return true, nil
}

func main() {
	lambda.Start(HandleRequest)
}
