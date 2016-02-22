import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";
import minimalAppFullConfig from "../fixtures/minimalAppFullConfig";

import config from "../../js/config/config";

import React from "react/addons";
import AppVersionsActions from "../../js/actions/AppVersionsActions";
import AppVersionsEvents from "../../js/events/AppVersionsEvents";
import AppVersionsStore from "../../js/stores/AppVersionsStore";

describe("request specific application version", function () {

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

  describe("the app configuration", function () {

    it("excludes all default values", function (done) {
      nock(config.apiURL)
        .get("/v2/apps//app-id/versions/2016-01-01T00:00:00.000Z")
        .reply(200, minimalAppFullConfig);

      AppVersionsStore.once(AppVersionsEvents.CHANGE, function () {
        expectAsync(function () {
          var config = AppVersionsStore.getAppConfigVersion(
            "/app-id", "2016-01-01T00:00:00.000Z"
          );
          expect(config).to.deep.equal({
            id: "/app-id",
            cmd: "some --cmd",
            ports: [12345]
          });
        }, done);
      });

      AppVersionsActions.requestAppVersion(
        "/app-id", "2016-01-01T00:00:00.000Z"
      );
    });

    it("includes non-default values", function (done) {
      nock(config.apiURL)
        .get("/v2/apps//app-id/versions/2016-01-01T00:00:00.000Z")
        .reply(200, Object.assign({}, minimalAppFullConfig, {
          labels: {
            "testing": "123"
          }
        }));

      AppVersionsStore.once(AppVersionsEvents.CHANGE, function () {
        expectAsync(function () {
          var config = AppVersionsStore.getAppConfigVersion(
            "/app-id", "2016-01-01T00:00:00.000Z"
          );
          expect(config).to.deep.equal({
            id: "/app-id",
            cmd: "some --cmd",
            ports: [12345],
            labels: {testing: "123"}
          });
        }, done);
      });

      AppVersionsActions.requestAppVersion(
        "/app-id", "2016-01-01T00:00:00.000Z"
      );
    });

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
