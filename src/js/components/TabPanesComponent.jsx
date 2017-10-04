import React from "react/addons";

import TabPaneComponent from "../components/TabPaneComponent";
import TogglableTabsComponent from "../components/TogglableTabsComponent";
import NavTabStore from "../stores/NavTabStore";
import NavTabEvents from "../events/NavTabEvents";

import QueryParamsMixin from "../mixins/QueryParamsMixin";

var TabPanesComponent = React.createClass({
  displayName: "TabPanesComponent",

  mixins: [QueryParamsMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      tabs: NavTabStore.getTabs()
    };
  },

  componentWillMount: function () {
    NavTabStore.on(NavTabEvents.CHANGE, this.onNavTabChange);
  },

  onNavTabChange: function () {
    this.setState({
      tabs: NavTabStore.getTabs()
    });
  },

  getTabId: function () {
    var path = this.getCurrentPathname();

    var hasTab = NavTabStore.getTabs().find(tab => tab.id === path);

    if (hasTab) {
      return path;
    }

    return tabs[0].id;
  },

  render: function () {
    var renderedNavTabComponents = this.state.tabs.map(tab => {
      return (
          <TabPaneComponent id={tab.id} key={tab.id}>
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
