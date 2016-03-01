import React from "react/addons";

import Util from "../helpers/Util";
import SectionComponent from "../components/SectionComponent";

var ContentComponent = React.createClass({
  "displayName": "ContentComponent",

  propTypes: {
    active: React.PropTypes.string,
    children: Util.getComponentTypeValidator(SectionComponent)
  },

  renderChildren: function () {
    var {active, children} = this.props;

    return React.Children.map(children, (child) => {
      return React.addons.cloneWithProps(child, {
        active: child.props.id === active
      });
    });
  },

  render: function () {
    return (
      <div>
        {this.renderChildren()}
      </div>
    );
  }
});

export default ContentComponent;
