import React from "react/addons";
import classNames from "classnames";
import TimerMixin from "react-timer-mixin";

import PopoverComponent from "../components/PopoverComponent";

var popOverDisplayTimer = null;

var TooltipComponent = React.createClass({
  displayName: "TooltipComponent",

  mixins: [TimerMixin],

  propTypes: {
    children: React.PropTypes.node.isRequired,
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    message: React.PropTypes.node.isRequired
  },

  getDefaultProps: function () {
    return {
      disabled: false
    };
  },

  getInitialState: function () {
    return {
      isPopoverVisible: false
    };
  },

  handleMouseEnter: function () {
    this.clearTimeout(popOverDisplayTimer);
    this.setState({
      isPopoverVisible: true
    });
  },

  handleMouseLeave: function () {
    popOverDisplayTimer = this.setTimeout(() => {
      this.setState({
        isPopoverVisible: false
      });
    }, 250);
  },

  render: function () {
    var props = this.props;
    var message = React.cloneElement(props.message, {
      onClick: e => e.stopPropagation()
    });

    return (
      <div className="tooltip-container"
          onMouseEnter={this.handleMouseEnter}
          onMouseLeave={this.handleMouseLeave}>
        <PopoverComponent
            className={classNames("tooltip", props.className)}
            onMouseEnter={this.handleMouseEnter}
            onMouseLeave={this.handleMouseLeave}
            visible={!props.disabled && this.state.isPopoverVisible}>
          {message}
        </PopoverComponent>
        {props.children}
      </div>
    );
  }

});

export default TooltipComponent;
