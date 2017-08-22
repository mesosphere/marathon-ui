import React from "react/addons";

import config from "../config/config";
import ajaxWrapper from "../helpers/ajaxWrapper";

import URLUtil from "../helpers/URLUtil";
import PluginDispatcher from "./shared/PluginDispatcher";
import PluginEvents from "./shared/PluginEvents";
import PluginMountPoints from "./shared/PluginMountPoints";
import PluginActions from "./shared/PluginActions";
import PluginHelper from "./shared/PluginHelper";
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

      function handlePluginHostLoad() {
        pluginHost.removeEventListener("load", handlePluginHostLoad);
        pluginHost.removeEventListener("error", handlePluginHostError);

        const pluginWindow = pluginHost.contentWindow;
        const pluginDocument = pluginWindow.document;
        var pluginTimeout = null;

        // Inject the plugin interface including the current React instance.
        // Plugins need to use interface as well as the provided React instance
        // to provide components. Using a different React instance will result
        // in "Invariant Violation" errors.
        pluginWindow.marathonPluginInterface = Object.freeze({
          PluginActions: PluginActions,
          PluginDispatcher: PluginDispatcherProxy.create(pluginId),
          PluginEvents: PluginEvents,
          PluginHelper: PluginHelper.create(pluginId),
          PluginMountPoints: PluginMountPoints,
          pluginId: pluginId,
          React: React,
          ajaxWrapper: ajaxWrapper,
          config: Object.freeze(config)
        });

        let dispatchToken = PluginDispatcher.register(function (event) {
          if (event.eventType === PluginEvents.STARTUP_COMPLETE
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
