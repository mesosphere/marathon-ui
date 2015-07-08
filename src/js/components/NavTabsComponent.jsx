var classNames = require("classnames");
var React = require("react/addons");

var DeploymentEvents = require("../events/DeploymentEvents");
var DeploymentStore = require("../stores/DeploymentStore");
var DeploymentActions = require("../actions/DeploymentActions");

var NavTabsComponent = React.createClass({
  displayName: "NavTabsComponent",

  propTypes: {
    activeTabId: React.PropTypes.string.isRequired,
    activeDeployments: React.PropTypes.number,
    className: React.PropTypes.string,
    tabs: React.PropTypes.array.isRequired
  },

  getInitialState: function () {
    return {
      activeDeployments: this.props.activeDeployments || 0
    };
  },

  getDefaultProps: function () {
    return {
      className: ""
    };
  },

  componentWillMount: function () {
    DeploymentStore.on(DeploymentEvents.CHANGE, () => {
      this.setState({activeDeployments: DeploymentStore.deployments.length});
    });
  },

  render: function () {
    var activeTabId = this.props.activeTabId;

    var tabs = this.props.tabs.map(function (tab) {
      var tabClassSet = classNames({
        "active": tab.id === activeTabId
      });

      var badge = tab.id === "deployments" && this.state.activeDeployments > 0 ?
        <span className="badge">{this.state.activeDeployments}</span> :
        null;

      return (
        <li className={tabClassSet} key={tab.id}>
          <a href={"#" + tab.id}>
            {tab.text}
          </a>
          {badge}
        </li>
      );
    }, this);

    return (
      <ul className={this.props.className + " nav navbar navbar-static-top nav-tabs"}>
        {tabs}
      </ul>
    );
  }
});

module.exports = NavTabsComponent;
