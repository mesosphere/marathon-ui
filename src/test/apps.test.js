var _ = require("underscore");
var config = require("../js/config/config");
var describeWithDOM = require("enzyme").describeWithDOM;
var expect = require("chai").expect;
var expectAsync = require("./helpers/expectAsync");
var mount = require("enzyme").mount;
var nock = require("nock");
var render = require("enzyme").render;
var shallow = require("enzyme").shallow;
var Util = require("../js/helpers/Util");

var React = require("react/addons");

var AppTypes = require("../js/constants/AppTypes");

var AppsActions = require("../js/actions/AppsActions");
var AppDispatcher = require("../js/AppDispatcher");
var BreadcrumbComponent = require("../js/components/BreadcrumbComponent.jsx");
var AppListComponent = require("../js/components/AppListComponent");
var AppListItemComponent = require("../js/components/AppListItemComponent");
var AppHealthBarComponent =
  require("../js/components/AppHealthBarComponent");
var AppHealthBarWithTooltipComponent =
  require("../js/components/AppHealthBarWithTooltipComponent");
var AppHealthDetailComponent =
  require("../js/components/AppHealthDetailComponent");
var AppPageComponent = require("../js/components/AppPageComponent");
var AppStatusComponent = require("../js/components/AppStatusComponent");
var appScheme = require("../js/stores/schemes/appScheme");
var AppsEvents = require("../js/events/AppsEvents");
var AppsStore = require("../js/stores/AppsStore");
var AppStatus = require("../js/constants/AppStatus");
var HealthStatus = require("../js/constants/HealthStatus");
var QueueActions = require("../js/actions/QueueActions");
var QueueStore = require("../js/stores/QueueStore");
var States = require("../js/constants/States");

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Apps", function () {

  describe("on apps request", function () {

    before(function (done) {
      var nockResponse = {
        apps: [{
          id: "/app-1",
          instances: 5,
          mem: 100,
          cpus: 4
        }, {
          id: "/app-2"
        }]
      };

      nock(config.apiURL)
        .get("/v2/apps")
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });

    it("updates the AppsStore on success", function () {
      expect(AppsStore.apps).to.have.length(2);
    });

    it("calculate total resources", function () {
      expect(AppsStore.apps[0].totalMem).to.equal(500);
      expect(AppsStore.apps[0].totalCpus).to.equal(20);
    });

    it("handles failure gracefully", function (done) {
      nock(config.apiURL)
        .get("/v2/apps")
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
        .get("/v2/apps")
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
          .get("/v2/apps")
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
          .get("/v2/apps")
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
          .get("/v2/apps")
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
          .get("/v2/apps")
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
          .get("/v2/apps")
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
          expect(AppsStore.currentApp.id).to.equal("/single-app");
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
          expect(AppsStore.currentApp.status).to.equal(0);
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
          expect(AppsStore.currentApp.status).to.equal(1);
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
          expect(AppsStore.currentApp.status).to.equal(2);
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

  describe("on queue update", function () {

    it("has the correct app status (delayed)", function (done) {
      var nockResponse = {
        "queue": [
          {
            "app": {
              "id": "/app-1",
              "maxLaunchDelaySeconds": 3600
            },
            "delay": {
              "overdue": false,
              "timeLeftSeconds": 784
            }
          }
        ]
      };
      nock(config.apiURL)
        .get("/v2/queue")
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(_.findWhere(AppsStore.apps, {id: "/app-1"}).status)
          .to.equal(3);
        }, done);
      });

      QueueActions.requestQueue();
    });

    it("has the correct app status (waiting)", function (done) {
      var nockResponse = {
        "queue": [
          {
            "app": {
              "id": "/app-1",
              "maxLaunchDelaySeconds": 3600
            },
            "delay": {
              "overdue": true,
              "timeLeftSeconds": 123
            }
          }
        ]
      };
      nock(config.apiURL)
        .get("/v2/queue")
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(_.findWhere(AppsStore.apps, {id: "/app-1"}).status)
          .to.equal(4);
        }, done);
      });

      QueueActions.requestQueue();
    });

    it("does not trigger a change event if it doesn't update an app status",
        function (done) {
      var initialTimeout = this.timeout();
      this.timeout(25);

      var nockResponse = {
        "queue": [
          {
            "app": {
              "id": "/app-1",
              "maxLaunchDelaySeconds": 3600
            },
            "delay": {
              "overdue": false,
              "timeLeftSeconds": 0
            }
          }
        ]
      };
      nock(config.apiURL)
        .get("/v2/queue")
        .reply(200, nockResponse);

      var onChange = function () {
        expectAsync(function () {
          done(new Error("AppsEvents.CHANGE shouldn't be called."));
        }, done);
      };

      AppsStore.once(AppsEvents.CHANGE, onChange);

      setTimeout(() => {
        AppsStore.removeListener(AppsEvents.CHANGE, onChange);
        this.timeout(initialTimeout);
        done();
      }, 10);

      QueueActions.requestQueue();
    });

  });

  describe("on app creation", function () {

    beforeEach(function (done) {
      var nockResponse = {
        apps: [{
          id: "/app-1",
        }, {
          id: "/app-2"
        }]
      };

      nock(config.apiURL)
        .get("/v2/apps")
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });

    it("updates the AppsStore on success", function (done) {
      nock(config.apiURL)
        .post("/v2/apps")
        .reply(201, {"id": "/app-3"});

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(3);
          expect(_.where(AppsStore.apps, {
            id: "/app-3"
          })).to.be.not.empty;
        }, done);
      });

      AppsActions.createApp({
        "id": "/app-3",
        "cmd": "app command"
      });
    });

    it("sends create event on success", function (done) {
      nock(config.apiURL)
        .post("/v2/apps")
        .reply(201, {
          "id": "/app-3"
        });

      AppsStore.once(AppsEvents.CREATE_APP, function () {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(3);
        }, done);
      });

      AppsActions.createApp({
        "id": "/app-3"
      });
    });

    it("handles bad request", function (done) {
      nock(config.apiURL)
        .post("/v2/apps")
        .reply(400, {message: "Guru Meditation"});

      AppsStore.once(AppsEvents.CREATE_APP_ERROR, function (error, status) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
          expect(status).to.equal(400);
        }, done);
      });

      AppsActions.createApp({
        cmd: "app command"
      });
    });

    it("passes response status", function (done) {
      nock(config.apiURL)
        .post("/v2/apps")
        .reply(400, {message: "Guru Meditation"});

      AppsStore.once(AppsEvents.CREATE_APP_ERROR, function (error, status) {
        expectAsync(function () {
          expect(status).to.equal(400);
        }, done);
      });

      AppsActions.createApp({
        cmd: "app command"
      });
    });

    it("handles atttribute value error", function (done) {
      nock(config.apiURL)
        .post("/v2/apps")
        .reply(422, {
          errors: [
            {
              attribute: "id",
              error: "attribute has invalid value"
            }
          ]
        });

      AppsStore.once(AppsEvents.CREATE_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(error.errors[0].attribute).to.equal("id");
          expect(error.errors[0].error).to.equal("attribute has invalid value");
        }, done);
      });

      AppsActions.createApp({
        id: "app 1"
      });
    });

    it("handles unauthorized errors gracefully", function (done) {
      nock(config.apiURL)
        .post("/v2/apps")
        .reply(401, {message: "Unauthorized access"});

      AppsStore.once(AppsEvents.CREATE_APP_ERROR, function (error, statusCode) {
        expectAsync(function () {
          expect(statusCode).to.equal(401);
        }, done);
      });

      AppsActions.createApp({id: "app 1"});
    });

  });

  describe("on app deletion", function () {
    beforeEach(function (done) {
      var nockResponse = {
        apps: [{
          id: "/app-1",
        }, {
          id: "/app-2"
        }]
      };

      nock(config.apiURL)
        .get("/v2/apps")
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });

    it("deletes an app on success", function (done) {
      // A successful response with a payload of a new delete-deployment,
      // like the API would do.
      // Indeed the payload isn't processed by the store yet.
      nock(config.apiURL)
        .delete("/v2/apps//app-1")
        .reply(200, {
          "deploymentId": "deployment-that-deletes-app",
          "version": "v1"
        });

      AppsStore.once(AppsEvents.DELETE_APP, function () {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(1);

          expect(_.where(AppsStore.apps, {
            id: "/app-1"
          })).to.be.empty;
        }, done);
      });

      AppsActions.deleteApp("/app-1");
    });

    it("receives a delete error", function (done) {
      nock(config.apiURL)
        .delete("/v2/apps//non-existing-app")
        .reply(404, {message: "delete error"});

      AppsStore.once(AppsEvents.DELETE_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
          expect(error.message).to.equal("delete error");
        }, done);
      });

      AppsActions.deleteApp("/non-existing-app");
    });

    it("handles unauthorized errors gracefully", function (done) {
      nock(config.apiURL)
        .delete("/v2/apps//app-1")
        .reply(401, {message: "Unauthorized access"});

      AppsStore.once(AppsEvents.DELETE_APP_ERROR, function (error, statusCode) {
        expectAsync(function () {
          expect(statusCode).to.equal(401);
        }, done);
      });

      AppsActions.deleteApp("/app-1");
    });

  });

  describe("on app restart", function () {

    it("restarts an app on success", function (done) {
      // A successful response with a payload of a new restart-deployment,
      // like the API would do.
      // Indeed the payload isn't processed by the store yet.
      nock(config.apiURL)
        .post("/v2/apps//app-1/restart")
        .reply(200, {
          "deploymentId": "deployment-that-restarts-app",
          "version": "v1"
        });

      AppsStore.once(AppsEvents.RESTART_APP, function () {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
        }, done);
      });

      AppsActions.restartApp("/app-1");
    });

    it("receives a restart error on non existing app", function (done) {
      nock(config.apiURL)
        .post("/v2/apps//non-existing-app/restart")
        .reply(404, {message: "restart error"});

      AppsStore.once(AppsEvents.RESTART_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
          expect(error.message).to.equal("restart error");
        }, done);
      });

      AppsActions.restartApp("/non-existing-app");
    });

    it("receives a restart error on locked app", function (done) {
      nock(config.apiURL)
        .post("/v2/apps//app-1/restart")
        .reply(409, {message: "app locked by deployment"});

      AppsStore.once(AppsEvents.RESTART_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
          expect(error.message).to.equal("app locked by deployment");
        }, done);
      });

      AppsActions.restartApp("/app-1");
    });

    it("handles unauthorized errors gracefully", function (done) {
      nock(config.apiURL)
        .post("/v2/apps//app-1/restart")
        .reply(401, {message: "Unauthorized access"});

      AppsStore.once(AppsEvents.RESTART_APP_ERROR,
          function (error, statusCode) {
        expectAsync(function () {
          expect(statusCode).to.equal(401);
        }, done);
      });

      AppsActions.restartApp("/app-1");
    });
  });

  describe("on app scale", function () {

    it("scales an app on success", function (done) {
      // A successful response with a payload of a new scale-deployment,
      // like the API would do.
      // Indeed the payload isn't processed by the store yet.
      nock(config.apiURL)
        .put("/v2/apps//app-1")
        .reply(200, {
          "deploymentId": "deployment-that-scales-app",
          "version": "v1"
        });

      AppsStore.once(AppsEvents.SCALE_APP, function () {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
        }, done);
      });

      AppsActions.scaleApp("/app-1", 10);
    });

    it("receives a scale error on non existing app", function (done) {
      nock(config.apiURL)
        .put("/v2/apps//non-existing-app")
        .reply(404, {message: "scale error"});

      AppsStore.once(AppsEvents.SCALE_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
          expect(error.message).to.equal("scale error");
        }, done);
      });

      AppsActions.scaleApp("/non-existing-app");
    });

    it("receives a scale error on bad data", function (done) {
      nock(config.apiURL)
        .put("/v2/apps//app-1")
        .reply(400, {message: "scale bad data error"});

      AppsStore.once(AppsEvents.SCALE_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
          expect(error.message).to.equal("scale bad data error");
        }, done);
      });

      AppsActions.scaleApp("/app-1", "needs a number! :P");
    });

  });

  describeWithDOM("on app apply", function () {

    before(function (done) {
      var nockResponse = {
        apps: [{
          id: "/app-1"
        }, {
          id: "/app-2"
        }]
      };

      nock(config.apiURL)
        .get("/v2/apps")
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });

    it("applies app settings on success", function (done) {
      // A successful response with a payload of a apply-settings-deployment,
      // like the API would do.
      // Indeed the payload isn't processed by the store yet.
      nock(config.apiURL)
        .put("/v2/apps//app-1")
        .reply(200, {
          "deploymentId": "deployment-that-applies-new-settings",
          "version": "v2"
        });

      AppsStore.once(AppsEvents.APPLY_APP, function () {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
        }, done);
      });

      AppsActions.applySettingsOnApp("/app-1", {
        "cmd": "sleep 10",
        "id": "/app-1",
        "instances": 15
      }, true);
    });

    it("receives an apply error on bad data", function (done) {
      nock(config.apiURL)
        .put("/v2/apps//app-1")
        .reply(400, {message: "apply bad data error"});

      AppsStore.once(AppsEvents.APPLY_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
          expect(error.message).to.equal("apply bad data error");
        }, done);
      });

      AppsActions.applySettingsOnApp("/app-1", {
        "cmd": "sleep 10",
        "id": "/app-1",
        "instances": "needs a number! :P"
      }, true);
    });

    it("it passes isEditing-flag on success", function (done) {
      // A successful response with a payload of a apply-settings-deployment,
      // like the API would do.
      // Indeed the payload isn't processed by the store yet.
      nock(config.apiURL)
        .put("/v2/apps//app-1")
        .reply(200, {
          "deploymentId": "deployment-that-applies-new-settings",
          "version": "v2"
        });

      AppsStore.once(AppsEvents.APPLY_APP, function (isEditing) {
        expectAsync(function () {
          expect(isEditing).to.be.true;
        }, done);
      });

      AppsActions.applySettingsOnApp("/app-1", {}, true);
    });

    it("it passes isEditing-flag on error", function (done) {
      nock(config.apiURL)
        .put("/v2/apps//app-1")
        .reply(400, {message: "apply bad data error"});

      AppsStore.once(AppsEvents.APPLY_APP_ERROR, function (error, isEditing) {
        expectAsync(function () {
          expect(isEditing).to.be.true;
        }, done);
      });

      AppsActions.applySettingsOnApp("/app-1", {}, true);
    });

  });

});

