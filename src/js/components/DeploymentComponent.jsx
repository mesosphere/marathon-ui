import classNames from "classnames";
import {Link} from "react-router";
import React from "react/addons";

import AppsStore from "../stores/AppsStore";
import DeploymentStore from "../stores/DeploymentStore";
import DeploymentActions from "../actions/DeploymentActions";
import DeploymentEvents from "../events/DeploymentEvents";
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
      loading: false,
      continueButtonsLoadingState: {}
    };
  },

  componentWillMount: function () {
    DeploymentStore.on(DeploymentEvents.CONTINUE_MIGRATION_SUCCESS,
      this.onContinueMigrationSuccess);
    DeploymentStore.on(DeploymentEvents.CONTINUE_MIGRATION_ERROR,
      this.onContinueMigrationError);
  },

  componentWillUnmount: function () {
    DeploymentStore.removeListener(DeploymentEvents.CONTINUE_MIGRATION_SUCCESS,
      this.onContinueMigrationSuccess);
    DeploymentStore.removeListener(DeploymentEvents.CONTINUE_MIGRATION_ERROR,
      this.onContinueMigrationError);
  },

  getContinueButton: function (action) {
    if (action.isWaitingForUserDecision === true) {
      let continueButtonClasses = classNames("btn btn-xs btn-success", {
        disabled: !!this.state.continueButtonsLoadingState[action.app]
      });
      return (
        <button onClick={this.handleContinueMigration.bind(this, action.app)}
          className={continueButtonClasses}>
          Continue
        </button>
      );
    }

    return null;
  },

  handleContinueMigration: function (appId, event) {
    event.preventDefault();
    var app = AppsStore.getCurrentApp(appId);
    var labels = app.labels;
    var service = null;
    var path = null;

    if (labels != null) {
      service = labels["DCOS_PACKAGE_FRAMEWORK_NAME"];
      path = labels["DCOS_MIGRATION_API_PATH"];
    }

    if (service == null || service === "" ||
        path == null || path === "") {
      DialogActions.alert({
        title: `Error: missing labels`,
        message: `The application ${appId} lacks the required labels ` +
        `"DCOS_PACKAGE_FRAMEWORK_NAME" and "DCOS_MIGRATION_API_PATH".`,
        severity: DialogSeverity.DANGER
      });
      return;
    }

    let continueButtonsLoadingState = Object.assign({},
      this.state.continueButtonsLoadingState);
    continueButtonsLoadingState[appId] = true;

    this.setState({
      continueButtonsLoadingState
    }, function () {
      DeploymentActions.continueMigration(service, path, app.id);
    });
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

  onContinueMigrationSuccess: function (response, appId) {
    var continueButtonsLoadingState = Object.assign({},
      this.state.continueButtonsLoadingState);
    continueButtonsLoadingState[appId] = false;
    this.setState({
      continueButtonsLoadingState
    }, function () {
      DialogActions.alert({
        title: "Continue Migration",
        message: `Received command continue successfully for ${appId}`
      });
    });
  },

  onContinueMigrationError: function (error, status, appId) {
    var continueButtonsLoadingState = Object.assign({},
      this.state.continueButtonsLoadingState);
    continueButtonsLoadingState[appId] = false;
    this.setState({
      continueButtonsLoadingState
    }, function () {
      DialogActions.alert({
        title: `${status} Error`,
        message: `There was an error sending the continue action for ${appId}`,
        severity: DialogSeverity.DANGER
      });
    });
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
          <ul className="list-unstyled actions">
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
          <ul className="list-unstyled actions">
            {model.currentActions.map(action => {
              return (
                <li key={action.app}>
                  <span>{action.action}</span>
                  {this.getContinueButton(action)}
                </li>
              );
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
