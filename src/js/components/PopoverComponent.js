import React from "react/addons";
import classNames from "classnames";

import Util from "../helpers/Util";

const DEFAULT_ALIGNED = "default";
const TOP_ALIGNED = "top";
const BOTTOM_ALIGNED = "bottom";

var PopoverComponent = React.createClass({
  displayName: "PopoverComponent",

  propTypes: {
    children: React.PropTypes.node,
    className: React.PropTypes.string,
    visible: React.PropTypes.bool
  },

  getInitialState: function () {
    return {
      alignment: DEFAULT_ALIGNED
    };
  },

  shouldComponentUpdate(nextProps, nextState) {
    return this.state.alignment !== nextState.alignment ||
      !Util.compareProperties(this.props,
        nextProps,  "children", "className", "visible");
  },

  componentDidUpdate: function () {
    if (this.props.visible === true) {
      this.recalculatePosition();
    }
  },

  recalculatePosition: function () {
    if (global.window == null) {
      return;
    }

    let componentNode = React.findDOMNode(this.refs.component);
    let contentNode = React.findDOMNode(this.refs.content);
    let componentPosition = componentNode.getBoundingClientRect();
    let contentHeight = contentNode.clientHeight;

    if (componentPosition.top <= contentHeight) {
      this.setState({alignment: BOTTOM_ALIGNED});
      return;
    }

    if (componentPosition.bottom + contentHeight >=
        document.documentElement.clientHeight) {
      this.setState({alignment: TOP_ALIGNED});
      return;
    }

    this.setState({alignment: DEFAULT_ALIGNED});
  },

  render: function () {
    var props = this.props;

    if (!props.visible) {
      return null;
    }

    let className = classNames("popover", props.className,
      this.state.alignment);

    return (
      <div className={className} ref="component">
        <div className="content" ref="content">
          {props.children}
        </div>
      </div>
    );
  }
});

export default PopoverComponent;
