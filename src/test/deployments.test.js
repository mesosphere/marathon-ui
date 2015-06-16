var expect = require("chai").expect;
var _ = require("underscore");
var React = require("react/addons");
var TestUtils = React.addons.TestUtils;

var config = require("../js/config/config");
var DeploymentActions = require("../js/actions/DeploymentActions");
var DeploymentComponent = require("../js/components/DeploymentComponent");
var DeploymentEvents = require("../js/events/DeploymentEvents");
var DeploymentStore = require("../js/stores/DeploymentStore");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

describe("Deployments", function () {

  beforeEach(function (done) {
    this.server = new HttpServer({
      address: "localhost",
      port: 8181
    })
    .setup([{
      affectedApps: ["app1", "app2"],
      currentActions: ["ScaleApplication"]
    }, {}, {}], 200)
    .start(function () {
      DeploymentStore.once(DeploymentEvents.CHANGE, done);
      DeploymentActions.requestDeployments();
    });
    config.apiURL = "http://localhost:8181/";
  });

  afterEach(function (done) {
    this.server.stop(done);
  });

  describe("on request", function () {

    it("updates the DeploymentStore on success", function (done) {
      DeploymentStore.once(DeploymentEvents.CHANGE, function () {
        expectAsync(function () {
          expect(DeploymentStore.deployments).to.have.length(3);
          expect(DeploymentStore.deployments[1].currentActions).to.be.empty;
          expect(DeploymentStore.deployments[1].currentActionsString).to.equal("");
        }, done);
      });

      DeploymentActions.requestDeployments();
    });

    it("handles failure gracefully", function (done) {
      this.server.setup({ message: "Guru Meditation" }, 404);

      DeploymentStore.once(DeploymentEvents.REQUEST_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message).to.equal("Guru Meditation");
        }, done);
      });

      DeploymentActions.requestDeployments();
    });

  });

  describe("on revert (rollback)", function () {

    it("reverts (rollback) a deployment on success", function (done) {
      this.server.setup({
          "deploymentId": "deployment-reverts",
          "version": "v1"
        }, 200);

      DeploymentStore.once(DeploymentEvents.CHANGE, function () {
        expectAsync(function () {
          expect(DeploymentStore.deployments).to.have.length(3);

          expect(_.where(DeploymentStore.deployments, {
            deploymentId: "deployment-reverts"
          })).to.not.be.undefined;
        }, done);
      });

      DeploymentActions.revertDeployment("deployment-to-revert");
    });

    it("receives a revert error", function (done) {
      this.server.setup({ message: "revert error" }, 404);

      DeploymentStore.once(DeploymentEvents.REVERT_ERROR, function (error) {
        expectAsync(function () {
          expect(DeploymentStore.deployments).to.have.length(3);
          expect(error.message).to.equal("revert error");
        }, done);
      });

      DeploymentActions.revertDeployment("deployment-to-revert");
    });

  });

  describe("on stop", function () {

    it("forcefully stops a deployment", function (done) {
      this.server.setup(null, 202);

      DeploymentStore.once(DeploymentEvents.CHANGE, function () {
        expectAsync(function () {
          expect(DeploymentStore.deployments).to.have.length(3);
        }, done);
      });

      DeploymentActions.stopDeployment("deployment-to-stop");
    });

    it("receives a stop error", function (done) {
      this.server.setup({ message: "stop error" }, 404);

      DeploymentStore.once(DeploymentEvents.STOP_ERROR, function (error) {
        expectAsync(function () {
          expect(DeploymentStore.deployments).to.have.length(3);
          expect(error.message).to.equal("stop error");
        }, done);
      });

      DeploymentActions.stopDeployment();
    });

  });

});

describe("a deployment component", function () {

  beforeEach(function () {
    var model = {
      id: "123",
      version: "v1",
      affectedApps: [],
      currentActions: [
        { app: "app1", action: "action1" },
        { app: "app2", action: "action2" },
        { app: "app3", action: "action3" }
      ]
    };

    var renderer = TestUtils.createRenderer();
    renderer.render(<DeploymentComponent key="dc1" model={model} />);
    this.component = renderer.getRenderOutput();
  });

  it("has 5 table columns", function () {
    expect(this.component.props.children.length).to.equal(5);
  });

});
