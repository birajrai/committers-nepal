package main

import (
	"crypto/sha256"
	"fmt"
	"io"
	"strings"
)

type QueryPreset struct {
	title   string
	include []string
	exclude []string
}

var PRESETS = map[string]QueryPreset{
	"nepal": QueryPreset{
		title:   "Nepal",
		include: []string{"nepal", "kathmandu", "pokhara", "lalitpur", "bharatpur", "birgunj", "biratnagar", "janakpur", "ghorahi"},
	},
}

func Preset(name string) QueryPreset {
	return PRESETS[name]
}

func PresetTitle(name string) string {
	title := Preset(name).title
	if title == "" {
		title = strings.Title(name)
	}
	return title
}

func PresetChecksum(name string) string {
	hash := sha256.New()
	io.WriteString(hash, fmt.Sprintf("%+v", Preset(name)))
	return fmt.Sprintf("%x", hash.Sum(nil))
}
