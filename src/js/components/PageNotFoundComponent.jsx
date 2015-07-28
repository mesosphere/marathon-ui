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
      <div className="container-fluid">
        <div className="page-header">
          <span className="h3 modal-title">Page Not Found</span>
          <ul className="list-inline list-inline-subtext">
            <li>
              <span className="text-warning">{message}</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = PageNotFoundComponent;
