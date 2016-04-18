import classNames from "classnames";
import React from "react/addons";

import NavTabsComponent from "../components/NavTabsComponent";

export default React.createClass({
  displayName: "TogglableTabsComponent",

  propTypes: {
    activeTabId: React.PropTypes.string.isRequired,
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    onTabClick: React.PropTypes.func,
    tabs: React.PropTypes.array
  },

  getDefaultProps: function () {
    return {
      tabs: []
    };
  },

  render: function () {
    var childNodes = React.Children.map(this.props.children,
      function (child) {
        if (child == null) {
          return null;
        }

        return React.cloneElement(child, {
          isActive: (child.props.id === this.props.activeTabId)
        });
      }, this);

    var navTabsClassSet = classNames({
      "hidden": this.props.tabs.length === 0
    });

    return (
      <div className={this.props.className}>
        <NavTabsComponent
          className={navTabsClassSet}
          activeTabId={this.props.activeTabId}
          onTabClick={this.props.onTabClick}
          tabs={this.props.tabs} />
        {childNodes}
      </div>
    );
  }
});
