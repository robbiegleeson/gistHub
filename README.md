# Gist-Hub

![NPM](https://github.com/robbiegleeson/gistHub/raw/master/npm.png "NPM")

[GistHub NPM](https://www.npmjs.com/package/gist-hub)

*Command Line tool for uploading snippets to GitHub Gist*

[![NPM](https://nodei.co/npm/gist-hub.png?downloads=true)](https://nodei.co/npm/gist-hub/)


[![npm](https://img.shields.io/npm/dm/gist-hub.svg)]()


Pet project where I hope to add a new feature or improve existing functionality on a weekly basis! Sure it's only a bit of craic!

## Installation
- Clone the repo `git clone https://github.com/robbiegleeson/gistHub.git`
- `cd gistHub && npm install -g`

## Usage


```bash

    ## Commands
    gist init ## Configure the application with username and password

    gist reset ## Reset the application configuration

    gist view ## View user gists with ability to delete

    gist <path-to-file>  ## Create new Gist
        ## Options
        -p is gist private <Boolean>
        -d custom description <String>
        -r id of gist to be deleted

        ## Example
        gist myAwesomeFile.js -p true -d "my custom description"

        ## Delete a Gist

        gist -u myusername -d gistId
```


## What's new version 3.0
- New command to view gists and delete from selection
- Save and reset configuration settings


## Contributors
- [Rob Gleeson](https://github.com/robbiegleeson)
- [Andrew Winterbotham](https://github.com/xkal36)
