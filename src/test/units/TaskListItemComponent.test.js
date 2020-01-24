import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import TaskListItemComponent from "../../js/components/TaskListItemComponent";

describe("Task List Item component", function () {

  before(function () {
    var model = {
      appId: "/app-1",
      id: "task-123",
      host: "host-1",
      ports: [8081, 8082, 8083],
      status: "status-0",
      updatedAt: "2015-06-29T14:11:58.709Z",
      version: "2015-06-29T13:54:24.171Z"
    };

    this.component = shallow(
      <TaskListItemComponent appId={"/app-1"}
                             hasHealth={true}
                             labels={{}}
                             taskHealthMessage="Healthy"
                             isActive={false}
                             onToggle={()=>{}}
                             task={model} />
    );
  });

  it("has the correct task id", function () {
    expect(this.component
      .find("td")
      .at(1)
      .children()
      .first()
      .text()
    ).to.equal("task-123");
  });

  describe("task url are correct", function() {
    function getNthPortLink(component, n) {
      return component.find("td")
        .at(1).children()
        .at(2).children()
        .at(2 + n).children().first().props().href
    }

    it("has a HTTP task url when app does not have scheme label", function() {
      expect(getNthPortLink(this.component, 0)).to.equal("//host-1:8081");
      expect(getNthPortLink(this.component, 1)).to.equal("//host-1:8082");
      expect(getNthPortLink(this.component, 2)).to.equal("//host-1:8083");
    });

    it("has only https schemes", function() {
      var model = {
        appId: "/app-1",
        id: "task-123",
        host: "host-1",
        ports: [8081, 8082, 8083],
        status: "status-0",
        updatedAt: "2015-06-29T14:11:58.709Z",
        version: "2015-06-29T13:54:24.171Z"
      };

      this.component = shallow(
        <TaskListItemComponent appId={"/app-1"}
                               hasHealth={true}
                               taskHealthMessage="Healthy"
                               isActive={false}
                               labels={{
                                 "MARATHON_SCHEME_PORT": "https"
                                }}
                               onToggle={()=>{}}
                               task={model} />
      );
      expect(getNthPortLink(this.component, 0)).to.equal("https://host-1:8081");
      expect(getNthPortLink(this.component, 1)).to.equal("https://host-1:8082");
      expect(getNthPortLink(this.component, 2)).to.equal("https://host-1:8083");
    })

    it("has different schemes depending on the port", function() {
      var model = {
        appId: "/app-1",
        id: "task-123",
        host: "host-1",
        ports: [8081, 8082, 8083],
        status: "status-0",
        updatedAt: "2015-06-29T14:11:58.709Z",
        version: "2015-06-29T13:54:24.171Z"
      };

      this.component = shallow(
        <TaskListItemComponent appId={"/app-1"}
                               hasHealth={true}
                               taskHealthMessage="Healthy"
                               isActive={false}
                               labels={{
                                 "MARATHON_SCHEME_PORT0": "https",
                                 "MARATHON_SCHEME_PORT2": "http"
                                }}
                               onToggle={()=>{}}
                               task={model} />
      );
      expect(getNthPortLink(this.component, 0)).to.equal("https://host-1:8081");
      expect(getNthPortLink(this.component, 1)).to.equal("//host-1:8082");
      expect(getNthPortLink(this.component, 2)).to.equal("http://host-1:8083");
    })
  })

  it("has correct health message", function () {
    expect(this.component.find("td").at(2).text()).to.equal("Healthy");
  });

  it("has the correct status", function () {
    expect(this.component.find("td").at(3).text()).to.equal("status-0");
  });

  it("has the correct version", function () {
    expect(this.component
      .find("td")
      .at(6)
      .children()
      .first()
      .props()
      .title
    ).to.equal("2015-06-29T13:54:24.171Z");
  });

  it("has the correct update timestamp", function () {
    var cellProps = this.component
      .find("td")
      .at(7)
      .children()
      .first()
      .props();
    expect(cellProps.title).to.equal("2015-06-29T14:11:58.709Z");
    expect(cellProps.dateTime).to.equal("2015-06-29T14:11:58.709Z");
  });

});
