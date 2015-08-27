var classNames = require("classnames");
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

  render: function () {
    var classes = classNames({
      "clickable panel-title": true,
      "open": this.state.open
    });

    return (
      <div className="panel panel-inverse collapsible-panel">
        <div className="panel-heading clickable"
          onClick={this.handleToggle}>
          <div className={classes}>
            {this.props.title}
          </div>
        </div>
        {this.getPanelBody()}
      </div>
    );
  }
});

module.exports = CollapsiblePanelComponent;
