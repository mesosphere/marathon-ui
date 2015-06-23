var expect = require("chai").expect;

var config = require("../js/config/config");
var AppVersionsActions = require("../js/actions/AppVersionsActions");
var AppVersionsEvents = require("../js/events/AppVersionsEvents");
var AppVersionsStore = require("../js/stores/AppVersionsStore");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("AppVersions", function () {

  beforeEach(function (done) {
    this.server = server
    .setup([
      "version-timestamp-1",
      "version-timestamp-2"
    ], 200)
    .start(function () {
      AppVersionsStore.once(AppVersionsEvents.CHANGE, done);
      AppVersionsActions.requestAppVersions("/app-1");
    });
  });

  afterEach(function (done) {
    this.server.stop(done);
  });

  describe("on app versions request", function () {

    it("updates the AppVersionsStore on success", function (done) {
      AppVersionsStore.once(AppVersionsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppVersionsStore.availableAppVersions).to.have.length(2);
          expect(AppVersionsStore.availableAppVersions[0])
            .to.equal("version-timestamp-1");
        }, done);
      });

      AppVersionsActions.requestAppVersions("/app-1");
    });

    it("matches the current app id", function (done) {
      AppVersionsStore.once(AppVersionsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppVersionsStore.currentAppId).to.equal("/app-1");
        }, done);
      });

      AppVersionsActions.requestAppVersions("/app-1");
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({ message: "Guru Meditation" }, 404);

      AppVersionsStore.once(AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      AppVersionsActions.requestAppVersions("/non-existing-app");
    });

  });

  describe("on single app version request", function () {

    it("updates the AppVersionsStore on success", function (done) {
      this.server.setup({
        "id": "/app-1",
        "version": "version-timestamp-1"
      }, 200);

      AppVersionsStore.once(AppVersionsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppVersionsStore.appVersions["version-timestamp-1"].id)
            .to.equal("/app-1");
          expect(AppVersionsStore.appVersions["version-timestamp-1"].version)
            .to.equal("version-timestamp-1");
        }, done);
      });

      AppVersionsActions.requestAppVersion("/app-1", "version-timestamp-1");
    });

    it("matches the current app id", function (done) {
      AppVersionsStore.once(AppVersionsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppVersionsStore.currentAppId).to.equal("/app-1");
        }, done);
      });

      AppVersionsActions.requestAppVersion("/app-1", "version-timestamp-1");
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({ message: "Guru Meditation" }, 404);

      AppVersionsStore.once(AppVersionsEvents.REQUEST_ONE_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      AppVersionsActions.requestAppVersion("/app-1", "non-existing-version");
    });

  });

});
