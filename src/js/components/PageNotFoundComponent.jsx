var React = require("react/addons");
var RouterStateMixin = require("react-router").State;

var PageNotFoundComponent = React.createClass({
  displayName: "PageNotFoundComponent",

  mixins: [RouterStateMixin],

  render: function () {
    let message = `The requested page does not exist: ${this.getPath()}`;
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
