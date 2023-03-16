package main

import (
	"context"
	"fmt"
	"strings"
	"net/http"
	"os"
	"time"
	"strconv"
	"encoding/json"
	"github.com/gocolly/colly"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sqs"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-lambda-go/events"

	"github.com/google/uuid"
)

type Stock struct {
	Id string `json:"id"`
	Price float64 `json:"price"`
	Volume float64 `json:"volume"`
	TotalPrice float64 `json:"totalPrice"`
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
	}));
}

func GetQueueURL(sess *session.Session, queueName string) (*sqs.GetQueueUrlOutput, error) {
	sqsClient := sqs.New(sess);

	return sqsClient.GetQueueUrl(&sqs.GetQueueUrlInput{
		QueueName: &queueName,
	});
}

func SendMessage(sess *session.Session, queueUrl string, messageBody string) error {
	sqsClient := sqs.New(sess)

	_, err := sqsClient.SendMessage(&sqs.SendMessageInput{
		QueueUrl:    &queueUrl,
		MessageBody: aws.String(messageBody),
	});

	return err;
}

func SendMessageFifo(sess *session.Session, queueUrl string, messageGroupId string, messageBody string) (*sqs.SendMessageOutput, error) {
	sqsClient := sqs.New(sess);

	return sqsClient.SendMessage(&sqs.SendMessageInput{
		QueueUrl:               &queueUrl,
		MessageBody:            aws.String(messageBody),
		MessageGroupId:         aws.String(messageGroupId),
		MessageDeduplicationId: aws.String(uuid.Must(uuid.NewRandom()).String()),
	});
}

func GetTransaction(channel chan Stock, stockName string) {
	s := []string{"https://24hmoney.vn/stock", stockName, "transactions"};
    endpoint := strings.Join(s, "/");
	collyCollector := colly.NewCollector();

	collyCollector.SetRequestTimeout(30 * time.Second);

	onHtml := ".trading-history-box > .view-more-wrapper > .view-more-wrapper-content > table > tbody > tr:first-child";

	collyCollector.OnHTML(onHtml, func(e *colly.HTMLElement) {
		stock := Stock{Id: stockName};
		
		e.ForEach("p", func(i int, elem *colly.HTMLElement) {
			switch i {
				case 1:
					value, err := strconv.ParseFloat(strings.Replace(elem.Text, ",", "", -1), 64)
					if err != nil {
						fmt.Printf("Error: strconv ParseFloat %s", err)
					}
					stock.Price = value;
				case 3:
					value, err := strconv.ParseFloat(strings.Replace(elem.Text, ",", "", -1), 64)
					if err != nil {
						fmt.Printf("Error: strconv ParseFloat %s", err)
					}
					stock.TotalPrice = value;
				case 4:
					value, err := strconv.ParseFloat(strings.Replace(elem.Text, ",", "", -1), 64)
					if err != nil {
						fmt.Printf("Error: strconv ParseFloat %s", err)
					}
					stock.Volume = value;
				default:
					fmt.Println(elem.Text);
			}
			
		});
		fmt.Println(stock);
		channel <- stock
		// close(channel)
	})
	// Before making a request print "Visiting ..."
	collyCollector.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL.String())
	})

	// Start scraping on endpoint
	collyCollector.Visit(endpoint)
}

func HandleRequest(ctx context.Context, event events.SQSEvent) error {
	channel := make(chan Stock)
	for _, message := range event.Records {
		fmt.Printf("The message %s for event source %s = %s \n", message.MessageId, message.EventSource, message.Body);

		stockName := message.Body;
		go GetTransaction(channel, stockName);
		stock, ok := <-channel
		if ok == false {
			fmt.Println("Channel Close ", stock)
		}
		
		json, err := json.Marshal(stock)
		if err != nil {
			fmt.Printf("Error: json Marshal %s", err.Error())
		}

		fmt.Println(string(json))
	}

	return nil
}

func main() {
	lambda.Start(HandleRequest)
}
