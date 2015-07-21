var React = require("react");

var CollapsiblePanelComponent = React.createClass({
  displayName: "CollapsiblePanelComponent",

  propTypes: {
    children: React.PropTypes.node,
    initiallyOpen: React.PropTypes.bool,
    title: React.PropTypes.string.isRequired
  },

  getInitialState: function () {
    return {
      open: !!this.props.initiallyOpen
    };
  },

  handleToggle: function () {
    this.setState({open: !this.state.open});
  },

  getPanelBody: function () {
    if (this.state.open) {
      return (
        <div className="panel-body">
          {this.props.children}
        </div>
      );
    }
    return null;
  },

  getTitle: function () {
    var showHide = this.state.open
      ? "Hide"
      : "Show";
    return `${showHide} ${this.props.title}`;
  },

  render: function () {
    var classes = React.addons.classSet({
      "clickable panel-title": true,
      "open": this.state.open
    });

    return (
      <div className="panel panel-inverse collapsible-panel">
        <div className="panel-heading clickable"
          onClick={this.handleToggle}>
          <div className={classes}>
            {this.getTitle()}
          </div>
        </div>
        {this.getPanelBody()}
      </div>
    );
  }
});

module.exports = CollapsiblePanelComponent;
