var classNames = require("classnames");
var React = require("react");

var CollapsiblePanelComponent = React.createClass({
  displayName: "CollapsiblePanelComponent",

  propTypes: {
    children: React.PropTypes.node,
    isOpen: React.PropTypes.bool,
    title: React.PropTypes.string.isRequired
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
    }
  },

  handleToggle: function () {
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
    var classes = classNames({
      "clickable panel-title": true,
      "open": this.state.isOpen
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
