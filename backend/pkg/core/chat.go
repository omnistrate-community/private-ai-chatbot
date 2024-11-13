package core

import (
	"context"
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/omnistrate-community/ai-chatbot/pkg/auth"
	"github.com/omnistrate-community/ai-chatbot/pkg/metrics"
	"github.com/omnistrate-community/ai-chatbot/pkg/model/core"
	"github.com/omnistrate-community/ai-chatbot/pkg/model/tenant"
	openapiclientv1 "github.com/omnistrate-oss/omnistrate-sdk-go/v1"
	"github.com/rs/zerolog/log"
	"gorm.io/gorm"
	"net/http"
	"strings"
)

type Chat struct {
	metrics     *metrics.Metrics
	authHandler *auth.Auth
}

func NewChat(metricsService *metrics.Metrics) *Chat {
	return &Chat{
		metrics:     metricsService,
		authHandler: auth.NewAuth(metricsService),
	}
}

func (c *Chat) startThread(threadName string, user tenant.User) (thread *ThreadContext, err error) {
	thread = NewThreadContext(c.metrics, threadName, user)

	if err = thread.Save(); err != nil {
		err = errors.Join(err, errors.New("failed to save thread"))
		return
	}

	return
}

func (c *Chat) NewThreadHandler(ctx *gin.Context) {
	var err error
	var threadName string

	defer func() {
		if err != nil {
			var serviceErr *openapiclientv1.GenericOpenAPIError
			if errors.As(err, &serviceErr) {
				log.Error().Err(err).Msgf("failed to start thread: %s", string(serviceErr.Body()))
				return
			}

			log.Error().Err(err).Str("thread_name", threadName).Msg("failed to start thread")
		}
	}()

	// Use the admin context to get the user profile
	authHeader := ctx.GetHeader("Authorization")
	jwtToken := strings.TrimPrefix(authHeader, "Bearer ")

	// Get user context
	var user tenant.User
	if user, _, err = c.authHandler.DescribeTenant(context.Background(), jwtToken); err != nil {
		if errors.Is(err, auth.ForbiddenError) {
			// Handle the error
			ctx.JSON(403, gin.H{"error": "forbidden"})
			return
		}

		// Handle the error
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Start a new thread
	var data map[string]any
	if err = ctx.BindJSON(&data); err != nil {
		// Handle the error
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if data == nil {
		// Handle the error
		ctx.JSON(400, gin.H{"error": "missing thread name"})
		return
	}

	threadName = data["name"].(string)

	var thread *ThreadContext
	if thread, err = c.startThread(threadName, user); err != nil {
		// Handle the error
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Send the response back through Gin
	ctx.JSON(http.StatusOK, gin.H{"thread_id": thread.ID, "thread_name": thread.Name})
}

func (c *Chat) ListThreadsHandler(ctx *gin.Context) {
	var err error

	defer func() {
		if err != nil {
			var serviceErr *openapiclientv1.GenericOpenAPIError
			if errors.As(err, &serviceErr) {
				log.Error().Err(err).Msgf("failed to list threads: %s", string(serviceErr.Body()))
				return
			}

			log.Error().Err(err).Msg("failed to list threads")
		}
	}()

	// Use the admin context to get the user profile
	authHeader := ctx.GetHeader("Authorization")
	jwtToken := strings.TrimPrefix(authHeader, "Bearer ")

	var user tenant.User
	if user, _, err = c.authHandler.DescribeTenant(context.Background(), jwtToken); err != nil {
		if errors.Is(err, auth.ForbiddenError) {
			// Handle the error
			ctx.JSON(403, gin.H{"error": "forbidden"})
			return
		}

		// Handle the error
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// List all threads for the user
	var threads []core.Thread
	if threads, err = core.GetThreadsForUser(user.ID); err != nil {
		// Handle the error
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Send the response back through Gin
	ctx.JSON(http.StatusOK, gin.H{"threads": threads})
}

func (c *Chat) GetThreadHandler(ctx *gin.Context) {
	var err error

	defer func() {
		if err != nil {
			var serviceErr *openapiclientv1.GenericOpenAPIError
			if errors.As(err, &serviceErr) {
				log.Error().Err(err).Msgf("failed to get thread details: %s", string(serviceErr.Body()))
				return
			}

			log.Error().Err(err).Str("thread_id", ctx.Param("thread_id")).Msg("failed to get thread details")
		}
	}()

	// Use the admin context to get the user profile
	authHeader := ctx.GetHeader("Authorization")
	jwtToken := strings.TrimPrefix(authHeader, "Bearer ")

	var user tenant.User
	if user, _, err = c.authHandler.DescribeTenant(context.Background(), jwtToken); err != nil {
		if errors.Is(err, auth.ForbiddenError) {
			// Handle the error
			ctx.JSON(403, gin.H{"error": "forbidden"})
			return
		}

		// Handle the error
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Get the thread ID from the URL
	threadID := ctx.Param("thread_id")

	// Get the thread
	var thread core.Thread
	if thread, err = core.GetThreadByID(threadID, user.ID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Handle the error
			ctx.JSON(404, gin.H{"error": "thread not found"})
			return
		}

		// Handle the error
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Get messages for thread
	var messages []core.Message
	if messages, err = thread.GetMessages(); err != nil {
		// Handle the error
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Send the response back through Gin
	ctx.JSON(http.StatusOK, gin.H{"thread_id": thread.ID, "thread_name": thread.Name, "messages": messages})
}

func (c *Chat) QueryThreadHandler(ctx *gin.Context) {
	var err error

	defer func() {
		if err != nil {
			var serviceErr *openapiclientv1.GenericOpenAPIError
			if errors.As(err, &serviceErr) {
				log.Error().Err(err).Msgf("failed to query thread: %s", string(serviceErr.Body()))
				return
			}

			log.Error().Err(err).Msg("failed to query thread")
		}
	}()

	// Use the admin context to get the user profile
	authHeader := ctx.GetHeader("Authorization")
	jwtToken := strings.TrimPrefix(authHeader, "Bearer ")

	// Get user context
	var user tenant.User
	if user, _, err = c.authHandler.DescribeTenant(context.Background(), jwtToken); err != nil {
		if errors.Is(err, auth.ForbiddenError) {
			// Handle the error
			ctx.JSON(403, gin.H{"error": "forbidden"})
			return
		}

		// Handle the error
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Get the thread ID from the URL
	threadID := ctx.Param("thread_id")

	// Get the thread
	var thread core.Thread
	if thread, err = core.GetThreadByID(threadID, user.ID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Handle the error
			ctx.JSON(404, gin.H{"error": "thread not found"})
			return
		}

		// Handle the error
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Get the query from the request body
	var data map[string]any
	if err = ctx.BindJSON(&data); err != nil {
		// Handle the error
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if data == nil {
		// Handle the error
		ctx.JSON(400, gin.H{"error": "missing query"})
		return
	}

	// Query the thread
	threadContext := FromThread(c.metrics, thread)
	var response string
	if response, err = threadContext.Query(context.Background(), data["message"].(string)); err != nil {
		// Handle the error
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Send the response back through Gin
	ctx.JSON(http.StatusOK, gin.H{"response": response})
}