describeWithDOM("Groups", function () {

  var apps = [
    {id: "/app-1", instances: 1, mem: 16, cpus: 1},
    {id: "/app-2", instances: 1, mem: 16, cpus: 1},
    {id: "/group-1/app-3", instances: 1, mem: 16, cpus: 1},
    {id: "/group-1/app-4", instances: 1, mem: 16, cpus: 1},
    {id: "/group-2/app-5", instances: 1, mem: 16, cpus: 1},
    {id: "/group-2/app-6", instances: 1, mem: 16, cpus: 1},
    {id: "/group-1/group-3/app-7", instances: 1, mem: 16, cpus: 1},
    {id: "/group-1/group-3/app-8", instances: 1, mem: 16, cpus: 1}
  ];

  before(function () {
    AppDispatcher.dispatch({
      actionType: AppsEvents.REQUEST_APPS,
      data: {body: {apps: apps}}
    });

    // Ideally we should mount(AppListComponent) once here
    // and use .setProps(), but we can't:
    // TODO https://github.com/airbnb/enzyme/issues/68
  });

  it("are extrapolated from app IDs", function () {
    this.component = mount(<AppListComponent currentGroup="/" />);

    var appNames = this.component
      .find(AppListItemComponent)
      .map(appNode => appNode.find(".name-cell").text());

    expect(appNames).to.deep.equal([
      "group-1", "group-2", "app-1", "app-2"
    ]);
    this.component.instance().componentWillUnmount();
  });

  it("correctly renders in group context", function () {
    this.component = mount(<AppListComponent currentGroup="/group-1/" />);

    var appNames = this.component
      .find(AppListItemComponent)
      .map(appNode => appNode.find(".name-cell").text());

    expect(appNames).to.deep.equal([
        "group-3", "app-3", "app-4"
    ]);
    this.component.instance().componentWillUnmount();
  });

});

