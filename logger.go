package main

import (
	"fmt"
	"os"
	"path"
	"runtime"

	"github.com/apsdehal/go-logger"
)

// Implement the logger interface
type AppLogger struct {
	logger *logger.Logger
}

func NewAppLogger() *AppLogger {
	// Log to file
	logFile, _ := os.OpenFile("paramlab.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	log, _ := logger.New("main", 0, logFile)
	log.SetFormat("[%{level}] %{time} %{message}")
	return &AppLogger{
		logger: log,
	}
}

func (a *AppLogger) getCaller() string {
	// Get the caller of the caller of this function
	_, file, line, _ := runtime.Caller(4)

	file = path.Base(file)

	return fmt.Sprintf("%s:%d ", file, line)
}

func (a *AppLogger) Print(message string) {
	// Change caller to be the caller of the caller of this function
	a.logger.Debug(a.getCaller() + message)
}

func (a *AppLogger) Trace(message string) {
	a.logger.Debug(a.getCaller() + message)
}

func (a *AppLogger) Debug(message string) {
	a.logger.Debug(a.getCaller() + message)
}

func (a *AppLogger) Info(message string) {
	a.logger.Info(a.getCaller() + message)
}

func (a *AppLogger) Warning(message string) {
	a.logger.Warning(a.getCaller() + message)
}

func (a *AppLogger) Error(message string) {
	a.logger.Error(a.getCaller() + message)
}

func (a *AppLogger) Fatal(message string) {
	a.logger.Critical(a.getCaller() + message)
}
