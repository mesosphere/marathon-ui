import React from "react/addons";
import Util from "../helpers/Util";

var SectionComponent = React.createClass({
  "displayName": "SectionComponent",

  propTypes: {
    active: React.PropTypes.bool,
    children: React.PropTypes.node,
    id: React.PropTypes.string.isRequired,
    onActive: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      active: false,
      onActive: Util.noop
    };
  },

  getInitialState: function () {
    return {
      activeStateChanged: true
    };
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({
      activeStateChanged: nextProps.active !== this.props.active
    });
  },

  componentDidMount: function () {
    this.triggerCallbacks();
  },

  componentDidUpdate: function () {
    this.triggerCallbacks();
  },

  triggerCallbacks: function () {
    var {activeStateChanged} = this.state;
    var {active, onActive} = this.props;

    if (activeStateChanged && active) {
      onActive();
    }
  },

  render: function () {
    var {children, active} = this.props;

    if (!active) {
      return null;
    }

    return (
      <section>
        {children}
      </section>
    );
  }
});

export default SectionComponent;
