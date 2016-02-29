import React from "react/addons";

import Util from "../helpers/Util";

import MenuItemComponent from "../components/MenuItemComponent";

var MenuComponent = React.createClass({
  "displayName": "MenuComponent",

  propTypes: {
    children: Util.getComponentTypeValidator(MenuItemComponent)
  },

  render: function () {
    return (
      <ul>
        {this.props.children}
      </ul>
    );
  }
});

export default MenuComponent;
