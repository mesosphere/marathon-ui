var _ = require("underscore");
var expect = require("chai").expect;
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var config = require("../js/config/config");

var AppDispatcher = require("../js/AppDispatcher");
var JSONPUtil = require("../js/helpers/JSONPUtil");
var InfoStore = require("../js/stores/InfoStore");
var MesosActions = require("../js/actions/MesosActions");
var MesosStore = require("../js/stores/MesosStore");
var MesosEvents = require("../js/events/MesosEvents");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var marathon = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + marathon.address + ":" + marathon.port + "/";

describe("Mesos", function () {

  describe("Actions", function () {

    beforeEach(function () {
      MesosStore._resetStore();
      MesosActions.request = function (url) {
        return new Promise(function (resolve, reject) {
          switch (url) {
            case "//mesos-master:5051/version":
              resolve({"version": "0.26.0"});
              break;
            case "//mesos-master:5051/master/state":
              resolve({"id": "new-mesos-id"});
              break;
            case "//mesos-master:5051/master/state.json":
              resolve({"id": "old-mesos-id"});
              break;
            case "//mesos-agent:5051/files/browse?path=%2Ffile%2Fpath":
              resolve([{
                "path": "/file/path/filename",
                "uid": "new-version-user"
              }]);
              break;
            case "//mesos-agent:5051/files/browse.json?path=%2Ffile%2Fpath":
              resolve([{
                "path": "/file/path/filename",
                "uid": "old-version-user"
              }]);
              break;
            default:
              reject({message: "error"});
              break;
          }
        })
      };
    });

    afterEach(function () {
      MesosActions.request = JSONPUtil.request;
    });

    describe("on request version information", function () {

      it("retrieves version", function (done) {
        var dispatchToken = AppDispatcher.register(function (action) {
          if (action.actionType ===
            MesosEvents.REQUEST_VERSION_INFORMATION_COMPLETE) {
            AppDispatcher.unregister(dispatchToken);
            expectAsync(function () {
              expect(action.data.version).to.equal("0.26.0");

            }, done);
          }
        });
        MesosActions.requestVersionInformation("//mesos-master:5051");
      });

      it("handles failure gracefully", function (done) {
        var dispatchToken = AppDispatcher.register(function (action) {
          if (action.actionType ===
            MesosEvents.REQUEST_VERSION_INFORMATION_ERROR) {
            AppDispatcher.unregister(dispatchToken);
            expectAsync(function () {
              expect(action.data.error.message).to.equal("error");
            }, done);
          }
        });
        MesosActions.requestVersionInformation("//mesos-master:5051/fail");
      });

    });

    describe("on request state", function () {

      it("uses old state route if no version is defined", function (done) {
        var dispatchToken = AppDispatcher.register(function (action) {
          if (action.actionType === MesosEvents.REQUEST_STATE_COMPLETE) {
            AppDispatcher.unregister(dispatchToken);
            expectAsync(function () {
              expect(action.data.state.id).to.equal("old-mesos-id");

            }, done);
          }
        });
        MesosActions.requestState("request-id-old",
          "//mesos-master:5051/master");
      });

      it("uses new state route if mesos version is 0.26.0", function (done) {
        var dispatchToken = AppDispatcher.register(function (action) {
          if (action.actionType === MesosEvents.REQUEST_STATE_COMPLETE) {
            AppDispatcher.unregister(dispatchToken);
            expectAsync(function () {
              expect(action.data.state.id).to.equal("new-mesos-id");

            }, done);
          }
        });
        MesosActions.requestState("request-id-new",
          "//mesos-master:5051/master", "0.26.0");
      });

      it("handles failure gracefully", function (done) {
        var dispatchToken = AppDispatcher.register(function (action) {
          if (action.actionType === MesosEvents.REQUEST_STATE_ERROR) {
            AppDispatcher.unregister(dispatchToken);
            expectAsync(function () {
              expect(action.data.error.message).to.equal("error");
            }, done);
          }
        });
        MesosActions.requestState("request-id-fail", "//mesos-master:5051/fail",
          "0.26.0");
      });

    });

    describe("on request files", function () {

      it("encodes and appends file path correctly", function (done) {
        var dispatchToken = AppDispatcher.register(function (action) {
          if (action.actionType === MesosEvents.REQUEST_FILES_COMPLETE) {
            AppDispatcher.unregister(dispatchToken);
            expectAsync(function () {
              expect(action.data.files[0].path)
                .to.equal("/file/path/filename");
            }, done);
          }
        });
        MesosActions.requestFiles("request-id-old",
          "//mesos-agent:5051", "/file/path");
      });

      it("uses old browse files route if no version is defined",
        function (done) {
          var dispatchToken = AppDispatcher.register(function (action) {
            if (action.actionType === MesosEvents.REQUEST_FILES_COMPLETE) {
              AppDispatcher.unregister(dispatchToken);
              expectAsync(function () {
                expect(action.data.files[0].uid).to.equal("old-version-user");
              }, done);
            }
          });
          MesosActions.requestFiles("request-id-old", "//mesos-agent:5051",
            "/file/path");
        }
      );

      it("uses new browse files route if mesos version is 0.26.0",
        function (done) {
          var dispatchToken = AppDispatcher.register(function (action) {
            if (action.actionType === MesosEvents.REQUEST_FILES_COMPLETE) {
              AppDispatcher.unregister(dispatchToken);
              expectAsync(function () {
                expect(action.data.files[0].uid).to.equal("new-version-user");
              }, done);
            }
          });
          MesosActions.requestFiles("request-id-old", "//mesos-agent:5051",
            "/file/path", "0.26.0");
        }
      );

      it("passes host param along", function (done) {
        var dispatchToken = AppDispatcher.register(function (action) {
          if (action.actionType === MesosEvents.REQUEST_FILES_COMPLETE) {
            AppDispatcher.unregister(dispatchToken);
            expectAsync(function () {
              expect(action.data.host).to.equal("//mesos-agent:5051");
            }, done);
          }
        });
        MesosActions.requestFiles("request-id-old",
          "//mesos-agent:5051", "/file/path");
      });

      it("handles failure gracefully", function (done) {
        var dispatchToken = AppDispatcher.register(function (action) {
          if (action.actionType === MesosEvents.REQUEST_FILES_ERROR) {
            AppDispatcher.unregister(dispatchToken);
            expectAsync(function () {
              expect(action.data.error.message).to.equal("error");
            }, done);
          }
        });
        MesosActions.requestFiles("request-id-fail", "//mesos-agent:5051/fail");
      });

    });

  });

  describe("Store", function () {

    beforeEach(function () {
      MesosStore._resetStore();
      MesosActions.request = function (url) {
        return new Promise(function (resolve, reject) {
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
            default:
              reject({message: "error"});
              break;
          }

        })
      };
    });

    afterEach(function () {
      MesosActions.request = JSONPUtil.request;
    });

    describe("on request state", function () {

      it("updates the state data on success", function (done) {
        MesosStore.once(MesosEvents.CHANGE, function () {
          expectAsync(function () {
            var state = MesosStore.getState("master");
            expect(state.id).to.equal("master-id");
          }, done);
        });

        MesosActions.requestState("master", "//mesos-master:5051/master",
          "0.26.0");
      });

      it("handles failure gracefully", function (done) {
        MesosStore.once(MesosEvents.REQUEST_STATE_ERROR, function (event) {
          expectAsync(function () {
            expect(event.error.message).to.equal("error");
          }, done);
        });

        MesosActions.requestState("master", "//mesos-master:5051/fail",
          "0.26.0");
      });

    });

    describe("on request files", function () {

      it("updates the files data on success", function (done) {
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

      it("handles failure gracefully", function (done) {
        MesosStore.once(MesosEvents.REQUEST_FILES_ERROR, function (event) {
          expectAsync(function () {
            expect(event.error.message).to.equal("error");
          }, done);
        });

        MesosActions.requestFiles("file-test-task-id",
          "//mesos-agent:5051/fail", "/file/path", "0.26.0");
      });

    });

    describe("on request task files", function () {

      beforeEach(function () {
        InfoStore.info = {
          "frameworkId": "framework-id",
          "marathon_config": {
            "mesos_leader_ui_url": "//mesos-master:5051"
          }
        };
      });

      it("updates the files data on success", function () {
        MesosStore.once(MesosEvents.CHANGE, function () {
          expectAsync(function () {
            var files = MesosStore.getTaskFiles("task-id");
            expect(files[0].path).to.equal("/file/path/stderr");
          }, done);
        });
        MesosActions.requestTaskFiles("task-file-test-agent-id",
          "task-file-test-task-id");
      });

      it("handles missing framework id gracefully", function (done) {
        var agentId = "task-file-test-missing-framework-agent-id";
        var taskId = "task-file-test-missing-framework-task-id";

        InfoStore.info = {
          "marathon_config": {
            "mesos_leader_ui_url": "//mesos-master:5051"
          }
        };

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

        InfoStore.info = {
          "frameworkId": "framework-id",
          "marathon_config": {}
        };

        MesosStore.once(MesosEvents.REQUEST_TASK_FILES_ERROR, function (event) {
          expectAsync(function () {
            expect(event.agentId).to.equal(agentId);
            expect(event.taskId).to.equal(taskId);
          }, done);
        });

        MesosActions.requestTaskFiles(agentId, taskId);
      });

      it("handles wrong framework id gracefully", function (done) {
        var agentId = "wrong-framework-id-test-wrong-agent-id";
        var taskId = "wrong-framework-id-test-wrong-task-id";

        InfoStore.info = {
          "frameworkId": "wrong-framework-id",
          "marathon_config": {
            "mesos_leader_ui_url": "//mesos-master:5051"
          }
        };

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

        InfoStore.info = {
          "frameworkId": "framework-id",
          "marathon_config": {
            "mesos_leader_ui_url": "//mesos-fail:5051"
          }
        };

        MesosStore.once(MesosEvents.REQUEST_TASK_FILES_ERROR, function (event) {
          expectAsync(function () {
            expect(event.agentId).to.equal(agentId);
            expect(event.taskId).to.equal(taskId);
          }, done);
        });

        MesosActions.requestTaskFiles(agentId, taskId);
      });

    });

  });

});

