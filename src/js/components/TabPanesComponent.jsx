var classNames = require("classnames");
var React = require("react/addons");

var AppListComponent = require("../components/AppListComponent");
var DeploymentsListComponent =
  require("../components/DeploymentsListComponent");
var TabPaneComponent = require("../components/TabPaneComponent");
var TogglableTabsComponent = require("../components/TogglableTabsComponent");

var TabPanesComponent = React.createClass({
  displayName: "TabPanesComponent",

  propTypes: {
    // react-router params
    params: React.PropTypes.object
  },

  render: function () {
    return (
      <TogglableTabsComponent activeTabId={this.state.activeTabId}
        className="container-fluid">
        <TabPaneComponent id="apps">
          <a href="#newapp" className="btn btn-success navbar-btn" >
            + New App
          </a>
          <AppListComponent />
        </TabPaneComponent>
        <TabPaneComponent id="deployments">
          <DeploymentsListComponent />
        </TabPaneComponent>
      </TogglableTabsComponent>
    );
  }
});

module.exports = TabPanesComponent;
