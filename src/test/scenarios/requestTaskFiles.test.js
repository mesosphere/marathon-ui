import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";
import JSONPUtilRequestStub from "./../stubs/JSONPUtilRequestStub";
import ajaxWrapperStub from "./../stubs/ajaxWrapperStub";

import config from "../../js/config/config";

import JSONPUtil from "../../js/helpers/JSONPUtil";
import ajaxWrapper from "../../js/helpers/ajaxWrapper";
import AppDispatcher from "../../js/AppDispatcher";
import DCOSActions from "../../js/actions/DCOSActions";
import MesosActions from "../../js/actions/MesosActions";
import MesosEvents from "../../js/events/MesosEvents";
import MesosStore from "../../js/stores/MesosStore";

describe("request task files", function () {

  beforeEach(function () {
    MesosStore.resetStore();
    MesosActions.request = JSONPUtilRequestStub(
      function (url, resolve, reject) {
        switch (url) {
          case "//mesos-master:5051/version":
            resolve({"version": "0.26.0"});
            break;
          case "//mesos-master:5051/master/state":
          case "//mesos-master:5051/master/state.json":
            resolve({
              "id": "master-id",
              "slaves": [{
                "active": true,
                "attributes": {},
                "hostname": "mesos-agent",
                "id": "task-file-test-agent-id",
                "pid": "slave(1)@mesos-agent:5051"
              }, {
                "active": true,
                "attributes": {},
                "hostname": "mesos-agent",
                "id": "wrong-file-path-test-agent-id",
                "pid": "slave(1)@mesos-agent:5051"
              }, {
                "active": true,
                "attributes": {},
                "hostname": "mesos-agent",
                "id": "wrong-framework-id-test-wrong-agent-id",
                "pid": "slave(1)@mesos-agent:5051"
              }, {
                "active": true,
                "attributes": {},
                "hostname": "mesos-agent",
                "id": "wrong-task-id-test-agent-id",
                "pid": "slave(1)@mesos-agent:5051"
              },
              {
                "active": true,
                "attributes": {},
                "hostname": "mesos-agent",
                "id": "node-url-test-agent-id",
                "pid": "slave(1)@mesos-agent:5051"
              }]
            });
            break;
          case "//mesos-agent:5051/state":
          case "//mesos-agent:5051/state.json":
            resolve({
              "frameworks": [{
                "id": "framework-id",
                "executors": [{
                  "id": "task-file-test-task-id",
                  "directory": "/file/path"
                }, {
                  "id": "wrong-file-path-test-task-id",
                  "directory": "/wrong/file/path"
                }],
                "completed_executors": [{
                  "id": "task-file-test-task-id",
                  "directory": "/file/path"
                }]
              }]
            });
            break;
          case "//mesos-agent:5051/files/browse?path=%2Ffile%2Fpath":
          case "//mesos-agent:5051/files/browse.json?path=%2Ffile%2Fpath":
            resolve([{
              "gid": "staff",
              "mode": "-rw-r--r--",
              "mtime": 1449573729,
              "nlink": 1,
              "path": "/file/path/filename",
              "size": 506,
              "uid": "user"
            }]);
            break;
          case "/slave/node-url-test-agent-id/state":
          case "/slave/node-url-test-agent-id/state.json":
            resolve({
              "frameworks": [{
                "id": "framework-id",
                "executors": [{
                  "id": "node-url-test-task-id",
                  "directory": "/file/path"
                }],
                "completed_executors": [{
                  "id": "node-url-test-task-id",
                  "directory": "/file/path"
                }]
              }]
            });
          case "/slave/node-url-test-agent-id/files/browse" +
          "?path=%2Ffile%2Fpath":
          case "/slave/node-url-test-agent-id/files/browse.json" +
          "?path=%2Ffile%2Fpath":
            resolve([{
              "gid": "staff",
              "mode": "-rw-r--r--",
              "mtime": 1449573729,
              "nlink": 1,
              "path": "/file/path/filename",
              "size": 506,
              "uid": "user"
            }]);
            break;
          default:
            reject({message: "error"});
            break;
        }
      });
    DCOSActions.request = ajaxWrapperStub(
      function (url, resolve, reject) {
        reject({message: "error"});
      }
    );
  });

  afterEach(function () {
    MesosActions.request = JSONPUtil.request;
    DCOSActions.request = ajaxWrapper;
  });

  it("updates the files data on request file success", function (done) {
    MesosStore.once(MesosEvents.CHANGE, function () {
      expectAsync(function () {
        var files = MesosStore.getTaskFiles("file-test-task-id");
        expect(files[0].path).to.equal("/file/path/filename");
      }, done);
    });

    MesosActions.requestFiles("file-test-task-id", "//mesos-agent:5051",
      "/file/path", "0.26.0");
  });

  it("provides the old download URI if the mesos version is undefined",
    function (done) {
      MesosStore.once(MesosEvents.CHANGE, function () {
        expectAsync(function () {
          var files = MesosStore.getTaskFiles("file-test-task-id");
          expect(files[0].downloadURI).to.equal("//mesos-agent:5051" +
            "/files/download.json?path=%2Ffile%2Fpath%2Ffilename");
        }, done);
      });
      AppDispatcher.dispatch({
        actionType: MesosEvents.REQUEST_VERSION_INFORMATION_COMPLETE,
        data: {}
      });
      MesosActions.requestFiles("file-test-task-id", "//mesos-agent:5051",
        "/file/path");
    }
  );

  it("provides the new download URI if the mesos version is 0.26.0",
    function (done) {
      MesosStore.once(MesosEvents.CHANGE, function () {
        expectAsync(function () {
          var files = MesosStore.getTaskFiles("file-test-task-id");
          expect(files[0].downloadURI).to.equal("//mesos-agent:5051" +
            "/files/download?path=%2Ffile%2Fpath%2Ffilename");
        }, done);
      });
      AppDispatcher.dispatch({
        actionType: MesosEvents.REQUEST_VERSION_INFORMATION_COMPLETE,
        data: {version: "0.26.0"}
      });
      MesosActions.requestFiles("file-test-task-id", "//mesos-agent:5051",
        "/file/path", "0.26.0");
    }
  );

  it("handles request files failure gracefully", function (done) {
    MesosStore.once(MesosEvents.REQUEST_FILES_ERROR, function (event) {
      expectAsync(function () {
        expect(event.error.message).to.equal("error");
      }, done);
    });

    MesosActions.requestFiles("file-test-task-id",
      "//mesos-agent:5051/fail", "/file/path", "0.26.0");
  });

  it("updates the files data on request task files success", (done) => {
    var info = {
      "frameworkId": "framework-id",
      "marathon_config": {
        "mesos_leader_ui_url": "//mesos-master:5051"
      }
    };

    nock(config.apiURL)
      .get("/v2/info")
      .reply(200, info);

    MesosStore.once(MesosEvents.REQUEST_TASK_FILES_COMPLETE, function () {
      expectAsync(function () {
        var files = MesosStore.getTaskFiles("task-file-test-task-id");
        expect(files[0].path).to.equal("/file/path/filename");
      }, done);
    });

    MesosActions.requestTaskFiles("task-file-test-agent-id",
      "task-file-test-task-id");
  });

  it("determines correct node/agent urls", function (done) {
    var info = {
      "frameworkId": "framework-id",
      "marathon_config": {
        "mesos_leader_ui_url": "//mesos-master:5051"
      }
    };

    nock(config.apiURL)
      .get("/v2/info")
      .reply(200, info);

    DCOSActions.request = ajaxWrapperStub(
      function (url, resolve, reject) {
        switch (url) {
          case "/pkgpanda/active.buildinfo.full.json":
            resolve({"build": "info"});
            break;
          default:
            reject({message: "error"});
            break;
        }
      }
    );

    MesosStore.once(MesosEvents.REQUEST_TASK_FILES_COMPLETE, function () {
      expectAsync(function () {
        var files = MesosStore.getTaskFiles("node-url-test-task-id");
        expect(files[0].path).to.equal("/file/path/filename");
      }, done);
    });

    MesosActions.requestTaskFiles("node-url-test-agent-id",
      "node-url-test-task-id");
  });

  it("handles missing framework id gracefully", function (done) {
    var agentId = "task-file-test-missing-framework-agent-id";
    var taskId = "task-file-test-missing-framework-task-id";

    var info = {
      "marathon_config": {
        "mesos_leader_ui_url": "//mesos-master:5051"
      }
    };

    nock(config.apiURL)
      .get("/v2/info")
      .reply(200, info);

    MesosStore.once(MesosEvents.REQUEST_TASK_FILES_ERROR, function (event) {
      expectAsync(function () {
        expect(event.agentId).to.equal(agentId);
        expect(event.taskId).to.equal(taskId);
      }, done);
    });

    MesosActions.requestTaskFiles(agentId, taskId);
  });

  it("handles missing mesos leader url gracefully", function (done) {
    var agentId = "task-file-test-missing-leader-url-agent-id";
    var taskId = "task-file-test-missing-leader-url-task-id";

    var info = {
      "frameworkId": "framework-id",
      "marathon_config": {}
    };

    nock(config.apiURL)
      .get("/v2/info")
      .reply(200, info);

    MesosStore.once(MesosEvents.REQUEST_TASK_FILES_ERROR, function (event) {
      expectAsync(function () {
        expect(event.agentId).to.equal(agentId);
        expect(event.taskId).to.equal(taskId);
      }, done);
    });

    MesosActions.requestTaskFiles(agentId, taskId);
  });

  it("recovers from missing framework id", function (done) {
    InfoStore.info = {
      "marathon_config": {
        "mesos_leader_ui_url": "//mesos-master:5051"
      }
    };

    nock(config.apiURL)
      .get("/v2/info")
      .reply(200, {
        "frameworkId": "framework-id",
        "marathon_config": {
          "mesos_leader_ui_url": "//mesos-master:5051"
        }
      });

    MesosStore.once(MesosEvents.REQUEST_TASK_FILES_COMPLETE, function () {
      expectAsync(function () {
        var files = MesosStore.getTaskFiles("task-file-test-task-id");
        expect(files[0].path).to.equal("/file/path/filename");
      }, done);
    });

    MesosActions.requestTaskFiles("task-file-test-agent-id",
      "task-file-test-task-id");
  });

  it("recovers from missing leader url", function (done) {
    InfoStore.info = {
      "frameworkId": "framework-id",
      "marathon_config": {}
    };

    nock(config.apiURL)
      .get("/v2/info")
      .reply(200, {
        "frameworkId": "framework-id",
        "marathon_config": {
          "mesos_leader_ui_url": "//mesos-master:5051"
        }
      });

    MesosStore.once(MesosEvents.REQUEST_TASK_FILES_COMPLETE, function () {
      expectAsync(function () {
        var files = MesosStore.getTaskFiles("task-file-test-task-id");
        expect(files[0].path).to.equal("/file/path/filename");
      }, done);
    });

    MesosActions.requestTaskFiles("task-file-test-agent-id",
      "task-file-test-task-id");
  });

  it("handles wrong framework id gracefully", function (done) {
    var agentId = "wrong-framework-id-test-wrong-agent-id";
    var taskId = "wrong-framework-id-test-wrong-task-id";

    var info = {
      "frameworkId": "wrong-framework-id",
      "marathon_config": {
        "mesos_leader_ui_url": "//mesos-master:5051"
      }
    };

    nock(config.apiURL)
      .get("/v2/info")
      .reply(200, info);

    MesosStore.once(MesosEvents.REQUEST_TASK_FILES_ERROR, function (event) {
      expectAsync(function () {
        expect(event.agentId).to.equal(agentId);
        expect(event.taskId).to.equal(taskId);
      }, done);
    });

    MesosActions.requestTaskFiles(agentId, taskId);
  });

  it("handles wrong agent id gracefully", function (done) {
    var agentId = "wrong-agent-id-test-agent-id";
    var taskId = "wrong-agent-id-test-task-id";

    MesosStore.once(MesosEvents.REQUEST_TASK_FILES_ERROR, function (event) {
      expectAsync(function () {
        expect(event.agentId).to.equal(agentId);
        expect(event.taskId).to.equal(taskId);
      }, done);
    });

    MesosActions.requestTaskFiles(agentId, taskId);
  });

  it("handles wrong task id gracefully", function (done) {
    var agentId = "wrong-task-id-test-agent-id";
    var taskId = "wrong-task-id-test-task-id";

    MesosStore.once(MesosEvents.REQUEST_TASK_FILES_ERROR, function (event) {
      expectAsync(function () {
        expect(event.agentId).to.equal(agentId);
        expect(event.taskId).to.equal(taskId);
      }, done);
    });

    MesosActions.requestTaskFiles(agentId, taskId);
  });

  it("handles wrong file path gracefully", function (done) {
    var agentId = "wrong-file-path-test-agent-id";
    var taskId = "wrong-file-path-test-task-id";

    MesosStore.once(MesosEvents.REQUEST_TASK_FILES_ERROR, function (event) {
      expectAsync(function () {
        expect(event.agentId).to.equal(agentId);
        expect(event.taskId).to.equal(taskId);
      }, done);
    });

    MesosActions.requestTaskFiles(agentId, taskId);
  });

  it("handles wrong mesos leader url gracefully", function (done) {
    var agentId = "wrong-leader-url-test-agent-id";
    var taskId = "wrong-leader-url-test-task-id";

    var info = {
      "frameworkId": "framework-id",
      "marathon_config": {
        "mesos_leader_ui_url": "//mesos-fail:5051"
      }
    };

    nock(config.apiURL)
      .get("/v2/info")
      .reply(200, info);

    MesosStore.once(MesosEvents.REQUEST_TASK_FILES_ERROR, function (event) {
      expectAsync(function () {
        expect(event.agentId).to.equal(agentId);
        expect(event.taskId).to.equal(taskId);
      }, done);
    });

    MesosActions.requestTaskFiles(agentId, taskId);
  });

});