describe("App component", function () {

  before(function () {
    var model = {
      id: "/app-123",
      deployments: [],
      tasksRunning: 4,
      health: [],
      instances: 5,
      mem: 100,
      totalMem: 1030,
      cpus: 4,
      totalCpus: 20.0000001,
      status: 0
    };

    this.component = render(
      <AppListItemComponent model={model} currentGroup="/" />
    );
  });

  after(function () {
    this.component = null;
  });

  it("has the correct app id", function () {
    expect(this.component.find(".name-cell").text()).to.equal("app-123");
  });

  it("has the correct amount of total cpus", function () {
    expect(this.component.find(".cpu-cell").text()).to.equal("20.0");
  });

  it("has the correct amount of total memory", function () {
    var node = this.component.find(".total.ram > span");
    expect(node.get(0).attribs.title).to.equal("1030 MiB");
  });

  it("displays the correct amount memory", function () {
    expect(this.component.find(".total.ram").text()).to.equal("1 GiB");
  });

  it("has correct number of tasks and instances", function () {
    expect(this.component.find(".instances-cell").text())
      .to.equal("4 of 5");
  });

});

describe("App Health Bar", function () {

  var model = {
    id: "app-123",
    instances: 5,
    health: [
      {state: HealthStatus.HEALTHY, quantity: 2},
      {state: HealthStatus.UNHEALTHY, quantity: 2},
      {state: HealthStatus.UNKNOWN, quantity: 1},
      {state: HealthStatus.STAGED, quantity: 1},
      {state: HealthStatus.OVERCAPACITY, quantity: 2},
      {state: HealthStatus.UNSCHEDULED, quantity: 2}
    ]
  };

  before(function () {
    this.component = shallow(<AppHealthBarComponent model={model} />);
  });

  after(function () {
    this.component = null;
  });

  it("health bar for healthy tasks has correct width", function () {
    var width = this.component
      .find(".progress-bar")
      .at(0)
      .props()
      .style.width;
    expect(width).to.equal("20%");
  });

  it("health bar for unhealthy tasks has correct width", function () {
    var width = this.component
      .find(".progress-bar")
      .at(1)
      .props()
      .style.width;
    expect(width).to.equal("20%");
  });

  it("health bar for running tasks has correct width", function () {
    var width = this.component
      .find(".progress-bar")
      .at(2)
      .props()
      .style.width;
    expect(width).to.equal("10%");
  });

  it("health bar for staged tasks has correct width", function () {
    var width = this.component
      .find(".progress-bar")
      .at(3)
      .props()
      .style.width;
    expect(width).to.equal("10%");
  });

  it("health bar for over capacity tasks has correct width", function () {
    var width = this.component
      .find(".progress-bar")
      .at(4)
      .props()
      .style.width;
    expect(width).to.equal("20%");
  });

  it("health bar for unscheduled tasks has correct width", function () {
    var width = this.component
      .find(".progress-bar")
      .at(5)
      .props()
      .style.width;
    expect(width).to.equal("20%");
  });

  describe("detail", function () {

    before(function () {
      this.component = shallow(
        <AppHealthDetailComponent
          className="list-unstyled"
          fields={[
            HealthStatus.HEALTHY,
            HealthStatus.UNHEALTHY,
            HealthStatus.UNKNOWN,
            HealthStatus.STAGED,
            HealthStatus.OVERCAPACITY,
            HealthStatus.UNSCHEDULED
          ]}
          model={model} />
      );
    });

    after(function () {
      this.component = null;
    });

    it("Healthy tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-healthy")
          .text()
      ).to.equal("2 Healthy(40%)");
    });

    it("Unhealthy tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-unhealthy")
          .text()
      ).to.equal("2 Unhealthy(40%)");
    });

    it("Unknown tasks are reported correctly", function () {
      expect(
        this.component.find(".health-breakdown-item-unknown")
          .text()
      ).to.equal("1 Unknown(20%)");
    });
  });

  describeWithDOM("with tooltip", function () {
    var PopoverComponent = require("../js/components/PopoverComponent");

    before(function () {
      this.component = mount(
        <AppHealthBarWithTooltipComponent model={model}/>
      );
    });

    after(function () {
      React.unmountComponentAtNode(this.component.instance().getDOMNode());
    });

    it("has health details", function () {
      expect(this.component
        .find(AppHealthDetailComponent)
        .length
      ).to.equal(1);
    });

    it("has healthbar", function () {
      expect(this.component
        .find(AppHealthBarComponent)
        .length
      ).to.equal(1);
    });

    it("shows the tooltip on hover", function () {
      this.component.simulate("mouseOver");
      expect(this.component
        .find(PopoverComponent)
        .props()
        .visible
      ).to.be.true;
    });

  });
});

