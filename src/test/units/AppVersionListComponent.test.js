import {expect} from "chai";
import {mount} from "enzyme";

import React from "../../../node_modules/react/addons";
import AppVersionListComponent
  from "../../js/components/AppVersionListComponent.jsx";
import AppVersionListItemComponent
  from "../../js/components/AppVersionListItemComponent.jsx";

import AppDispatcher from "../../js/AppDispatcher";
import AppVersionsEvents from "../../js/events/AppVersionsEvents";
import AppVersionsStore from "../../js/stores/AppVersionsStore";

describe("AppVersionListComponent", function () {

  before(function (done) {
    var appVersions = {
      versions: [
        "2015-06-29T13:54:01.577Z",
        "2015-06-29T13:02:29.615Z",
        "2015-06-29T13:02:19.363Z"
      ]
    };

    AppVersionsStore.once(AppVersionsEvents.CHANGE, () => {
      this.component = mount(<AppVersionListComponent appId="/app-test" />);
      done();
    });

    AppDispatcher.dispatch({
      actionType: AppVersionsEvents.REQUEST_VERSION_TIMESTAMPS,
      data: {body: appVersions},
      appId: "/app-test"
    });
  });

  after(function () {
    this.component.instance().componentWillUnmount();
  });

  it("renders correct app version list items", function () {
    var items = this.component.find(AppVersionListItemComponent);

    // First version is sliced out as current version,
    // so that are only 2 versions here
    expect(items.length).to.equal(2);
    expect(items.first().prop("appVersionTimestamp"))
      .to.equal("2015-06-29T13:02:29.615Z");
    expect(items.at(1).prop("appVersionTimestamp"))
      .to.equal("2015-06-29T13:02:19.363Z");
  });

});
