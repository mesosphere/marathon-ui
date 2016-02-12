import {expect} from "chai";
import {shallow} from "enzyme";
import React from "react/addons";

import PluginComponentStore from "../../js/stores/PluginComponentStore";
import PluginComponentEvents from "../../js/events/PluginComponentEvents";
import PluginDispatcher from "../../js/plugin/shared/PluginDispatcher";
import PluginEvents from "../../js/plugin/shared/PluginEvents";

describe("PluginComponentStore", function () {

  before(function (done) {
    var component = React.createClass({
      render: function () {
        return (<span>Test Component</span>);
      }
    });

    PluginComponentStore.once(PluginComponentEvents.CHANGE, (componentObj) => {
      this.componentObj = componentObj;
      done();
    });

    PluginDispatcher.dispatch({
      eventType: PluginEvents.INJECT_COMPONENT,
      placeId: "testPlaceId",
      component: component
    });
  });

  it("successfully stores injected component", function () {
    expect(PluginComponentStore.components.length).to.equal(1);
  });

  it("has injected components content", function () {
    expect(shallow(PluginComponentStore.components[0].component).text())
      .to.equal("Test Component");
  });

  it("has correct place id", function () {
    expect(this.componentObj.placeId).to.equal("testPlaceId");
  });

});
