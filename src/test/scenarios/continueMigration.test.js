import {expect} from "chai";
import expectAsync from "./../helpers/expectAsync";
import ajaxWrapperStub from "./../stubs/ajaxWrapperStub";

import ajaxWrapper from "../../js/helpers/ajaxWrapper";
import DeploymentActions from "../../js/actions/DeploymentActions";
import DeploymentEvents from "../../js/events/DeploymentEvents";
import DeploymentStore from "../../js/stores/DeploymentStore";

describe("continueMigration", function () {

  before(function () {
    DeploymentActions.request = ajaxWrapperStub(
      function (url, resolve, reject) {
        switch (url) {
          case "service/my-framework/v1/plan/continue":
            resolve({status:200, body:{result: "Received cmd: continue"}});
            break;

          default:
            reject({status:404, body: "error"});
            break;
        }
      });
  });

  after(function () {
    DeploymentActions.request = ajaxWrapper;
  });

  it("sends continue to a migration waiting for user decision", function () {
    DeploymentStore.once(DeploymentEvents.CONTINUE_MIGRATION_SUCCESS,
      function (response, appId) {
        expectAsync(function () {
          expect(appId).to.equal("/app-1");
          expect(response.result).to.equal("Received cmd: continue");
        }, done);
      });

    DeploymentActions.continueMigration("my-framework", "/v1/plan", "/app-1");
  });

  it("handles failure gracefully", function (done) {
    DeploymentStore.once(DeploymentEvents.CONTINUE_MIGRATION_ERROR,
      function (error, statusCode, appId) {
        expectAsync(function () {
          expect(statusCode).to.equal(404);
          expect(appId).to.equal("/app-1");
        }, done);
      });

    DeploymentActions.continueMigration("not-found-framework",
      "/v1/plan", "/app-1");
  });

});
