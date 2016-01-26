import React from "react/addons";
import classNames from "classnames";
import PopoverComponent from "../components/PopoverComponent";

var TooltipComponent = React.createClass({
  displayName: "TooltipComponent",

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

  handleMouseOver: function () {
    this.setState({
      isPopoverVisible: true
    });
  },

  handleMouseOut: function () {
    this.setState({
      isPopoverVisible: false
    });
  },

  render: function () {
    var props = this.props;

    return (
      <div onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}>
        <PopoverComponent
            className={classNames("tooltip", props.className)}
            visible={!props.disabled && this.state.isPopoverVisible}>
          {props.message}
        </PopoverComponent>
        {props.children}
      </div>
    );
  }

});

export default TooltipComponent;
