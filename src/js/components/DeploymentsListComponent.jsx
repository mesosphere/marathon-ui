var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var States = require("../constants/States");

var DeploymentComponent = require("../components/DeploymentComponent");
var DeploymentStore = require("../stores/DeploymentStore");
var DeploymentEvents = require("../events/DeploymentEvents");

var DeploymentListComponent = React.createClass({
  displayName: "DeploymentListComponent",

  getInitialState: function () {
    return {
      deployments: [],
      fetchState: States.STATE_LOADING
    };
  },

  componentWillMount: function () {
    DeploymentStore.on(DeploymentEvents.CHANGE, function () {
      this.setState({
        deployments: DeploymentStore.deployments,
        fetchState: States.STATE_SUCCESS
      });
    }.bind(this));

    DeploymentStore.on(DeploymentEvents.REQUEST_ERROR, function () {
      this.setState({
        deployments: DeploymentStore.deployments,
        fetchState: States.STATE_ERROR
      });
    }.bind(this));
  },

  componentWillUnmount: function () {
    /*
    DeploymentStore.removeAllListeners(DeploymentEvents.CHANGE);
    DeploymentStore.removeAllListeners(DeploymentEvents.REQUEST_ERROR);
    */
  },

  getResource: function () {
    return this.state.deployments;
  },

  sortCollectionBy: function (comparator) {
    var deployments = this.state.deployments;

    comparator =
      deployments.sortKey === comparator && !deployments.sortReverse ?
      "-" + comparator :
      comparator;

    this.setState({
      deployments: lazy(deployments).sortBy(function (deployment) {
        return deployment[comparator];
      }).value()
    });
  },

  getDeploymentNodes: function () {
    return lazy(this.state.deployments).map(function (model) {
      return (
        <DeploymentComponent key={model.id} model={model} />
      );
    }.bind(this)).value();
  },

  render: function () {
    var state = this.state;
    var sortKey = state.deployments.sortKey;

    var headerClassSet = classNames({
      "clickable": true,
      "dropup": state.deployments.sortReverse
    });

    var loadingClassSet = classNames({
      "hidden": state.fetchState !== States.STATE_LOADING
    });

    var errorClassSet = classNames({
      "hidden": state.fetchState !== States.STATE_ERROR
    });

    var noDeploymentsClassSet = classNames({
      "hidden": state.deployments.length !== 0
    });

    return (
      <table className="table table-fixed">
        <colgroup>
          <col style={{width: "28%"}} />
          <col style={{width: "18%"}} />
          <col style={{width: "18%"}} />
          <col style={{width: "18%"}} />
          <col style={{width: "18%"}} />
        </colgroup>
        <thead>
          <tr>
            <th>
              <span onClick={this.sortCollectionBy.bind(null, "id")} className={headerClassSet}>
                Deployment ID {sortKey === "id" ? <span className="caret"></span> : null}
              </span>
            </th>
            <th>
              <span onClick={this.sortCollectionBy.bind(null, "affectedAppsString")} className={headerClassSet}>
                Affected Apps {sortKey === "affectedAppsString" ? <span className="caret"></span> : null}
              </span>
            </th>
            <th>
              <span onClick={this.sortCollectionBy.bind(null, "currentActionsString")} className={headerClassSet}>
                {sortKey === "currentActionsString" ? <span className="caret"></span> : null} Action
              </span>
            </th>
            <th className="text-right">
              <span onClick={this.sortCollectionBy.bind(null, "currentStep")} className={headerClassSet}>
                {sortKey === "currentStep" ? <span className="caret"></span> : null} Progress
              </span>
            </th>
            <th>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className={loadingClassSet}>
            <td className="text-center text-muted" colSpan="5">
              Loading deployments...
            </td>
          </tr>
          <tr className={errorClassSet}>
            <td className="text-center text-danger" colSpan="5">
              Error fetching deployments. Refresh to try again.
            </td>
          </tr>
          <tr className={noDeploymentsClassSet}>
            <td className="text-center" colSpan="5">
              No deployments in progress.
            </td>
          </tr>
          {this.getDeploymentNodes()}
        </tbody>
      </table>
    );
  }
});

module.exports = DeploymentListComponent;
