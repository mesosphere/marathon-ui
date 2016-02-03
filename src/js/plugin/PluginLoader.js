import URLUtil from "../helpers/URLUtil";
import MarathonUIPluginAPI from "./external/MarathonUIPluginAPI";
import PluginDispatcher from "./external/PluginDispatcher";

const PluginLoader = {
  load: function (pluginId, pluginURI) {
    return new Promise(function (resolve, reject) {

      // Create plugin host (hidden iframe)
      const pluginHost = document.createElement("iframe");
      pluginHost.setAttribute("scrolling","no");
      pluginHost.setAttribute("width","1");
      pluginHost.setAttribute("height","1");
      pluginHost.setAttribute("frameborder","0");
      pluginHost.setAttribute("style",
        "position:absolute; top:-1px; left:-1px;");
      pluginHost.setAttribute("sandbox","allow-same-origin allow-scripts");
      pluginHost.setAttribute("src", URL.createObjectURL(new Blob([
        `<html><head></head><body>${pluginId}</body></html>`
      ], {type: "text/html"})));

      function handlePluginHostLoad() {
        pluginHost.removeEventListener("load", handlePluginHostLoad);
        pluginHost.removeEventListener("error", handlePluginHostError);

        const pluginWindow = pluginHost.contentWindow;
        const pluginDocument = pluginWindow.document;

        // Inject plugin interface
        // TODO: Wrapped plugin interface to always include the plugin id
        pluginWindow.MarathonUIPluginAPI = MarathonUIPluginAPI;

        let dispatchToken = PluginDispatcher.register(function (event) {
          if (event.eventType === "STARTUP_COMPLETE"
              && event.pluginId === pluginId) {
            PluginDispatcher.unregister(dispatchToken);

            resolve(pluginId);
          }
        });

        // Load Plugin
        const pluginScript = pluginDocument.createElement("script");

        function handlePluginScriptError(error) {
          pluginScript.removeEventListener("error", handlePluginHostError);

          reject(error);
        }

        pluginScript.addEventListener("error", handlePluginScriptError);
        pluginScript.setAttribute("src", URLUtil.getAbsoluteURL(pluginURI));

        pluginDocument.body.appendChild(pluginScript);
      }

      function handlePluginHostError(error) {
        pluginHost.removeEventListener("load", handlePluginHostLoad);
        pluginHost.removeEventListener("error", handlePluginHostError);

        reject(error);
      }

      pluginHost.addEventListener("load", handlePluginHostLoad);
      pluginHost.addEventListener("error", handlePluginHostError);

      document.body.appendChild(pluginHost);

    });
  }
};

export default PluginLoader;
