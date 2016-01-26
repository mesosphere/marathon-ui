import {expect} from "chai";
import {shallow} from "enzyme";

import React from "../../../node_modules/react/addons";
import Util from "../../js/helpers/Util";
import appScheme from "../../js/stores/schemes/appScheme";
import AppTaskStatsListComponent
  from "../../js/components/AppTaskStatsListComponent.jsx";

describe("App Tasks Stats List component", function () {

  before(function () {

    var app = Util.extendObject(appScheme, {
      id: "/app-1",
      "taskStats": {
        "startedAfterLastScaling": {
          "stats": {}
        },
        "withLatestConfig": {
          "stats": {}
        },
        "withOutdatedConfig": {
          "stats": {}
        },
        "totalSummary": {
          "stats": {}
        }
      }
    });

    this.component = shallow(
      <AppTaskStatsListComponent taskStatsList={app.taskStats}/>
    );
  });

  after(function () {
    this.component = null;
  });

  it("displays given amount of categories", function () {

    expect(this.component.children().at(1).props().caption)
      .to.equal("Started After Last Scaling");
    expect(this.component.children().at(2).props().caption)
      .to.equal("With Latest Config");
    expect(this.component.children().at(3).props().caption)
      .to.equal("With Outdated Config");
    expect(this.component.children().at(4).props().caption)
      .to.equal("Total Summary");

  });
});
