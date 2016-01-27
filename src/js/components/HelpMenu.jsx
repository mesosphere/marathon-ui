import React from "react/addons";
import {Link} from "react-router";

import classNames from "classnames";

import PopoverComponent from "./PopoverComponent";

import OnClickOutsideMixin from "react-onclickoutside";

var HelpMenu = React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [OnClickOutsideMixin],

  getInitialState: function () {
    return {
      helpMenuVisible: false
    };
  },

  handleClickOutside: function () {
    this.setState({
      helpMenuVisible: false
    });
  },

  toggleHelpMenu: function () {
    this.setState({
      helpMenuVisible: !this.state.helpMenuVisible
    });
  },

  render: function () {
    var router = this.context.router;
    var helpMenuClassName = classNames("help-menu icon help", {
      "active": this.state.helpMenuVisible
    });

    return (
      <div className={helpMenuClassName}
          onClick={this.toggleHelpMenu}>
        <span className="caret"></span>
        <PopoverComponent visible={this.state.helpMenuVisible}
            className="help-menu-dropdown">
          <ul className="dropdown-menu">
            <li>
              <Link to={router.getCurrentPathname()}
                  query={{modal: "about"}}>
                About
              </Link>
            </li>
            <li>
              <a href="../help" target="_blank">
                API Reference
              </a>
            </li>
            <li>
              <a href="https://mesosphere.github.io/marathon/docs/"
                  target="_blank">
                Documentation
              </a>
            </li>
          </ul>
        </PopoverComponent>
      </div>
    );
  }
});

export default HelpMenu;
