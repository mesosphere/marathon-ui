var expect = require("chai").expect;

var config = require("../js/config/config");

var AppDispatcher = require("../js/AppDispatcher");
var DCOSActions = require("../js/actions/DCOSActions");
var DCOSEvents = require("../js/events/DCOSEvents");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer(config.localTestserverURI);

describe("DCOS", function () {

  describe("Actions", function () {

    beforeEach(function (done) {
      this.server = server
        .setup({build: "info"}, 200)
        .start(done);
    });

    afterEach(function (done) {
      this.server.stop(done);
    });

    describe("on request build information", function () {

      it("retrieves build infotmation", function (done) {

        this.server.setup({build:"info"}, 200);

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

        this.server.setup({message:"not-found"}, 404);

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

