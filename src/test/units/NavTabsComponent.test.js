import {expect} from "chai";
import {shallow} from "enzyme";
import React from "react/addons";

import AppDispatcher from "../../js/AppDispatcher";
import NavTabsComponent from "../../js/components/NavTabsComponent";
import DeploymentEvents from "../../js/events/DeploymentEvents";
import DeploymentStore from "../../js/stores/DeploymentStore";

import NavTabStore from "../../js/stores/NavTabStore";

describe("Deployments navigation badge", function () {

  before(function () {
    var deployments = [
      {id: "deployment-1"},
      {id: "deployment-2"}
    ];

    var props = {
      activeTabId: "/deployments",
      tabs: NavTabStore.getTabs()
    };

    DeploymentStore.once(DeploymentEvents.CHANGE, () => {
      this.component = shallow(<NavTabsComponent {...props} />);
    });

    AppDispatcher.dispatch({
      actionType: DeploymentEvents.REQUEST,
      data: {body: deployments}
    });
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
