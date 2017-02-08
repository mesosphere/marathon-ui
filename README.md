[![Stories in Ready](https://badge.waffle.io/mesosphere/marathon.png?label=ready,gui&title=Ready)](https://waffle.io/mesosphere/marathon?label=gui)
# Marathon UI [![Build Status](https://travis-ci.org/mesosphere/marathon-ui.png?branch=master)](https://travis-ci.org/mesosphere/marathon-ui) [![Teamcity Snapshot UI Webjar Build Status](https://teamcity.mesosphere.io/app/rest/builds/buildType:%28id:Oss_Marathon_SnapshotUiWebjar%29/statusIcon)](https://teamcity.mesosphere.io/viewType.html?buildTypeId=Oss_Marathon_SnapshotUiWebjar&guest=1) [![Coverage Status](https://coveralls.io/repos/mesosphere/marathon-ui/badge.svg?branch=master&service=github)](https://coveralls.io/github/mesosphere/marathon-ui?branch=master)

![Marathon UI](https://raw.githubusercontent.com/mesosphere/marathon-ui/master/marathon-ui.png "Marathon UI")

## Project Status

The message below was posted on the [marathon-framework google groups](https://groups.google.com/forum/#!msg/marathon-framework/c6qUW8c0_3A/05dh0FjJBgAJ) site:

> Dear Marathon Community,
> 
> We'd like to give you an update on the current state of Marathon UI and invite you to discuss the future development.
> 
> As you may have noticed, we haven't invested much lately in further advancing the Marathon UI, as we've devoted most of our time to develop a new seamless integrated Services (Marathon) UI for DC/OS. The new UI includes the functionality of the old UI, and:
> 
> * The new Service Detail View includes completed and failed tasks. We've also integrated the Mesos Task details and added a new log view for easier debugging.
> * We've improved the Deployments View, providing more information for better deployment management.
> * The new Service UI uses the same components and styling as the DC/OS UI to deliver a seamless user experience.
> 
> Because of our focus on integrating the experience of using Marathon and DC/OS, we aren’t planning on updating the old UI further. We will, however, continue to review PRs and fix critical bugs on the old Marathon UI for the next few months. We know a lot of users depend on the old stand-alone UI, and we are hoping that one of these dedicated users will take charge of the repo in which the old UI lives. If you would like to take on this responsibility, or have anyone to nominate, please get in touch with us! You can email me personally, or find me in the shared DC/OS Slack channel (http://chat.dcos.io).  
> 
> Please let us know if you have suggestions about the old UI, or thoughts on the new one. Your feedback is much appreciated!
> 
> Orlando
> Mesosphere

## The web user interface for Mesosphere's Marathon

The UI is bundled with the [Marathon](https://github.com/mesosphere/marathon)
package.

Please note that issues are disabled for this repository. Please feel free to
open an issue on the
[issues page on the main Marathon Repository](https://github.com/mesosphere/marathon/issues?q=is%3Aopen+is%3Aissue+label%3Agui).

#### Documentation

Documentation for the Marathon UI (work in progress) can be found at
https://mesosphere.github.io/marathon/docs/marathon-ui.html.

#### Setup

---
 There are two ways to set up and configure your development environment:

1. 🤖 Set up Mesos and Marathon following this
  [tutorial](https://mesosphere.github.io/marathon/docs/) and install a CORS
  proxy on your machine.
2. 🐳 Use the handy docker-based setup - *Please be aware that it's currently 
     not possible to launch Docker containers  with this setup.*

___

##### 🤖 Prerequisites

There are a few things you need, before you can start working. Please make sure
you've installed and properly configured the following software:

* [Node 5.4.1](https://nodejs.org/en/blog/release/v5.4.1/) including
  [NPM](https://npmjs.org/)
* Mesos and Marathon (follow the
	[tutorial here](https://mesosphere.github.io/marathon/docs/))
* Set up a CORS proxy on your machine to proxy the UI requests to your running
  Marathon instance (e.g. via Corsproxy)

##### 🤖 1. Install all dependencies

        npm install
        npm install -g gulp

##### 🤖 2. Override development configuration

    1. Copy `src/js/config/config.template.js` to `src/js/config/config.dev.js`
    2. Override variables in `config.dev.js` to reflect your local development
    configuration

##### 🤖 3. Run development environment

  ```
  npm run serve
  ```

  or

  ```
  npm run livereload
  ```

 for a `browsersync` live-reload server.


---

##### 🐳 Prerequisites

Please make sure you've installed and properly configured the following
software:

* [Docker 1.13](https://www.docker.com/)

##### 🐳 1. Configure your hosts

If you're not using something like
[dnsdock](https://github.com/tonistiigi/dnsdock) or
[dinghy](https://github.com/codekitchen/dinghy) (OS X) for easy container
discovery/access, please configure your hosts as follows:

      mesos-master.docker 192.168.99.100
      mesos-slave.docker  192.168.99.100
      marathon.docker     192.168.99.100

*Use `$ docker-machine ip $DOCKER_MACHINE_NAME` to get the current docker
machine ip and add those lines to your `etc/hosts` configuration.*


##### 🐳 4. Start your environment

The following command will download, configure and start a basic Zookeeper,
Mesos and Marathon setup for you. It will also build and serve the Marathon UI.

       docker-compose up

#### Contributing to this project

Please refer to the
[CONTRIBUTING.md](https://github.com/mesosphere/marathon-ui/blob/master/CONTRIBUTING.md)
file.
