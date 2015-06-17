var expect = require("chai").expect;
var _ = require("underscore");

var config = require("../js/config/config");
var AppsActions = require("../js/actions/AppsActions");
var AppsEvents = require("../js/events/AppsEvents");
var AppsStore = require("../js/stores/AppsStore");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer({
  address: "localhost",
  port: 8181
});

describe("Apps", function () {

  beforeEach(function (done) {
    this.server = server
    .setup([{
      id: "app-1"
    }, {
      id: "app-2"
    }], 200)
    .start(function () {
      AppsStore.once(AppsEvents.CHANGE, done);
      AppsActions.requestApps();
    });
    config.apiURL = "http://localhost:8181/";
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
      this.server.setup({ message: "Guru Meditation" }, 404);

      AppsStore.once(AppsEvents.REQUEST_APPS_ERROR, done);

      AppsActions.requestApps();
    });

  });

  describe("on single app request", function () {

    it("updates the AppsStore on success", function (done) {
      this.server.setup({
          "id": "/single-app"
        }, 200);

      AppsStore.once(AppsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppsStore.currentApp.id).to.equal("/single-app");
        }, done);
      });

      AppsActions.requestApp("/single-app");
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({ message: "Guru Meditation" }, 404);

      AppsStore.once(AppsEvents.REQUEST_APP_ERROR, done);

      AppsActions.requestApp("/non-existing-app");
    });

  });

});
