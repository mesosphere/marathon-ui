var React = require("react/addons");
var Link = require("react-router").Link;
var CenteredInlineDialogComponent = require("./CenteredInlineDialogComponent");

var PageNotFoundComponent = React.createClass({
  displayName: "PageNotFoundComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  render: function () {
    var path = this.context.router.getCurrentPath();
    var message = `The requested page does not exist: ${path}`;
    return (
      <CenteredInlineDialogComponent title="Page Not Found"
          message={message}>
        <Link className="btn btn-lg btn-default" to="apps">
          Return to Applications
        </Link>
      </CenteredInlineDialogComponent>
    );
  }
});

module.exports = PageNotFoundComponent;
