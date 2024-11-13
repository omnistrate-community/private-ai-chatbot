package config

import (
	"os"
)

const (
	ModelProviderOpenAI = "openai"
	ModelProviderVLLM   = "vllm"
)

var OmnistrateUsername string
var OmnistratePassword string
var ModelProvider string
var ModelProviderEndpoint string
var ModelProviderAPIKey string
var Model string
var APIPrefix string

func init() {
	// Load Omnistrate service account credentials
	OmnistrateUsername = os.Getenv("OMNISTRATE_USERNAME")
	OmnistratePassword = os.Getenv("OMNISTRATE_PASSWORD")
	ModelProvider = os.Getenv("MODEL_PROVIDER")
	Model = os.Getenv("MODEL")
	ModelProviderEndpoint = os.Getenv("MODEL_PROVIDER_ENDPOINT")
	ModelProviderAPIKey = os.Getenv("MODEL_PROVIDER_API_KEY")
	APIPrefix = os.Getenv("API_PREFIX")
	if APIPrefix == "" {
		APIPrefix = "/api"
	}
}
