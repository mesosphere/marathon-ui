var React = require("react/addons");

var AppHealthBarComponent = require("./AppHealthBarComponent");
var AppHealthDetailComponent = require("./AppHealthDetailComponent");
var PopoverComponent = require("./PopoverComponent");
var Util = require("../helpers/Util");
var HealthStatus = require("../constants/HealthStatus");

var AppHealthBarWithTooltipComponent = React.createClass({
  displayName: "AppHealthBarWithTooltipComponent",

  propTypes: {
    model: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return {
      isPopoverVisible: false
    };
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    return  this.state.isPopoverVisible !== nextState.isPopoverVisible ||
      !Util.compareArrays(this.props.model.health, nextProps.model.health);
  },

  handleMouseOverHealthBar: function () {
    this.setState({
      isPopoverVisible: true
    });
  },

  handleMouseOutHealthBar: function () {
    this.setState({
      isPopoverVisible: false
    });
  },

  render: function () {
    var model = this.props.model;

    return (
      <div onMouseOver={this.handleMouseOverHealthBar}
           onMouseOut={this.handleMouseOutHealthBar}>
        <PopoverComponent visible={this.state.isPopoverVisible}>
          <AppHealthDetailComponent
            className="list-unstyled"
            fields={[
              HealthStatus.HEALTHY,
              HealthStatus.UNHEALTHY,
              HealthStatus.UNKNOWN,
              HealthStatus.STAGED,
              HealthStatus.OVERCAPACITY,
              HealthStatus.UNSCHEDULED
            ]}
            model={model} />
        </PopoverComponent>
        <AppHealthBarComponent model={model}/>
      </div>
    );
  }
});

module.exports = AppHealthBarWithTooltipComponent;
