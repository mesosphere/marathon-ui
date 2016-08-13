import React from "react/addons";

import TabPaneComponent from "../components/TabPaneComponent";
import TogglableTabsComponent from "../components/TogglableTabsComponent";
import tabs from "../constants/tabs";

import QueryParamsMixin from "../mixins/QueryParamsMixin";

var TabPanesComponent = React.createClass({
  displayName: "TabPanesComponent",

  mixins: [QueryParamsMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  getTabId: function () {
    var path = this.getCurrentPathname();

    var hasTab = tabs.find(tab => tab.id === path);

    if (hasTab) {
      return path;
    }

    return tabs[0].id;
  },

  render: function () {
    return (
      <TogglableTabsComponent activeTabId={this.getTabId()}
          className="container-fluid content">
        <TabPaneComponent id={tabs[0].id}>
          {React.createElement(tabs[0].component)}
        </TabPaneComponent>
        <TabPaneComponent id={tabs[1].id}>
          {React.createElement(tabs[1].component)}
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  }
});

export default TabPanesComponent;
