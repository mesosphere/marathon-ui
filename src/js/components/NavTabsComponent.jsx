var classNames = require("classnames");
var React = require("react/addons");

var DeploymentEvents = require("../events/DeploymentEvents");
var DeploymentStore = require("../stores/DeploymentStore");

var NavTabsComponent = React.createClass({
  displayName: "NavTabsComponent",

  propTypes: {
    activeTabId: React.PropTypes.string,
    className: React.PropTypes.string,
    tabs: React.PropTypes.array.isRequired
  },

  getInitialState: function () {
    return {
      activeDeployments: DeploymentStore.deployments.length
    };
  },

  getDefaultProps: function () {
    return {
      className: ""
    };
  },

  componentDidMount: function () {
    DeploymentStore.on(DeploymentEvents.CHANGE, this.onDeploymentsChange);
  },

  componentWillUnmount: function () {
    DeploymentStore.removeListener(DeploymentEvents.CHANGE,
      this.onDeploymentsChange);
  },

  onDeploymentsChange: function () {
    this.setState({activeDeployments: DeploymentStore.deployments.length});
  },

  getBadge: function (tab) {
    var state = this.state;
    if (tab.id !== "/deployments" || state.activeDeployments < 1 ) {
      return null;
    }
    return <span className="badge">{state.activeDeployments}</span>;
  },

  render: function () {
    var activeTabId = this.props.activeTabId;

    var tabs = this.props.tabs.map(function (tab) {
      if (tab.hidden === true) {
        return null;
      }

      var tabClassSet = classNames({
        "active": tab.id === activeTabId
      });

      return (
        <li className={tabClassSet} key={tab.id}>
          <a href={"#" + tab.id}>
            {tab.text}
          </a>
          {this.getBadge(tab)}
        </li>
      );
    }, this);

    var ulClassSet = classNames(
      this.props.className,
      "nav navbar navbar-static-top nav-tabs"
    );

    return (
      <ul className={ulClassSet}>
        {tabs}
      </ul>
    );
  }
});

module.exports = NavTabsComponent;
