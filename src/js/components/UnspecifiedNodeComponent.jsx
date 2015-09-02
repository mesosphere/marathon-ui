var React = require("react/addons");

var UnspecifiedNodeComponent = React.createClass({
  displayName: "UnspecifiedNodeComponent",

  propTypes: {
    caption: React.PropTypes.string,
    className: React.PropTypes.string,
    tag: React.PropTypes.string
  },

  getDefaultProps: function () {
    return {
      caption: "Unspecified",
      className: "text-muted",
      tag: "dd"
    };
  },

  render: function () {
    var props = this.props;

    return React.createElement(
      props.tag,
      {className: props.className},
      props.caption
    );
  }
});

module.exports = UnspecifiedNodeComponent;
