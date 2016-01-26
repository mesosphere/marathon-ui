import {expect} from "chai";
import expectAsync from "./../helpers/expectAsync";
import JSONPUtilRequestStub from "./../stubs/JSONPUtilRequestStub";

import AppDispatcher from "../../js/AppDispatcher";
import JSONPUtil from "../../js/helpers/JSONPUtil";
import MesosActions from "../../js/actions/MesosActions";
import MesosEvents from "../../js/events/MesosEvents";

describe("MesosActions", function () {

  before(function () {
    MesosActions.request = JSONPUtilRequestStub(
      function (url, resolve, reject) {
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
      });
  });

  after(function () {
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
