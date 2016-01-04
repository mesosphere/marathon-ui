var React = require("react/addons");
var classNames = require("classnames");
var PopoverComponent = require("../components/PopoverComponent");

var TooltipComponent = React.createClass({
  displayName: "TooltipComponent",

  propTypes: {
    children: React.PropTypes.node.isRequired,
    className: React.PropTypes.string,
    disabled: React.PropTypes.bool
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
          Sorry there was a problem retrieving file. Click to retry.
        </PopoverComponent>
        {props.children}
      </div>
    );
  }

});

module.exports = TooltipComponent;
