/** @jsx React.DOM */

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
    /* jshint trailing:true, quotmark:true, newcap:true */
    /* jscs:enable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
  },

  render: function () {
    var model = this.props.model;

    var isDeployingClassSet = React.addons.classSet({
      "text-warning": model.get("currentStep") < model.get("totalSteps")
    });

    var progressStep = Math.max(0, model.get("currentStep") - 1);

    /* jshint trailing:false, quotmark:false, newcap:false */
    /* jscs:disable disallowTrailingWhitespace, validateQuoteMarks, maximumLineLength */
    return (
      // Set `title` on cells that potentially overflow so hovering on the
      // cells will reveal their full contents.
      <tr>
        <td className="overflow-ellipsis" title={model.get("id")}>
          {model.get("id")}
        </td>
        <td>
          <ul className="list-unstyled">
            {model.get("currentActions").map(function (action) {
              return <li key={action.app}>{action.app}</li>;
            })}
          </ul>
        </td>
        <td>
          <ul className="list-unstyled">
            {model.get("currentActions").map(function (action) {
              return <li key={action.app}>{action.action}</li>;
            })}
          </ul>
        </td>
        <td className="text-right">
          <span className={isDeployingClassSet}>
            {progressStep}
          </span> / {model.get("totalSteps")}
        </td>
        <td className="text-right">
          {this.getButtons()}
        </td>
      </tr>
    );
  }
});

module.exports = DeploymentComponent;
