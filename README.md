# GitHub gistHub

*Command Line tool for uploading snippets to GitHub Gist*

Pet project where I hope to add a new feature or improve existing functionality on a weekly basis! Sure it's only a bit of craic!

## Installation
- Clone the repo `git clone https://github.com/robbiegleeson/gistHub.git`
- `cd gistHub && npm install -g`

## Usage



```bash

    ## Options
    -u username (Required)
    -v view
    -p is gist private
    -d custom description
    -r id of gist to be deleted

    ## Create new Gist
    gist myAwesomeFile.js -u myusername -p true -d "my custom description"

    ## View user Gists
    gist -u myusername -v

    ## Delete a Gist
    gist -u myusername -d gistId
```

On Linux systems, use `node index.js` in place of `gist`.

On Linux systems, use `node index.js` in place of `gist`.


## What's new version 2.1
- Ability to delete Gist given from selection

## To-do
- Save login credentials using `init` function (as an option).
- User separate commands rather than passing in a whole load of options in one.

## Contributors
- [Rob Gleeson](https://github.com/robbiegleeson)
- [Andrew Winterbotham](https://github.com/xkal36)
