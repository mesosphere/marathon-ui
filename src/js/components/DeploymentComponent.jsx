import classNames from "classnames";
import {Link} from "react-router";
import React from "react/addons";

import DeploymentActions from "../actions/DeploymentActions";
import DialogActions from "../actions/DialogActions";
import DialogStore from "../stores/DialogStore";
import DialogSeverity from "../constants/DialogSeverity";

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

    const dialogId = DialogActions.confirm({
      actionButtonLabel:"Rollback deployment",
      message: `Are you sure you want to rollback? This will stop the current
        deployment of ${model.affectedAppsString} and start a new deployment to
        revert the affected applications to its previous version.`,
      severity: DialogSeverity.WARNING,
      title: "Rollback Deployment"
    });

    DialogStore.handleUserResponse(dialogId, function () {
      this.setState({loading: true});
      DeploymentActions.revertDeployment(model.id);
    }.bind(this));
  },

  handleStopDeployment: function () {
    var model = this.props.model;

    const dialogId = DialogActions.confirm({
      actionButtonLabel:"Stop Deployment",
      message: `Are you sure you want to stop? This will stop the deployment of
        ${model.affectedAppsString} immediately and leave the applications in
        their current state.`,
      severity: DialogSeverity.WARNING,
      title: "Stop Deployment"
    });

    DialogStore.handleUserResponse(dialogId, function () {
      this.setState({loading: true});
      DeploymentActions.stopDeployment(model.id);
    }.bind(this));
  },

  getButtons: function () {
    if (this.state.loading) {
      return (<div className="loading-bar" />);
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
                <li key={action.app} className="overflow-ellipsis">
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
        <td className="text-right deployment-buttons">
          {this.getButtons()}
        </td>
      </tr>
    );
  }
});

export default DeploymentComponent;
