# GitHub gistHub

*Command Line tool for uploading snippets to GitHub Gist*

Pet project where I hope to add a new feature or improve existing functionality on a weekly basis! Sure it's only a bit of craic!

## Installation
- Clone the repo `git clone https://github.com/robbiegleeson/gistHub.git`
- `cd gistHub && npm install -g`

## Usage

- Upload a gist:
    - `gist <path-to-file> -u <username> -p <private - boolean>`
    - Example: `gist index.js -u gitusername -p true`
- View Gists:
    - `gist -u <username> -v`

## What's New v2.1.1
- Added ability to view user Gists
- Let user set privacy of Gist
- Some refactoring

## What's New v2.0.0
- Better error handling
- Less flags to pass
- Must authenticate in order to create Gist (previously didn't even have to enter any credentials! Crazy!)

## To-do
- More refactoring - bring code up to a better standard
- Add ability to delete Gist given ID
