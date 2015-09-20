var classNames = require("classnames");
var React = require("react/addons");

var AppTaskStatsComponent = React.createClass({
  displayName: "AppTaskStatsComponent",

  propTypes: {
    caption: React.PropTypes.string.isRequired,
    taskStats: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      open: false
    };
  },

  handleDetailsClick: function () {
    this.setState({open: !this.state.open});
  },

  getStates: function () {
    var stats = this.props.taskStats.stats;

    if (stats == null || stats.counts == null) {
      return <span className="text-muted">No information available</span>;
    }

    let counts = stats.counts;

    return (
      <dl className={"dl-horizontal"}>
        <dt>Running</dt>
        <dd>{counts.running}</dd>
        <dt>Healthy</dt>
        <dd>{counts.healthy}</dd>
        <dt>Unhealthy</dt>
        <dd>{counts.unhealthy}</dd>
        <dt>Staged</dt>
        <dd>{counts.staged}</dd>
      </dl>
    );
  },

  getLifeTime: function () {
    var stats = this.props.taskStats.stats;

    if (stats == null || stats.lifeTime == null) {
      return <span className="text-muted">No information available</span>;
    }

    let lifeTime = stats.lifeTime;

    return (
      <dl className="dl-horizontal dl-unstyled">
        <dt>Average</dt>
        <dd>{lifeTime.averageSeconds} seconds</dd>
        <dt>Median</dt>
        <dd>{lifeTime.medianSeconds} seconds</dd>
      </dl>
    );
  },

  getTaskStatistics: function () {
    var hiddenClassSet = classNames({
      "panel-body": true,
      "hidden": !this.state.open
    });

    return (
      <div className={hiddenClassSet}>
        <h5>Tasks Status</h5>
        {this.getStates()}
        <h5>Tasks Lifetime</h5>
        {this.getLifeTime()}
      </div>
    );
  },

  getTotalTasks: function () {
    var stats = this.props.taskStats.stats;

    if (stats == null || stats.counts == null) {
      return null;
    }

    return Object.keys(stats.counts).reduce(function (memo, key) {
      if (key === "running" || key === "staged") {
        return memo + stats.counts[key];
      }
      return memo;
    }, 0);
  },

  render: function () {
    var caretClassSet = classNames({
      "clickable text-right col-xs-2": true,
      "dropup": this.state.open
    });

    return (
      <div className="panel panel-inverse">
        <div className="panel-heading clickable"
            onClick={this.handleDetailsClick}>
          <div className="row">
            <div className="col-xs-10">
              {this.props.caption} ({this.getTotalTasks()} tasks)
            </div>
            <div className={caretClassSet}>
              <span className="caret"></span>
            </div>
          </div>
        </div>
        {this.getTaskStatistics()}
      </div>
    );
  }
});

module.exports = AppTaskStatsComponent;
