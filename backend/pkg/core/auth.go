package core

import (
	"context"
	"github.com/gin-gonic/gin"
	"github.com/omnistrate-community/ai-chatbot/pkg/auth"
	"github.com/omnistrate-community/ai-chatbot/pkg/metrics"
	"github.com/omnistrate-community/ai-chatbot/pkg/model/tenant"
	openapiclientv1 "github.com/omnistrate-oss/omnistrate-sdk-go/v1"
	"github.com/pkg/errors"
	"github.com/rs/zerolog/log"
	"net/http"
	"strings"
)

type UserAPI struct {
	authHandler *auth.Auth
}

func NewUserAPI(m *metrics.Metrics) *UserAPI {
	return &UserAPI{
		authHandler: auth.NewAuth(m),
	}
}

func (u UserAPI) SignupHandler(ctx *gin.Context) {
	var err error

	defer func() {
		if err != nil {
			var serviceErr *openapiclientv1.GenericOpenAPIError
			if errors.As(err, &serviceErr) {
				log.Error().Err(err).Msgf("failed to signup user: %s", string(serviceErr.Body()))
				return
			}

			log.Error().Err(err).Msg("failed to signup user")
		}
	}()

	// Execute the request
	var data map[string]any
	if err = ctx.ShouldBindJSON(&data); err != nil {
		// Send error back through Gin
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if data == nil {
		err = errors.New("missing request body")
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	// Create the tenant
	if _, _, err = u.authHandler.CreateTenant(
		context.Background(),
		tenant.User{
			Email: data["email"].(string),
			Name:  data["name"].(string),
			Org: tenant.Org{
				Name:             data["legal_company_name"].(string),
				LegalCompanyName: data["legal_company_name"].(string),
				Description:      data["company_description"].(string),
				WebsiteURL:       data["company_url"].(string),
			},
		},
		data["password"].(string),
	); err != nil {
		// Send error back through Gin
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Send the response back through Gin
	ctx.JSON(http.StatusOK, gin.H{"message": "User created successfully"})
}

func (u UserAPI) SigninHandler(ctx *gin.Context) {
	var err error

	defer func() {
		if err != nil {
			var serviceErr *openapiclientv1.GenericOpenAPIError
			if errors.As(err, &serviceErr) {
				log.Error().Err(err).Msgf("failed to signin user: %s", string(serviceErr.Body()))
				return
			}
			log.Error().Err(err).Msg("failed to signin user")
		}
	}()

	// Execute the request
	var data map[string]any
	if err = ctx.ShouldBindJSON(&data); err != nil {
		// Send error back through Gin
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	if data == nil {
		err = errors.New("missing request body")
		ctx.JSON(400, gin.H{"error": err.Error()})
		return
	}

	var jwtToken string
	if jwtToken, err = u.authHandler.AuthenticateTenant(
		context.Background(),
		data["email"].(string),
		data["password"].(string),
	); err != nil {
		if errors.Is(err, auth.ForbiddenError) {
			ctx.JSON(403, gin.H{"error": "invalid credentials"})
			return
		}

		// Send error back through Gin
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Send the response back through Gin
	ctx.JSON(http.StatusOK, gin.H{"token": jwtToken})
}

func (u UserAPI) UserProfileHandler(ctx *gin.Context) {
	var err error

	defer func() {
		if err != nil {
			var serviceErr *openapiclientv1.GenericOpenAPIError
			if errors.As(err, &serviceErr) {
				log.Error().Err(err).Msgf("failed to get user profile: %s", string(serviceErr.Body()))
				return
			}

			log.Error().Err(err).Msg("failed to get user profile")
		}
	}()

	// Use the admin context to get the user profile
	authHeader := ctx.GetHeader("Authorization")
	jwtToken := strings.TrimPrefix(authHeader, "Bearer ")

	// Execute the request
	var user *openapiclientv1.DescribeUserResult
	if _, user, err = u.authHandler.DescribeTenant(
		context.Background(),
		jwtToken,
	); err != nil {
		if errors.Is(err, auth.ForbiddenError) {
			ctx.JSON(403, gin.H{"error": "invalid credentials"})
			return
		}

		// Send error back through Gin
		ctx.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Send the response back through Gin
	ctx.JSON(http.StatusOK, gin.H{"user": user})
}
