var classNames = require("classnames");
var lazy = require("lazy.js");
var React = require("react/addons");

var States = require("../constants/States");
var TaskListItemComponent = require("../components/TaskListItemComponent");
var PagedContentComponent = require("../components/PagedContentComponent");

var TaskListComponent = React.createClass({
  displayName: "TaskListComponent",

  propTypes: {
    currentPage: React.PropTypes.number.isRequired,
    fetchState: React.PropTypes.number.isRequired,
    getTaskHealthMessage: React.PropTypes.func.isRequired,
    hasHealth: React.PropTypes.bool,
    itemsPerPage: React.PropTypes.number.isRequired,
    onTaskToggle: React.PropTypes.func.isRequired,
    selectedTasks: React.PropTypes.object.isRequired,
    tasks: React.PropTypes.array.isRequired,
    toggleAllTasks: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {
      sortKey: "updatedAt",
      sortDescending: false
    };
  },

  handleThToggleClick: function (event) {
    // If the click happens on the checkbox, let the checkbox's onchange event
    // handler handle it and skip handling the event here.
    if (event.target.nodeName !== "INPUT") {
      this.props.toggleAllTasks();
    }
  },

  sortBy: function (sortKey) {
    var state = this.state;

    this.setState({
      sortKey: sortKey,
      sortDescending: state.sortKey === sortKey && !state.sortDescending
    });
  },

  getTasks: function () {
    var props = this.props;
    var state = this.state;
    var sortKey = state.sortKey;
    var hasHealth = !!props.hasHealth;

    return lazy(this.props.tasks)
      .sortBy(function (app) {
        return app[sortKey];
      }, state.sortDescending)
      .map(function (task) {
        var isActive = props.selectedTasks[task.id] === true;

        return (
          <TaskListItemComponent
            appId={props.tasks[0].appId}
            hasHealth={hasHealth}
            isActive={isActive}
            key={task.id}
            onToggle={props.onTaskToggle}
            task={task}
            taskHealthMessage={props.getTaskHealthMessage(task.id)}/>
        );
      }).value();
  },

  getCaret: function (sortKey) {
    if (sortKey === this.state.sortKey) {
      return (
        <span className="caret"></span>
      );
    }
    return null;
  },

  allTasksSelected: function (tasksLength) {
    var selectedTasks = this.props.selectedTasks;
    return tasksLength > 0 && lazy(this.props.tasks).find(function (task) {
      return selectedTasks[task.id] == null;
    }) == null;
  },

  render: function () {
    var tasksLength = this.props.tasks.length;
    var hasHealth = !!this.props.hasHealth;
    var hasError = this.props.fetchState === States.STATE_ERROR;

    var headerClassSet = classNames({
      "clickable": true,
      "dropup": !this.state.sortDescending
    });

    var loadingClassSet = classNames({
      "hidden": this.props.fetchState !== States.STATE_LOADING
    });

    var noTasksClassSet = classNames({
      "hidden": tasksLength !== 0 || hasError
    });

    var errorClassSet = classNames({
      "fluid-container": true,
      "hidden": !hasError
    });

    var hasHealthClassSet = classNames({
      "text-center": true,
      "hidden": !hasHealth
    });

    return (
      <div>
        <div className={errorClassSet}>
          <p className="text-center text-danger">
            Error fetching tasks. Refresh the list to try again.
          </p>
        </div>
        <table className="table table-unstyled">
          <thead>
            <tr>
              <th
                className={headerClassSet}
                width="1"
                onClick={this.handleThToggleClick}>
                <input type="checkbox"
                  checked={this.allTasksSelected(tasksLength)}
                  disabled={tasksLength === 0}
                  onChange={this.props.toggleAllTasks} />
              </th>
              <th>
                <span onClick={this.sortBy.bind(null, "id")}
                      className={headerClassSet}>
                  ID {this.getCaret("id")}
                </span>
              </th>
              <th className="text-center">
                <span onClick={this.sortBy.bind(null, "status")}
                      className={headerClassSet}>
                  Status {this.getCaret("status")}
                </span>
              </th>
              <th className="text-right">
                <span
                  className={headerClassSet}
                  onClick={this.sortBy.bind(null, "version")}>
                  {this.getCaret("version")} Version
                </span>
              </th>
              <th className="text-right">
                <span onClick={this.sortBy.bind(null, "updatedAt")}
                      className={headerClassSet}>
                  {this.getCaret("updatedAt")} Updated
                </span>
              </th>
                <th className={hasHealthClassSet}>
                  <span onClick={this.sortBy.bind(null, "healthStatus")}
                        className={headerClassSet}>
                    {this.getCaret("healthStatus")} Health
                  </span>
                </th>
            </tr>
          </thead>
          <PagedContentComponent
              currentPage={this.props.currentPage}
              itemsPerPage={this.props.itemsPerPage}
              tag="tbody" >
            <tr className={noTasksClassSet}>
              <td className="text-center" colSpan="7">
                No tasks running.
              </td>
            </tr>
            <tr className={loadingClassSet}>
              <td className="text-center text-muted" colSpan="7">
                Loading tasks...
              </td>
            </tr>
            {this.getTasks()}
          </PagedContentComponent>
        </table>
      </div>
    );
  }
});

module.exports = TaskListComponent;
