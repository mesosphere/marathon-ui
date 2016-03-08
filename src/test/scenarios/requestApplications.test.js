import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import AppsStore from "../../js/stores/AppsStore";
import AppsActions from "../../js/actions/AppsActions";
import AppsEvents from "../../js/events/AppsEvents";
import HealthStatus from "../../js/constants/HealthStatus";
import AppTypes from "../../js/constants/AppTypes";

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("request applications and groups", function () {

  before(function (done) {
    var nockResponse = {
      apps: [{
        id: "/app-1",
        instances: 5,
        mem: 100,
        cpus: 4
      }, {
        id: "/app-2"
      }],
      groups: [{
        id: "/group"
      }]
    };

    nock(config.apiURL)
      .get("/v2/groups")
      .query(true)
      .reply(200, nockResponse);

    AppsStore.once(AppsEvents.CHANGE, done);
    AppsActions.requestApps();
  });

  it("updates the AppsStore on success", function () {
    expect(AppsStore.apps).to.have.length(3);
  });

  it("calculate total resources", function () {
    expect(AppsStore.apps[0].totalMem).to.equal(500);
    expect(AppsStore.apps[0].totalCpus).to.equal(20);
  });

  it("handles failure gracefully", function (done) {
    nock(config.apiURL)
      .get("/v2/groups")
      .query(true)
      .reply(404, {message: "Guru Meditation"});

    AppsStore.once(AppsEvents.REQUEST_APPS_ERROR, function (error) {
      expectAsync(function () {
        expect(error.message).to.equal("Guru Meditation");
      }, done);
    });

    AppsActions.requestApps();
  });

  it("handles unauthorized errors gracefully", function (done) {
    nock(config.apiURL)
      .get("/v2/groups")
      .query(true)
      .reply(401, {message: "Unauthorized access"});

    AppsStore.once(AppsEvents.REQUEST_APPS_ERROR,
      function (error, statusCode) {
        expectAsync(function () {
          expect(statusCode).to.equal(401);
        }, done);
      });

    AppsActions.requestApps();
  });

  describe("basic app", function () {

    before(function (done) {
      var nockResponse = {
        apps: [{
          id: "/app-1",
          tasksHealthy: 2,
          tasksUnhealthy: 2,
          tasksRunning: 5,
          tasksStaged: 2,
          instances: 10
        }]
      };

      nock(config.apiURL)
        .get("/v2/groups")
        .query(true)
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });

    it("has correct health weight", function () {
      expect(AppsStore.apps[0].healthWeight).to.equal(47);
    });

    it("has the correct app type", function () {
      expect(AppsStore.apps[0].type).to.equal(AppTypes.CGROUP);
    });

    it("has correct health data object", function () {
      expect(AppsStore.apps[0].health).to.deep.equal([
        {quantity: 2, state: HealthStatus.HEALTHY},
        {quantity: 2, state: HealthStatus.UNHEALTHY},
        {quantity: 1, state: HealthStatus.UNKNOWN},
        {quantity: 2, state: HealthStatus.STAGED},
        {quantity: 0, state: HealthStatus.OVERCAPACITY},
        {quantity: 3, state: HealthStatus.UNSCHEDULED}
      ]);
    });
  });

  describe("docker app", function () {

    before(function (done) {
      var nockResponse = {
        apps: [{
          id: "/app-1-docker",
          container: {
            type: "DOCKER"
          },
          tasksHealthy: 2,
          tasksUnhealthy: 2,
          tasksRunning: 5,
          tasksStaged: 2,
          instances: 10
        }]
      };

      nock(config.apiURL)
        .get("/v2/groups")
        .query(true)
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });

    it("has correct health weight", function () {
      expect(AppsStore.apps[0].healthWeight).to.equal(47);
    });

    it("has the correct app type", function () {
      expect(AppsStore.apps[0].type).to.equal("DOCKER");
    });

    it("has correct health data object", function () {
      expect(AppsStore.apps[0].health).to.deep.equal([
        {quantity: 2, state: HealthStatus.HEALTHY},
        {quantity: 2, state: HealthStatus.UNHEALTHY},
        {quantity: 1, state: HealthStatus.UNKNOWN},
        {quantity: 2, state: HealthStatus.STAGED},
        {quantity: 0, state: HealthStatus.OVERCAPACITY},
        {quantity: 3, state: HealthStatus.UNSCHEDULED}
      ]);
    });
  });

  describe("basic suspended app", function () {

    before(function (done) {
      var nockResponse = {
        apps: [{
          id: "/app-1",
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          tasksRunning: 0,
          tasksStaged: 0,
          instances: 0
        }]
      };

      nock(config.apiURL)
        .get("/v2/groups")
        .query(true)
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });

    it("has correct health weight", function () {
      expect(AppsStore.apps[0].healthWeight).to.equal(0);
    });

    it("has correct health data object", function () {
      expect(AppsStore.apps[0].health).to.deep.equal([
        {quantity: 0, state: HealthStatus.HEALTHY},
        {quantity: 0, state: HealthStatus.UNHEALTHY},
        {quantity: 0, state: HealthStatus.UNKNOWN},
        {quantity: 0, state: HealthStatus.STAGED},
        {quantity: 0, state: HealthStatus.OVERCAPACITY},
        {quantity: 0, state: HealthStatus.UNSCHEDULED}
      ]);
    });
  });

  describe("basic deploying app", function () {

    before(function (done) {
      var nockResponse = {
        apps: [{
          id: "/app-1",
          tasksHealthy: 5,
          tasksUnhealthy: 0,
          tasksRunning: 0,
          tasksStaged: 5,
          instances: 15
        }]
      };

      nock(config.apiURL)
        .get("/v2/groups")
        .query(true)
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });

    it("has correct health weight", function () {
      expect(AppsStore.apps[0].healthWeight).to.equal(13);
    });

    it("has correct health data object", function () {
      expect(AppsStore.apps[0].health).to.deep.equal([
        {quantity: 5, state: HealthStatus.HEALTHY},
        {quantity: 0, state: HealthStatus.UNHEALTHY},
        {quantity: 0, state: HealthStatus.UNKNOWN},
        {quantity: 5, state: HealthStatus.STAGED},
        {quantity: 0, state: HealthStatus.OVERCAPACITY},
        {quantity: 5, state: HealthStatus.UNSCHEDULED}
      ]);
    });
  });

  describe("basic app overcapacity", function () {

    before(function (done) {
      var nockResponse = {
        apps: [{
          id: "/app-1",
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          tasksRunning: 1,
          tasksStaged: 0,
          instances: 0
        }]
      };

      nock(config.apiURL)
        .get("/v2/groups")
        .query(true)
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });

    it("has correct health weight", function () {
      expect(AppsStore.apps[0].healthWeight).to.equal(18);
    });

    it("has correct health data object", function () {
      expect(AppsStore.apps[0].health).to.deep.equal([
        {quantity: 0, state: HealthStatus.HEALTHY},
        {quantity: 0, state: HealthStatus.UNHEALTHY},
        {quantity: 1, state: HealthStatus.UNKNOWN},
        {quantity: 0, state: HealthStatus.STAGED},
        {quantity: 1, state: HealthStatus.OVERCAPACITY},
        {quantity: 0, state: HealthStatus.UNSCHEDULED}
      ]);
    });
  });

  describe("application groups", function () {
    before(function (done) {
      var nockResponse = {
        id: "/",
        apps: [{
          id: "/app-1",
          tasksHealthy: 0,
          tasksUnhealthy: 0,
          tasksRunning: 1,
          tasksStaged: 0,
          instances: 0
        }],
        groups: [{
          id: "/empty-group",
          apps: [],
          groups: []
        }, {
          id: "/non-empty-group",
          apps: [{
            id: "/non-empty-group/app-2",
            tasksHealthy: 0,
            tasksUnhealthy: 0,
            tasksRunning: 1,
            tasksStaged: 0,
            instances: 0
          }],
          groups: []
        }]
      };

      nock(config.apiURL)
        .get("/v2/groups")
        .query(true)
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });

    it("handles emtpy groups", function () {
      var emptyGroup = AppsStore.apps[1];
      expect(emptyGroup.id).to.eql("/empty-group");
      expect(emptyGroup.isGroup).to.be.true;
    });

    it("handles nested applications", function () {
      var nestedApp = AppsStore.apps[2];
      expect(nestedApp.id).to.eql("/non-empty-group/app-2");
    });
  });
});

