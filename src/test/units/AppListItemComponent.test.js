import {expect} from "chai";
import {render} from "enzyme";

import React from "react/addons";
import AppListItemComponent from "../../js/components/AppListItemComponent";

describe("AppListItemComponent", function () {

  before(function () {
    var model = {
      id: "/app-123",
      deployments: [],
      tasksRunning: 4,
      health: [],
      instances: 5,
      mem: 100,
      totalMem: 1030,
      cpus: 4,
      totalCpus: 20.0000001,
      status: 0
    };

    this.component = render(
      <AppListItemComponent model={model} currentGroup="/" />
    );
  });

  after(function () {
    this.component = null;
  });

  it("has the correct app id", function () {
    expect(this.component.find(".name-cell").text()).to.equal("app-123");
  });

  it("has the correct amount of total cpus", function () {
    expect(this.component.find(".cpu-cell").text()).to.equal("20.0");
  });

  it("has the correct amount of total memory", function () {
    var node = this.component.find(".total.ram > span");
    expect(node.get(0).attribs.title).to.equal("1030 MiB");
  });

  it("displays the correct amount memory", function () {
    expect(this.component.find(".total.ram").text()).to.equal("1 GiB");
  });

  it("has correct number of tasks and instances", function () {
    expect(this.component.find(".instances-cell").text())
      .to.equal("4 of 5");
  });

});
