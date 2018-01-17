import lazy from "lazy.js";
import React from "react/addons";

import AppsActions from "../actions/AppsActions";
import DialogActions from "../actions/DialogActions";
import DialogStore from "../stores/DialogStore";
import DialogSeverity from "../constants/DialogSeverity";
import ExternalLinks from "../constants/ExternalLinks";
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
    labels: React.PropTypes.object.isRequired,
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

  handleKillSelectedTasks: function (scaleTask, wipeTasks) {
    var props = this.props;
    var selectedTaskIds = Object.keys(this.state.selectedTasks);

    var taskIds = lazy(props.tasks).map(function (task) {
      return selectedTaskIds.indexOf(task.id) >= 0
        ? task.id
        : null;
    }).compact().value();

    if (scaleTask) {
      TasksActions.deleteTasksAndScale(props.appId, taskIds);
      this.setState({selectedTasks: {}});
      return;
    }

    if (wipeTasks) {
      const dialogId = DialogActions.confirm({
        actionButtonLabel: "Kill and Wipe",
        message: (
          <div>
            <p>This will kill all selected tasks and wipe the respective
              local volumes. <a href={ExternalLinks.LOCAL_VOLUMES}
                target="_blank"
                className="modal-body-link">
                Read more about persistent local volumes.
              </a>
            </p>
            <p>
              Are you sure you want to continue?
            </p>
          </div>
        ),
        severity: DialogSeverity.WARNING,
        title: "Kill and Wipe Local Volumes"
      });

      DialogStore.handleUserResponse(dialogId, () => {
        TasksActions.deleteTasks(props.appId, taskIds, true);
        this.setState({selectedTasks: {}});
      });

      return;
    }

    TasksActions.deleteTasks(props.appId, taskIds, false);
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
              onClick={this.handleKillSelectedTasks.bind(this, false, false)}>
            Kill
          </button>
          <button
              className="btn btn-sm btn-info"
              onClick={this.handleKillSelectedTasks.bind(this, true, false)}>
            Kill &amp; Scale
          </button>
          {this.getKillAndWipeButton()}
        </div>
      );
    }
  },

  getKillAndWipeButton: function () {
    var hasStatefulTasks = Object.keys(this.state.selectedTasks)
      .reduce((memo, taskId) => {
        var task = this.props.tasks.find(task => task.id === taskId);
        if (task != null &&
            task.localVolumes != null
            && task.localVolumes.length > 0) {
          memo = true;
        }

        return memo;
      }, false);

    if (!hasStatefulTasks) {
      return null;
    }

    return (
      <button
        className="btn btn-sm btn-info"
        onClick={this.handleKillSelectedTasks.bind(this, false, true)}>
        Kill &amp; Wipe
      </button>
    );
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
          <div className="col-sm-6 base-bottom">
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
          labels={this.props.labels}
          selectedTasks={this.state.selectedTasks}
          tasks={this.props.tasks}
          toggleAllTasks={this.toggleAllTasks} />
      </div>
    );
  }
});

export default TaskViewComponent;
