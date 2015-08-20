var React = require("react/addons");

var AppTaskStatsComponent = require("../components/AppTaskStatsComponent");

const keyCaptionMap = {
  startedAfterLastScaling: "Started After Last Scaling",
  withLatestConfig: "With Latest Config",
  withOutdatedConfig: "With Outdated Config",
  totalSummary: "Total Summary"
};

var AppTaskStatsListComponent = React.createClass({
  displayName: "AppTaskStatsListComponent",

  propTypes: {
    taskStatsList: React.PropTypes.object.isRequired
  },

  getByCategory: function (key) {
    var taskStatsList = this.props.taskStatsList;
    if (taskStatsList == null) {
      return null;
    }

    let taskStats = taskStatsList[key];

    if (taskStats == null) {
      return null;
    }

    return (
      <AppTaskStatsComponent
        caption={keyCaptionMap[key]}
        taskStats={taskStats} />
    );
  },

  render: function () {
    var taskStatsList = this.props.taskStatsList;
    var noTaskStatistics = null;

    if (taskStatsList == null) {
      noTaskStatistics = (
        <div className="panel panel-body panel-inverse">
          <span className="text-muted">
            This app does not have task statistics
          </span>
        </div>
      );
    }

    return (
      <div className="panel-group">
          <div className="panel panel-header panel-inverse">
            <div className="panel-heading">
              Task Statistics
            </div>
          </div>
        {this.getByCategory("startedAfterLastScaling")}
        {this.getByCategory("withLatestConfig")}
        {this.getByCategory("withOutdatedConfig")}
        {this.getByCategory("totalSummary")}
        {noTaskStatistics}
      </div>
    );
  }
});

module.exports = AppTaskStatsListComponent;
