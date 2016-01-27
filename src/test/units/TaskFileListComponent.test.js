import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import AppDispatcher from "../../js/AppDispatcher";
import MesosStore from "../../js/stores/MesosStore";
import MesosEvents from "../../js/events/MesosEvents";
import TaskFileListComponent from "../../js/components/TaskFileListComponent";

describe("TaskFileListComponent", function () {

  before(function (done) {
    this.model = {
      appId: "/app-1",
      id: "task-id",
      slaveId: "agent-id"
    };

    MesosStore.resetStore();

    MesosStore.once(MesosEvents.CHANGE, () => {
      this.component = shallow(<TaskFileListComponent task={this.model}/>);
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

  it("has the correct number of files/rows", function () {
    expect(this.component.find("tbody").find("tr").length).to.equal(1);
  });

  it("has correct download link", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
      .find("td")
      .first()
      .find("a.btn")
      .props()
      .href
    ).to.equal("//mesos-agent:5050/files/download?" +
      "path=%2Ffile%2Fpath%2Ffilename");
  });

  it("has correct permissions", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
      .find("td")
      .at(1)
      .text()
    ).to.equal("-rw-r--r--");
  });

  it("has correct nlink", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
      .find("td")
      .at(2)
      .text()
    ).to.equal("1");
  });

  it("has correct uid", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
      .find("td")
      .at(3)
      .text()
    ).to.equal("user");
  });

  it("has correct gid", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
      .find("td")
      .at(4)
      .text()
    ).to.equal("staff");
  });

  it("has the correct file size", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    expect(firstTableRow
      .find("td")
      .at(5)
      .text()
    ).to.equal("506 B");
  });

  it("has correct mtime", function () {
    var firstTableRow = this.component.find("tbody").find("tr").first();
    var mtimeCell = firstTableRow.find("td").at(6);
    expect(mtimeCell.text())
      .to.equal(new Date(1449573729).toLocaleString());
    expect(mtimeCell.find("time").props().dateTime)
      .to.equal("1970-01-17T18:39:33.729Z");
  });

});
