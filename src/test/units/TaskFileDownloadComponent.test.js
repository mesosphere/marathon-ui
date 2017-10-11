import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import AppDispatcher from "../../js/AppDispatcher";
import MesosStore from "../../js/stores/MesosStore";
import MesosEvents from "../../js/events/MesosEvents";
import TaskFileDownloadComponent
  from "../../js/components/TaskFileDownloadComponent";

describe("Task file download component", function () {

  before(function (done) {
    this.model = {
      appId: "/app-1",
      id: "task-id",
      slaveId: "agent-id"
    };

    MesosStore.resetStore();

    MesosStore.once(MesosEvents.CHANGE, () => {
      this.component = shallow(
        <TaskFileDownloadComponent task={this.model} fileName="filename"/>
      );
      done();
    });

    AppDispatcher.dispatch({
      actionType: MesosEvents.REQUEST_VERSION_INFORMATION_COMPLETE,
      data: {
        version: "0.26.0"
      }
    });

    AppDispatcher.dispatch({
      actionType: MesosEvents.REQUEST_FILES_COMPLETE,
      data: {
        id: this.model.id,
        host: "//mesos-agent:5050",
        files: [{
          gid: "staff",
          mode: "-rw-r--r--",
          mtime: 1449573729,
          nlink: 1,
          path: "/file/path/filename",
          size: 506,
          uid: "user"
        }]
      }
    });

  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("has correct download link", function () {
    expect(this.component.props().children.props.href)
      .to.equal("//mesos-agent:5050/files/download?" +
      "path=%2Ffile%2Fpath%2Ffilename");
  });

  it("has correct label", function () {
    expect(this.component.props().children.props.children[2])
      .to.equal("filename");
  });

});

describe("Windows task file download component", function () {

  before(function (done) {
    this.model = {
      appId: "/app-1",
      id: "task-id",
      slaveId: "agent-id"
    };

    MesosStore.resetStore();

    MesosStore.once(MesosEvents.CHANGE, () => {
      this.component = shallow(
        <TaskFileDownloadComponent task={this.model} fileName="filename"/>
      );
      done();
    });

    AppDispatcher.dispatch({
      actionType: MesosEvents.REQUEST_VERSION_INFORMATION_COMPLETE,
      data: {
        version: "0.26.0"
      }
    });

    AppDispatcher.dispatch({
      actionType: MesosEvents.REQUEST_FILES_COMPLETE,
      data: {
        id: this.model.id,
        host: "//mesos-agent:5050",
        files: [{
          gid: "staff",
          mode: "-rw-r--r--",
          mtime: 1449573729,
          nlink: 1,
          path: "C:\\windows\\path\\filename",
          size: 506,
          uid: "user"
        }]
      }
    });

  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("has correct download link", function () {
    expect(this.component.props().children.props.href)
      .to.equal("//mesos-agent:5050/files/download?" +
      "path=C%3A%5Cwindows%5Cpath%5Cfilename");
  });

  it("has correct label", function () {
    expect(this.component.props().children.props.children[2])
      .to.equal("filename");
  });

});
