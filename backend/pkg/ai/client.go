package ai

import (
	"context"
	"io"

	"github.com/omnistrate-community/ai-chatbot/pkg/config"
	"github.com/omnistrate-community/ai-chatbot/pkg/metrics"
	"github.com/omnistrate-community/ai-chatbot/pkg/model/core"
	"github.com/pkg/errors"
	"github.com/rs/zerolog/log"
	"github.com/sashabaranov/go-openai"
)

type LLMEngine struct {
	metrics *metrics.Metrics
	client  *openai.Client
}

func NewLLMEngine(metricsServer *metrics.Metrics) (engine *LLMEngine) {
	engine = &LLMEngine{
		metrics: metricsServer,
	}

	clientConfig := openai.DefaultConfig(config.ModelProviderAPIKey)
	clientConfig.BaseURL = config.ModelProviderEndpoint
	engine.client = openai.NewClientWithConfig(clientConfig)
	return
}

func (e *LLMEngine) Query(ctx context.Context, prompt core.Message) (responseContent string, usage *openai.Usage, err error) {
	request := openai.ChatCompletionRequest{
		Model:               config.Model,
		MaxCompletionTokens: 8192,
		Messages: []openai.ChatCompletionMessage{
			{
				Role:    openai.ChatMessageRoleUser,
				Content: prompt.Content,
			},
		},
		Stream: true,
		StreamOptions: &openai.StreamOptions{
			IncludeUsage: true,
		},
	}

	if config.ModelProvider == config.ModelProviderVLLM {
		// vLLM does not support MaxCompletionTokens yet
		request.MaxCompletionTokens = 0
		request.MaxTokens = 8192
	}

	stream, err := e.client.CreateChatCompletionStream(ctx, request)
	if err != nil {
		err = errors.Wrap(err, "thread.Query: failed to create chat completion stream")
		return
	}
	defer stream.Close()

	log.Info().Msg("thread.Query: created chat completion stream")

	for {
		var streamResponse openai.ChatCompletionStreamResponse
		streamResponse, err = stream.Recv()
		if errors.Is(err, io.EOF) {
			log.Info().Msg("thread.Query: chat completion stream closed")
			err = nil
			break
		}

		if err != nil {
			err = errors.Wrap(err, "thread.Query: failed to receive chat completion response")
			log.Error().Err(err).Msg("thread.Query: failed to receive chat completion response")
			return
		}

		if streamResponse.Usage != nil {
			usage = streamResponse.Usage
		}

		if len(streamResponse.Choices) == 0 {
			continue
		}

		responseContent = responseContent + streamResponse.Choices[0].Delta.Content
	}

	if usage != nil {
		e.metrics.IncrementTotalRequestTokens(prompt.Thread.UserID, prompt.Thread.User.OrgID, prompt.Thread.User.Email, float64(usage.PromptTokens))
		e.metrics.IncrementTotalResponseTokens(prompt.Thread.UserID, prompt.Thread.User.OrgID, prompt.Thread.User.Email, float64(usage.CompletionTokens))
	}

	return
}
