var expect = require("chai").expect;
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var config = require("../js/config/config");
var AppVersionsActions = require("../js/actions/AppVersionsActions");
var AppVersionsEvents = require("../js/events/AppVersionsEvents");
var AppVersionsStore = require("../js/stores/AppVersionsStore");
var AppVersionListComponent = require("../js/components/AppVersionListComponent");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("AppVersions", function () {

  beforeEach(function (done) {
    this.server = server
    .setup({
      "versions": [
        "version-timestamp-1",
        "version-timestamp-2"
      ]
    }, 200)
    .start(function () {
      AppVersionsStore.once(AppVersionsEvents.CHANGE, function () {
        done();
      });
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
      this.server.setup({message: "Guru Meditation"}, 404);

      AppVersionsStore.once(AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS_ERROR,
          function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      AppVersionsActions.requestAppVersions("/non-existing-app");
    });

    it("emits requesters appId", function (done) {
      AppVersionsStore.once(AppVersionsEvents.CHANGE, function (appId) {
        expectAsync(function () {
          expect(appId).to.equal("/app-1");
        }, done);
      });

      AppVersionsActions.requestAppVersions("/app-1");
    });

    it("emits requesters appId on error", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      AppVersionsStore.once(AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS_ERROR,
          function (error, appId) {
        expectAsync(function () {
          expect(appId).to.equal("/app-1");
        }, done);
      });

      AppVersionsActions.requestAppVersions("/app-1");
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
      this.server.setup({message: "Guru Meditation"}, 404);

      AppVersionsStore.once(AppVersionsEvents.REQUEST_ONE_ERROR,
          function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      AppVersionsActions.requestAppVersion("/app-1", "non-existing-version");
    });

    it("emits requesters version timestamp", function (done) {
      AppVersionsStore.once(AppVersionsEvents.CHANGE,
          function (versionTimestamp) {
        expectAsync(function () {
          expect(versionTimestamp).to.equal("version-timestamp-1");
        }, done);
      });

      AppVersionsActions.requestAppVersion("/app-1", "version-timestamp-1");
    });

    it("emits requesters version timestamp on error", function (done) {
      this.server.setup({message: "Guru Meditation"}, 404);

      AppVersionsStore.once(AppVersionsEvents.REQUEST_ONE_ERROR,
          function (error, versionTimestamp) {
        expectAsync(function () {
          expect(versionTimestamp).to.equal("version-timestamp-1");
        }, done);
      });

      AppVersionsActions.requestAppVersion("/app-1", "version-timestamp-1");
    });

  });

});

describe("App Version List component", function () {

  beforeEach(function () {
    AppVersionsStore.currentAppId = "/app-test";
    AppVersionsStore.availableAppVersions = [
      "2015-06-29T13:54:01.577Z",
      "2015-06-29T13:02:29.615Z",
      "2015-06-29T13:02:19.363Z"
    ];

    this.renderer = TestUtils.createRenderer();

    this.renderer.render(<AppVersionListComponent
      appId={"/app-test"} />);

    this.component = this.renderer.getRenderOutput();
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has correct AppVersionListItemComponents", function () {
    var items =
      this.component.props.children[2].props.children[1].props.children[2];

    // First version is sliced out as current version,
    // so that are only 2 versions here
    expect(items.length).to.equal(2);
    expect(items[0].key).to.equal("2015-06-29T13:02:29.615Z");
    expect(items[1].key).to.equal("2015-06-29T13:02:19.363Z");
  });

});
