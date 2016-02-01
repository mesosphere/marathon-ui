var React = require("react/addons");

const URLDelimiter = /(https?:\/\/[^\s]+)/gi;

var AutolinkComponent = React.createClass({
  displayName: "AutolinkComponent",

  propTypes: {
    options: React.PropTypes.object,
    text: React.PropTypes.string.isRequired
  },

  getDefaultProps: function () {
    return {
      options: {
        target: "_blank"
      }
    };
  },

  autolink: function () {
    return this.props.text
      .split(URLDelimiter)
      .map(word => {
        var match = word.match(URLDelimiter);
        if (match) {
          let url = match[0];

          return React.createElement("a",
            Object.assign({}, {
              key: `autolink-${url}`,
              href: url
            }, this.props.options),
            url
          );
        }
        return word;
      });
  },

  render: function () {
    return (
      <span>{this.autolink()}</span>
    );
  }
});

module.exports = AutolinkComponent;
