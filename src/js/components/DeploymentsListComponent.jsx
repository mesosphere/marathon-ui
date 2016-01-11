var classNames = require("classnames");
var lazy = require("lazy.js");
var Link = require("react-router").Link;
var React = require("react/addons");

var Messages = require("../constants/Messages");
var States = require("../constants/States");

var CenteredInlineDialogComponent = require("./CenteredInlineDialogComponent");
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

  getInlineDialog: function () {
    var state = this.state;
    var pageIsLoading = state.fetchState === States.STATE_LOADING;
    var pageHasNoDeployments = !pageIsLoading &&
      state.deployments.length === 0 &&
      state.fetchState !== States.STATE_UNAUTHORIZED &&
      state.fetchState !== States.STATE_FORBIDDEN;
    var pageHasGenericError = state.fetchState === States.STATE_ERROR;
    var pageHasUnauthorizedError =
      state.fetchState === States.STATE_UNAUTHORIZED;
    var pageHasForbiddenError = state.fetchState === States.STATE_FORBIDDEN;
    var pageHasErrorMessage = state.errorMessage !== "";

    if (pageIsLoading) {
      return (
        <CenteredInlineDialogComponent title="Loading Deployments..."
          message="Please wait while deployments are being retrieved." />
      );
    }

    if (pageHasNoDeployments) {
      return (
        <CenteredInlineDialogComponent title="No Deployments"
          message="Active deployments will be shown here." />
      );
    }

    if (pageHasGenericError) {
      return (
        <CenteredInlineDialogComponent title="Error Fetching Deployments"
          additionalClasses="error"
          message={Messages.RETRY_REFRESH}>
          <Link className="btn btn-lg btn-default" to="deployments">
            Refresh Deployments
          </Link>
        </CenteredInlineDialogComponent>
      );
    }

    if (pageHasUnauthorizedError) {
      return (
        <CenteredInlineDialogComponent title="Error Fetching Deployments"
          additionalClasses="error"
          message={Messages.UNAUTHORIZED} />
      );
    }

    if (pageHasForbiddenError) {
      return (
        <CenteredInlineDialogComponent title="Error Fetching Deployments"
          additionalClasses="error"
          message={Messages.FORBIDDEN} />
      );
    }

    if (pageHasErrorMessage) {
      return (
        <CenteredInlineDialogComponent title="Error Fetching Deployments"
          additionalClasses="error"
          message={state.errorMessage} />
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

    return (
      <div>
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
            {this.getDeploymentNodes()}
          </tbody>
        </table>
        {this.getInlineDialog()}
      </div>
    );
  }
});

module.exports = DeploymentListComponent;
