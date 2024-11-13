package logger

import "github.com/rs/zerolog"

func init() {
	// UNIX Time is faster and smaller than most timestamps
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
}
