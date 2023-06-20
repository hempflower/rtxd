package main

import (
	"context"
	"encoding/base64"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"go.bug.st/serial"
)

type LabSerialConnection struct {
	serial       *serial.Port
	writeChannel chan []byte
}
type LabSerial struct {
	// Serial port map
	context   context.Context
	serialMap map[int32]LabSerialConnection
}

func NewLabSerial() *LabSerial {
	instance := &LabSerial{}
	instance.serialMap = make(map[int32]LabSerialConnection)

	return instance
}

func (l *LabSerial) serialReader(connectionId int32) {

	port := *(l.serialMap[connectionId].serial)
	for {
		buffer := make([]byte, 128)
		n, err := port.Read(buffer)
		if err != nil {
			// emit event to frontend
			payload := map[string]interface{}{
				"connectionId": connectionId,
			}
			runtime.EventsEmit(l.context, "serial-disconnected", payload)

			return
		}
		if n > 0 {
			// Emit event to frontend
			// Convert bytes to base64 string
			payload := map[string]interface{}{
				"connectionId": connectionId,
				"data":         base64.StdEncoding.EncodeToString(buffer[:n]),
			}
			runtime.EventsEmit(l.context, "serial-data-receive", payload)
		}
	}
}

func (l *LabSerial) serialWriter(connectionId int32, writeCh chan []byte) {
	port := *(l.serialMap[connectionId].serial)
	for {
		buffer, ok := <-writeCh
		if !ok {
			return
		}
		_, err := port.Write(buffer)
		if err != nil {
			println("Error:", err.Error())
		}
	}
}

func (l *LabSerial) ListSerialPort() []string {
	ports, err := serial.GetPortsList()
	if err != nil {
		panic(err)
	}
	return ports
}

func (l *LabSerial) SetContext(context context.Context) {
	// Save context
	l.context = context
}

func (l *LabSerial) OpenSerialPort(portName string, baudRate int, databits int, parity int, stopbits int) int32 {

	mode := &serial.Mode{
		BaudRate: baudRate,
		DataBits: databits,
		Parity:   serial.Parity(parity),
		StopBits: serial.StopBits(stopbits),
	}
	port, err := serial.Open(portName, mode)
	if err != nil {
		println("Error:", err.Error())
		return -1
	}

	connectionId := int32(time.Now().UnixNano() / int64(time.Millisecond) % 1000000)
	l.serialMap[connectionId] = LabSerialConnection{serial: &port, writeChannel: make(chan []byte)}

	// emit event to frontend
	payload := map[string]int32{
		"connectionId": connectionId,
	}
	runtime.EventsEmit(l.context, "serial-connected", payload)

	// Run go routine to read from serial port
	go l.serialReader(connectionId)
	go l.serialWriter(connectionId, l.serialMap[connectionId].writeChannel)

	return connectionId
}

func (l *LabSerial) CloseSerialPort(connectionId int32) {
	port := *l.serialMap[connectionId].serial
	err := port.Close()

	if err != nil {
		println("Error:", err.Error())
	}

	// emit event to frontend
	payload := map[string]int32{
		"connectionId": connectionId,
	}
	runtime.EventsEmit(l.context, "serial-disconnected", payload)

	delete(l.serialMap, connectionId)
}

func (l *LabSerial) WriteSerialPort(connectionId int32, data []byte) {
	l.serialMap[connectionId].writeChannel <- data
}
