var _ = require("underscore");
var expect = require("chai").expect;
var React = require("react/addons");
var ReactContext = require('react/lib/ReactContext');
var TestUtils = React.addons.TestUtils;

var config = require("../js/config/config");
var AppsActions = require("../js/actions/AppsActions");
var AppComponent = require("../js/components/AppComponent");
var AppHealthComponent = require("../js/components/AppHealthComponent");
var AppPageComponent = require("../js/components/AppPageComponent");
var AppsEvents = require("../js/events/AppsEvents");
var AppsStore = require("../js/stores/AppsStore");
var appValidator = require("../js/validators/appValidator");
var AppStatus = require("../js/constants/AppStatus");
var HealthStatus = require("../js/constants/HealthStatus");
var appScheme = require("../js/stores/appScheme");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Apps", function () {

  beforeEach(function (done) {
    this.server = server
    .setup({
      "apps": [{
        id: "/app-1"
      }, {
        id: "/app-2"
      }]
    }, 200)
    .start(function () {
      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });
  });

  afterEach(function (done) {
    this.server.stop(done);
  });

  describe("on apps request", function () {

    it("updates the AppsStore on success", function (done) {
      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
        }, done);
      });

      AppsActions.requestApps();
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      AppsStore.once(AppsEvents.REQUEST_APPS_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      AppsActions.requestApps();
    });

  });

  describe("on single app request", function () {

    it("updates the AppsStore on success", function (done) {
      this.server.setup({
        "app": {
          "id": "/single-app"
        }
      }, 200);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.id).to.equal("/single-app");
        }, done);
      });

      AppsActions.requestApp("/single-app");
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      AppsStore.once(AppsEvents.REQUEST_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      AppsActions.requestApp("/non-existing-app");
    });

  });

  describe("on app creation", function () {

    it("updates the AppsStore on success", function (done) {
      this.server.setup({
          "id": "/app-3"
        }, 201);

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
      this.server.setup({
          "id": "/app-3"
        }, 201);

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
      this.server.setup({message: "Guru Meditation"}, 400);

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
      this.server.setup({message: "Guru Meditation"}, 400);

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
      this.server.setup({
        errors: [{
            attribute: "id",
            error: "attribute has invalid value"
          }
        ]}, 422);

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

  });

  describe("on app deletion", function () {

    it("deletes an app on success", function (done) {
      // A successful response with a payload of a new delete-deployment,
      // like the API would do.
      // Indeed the payload isn't processed by the store yet.
      this.server.setup({
          "deploymentId": "deployment-that-deletes-app",
          "version": "v1"
        }, 200);

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
      this.server.setup({message: "delete error"}, 404);

      AppsStore.once(AppsEvents.DELETE_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
          expect(error.message).to.equal("delete error");
        }, done);
      });

      AppsActions.deleteApp("/non-existing-app");
    });

  });

  describe("on app restart", function () {

    it("restarts an app on success", function (done) {
      // A successful response with a payload of a new restart-deployment,
      // like the API would do.
      // Indeed the payload isn't processed by the store yet.
      this.server.setup({
          "deploymentId": "deployment-that-restarts-app",
          "version": "v1"
        }, 200);

      AppsStore.once(AppsEvents.RESTART_APP, function () {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
        }, done);
      });

      AppsActions.restartApp("/app-1");
    });

    it("receives a restart error on non existing app", function (done) {
      this.server.setup({message: "restart error"}, 404);

      AppsStore.once(AppsEvents.RESTART_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
          expect(error.message).to.equal("restart error");
        }, done);
      });

      AppsActions.restartApp("/non-existing-app");
    });

    it("receives a restart error on locked app", function (done) {
      this.server.setup({message: "app locked by deployment"}, 409);

      AppsStore.once(AppsEvents.RESTART_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
          expect(error.message).to.equal("app locked by deployment");
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
      this.server.setup({
          "deploymentId": "deployment-that-scales-app",
          "version": "v1"
        }, 200);

      AppsStore.once(AppsEvents.SCALE_APP, function () {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
        }, done);
      });

      AppsActions.scaleApp("/app-1", 10);
    });

    it("receives a scale error on non existing app", function (done) {
      this.server.setup({message: "scale error"}, 404);

      AppsStore.once(AppsEvents.SCALE_APP_ERROR, function (error) {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
          expect(error.message).to.equal("scale error");
        }, done);
      });

      AppsActions.scaleApp("/non-existing-app");
    });

    it("receives a scale error on bad data", function (done) {
      this.server.setup({message: "scale bad data error"}, 400);

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
      this.server.setup({
          "deploymentId": "deployment-that-applies-new-settings",
          "version": "v2"
        }, 200);

      AppsStore.once(AppsEvents.APPLY_APP, function () {
        expectAsync(function () {
          expect(AppsStore.apps).to.have.length(2);
        }, done);
      });

      AppsActions.applySettingsOnApp("/app-1", {
        "cmd": "sleep 10",
        "id": "/app-1",
        "instances": 15
      });
    });

    it("receives an apply error on bad data", function (done) {
      this.server.setup({message: "apply bad data error"}, 400);

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
      });
    });

  });

});

