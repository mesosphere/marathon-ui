var classNames = require("classnames");
var OnClickOutsideMixin = require("react-onclickoutside");
var React = require("react");

var AppStatus = require("../constants/AppStatus");
var AppsActions = require("../actions/AppsActions");
var DialogActions = require("../actions/DialogActions");
var DialogStore = require("../stores/DialogStore");
var QueueActions = require("../actions/QueueActions");

var AppPageControlsComponent = React.createClass({

  displayName: "AppPageControlsComponent",

  mixins: [OnClickOutsideMixin],

  propTypes: {
    app: React.PropTypes.object.isRequired,
    appId: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {
      isDropdownActivated: false
    };
  },

  getResetDelayButton: function () {
    var props = this.props;

    if (props.app.status !== AppStatus.DELAYED) {
      return null;
    }

    return (
      <button className="btn btn-lg btn-default"
          onClick={this.handleResetDelay}>
        Reset Delay
      </button>
    );
  },

  handleClickOutside: function () {
    this.setState({
      isDropdownActivated: false
    });
  },

  handleResetDelay: function () {
    QueueActions.resetDelay(this.props.appId);
  },

  handleScaleApp: function () {
    var props = this.props;

    const dialogId =
      DialogActions.prompt("Scale to how many instances?",
          props.app.instances.toString()
      );

    DialogStore.handleUserResponse(dialogId, instancesString => {
      if (instancesString != null && instancesString !== "") {
        let instances = parseInt(instancesString, 10);

        AppsActions.scaleApp(props.appId, instances);
      }
    });
  },

  handleSuspendApp: function (event) {
    event.preventDefault();

    var props = this.props;

    if (props.app.instances < 1) {
      return;
    }

    const dialogId =
      DialogActions.confirm("Suspend app by scaling to 0 instances?");

    DialogStore.handleUserResponse(dialogId, () => {
      AppsActions.scaleApp(props.appId, 0);
    });
  },

  handleRestartApp: function () {
    var appId = this.props.appId;

    const dialogId =
      DialogActions.confirm(`Restart app '${appId}'?`);

    DialogStore.handleUserResponse(dialogId, () => {
      AppsActions.restartApp(appId);
    });
  },

  handleDestroyApp: function (event) {
    event.preventDefault();

    var appId = this.props.appId;

    const dialogId =
      DialogActions.confirm(`Destroy app '${appId}'? This is irreversible.`);

    DialogStore.handleUserResponse(dialogId, () => {
      AppsActions.deleteApp(appId);
    });
  },

  toggleDropdown: function () {
    this.setState({
      isDropdownActivated: !this.state.isDropdownActivated
    });
  },

  render: function () {
    var props = this.props;

    var dropdownClassSet = classNames({
      "hidden": !this.state.isDropdownActivated
    }, "dropdown-menu");

    var suspendAppClassSet = classNames({
      "disabled": props.app.instances < 1
    });

    return (
      <div className="header-btn">
        <button className="btn btn-lg btn-success"
            onClick={this.handleScaleApp}>
          Scale Application
        </button>
        <button className="btn btn-lg btn-default"
            onClick={this.handleRestartApp}>
          Restart
        </button>
        {this.getResetDelayButton()}
        <div className="dropdown app-controls">
          <button className="btn btn-lg btn-default"
              onClick={this.toggleDropdown}>
            <i className="icon icon-mini gear"></i>
            <span className="caret"/>
          </button>
          <ul className={dropdownClassSet}>
            <li className={suspendAppClassSet}>
              <a href="#"
                  onClick={this.handleSuspendApp}>
                Suspend
              </a>
            </li>
            <li>
              <a href="#" className="text-unhealthy"
                  onClick={this.handleDestroyApp}>
                <span className="text-unhealthy">Destroy</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = AppPageControlsComponent;
