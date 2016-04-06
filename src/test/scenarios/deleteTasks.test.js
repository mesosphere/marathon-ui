import {expect} from "chai";
import nock from "nock";
import _ from "underscore";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import AppsActions from "../../js/actions/AppsActions";
import AppsStore from "../../js/stores/AppsStore";
import AppsEvents from "../../js/events/AppsEvents";
import TasksActions from "../../js/actions/TasksActions";
import TasksEvents from "../../js/events/TasksEvents";

describe("delete tasks", function () {

  beforeEach(function (done) {
    var nockResponse = {
      app: {
        id: "/app-1",
        tasks: [
          {
            id: "task-1",
            appId: "/app-1"
          },
          {
            id: "task-2",
            appId: "/app-1"
          }
        ]
      }
    };

    nock(config.apiURL)
      .get("/v2/apps//app-1")
      .query(true)
      .reply(200, nockResponse);

    AppsStore.once(AppsEvents.CHANGE, done);
    AppsActions.requestApp("/app-1");
  });

  it("updates the tasks data after deleting single task", function (done) {
    nock(config.apiURL)
      .post("/v2/tasks/delete")
      .reply(200, "");

    AppsStore.once(AppsEvents.CHANGE, function () {
      expectAsync(function () {
        expect(AppsStore.getCurrentApp("/app-1").tasks).to.have.length(1);
        expect(_.where(AppsStore.getCurrentApp("/app-1").tasks, {
          id: "task-1"
        })).to.be.empty;
      }, done);
    });

    TasksActions.deleteTasks("/app-1", ["task-1"]);
  });

  it("updates the tasks data after deleting multiple tasks", function (done) {
    nock(config.apiURL)
      .post("/v2/tasks/delete")
      .query({scale: "true"})
      .reply(200, "");

    AppsStore.once(AppsEvents.CHANGE, function () {
      expectAsync(function () {
        expect(AppsStore.getCurrentApp("/app-1").tasks).to.have.length(0);
      }, done);
    });

    TasksActions.deleteTasksAndScale("/app-1", ["task-1", "task-2"]);
  });

  it("handles task deleting failure gracefully", function (done) {
    nock(config.apiURL)
      .post("/v2/tasks/delete")
      .reply(404, {message: "Guru Meditation"});

    AppsStore.once(TasksEvents.DELETE_ERROR, function (error) {
      expectAsync(function () {
        expect(error.message).to.equal("Guru Meditation");
      }, done);
    });

    TasksActions.deleteTasks("/app-1", "task-3");
  });

});
