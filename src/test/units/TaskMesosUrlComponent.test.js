import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import InfoStore from "../../js/stores/InfoStore";
import TaskMesosUrlComponent from "../../js/components/TaskMesosUrlComponent";

describe("TaskMesosUrlComponent", function () {

  before(function () {
    this.model = {
      appId: "/app-1",
      id: "task-123",
      slaveId: "20150720-125149-3839899402-5050-16758-S1"
    };
    InfoStore.info = {
      version: "1.2.3",
      frameworkId: "framework1",
      leader: "leader1.dcos.io",
      marathon_config: {
        marathon_field_1: "mf1",
        mesos_leader_ui_url: "http://leader1.dcos.io:5050"
      }
    };

    this.component = shallow(<TaskMesosUrlComponent task={this.model}/>);
  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("has the correct mesos task url", function () {
    var url = this.component.props().href;
    expect(url).to.equal(
      "http://leader1.dcos.io:5050/#/slaves/20150720-125149-3839899402-5050-" +
      "16758-S1/frameworks/framework1/executors/task-123"
    );
  });

  it("has the correct mesos task url when mesosUrl has trailing slash",
    function () {
      InfoStore.info.marathon_config.mesos_leader_ui_url =
        "http://leader1.dcos.io:5050/";
      this.component.setProps({task: this.model});

      var url = this.component.props().href;
      expect(url).to.equal(
        "http://leader1.dcos.io:5050/#/slaves/20150720-125149-3839899402-" +
        "5050-16758-S1/frameworks/framework1/executors/task-123"
      );
    });
});
