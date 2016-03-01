import React from "react/addons";

import Util from "../helpers/Util";

import MenuItemComponent from "../components/MenuItemComponent";

var MenuComponent = React.createClass({
  "displayName": "MenuComponent",

  propTypes: {
    children: Util.getComponentTypeValidator(MenuItemComponent),
    name: React.PropTypes.string,
    onChange: React.PropTypes.func,
    selected: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      name: "menu-" + Util.getUniqueId(),
      onChange: Util.noop
    };
  },

  renderChildren: function () {
    var {children, name, selected} = this.props;

    return React.Children.map(children, function (child) {

      return React.addons.cloneWithProps(child, {
        name: name,
        selected: child.props.value === selected
      });
    }.bind(this));
  },

  onChange: function (event) {
    this.props.onChange(event.target.value);
  },

  render: function () {
    return (
      <ul onChange={this.onChange} role="menu">
        {this.renderChildren()}
      </ul>
    );
  }
});

export default MenuComponent;
