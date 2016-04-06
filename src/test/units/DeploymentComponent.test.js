import {expect} from "chai";
import {shallow} from "enzyme";
import _ from "underscore";

import React from "react/addons";

import DeploymentComponent from "../../js/components/DeploymentComponent";

describe("Deployment component", function () {
  var model = {
    id: "123",
    version: "v1",
    affectedApps: [],
    currentActions: [
      {app: "app1", action: "action1"},
      {app: "app2", action: "action2"},
      {app: "app3", action: "action3"}
    ],
    currentStep: 2,
    totalSteps: 2
  };

  before(function () {
    this.component = shallow(<DeploymentComponent model={model} />);
  });

  it("has the correct deployment id", function () {
    expect(this.component
      .find("td")
      .first()
      .text()
    ).to.equal("123");
  });

  it("has correct apps in list element", function () {
    // TODO https://github.com/mesosphere/marathon/issues/2710
    // <Link /> won't render in ReactRouter < 1.0
    // due to missing context. The "stubContextRenderer" does not
    // play nice with enzyme's rendering.
    var renderer = React.addons.TestUtils.createRenderer();
    renderer.render(<DeploymentComponent model={model} />);
    var component = renderer.getRenderOutput();

    _.each(component.props.children[1].props.children.props.children,
      function (li, i) {
        expect(li.props.children.props.children).to.equal("app" + (i + 1));
      });
  });

  it("has correct actions in list element", function () {
    expect(this.component
      .find("td")
      .at(2)
      .find("li")
      .map((li, i) => "action" + (i +1))
    ).to.deep.equal(
      ["action1", "action2", "action3"]
    );
  });

  it("shows the current step out of the total number", function () {
    expect(this.component.find("td").at(3).text()).to.equal("1 / 2");
  });

  it("renders the Stop and Rollback buttons", function () {
    var buttons = this.component.find(".deployment-buttons").find(".btn");
    expect(buttons.length).to.equal(2);
    expect(buttons.first().text()).to.equal("Stop");
    expect(buttons.at(1).text()).to.equal("Rollback");
  });

  describe("during a scheduler upgrade", function () {
    var model = {
      id: "123",
      version: "v1",
      affectedApps: [],
      currentActions: [{
        app: "app1",
        action: "action1",
        isWaitingForUserAction: true
      }],
      currentStep: 2,
      totalSteps: 2
    };

    before(function () {
      this.component = shallow(<DeploymentComponent model={model} />);
    });

    it("renders the continue button correctly", function () {
      var button = this.component
        .find("td")
        .at(2)
        .find("button");

      expect(button.text()).to.equal("Continue");
    });
  });
});
