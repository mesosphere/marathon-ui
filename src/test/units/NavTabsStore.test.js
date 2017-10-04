import {expect} from "chai";

import NavTabStore from "../../js/stores/NavTabStore";
import PluginEvents from "../../js/plugin/shared/PluginEvents";
import NavTabEvents from "../../js/events/NavTabEvents";
import PluginDispatcher from "../../js/plugin/shared/PluginDispatcher";

describe("NavTabStore", function () {

  before(function (done) {
    PluginDispatcher.dispatch({
      eventType: PluginEvents.APPEND_NAVTAB,
      data: [
        {
          id: "/mesos",
          text: "Mesos",
          component: ""
        },
        {
          id: "/another-tab",
          text: "Another Tab",
          component: ""
        }
      ]
    });



    done();
  });

  it("successfully appends multiple tabs to TabStore internal array", function () {
    expect(NavTabStore.getTabs().length).to.equal(4);
  });

  it("successfully fires NavTabEvents.CHANGE event", function () {
    var eventFired = false;

    function onChange() {
      eventFired = true;
    };

    NavTabStore.on(NavTabEvents.CHANGE, onChange);
    PluginDispatcher.dispatch({
      eventType: PluginEvents.APPEND_NAVTAB,
      data: []
    });
    NavTabStore.removeListener(NavTabEvents.CHANGE, onChange);
    expect(eventFired).to.equal(true);
  });



});
