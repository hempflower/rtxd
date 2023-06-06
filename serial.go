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

func (l *LabSerial) OpenSerialPort(portName string, baudRate int, databits int, parity int, stopbits int) {
	mode := &serial.Mode{
		BaudRate: baudRate,
		DataBits: databits,
		Parity:   serial.Parity(parity),
		StopBits: serial.StopBits(stopbits),
	}
	port, err := serial.Open(portName, mode)
	if err != nil {
		panic(err)
	}
	l.serialPort = port
}
