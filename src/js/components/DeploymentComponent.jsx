var classNames = require("classnames");
var Link = require("react-router").Link;
var React = require("react/addons");

var DeploymentActions = require("../actions/DeploymentActions");
var DialogActions = require("../actions/DialogActions");
var DialogStore = require("../stores/DialogStore");

var DeploymentComponent = React.createClass({
  displayName: "DeploymentComponent",

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      loading: false
    };
  },

  handleRevertDeployment: function () {
    var model = this.props.model;

    var confirmMessage =
      "Destroy deployment of apps: '" + model.affectedAppsString +
      "'?\nDestroying this deployment will create and start a new " +
      "deployment to revert the affected app to its previous version.";

    const dialogId =
      DialogActions.confirm(confirmMessage);

    DialogStore.handleConfirm(dialogId, function () {
      this.setState({loading: true});
      DeploymentActions.revertDeployment(model.id);
    }.bind(this));
  },

  handleStopDeployment: function () {
    var model = this.props.model;

    var confirmMessage =
      "Stop deployment of apps: '" + model.affectedAppsString +
      "'?\nThis will stop the deployment immediately and leave it in the " +
      "current state.";

    const dialogId =
      DialogActions.confirm(confirmMessage);

    DialogStore.handleConfirm(dialogId, function () {
      this.setState({loading: true});
      DeploymentActions.stopDeployment(model.id);
    }.bind(this));
  },

  getButtons: function () {
    if (this.state.loading) {
      return (
        <div className="progress progress-striped active pull-right"
            style={{"width": "140px"}}>
          <span className="progress-bar progress-bar-info" role="progressbar"
              aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"
              style={{"width": "100%"}}>
            <span className="sr-only">Rolling back deployment</span>
          </span>
        </div>
      );
    } else {
      return (
        <ul className="list-inline">
          <li>
            <button
                onClick={this.handleStopDeployment}
                className="btn btn-xs btn-default">
              Stop
            </button>
          </li>
          <li>
            <button
                onClick={this.handleRevertDeployment}
                className="btn btn-xs btn-default">
              Rollback
            </button>
          </li>
        </ul>
      );
    }
  },

  render: function () {
    var model = this.props.model;

    var isDeployingClassSet = classNames({
      "text-warning": model.currentStep < model.totalSteps
    });

    var progressStep = Math.max(0, model.currentStep - 1);

    return (
      // Set `title` on cells that potentially overflow so hovering on the
      // cells will reveal their full contents.
      <tr>
        <td className="overflow-ellipsis" title={model.id}>
          {model.id}
        </td>
        <td>
          <ul className="list-unstyled">
            {model.currentActions.map(function (action) {
              let appId = encodeURIComponent(action.app);
              return (
                <li key={action.app}>
                  <Link to="app" params={{appId: appId}}>{action.app}</Link>
                </li>
              );
            })}
          </ul>
        </td>
        <td>
          <ul className="list-unstyled">
            {model.currentActions.map(function (action) {
              return <li key={action.app}>{action.action}</li>;
            })}
          </ul>
        </td>
        <td className="text-right">
          <span className={isDeployingClassSet}>
            {progressStep}
          </span> / {model.totalSteps}
        </td>
        <td className="text-right">
          {this.getButtons()}
        </td>
      </tr>
    );
  }
});

module.exports = DeploymentComponent;
