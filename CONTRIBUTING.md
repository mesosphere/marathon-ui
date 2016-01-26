#### Found an Issue?
If you find a bug in the source code or a mistake in the documentation, you can
help by submitting an issue to the [Marathon GitHub Repository](https://github.com/mesosphere/marathon/issues).

#### Submitting an Issue
Before you submit your issue search the archive, maybe your question was already answered.

**IMPORTANT**: please use the label `gui` when submitting issues related to the
`marathon-ui`.

#### Compiling the UI

1. Install Mesos and Marathon (follow the [tutorial here](https://mesosphere.github.io/marathon/docs/))
2. Setup a CORS proxy on your machine to proxy the UI requests to your running Marathon instance (e.g. via [Corsproxy](https://www.npmjs.com/package/corsproxy))
3. Install [Node 5](https://nodejs.org/en/blog/release/v5.0.0/) and [NPM](https://npmjs.org/)

4. Install dev dependencies

        npm install
        npm install -g gulp

5. Override development configuration

    1. Copy `src/js/config/config.template.js` to `src/js/config/config.dev.js`
    2. Override variables in `config.dev.js` to reflect your local development configuration

6. Run development environment

        npm run serve

  or

        npm run livereload

  for a `browsersync` live-reload server.

#### Adding npm package dependencies to package.json

If you want to add a new npm package to 'node_modules':

1. Install the new package

        npm install [your package] --save
    will install and save to dependencies in package.json and

        npm install [your package] --save-dev
    will add it to devDependencies.

2. Create a synced npm-shrinkwrap.json with devDependencies included

        npm shrinkwrap --dev

#### Editor Configuration

There is an ```.editorconfig```-file to apply editor settings on various editors.

##### Sublime Text specific configuration

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

2. Add Sublime-linter with eslint:

  1. Installing SublimeLinter is straightforward using Sublime Package Manager, see [instructions](http://sublimelinter.readthedocs.org/en/latest/installation.html#installing-via-pc)
  2. Follow the instructions for [SublimeLinter-eslint](https://github.com/roadhump/SublimeLinter-eslint)

#### Coding Guidelines
Follow our [Coding Guidelines](https://github.com/mesosphere/marathon-ui/blob/master/coding-guidelines.md)

#### Submitting a Pull Request
Before you submit your pull request consider the following guidelines:

* Search [GitHub](https://github.com/mesosphere/marathon-ui/pulls) for an open or closed Pull Request
  that relates to your submission. You don't want to duplicate effort.
* Make your changes in a new git branch:

     ```shell
     git checkout -b my-fix-branch master
     ```

* Create your patch, including [appropriate test cases](#testing)

* Commit your changes using a descriptive commit message

* Build your changes locally to ensure all the tests pass:

    ```shell
    npm run dist
    ```

* Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```

* In GitHub, send a pull request to `marathon-ui:master`.

* If we suggest changes then:
  * Make the required updates.
  * Re-run the test suite to ensure tests are still passing.
  * If necessary, rebase your branch and force push to your GitHub repository (this will update your Pull Request):

    ```shell
    git rebase master -i
    git push origin my-fix-branch -f
    ```

That's it! Thank you for your contribution!

#### Testing 

Tests are organised following two different approaches: [BDD style](http://guide.agilealliance.org/guide/bdd.html) and [Unit Tests](http://guide.agilealliance.org/guide/unittest.html). Our aim is to write unit tests that verify every single unit is working as expected in isolation, as well as creating scenarios that ensure all the moving parts play well together.

Keep all tests short, clean, and descriptive. Aim for high code coverage, but don't worry about achieving 100%. Try to keep tests flexible. Test the
interface, not the implementation. Make sure that tests can be run in any order and that tests consistently return the same result. No random numbers and such. Aim to ensure that tests run quickly to keep the feedback loop tight.

##### Units 

Unit tests should only test a single unit of work, therefore any dependency should be mocked or stubbed. These tests live under `src/test/units` and the filenames always match the component being tested, for example `AboutModalComponent.test.js`.

##### Scenarios

These tests should be organised around scenarios rather than rigidly around class structure and method names, for example "create application" rather than "Application#initialize". Test all components involved, test for correct behaviour as well as correct error handling. Mock where necessary, but not as a matter of course. Scenarios are found in `src/test/scenarios`.

