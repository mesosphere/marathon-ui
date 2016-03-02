import {expect} from "chai";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import GroupsActions from "../../js/actions/GroupsActions";
import GroupsEvents from "../../js/events/GroupsEvents";
import GroupsStore from "../../js/stores/GroupsStore";

var server = config.localTestserverURI;
config.apiURL = "http://" + server.address + ":" + server.port + "/";

describe("Create Group", function () {

  describe("GroupsStore", function () {

    describe("on empty group creation", function () {

      it("sends create event on success", function (done) {
        nock(config.apiURL)
          .post("/v2/groups")
          .reply(201, {
            "deploymentId": " ",
            "version": " "
          });

        GroupsStore.once(GroupsEvents.CREATE_GROUP, done);

        GroupsActions.createGroup({
          "id": "/group-1"
        });
      });

      it("handles bad requests", function (done) {
        nock(config.apiURL)
          .post("/v2/groups")
          .reply(400, {message: "Please specify data in JSON format"});

        GroupsStore.once(GroupsEvents.CREATE_GROUP_ERROR,
            function (error, status) {
          expectAsync(function () {
            expect(error.message)
              .to.equal("Please specify data in JSON format");
            expect(status).to.equal(400);
          }, done);
        });

        GroupsActions.createGroup({});
      });

      it("handles unauthorized errors gracefully", function (done) {
        nock(config.apiURL)
          .post("/v2/groups")
          .reply(401, {message: "Unauthorized access"});

        GroupsStore.once(GroupsEvents.CREATE_GROUP_ERROR,
          function (error, statusCode) {
            expectAsync(function () {
              expect(statusCode).to.equal(401);
            }, done);
          }
        );

        GroupsActions.createGroup({id: "group-1"});
      });

      it("handles 409 errors gracefully", function (done) {
        nock(config.apiURL)
          .post("/v2/groups")
          .reply(422, {message: "Group /group-1 is already created."});

        GroupsStore.once(GroupsEvents.CREATE_GROUP_ERROR,
          function (error, statusCode) {
            expectAsync(function () {
              expect(statusCode).to.equal(422);
              expect(error.message)
                .to.equal("Group /group-1 is already created.");
            }, done);
          }
        );

        GroupsActions.createGroup({id: "group-1"});
      });
    });

  });

});
