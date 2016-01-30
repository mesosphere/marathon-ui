import ExamplePluginComponent from "./components/ExamplePluginComponent";

var MarathonUIPluginAPI = global.MarathonUIPluginAPI;
var PluginHelper = MarathonUIPluginAPI.PluginHelper;
var PluginMountPoints = MarathonUIPluginAPI.PluginMountPoints;

PluginHelper.registerMe("examplePlugin-0.0.1");

PluginHelper.injectComponent(ExamplePluginComponent,
  PluginMountPoints.SIDEBAR_BOTTOM);
