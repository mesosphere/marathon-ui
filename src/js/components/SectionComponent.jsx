import React from "react/addons";

var SectionComponent = React.createClass({
  "displayName": "SectionComponent",

  propTypes: {
    active: React.PropTypes.bool,
    children: React.PropTypes.node,
    id: React.PropTypes.string.isRequired
  },

  getDefaultProps: function () {
    return {
      active: false
    };
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
