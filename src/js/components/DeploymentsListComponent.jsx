var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var Messages = require("../constants/Messages");
var States = require("../constants/States");

var DeploymentComponent = require("../components/DeploymentComponent");
var DeploymentStore = require("../stores/DeploymentStore");
var DeploymentEvents = require("../events/DeploymentEvents");

var DeploymentListComponent = React.createClass({
  displayName: "DeploymentListComponent",

  getInitialState: function () {
    return {
      deployments: DeploymentStore.deployments,
      fetchState: States.STATE_LOADING,
      sortKey: null,
      sortDescending: false,
      errorMessage: ""
    };
  },

  componentWillMount: function () {
    DeploymentStore.on(DeploymentEvents.CHANGE, this.onDeploymentsChange);
    DeploymentStore.on(DeploymentEvents.REQUEST_ERROR, this.onRequestError);
    DeploymentStore.on(DeploymentEvents.REVERT_ERROR, this.onRevertError);
    DeploymentStore.on(DeploymentEvents.STOP_ERROR, this.onStopError);
  },

  componentWillUnmount: function () {
    DeploymentStore.removeListener(DeploymentEvents.CHANGE,
      this.onDeploymentsChange);
    DeploymentStore.removeListener(DeploymentEvents.REQUEST_ERROR,
      this.onRequestError);
    DeploymentStore.removeListener(DeploymentEvents.REVERT_ERROR,
      this.onRevertError);
    DeploymentStore.removeListener(DeploymentEvents.STOP_ERROR,
      this.onStopError);
  },

  onDeploymentsChange: function () {
    this.setState({
      deployments: DeploymentStore.deployments,
      fetchState: States.STATE_SUCCESS
    });
  },

  onRequestError: function (message, statusCode) {
    var fetchState = States.STATE_ERROR;

    switch (statusCode) {
      case 401:
        fetchState = States.STATE_UNAUTHORIZED;
        break;
      case 403:
        fetchState = States.STATE_FORBIDDEN;
        break;
    }

    this.setState({
      fetchState: fetchState
    });
  },

  onRevertError: function (error) {
    this.setState({
      errorMessage: "Can't revert deployment: " + error.message
    });
  },

  onStopError: function (error) {
    this.setState({
      errorMessage: "Can't stop deployment: " + error.message
    });
  },

  sortBy: function (sortKey) {
    var state = this.state;

    this.setState({
      sortKey: sortKey,
      sortDescending: state.sortKey === sortKey && !state.sortDescending
    });
  },

  getDeploymentNodes: function () {
    var state = this.state;
    var sortKey = state.sortKey;

    return lazy(state.deployments)
      .sortBy(function (deployment) {
        return deployment[sortKey];
      }, state.sortDescending)
      .map(function (deployment) {
        return (
          <DeploymentComponent key={deployment.id} model={deployment} />
        );
      })
      .value();
  },

  getCaret: function (sortKey) {
    if (sortKey === this.state.sortKey) {
      return (
        <span className="caret"></span>
      );
    }
    return null;
  },

  render: function () {
    var state = this.state;

    var pageIsLoading = state.fetchState === States.STATE_LOADING;

    var headerClassSet = classNames({
      "clickable": true,
      "dropup": !state.sortDescending
    });

    var loadingClassSet = classNames({
      "hidden": !pageIsLoading
    });

    var errorClassSet = classNames({
      "hidden": state.fetchState !== States.STATE_ERROR
    });

    var unauthorizedClassSet = classNames({
      "hidden": state.fetchState !== States.STATE_UNAUTHORIZED
    });

    var forbiddenClassSet = classNames({
      "hidden": state.fetchState !== States.STATE_FORBIDDEN
    });

    var noDeploymentsClassSet = classNames({
      "hidden": pageIsLoading || state.deployments.length !== 0 ||
        state.fetchState === States.STATE_UNAUTHORIZED ||
        state.fetchState === States.STATE_FORBIDDEN
    });

    var errorMessageClassSet = classNames({
      "hidden": state.errorMessage === ""
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
              <span onClick={this.sortBy.bind(null, "id")}
                  className={headerClassSet}>
                Deployment ID {this.getCaret("id")}
              </span>
            </th>
            <th>
              <span onClick={this.sortBy.bind(null, "affectedAppsString")}
                  className={headerClassSet}>
                Affected Applications {this.getCaret("affectedAppsString")}
              </span>
            </th>
            <th>
              <span onClick={this.sortBy.bind(null, "currentActionsString")}
                  className={headerClassSet}>
                {this.getCaret("currentActionsString")} Action
              </span>
            </th>
            <th className="text-right">
              <span onClick={this.sortBy.bind(null, "currentStep")}
                  className={headerClassSet}>
                {this.getCaret("currentStep")} Progress
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
          <tr className={noDeploymentsClassSet}>
            <td className="text-center" colSpan="5">
              No deployments in progress.
            </td>
          </tr>
          <tr className={errorMessageClassSet}>
            <td className="text-center text-danger" colSpan="5">
              {state.errorMessage}
            </td>
          </tr>
          <tr className={errorClassSet}>
            <td className="text-center text-danger" colSpan="5">
              {`Error fetching deployments. ${Messages.RETRY_REFRESH}`}
            </td>
          </tr>
          <tr className={unauthorizedClassSet}>
            <td className="text-center text-danger" colSpan="6">
              {`Error fetching deployments. ${Messages.UNAUTHORIZED}`}
            </td>
          </tr>
          <tr className={forbiddenClassSet}>
            <td className="text-center text-danger" colSpan="6">
              {`Error fetching deployments. ${Messages.FORBIDDEN}`}
            </td>
          </tr>
          {this.getDeploymentNodes()}
        </tbody>
      </table>
    );
  }
});

module.exports = DeploymentListComponent;
