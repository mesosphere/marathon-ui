var expect = require("chai").expect;
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var config = require("../js/config/config");
var AppVersionsActions = require("../js/actions/AppVersionsActions");
var AppVersionsEvents = require("../js/events/AppVersionsEvents");
var AppVersionsStore = require("../js/stores/AppVersionsStore");
var AppVersionComponent = require("../js/components/AppVersionComponent");
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

describe("App Version component", function () {

  beforeEach(function () {
    this.model = {
      "id": "/sleep10",
      "cmd": "sleep 10",
      "args": null,
      "user": null,
      "env": {},
      "instances": 14,
      "cpus": 0.1,
      "mem": 16.0,
      "disk": 0.0,
      "executor": "",
      "constraints": [],
      "uris": [],
      "storeUrls": [],
      "ports": [10000, 10001],
      "requirePorts": false,
      "backoffSeconds": 1,
      "backoffFactor": 1.15,
      "maxLaunchDelaySeconds": 3600,
      "container": null,
      "healthChecks": [{
        "path": "/",
        "protocol": "HTTP",
        "portIndex": 0,
        "gracePeriodSeconds": 30,
        "intervalSeconds": 30,
        "timeoutSeconds": 30,
        "maxConsecutiveFailures": 3,
        "ignoreHttp1xx": false
      }],
      "dependencies": [],
      "upgradeStrategy": {
        "minimumHealthCapacity": 1.0,
        "maximumOverCapacity": 1.0
      },
      "labels": {},
      "acceptedResourceRoles": null,
      "version": "2015-06-29T12:57:02.269Z"
    };

    this.renderer = TestUtils.createRenderer();
    this.renderer.render(<AppVersionComponent
      appVersion={this.model} />);
    this.component = this.renderer.getRenderOutput();
    this.table = this.component.props.children[2].props.children;
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has correct command", function () {
    expect(this.table[1].props.children[0]).to.equal("sleep 10");
  });

  it("has correct constraints", function () {
    expect(this.table[3].type.displayName).to.equal("UnspecifiedNodeComponent");
  });

  it("has correct container", function () {
    expect(this.table[5].type.displayName).to.equal("UnspecifiedNodeComponent");
  });

  it("has correct cpus", function () {
    expect(this.table[7].props.children[0]).to.equal(0.1);
  });

  it("has correct environment", function () {
    expect(this.table[9].type.displayName).to.equal("UnspecifiedNodeComponent");
  });

  it("has correct executor", function () {
    expect(this.table[11].type.displayName).to.equal("UnspecifiedNodeComponent");
  });

  it("has correct health checks", function () {
    var healthChecks = this.table[13].props.children.props.children;
    expect(healthChecks).to.equal(
      JSON.stringify(this.model.healthChecks, null, 2)
    );
  });

  it("has correct number of instances", function () {
    expect(this.table[15].props.children[0]).to.equal(14);
  });

  it("has correct amount of memory", function () {
    expect(this.table[17].props.children[0]).to.equal(16.0);
    expect(this.table[17].props.children[2]).to.equal("MB");
  });

  it("has correct amount of disk space", function () {
    expect(this.table[19].props.children[0]).to.equal(0.0);
    expect(this.table[19].props.children[2]).to.equal("MB");
  });

  it("has correct ports", function () {
    expect(this.table[21].props.children).to.equal("10000,10001");
  });

  it("has correct backoff factor", function () {
    expect(this.table[23].props.children[0]).to.equal(1.15);
  });

  it("has correct backoff", function () {
    expect(this.table[25].props.children[0]).to.equal(1);
    expect(this.table[25].props.children[2]).to.equal("seconds");
  });

  it("has correct max launch delay", function () {
    expect(this.table[27].props.children[0]).to.equal(3600);
    expect(this.table[27].props.children[2]).to.equal("seconds");
  });

  it("has correct URIs", function () {
    expect(this.table[29].type.displayName).to.equal("UnspecifiedNodeComponent");
  });

  it("has correct version", function () {
    expect(this.table[31].props.children[0]).to.equal("2015-06-29T12:57:02.269Z");
  });

});
