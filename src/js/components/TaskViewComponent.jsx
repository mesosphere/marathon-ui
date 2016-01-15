import lazy from "lazy.js";
import React from "react/addons";

import AppsActions from "../actions/AppsActions";
import PagedNavComponent from "../components/PagedNavComponent";
import TasksActions from "../actions/TasksActions";
import TaskListComponent from "../components/TaskListComponent";

var TaskViewComponent = React.createClass({
  displayName: "TaskViewComponent",

  propTypes: {
    appId: React.PropTypes.string.isRequired,
    fetchState: React.PropTypes.number.isRequired,
    getTaskHealthMessage: React.PropTypes.func.isRequired,
    hasHealth: React.PropTypes.bool,
    tasks: React.PropTypes.array.isRequired
  },

  getInitialState: function () {
    return {
      currentPage: 0,
      itemsPerPage: 8,
      selectedTasks: {}
    };
  },

  componentWillReceiveProps: function (nextProps) {
    var state = this.state;
    var tasksLength = nextProps.tasks.length;

    if (state.currentPage * state.itemsPerPage > tasksLength) {
      this.setState({
        currentPage: parseInt(tasksLength / state.itemsPerPage, 10),
        selectedTasks: {}
      });
    }
  },

  handlePageChange: function (pageNum) {
    this.setState({currentPage: pageNum});
  },

  handleRefresh: function () {
    AppsActions.requestApp(this.props.appId);
  },

  handleKillSelectedTasks: function (scaleTask) {
    var props = this.props;
    var selectedTaskIds = Object.keys(this.state.selectedTasks);

    var taskIds = lazy(props.tasks).map(function (task) {
      return selectedTaskIds.indexOf(task.id) >= 0
        ? task.id
        : null;
    }).compact().value();

    if (!scaleTask) {
      TasksActions.deleteTasks(props.appId, taskIds);
    } else {
      TasksActions.deleteTasksAndScale(props.appId, taskIds);
    }
    this.setState({selectedTasks: {}});
  },

  toggleAllTasks: function () {
    var newSelectedTasks = {};
    var modelTasks = this.props.tasks;

    // Note: not an **exact** check for all tasks being selected but a good
    // enough proxy.
    var allTasksSelected = Object.keys(this.state.selectedTasks).length ===
      modelTasks.length;

    if (!allTasksSelected) {
      modelTasks.forEach(function (task) {
        newSelectedTasks[task.id] = true;
      });
    }

    this.setState({selectedTasks: newSelectedTasks});
  },

  onTaskToggle: function (task, value) {
    var selectedTasks = this.state.selectedTasks;

    // If `toggleTask` is used as a callback for an event handler, the second
    // parameter will be an event object. Use it to set the value only if it
    // is a Boolean.
    var localValue = (typeof value === Boolean) ?
      value :
      !selectedTasks[task.id];

    if (localValue === true) {
      selectedTasks[task.id] = true;
    } else {
      delete selectedTasks[task.id];
    }

    this.setState({selectedTasks: selectedTasks});
  },

  getButtons: function () {
    var selectedTasksLength = Object.keys(this.state.selectedTasks).length;
    if (selectedTasksLength === 0) {
      return (
        <button
            className="btn btn-sm btn-default"
            onClick={this.handleRefresh}>
          ↻ Refresh
        </button>
      );
    } else {
      return (
        <div className="btn-group">
          <button
              className="btn btn-sm btn-info"
              onClick={this.handleKillSelectedTasks.bind(this, false)}>
            Kill
          </button>
          <button
              className="btn btn-sm btn-info"
              onClick={this.handleKillSelectedTasks.bind(this, true)}>
            Kill &amp; Scale
          </button>
        </div>
      );
    }
  },

  getPagedNav: function () {
    var tasksLength = this.props.tasks.length;
    var itemsPerPage = this.state.itemsPerPage;

    // at least two pages
    if (tasksLength > itemsPerPage) {
      return (
        <PagedNavComponent
          className="text-right"
          currentPage={this.state.currentPage}
          onPageChange={this.handlePageChange}
          itemsPerPage={itemsPerPage}
          noItems={tasksLength}
          useArrows={true} />
      );
    }

    return null;
  },

  render: function () {
    return (
      <div>
        <div className="row">
          <div className="col-sm-6 base-bottom">
            {this.getButtons()}
          </div>
          <div className="col-sm-6">
            {this.getPagedNav()}
          </div>
        </div>
        <TaskListComponent
          currentPage={this.state.currentPage}
          fetchState={this.props.fetchState}
          getTaskHealthMessage={this.props.getTaskHealthMessage}
          hasHealth={this.props.hasHealth}
          onTaskToggle={this.onTaskToggle}
          itemsPerPage={this.state.itemsPerPage}
          selectedTasks={this.state.selectedTasks}
          tasks={this.props.tasks}
          toggleAllTasks={this.toggleAllTasks} />
      </div>
    );
  }
});

export default TaskViewComponent;
