var describeWithDOM = require("enzyme").describeWithDOM;
var expect = require("chai").expect;
var expectAsync = require("./helpers/expectAsync");
var mount = require("enzyme").mount;
var nock = require("nock");

var React = require("react/addons");

var config = require("../js/config/config");
var AppVersionsActions = require("../js/actions/AppVersionsActions");
var AppVersionsEvents = require("../js/events/AppVersionsEvents");
var AppVersionsStore = require("../js/stores/AppVersionsStore");
var AppVersionComponent = require("../js/components/AppVersionComponent");
var AppVersionListComponent =
  require("../js/components/AppVersionListComponent");
var AppVersionListItemComponent =
  require("../js/components/AppVersionListItemComponent");

var server = config.localTestserverURI;
config.apiURL = `http://${server.address}:${server.port}/`;

describe("AppVersions", function () {

  beforeEach(function () {
    nock(config.apiURL)
      .get("/v2/apps//app-1/versions")
      .reply(200, {
        "versions": [
          "version-timestamp-1",
          "version-timestamp-2"
        ]
      });
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

      AppVersionsStore.once(AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS_ERROR,
          function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      nock.cleanAll();
      nock(config.apiURL)
        .get("/v2/apps//non-existing-app/versions")
        .reply(404, {"message": "Guru Meditation"});

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
      nock.cleanAll();
      nock(config.apiURL)
        .get("/v2/apps//app-1/versions")
        .reply(404, {"message": "Guru Meditation"});

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

      AppVersionsStore.once(AppVersionsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppVersionsStore.appVersions["version-timestamp-1"].id)
            .to.equal("/app-1");
          expect(AppVersionsStore.appVersions["version-timestamp-1"].version)
            .to.equal("version-timestamp-1");
        }, done);
      });

      nock(config.apiURL)
        .get("/v2/apps//app-1/versions/version-timestamp-1")
        .reply(200, {
          "id": "/app-1",
          "version": "version-timestamp-1"
        });

      AppVersionsActions.requestAppVersion("/app-1", "version-timestamp-1");
    });

    it("matches the current app id", function (done) {
      AppVersionsStore.once(AppVersionsEvents.CHANGE, function () {
        expectAsync(function () {
          expect(AppVersionsStore.currentAppId).to.equal("/app-1");
        }, done);
      });

      nock(config.apiURL)
        .get("/v2/apps//app-1/versions/version-timestamp-1")
        .reply(200, {
          "id": "/app-1",
          "version": "version-timestamp-1"
        });

      AppVersionsActions.requestAppVersion("/app-1", "version-timestamp-1");
    });

    it("handles failure gracefully", function (done) {
      AppVersionsStore.once(AppVersionsEvents.REQUEST_ONE_ERROR,
          function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      nock(config.apiURL)
        .get("/v2/apps//app-1/versions/non-existing-version")
        .reply(404, {"message": "Guru Meditation"});

      AppVersionsActions.requestAppVersion("/app-1", "non-existing-version");
    });

    it("emits requesters version timestamp", function (done) {
      AppVersionsStore.once(AppVersionsEvents.CHANGE,
          function (versionTimestamp) {
        expectAsync(function () {
          expect(versionTimestamp).to.equal("version-timestamp-1");
        }, done);
      });

      nock(config.apiURL)
        .get("/v2/apps//app-1/versions/version-timestamp-1")
        .reply(200, {
          "id": "/app-1",
          "version": "version-timestamp-1"
        });

      AppVersionsActions.requestAppVersion("/app-1", "version-timestamp-1");
    });

    it("emits requesters version timestamp on error", function (done) {

      AppVersionsStore.once(AppVersionsEvents.REQUEST_ONE_ERROR,
          function (error, versionTimestamp) {
        expectAsync(function () {
          expect(versionTimestamp).to.equal("version-timestamp-1");
        }, done);
      });

      nock(config.apiURL)
        .get("/v2/apps//app-1/versions/version-timestamp-1")
        .reply(404, {"message": "Guru Meditation"});

      AppVersionsActions.requestAppVersion("/app-1", "version-timestamp-1");
    });

  });

});

