require("babel/polyfill");
var React = require("react/addons");
var Router = require("react-router");
var Redirect = Router.Redirect;
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;

var AppPageComponent = require("./components/AppPageComponent");
var TabPanesComponent = require("./components/TabPanesComponent");
var Marathon = require("./components/Marathon");

var routes = (
  <Route name="home" path="/" handler={Marathon}>
    <Route name="apps" path="apps" handler={TabPanesComponent} />
    <Route name="app" path="apps/:appId" handler={AppPageComponent} />
    <Route name="appView" path="apps/:appId/:view" handler={AppPageComponent} />
    <Route name="deployments" path="deployments" handler={TabPanesComponent} />
    <Redirect from="/" to="apps" />
    // TODO: #1756 - Add a not found page
    <NotFoundRoute handler={TabPanesComponent} />
  </Route>
);

Router.run(routes, function (Handler, state) {
  React.render(
    <Handler state={state} />,
    document.getElementById("marathon")
  );
});
