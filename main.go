package main

import (
	"bufio"
	"flag"
	"log"
	"os"

	"most-active-github-users-counter/output"
	"most-active-github-users-counter/top"
)


func main() {
	token := flag.String("token", LookupEnvOrString("GITHUB_TOKEN", ""), "Github auth token")
	amount := flag.Int("amount", 50, "Amount of users to show")
	considerNum := flag.Int("consider", 1000, "Amount of users to consider")
	outputOpt := flag.String("output", "plain", "Output format: plain, csv")
	fileName := flag.String("file", "", "Output file (optional, defaults to stdout)")

	flag.Parse()

	var format output.Format

	if *outputOpt == "plain" {
		format = output.PlainOutput
	} else if *outputOpt == "yaml" {
		format = output.YamlOutput
	} else if *outputOpt == "csv" {
		format = output.CsvOutput
	} else {
		log.Fatal("Unrecognized output format: ", *outputOpt)
	}

	// Always use Nepal preset
	nepal := Preset("nepal")
	opts := top.Options{Token: *token, Locations: nepal.include, ExcludeLocations: nepal.exclude, Amount: *amount, ConsiderNum: *considerNum, PresetTitle: PresetTitle("nepal"), PresetChecksum: PresetChecksum("nepal")}
	data, err := top.GithubTop(opts)

	if err != nil {
		log.Fatal(err)
	}

	var writer *bufio.Writer
	if *fileName != "" {
		f, err := os.Create(*fileName)
		if err != nil {
			log.Fatal(err)
		}
		writer = bufio.NewWriter(f)
		defer f.Close()
	} else {
		writer = bufio.NewWriter(os.Stdout)
	}

	err = format(data, writer, opts)
	if err != nil {
		log.Fatal(err)
	}
	writer.Flush()
}

func LookupEnvOrString(key string, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok {
		return val
	}
	return defaultVal
}
