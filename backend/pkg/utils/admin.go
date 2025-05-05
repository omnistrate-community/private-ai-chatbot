package utils

import (
	"context"
	"errors"
	"github.com/omnistrate-community/ai-chatbot/pkg/config"
	openapiclientfleetv1 "github.com/omnistrate-oss/omnistrate-sdk-go/fleet"
	openapiclientv1 "github.com/omnistrate-oss/omnistrate-sdk-go/v1"
	"github.com/rs/zerolog/log"
	"net/http"
	"sync"
)

// OmnistrateUsername is the username for the service account used for managing your service on https://omnistrate.cloud
var initSync sync.Once
var adminContext *OmnistrateServiceAdmin

type OmnistrateServiceAdmin struct {
	jwtToken string // service owner token
	username string
	password string
}

func OmnistrateServiceAdminInstance() *OmnistrateServiceAdmin {
	initSync.Do(func() {
		adminContext = &OmnistrateServiceAdmin{
			username: config.OmnistrateUsername,
			password: config.OmnistratePassword,
		}
	})
	return adminContext
}

func (o *OmnistrateServiceAdmin) Authenticate(ctx context.Context) (err error) {
	// Validate existing token
	if o.jwtToken != "" {
		return
	}

	request := openapiclientv1.NewSigninRequest(o.username)
	request.Password = ToPtr(o.password)

	result, httpResult, err := GetOmnistrateAPIClient().SigninApiAPI.SigninApiSignin(ctx).SigninRequest(*request).Execute()
	if err != nil {
		return
	}

	defer func() {
		closeErr := httpResult.Body.Close()
		if closeErr != nil {
			// Log the error
			log.Warn().Err(closeErr).Msg("failed to close response body")
			return
		}
	}()

	o.jwtToken = result.JwtToken
	return
}

func (o *OmnistrateServiceAdmin) TenantSignInAPIHandle(ctx context.Context) (client openapiclientv1.ApiUsersApiCustomerSigninRequest, err error) {
	// Authenticate the service account
	if err = o.Authenticate(ctx); err != nil {
		return
	}

	// Create a new client with the JWT token
	ctx = context.WithValue(ctx, openapiclientv1.ContextAccessToken, o.jwtToken)
	client = GetOmnistrateAPIClient().UsersApiAPI.UsersApiCustomerSignin(ctx)
	return
}

func (o *OmnistrateServiceAdmin) TenantSignUpAPIHandle(ctx context.Context) (client openapiclientv1.ApiUsersApiCustomerSignupRequest, err error) {
	// Authenticate the service account
	if err = o.Authenticate(ctx); err != nil {
		return
	}

	// Create a new client with the JWT token
	ctx = context.WithValue(ctx, openapiclientv1.ContextAccessToken, o.jwtToken)
	client = GetOmnistrateAPIClient().UsersApiAPI.UsersApiCustomerSignup(ctx)
	return
}

func (o *OmnistrateServiceAdmin) TenantUserProfileAPIHandle(ctx context.Context) (client openapiclientv1.ApiUsersApiDescribeUserRequest, err error) {
	// Authenticate the service account
	if err = o.Authenticate(ctx); err != nil {
		return
	}

	// Create a new client with the JWT token
	client = GetOmnistrateAPIClient().UsersApiAPI.UsersApiDescribeUser(ctx)
	return
}

func (o *OmnistrateServiceAdmin) ValidateTenant(ctx context.Context, tenantEmail string) (err error) {
	// Authenticate the service account
	if err = o.Authenticate(ctx); err != nil {
		return
	}

	// List all events for tenants to retrieve the validation token
	fleetCtx := context.WithValue(ctx, openapiclientfleetv1.ContextAccessToken, o.jwtToken)
	eventsClient := GetOmnistrateFleetAPIClient().EventsApiAPI.EventsApiListEvents(fleetCtx)

	var result *openapiclientfleetv1.ListEndCustomerEventsResult
	var httpResult *http.Response
	if result, httpResult, err = eventsClient.Execute(); err != nil {
		return
	}

	defer func() {
		closeErr := httpResult.Body.Close()
		if closeErr != nil {
			// Log the error
			log.Warn().Err(closeErr).Msg("failed to close response body")
			return
		}
	}()

	for _, event := range result.Events {
		if event.UserEmail != nil && *event.UserEmail == tenantEmail {
			if event.EventPayload == nil {
				err = errors.New("event payload is nil")
				return
			}

			// Create a new client with the JWT token
			tenantCtx := context.WithValue(ctx, openapiclientv1.ContextAccessToken, o.jwtToken)
			if httpResult, err = GetOmnistrateAPIClient().SignupApiAPI.SignupApiValidateToken(tenantCtx).ValidateTokenRequest(openapiclientv1.ValidateTokenRequest{
				Email: tenantEmail,
				Token: event.EventPayload["token"].(string),
			}).Execute(); err != nil {
				return
			}

			return
		}
	}

	err = errors.New("tenant not found")
	return
}
