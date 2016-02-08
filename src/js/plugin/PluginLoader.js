import config from "../config/config";

import URLUtil from "../helpers/URLUtil";
import PluginDispatcher from "./external/PluginDispatcher";
import PluginDispatcherProxy from "./PluginDispatcherProxy";

const PLUGIN_STARTUP_TIMEOUT = 10000; // in ms

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
        var pluginTimeout = null;

        // Inject plugin interface
        pluginWindow.marathonPluginInterface = Object.freeze({
          PluginDispatcher: PluginDispatcherProxy.create(pluginId),
          pluginId: pluginId,
          UIVersion: config.version
        });

        let dispatchToken = PluginDispatcher.register(function (event) {
          if (event.eventType === "STARTUP_COMPLETE"
              && event.pluginId === pluginId) {
            PluginDispatcher.unregister(dispatchToken);

            clearTimeout(pluginTimeout);
            resolve(pluginId);
          }
        });

        // Load Plugin
        const pluginScript = pluginDocument.createElement("script");

        function handlePluginScriptLoad() {
          pluginScript.removeEventListener("load", handlePluginScriptLoad);
          pluginScript.removeEventListener("error", handlePluginScriptError);

          pluginTimeout =
            setTimeout(handlePluginScriptError, PLUGIN_STARTUP_TIMEOUT);
        }

        function handlePluginScriptError(error) {
          pluginScript.removeEventListener("load", handlePluginScriptLoad);
          pluginScript.removeEventListener("error", handlePluginScriptError);

          reject(error);
        }

        pluginScript.addEventListener("load", handlePluginScriptLoad);
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
