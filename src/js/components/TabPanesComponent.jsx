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
    var renderedNavTabComponents = tabs.map(tab => {
      return (
          <TabPaneComponent id={tab.id}>
            {React.createElement(tab.component)}
          </TabPaneComponent>
      );
    });
    return (
      <TogglableTabsComponent activeTabId={this.getTabId()}
          className="container-fluid content">
          {renderedNavTabComponents}
      </TogglableTabsComponent>
    );
  }
});

export default TabPanesComponent;
