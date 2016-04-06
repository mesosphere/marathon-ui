import {expect} from "chai";
import nock from "nock";
import _ from "underscore";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import DeploymentActions from "../../js/actions/DeploymentActions";
import DeploymentEvents from "../../js/events/DeploymentEvents";
import DeploymentStore from "../../js/stores/DeploymentStore";

describe("request deployments", function () {

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

  it("updates the DeploymentStore on success", function () {
    expect(DeploymentStore.deployments).to.have.length(3);
    expect(DeploymentStore.deployments[1].currentActions).to.be.empty;
    expect(DeploymentStore.deployments[1].currentActionsString).to.equal("");
  });

  it("handles failure gracefully", function (done) {
    nock(config.apiURL)
      .get("/v2/deployments")
      .reply(404, {message: "Guru Meditation"});

    DeploymentStore.once(DeploymentEvents.REQUEST_ERROR, function (error) {
      expectAsync(function () {
        expect(error.message).to.equal("Guru Meditation");
      }, done);
    });

    DeploymentActions.requestDeployments();
  });

  it("handles unauthorized errors gracefully", function (done) {
    nock(config.apiURL)
      .get("/v2/deployments")
      .reply(401, {message: "Unauthorized access"});

    DeploymentStore.once(DeploymentEvents.REQUEST_ERROR,
      function (error, statusCode) {
        expectAsync(function () {
          expect(statusCode).to.equal(401);
        }, done);
      });

    DeploymentActions.requestDeployments();
  });

  describe("during a scheduler upgrade", function () {

    beforeEach(function (done) {
      var groupsResponse = {
        id: "/",
        groups: [],
        apps: [Object.assign({}, appScheme, {
          id: "/app1",
          labels: {
            "DCOS_MIGRATION_API_PATH": "/v1/plan",
            "DCOS_MIGRATION_API_VERSION": "v1"
          }
        })]
      };

      nock(config.apiURL)
        .get("/v2/groups")
        .once()
        .query(true)
        .reply(200, groupsResponse);

      DeploymentStore.once(DeploymentEvents.CHANGE, done);
      AppsActions.requestApps();
    });

    it("detects a deployment waiting for user decision", function () {
      var deployments = DeploymentStore.deployments;
      expect(deployments).to.have.length(3);

      var actions = deployments[1].currentActions;
      expect(actions).to.have.length(1);
      expect(actions[0].isWaitingForUserDecision).to.be.true;
    });
  });
});
