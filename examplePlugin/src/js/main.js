import ExamplePluginComponent from "./components/ExamplePluginComponent";

var PluginHelper = global.MarathonUIPluginAPI.PluginHelper;

PluginHelper.registerMe("examplePlugin-0.0.1");

PluginHelper.injectComponent(ExamplePluginComponent, "SIDEBAR_BOTTOM");
