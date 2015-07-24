require("babel/polyfill");
var React = require("react/addons");
var Router = require("react-router");
var Redirect = Router.Redirect;
var Route = Router.Route;
var NotFoundRoute = Router.NotFoundRoute;

var AppPageComponent = require("./components/AppPageComponent");
var PageNotFoundComponent = require("./components/PageNotFoundComponent");
var TabPanesComponent = require("./components/TabPanesComponent");
var Marathon = require("./components/Marathon");

var routes = (
  <Route name="home" path="/" handler={Marathon}>
    <Route name="apps" path="apps" handler={TabPanesComponent} />
    <Route name="app" path="apps/:appid" handler={AppPageComponent} />
    <Route name="appview" path="apps/:appid/:view" handler={AppPageComponent} />
    <Route name="deployments" path="deployments" handler={TabPanesComponent} />
    <Redirect from="/" to="apps" />
    <NotFoundRoute name="404" handler={PageNotFoundComponent} />
  </Route>
);

Router.run(routes, function (Handler, state) {
  React.render(
    <Handler state={state} />,
    document.getElementById("marathon")
  );
});
