import {expect} from "chai";
import expectAsync from "./../helpers/expectAsync";

import JSONPUtilRequestStub from "./../stubs/JSONPUtilRequestStub";
import JSONPUtil from "../../js/helpers/JSONPUtil";
import MesosActions from "../../js/actions/MesosActions";
import MesosEvents from "../../js/events/MesosEvents";
import MesosStore from "../../js/stores/MesosStore";

describe("request state", function () {

  beforeEach(function () {
    MesosStore.resetStore();
    MesosActions.request = JSONPUtilRequestStub(
      function (url, resolve, reject) {
        switch (url) {
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
          default:
            reject({message: "error"});
            break;
        }
      });
  });

  afterEach(function () {
    MesosActions.request = JSONPUtil.request;
  });

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
