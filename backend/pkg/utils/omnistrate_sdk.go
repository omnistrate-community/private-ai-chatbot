package utils

import (
	openapiclientfleetv1 "github.com/omnistrate-oss/omnistrate-sdk-go/fleet"
	openapiclientv1 "github.com/omnistrate-oss/omnistrate-sdk-go/v1"
	"net/http"
	"time"
)

func GetOmnistrateAPIClient() *openapiclientv1.APIClient {
	configuration := openapiclientv1.NewConfiguration()

	configuration.HTTPClient = &http.Client{
		Timeout: 30 * time.Second,
	}

	apiClient := openapiclientv1.NewAPIClient(configuration)
	return apiClient
}

func GetOmnistrateFleetAPIClient() *openapiclientfleetv1.APIClient {
	configuration := openapiclientfleetv1.NewConfiguration()

	configuration.HTTPClient = &http.Client{
		Timeout: 30 * time.Second,
	}

	apiClient := openapiclientfleetv1.NewAPIClient(configuration)
	return apiClient
}
