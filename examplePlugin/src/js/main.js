import ExamplePluginComponent from "./components/ExamplePluginComponent";

global.PluginDispatcher.dispatch({
  eventType: "STARTUP_COMPLETE",
  pluginId: "examplePlugin-0.0.1"
});

global.PluginDispatcher.dispatch({
  eventType: "INJECT_COMPONENT",
  placeId: "SIDEBAR_BOTTOM",
  component: ExamplePluginComponent
});
