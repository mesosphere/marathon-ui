import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import React from "react/addons";
import AppsActions from "../../js/actions/AppsActions";
import AppsEvents from "../../js/events/AppsEvents";
import AppsStore from "../../js/stores/AppsStore";

describe("Scale Application", function () {

  beforeEach(function (done) {
    var nockResponse = {
      apps: [{
        id: "/app-1"
      }, {
        id: "/app-2"
      }]
    };

    nock(config.apiURL)
      .get("/v2/apps")
      .reply(200, nockResponse);

    AppsStore.once(AppsEvents.CHANGE, done);
    AppsActions.requestApps();
  });

  it("scales an app on success", function (done) {
    // A successful response with a payload of a new scale-deployment,
    // like the API would do.
    // Indeed the payload isn't processed by the store yet.
    nock(config.apiURL)
      .put("/v2/apps//app-1")
      .reply(200, {
        "deploymentId": "deployment-that-scales-app",
        "version": "v1"
      });

    AppsStore.once(AppsEvents.SCALE_APP, function () {
      expectAsync(function () {
        expect(AppsStore.apps).to.have.length(2);
      }, done);
    });

    AppsActions.scaleApp("/app-1", 10);
  });

  it("receives a scale error on non existing app", function (done) {
    nock(config.apiURL)
      .put("/v2/apps//non-existing-app")
      .reply(404, {message: "scale error"});

    AppsStore.once(AppsEvents.SCALE_APP_ERROR, function (error) {
      expectAsync(function () {
        expect(AppsStore.apps).to.have.length(2);
        expect(error.message).to.equal("scale error");
      }, done);
    });

    AppsActions.scaleApp("/non-existing-app");
  });

  it("receives a scale error on bad data", function (done) {
    nock(config.apiURL)
      .put("/v2/apps//app-1")
      .reply(400, {message: "scale bad data error"});

    AppsStore.once(AppsEvents.SCALE_APP_ERROR, function (error) {
      expectAsync(function () {
        expect(AppsStore.apps).to.have.length(2);
        expect(error.message).to.equal("scale bad data error");
      }, done);
    });

    AppsActions.scaleApp("/app-1", "needs a number! :P");
  });

});
