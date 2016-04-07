import {expect} from "chai";
import nock from "nock";
import _ from "underscore";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import appScheme from "../../js/stores/schemes/appScheme";
import DeploymentActions from "../../js/actions/DeploymentActions";
import DeploymentEvents from "../../js/events/DeploymentEvents";
import DeploymentStore from "../../js/stores/DeploymentStore";
import AppsActions from "../../js/actions/AppsActions";

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("scheduler migrations", function () {

  it("sends continue to a migration waiting for user decision", function () {
    var nockResponse = {
      "result": "Received cmd: continue"
    };

    nock(config.apiURL)
      .post("/service/my-framework/v1/plan/continue")
      .reply(200, nockResponse);

    DeploymentStore.once(DeploymentEvents.CONTINUE_MIGRATION_SUCCESS,
        function (response, appId) {
      expectAsync(function () {
        expect(appId).to.equal("/app-1");
        expect(response.result).to.equal("Received cmd: continue");
      }, done);
    });

    DeploymentActions.continueMigration("my-framework", "v1/plan", "/app-1");
  });

  it("handles failure gracefully", function (done) {
    nock(config.apiURL)
      .post("/service/not-found-framework/v1/plan/continue")
      .reply(404);

    DeploymentStore.once(DeploymentEvents.CONTINUE_MIGRATION_ERROR,
      function (error, statusCode, appId) {
        expectAsync(function () {
          expect(statusCode).to.equal(404);
          expect(appId).to.equal("/app-1");
        }, done);
      });

    DeploymentActions.continueMigration("not-found-framework",
      "v1/plan", "/app-1");
  });

});
