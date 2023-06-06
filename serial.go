package main

import "go.bug.st/serial"

type LabSerial struct {
	serialPort serial.Port
}

func NewLabSerial() *LabSerial {
	return &LabSerial{}
}

func (l *LabSerial) ListSerialPort() []string {
	ports, err := serial.GetPortsList()
	if err != nil {
		panic(err)
	}
	return ports
}
