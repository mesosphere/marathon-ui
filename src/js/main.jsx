import "babel-polyfill";
import React from "react/addons";
import Router, {Redirect, Route, NotFoundRoute} from "react-router";
import AppPageComponent from "./components/AppPageComponent";
import PageNotFoundComponent from "./components/PageNotFoundComponent";
import TabPanesComponent from "./components/TabPanesComponent";
import Marathon from "./components/Marathon";

var routes = (
  <Route name="home" path="/" handler={Marathon}>
    <Route name="apps" path="apps" handler={TabPanesComponent} />
    <Route name="group" path="group/:groupId" handler={TabPanesComponent} />
    <Route name="app" path="apps/:appId" handler={AppPageComponent} />
    <Route name="appView" path="apps/:appId/:view" handler={AppPageComponent} />
    <Route name="taskView" path="apps/:appId/:view/:tab"
      handler={AppPageComponent} />
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