describe("App component", function () {

  beforeEach(function () {
    var model = {
      id: "app-123",
      deployments: [],
      tasksRunning: 4,
      instances: 5,
      mem: 100,
      cpus: 4,
      status: 0
    };

    this.renderer = TestUtils.createRenderer();
    this.renderer.render(<AppComponent model={model} />);
    this.component = this.renderer.getRenderOutput();
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has the correct app id", function () {
    var cellContent = this.component.props.children[0].props.children;
    expect(cellContent).to.equal("app-123");
  });

  it("has the correct amount of memory", function () {
    var cellContent = this.component.props.children[1].props.children;
    expect(cellContent).to.equal(100);
  });

  it("has the correct amount of cpus", function () {
    var cellContent = this.component.props.children[2].props.children;
    expect(cellContent).to.equal(4);
  });

  it("has correct number of tasks running", function () {
    var tasksRunning =
      this.component.props.children[3].props.children[0].props.children;
    expect(tasksRunning).to.equal(4);
  });

  it("has correct number of instances", function () {
    var totalSteps = this.component.props.children[3].props.children[2];
    expect(totalSteps).to.equal(5);
  });

  it("has correct status description", function () {
    var statusDescription =
      this.component.props.children[5].props.children.props.children;
    expect(statusDescription).to.equal("Running");
  });

});

