import ExamplePluginComponent from "./components/ExamplePluginComponent";

global.PluginDispatcher.dispatch({
  eventType: "INJECT_COMPONENT",
  placeId: "SIDEBAR_BOTTOM",
  component: ExamplePluginComponent
});
