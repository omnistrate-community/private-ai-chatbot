package main

import (
	"github.com/omnistrate-community/ai-chatbot/pkg/core"
	"github.com/omnistrate-community/ai-chatbot/pkg/metrics"
	modelcore "github.com/omnistrate-community/ai-chatbot/pkg/model/core"
	modeltenant "github.com/omnistrate-community/ai-chatbot/pkg/model/tenant"
	"github.com/omnistrate-community/ai-chatbot/pkg/utils"
	"github.com/rs/zerolog/log"
	// Import other necessary packages like those for interacting with the databases and your AI module
)

func main() {
	// Initialize database + models
	if err := modeltenant.Initialize(); err != nil {
		log.Fatal().Err(err).Msg("failed to initialize database")
	}
	if err := modelcore.Initialize(); err != nil {
		log.Fatal().Err(err).Msg("failed to initialize database")
	}

	// Mount metrics APIs
	metricsServer := metrics.NewMetrics()
	utils.NativeAPI(metricsServer.Handler().ServeHTTP).Mount("/metrics", "GET")

	// Mount user APIs
	userAPIs := core.NewUserAPI(metricsServer)
	utils.GinAPI(userAPIs.SignupHandler).Mount("/user", "POST")
	utils.GinAPI(userAPIs.SigninHandler).Mount("/user/signin", "POST")
	utils.GinAPI(userAPIs.UserProfileHandler).Mount("/user/profile", "GET")

	// Mount chat APIs
	chatAPIs := core.NewChat(metricsServer)
	utils.GinAPI(chatAPIs.NewThreadHandler).Mount("/chat/thread", "POST")
	utils.GinAPI(chatAPIs.ListThreadsHandler).Mount("/chat/thread", "GET")
	utils.GinAPI(chatAPIs.GetThreadHandler).Mount("/chat/thread/:thread_id", "GET")
	utils.GinAPI(chatAPIs.QueryThreadHandler).Mount("/chat/thread/:thread_id/query", "POST")

	// Run the server
	utils.StartServer()
}
