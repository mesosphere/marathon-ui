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

  beforeEach(function (done) {
    nock(config.apiURL)
      .get("/v2/apps")
      .reply(200, nockResponse);

    AppsStore.once(AppsEvents.CHANGE, done);
    AppsActions.requestApps();
  });

  describe("on apps request", function () {

    it("updates the AppsStore on success", function (done) {
      nock(config.apiURL)
        .get("/v2/apps")
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
        }, done);
      });

      AppsActions.requestApps();
    });

    it("calculate total resources", function (done) {
      nock(config.apiURL)
        .get("/v2/apps")
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.apps[0].totalMem).to.equal(500);
          expect(AppsStore.apps[0].totalCpus).to.equal(20);
        }, done);
      });

      AppsActions.requestApps();
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

      it("has correct health weight", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].healthWeight).to.equal(47);
          }, done);
        });

        AppsActions.requestApps();
      });

      it("has the correct app type", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].type).to.equal(AppTypes.CGROUP);
          }, done);
        });

        AppsActions.requestApps();
      });

      it("has correct health data object", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].health).to.deep.equal([
              {quantity: 2, state: HealthStatus.HEALTHY},
              {quantity: 2, state: HealthStatus.UNHEALTHY},
              {quantity: 1, state: HealthStatus.UNKNOWN},
              {quantity: 2, state: HealthStatus.STAGED},
              {quantity: 0, state: HealthStatus.OVERCAPACITY},
              {quantity: 3, state: HealthStatus.UNSCHEDULED}
            ]);
          }, done);
        });
        AppsActions.requestApps();
      });
    });

    describe("docker app", function () {

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

      it("has correct health weight", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].healthWeight).to.equal(47);
          }, done);
        });

        AppsActions.requestApps();
      });

      it("has the correct app type", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].type).to.equal("DOCKER");
          }, done);
        });

        AppsActions.requestApps();
      });

      it("has correct health data object", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].health).to.deep.equal([
              {quantity: 2, state: HealthStatus.HEALTHY},
              {quantity: 2, state: HealthStatus.UNHEALTHY},
              {quantity: 1, state: HealthStatus.UNKNOWN},
              {quantity: 2, state: HealthStatus.STAGED},
              {quantity: 0, state: HealthStatus.OVERCAPACITY},
              {quantity: 3, state: HealthStatus.UNSCHEDULED}
            ]);
          }, done);
        });
        AppsActions.requestApps();
      });
    });

    describe("basic suspended app", function () {

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

      it("has correct health weight", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].healthWeight).to.equal(0);
          }, done);
        });

        AppsActions.requestApps();
      });

      it("has correct health data object", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].health).to.deep.equal([
              {quantity: 0, state: HealthStatus.HEALTHY},
              {quantity: 0, state: HealthStatus.UNHEALTHY},
              {quantity: 0, state: HealthStatus.UNKNOWN},
              {quantity: 0, state: HealthStatus.STAGED},
              {quantity: 0, state: HealthStatus.OVERCAPACITY},
              {quantity: 0, state: HealthStatus.UNSCHEDULED}
            ]);
          }, done);
        });
        AppsActions.requestApps();
      });
    });

    describe("basic deploying app", function () {

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

      it("has correct health weight", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].healthWeight).to.equal(13);
          }, done);
        });

        AppsActions.requestApps();
      });

      it("has correct health data object", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].health).to.deep.equal([
              {quantity: 5, state: HealthStatus.HEALTHY},
              {quantity: 0, state: HealthStatus.UNHEALTHY},
              {quantity: 0, state: HealthStatus.UNKNOWN},
              {quantity: 5, state: HealthStatus.STAGED},
              {quantity: 0, state: HealthStatus.OVERCAPACITY},
              {quantity: 5, state: HealthStatus.UNSCHEDULED}
            ]);
          }, done);
        });
        AppsActions.requestApps();
      });
    });

    describe("basic app overcapacity", function () {

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

      it("has correct health weight", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].healthWeight).to.equal(16);
          }, done);
        });

        AppsActions.requestApps();
      });

      it("has correct health data object", function (done) {
        nock(config.apiURL)
          .get("/v2/apps")
          .reply(200, nockResponse);

        AppsStore.once(AppsEvents.CHANGE, function () {
          expectAsync(function () {
            expect(AppsStore.apps[0].health).to.deep.equal([
              {quantity: 0, state: HealthStatus.HEALTHY},
              {quantity: 0, state: HealthStatus.UNHEALTHY},
              {quantity: 0, state: HealthStatus.UNKNOWN},
              {quantity: 0, state: HealthStatus.STAGED},
              {quantity: 1, state: HealthStatus.OVERCAPACITY},
              {quantity: 0, state: HealthStatus.UNSCHEDULED}
            ]);
          }, done);
        });
        AppsActions.requestApps();
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

  describe("on app apply", function () {

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

describe("Groups", function () {

  beforeEach(function () {
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

    AppDispatcher.dispatch({
      actionType: AppsEvents.REQUEST_APPS,
      data: {body: {apps: apps}}
    });

    this.renderer = TestUtils.createRenderer();
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("are extrapolated from app IDs", function () {
    this.renderer.render(<AppListComponent currentGroup="/" />);
    this.component = this.renderer.getRenderOutput();
    var tbody = this.component.props.children[2];
    var trs = tbody.props.children;
    this.appNodes = trs[trs.length - 1];

    var appNodeKeys = this.appNodes.map((app) => app.key);
    expect(appNodeKeys).to.deep.equal([
      "/group-1", "/group-2", "/app-1", "/app-2"
    ]);
  });

  it("correctly renders in group context", function () {
    this.renderer.render(<AppListComponent currentGroup="/group-1/" />);
    this.component = this.renderer.getRenderOutput();
    var tbody = this.component.props.children[2];
    var trs = tbody.props.children;
    this.appNodes = trs[trs.length - 1];

    var appNodeKeys = this.appNodes.map((app) => app.key);
    expect(appNodeKeys).to.deep.equal([
      "/group-1/group-3", "/group-1/app-3", "/group-1/app-4"
    ]);
  });

});

describe("App component", function () {

  beforeEach(function () {
    var model = {
      id: "/app-123",
      deployments: [],
      tasksRunning: 4,
      instances: 5,
      mem: 100,
      totalMem: 1030,
      cpus: 4,
      totalCpus: 20.0000001,
      status: 0
    };
    this.renderer = TestUtils.createRenderer();
    this.renderer.render(
      <AppListItemComponent model={model} currentGroup="/" />
    );
    this.component = this.renderer.getRenderOutput();
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has the correct app id", function () {
    var cellContent =
      this.component.props.children[1].props.children[0].props.children;
    expect(cellContent).to.equal("app-123");
  });

  it("has the correct amount of total cpus", function () {
    var cellContent = this.component.props.children[2].props.children;
    expect(cellContent).to.equal("20.0");
  });

  it("has the correct amount of total memory", function () {
    var cellContent =
      this.component.props.children[3].props.children.props.title;
    expect(cellContent).to.equal("1030 MiB");
  });

  it("displays the correct amount memory", function () {
    var cellContent =
      this.component.props.children[3].props.children.props.children;
    expect(cellContent).to.equal("1 GiB");
  });

  it("has correct number of tasks running", function () {
    var tasksRunning =
      this.component.props.children[5].props.children[0].props.children;
    expect(tasksRunning).to.equal(4);
  });

  it("has correct number of instances", function () {
    var totalSteps = this.component.props.children[5].props.children[2];
    expect(totalSteps).to.equal(5);
  });

});

describe("App Health Bar", function () {

  beforeEach(function () {
    this.model = {
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

    this.renderer = TestUtils.createRenderer();
    this.renderer.render(<AppHealthBarComponent model={this.model} />);
    this.component = this.renderer.getRenderOutput();
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("health bar for healthy tasks has correct width", function () {
    var width = this.component.props.children[0].props.style.width;
    expect(width).to.equal("20%");
  });

  it("health bar for unhealthy tasks has correct width", function () {
    var width = this.component.props.children[1].props.style.width;
    expect(width).to.equal("20%");
  });

  it("health bar for running tasks has correct width", function () {
    var width = this.component.props.children[2].props.style.width;
    expect(width).to.equal("10%");
  });

  it("health bar for staged tasks has correct width", function () {
    var width = this.component.props.children[3].props.style.width;
    expect(width).to.equal("10%");
  });

  it("health bar for over capacity tasks has correct width", function () {
    var width = this.component.props.children[4].props.style.width;
    expect(width).to.equal("20%");
  });

  it("health bar for unscheduled tasks has correct width", function () {
    var width = this.component.props.children[5].props.style.width;
    expect(width).to.equal("20%");
  });

  describe("detail", function () {

    beforeEach(function () {
      this.renderer = TestUtils.createRenderer();
      this.renderer.render(
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
          model={this.model} />
      );
      this.content = this.renderer.getRenderOutput().props.children;
    });

    afterEach(function () {
      this.renderer.unmount();
    });

    it("Healthy tasks are reported correctly", function () {
      expect(this.content[0].props.children[1]).to.equal(2);
    });

    it("Unhealthy tasks are reported correctly", function () {
      expect(this.content[1].props.children[1]).to.equal(2);
    });

    it("Unknown tasks are reported correctly", function () {
      expect(this.content[2].props.children[1]).to.equal(1);
    });
  });

  describe("with tooltip", function () {

    beforeEach(function () {
      this.renderer = TestUtils.createRenderer();
      this.renderer.render(
        <AppHealthBarWithTooltipComponent model={this.model}/>
      );
      this.content = this.renderer.getRenderOutput().props.children;
    });

    afterEach(function () {
      this.renderer.unmount();
    });

    it("has  health details", function () {
      expect(this.content[0].props.children.type.displayName)
        .to.equal("AppHealthDetailComponent");
    });

    it("has healthbar", function () {
      expect(this.content[1].type.displayName)
        .to.equal("AppHealthBarComponent");
    });

  });

});

describe("App Page component", function () {

  beforeEach(function () {
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

    this.renderer = TestUtils.createRenderer();
    ReactContext.current = context;
    this.renderer.render(<AppPageComponent />, context);
    ReactContext.current = {};
    this.component = this.renderer.getRenderOutput();
    this.element = this.renderer._instance._instance;
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has the correct app id", function () {
    var appId = this.component.props.children[0].props.appId;
    expect(appId).to.equal("/test-app-1");
  });

  it("returns the right health message for failing tasks", function () {
    var msg = this.element.getTaskHealthMessage("test-task-1", true);
    expect(msg).to.equal("Warning: Health check 'HTTP /' failed.");
  });

  it("returns the right shorthand health message for failing tasks",
      function () {
    var msg = this.element.getTaskHealthMessage("test-task-1");
    expect(msg).to.equal("Unhealthy");
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
          healthStatus: HealthStatus.UNKNOWN,
        }
      ]
    });

    AppsStore.apps = [app];
    var msg = this.element.getTaskHealthMessage("test-task-1");
    expect(msg).to.equal("Unknown");
  });

  it("returns the right health message for healthy tasks", function () {
    var app = Util.extendObject(appScheme, {
      id: "/test-app-1",
      status: AppStatus.RUNNING,
      tasks: [
        {
          id: "test-task-1",
          appId: "/test-app-1",
          healthStatus: HealthStatus.HEALTHY,
        }
      ]
    });

    AppsStore.apps = [app];
    var msg = this.element.getTaskHealthMessage("test-task-1");
    expect(msg).to.equal("Healthy");
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

    beforeEach(function () {
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

      this.renderer = TestUtils.createRenderer();
      this.renderer.render(<AppStatusComponent model={model} />);
      this.component = this.renderer.getRenderOutput();
    });

    afterEach(function () {
      this.renderer.unmount();
    });

    it("has correct status description", function () {
      var statusDescription = this.component.props.children;
      expect(statusDescription[1]).to.equal("Delayed");
    });

    it("has correct title", function () {
      var expectedTitle = "Task execution failed, delayed for 3 minutes.";
      var title = this.component.props.title;
      expect(title).to.equal(expectedTitle);
    });
  });

  describe("on running status", function () {

    beforeEach(function () {
      var model = {
        id: "app-1",
        deployments: [],
        tasksRunning: 4,
        instances: 5,
        mem: 100,
        cpus: 4,
        status: AppStatus.RUNNING
      };

      this.renderer = TestUtils.createRenderer();
      this.renderer.render(<AppStatusComponent model={model} />);
      this.component = this.renderer.getRenderOutput();
    });

    afterEach(function () {
      this.renderer.unmount();
    });

    it("has correct status description", function () {
      var statusDescription = this.component.props.children;
      expect(statusDescription[1]).to.equal("Running");
    });
  });

});

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

