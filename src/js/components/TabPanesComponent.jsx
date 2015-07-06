var React = require("react/addons");

var AppListComponent = require("../components/AppListComponent");
var DeploymentsListComponent =
  require("../components/DeploymentsListComponent");
var TabPaneComponent = require("../components/TabPaneComponent");
var TogglableTabsComponent = require("../components/TogglableTabsComponent");

var tabs = [
  {id: "/apps", text: "Apps"},
  {id: "/deployments", text: "Deployments"}
];

var TabPanesComponent = React.createClass({
  displayName: "TabPanesComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  propTypes: {
    // react-router params
    params: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      tabId: this.getTabId()
    };
  },

  componentWillReceiveProps: function () {
    this.setState({
      tabId: this.getTabId()
    });
  },

  getTabId: function () {
    var path = this.context.router.getCurrentPathname();

    if (tabs.find(function (tab) {
      return tab.id === path;
    })) {
      return path;
    }
    return tabs[0].id;
  },

  render: function () {
    var path = this.context.router.getCurrentPathname();

    return (
      <TogglableTabsComponent activeTabId={this.state.tabId}
        className="container-fluid">
        <TabPaneComponent id="/apps">
          <a href={"#" + path + "?modal=newapp"}
              className="btn btn-success navbar-btn">
            + New App
          </a>
          <AppListComponent />
        </TabPaneComponent>
        <TabPaneComponent id="/deployments">
          <DeploymentsListComponent />
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  }
});

module.exports = TabPanesComponent;
