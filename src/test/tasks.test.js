var expect = require("chai").expect;
var _ = require("underscore");

var config = require("../js/config/config");
var AppsActions = require("../js/actions/AppsActions");
var AppsEvents = require("../js/events/AppsEvents");
var AppsStore = require("../js/stores/AppsStore");
var TasksActions = require("../js/actions/TasksActions");
var TasksEvents = require("../js/events/TasksEvents");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Tasks", function () {

  beforeEach(function (done) {
    this.server = server
    .setup({
      "app": {
        id: "/app-1",
        tasks: [{
          id: "task-1",
          appId: "/app-1"
        },
        {
          id: "task-2",
          appId: "/app-1"
        }]
      }
    }, 200)
    .start(function () {
      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApp("/app-1");
    });
  });

  afterEach(function (done) {
    this.server.stop(done);
  });

  describe("on task deletion", function () {

    it("updates the tasks array on success", function (done) {
      this.server.setup({
        "task": {
          "id": "task-1"
        }
      }, 200);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.tasks).to.have.length(1);
          expect(_.where(AppsStore.currentApp.tasks, {
            id: "task-1"
          })).to.be.empty;
        }, done);
      });

      TasksActions.deleteTask("/app-1", "task-1");
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({ message: "Guru Meditation" }, 404);

      AppsStore.once(TasksEvents.DELETE_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      TasksActions.deleteTask("/app-1", "task-3");
    });

  });

  describe("on task deletion and scale", function () {

    it("updates the tasks array on success", function (done) {
      this.server.setup({
        "task": {
          "id": "task-2"
        }
      }, 200);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.tasks).to.have.length(1);
          expect(_.where(AppsStore.currentApp.tasks, {
            id: "task-2"
          })).to.be.empty;
        }, done);
      });

      TasksActions.deleteTaskAndScale("/app-1", "task-2");
    });

  });

});
