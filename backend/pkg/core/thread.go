package core

import (
	"context"
	"github.com/google/uuid"
	"github.com/omnistrate-community/ai-chatbot/pkg/ai"
	"github.com/omnistrate-community/ai-chatbot/pkg/metrics"
	"github.com/omnistrate-community/ai-chatbot/pkg/model/core"
	"github.com/omnistrate-community/ai-chatbot/pkg/model/tenant"
	"github.com/pkg/errors"
)

type ThreadContext struct {
	core.Thread

	llmEngine *ai.LLMEngine
	metrics   *metrics.Metrics
}

func NewThreadContext(
	metricsService *metrics.Metrics,
	threadName string,
	user tenant.User,
) *ThreadContext {
	metricsService.IncrementTotalChatThreads(user.ID, user.OrgID, user.Email)

	return &ThreadContext{
		Thread: core.Thread{
			ID:     uuid.New().String(),
			Name:   threadName,
			UserID: user.ID,
			User:   user,
		},
		llmEngine: ai.NewLLMEngine(metricsService),
		metrics:   metricsService,
	}
}

func FromThread(
	metricsService *metrics.Metrics,
	thread core.Thread,
) *ThreadContext {
	return &ThreadContext{
		Thread:    thread,
		llmEngine: ai.NewLLMEngine(metricsService),
		metrics:   metricsService,
	}
}

func (t *ThreadContext) Query(ctx context.Context, query string) (response string, err error) {
	// Store query in messages
	message := core.Message{
		MessageID:   uuid.New().String(),
		ThreadID:    t.ID,
		Thread:      t.Thread,
		Content:     query,
		MessageType: core.MessageTypeQuery,
	}

	if err = message.Save(); err != nil {
		err = errors.Wrap(err, "thread.Query: failed to save query message")
		return
	}

	// Query the LLM engine
	if response, _, err = t.llmEngine.Query(ctx, message); err != nil {
		err = errors.Wrap(err, "thread.Query: failed to query LLM engine")
		return
	}

	// Store response in messages
	message = core.Message{
		MessageID:   uuid.New().String(),
		ThreadID:    t.ID,
		Thread:      t.Thread,
		Content:     response,
		MessageType: core.MessageTypeResponse,
	}

	if err = message.Save(); err != nil {
		err = errors.Wrap(err, "thread.Query: failed to save response message")
		return
	}

	return
}
