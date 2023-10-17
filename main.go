package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/logger"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

//go:embed all:frontend/dist
var assets embed.FS

func globalPanicHandler(err error) {
	runtime.LogFatal(context.Background(), "A panic has occurred!")
	runtime.LogFatal(context.Background(), err.Error())
}

func main() {
	defer func() {
		if r := recover(); r != nil {
			globalPanicHandler(r.(error))
		}
	}()

	// Create an instance of the app structure
	app := NewApp()

	labSerial := NewLabSerial()
	labDoc := NewLabDocument()
	// Create application with options
	err := wails.Run(&options.App{
		Title:              "ParamLab",
		Width:              1024,
		Height:             768,
		MinWidth:           300,
		MinHeight:          200,
		Logger:             NewAppLogger(),
		LogLevelProduction: logger.DEBUG,
		LogLevel:           logger.DEBUG,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			labSerial.SetContext(ctx)
			labDoc.setContext(ctx)

			runtime.LogInfo(ctx, "App started")
		},
		Bind: []interface{}{
			app,
			labSerial,
			labDoc,
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: true,
		},
	})

	if err != nil {
		runtime.LogInfo(app.ctx, "An error occurred: "+err.Error())
	}
}
