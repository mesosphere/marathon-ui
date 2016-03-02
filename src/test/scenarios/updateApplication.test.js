import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import React from "react/addons";
import AppsActions from "../../js/actions/AppsActions";
import AppsEvents from "../../js/events/AppsEvents";
import AppsStore from "../../js/stores/AppsStore";

describe("Update Application", function () {

  before(function (done) {
    var nockResponse = {
      apps: [{
        id: "/app-1"
      }, {
        id: "/app-2"
      }]
    };

    nock(config.apiURL)
      .get("/v2/groups")
      .query(true)
      .reply(200, nockResponse);

    AppsStore.once(AppsEvents.CHANGE, done);
    AppsActions.requestApps();
  });

  it("applies app settings on success", function (done) {
    // A successful response with a payload of a apply-settings-deployment,
    // like the API would do.
    // Indeed the payload isn't processed by the store yet.
    nock(config.apiURL)
      .put("/v2/apps//app-1")
      .reply(200, {
        "deploymentId": "deployment-that-applies-new-settings",
        "version": "v2"
      });

    AppsStore.once(AppsEvents.APPLY_APP, function () {
      expectAsync(function () {
        expect(AppsStore.apps).to.have.length(2);
      }, done);
    });

    AppsActions.applySettingsOnApp("/app-1", {
      "cmd": "sleep 10",
      "id": "/app-1",
      "instances": 15
    }, true);
  });

  it("receives an apply error on bad data", function (done) {
    nock(config.apiURL)
      .put("/v2/apps//app-1")
      .reply(400, {message: "apply bad data error"});

    AppsStore.once(AppsEvents.APPLY_APP_ERROR, function (error) {
      expectAsync(function () {
        expect(AppsStore.apps).to.have.length(2);
        expect(error.message).to.equal("apply bad data error");
      }, done);
    });

    AppsActions.applySettingsOnApp("/app-1", {
      "cmd": "sleep 10",
      "id": "/app-1",
      "instances": "needs a number! :P"
    }, true);
  });

  it("it passes isEditing-flag on success", function (done) {
    // A successful response with a payload of a apply-settings-deployment,
    // like the API would do.
    // Indeed the payload isn't processed by the store yet.
    nock(config.apiURL)
      .put("/v2/apps//app-1")
      .reply(200, {
        "deploymentId": "deployment-that-applies-new-settings",
        "version": "v2"
      });

    AppsStore.once(AppsEvents.APPLY_APP, function (isEditing) {
      expectAsync(function () {
        expect(isEditing).to.be.true;
      }, done);
    });

    AppsActions.applySettingsOnApp("/app-1", {}, true);
  });

  it("it passes isEditing-flag on error", function (done) {
    nock(config.apiURL)
      .put("/v2/apps//app-1")
      .reply(400, {message: "apply bad data error"});

    AppsStore.once(AppsEvents.APPLY_APP_ERROR, function (error, isEditing) {
      expectAsync(function () {
        expect(isEditing).to.be.true;
      }, done);
    });

    AppsActions.applySettingsOnApp("/app-1", {}, true);
  });

});
