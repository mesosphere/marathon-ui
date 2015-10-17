var React = require("react/addons");
var Link = require("react-router").Link;

var CollapsibleLinkComponent = React.createClass({
  displayName: "CollapsibleLinkComponent",

  propTypes: {
    collapse: React.PropTypes.bool
  },

  defaultProps: {
    activeClassName: "active"
  },

  render: function () {
    var props = Object.assign({}, this.props);
    var child = props.collapse
      ? <span title={props.children}>...</span>
      : props.children;

    return (
      <Link {...props}>
        {child}
      </Link>
    );
  }

});

module.exports = CollapsibleLinkComponent;
