var React = require("react/addons");
var TimeFieldComponent = require("../components/TimeFieldComponent");

var TaskHealthComponent = React.createClass({
  displayName: "TaskHealthComponent",
  propTypes: {
    className: React.PropTypes.string,
    task: React.PropTypes.object.isRequired
  },
  render: function () {
    var task = this.props.task;
    var healthCheckResults = task.healthCheckResults;
    var healthNodeList;

    if (healthCheckResults != null) {
      healthNodeList = healthCheckResults.map(function (cResult, index) {
        if (cResult != null) {
          var timeNodes = [
            {
              label: "First success",
              time: cResult.firstSuccess
            }, {
              label: "Last success",
              time: cResult.lastSuccess
            }, {
              label: "Last failure",
              time: cResult.lastFailure
            }
          ];
          var timeFields = timeNodes.map(function (timeNode, i) {
            return (
              <TimeFieldComponent
                key={i}
                label={timeNode.label}
                time={timeNode.time} />
            );
          });
          return (
            <div key={index}>
              <hr key={"hr-" + index} />
              <h5>Health Check Result {index + 1}</h5>
              <dl className="dl-horizontal">
                {timeFields}
                <dt>Consecutive failures</dt>
                {cResult.consecutiveFailures == null ?
                  <dd className="text-muted">None</dd> :
                  <dd>{cResult.consecutiveFailures}</dd>}
                <dt>Alive</dt>
                {cResult.alive ?
                  <dd>Yes</dd> :
                  <dd>No</dd>}
              </dl>
            </div>
          );
        }
      });
    }

    return (
      <div className={this.props.className}>
        {healthNodeList}
      </div>
    );
  }
});

module.exports = TaskHealthComponent;
