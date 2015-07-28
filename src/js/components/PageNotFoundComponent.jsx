var React = require("react/addons");

var PageNotFoundComponent = React.createClass({
  displayName: "PageNotFoundComponent",

  contextTypes: {
    router: React.PropTypes.func
  },

  render: function () {
    var path = this.context.router.getCurrentPath();
    var message = `The requested page does not exist: ${path}`;
    return (
      <div className="centered-content">
        <div>
          <h3 className="h3">Page Not Found</h3>
          <p className="text-warning">{message}</p>
        </div>
      </div>
    );
  }
});

module.exports = PageNotFoundComponent;
