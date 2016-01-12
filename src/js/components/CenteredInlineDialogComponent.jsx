var classNames = require("classnames");
var React = require("react/addons");
var Link = require("react-router").Link;

var CenteredInlineDialogComponent = React.createClass({
  displayName: "CenteredInlineDialogComponent",

  propTypes: {
    additionalClasses: React.PropTypes.string,
    children: React.PropTypes.node,
    message: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired
  },

  render: function () {
    var props = this.props;

    var classSet = classNames("inline-dialog", props.additionalClasses);

    return (
      <div className="centered-content">
        <div className={classSet}>
          <h3 className="h3">{props.title}</h3>
          <p className="text-muted">{props.message}</p>
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = CenteredInlineDialogComponent;
