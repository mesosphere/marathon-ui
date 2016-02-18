import {expect} from "chai";
import {mount} from "enzyme";
import React from "react/addons";

import PluginComponentStore from "../../js/stores/PluginComponentStore";
import PluginComponentEvents from "../../js/events/PluginComponentEvents";
import PluginDispatcher from "../../js/plugin/shared/PluginDispatcher";
import PluginEvents from "../../js/plugin/shared/PluginEvents";
import PluginMoundPointComponent
  from "../../js/components/PluginMountPointComponent";

describe("PluginMountPointComponent", function () {

  before(function (done) {
    this.pluginMountPointComponentA =
      mount(<PluginMoundPointComponent placeId="testMountPointPlaceId" />);

    this.pluginMountPointComponentB =
      mount(<PluginMoundPointComponent placeId="testMountPointPlaceId" />);

    this.pluginMountPointComponentC =
      mount(<PluginMoundPointComponent placeId="differentPlaceId" />);

    var component = React.createClass({
      render: function () {
        return (<span>Test Mount Point Component</span>);
      }
    });

    PluginComponentStore.once(PluginComponentEvents.CHANGE, () => done());

    PluginDispatcher.dispatch({
      eventType: PluginEvents.INJECT_COMPONENT,
      placeId: "testMountPointPlaceId",
      component: component
    });
  });

  it("renders component with given place id", function () {
    expect(this.pluginMountPointComponentA.find("span").text())
      .to.equal("Test Mount Point Component");

    expect(this.pluginMountPointComponentB.find("span").text())
      .to.equal("Test Mount Point Component");
  });

  it("does not render at non-matching place id", function () {
    expect(this.pluginMountPointComponentC.find("span").length)
      .to.equal(0);
  });

});
