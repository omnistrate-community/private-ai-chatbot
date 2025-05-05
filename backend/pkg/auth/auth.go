package auth

import (
	"context"
	"github.com/omnistrate-community/ai-chatbot/pkg/metrics"
	"github.com/omnistrate-community/ai-chatbot/pkg/model/tenant"
	"github.com/omnistrate-community/ai-chatbot/pkg/utils"
	openapiclientv1 "github.com/omnistrate-oss/omnistrate-sdk-go/v1"
	"github.com/pkg/errors"
	"github.com/rs/zerolog/log"
	"net/http"
)

var ForbiddenError = errors.New("forbidden")

type Auth struct {
	omnistrateAdminService *utils.OmnistrateServiceAdmin
	metrics                *metrics.Metrics
}

func NewAuth(metricsServer *metrics.Metrics) (a *Auth) {
	return &Auth{
		omnistrateAdminService: utils.OmnistrateServiceAdminInstance(),
		metrics:                metricsServer,
	}
}

func (a *Auth) CreateTenant(
	ctx context.Context,
	user tenant.User,
	password string,
) (
	createdUser tenant.User,
	org tenant.Org,
	err error,
) {
	// Use the admin context to signup as the customer
	var tenantSignupHandle openapiclientv1.ApiUsersApiCustomerSignupRequest
	if tenantSignupHandle, err = utils.OmnistrateServiceAdminInstance().TenantSignUpAPIHandle(context.Background()); err != nil {
		err = errors.Wrap(err, "failed to get tenant signup handle")
		return
	}

	customerSignupRequestBody := &openapiclientv1.CustomerSignupRequest2{
		CompanyDescription: utils.ToPtr(user.Org.Description),
		CompanyUrl:         utils.ToPtr(user.Org.WebsiteURL),
		Email:              user.Email,
		LegalCompanyName:   utils.ToPtr(user.Org.LegalCompanyName),
		Name:               user.Name,
		Password:           password,
	}

	var httpResult *http.Response
	if httpResult, err = tenantSignupHandle.CustomerSignupRequest2(*customerSignupRequestBody).Execute(); err != nil {
		err = errors.Wrap(err, "failed to execute tenant signup request")
		return
	}

	if httpResult.StatusCode == http.StatusForbidden {
		err = ForbiddenError
		return
	}

	if httpResult.StatusCode != http.StatusOK {
		err = errors.Errorf("failed to signup tenant: %s", httpResult.Status)
		return
	}

	// Validate user's email here. For now, we will assume that the email is valid
	if err = utils.OmnistrateServiceAdminInstance().ValidateTenant(ctx, user.Email); err != nil {
		log.Warn().Err(err).Msg("failed to validate tenant, already validated?")
	}

	// Authenticate as the user
	var tenantJWTToken string
	if tenantJWTToken, err = a.AuthenticateTenant(ctx, user.Email, password); err != nil {
		err = errors.Wrap(err, "failed to authenticate tenant")
		return
	}

	// Describe the user
	if createdUser, _, err = a.DescribeTenant(ctx, tenantJWTToken); err != nil {
		err = errors.Wrap(err, "failed to describe tenant")
		return
	}

	org = tenant.Org{
		ID:               createdUser.OrgID,
		Name:             user.Org.Name,
		LegalCompanyName: user.Org.LegalCompanyName,
		Description:      user.Org.Description,
		LogoURL:          user.Org.LogoURL,
		WebsiteURL:       user.Org.WebsiteURL,
	}

	return
}

func (a *Auth) AuthenticateTenant(
	ctx context.Context,
	tenantEmail string,
	tenantPassword string,
) (
	tenantJWTToken string,
	err error,
) {
	var tenantSignInHandle openapiclientv1.ApiUsersApiCustomerSigninRequest
	if tenantSignInHandle, err = utils.OmnistrateServiceAdminInstance().TenantSignInAPIHandle(ctx); err != nil {
		err = errors.Wrap(err, "failed to get tenant signin handle")
		return
	}

	customerSigninRequestBody := &openapiclientv1.CustomerSigninRequest2{
		Email:    tenantEmail,
		Password: utils.ToPtr(tenantPassword),
	}

	var signinResult *openapiclientv1.CustomerSigninResult
	var httpResult *http.Response
	if signinResult, httpResult, err = tenantSignInHandle.CustomerSigninRequest2(*customerSigninRequestBody).Execute(); err != nil {
		err = errors.Wrap(err, "failed to execute tenant signin request")
		return
	}

	if httpResult.StatusCode == http.StatusForbidden {
		err = ForbiddenError
		return
	}

	// Describe the user
	var user tenant.User
	if user, _, err = a.DescribeTenant(ctx, signinResult.JwtToken); err != nil {
		err = errors.Wrap(err, "failed to describe tenant")
		return
	}

	a.metrics.IncrementTotalSuccessfulSigninAttempts(user.ID, user.OrgID, user.Email)

	tenantJWTToken = signinResult.JwtToken
	return
}

func (a *Auth) DescribeTenant(
	ctx context.Context,
	tenantJWTToken string,
) (
	user tenant.User,
	rawDescribeResult *openapiclientv1.DescribeUserResult,
	err error,
) {
	ctx = context.WithValue(ctx, openapiclientv1.ContextAccessToken, tenantJWTToken)
	userHandle := utils.GetOmnistrateAPIClient().UsersApiAPI.UsersApiDescribeUser(ctx)

	var httpResult *http.Response
	if rawDescribeResult, httpResult, err = userHandle.Execute(); err != nil {
		err = errors.Wrap(err, "failed to execute describe user request")
		return
	}

	if httpResult.StatusCode == http.StatusForbidden {
		err = ForbiddenError
		return
	}

	user = tenant.User{
		ID:    rawDescribeResult.Id,
		Email: utils.FromPtr(rawDescribeResult.Email),
		Name:  utils.FromPtr(rawDescribeResult.Name),
		OrgID: utils.FromPtr(rawDescribeResult.OrgId),
		Org: tenant.Org{
			ID:          utils.FromPtr(rawDescribeResult.OrgId),
			Name:        utils.FromPtr(rawDescribeResult.OrgName),
			Description: utils.FromPtr(rawDescribeResult.OrgDescription),
			LogoURL:     utils.FromPtr(rawDescribeResult.OrgLogoURL),
			WebsiteURL:  utils.FromPtr(rawDescribeResult.OrgURL),
		},
	}

	return
}
