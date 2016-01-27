import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import GroupsAction from "../../js/actions/GroupsActions";
import GroupsEvents from "../../js/events/GroupsEvents";
import GroupsStore from "../../js/stores/GroupsStore";

describe("scale group", function () {

  it("starts a new deployment succesfully", function (done) {
    nock(config.apiURL)
      .put("/v2/groups//group-1")
      .reply(200, {
        "deploymentId": "group-1-scaleBy",
        "version": "v1"
      });

    GroupsStore.once(GroupsEvents.SCALE_SUCCESS, done);
    GroupsAction.scaleGroup("/group-1", 1.5);
  });

  it("emits an error on a non-existing group", function (done) {
    nock(config.apiURL)
      .put("/v2/groups//group-non-existent")
      .reply(404, {
        "message": "Group '/group-non-existent' does not exist"
      });

    GroupsStore.once(GroupsEvents.SCALE_ERROR, function (error) {
      expectAsync(function () {
        expect(error.message)
          .to.equal("Group '/group-non-existent' does not exist");
      }, done);
    });

    GroupsAction.scaleGroup("/group-non-existent", 1.5);
  });
});