describe("App Page component", function () {

  before(function () {
    var app = Util.extendObject(appScheme, {
      id: "/test-app-1",
      healthChecks: [{path: "/", protocol: "HTTP"}],
      status: AppStatus.RUNNING,
      tasks: [
        {
          id: "test-task-1",
          appId: "/test-app-1",
          healthStatus: HealthStatus.UNHEALTHY,
          healthCheckResults: [
            {
              alive: false,
              taskId: "test-task-1"
            }
          ]
        }
      ]
    });

    AppsStore.apps = [app];

    var context = {
      router: {
        getCurrentParams: function () {
          return {
            appId: "/test-app-1"
          };
        }
      }
    };

    this.component = shallow(<AppPageComponent />, {context});
  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("gets the correct app id from the router", function () {
    expect(this.component.state("appId")).to.equal("/test-app-1");
  });

  it("returns the right health message for failing tasks", function () {
    expect(this.component
      .instance()
      .getTaskHealthMessage("test-task-1", true)
    ).to.equal("Warning: Health check 'HTTP /' failed.");
  });

  it("returns the right shorthand health message for failing tasks",
      function () {
    expect(this.component
      .instance()
      .getTaskHealthMessage("test-task-1")
    ).to.equal("Unhealthy");
  });

  it("returns the right health message for tasks with unknown health",
      function () {
    var app = Util.extendObject(appScheme, {
      id: "/test-app-1",
      status: AppStatus.RUNNING,
      tasks: [
        {
          id: "test-task-1",
          appId: "/test-app-1",
          healthStatus: HealthStatus.UNKNOWN
        }
      ]
    });

    AppsStore.apps = [app];

    expect(this.component
      .instance()
      .getTaskHealthMessage("test-task-1")
    ).to.equal("Unknown");
  });

  it("returns the right health message for healthy tasks", function () {
    var app = Util.extendObject(appScheme, {
      id: "/test-app-1",
      status: AppStatus.RUNNING,
      tasks: [
        {
          id: "test-task-1",
          appId: "/test-app-1",
          healthStatus: HealthStatus.HEALTHY
        }
      ]
    });

    AppsStore.apps = [app];

    expect(this.component
      .instance()
      .getTaskHealthMessage("test-task-1")
    ).to.equal("Healthy");
  });

  describe("on unauthorized access error", function () {

    it("has the correct fetchState", function () {

      AppsStore.once(AppsEvents.REQUEST_APPS_ERROR, function () {
        expectAsync(function () {
          expect(this.element.state.fetchState)
            .to.equal(States.STATE_UNAUTHORIZED);
        }, done);
      });

      nock(config.apiURL)
        .get("/v2/apps")
        .reply(401, {"message": "Unauthorized access"});

      AppsActions.requestApps();
    });

  });
});

describe("App Status component", function () {

  describe("on delayed status", function () {

    before(function () {
      var model = {
        id: "app-1",
        deployments: [],
        tasksRunning: 4,
        instances: 5,
        mem: 100,
        cpus: 4,
        status: AppStatus.DELAYED
      };

      QueueStore.queue = [
        {
          app: {id: "app-1"},
          delay: {timeLeftSeconds: 173}
        }
      ];

      this.component = shallow(<AppStatusComponent model={model} />);
    });

    it("has correct status description", function () {
      expect(this.component.text()).to.equal("Delayed");
    });

    it("has correct title", function () {
      var expectedTitle = "Task execution failed, delayed for 3 minutes.";
      expect(this.component.props().title).to.equal(expectedTitle);
    });
  });

  describe("on running status", function () {

    before(function () {
      var model = {
        id: "app-1",
        deployments: [],
        tasksRunning: 4,
        instances: 5,
        mem: 100,
        cpus: 4,
        status: AppStatus.RUNNING
      };

      this.component = shallow(<AppStatusComponent model={model} />);
    });

    it("has correct status description", function () {
      expect(this.component.text()).to.equal("Running");
    });
  });

});

/*
* TODO https://github.com/mesosphere/marathon/issues/2710
*
* ReactRouter.Link pre-1.0 still depends on the childContext
* https://github.com/rackt/react-router/blob/57543eb41ce45b994a29792d77c86cc10b51eac9/docs/guides/testing.md
*
* The stubRouterContext approach is incompatible with enzyme, so let's revisit
* the BreadcrumbComponent testing once we upgrade to ReactRouter 1.x
*/
describe("Breadcrumb Component", function () {
  var TestUtils = React.addons.TestUtils;
  var ShallowUtils = require("./helpers/ShallowUtils");

  before(function () {
    this.renderComponent = (group, app, task) => {
      var renderer = TestUtils.createRenderer();
      renderer.render(
        <BreadcrumbComponent groupId={group} appId={app} taskId={task} />
      );
      var component = renderer.getRenderOutput();
      renderer.unmount();
      return component;
    };
  });

  it("shows root path by default", function () {
    var component = this.renderComponent();
    var rootLink = component.props.children[0].props.children;
    expect(rootLink.props.to).to.equal("apps");
    expect(ShallowUtils.getText(rootLink)).to.equal("Applications");
  });

  it("renders group names correctly", function () {
    var component = this.renderComponent("/group-a/group-b/group-c/");
    var groupItems = component.props.children[1];
    var linkText = groupItems
      .filter((li) => !!li)
      .map((li) => ShallowUtils.getText(li.props.children));

    expect(linkText).to.deep.equal([
      "group-a", "group-b", "group-c"
    ]);
  });

  it("renders group links correctly", function () {
    var component = this.renderComponent("/group-a/group-b/group-c/");
    var groupItems = component.props.children[1];
    var linkTargets = groupItems
      .filter((li) => !!li)
      .map((li) => li.props.children.props.params.groupId);

    // routes must be URIEncoded
    expect(linkTargets).to.deep.equal([
      "%2Fgroup-a%2F",
      "%2Fgroup-a%2Fgroup-b%2F",
      "%2Fgroup-a%2Fgroup-b%2Fgroup-c%2F"
    ]);
  });

  it("shows the application, if supplied", function () {
    var component = this.renderComponent("/group-a/", "/group-a/app-1");
    var appLink = component.props.children[2].props.children;
    expect(appLink.props.to).to.equal("app");
    expect(appLink.props.params.appId).to.equal("%2Fgroup-a%2Fapp-1");
    expect(ShallowUtils.getText(appLink.props.children)).to.equal("app-1");
  });

  it("shows the task, if supplied", function () {
    var component =
      this.renderComponent("/group-a/", "/group-a/app-1", "task-1");
    var taskLink = component.props.children[3].props.children;
    expect(taskLink.props.to).to.equal("appView");
    expect(taskLink.props.params.appId).to.equal("%2Fgroup-a%2Fapp-1");
    expect(taskLink.props.params.view).to.equal("task-1");
    expect(ShallowUtils.getText(taskLink)).to.equal("task-1");
  });

});
