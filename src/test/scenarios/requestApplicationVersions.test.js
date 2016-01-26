import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import React from "react/addons";
import AppVersionsActions from "../../js/actions/AppVersionsActions";
import AppVersionsEvents from "../../js/events/AppVersionsEvents";
import AppVersionsStore from "../../js/stores/AppVersionsStore";

describe("request application versions", function () {

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
