var classNames = require("classnames");
var lazy = require("lazy.js");

var React = require("react/addons");

var DeploymentComponent = React.createClass({
  name: "DeploymentComponent",

  propTypes: {
    model: React.PropTypes.object.isRequired,
    destroyDeployment: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      loading: false
    };
  },

  setLoading: function (bool) {
    this.setState({loading: bool});
  },

  handleDestroyDeployment: function (forceStop) {
    this.props.destroyDeployment(
      this.props.model,
      {forceStop: forceStop},
      this
    );
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
                onClick={this.handleDestroyDeployment.bind(this, true)}
                className="btn btn-xs btn-default">
              Stop
            </button>
          </li>
          <li>
            <button
                onClick={this.handleDestroyDeployment.bind(this, false)}
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
