var expect = require("chai").expect;
var sinon = require("sinon");

var config = require("../js/config/config");
var DeploymentActions = require("../js/actions/DeploymentActions");
var DeploymentEvents = require("../js/events/DeploymentEvents");
var DeploymentStore = require("../js/stores/DeploymentStore");

var mockOboe = require("./helpers/mockOboe");
var expectAsync = require("./helpers/expectAsync");

beforeEach(function () {
  sinon.stub(DeploymentActions, "request", mockOboe.request);
  config.apiURL = "http://example.com/";
});

afterEach(function () {
  mockOboe.reset();
  DeploymentActions.request.restore();
});

describe("A request to the deployments endpoint", function () {

  it("updates the DeploymentStore on success", function (done) {
    mockOboe.respondWithDone([{}, {}, {}]);
    DeploymentStore.on(DeploymentEvents.CHANGE, function () {
      expectAsync(function () {
        expect(DeploymentStore.deployments).to.have.length(3);
      }, done);
    });
    DeploymentActions.requestDeployments();
  });

  it("handles failure gracefully", function (done) {
    mockOboe.respondWithFail({ message: "Guru Meditation" });
    DeploymentStore.on(DeploymentEvents.REQUEST_ERROR, done);
    DeploymentActions.requestDeployments();
  });

});
