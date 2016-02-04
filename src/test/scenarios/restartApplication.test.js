import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import React from "react/addons";
import AppsActions from "../../js/actions/AppsActions";
import AppsEvents from "../../js/events/AppsEvents";
import AppsStore from "../../js/stores/AppsStore";

describe("Restart Application", function () {

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

  it("restarts an app on success", function (done) {
    // A successful response with a payload of a new restart-deployment,
    // like the API would do.
    // Indeed the payload isn't processed by the store yet.
    nock(config.apiURL)
      .post("/v2/apps//app-1/restart")
      .reply(200, {
        "deploymentId": "deployment-that-restarts-app",
        "version": "v1"
      });

    AppsStore.once(AppsEvents.RESTART_APP, function () {
      expectAsync(function () {
        expect(AppsStore.getApps()).to.have.length(2);
      }, done);
    });

    AppsActions.restartApp("/app-1");
  });

  it("receives a restart error on non existing app", function (done) {
    nock(config.apiURL)
      .post("/v2/apps//non-existing-app/restart")
      .reply(404, {message: "restart error"});

    AppsStore.once(AppsEvents.RESTART_APP_ERROR, function (error) {
      expectAsync(function () {
        expect(AppsStore.getApps()).to.have.length(2);
        expect(error.message).to.equal("restart error");
      }, done);
    });

    AppsActions.restartApp("/non-existing-app");
  });

  it("receives a restart error on locked app", function (done) {
    nock(config.apiURL)
      .post("/v2/apps//app-1/restart")
      .reply(409, {message: "app locked by deployment"});

    AppsStore.once(AppsEvents.RESTART_APP_ERROR, function (error) {
      expectAsync(function () {
        expect(AppsStore.getApps()).to.have.length(2);
        expect(error.message).to.equal("app locked by deployment");
      }, done);
    });

    AppsActions.restartApp("/app-1");
  });

  it("handles unauthorized errors gracefully", function (done) {
    nock(config.apiURL)
      .post("/v2/apps//app-1/restart")
      .reply(401, {message: "Unauthorized access"});

    AppsStore.once(AppsEvents.RESTART_APP_ERROR,
      function (error, statusCode) {
        expectAsync(function () {
          expect(statusCode).to.equal(401);
        }, done);
      });

    AppsActions.restartApp("/app-1");
  });
});
