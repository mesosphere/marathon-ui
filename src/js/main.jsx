var Backbone = require("backbone");
var React = require("react/addons");

var Marathon = require("./components/Marathon");
var Router = require("./models/Router");

React.render(
  <Marathon router={new Router()} />,
  document.getElementById("marathon")
);

Backbone.history.start();
