import {expect} from "chai";
import nock from "nock";
import _ from "underscore";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import DeploymentActions from "../../js/actions/DeploymentActions";
import DeploymentEvents from "../../js/events/DeploymentEvents";
import DeploymentStore from "../../js/stores/DeploymentStore";

describe("revert (rollback) deployment", function () {

  beforeEach(function (done) {
    var nockResponse = [{
      id: "deployment-1",
      affectedApps: ["app1", "app2"],
      currentActions: [{action: "ScaleApplication"}]
    }, {}, {}];

    nock(config.apiURL)
      .get("/v2/deployments")
      .reply(200, nockResponse);

    DeploymentStore.once(DeploymentEvents.CHANGE, done);
    DeploymentActions.requestDeployments();
  });

  it("reverts (rollback) a deployment on success", function (done) {
    // A successful response with a payload of a new revert-deployment,
    // like the API would do.
    // Indeed the payload isn't processed by the store yet.
    nock(config.apiURL)
      .delete("/v2/deployments/deployment-1")
      .reply(200, {
        "deploymentId": "deployment-reverts",
        "version": "v1"
      });

    DeploymentStore.once(DeploymentEvents.CHANGE, function () {
      expectAsync(function () {
        expect(DeploymentStore.deployments).to.have.length(2);

        expect(_.where(DeploymentStore.deployments, {
          deploymentId: "deployment-1"
        })).to.be.empty;
      }, done);
    });

    DeploymentActions.revertDeployment("deployment-1");
  });

  it("receives a revert error", function (done) {
    nock(config.apiURL)
      .delete("/v2/deployments/deployment-to-revert")
      .reply(404, {message: "revert error"});

    DeploymentStore.once(DeploymentEvents.REVERT_ERROR, function (error) {
      expectAsync(function () {
        expect(DeploymentStore.deployments).to.have.length(3);
        expect(error.message).to.equal("revert error");
      }, done);
    });

    DeploymentActions.revertDeployment("deployment-to-revert");
  });

  it("handles unauthorized errors gracefully", function (done) {
    nock(config.apiURL)
      .delete("/v2/deployments/deployment-to-revert")
      .reply(401, {message: "Unauthorized access"});

    DeploymentStore.once(DeploymentEvents.REVERT_ERROR,
      function (error, statusCode) {
        expectAsync(function () {
          expect(statusCode).to.equal(401);
        }, done);
      });

    DeploymentActions.revertDeployment("deployment-to-revert");
  });

});
