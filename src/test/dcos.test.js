import {expect} from "chai";
import nock from "nock";
import expectAsync from "./helpers/expectAsync";

import config from "../js/config/config";
import AppDispatcher from "../js/AppDispatcher";
import DCOSActions from "../js/actions/DCOSActions";
import DCOSEvents from "../js/events/DCOSEvents";

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("DCOS", function () {

  describe("Actions", function () {

    describe("on request build information", function () {

      it("retrieves build infotmation", function (done) {
        nock(config.apiURL)
          .filteringPath((path) => "/")
          .get("/")
          .reply(200, {build: "info"});

        var dispatchToken = AppDispatcher.register(function (action) {
          if (action.actionType ===
            DCOSEvents.REQUEST_BUILD_INFORMATION_COMPLETE) {
            AppDispatcher.unregister(dispatchToken);
            expectAsync(function () {
              expect(action.data.build).to.equal("info");
            }, done);
          }
        });

        DCOSActions.requestBuildInformation("http://" + server.address + ":" +
            server.port + "/");
      });

      it("handles failure gracefully", function (done) {
        nock(config.apiURL)
          .filteringPath((path) => "/")
          .get("/")
          .reply(404, {message: "not-found"});

        var dispatchToken = AppDispatcher.register(function (action) {
          if (action.actionType ===
            DCOSEvents.REQUEST_BUILD_INFORMATION_ERROR) {
            AppDispatcher.unregister(dispatchToken);
            expectAsync(function () {
              expect(action.data.body.message).to.equal("not-found");
            }, done);
          }
        });

        DCOSActions.requestBuildInformation("http://" + server.address + ":" +
            server.port + "/");
      });

    });

  });

});

