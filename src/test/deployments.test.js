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

var server = new HttpServer(config.localTestserverURI);
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Deployments", function () {

  beforeEach(function (done) {
    this.server = server
      .setup([{
        id: "deployment-1",
        affectedApps: ["app1", "app2"],
        currentActions: ["ScaleApplication"]
      }, {}, {}], 200)
      .start(function () {
        DeploymentStore.once(DeploymentEvents.CHANGE, done);
        DeploymentActions.requestDeployments();
      });
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
      this.server.setup({message: "Guru Meditation"}, 404);

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
      // A successful response with a payload of a new revert-deployment,
      // like the API would do.
      // Indeed the payload isn't processed by the store yet.
      this.server.setup({
          "deploymentId": "deployment-reverts",
          "version": "v1"
        }, 200);

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
      this.server.setup({message: "revert error"}, 404);

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
      // Payload is 'null' on a forcefully stoped deployment
      this.server.setup(undefined, 202);

      DeploymentStore.once(DeploymentEvents.CHANGE, function () {
        expectAsync(function () {
          expect(DeploymentStore.deployments).to.have.length(2);
        }, done);
      });

      DeploymentActions.stopDeployment("deployment-1");
    });

    it("receives a stop error", function (done) {
      this.server.setup({message: "stop error"}, 404);

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

describe("Deployment component", function () {

  beforeEach(function () {
    var model = {
      id: "123",
      version: "v1",
      affectedApps: [],
      currentActions: [
        {app: "app1", action: "action1"},
        {app: "app2", action: "action2"},
        {app: "app3", action: "action3"}
      ],
      currentStep: 2,
      totalSteps: 2
    };

    this.renderer = TestUtils.createRenderer();
    this.renderer.render(<DeploymentComponent model={model} />);
    this.component = this.renderer.getRenderOutput();
  });

  afterEach(function () {
    this.renderer.unmount();
  });

  it("has the correct deployment id", function () {
    var cellContent = this.component.props.children[0].props.children;
    expect(cellContent).to.equal("123");
  });

  it("has correct apps in list element", function () {
    _.each(this.component.props.children[1].props.children.props.children,
        function (li, i) {
      expect(li.props.children).to.equal("app" + (i + 1));
    });
  });

  it("has correct actions in list element", function () {
    _.each(this.component.props.children[2].props.children.props.children,
        function (li, i) {
      expect(li.props.children).to.equal("action" + (i + 1));
    });
  });

  it("it shows the current step", function () {
    var progressStep =
      this.component.props.children[3].props.children[0].props.children;
    expect(progressStep).to.equal(1);
  });

  it("has correct number of total steps", function () {
    var totalSteps = this.component.props.children[3].props.children[2];
    expect(totalSteps).to.equal(2);
  });

  it("has Stop-button", function () {
    var listElements =
      this.component.props.children[4].props.children.props.children;
    expect(listElements[0].props.children.props.children).to.equal("Stop");
  });

  it("has Rollback-button", function () {
    var listElements =
      this.component.props.children[4].props.children.props.children;
    expect(listElements[1].props.children.props.children).to.equal("Rollback");
  });
});
