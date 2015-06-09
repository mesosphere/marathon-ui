var classNames = require("classnames");
var lazy = require("lazy.js");

var React = require("react/addons");

var DeploymentActions = require("../actions/DeploymentActions");

var DeploymentComponent = React.createClass({
  name: "DeploymentComponent",

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      loading: false
    };
  },

  setLoading: function (bool) {
    this.setState({loading: bool});
  },

  handleRevertDeployment: function () {
    var model = this.props.model;

    var confirmMessage =
      "Destroy deployment of apps: '" + model.affectedAppsString +
      "'?\nDestroying this deployment will create and start a new " +
      "deployment to revert the affected app to its previous version.";

    if (confirm(confirmMessage)) {
      DeploymentActions.revertDeployment(model.id);
    }
  },

  handleStopDeployment: function () {
    var model = this.props.model;

    var confirmMessage =
      "Stop deployment of apps: '" + model.affectedAppsString +
      "'?\nThis will stop the deployment immediately and leave it in the " +
      "current state.";

    if (confirm(confirmMessage)) {
      DeploymentActions.stopDeployment(model.id);
    }
  },

  getButtons: function () {
    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
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
    /* jshint trailing:true, quotmark:true, newcap:true */
    /* jscs:enable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
  },

  render: function () {
    var model = this.props.model;

    var isDeployingClassSet = classNames({
      "text-warning": model.currentStep < model.totalSteps
    });

    var progressStep = Math.max(0, model.currentStep - 1);

    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    return (
      // Set `title` on cells that potentially overflow so hovering on the
      // cells will reveal their full contents.
      <tr>
        <td className="overflow-ellipsis" title={model.id}>
          {model.id}
        </td>
        <td>
          <ul className="list-unstyled">
            {lazy(model.currentActions).map(function (action) {
              return <li key={action.app}>{action.app}</li>;
            }).value()}
          </ul>
        </td>
        <td>
          <ul className="list-unstyled">
            {lazy(model.currentActions).map(function (action) {
              return <li key={action.app}>{action.action}</li>;
            }).value()}
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
