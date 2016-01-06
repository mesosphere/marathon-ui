var _ = require("underscore");
var expect = require("chai").expect;
var expectAsync = require("./helpers/expectAsync");
var nock = require("nock");
var shallow = require("enzyme").shallow;
var React = require("react/addons");

var config = require("../js/config/config");
var DeploymentActions = require("../js/actions/DeploymentActions");
var DeploymentComponent = require("../js/components/DeploymentComponent");
var NavTabsComponent = require("../js/components/NavTabsComponent");
var DeploymentEvents = require("../js/events/DeploymentEvents");
var DeploymentStore = require("../js/stores/DeploymentStore");

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";
var tabs = require("../js/constants/tabs");

describe("Deployments", function () {

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

  describe("on request", function () {

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
  });

  describe("on revert (rollback)", function () {

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

  describe("on stop", function () {

    it("forcefully stops a deployment", function (done) {
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

});

describe("Deployments navigation badge", function () {

  before(function () {
    DeploymentStore.deployments = [
      {id: "deployment-1"},
      {id: "deployment-2"}
    ];

    var props = {
      activeTabId: "/deployments",
      tabs: tabs
    };

    this.component = shallow(<NavTabsComponent {...props} />);
  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("has the correct amount of deployments", function () {
    expect(this.component
      .find(".badge.indicator")
      .text()
    ).to.equal("2");
  });

});

describe("Deployment component", function () {
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

  before(function () {
    this.component = shallow(<DeploymentComponent model={model} />);
  });

  it("has the correct deployment id", function () {
    expect(this.component
      .find("td")
      .first()
      .text()
    ).to.equal("123");
  });

  it("has correct apps in list element", function () {
    // TODO https://github.com/mesosphere/marathon/issues/2710
    // <Link /> won't render in ReactRouter < 1.0
    // due to missing context. The "stubContextRenderer" does not
    // play nice with enzyme's rendering.
    var TestUtils = React.addons.TestUtils;
    var renderer = TestUtils.createRenderer();
    renderer.render(<DeploymentComponent model={model} />);
    var component = renderer.getRenderOutput();

    _.each(component.props.children[1].props.children.props.children,
        function (li, i) {
      expect(li.props.children.props.children).to.equal("app" + (i + 1));
    });
  });

  it("has correct actions in list element", function () {
    expect(this.component
      .find("td")
      .at(2)
      .find("li")
      .map((li, i) => "action" + (i +1))
    ).to.deep.equal(
      ["action1", "action2", "action3"]
    );
  });

  it("shows the current step out of the total number", function () {
    expect(this.component.find("td").at(3).text()).to.equal("1 / 2");
  });

  it("renders the Stop and Rollback buttons", function () {
    var buttons = this.component.find(".deployment-buttons").find(".btn");
    expect(buttons.length).to.equal(2);
    expect(buttons.first().text()).to.equal("Stop");
    expect(buttons.at(1).text()).to.equal("Rollback");
  });
});
