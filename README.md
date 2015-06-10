# Marathon UI

## The web user interface for Mesosphere's Marathon

The UI is bundled with the [Marathon](https://github.com/mesosphere/marathon) package.

If you want to development on the Marathon UI please follow these steps.

#### Compiling the UI

1. Install [NPM](https://npmjs.org/)

2. Install dev dependencies

        npm install
        npm install -g broccoli-cli
        npm install -g broccoli-timepiece

3. Run development environment

        npm run watch

4. Build the assets

        npm run dist

5. Check it in.

        git add dist/main.js dist/main.css img/*

#### Serve the UI for development

 1. Start a HTTP server on the Marathon UI root directory to serve the ```index.html```

    For example:

        python3 -m http.server 1337

#### Adding npm package dependencies to package.json

If you want to add a new npm package to 'node_modules':

1. Install the new package

        npm install [your package] --save
    will install and save to dependencies in package.json and

        npm install [your package] --save-dev
    will add it to devDependencies.

2. Create a synced npm-shrinkwrap.json with devDependencies included

        npm shrinkwrap --dev

3. Commit to repository

#### Development Setup

There is an ```.editorconfig```-file to apply editor settings on various editors.

##### Sublime Text

1. Add the following to your Sublime Text User Settings:

  ```json
  {
    ...
    "rulers": [80], // lines no longer than 80 chars
    "tab_size": 2, // use two spaces for indentation
    "translate_tabs_to_spaces": true, // use spaces for indentation
    "ensure_newline_at_eof_on_save": true, // add newline on save
    "trim_trailing_white_space_on_save": true, // trim trailing white space on save
    "default_line_ending": "unix"
  }
  ```

2. Add Sublime-linter with jshint & jsxhint:

  1. Installing SublimeLinter is straightforward using Sublime Package Manager, see [instructions](http://sublimelinter.readthedocs.org/en/latest/installation.html#installing-via-pc)

  2. SublimeLinter-jshint needs a global jshint in your system, see [instructions](https://github.com/SublimeLinter/SublimeLinter-jshint#linter-installation)

  3. SublimeLinter-jsxhint needs a global jsxhint in your system, as well as JavaScript (JSX) bundle inside Packages/JavaScript, see [instructions](https://github.com/SublimeLinter/SublimeLinter-jsxhint#linter-installation)

  4. ~~SublimeLinter-csslint needs a global csslint in your system, see [instructions](https://github.com/SublimeLinter/SublimeLinter-csslint#linter-installation)~~

#### Testing approach

Use the [BDD style](http://guide.agilealliance.org/guide/bdd.html) of testing.
Tests should be organised around scenarios rather than rigidly around class
structure and method names, for example "Creating an application" rather than
"Application#initialize". Test for correct error handling as well as correct
behaviour. Mock where necessary, but not as a matter of course.

Keep tests short, clean, and descriptive. Aim for high code coverage, but don't
worry about achieving 100% coverage. Try to keep tests flexible. Test the
interface, not the implementation.

Aim to ensure that tests run quickly to keep the feedback loop tight.
