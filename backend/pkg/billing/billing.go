package billing

import (
	"context"
	"github.com/gin-gonic/gin"
	"github.com/omnistrate-community/ai-chatbot/pkg/auth"
	"github.com/omnistrate-community/ai-chatbot/pkg/metrics"
	"github.com/omnistrate-community/ai-chatbot/pkg/utils"
	openapiclientv1 "github.com/omnistrate-oss/omnistrate-sdk-go/v1"
	"github.com/pkg/errors"
	"github.com/rs/zerolog/log"
	"net/http"
	"strings"
	"time"
)

type Billing struct {
	authHandler *auth.Auth
}

func NewBilling(metricsService *metrics.Metrics) *Billing {
	return &Billing{
		authHandler: auth.NewAuth(metricsService),
	}
}

func (b *Billing) GetUsageHandler(ctx *gin.Context) {
	var err error

	defer func() {
		if err != nil {
			var serviceErr *openapiclientv1.GenericOpenAPIError
			if errors.As(err, &serviceErr) {
				log.Error().Err(err).Msgf("failed to get usage info: %s", string(serviceErr.Body()))
				return
			}
		}
	}()

	authHeader := ctx.GetHeader("Authorization")
	jwtToken := strings.TrimPrefix(authHeader, "Bearer ")
	goCtx := context.WithValue(ctx, openapiclientv1.ContextAccessToken, jwtToken)
	usageHandle := utils.GetOmnistrateAPIClient().ConsumptionUsageApiAPI.ConsumptionUsageApiGetCurrentConsumptionUsage(goCtx)

	var httpResult *http.Response
	var usage *openapiclientv1.GetConsumptionUsageResult
	if usage, httpResult, err = usageHandle.Execute(); err != nil {
		ctx.JSON(500, gin.H{"error": errors.Wrap(err, "failed to execute usage request")})
		return
	}

	if httpResult.StatusCode == http.StatusForbidden {
		// Handle the error
		ctx.JSON(403, gin.H{"error": "forbidden"})
		return
	}

	if httpResult.StatusCode != http.StatusOK {
		ctx.JSON(500, gin.H{"error": errors.Errorf("failed to get usage info: %s", httpResult.Status)})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"usage": usage})
}

func (b *Billing) GetPerDayUsageHandler(ctx *gin.Context) {
	var err error

	defer func() {
		if err != nil {
			var serviceErr *openapiclientv1.GenericOpenAPIError
			if errors.As(err, &serviceErr) {
				log.Error().Err(err).Msgf("failed to get usage info: %s", string(serviceErr.Body()))
				return
			}
		}
	}()

	authHeader := ctx.GetHeader("Authorization")
	jwtToken := strings.TrimPrefix(authHeader, "Bearer ")
	goCtx := context.WithValue(ctx, openapiclientv1.ContextAccessToken, jwtToken)

	// Get start and end date from the URL
	startDate := ctx.Param("startDate")

	var startDateParsed time.Time
	if startDateParsed, err = time.Parse(time.RFC3339, startDate); err != nil {
		ctx.JSON(400, gin.H{"error": errors.Wrap(err, "failed to parse start date")})
		return
	}

	endDate := ctx.Param("endDate")

	var endDateParsed time.Time
	if endDateParsed, err = time.Parse(time.RFC3339, endDate); err != nil {
		ctx.JSON(400, gin.H{"error": errors.Wrap(err, "failed to parse end date")})
		return
	}

	usageHandle := utils.GetOmnistrateAPIClient().ConsumptionUsageApiAPI.ConsumptionUsageApiGetConsumptionUsagePerDay(goCtx).
		StartDate(startDateParsed).
		EndDate(endDateParsed)

	var httpResult *http.Response
	var usage *openapiclientv1.GetConsumptionUsageResult
	if usage, httpResult, err = usageHandle.Execute(); err != nil {
		ctx.JSON(500, gin.H{"error": errors.Wrap(err, "failed to execute usage request")})
		return
	}

	if httpResult.StatusCode == http.StatusForbidden {
		// Handle the error
		ctx.JSON(403, gin.H{"error": "forbidden"})
		return
	}

	if httpResult.StatusCode != http.StatusOK {
		ctx.JSON(500, gin.H{"error": errors.Errorf("failed to get usage info: %s", httpResult.Status)})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"usage": usage})
}
