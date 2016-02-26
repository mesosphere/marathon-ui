import classNames from "classnames";
import React from "react";

var CollapsiblePanelComponent = React.createClass({
  displayName: "CollapsiblePanelComponent",

  propTypes: {
    children: React.PropTypes.node,
    isOpen: React.PropTypes.bool,
    title: React.PropTypes.string.isRequired,
    togglePanel: React.PropTypes.func
  },

  getDefaultProps: function () {
    return {
      isOpen: false
    };
  },

  getInitialState: function () {
    return {
      isOpen: !!this.props.isOpen
    };
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.isOpen) {
      this.setState({
        isOpen: nextProps.isOpen
      });
      if (this.props.togglePanel != null) {
        this.props.togglePanel(false);
      }
    }
  },

  handleToggle: function () {
    if (this.props.togglePanel != null) {
      this.props.togglePanel(!this.state.isOpen);
    }
    this.setState({isOpen: !this.state.isOpen});
  },

  getPanelBody: function () {
    if (this.state.isOpen) {
      return (
        <div className="panel-body">
          {this.props.children}
        </div>
      );
    }
    return null;
  },

  render: function () {
    var classSet = classNames({
      "clickable panel-title": true,
      "open": this.state.isOpen
    });

    return (
      <div className="panel panel-inverse collapsible-panel">
        <div className="panel-heading clickable"
            onClick={this.handleToggle}>
          <div className={classSet}>
            {this.props.title}
          </div>
        </div>
        {this.getPanelBody()}
      </div>
    );
  }
});

export default CollapsiblePanelComponent;
