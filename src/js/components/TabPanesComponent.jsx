var React = require("react/addons");
var State = require("react-router").State;

var AppListComponent = require("../components/AppListComponent");
var DeploymentsListComponent =
  require("../components/DeploymentsListComponent");
var TabPaneComponent = require("../components/TabPaneComponent");
var TogglableTabsComponent = require("../components/TogglableTabsComponent");

var TabPanesComponent = React.createClass({
  displayName: "TabPanesComponent",

  mixins: [State],

  propTypes: {
    // react-router params
    params: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      tabId: this.getPath()
    };
  },

  componentWillReceiveProps: function () {
    this.setState({
      tabId: this.getPath()
    });
  },

  render: function () {
    return (
      <TogglableTabsComponent activeTabId={this.state.tabId}
        className="container-fluid">
        <TabPaneComponent id="/apps">
          <a href="#/newapp" className="btn btn-success navbar-btn">
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
