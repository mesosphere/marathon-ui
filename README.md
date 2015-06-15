# Marathon UI [![Build Status](https://travis-ci.org/mesosphere/marathon-ui.png?branch=master)](https://travis-ci.org/mesosphere/marathon-ui)

## The web user interface for Mesosphere's Marathon

The UI is bundled with the [Marathon](https://github.com/mesosphere/marathon) package.

If you want to start development on the Marathon UI please follow these steps.

#### Setup

1. Install [NPM](https://npmjs.org/)

2. Install dev dependencies

        npm install
        npm install -g broccoli-cli
        npm install -g broccoli-timepiece

3. Run development environment

        npm run watch

#### Serve the UI for development

 1. Start a HTTP server on the Marathon UI root directory to serve the ```index.html```

    For example:

        python3 -m http.server 1337

#### Contributing to this project

Please refer to the [CONTRIBUTING.md](https://github.com/mesosphere/marathon-ui/blob/master/CONTRIBUTING.md) file.
