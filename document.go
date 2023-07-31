package main

import (
	"context"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type LabDocument struct {
	ctx  context.Context
	path string
}

func NewLabDocument() *LabDocument {
	instance := &LabDocument{}
	return instance
}

func (d *LabDocument) setContext(ctx context.Context) {
	d.ctx = ctx
}

func (d *LabDocument) Open() {
	// Open file dialog lead user to select file.
	docPath, err := runtime.OpenFileDialog(d.ctx, runtime.OpenDialogOptions{
		Title: "Open File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Lab Nodes (*.lns)",
				Pattern:     "*.lns",
			},
		},
	})

	if err != nil {
		// Handle error
		return
	}

	if docPath == "" {
		// User cancelled
		return
	}

	content, err := os.ReadFile(docPath)
	if err != nil {
		// Handle error
		return
	}

	d.path = docPath
	emitDocumentOpened(d.ctx, docPath, string(content))

}

func (d *LabDocument) Save(content string) {
	os.WriteFile(d.path, []byte(content), 0644)
}

func (d *LabDocument) SaveAs(content string) {
	// Open file dialog lead user to select file.
	docPath, err := runtime.SaveFileDialog(d.ctx, runtime.SaveDialogOptions{
		Title: "Save File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Lab Nodes (*.lns)",
				Pattern:     "*.lns",
			},
		},
	})

	if err != nil {
		// Handle error
		return
	}

	if docPath == "" {
		// User cancelled
		return
	}

	// If file extension is not .lns, append it.
	if docPath[len(docPath)-4:] != ".lns" {
		docPath += ".lns"
	}

	d.path = docPath
	emitDocumentOpened(d.ctx, docPath, content)
	d.Save(content)
}

func emitDocumentOpened(ctx context.Context, path string, content string) {
	runtime.EventsEmit(ctx, "document-opened", map[string]interface{}{
		"path":    path,
		"content": content,
	})
}