describe("App Health component", function () {

  beforeEach(function () {
    var model = {
      id: "app-123",
      tasksRunning: 4,
      tasksHealthy: 2,
      tasksUnhealthy: 1,
      tasksStaged: 1,
      instances: 5
    };

    this.renderer = TestUtils.createRenderer();
    this.renderer.render(<AppHealthComponent model={model} />);
    this.component = this.renderer.getRenderOutput();
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("health bar for healthy tasks has correct width", function () {
    var width = this.component.props.children[0].props.style.width;
    expect(width).to.equal("40%");
  });

  it("health bar for unhealthy tasks has correct width", function () {
    var width = this.component.props.children[1].props.style.width;
    expect(width).to.equal("20%");
  });

  it("health bar for running tasks has correct width", function () {
    var width = this.component.props.children[2].props.style.width;
    expect(width).to.equal("20%");
  });

  it("health bar for staged tasks has correct width", function () {
    var width = this.component.props.children[3].props.style.width;
    expect(width).to.equal("20%");
  });

  it("health bar for over capacity tasks has correct width", function () {
    var width = this.component.props.children[4].props.style.width;
    expect(width).to.equal("0%");
  });

  it("health bar for unscheduled tasks has correct width", function () {
    var width = this.component.props.children[5].props.style.width;
    expect(width).to.equal("0%");
  });

});

describe("App validator", function () {
  beforeEach(function () {
    this.model = {
      cmd: "cmd 1",
      constraints: [["hostname", "UNIQUE"]],
      cpus: 2,
      executor: "",
      id: "app-1",
      instances: 1,
      mem: 16,
      disk: 24,
      ports: [0],
      uris: []
    };
  });

  it("should pass the app model without exception", function () {
    var errors = appValidator.validate(this.model);
    expect(errors).to.be.undefined;
  });

  it("should have invalid constraints", function () {
    this.model.constraints = [["hostname", "INVALID"]];
    var errors = appValidator.validate(this.model);
    expect(errors[0].attribute).to.equal("constraints");
  });

  it("should have invalid cpus", function () {
    this.model.cpus = "invalid string";
    var errors = appValidator.validate(this.model);
    expect(errors[0].attribute).to.equal("cpus");
  });

  it("should have invalid memory", function () {
    this.model.mem = "invalid string";
    var errors = appValidator.validate(this.model);
    expect(errors[0].attribute).to.equal("mem");
  });

  it("should have invalid disk", function () {
    this.model.disk = "invalid string";
    var errors = appValidator.validate(this.model);
    expect(errors[0].attribute).to.equal("disk");
  });

  it("should have invalid instances", function () {
    this.model.instances = "invalid string";
    var errors = appValidator.validate(this.model);
    expect(errors[0].attribute).to.equal("instances");
  });

  it("should have invalid ports if string passed", function () {
    this.model.ports = "invalid string";
    var errors = appValidator.validate(this.model);
    expect(errors[0].attribute).to.equal("ports");
  });

  it("should have invalid ports on wrong numbers", function () {
    this.model.ports = [2000, -1200];
    var errors = appValidator.validate(this.model);
    expect(errors[0].attribute).to.equal("ports");
  });

  it("should have invalid id", function () {
    this.model.id = null;
    var errors = appValidator.validate(this.model);
    expect(errors[0].attribute).to.equal("id");
  });

  it("should collect errors", function () {
    this.model.cpus = "invalid string";
    this.model.mem = "invalid string";
    this.model.disk = "invalid string";

    var errors = appValidator.validate(this.model);
    expect(errors).to.have.length(3);
    expect(errors[0].attribute).to.equal("mem");
    expect(errors[1].attribute).to.equal("cpus");
    expect(errors[2].attribute).to.equal("disk");
  });
});

describe("App Page component", function () {

  beforeEach(function () {
    var app = React.addons.update(appScheme, {$merge: {
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
    }});

    AppsStore.apps = [app];

    var context = {
      router: {
        getCurrentParams: function () {
          return {
            appid: "/test-app-1"
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
    var msg = this.element.getTaskHealthMessage("test-task-1");
    expect(msg).to.equal("Warning: Health check 'HTTP /' failed.");
  });

  it("returns the right health message for tasks with unknown health", function () {
    var app = React.addons.update(appScheme, {$merge: {
      id: "/test-app-1",
      status: AppStatus.RUNNING,
      tasks: [
        {
          id: "test-task-1",
          appId: "/test-app-1",
          healthStatus: HealthStatus.UNKNOWN,
        }
      ]
    }});

    AppsStore.apps = [app];
    var msg = this.element.getTaskHealthMessage("test-task-1");
    expect(msg).to.equal("Unknown");
  });

  it("returns the right health message for healthy tasks", function () {
    var app = React.addons.update(appScheme, {$merge: {
      id: "/test-app-1",
      status: AppStatus.RUNNING,
      tasks: [
        {
          id: "test-task-1",
          appId: "/test-app-1",
          healthStatus: HealthStatus.HEALTHY,
        }
      ]
    }});

    AppsStore.apps = [app];
    var msg = this.element.getTaskHealthMessage("test-task-1");
    expect(msg).to.equal("Healthy");
  });
});
