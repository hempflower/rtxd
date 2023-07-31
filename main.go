package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create an instance of the app structure
	app := NewApp()

	labSerial := NewLabSerial()
	labDoc := NewLabDocument()

	// Create application with options
	err := wails.Run(&options.App{
		Title:     "ParamLab",
		Width:     1024,
		Height:    768,
		MinWidth:  300,
		MinHeight: 200,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			labSerial.SetContext(ctx)
			labDoc.setContext(ctx)
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
		println("Error:", err.Error())
	}
}
