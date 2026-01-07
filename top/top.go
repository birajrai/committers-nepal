package top

import (
	"errors"
	"fmt"

	"most-active-github-users-counter/github"
	"most-active-github-users-counter/net"
)

const minFollowers = 15

func GithubTop(options Options) (github.GithubSearchResults, error) {
	var token = options.Token
	if token == "" {
		return github.GithubSearchResults{}, errors.New("Missing GITHUB token")
	}

	query := fmt.Sprintf("type:user followers:>=%d", minFollowers)
	if len(options.Locations) > 0 {
		locationQuery := ""
		for i, location := range options.Locations {
			if i > 0 {
				locationQuery += " OR "
			}
			locationQuery += fmt.Sprintf("location:%s", location)
		}
		query = fmt.Sprintf("%s (%s)", query, locationQuery)
	}

	for _, location := range options.ExcludeLocations {
		query = fmt.Sprintf("%s -location:%s", query, location)
	}

	var client = github.NewGithubClient(net.TokenAuth(token))
	users, err := client.SearchUsers(github.UserSearchQuery{Q: query, Sort: "followers", Order: "desc", MaxUsers: options.ConsiderNum})
	if err != nil {
		return github.GithubSearchResults{}, err
	}
	return users, nil
}

type Options struct {
	Token            string
	Locations        []string
	ExcludeLocations []string
	Amount           int
	ConsiderNum      int
	PresetTitle      string
	PresetChecksum   string
}