describeWithDOM("App Version List component", function () {

  before(function () {
    AppVersionsStore.currentAppId = "/app-test";
    AppVersionsStore.availableAppVersions = [
      "2015-06-29T13:54:01.577Z",
      "2015-06-29T13:02:29.615Z",
      "2015-06-29T13:02:19.363Z"
    ];

    this.component = mount(<AppVersionListComponent appId={"/app-test"} />);
  });

  after(function () {
    this.component.component.getInstance().componentWillUnmount();
  });

  it("has correct AppVersionListItemComponents", function () {
    var items = this.component.find(AppVersionListItemComponent);

    // First version is sliced out as current version,
    // so that are only 2 versions here
    expect(items.length).to.equal(2);
    expect(items.first().prop("appVersionTimestamp"))
      .to.equal("2015-06-29T13:02:29.615Z");
    expect(items.at(1).prop("appVersionTimestamp"))
      .to.equal("2015-06-29T13:02:19.363Z");
  });

});

describeWithDOM("App Version component", function () {

  before(function () {
    this.model = {
      "id": "/sleep10",
      "cmd": "sleep 10",
      "args": null,
      "user": "testuser",
      "env": {},
      "instances": 14,
      "ipAddress": {
        "groups": ["dev"],
        "labels": {
          "pool": "127.0.0.1/24"
        },
        "discovery": {
          "ports": [
            {"number": 80, "name": "http", "protocol": "tcp"}
          ]
        }
      },
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
      "acceptedResourceRoles": [],
      "version": "2015-06-29T12:57:02.269Z"
    };

    this.component = mount(<AppVersionComponent appVersion={this.model} />);
    this.table = this.component.find("dl.dl-horizontal");
    this.rows = this.table.children();
  });

  after(function () {
    this.component.component.getInstance().componentWillUnmount();
  });

  it("shows the app ID", function () {
    expect(this.rows.at(1).text().trim()).to.equal("/sleep10");
  });

  it("has correct command", function () {
    expect(this.rows.at(3).text().trim()).to.equal("sleep 10");
  });

  it("has correct constraints", function () {
    expect(this.rows.at(5).text().trim()).to.equal("Unspecified");
  });

  it("has correct dependencies", function () {
    expect(this.rows.at(7).text().trim()).to.equal("Unspecified");
  });

  it("has correct labels", function () {
    expect(this.rows.at(9).text().trim()).to.equal("Unspecified");
  });

  it("has correct accepted resource roles", function () {
    expect(this.rows.at(11).text().trim()).to.equal("Unspecified");
  });

  it("has correct container", function () {
    expect(this.rows.at(13).text().trim()).to.equal("Unspecified");
  });

  it("has correct cpus", function () {
    expect(this.rows.at(15).text().trim()).to.equal("0.1");
  });

  it("has correct environment", function () {
    expect(this.rows.at(17).text().trim()).to.equal("Unspecified");
  });

  it("has correct executor", function () {
    expect(this.rows.at(19).text().trim()).to.equal("Unspecified");
  });

  it("has correct health checks", function () {
    var healthChecks = this.rows.at(21).text().trim();
    expect(healthChecks).to.equal(
      JSON.stringify(this.model.healthChecks, null, 2)
    );
  });

  it("has correct number of instances", function () {
    expect(this.rows.at(23).text().trim()).to.equal("14");
  });

  it("has correct ip address", function () {
    var ipAddress = this.rows.at(25).text().trim();
    expect(ipAddress).to.equal(
      JSON.stringify(this.model.ipAddress, null, 2)
    );
  });

  it("has correct amount of memory", function () {
    var children = this.rows.at(27).props().children;
    expect(children[0]).to.equal(16.0);
    expect(children[2]).to.equal("MiB");
  });

  it("has correct amount of disk space", function () {
    var children = this.rows.at(29).props().children;
    expect(children[0]).to.equal(0.0);
    expect(children[2]).to.equal("MiB");
  });

  it("has correct ports", function () {
    var children = this.rows.at(31).props().children;
    expect(children).to.equal("10000, 10001");
  });

  it("has correct backoff factor", function () {
    var children = this.rows.at(33).props().children;
    expect(children[0]).to.equal(1.15);
  });

  it("has correct backoff", function () {
    var children = this.rows.at(35).props().children;
    expect(children[0]).to.equal(1);
    expect(children[2]).to.equal("seconds");
  });

  it("has correct max launch delay", function () {
    var children = this.rows.at(37).props().children;
    expect(children[0]).to.equal(3600);
    expect(children[2]).to.equal("seconds");
  });

  it("has correct URIs", function () {
    expect(this.rows.at(39).text().trim()).to.equal("Unspecified");
  });

  it("has correct User", function () {
    expect(this.rows.at(41).props().children[0]).to.equal("testuser");
  });

  it("has correct version", function () {
    expect(this.rows.at(43).props().children[0])
      .to.equal("2015-06-29T12:57:02.269Z");
  });

});
