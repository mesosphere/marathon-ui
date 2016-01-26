import {expect} from "chai";
import nock from "nock";
import _ from "underscore";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import DeploymentActions from "../../js/actions/DeploymentActions";
import DeploymentEvents from "../../js/events/DeploymentEvents";
import DeploymentStore from "../../js/stores/DeploymentStore";

describe("stop deployment", function () {

  beforeEach(function (done) {
    var nockResponse = [{
      id: "deployment-1",
      affectedApps: ["app1", "app2"],
      currentActions: ["ScaleApplication"]
    }, {}, {}];

    nock(config.apiURL)
      .get("/v2/deployments")
      .reply(200, nockResponse);

    DeploymentStore.once(DeploymentEvents.CHANGE, done);
    DeploymentActions.requestDeployments();
  });

  it("forcefully stop a deployment", function (done) {
    // Payload is 'null' on a forcefully stopped deployment
    nock(config.apiURL)
      .delete("/v2/deployments/deployment-1")
      .query({force: "true"})
      .reply(200, undefined);

    DeploymentStore.once(DeploymentEvents.CHANGE, function () {
      expectAsync(function () {
        expect(DeploymentStore.deployments).to.have.length(2);
      }, done);
    });

    DeploymentActions.stopDeployment("deployment-1");
  });

  it("receives a stop error", function (done) {
    nock(config.apiURL)
      .delete("/v2/deployments/undefined")
      .query({force: "true"})
      .reply(404, {message: "stop error"});

    DeploymentStore.once(DeploymentEvents.STOP_ERROR, function (error) {
      expectAsync(function () {
        expect(DeploymentStore.deployments).to.have.length(3);
        expect(error.message).to.equal("stop error");
      }, done);
    });

    DeploymentActions.stopDeployment();
  });

  it("handles unauthorized errors gracefully", function (done) {
    nock(config.apiURL)
      .delete("/v2/deployments/undefined")
      .query({force: "true"})
      .reply(401, {message: "Unauthorized access"});

    DeploymentStore.once(DeploymentEvents.STOP_ERROR,
      function (error, statusCode) {
        expectAsync(function () {
          expect(statusCode).to.equal(401);
        }, done);
      });

    DeploymentActions.stopDeployment();
  });
});
