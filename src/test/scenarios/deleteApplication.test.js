import {expect} from "chai";
import nock from "nock";
import _ from "underscore";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import React from "react/addons";
import AppsActions from "../../js/actions/AppsActions";
import AppsEvents from "../../js/events/AppsEvents";
import AppsStore from "../../js/stores/AppsStore";

describe("Delete Application", function () {

  beforeEach(function (done) {
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

  it("deletes an app on success", function (done) {
    // A successful response with a payload of a new delete-deployment,
    // like the API would do.
    // Indeed the payload isn't processed by the store yet.
    nock(config.apiURL)
      .delete("/v2/apps//app-1")
      .reply(200, {
        "deploymentId": "deployment-that-deletes-app",
        "version": "v1"
      });

    AppsStore.once(AppsEvents.DELETE_APP, function () {
      expectAsync(function () {
        expect(AppsStore.apps).to.have.length(1);

        expect(_.where(AppsStore.apps, {
          id: "/app-1"
        })).to.be.empty;
      }, done);
    });

    AppsActions.deleteApp("/app-1");
  });

  it("receives a delete error", function (done) {
    nock(config.apiURL)
      .delete("/v2/apps//non-existing-app")
      .reply(404, {message: "delete error"});

    AppsStore.once(AppsEvents.DELETE_APP_ERROR, function (error) {
      expectAsync(function () {
        expect(AppsStore.apps).to.have.length(2);
        expect(error.message).to.equal("delete error");
      }, done);
    });

    AppsActions.deleteApp("/non-existing-app");
  });

  it("handles unauthorized errors gracefully", function (done) {
    nock(config.apiURL)
      .delete("/v2/apps//app-1")
      .reply(401, {message: "Unauthorized access"});

    AppsStore.once(AppsEvents.DELETE_APP_ERROR, function (error, statusCode) {
      expectAsync(function () {
        expect(statusCode).to.equal(401);
      }, done);
    });

    AppsActions.deleteApp("/app-1");
  });



});
