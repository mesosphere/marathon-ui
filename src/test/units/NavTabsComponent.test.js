import {expect} from "chai";
import {shallow} from "enzyme";

import React from "react/addons";
import NavTabsComponent from "../../js/components/NavTabsComponent";
import DeploymentStore from "../../js/stores/DeploymentStore";
import tabs from "../../js/constants/tabs";

describe("Deployments navigation badge", function () {

  before(function () {
    DeploymentStore.deployments = [
      {id: "deployment-1"},
      {id: "deployment-2"}
    ];

    var props = {
      activeTabId: "/deployments",
      tabs: tabs
    };

    this.component = shallow(<NavTabsComponent {...props} />);
  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("has the correct amount of deployments", function () {
    expect(this.component
      .find(".badge.indicator")
      .text()
    ).to.equal("2");
  });

});
