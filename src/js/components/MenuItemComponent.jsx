import React from "react/addons";

var MenuItemComponent = React.createClass({
  "displayName": "MenuItemComponent",

  propTypes: {
    children: React.PropTypes.node
  },

  render: function () {
    return (
      <li>
        <label>
          <input type="radio"/>
          {this.props.children}
        </label>
      </li>
    );
  }
});

export default MenuItemComponent;
