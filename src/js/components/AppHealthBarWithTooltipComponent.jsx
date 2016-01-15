import React from "react/addons";

import AppHealthBarComponent from "./AppHealthBarComponent";
import AppHealthDetailComponent from "./AppHealthDetailComponent";
import PopoverComponent from "./PopoverComponent";
import Util from "../helpers/Util";
import HealthStatus from "../constants/HealthStatus";

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
        <PopoverComponent visible={this.state.isPopoverVisible}
            className="app-health-detail-popover">
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

export default AppHealthBarWithTooltipComponent;
