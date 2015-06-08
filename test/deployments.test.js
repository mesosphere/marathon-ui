var expect = require("chai").expect;
var _ = require("underscore");

var config = require("../js/config/config");
var DeploymentActions = require("../js/actions/DeploymentActions");
var DeploymentEvents = require("../js/events/DeploymentEvents");
var DeploymentStore = require("../js/stores/DeploymentStore");

var expectAsync = require("./helpers/expectAsync");
var HttpServer = require("./helpers/HttpServer").HttpServer;

describe("A request to the deployments endpoint", function () {

  before(function (done) {
    this.server = new HttpServer({port: 8181, address: "localhost"}).start(done);
    config.apiURL = "http://localhost:8181/";
  });

  after(function (done) {
    this.server.stop(done);
  });

  it("updates the DeploymentStore on success", function (done) {
    this.server.setup({
      data: [{}, {}, {}],
      resCode: 200
    });

    DeploymentStore.once(DeploymentEvents.CHANGE, function () {
      expectAsync(function () {
        expect(DeploymentStore.deployments).to.have.length(3);
      }, done);
    });

    DeploymentActions.requestDeployments();
  });

  it("handles failure gracefully", function (done) {
    this.server.setup({
      data: { message: "Guru Meditation" },
      resCode: 404
    });

    DeploymentStore.once(DeploymentEvents.REQUEST_ERROR, done);

    DeploymentActions.requestDeployments();
  });

  it("reverts (rollback) a deployment", function (done) {
    this.server.setup({
      data: {
        "deploymentId": "52c51d0a-27eb-4971-a0bb-b0fa47528e33",
        "version": "2014-07-09T11:14:58.232Z"
      },
      resCode: 200
    });

    DeploymentStore.once(DeploymentEvents.CHANGE, function () {
      expectAsync(function () {

        expect(DeploymentStore.deployments).to.have.length(4);

        expect(_.where(DeploymentStore.deployments, {
          deploymentId: "52c51d0a-27eb-4971-a0bb-b0fa47528e33"
        })).to.not.be.undefined;

      }, done);
    });

    DeploymentActions.revertDeployment("2e72dbf1-2b2a-4204-b628-e8bd160945dd");
  });

  it("recieves a revert error", function (done) {
    this.server.setup({
      data: null,
      resCode: 404
    });

    DeploymentStore.once(DeploymentEvents.REVERT_ERROR, function () {
      expectAsync(function () {
        expect(DeploymentStore.deployments).to.have.length(4);
      }, done);
    });

    DeploymentActions.revertDeployment("2e72dbf1-2b2a-4204-b628-e8bd160945dd");
  });

  it("forcefully stops a deployment", function (done) {
    this.server.setup({
      data: null,
      resCode: 202
    });

    DeploymentStore.once(DeploymentEvents.CHANGE, function () {
      expectAsync(function () {
        expect(DeploymentStore.deployments).to.have.length(3);
      }, done);
    });

    DeploymentActions.stopDeployment("52c51d0a-27eb-4971-a0bb-b0fa47528e33");
  });

  it("recieves a stop error", function (done) {
    this.server.setup({
      data: null,
      resCode: 404
    });

    DeploymentStore.once(DeploymentEvents.STOP_ERROR, function () {
      expectAsync(function () {
        expect(DeploymentStore.deployments).to.have.length(3);
      }, done);
    });

    DeploymentActions.stopDeployment();
  });

});
