# GitHub gistHub

*Command Line tool for uploading snippets to GitHub Gist*

Pet project where I hope to add a new feature or improve existing functionality on a weekly basis! Sure it's only a bit of craic!

## Installation
- Clone the repo `git clone https://github.com/robbiegleeson/gistHub.git`
- `cd gistHub && npm install -g`

## Usage



```bash

    // Options
    -u username (Required)
    -v view
    -p is gist private
    -d custom description
    -r id of gist to be deleted

    // Create new Gist
    gist myAwesomeFile.js -u myusername -p true -d "my custom description"

    // View user Gists
    gist -u myusername -v

    //Delete a Gist
    gist -u myusername -d gistId
```

## What's new version 2.1
- Ability to delete Gist given ID
- Added custom descriptions
- Minor refactoring
- Added ability to view user Gists
- Let user set privacy of Gist
- Some refactoring

## To-do
- More refactoring, always more refactoring!
- Delete Gist from selection rather than passing in the ID.
- Open to suggestions!
