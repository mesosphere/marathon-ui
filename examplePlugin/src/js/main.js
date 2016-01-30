import ExamplePluginComponent from "./components/ExamplePluginComponent";

var {PluginHelper, PluginMountPoints} = global.MarathonUIPluginAPI;

PluginHelper.registerMe("examplePlugin-0.0.1");

PluginHelper.injectComponent(ExamplePluginComponent,
  PluginMountPoints.SIDEBAR_BOTTOM);