describe("on single app request", function () {

  it("updates the AppsStore on success", function (done) {
    nock(config.apiURL)
      .get("/v2/apps//single-app")
      .query({embed: "app.taskStats"})
      .reply(200, {
        "app": {
          "id": "/single-app"
        }
      });

    AppsStore.once(AppsEvents.CHANGE, function () {
      expectAsync(function () {
        expect(AppsStore.getCurrentApp("/single-app").id)
          .to.equal("/single-app");
      }, done);
    });

    AppsActions.requestApp("/single-app");
  });

  it("has the correct app status (running)", function (done) {
    nock(config.apiURL)
      .get("/v2/apps//single-app")
      .query({embed: "app.taskStats"})
      .reply(200, {
        "app": {
          "id": "/single-app",
          "instances": 1,
          "tasksRunning": 1
        }
      });

    AppsStore.once(AppsEvents.CHANGE, function () {
      expectAsync(function () {
        expect(AppsStore.getCurrentApp("/single-app").status).to.equal(0);
      }, done);
    });

    AppsActions.requestApp("/single-app");
  });

  it("has the correct app status (deploying)", function (done) {
    nock(config.apiURL)
      .get("/v2/apps//single-app")
      .query({embed: "app.taskStats"})
      .reply(200, {
        "app": {
          "id": "/single-app",
          "deployments": ["deployment-1"]
        }
      });

    AppsStore.once(AppsEvents.CHANGE, function () {
      expectAsync(function () {
        expect(AppsStore.getCurrentApp("/single-app").status).to.equal(1);
      }, done);
    });

    AppsActions.requestApp("/single-app");
  });

  it("has the correct app status (suspended)", function (done) {
    nock(config.apiURL)
      .get("/v2/apps//single-app")
      .query({embed: "app.taskStats"})
      .reply(200, {
        "app": {
          "id": "/single-app"
        }
      });

    AppsStore.once(AppsEvents.CHANGE, function () {
      expectAsync(function () {
        expect(AppsStore.getCurrentApp("/single-app").status).to.equal(2);
      }, done);
    });

    AppsActions.requestApp("/single-app");
  });

  it("handles failure gracefully", function (done) {
    nock(config.apiURL)
      .filteringPath(path => "/")
      .get("/")
      .reply(404, {message: "Guru Meditation"});

    AppsStore.once(AppsEvents.REQUEST_APP_ERROR, function (error) {
      expectAsync(function () {
        expect(error.message).to.equal("Guru Meditation");
      }, done);
    });

    AppsActions.requestApp("/non-existing-app");
  });

  it("handles unauthorized errors gracefully", function (done) {
    nock(config.apiURL)
      .filteringPath(path => "/")
      .get("/")
      .reply(401, {message: "Guru Meditation"});

    AppsStore.once(AppsEvents.REQUEST_APP_ERROR,
      function (error, statusCode) {
        expectAsync(function () {
          expect(statusCode).to.equal(401);
        }, done);
      });

    AppsActions.requestApp("/non-existing-app");
  });

});
