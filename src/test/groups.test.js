import {expect} from "chai";
import nock from "nock";
import expectAsync from "./helpers/expectAsync";

import config from "../js/config/config";
import GroupsAction from "../js/actions/GroupsActions";
import GroupsEvents from "../js/events/GroupsEvents";
import GroupsStore from "../js/stores/GroupsStore";

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Groups", function () {
  describe("on scale", function () {
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

  describe("on delete", function () {
    it("deletes a group succesfully", function (done) {
      nock(config.apiURL)
        .delete("/v2/groups//group-1")
        .reply(200, {
          "deploymentId": "group-1-delete",
          "version": "v1"
        });

      GroupsStore.once(GroupsEvents.DELETE_SUCCESS, done);

      GroupsAction.deleteGroup("/group-1");
    });

    it("emits an error on a non-existing group", function (done) {
      nock(config.apiURL)
        .delete("/v2/groups//group-non-existent")
        .reply(404, {
          "message": "Group '/group-non-existent' does not exist"
        });

      GroupsStore.once(GroupsEvents.DELETE_ERROR, function (error) {
        expectAsync(function () {
          expect(error.message)
            .to.equal("Group '/group-non-existent' does not exist");
        }, done);
      });

      GroupsAction.deleteGroup("/group-non-existent");
    });

    [403, 401, 404].forEach(status => {
      it("emits an error on a non-existing group with statuscode " + status,
        function (done) {
          nock(config.apiURL)
            .delete("/v2/groups//group-non-existent")
            .reply(status, {
              "message": "Group '/group-non-existent' does not exist"
            });

          GroupsStore.once(GroupsEvents.DELETE_ERROR,
            function (error, statusCode) {
              expectAsync(function () {

                expect(statusCode)
                  .to.equal(status);
              }, done);
            }
          );

          GroupsAction.deleteGroup("/group-non-existent");
        });
    });
  });
});
