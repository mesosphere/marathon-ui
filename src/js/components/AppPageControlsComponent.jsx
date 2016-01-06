var classNames = require("classnames");
var OnClickOutsideMixin = require("react-onclickoutside");
var React = require("react");

var AppActionsHandlerMixin = require("../mixins/AppActionsHandlerMixin");
var AppStatus = require("../constants/AppStatus");

var AppPageControlsComponent = React.createClass({

  displayName: "AppPageControlsComponent",

  mixins: [
    AppActionsHandlerMixin,
    OnClickOutsideMixin
  ],

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      isDropdownActivated: false
    };
  },

  getResetDelayButton: function () {
    var props = this.props;

    if (props.model.status !== AppStatus.DELAYED) {
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
      "disabled": props.model.instances < 1
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
            <span className="caret" />
          </button>
          <ul className={dropdownClassSet}>
            <li className={suspendAppClassSet}>
              <a href="#" onClick={this.handleSuspendApp}>
                Suspend
              </a>
            </li>
            <li>
              <a href="#" onClick={this.handleDestroyApp}>
                <span className="text-danger">Destroy</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = AppPageControlsComponent;
