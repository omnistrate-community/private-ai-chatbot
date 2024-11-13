package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"net/http"
)

type Metrics struct {
	customRegistry                *prometheus.Registry
	TotalRequestsCounter          *prometheus.CounterVec `json:"-"`
	TotalRequestTokens            *prometheus.CounterVec `json:"-"`
	TotalResponseTokens           *prometheus.CounterVec `json:"-"`
	TotalChatThreadsCreated       *prometheus.CounterVec `json:"-"`
	TotalSuccessfulSigninAttempts *prometheus.CounterVec `json:"-"`
	TotalUsersPerOrganization     *prometheus.GaugeVec   `json:"-"`
}

func NewMetrics() (m *Metrics) {
	m = &Metrics{
		customRegistry: prometheus.NewRegistry(),
		TotalRequestsCounter: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "total_requests",
			Help: "Total number of requests",
		}, []string{"user_id", "organization_id", "email"}),
		TotalRequestTokens: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "total_request_tokens",
			Help: "Total number of request tokens",
		}, []string{"user_id", "organization_id", "email"}),
		TotalResponseTokens: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "total_response_tokens",
			Help: "Total number of response tokens",
		}, []string{"user_id", "organization_id", "email"}),
		TotalChatThreadsCreated: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "total_chat_threads_created",
			Help: "Total number of chat threads created",
		}, []string{"user_id", "organization_id", "email"}),
		TotalSuccessfulSigninAttempts: prometheus.NewCounterVec(prometheus.CounterOpts{
			Name: "total_successful_signin_attempts",
			Help: "Total number of successful signin attempts",
		}, []string{"user_id", "organization_id", "email"}),
		TotalUsersPerOrganization: prometheus.NewGaugeVec(prometheus.GaugeOpts{
			Name: "total_users_per_organization",
			Help: "Total number of users per organization",
		}, []string{"organization_id"}),
	}

	m.register()
	return
}

func (m *Metrics) IncrementTotalRequests(userID, orgID, email string) {
	m.TotalRequestsCounter.WithLabelValues(userID, orgID, email).Inc()
}

func (m *Metrics) IncrementTotalRequestTokens(userID, orgID, email string, count float64) {
	m.TotalRequestTokens.WithLabelValues(userID, orgID, email).Add(count)
}

func (m *Metrics) IncrementTotalResponseTokens(userID, orgID, email string, count float64) {
	m.TotalResponseTokens.WithLabelValues(userID, orgID, email).Add(count)
}

func (m *Metrics) IncrementTotalChatThreads(userID, orgID, email string) {
	m.TotalChatThreadsCreated.WithLabelValues(userID, orgID, email).Inc()
}

func (m *Metrics) IncrementTotalSuccessfulSigninAttempts(userID, orgID, email string) {
	m.TotalSuccessfulSigninAttempts.WithLabelValues(userID, orgID, email).Inc()
}

func (m *Metrics) SetTotalUsersPerOrganization(organizationID string, totalUsers float64) {
	m.TotalUsersPerOrganization.WithLabelValues(organizationID).Set(totalUsers)
}

func (m *Metrics) Reset() {
	m.TotalRequestsCounter.Reset()
	m.TotalRequestTokens.Reset()
	m.TotalResponseTokens.Reset()
	m.TotalChatThreadsCreated.Reset()
	m.TotalSuccessfulSigninAttempts.Reset()
	m.TotalUsersPerOrganization.Reset()
}

func (m *Metrics) register() {
	m.customRegistry.MustRegister(m.TotalRequestsCounter)
	m.customRegistry.MustRegister(m.TotalRequestTokens)
	m.customRegistry.MustRegister(m.TotalResponseTokens)
	m.customRegistry.MustRegister(m.TotalChatThreadsCreated)
	m.customRegistry.MustRegister(m.TotalSuccessfulSigninAttempts)
	m.customRegistry.MustRegister(m.TotalUsersPerOrganization)
}

func (m *Metrics) Handler() http.Handler {
	return promhttp.HandlerFor(m.customRegistry, promhttp.HandlerOpts{})
}
