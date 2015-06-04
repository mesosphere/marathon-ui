#### Working on assets

When editing assets like CSS and JavaScript locally, they are loaded from the
packaged JAR by default and are not editable. To load them from a directory for
easy editing, set the `assets_path` flag when running Marathon:

    ./bin/start --master local --zk zk://localhost:2181/marathon --assets_path src/main/resources/assets/

#### Compiling Assets

*Note: You only need to follow these steps if you plan to edit the JavaScript source.*

1. Install [NPM](https://npmjs.org/)
2. Change to the assets directory

        cd src/main/resources/assets

3. Install dev dependencies

        npm install
        npm install -g broccoli-cli
        npm install -g broccoli-timepiece

4. Run development environment

        npm run watch

5. Build the assets

        npm run dist

6. The distribution files will be written to `src/main/resources/assets/dist`.
   Check it in.

        git add dist/main.js dist/main.css img/*

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

#### Development Setup (Sublime Text)

1. Add the following to your Sublime Text User Settings:

    {
      ...
      "rulers": [80], // lines no longer than 80 chars
      "tab_size": 2, // use two spaces for indentation
      "translate_tabs_to_spaces": true, // use spaces for indentation
      "ensure_newline_at_eof_on_save": true, // add newline on save
      "trim_trailing_white_space_on_save": true, // trim trailing white space on save
      "default_line_ending": "unix"
    }

2. Add Sublime-linter with jshint & jsxhint:

  1. Installing SublimeLinter is straightforward using Sublime Package Manager, see [instructions](http://sublimelinter.readthedocs.org/en/latest/installation.html#installing-via-pc)

  2. SublimeLinter-jshint needs a global jshint in your system, see [instructions](https://github.com/SublimeLinter/SublimeLinter-jshint#linter-installation)

  3. SublimeLinter-jsxhint needs a global jsxhint in your system, as well as JavaScript (JSX) bundle inside Packages/JavaScript, see [instructions](https://github.com/SublimeLinter/SublimeLinter-jsxhint#linter-installation)

  4. ~~SublimeLinter-csslint needs a global csslint in your system, see [instructions](https://github.com/SublimeLinter/SublimeLinter-csslint#linter-installation)~~
