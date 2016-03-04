import {expect} from "chai";
import {shallow} from "enzyme";
import nock from "nock";
import expectAsync from "./../helpers/expectAsync";

import config from "../../js/config/config";

import React from "../../../node_modules/react/addons";
import States from "../../js/constants/States";
import AppsStore from "../../js/stores/AppsStore";
import AppsEvents from "../../js/events/AppsEvents";
import AppsActions from "../../js/actions/AppsActions";
import TaskDetailComponent from "../../js/components/TaskDetailComponent";
import TimeFieldComponent from "../../js/components/TimeFieldComponent";

describe("TaskDetailComponent", function () {

  var baseModel = {
    appId: "/app-1",
    id: "task-123",
    status: "status-0",
    updatedAt: "2015-06-29T14:11:58.709Z",
    stagedAt: "2015-06-29T14:11:58.709Z",
    startedAt: "2015-06-29T14:11:58.709Z",
    version: "2015-06-29T13:54:24.171Z",
    host: "example.com"
  };

  var context = {
    router: {
      getCurrentParams: function () {
        return {tab: ""};
      }
    }
  };

  before(function () {
    this.model = Object.assign({}, baseModel);

    this.component = shallow(
      <TaskDetailComponent appId={this.model.appId}
         fetchState={States.STATE_SUCCESS}
         hasHealth={false}
         task={this.model} />,
       {context}
    );
  });

  it("has the correct status", function () {
    expect(this.component
      .find(".task-details")
      .children()
      .at(10)
      .text()
    ).to.equal("status-0");
  });

  it("has the correct timefields", function () {
    var timeFields = this.component
      .find(".task-details")
      .find(TimeFieldComponent);
    var stagedAt = timeFields.first().props().time;
    var startedAt = timeFields.at(1).props().time;

    expect(stagedAt).to.equal("2015-06-29T14:11:58.709Z");
    expect(startedAt).to.equal("2015-06-29T14:11:58.709Z");
  });

  it("has the correct version", function () {
    var version = this.component
      .find(".task-details")
      .children()
      .at(14)
      .find("time")
      .props()
      .dateTime;
    expect(version).to.equal("2015-06-29T13:54:24.171Z");
  });

  it("has a loading error", function () {
    var component = shallow(
      <TaskDetailComponent
        appId={this.model.appId}
        fetchState={States.STATE_ERROR}
        hasHealth={false}
        task={this.model} />,
      {context});
    expect(component.find(".text-danger").length).to.equal(1);
  });

  describe("with host and ports", function () {
    before(function () {
      this.model = Object.assign({}, baseModel, {
        host: "host-1",
        ports: [1, 2, 3]
      });

      this.component = shallow(
        <TaskDetailComponent appId={this.model.appId}
            fetchState={States.STATE_SUCCESS}
            hasHealth={false}
            task={this.model} />,
          {context}
      );
    });

    it("has the correct host", function () {
      expect(this.component
        .find(".task-details")
        .children()
        .at(1)
        .text()
      ).to.equal("host-1");
    });

    it("has the correct ports", function () {
      expect(this.component
        .find(".task-details")
        .children()
        .at(4)
        .text()
      ).to.equal("[1,2,3]");
    });

    it("has the correct endpoints", function () {
      var list = this.component.find(".task-details");

      var endpoints = [
        list.children().at(6).text(),
        list.children().at(7).text(),
        list.children().at(8).text()
      ];
      expect(endpoints).to.deep.equal(["host-1:1", "host-1:2", "host-1:3"]);
    });
  });

  describe("with IP per container", function () {
    before(function (done) {
      var nockResponse = {
        app: {
          id: "/app-1",
          ipAddress: {
            labels: {
              "pool": "1.1.1.1/24"
            },
            discovery: {
              ports: [
                {"number": 8080, "name": "http", "protocol": "tcp"},
                {"number": 8081, "name": "http", "protocol": "tcp"}
              ]
            }
          }
        }
      };

      nock(config.apiURL)
        .get("/v2/apps//app-1")
        .query({embed: "app.taskStats"})
        .reply(200, nockResponse);

      AppsStore.once(AppsEvents.CHANGE, () => {
        this.model = Object.assign({}, baseModel, {
          host: "example.com",
          ipAddresses: [
            {
              "protocol": "IPv4",
              "ipAddress": "127.0.0.1"
            }
          ]
        });

        this.component = shallow(
          <TaskDetailComponent appId={this.model.appId}
             fetchState={States.STATE_SUCCESS}
             hasHealth={false}
             task={this.model} />,
           {context}
        );
        done();
      });

      AppsActions.requestApp("/app-1");
    });

    it("has the correct host", function () {
      expect(this.component
        .find(".task-details")
        .children()
        .at(1)
        .text()
      ).to.equal("example.com");
    });

    it("has the correct ip address", function () {
      expect(this.component
        .find(".task-details")
        .children()
        .at(3)
        .text()
      ).to.equal("127.0.0.1");
    });

    it("has the correct ports", function () {
      expect(this.component
        .find(".task-details")
        .children()
        .at(5)
        .text()
      ).to.equal("[]");
    });

    it("has the correct endpoints", function () {
      var details = this.component.find(".task-details").children();

      var endpoints = [
        details.at(7).text(),
        details.at(8).text()
      ];
      expect(endpoints).to.deep.equal(["127.0.0.1:8080", "127.0.0.1:8081"]);
    });
  });

});
