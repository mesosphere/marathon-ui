import React from "react/addons";

import Util from "../helpers/Util";
import SectionComponent from "../components/SectionComponent";

var ContentComponent = React.createClass({
  "displayName": "ContentComponent",

  propTypes: {
    active: React.PropTypes.string,
    children: Util.getComponentTypeValidator(SectionComponent),
    className: React.PropTypes.string
  },

  renderChildren: function () {
    var {active, children} = this.props;

    return React.Children.map(children, (child) =>
      React.addons.cloneWithProps(child, {
        active: child.props.id === active
      })
    );
  },

  render: function () {
    return (
      <div className={this.props.className}>
        {this.renderChildren()}
      </div>
    );
  }
});

export default ContentComponent;