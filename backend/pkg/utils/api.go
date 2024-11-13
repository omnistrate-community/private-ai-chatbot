package utils

import (
	"github.com/gin-gonic/gin"
	"github.com/omnistrate-community/ai-chatbot/pkg/config"
	cors "github.com/rs/cors/wrapper/gin"
	"github.com/rs/zerolog/log"
	"net/http"
)

var r *gin.Engine

type GinAPI gin.HandlerFunc
type NativeAPI http.HandlerFunc

func init() {
	r = gin.Default()
	corsMW := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})
	r.Use(corsMW)

}

func (a GinAPI) Mount(path string, verb string) {
	switch verb {
	case http.MethodGet:
		r.GET(config.APIPrefix+"/"+path, gin.HandlerFunc(a))
	case http.MethodHead:
		r.HEAD(config.APIPrefix+"/"+path, gin.HandlerFunc(a))
	case http.MethodPost:
		r.POST(config.APIPrefix+"/"+path, gin.HandlerFunc(a))
	case http.MethodPut:
		r.PUT(config.APIPrefix+"/"+path, gin.HandlerFunc(a))
	case http.MethodPatch:
		r.PATCH(config.APIPrefix+"/"+path, gin.HandlerFunc(a))
	case http.MethodDelete:
		r.DELETE(config.APIPrefix+"/"+path, gin.HandlerFunc(a))
	}
}

func (a NativeAPI) Mount(path string, verb string) {
	switch verb {
	case http.MethodGet:
		r.GET(config.APIPrefix+"/"+path, gin.WrapH(http.HandlerFunc(a)))
	case http.MethodHead:
		r.HEAD(config.APIPrefix+"/"+path, gin.WrapH(http.HandlerFunc(a)))
	case http.MethodPost:
		r.POST(config.APIPrefix+"/"+path, gin.WrapH(http.HandlerFunc(a)))
	case http.MethodPut:
		r.PUT(config.APIPrefix+"/"+path, gin.WrapH(http.HandlerFunc(a)))
	case http.MethodPatch:
		r.PATCH(config.APIPrefix+"/"+path, gin.WrapH(http.HandlerFunc(a)))
	case http.MethodDelete:
		r.DELETE(config.APIPrefix+"/"+path, gin.WrapH(http.HandlerFunc(a)))
	}
}

func StartServer() {
	gin.SetMode(gin.ReleaseMode)

	err := r.Run(":8080")
	if err != nil {
		log.Fatal().Err(err).Msg("failed to run server")
	}
}
